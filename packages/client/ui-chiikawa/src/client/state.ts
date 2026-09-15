/** Browser-side access to the host half's single HTTP prefix. */

/** HTTP prefix the host half owns. */
export const PREFIX = '/chiikawa'

/** Counters the room persists across reloads and restarts. */
export interface RoomStats {
  hunts: number
  weeds: number
  money: number
}

/** One `GET /chiikawa/room` reply. */
export interface RoomPayload {
  readonly ok: boolean
  readonly assets: Readonly<Record<string, string>>
  readonly stats: RoomStats
  readonly error?: string
}

/**
 * Read the packaged art map and the stored counters.
 * @returns the host half's current room payload.
 * @throws when the host half does not answer.
 */
export async function loadRoom(): Promise<RoomPayload> {
  const response = await fetch(`${PREFIX}/room`, { headers: { accept: 'application/json' } })
  if (!response.ok) throw new Error(`GET ${PREFIX}/room answered ${response.status}`)
  return await response.json() as RoomPayload
}

/**
 * Persist the counters. A failed save is reported to the caller's console and
 * otherwise ignored: the page stays usable when the Host half is unavailable.
 * @param stats - the counters to store.
 */
export async function saveRoom(stats: RoomStats): Promise<void> {
  try {
    await fetch(`${PREFIX}/room`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(stats),
    })
  } catch (error) {
    console.warn('[ui-chiikawa] could not persist the room counters', error)
  }
}
