import { factsForTables } from './facts.ts'
import { levelPool, type LevelDef } from './levels.ts'
import type { PracticeSetup } from './practiceSetup.ts'
import {
  buildPracticeQueue,
  createSession,
  fillQueue,
  type Session,
  type SrsCard,
} from './srs.ts'

export function startPracticeSession(
  setup: PracticeSetup,
  cards: Record<string, SrsCard>,
  now: number,
  rng: () => number,
): Session {
  const pool = factsForTables(setup.tables)
  const queue =
    setup.tables.length === 1
      ? buildPracticeQueue(pool, cards, now, pool.length, rng, 'all')
      : buildPracticeQueue(pool, cards, now, 10, rng, 'weighted')
  return createSession(queue, { maxRepeats: 2, gap: 2 })
}

export function startLevelSession(
  level: LevelDef,
  cards: Record<string, SrsCard>,
  now: number,
  rng: () => number,
): Session {
  const pool = levelPool(level)
  if (level.kind === 'timed') {
    return createSession(fillQueue([], pool, cards, now, 5, rng), { maxRepeats: 1, gap: 2 })
  }
  return createSession(buildPracticeQueue(pool, cards, now, level.count, rng, level.sample), {
    maxRepeats: 2,
    gap: 2,
  })
}

export function practiceQuestionCount(tables: readonly number[]): number {
  return tables.length === 1 ? 9 : 10
}
