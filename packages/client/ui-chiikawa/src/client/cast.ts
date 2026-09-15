/** The characters the room can star, and what each one says. */

/** One bilingual line. */
export interface ChiikawaLine {
  readonly jp: string
  readonly cn: string
}

/** One selectable character: its art keys and its line pools. */
export interface ChiikawaCharacter {
  readonly id: string
  readonly name: string
  readonly tag: string
  /** Asset key for the square card art. */
  readonly face: string
  /** Asset key for the tall star art, falling back to {@link face}. */
  readonly body: string
  readonly lines: readonly ChiikawaLine[]
  readonly win: readonly ChiikawaLine[]
  readonly weed: readonly ChiikawaLine[]
}

/** Every character the room offers, in rail order. */
export const CAST: readonly ChiikawaCharacter[] = [
  {
    id: 'chiikawa',
    name: 'ちいかわ',
    tag: '胆小又温柔',
    face: 'chiikawa_face',
    body: 'chiikawa_body',
    lines: [
      { jp: 'なんか… すごい…', cn: '总觉得…好厉害…' },
      { jp: 'うぅ… ヤダ…', cn: '呜…不要啦…' },
      { jp: 'ハァ… ハァ…', cn: '呼…呼…' },
      { jp: 'できた…！', cn: '做到了…！' },
      { jp: 'おなか… すいた…', cn: '肚子…饿了…' },
    ],
    win: [
      { jp: '討伐… できた…', cn: '讨伐…完成了…' },
      { jp: 'こわかった…', cn: '好可怕…' },
    ],
    weed: [
      { jp: '草むしり… がんばった…', cn: '拔草…努力了…' },
      { jp: 'ちいさな しあわせ…', cn: '小小的幸福…' },
    ],
  },
  {
    id: 'hachiware',
    name: 'ハチワレ',
    tag: '乐观的猫猫',
    face: 'hachiware_face',
    body: 'hachiware_body',
    lines: [
      { jp: 'なんとかなれー！', cn: '总会有办法的——！' },
      { jp: 'あのさ、あのさ', cn: '那个呀，那个呀' },
      { jp: 'たのしいね！', cn: '好开心呢！' },
      { jp: 'ちいかわ、だいじょうぶ？', cn: '吉伊，你还好吗？' },
      { jp: 'いっしょに いこう！', cn: '一起走吧！' },
    ],
    win: [
      { jp: 'やったね！', cn: '太好了！' },
      { jp: 'ぼくたち つよい！', cn: '我们很强！' },
    ],
    weed: [
      { jp: 'きれいに なったね！', cn: '变干净了呢！' },
      { jp: 'いい かんじ！', cn: '感觉不错！' },
    ],
  },
  {
    id: 'usagi',
    name: 'うさぎ',
    tag: '谜之元气',
    face: 'usagi_face',
    body: 'usagi_body',
    lines: [
      { jp: 'ウラ！', cn: '呜啦！' },
      { jp: 'ヤハ！', cn: '呀哈！' },
      { jp: 'フゥン！', cn: '哼嗯！' },
      { jp: 'ウラウラウラー！', cn: '呜啦呜啦呜啦——！' },
    ],
    win: [
      { jp: 'ウラー！', cn: '呜啦——！' },
      { jp: 'ヤハー！', cn: '呀哈——！' },
    ],
    weed: [
      { jp: 'ウラ ウラ！', cn: '呜啦 呜啦！' },
      { jp: 'ンァ ンァ！', cn: '嗯啊 嗯啊！' },
    ],
  },
  {
    id: 'kurimanju',
    name: '栗まんじゅう',
    tag: '爱吃又爱喝',
    face: 'kurimanju',
    body: 'kurimanju',
    lines: [
      { jp: 'うまい…', cn: '好吃…' },
      { jp: 'いい きぶん…', cn: '心情真好…' },
      { jp: 'もう いっぱい…', cn: '再来一杯…' },
      { jp: 'しあわせ…', cn: '好幸福…' },
    ],
    win: [{ jp: 'うまい もの たべたい…', cn: '想吃点好吃的…' }],
    weed: [{ jp: 'のんびり…', cn: '悠闲一点…' }],
  },
  {
    id: 'momonga',
    name: 'モモンガ',
    tag: '贱兮兮的',
    face: 'momonga',
    body: 'momonga',
    lines: [
      { jp: 'ンァ〜', cn: '嗯啊～' },
      { jp: 'ンァンァ', cn: '嗯啊嗯啊' },
      { jp: 'エッヘン', cn: '诶嘿' },
      { jp: 'ヤー', cn: '呀—' },
    ],
    win: [{ jp: 'ンァ〜！', cn: '嗯啊～！' }],
    weed: [{ jp: 'ンァ…', cn: '嗯啊…' }],
  },
  {
    id: 'shisa',
    name: 'シーサー',
    tag: '豪爽大哥',
    face: 'shisa',
    body: 'shisa',
    lines: [
      { jp: 'オッス！', cn: '哦斯！' },
      { jp: 'ウッス！', cn: '唔斯！' },
      { jp: 'まかせろ！', cn: '交给我吧！' },
      { jp: '〜ッス', cn: '～斯' },
    ],
    win: [{ jp: 'オッス！', cn: '哦斯！' }],
    weed: [{ jp: 'ウッス！', cn: '唔斯！' }],
  },
]

/** Shown when a character's pool is somehow empty. */
const NO_LINE: ChiikawaLine = { jp: '\u2026\u2026', cn: '\u2026\u2026' }

/**
 * Read a pool's first line without asserting it exists.
 * @param pool - the pool to read.
 * @returns the first line, or a placeholder when the pool is empty.
 */
export function firstLine(pool: readonly ChiikawaLine[]): ChiikawaLine {
  return pool[0] ?? NO_LINE
}

/**
 * Draw one entry from a pool.
 * @param pool - the pool to draw from.
 * @returns the drawn entry, or a placeholder when the pool is empty.
 */
export function pickRandom(pool: readonly ChiikawaLine[]): ChiikawaLine {
  return pool[Math.floor(Math.random() * pool.length)] ?? NO_LINE
}
