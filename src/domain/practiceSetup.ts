import type { AnswerMode } from './facts.ts'

export interface PracticeSetup {
  tables: number[]
  answer: AnswerMode
}

const KEY = 'chengfa-practice-setup'

export function savePracticeSetup(setup: PracticeSetup): void {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(setup))
  } catch {
    // 隐私模式写不进时，这一轮仍然可以从页面状态开始。
  }
}

export function readPracticeSetup(): PracticeSetup | null {
  try {
    const raw = sessionStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<PracticeSetup>
    if (parsed.answer !== 'choice' && parsed.answer !== 'input') return null
    if (!Array.isArray(parsed.tables) || parsed.tables.length === 0) return null
    const tables = parsed.tables.filter((n) => Number.isInteger(n) && n >= 1 && n <= 9)
    if (tables.length !== parsed.tables.length) return null
    return { tables, answer: parsed.answer }
  } catch {
    return null
  }
}
