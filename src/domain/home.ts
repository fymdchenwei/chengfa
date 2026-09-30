import { factId } from './facts.ts'
import { LEVELS } from './levels.ts'
import { masteryOf, type LevelRecord, type SrsCard } from './srs.ts'

/** 还没掌握完的最小口诀行；全部掌握时回到 1。 */
export function suggestTable(cards: Record<string, SrsCard | undefined>): number {
  for (let n = 1; n <= 9; n += 1) {
    let mastered = 0
    for (let b = 1; b <= 9; b += 1) {
      if (masteryOf(cards[factId(n, b)]) === 3) mastered += 1
    }
    if (mastered < 9) return n
  }
  return 1
}

export function passedLevelCount(levels: Record<string, LevelRecord | undefined>): number {
  return LEVELS.filter((level) => (levels[level.id]?.stars ?? 0) >= 1).length
}

export function totalStars(levels: Record<string, LevelRecord | undefined>): number {
  return LEVELS.reduce((sum, level) => sum + (levels[level.id]?.stars ?? 0), 0)
}
