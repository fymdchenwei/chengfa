export type AnswerMode = 'choice' | 'input'

export interface Fact {
  a: number
  b: number
}

export function factId(a: number, b: number): string {
  return `${a}x${b}`
}

export function equationText(a: number, b: number): string {
  return `${a} × ${b} = ${a * b}`
}

export const ALL_TABLES = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const

export function factsForTables(tables: readonly number[]): Fact[] {
  const facts: Fact[] = []
  for (const a of tables) {
    for (let b = 1; b <= 9; b += 1) {
      facts.push({ a, b })
    }
  }
  return facts
}

export const ALL_FACTS = factsForTables(ALL_TABLES)

export const TABLE_COLORS = [
  '#FFD0D6',
  '#FFD7BA',
  '#FFE6A8',
  '#BFF6DE',
  '#B8F0EA',
  '#C9E2FF',
  '#D9D4FF',
  '#E6D4FF',
  '#FFD0EA',
] as const

export function tableColor(table: number): string {
  return TABLE_COLORS[table - 1] ?? TABLE_COLORS[0]
}
