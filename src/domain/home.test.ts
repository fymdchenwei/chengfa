import { describe, expect, it } from 'vitest'
import { highlightFactor, passedLevelCount, suggestTable, totalStars } from './home.ts'
import { createCard } from './srs.ts'

describe('suggestTable', () => {
  it('starts at 1 when nothing is mastered', () => {
    expect(suggestTable({})).toBe(1)
  })

  it('skips a table only after all nine facts are mastered', () => {
    const cards: Record<string, ReturnType<typeof createCard>> = {}
    for (let b = 1; b <= 9; b += 1) {
      const card = createCard(1, b)
      card.correct = 4
      card.streak = 4
      cards[`1x${b}`] = card
    }
    expect(suggestTable(cards)).toBe(2)
  })
})

describe('highlightFactor', () => {
  it('没练过时高亮第 4 行', () => {
    expect(highlightFactor(3, {})).toBe(4)
  })

  it('高亮这一行里最近练过的乘数', () => {
    const older = createCard(3, 4)
    older.correct = 1
    older.dueAt = 10
    const newer = createCard(3, 7)
    newer.correct = 1
    newer.dueAt = 50
    expect(highlightFactor(3, { '3x4': older, '3x7': newer })).toBe(7)
  })
})

describe('passedLevelCount', () => {
  it('counts levels that have at least one star', () => {
    expect(passedLevelCount({ t1: { stars: 1, bestCorrect: 9, attempts: 1 }, t2: { stars: 0, bestCorrect: 2, attempts: 1 } })).toBe(1)
    expect(totalStars({ t1: { stars: 3, bestCorrect: 9, attempts: 1 }, t2: { stars: 2, bestCorrect: 8, attempts: 1 } })).toBe(5)
  })
})
