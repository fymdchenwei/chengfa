import { factsForTables, type Fact } from './facts.ts'

export interface LevelDef {
  id: string
  title: string
  short: string
  blurb: string
  kind: 'set' | 'timed'
  tables: number[]
  count: number
  seconds: number
  sample: 'all' | 'weighted'
  answer: 'choice' | 'input'
}

function tableLevel(n: number): LevelDef {
  return {
    id: `t${n}`,
    title: `${n} 的乘法`,
    short: String(n),
    blurb: n === 1 ? '先从 1 开始' : `把 ${n} 的口诀练熟`,
    kind: 'set',
    tables: [n],
    count: 9,
    seconds: 0,
    sample: 'all',
    answer: 'choice',
  }
}

export const LEVELS: LevelDef[] = [
  ...([1, 2, 3, 4, 5, 6, 7, 8, 9] as const).map((n) => tableLevel(n)),
  {
    id: 'mix-small',
    title: '混合 1 到 5',
    short: '1-5',
    blurb: '前五行混在一起',
    kind: 'set',
    tables: [1, 2, 3, 4, 5],
    count: 12,
    seconds: 0,
    sample: 'weighted',
    answer: 'choice',
  },
  {
    id: 'mix-all',
    title: '全部混合',
    short: '全部',
    blurb: '自己把得数写出来',
    kind: 'set',
    tables: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    count: 15,
    seconds: 0,
    sample: 'weighted',
    answer: 'input',
  },
  {
    id: 'timed',
    title: '60 秒挑战',
    short: '计时',
    blurb: '答对 6、12、18 题得到星星',
    kind: 'timed',
    tables: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    count: 0,
    seconds: 60,
    sample: 'weighted',
    answer: 'choice',
  },
]

export function levelById(id: string): LevelDef | undefined {
  return LEVELS.find((level) => level.id === id)
}

export function levelPool(level: LevelDef): Fact[] {
  return factsForTables(level.tables)
}

export function isLevelUnlocked(index: number, stars: readonly number[]): boolean {
  if (index <= 0) return true
  return (stars[index - 1] ?? 0) >= 1
}
