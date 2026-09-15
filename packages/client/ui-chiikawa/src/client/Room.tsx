/** The Chiikawa room page: character rail, star, speech bubble, and counters. */
import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { CAST, firstLine, pickRandom, type ChiikawaLine } from './cast.ts'
import { loadRoom, saveRoom, type RoomPayload, type RoomStats } from './state.ts'

/** One floating reward chip. */
interface Gain {
  readonly id: number
  readonly text: string
}

/** Monotonic key source for {@link Gain}. */
let gainSeq = 0

/**
 * Render the room.
 * @returns the room page.
 */
export function ChiikawaRoom(): ReactNode {
  const [payload, setPayload] = useState<RoomPayload>()
  const [failure, setFailure] = useState<string>()
  const [counters, setCounters] = useState<RoomStats>()
  const [pick, setPick] = useState('chiikawa')
  const [said, setSaid] = useState<{ readonly who: string; readonly entry: ChiikawaLine }>()
  const [gains, setGains] = useState<readonly Gain[]>([])

  useEffect(() => {
    let live = true
    loadRoom().then((next) => {
      if (!live) return
      setPayload(next)
      setCounters(next.stats)
    }, (error: unknown) => {
      if (live) setFailure(String((error as Error).message ?? error))
    })
    return () => { live = false }
  }, [])

  const commit = useCallback((next: RoomStats): void => {
    setCounters(next)
    void saveRoom(next)
  }, [])

  if (failure !== undefined) {
    return (
      <div className="cw-root">
        <div className="cw-inner">
          <div className="cw-status">
            素材加载失败：{failure}
            <br />
            Host 半的 /chiikawa 路由没有应答。
          </div>
        </div>
      </div>
    )
  }

  if (payload === undefined || counters === undefined) {
    return (
      <div className="cw-root">
        <div className="cw-inner">
          <div className="cw-status">正在把小可爱们请进来…</div>
        </div>
      </div>
    )
  }

  const cast = CAST.filter(entry => payload.assets[entry.face] !== undefined)
  const first = cast[0]
  if (first === undefined) {
    return (
      <div className="cw-root">
        <div className="cw-inner">
          <div className="cw-status">
            这台机器上还没有角色素材。
            <br />
            把官方立绘放进 <code>packages/client/ui-chiikawa/assets/</code>
            （文件名见该目录的 README.md），然后重启 DSH。
          </div>
        </div>
      </div>
    )
  }

  const spec = cast.find(entry => entry.id === pick) ?? first
  const shown = said !== undefined && said.who === spec.id ? said.entry : firstLine(spec.lines)
  const level = 1 + Math.floor(counters.hunts / 3)

  const float = (text: string): void => {
    gainSeq += 1
    const id = gainSeq
    setGains(current => [...current, { id, text }].slice(-4))
  }

  const say = (who: string, entry: ChiikawaLine): void => setSaid({ who, entry })

  const onHunt = (): void => {
    const reward = 100 + Math.floor(Math.random() * 4) * 50
    commit({ ...counters, hunts: counters.hunts + 1, money: counters.money + reward })
    float(`+${reward} 円`)
    say(spec.id, pickRandom(spec.win))
  }

  const onWeed = (): void => {
    commit({ ...counters, weeds: counters.weeds + 1, money: counters.money + 20 })
    float('+20 円')
    say(spec.id, pickRandom(spec.weed))
  }

  const onPet = (): void => say(spec.id, pickRandom(spec.lines))

  const onSelect = (id: string): void => {
    const next = cast.find(entry => entry.id === id)
    if (next === undefined) return
    setPick(id)
    say(id, pickRandom(next.lines))
  }

  const onReset = (): void => {
    commit({ ...counters, hunts: 0, weeds: 0, money: 0 })
    setGains([])
    setSaid({ who: spec.id, entry: { jp: 'はじめから… がんばる…', cn: '从头开始…会努力的…' } })
  }

  return (
    <div className="cw-root">
      <div className="cw-inner">
        <div className="cw-head">
          <h1 className="cw-title">
            ちいかわ の へや
            <small>Chiikawa Room · 小房间</small>
          </h1>
          <div className="cw-spacer" />
        </div>

        <div className="cw-rail">
          {cast.map(entry => (
            <button
              key={entry.id}
              type="button"
              className="cw-card"
              data-on={entry.id === spec.id ? '1' : '0'}
              aria-pressed={entry.id === spec.id}
              onClick={() => onSelect(entry.id)}
            >
              <div className="cw-card-art">
                <div className="cw-bob">
                  <img src={payload.assets[entry.face]} alt={entry.name} draggable={false} />
                </div>
              </div>
              <div className="cw-card-name">{entry.name}</div>
              <div className="cw-card-tag">{entry.tag}</div>
            </button>
          ))}
        </div>

        <div className="cw-stage">
          <button className="cw-star" type="button" title="なでる" onClick={onPet}>
            <div className="cw-bob">
              <img
                className="cw-star-img"
                src={payload.assets[spec.body] ?? payload.assets[spec.face]}
                alt={spec.name}
                draggable={false}
              />
            </div>
          </button>
          <div className="cw-bubble" key={`${said?.who ?? spec.id}|${shown.jp}`}>
            <div className="cw-bubble-who">{spec.name}</div>
            <div className="cw-jp">{shown.jp}</div>
            <div className="cw-cn">{shown.cn}</div>
          </div>
        </div>

        <div className="cw-stats">
          <div className="cw-stat">
            <div className="cw-stat-k">討伐回数</div>
            <div className="cw-stat-v">{counters.hunts}</div>
          </div>
          <div className="cw-stat">
            <div className="cw-stat-k">所持金</div>
            <div className="cw-stat-v">{counters.money.toLocaleString()} 円</div>
            {gains.map(gain => <span className="cw-gain" key={gain.id}>{gain.text}</span>)}
          </div>
          <div className="cw-stat">
            <div className="cw-stat-k">草むしり</div>
            <div className="cw-stat-v">{counters.weeds}</div>
          </div>
          <div className="cw-stat">
            <div className="cw-stat-k">レベル</div>
            <div className="cw-stat-v">{level}</div>
          </div>
        </div>

        <div className="cw-actions">
          <button className="cw-btn" type="button" onClick={onHunt}>討伐する</button>
          <button className="cw-btn" type="button" onClick={onWeed}>草むしり</button>
          <button className="cw-btn" type="button" onClick={onPet}>なでる</button>
          <button className="cw-btn is-ghost" type="button" onClick={onReset}>リセット</button>
        </div>

        <div className="cw-note">
          数值由 Host 半写入 $DSH_HOME/chiikawa-room.json，刷新和重启后都还在。
          <br />
          图片来源：《ちいかわぽけっと》官方站 gl.chiikawa-pocket.com（© nagano / ちいかわ製作委員会），仅本地自用。
        </div>
      </div>
    </div>
  )
}
