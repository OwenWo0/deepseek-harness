/**
 * Chiikawa room, host half.
 *
 * The browser half needs two things the renderer alone cannot give it: the
 * packaged character art, and counters that outlive a page reload. Both are
 * served over one plugin-owned HTTP prefix, so the browser half needs neither a
 * resource protocol nor a Host RPC surface.
 */
import { mkdir, readFile, rename, stat, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { dshHomePath } from '@deepseek-ai/dsh-home-paths'
import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-host-webserver'

/**
 * Required service: the HTTP carrier this plugin registers its route on. A
 * hard dependency keeps the row waiting instead of dereferencing an undefined
 * service on a start-order race.
 */
export const inject = ['webServer'] as const

/** HTTP prefix this plugin owns. */
const PREFIX = '/chiikawa'

/** Path prefix the art is served under. */
const ASSET_PREFIX = `${PREFIX}/assets/`

/** Stable asset key to packaged file name. */
const ASSETS: Readonly<Record<string, string>> = {
  chiikawa_face: 'official-chiikawa-b.png',
  chiikawa_body: 'official-chiikawa.png',
  hachiware_face: 'official-hachiware-b.png',
  hachiware_body: 'official-hachiware.png',
  usagi_face: 'official-usagi.png',
  usagi_body: 'official-usagi-b.png',
  kurimanju: 'official-kurimanju.png',
  momonga: 'official-momonga.png',
  shisa: 'official-shisa.png',
  kv: 'official-kv.png',
}

/**
 * Packaged art root. The emitted `lib/index.js` sits one level below the
 * package root, so `../assets/` is the directory `files` ships.
 */
const ASSETS_DIR = fileURLToPath(new URL('../assets/', import.meta.url))

/**
 * The advertised map, limited to art actually present on disk.
 *
 * This repository ships no character art: the packaged PNGs are third-party
 * material and stay out of version control, so a fresh clone has an empty
 * `assets/` directory. Advertising a URL that cannot be served would render as
 * a broken image in every slot that uses it; advertising only what exists lets
 * the browser half explain the situation instead.
 * @returns served asset keys mapped to their absolute request paths.
 */
async function availableAssets(): Promise<Record<string, string>> {
  const probed = await Promise.all(Object.entries(ASSETS).map(async ([key, file]) => {
    try {
      await stat(join(ASSETS_DIR, file))
      return [key, `${ASSET_PREFIX}${file}`] as const
    } catch {
      return undefined
    }
  }))
  return Object.fromEntries(probed.filter(entry => entry !== undefined))
}

/** Counters the room keeps for the user. */
export interface RoomStats {
  hunts: number
  weeds: number
  money: number
}

const DEFAULTS: RoomStats = { hunts: 0, weeds: 0, money: 0 }

/** A room body is three scalars; anything larger is not ours. */
const MAX_BODY_BYTES = 64 * 1024

/**
 * Fold an untrusted value into a complete counter set. A file the user edited
 * by hand, or wrote with an older shape, still yields usable numbers.
 * @param raw - parsed JSON, or anything else.
 * @returns a complete, non-negative counter set.
 */
function coerceStats(raw: unknown): RoomStats {
  const value = (typeof raw === 'object' && raw !== null ? raw : {}) as Record<string, unknown>
  const count = (input: unknown, fallback: number): number =>
    typeof input === 'number' && Number.isFinite(input) && input >= 0 ? Math.floor(input) : fallback
  return {
    hunts: count(value.hunts, DEFAULTS.hunts),
    weeds: count(value.weeds, DEFAULTS.weeds),
    money: count(value.money, DEFAULTS.money),
  }
}

/** @returns the persisted counters, or the defaults when nothing is stored yet. */
async function readStats(): Promise<RoomStats> {
  try {
    return coerceStats(JSON.parse(await readFile(dshHomePath('chiikawa-room.json'), 'utf8')))
  } catch {
    return { ...DEFAULTS }
  }
}

/**
 * Replace the stored counters. The write is atomic so a crash mid-save cannot
 * truncate the file a later read depends on.
 * @param next - the counters to store.
 */
async function writeStats(next: RoomStats): Promise<void> {
  const file = dshHomePath('chiikawa-room.json')
  await mkdir(dirname(file), { recursive: true })
  const staging = `${file}.tmp`
  await writeFile(staging, `${JSON.stringify(next, null, 2)}\n`, 'utf8')
  await rename(staging, file)
}

/**
 * Send one JSON reply.
 * @param res - the response to own.
 * @param status - HTTP status.
 * @param body - JSON-serializable payload.
 */
function sendJson(res: ServerResponse, status: number, body: unknown): void {
  res.statusCode = status
  res.setHeader('content-type', 'application/json; charset=utf-8')
  res.setHeader('cache-control', 'no-store')
  res.end(JSON.stringify(body))
}

/**
 * Read and parse a bounded JSON request body.
 * @param req - the request to drain.
 * @returns the parsed body.
 * @throws when the body exceeds {@link MAX_BODY_BYTES} or is not JSON.
 */
async function readBody(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = []
  let total = 0
  for await (const chunk of req) {
    const buffer = chunk as Buffer
    total += buffer.length
    if (total > MAX_BODY_BYTES) throw new Error('request body too large')
    chunks.push(buffer)
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'))
}

/**
 * Serve the room: art under `<prefix>/assets/`, counters at `<prefix>/room`.
 * @param ctx - owning plugin context.
 */
export function apply(ctx: Context): void {
  const allowed = new Set(Object.values(ASSETS))

  ctx.effect(() => ctx.webServer.register({
    kind: 'prefix',
    path: PREFIX,
    handler: async (req, res) => {
      const route = new URL(req.url ?? '/', 'http://localhost').pathname

      if (route === `${PREFIX}/room`) {
        if (req.method === 'GET') {
          sendJson(res, 200, { ok: true, assets: await availableAssets(), stats: await readStats() })
          return
        }
        if (req.method === 'POST') {
          try {
            const saved = coerceStats(await readBody(req))
            await writeStats(saved)
            sendJson(res, 200, { ok: true, stats: saved })
          } catch (error) {
            sendJson(res, 400, { ok: false, error: String((error as Error).message ?? error) })
          }
          return
        }
        sendJson(res, 405, { ok: false, error: 'GET or POST only' })
        return
      }

      if (route.startsWith(ASSET_PREFIX)) {
        const name = decodeURIComponent(route.slice(ASSET_PREFIX.length))
        if (!allowed.has(name)) {
          res.statusCode = 404
          res.end()
          return
        }
        try {
          const bytes = await readFile(join(ASSETS_DIR, name))
          res.statusCode = 200
          res.setHeader('content-type', 'image/png')
          res.setHeader('cache-control', 'public, max-age=86400')
          res.end(bytes)
        } catch {
          res.statusCode = 404
          res.end()
        }
        return
      }

      res.statusCode = 404
      res.end()
    },
  }), 'ui-chiikawa: /chiikawa routes')
}
