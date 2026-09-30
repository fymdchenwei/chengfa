import { ALL_FACTS, factId, type Fact } from './facts.ts'
import { shuffle, weightedSample } from './questions.ts'

export interface SrsCard {
  a: number
  b: number
  correct: number
  wrong: number
  streak: number
  intervalMs: number
  dueAt: number
}

export type Mastery = 0 | 1 | 2 | 3

const INTERVALS_MS = [0, 30_000, 120_000, 600_000, 86_400_000, 259_200_000] as const

export const MASTERY_LABELS = ['还没练', '正在学', '越来越熟', '掌握了'] as const

export const MASTERY_COLORS = ['#FFFFFF', '#FFE0B5', '#C8F5DE', '#FFE38A'] as const

export function createCard(a: number, b: number): SrsCard {
  return {
    a,
    b,
    correct: 0,
    wrong: 0,
    streak: 0,
    intervalMs: 0,
    dueAt: 0,
  }
}

export function masteryOf(card: SrsCard | undefined): Mastery {
  if (!card || (card.correct === 0 && card.wrong === 0)) return 0
  if (card.streak >= 4 && card.correct >= 4) return 3
  if (card.streak >= 2 && card.correct >= 2) return 2
  return 1
}

export function masteryLabel(level: Mastery): string {
  return MASTERY_LABELS[level]
}

export function applyAnswer(card: SrsCard, correct: boolean, now: number): SrsCard {
  if (!correct) {
    return {
      ...card,
      streak: 0,
      wrong: card.wrong + 1,
      intervalMs: 0,
      dueAt: now,
    }
  }
  const streak = card.streak + 1
  const intervalMs = INTERVALS_MS[Math.min(streak, INTERVALS_MS.length - 1)] ?? INTERVALS_MS[1]
  return {
    ...card,
    streak,
    correct: card.correct + 1,
    intervalMs,
    dueAt: now + intervalMs,
  }
}

export function factWeight(card: SrsCard | undefined, now: number): number {
  if (!card || (card.correct === 0 && card.wrong === 0)) return 4
  const mastery = masteryOf(card)
  const base = [5, 3.5, 1.6, 0.45][mastery]
  const wrongBoost = 1 + card.wrong * 0.35
  const overdue = card.dueAt <= now ? 1.8 : 0.4
  return Math.max(0.05, base * wrongBoost * overdue)
}

export type SampleMode = 'all' | 'weighted'

export function buildPracticeQueue(
  pool: readonly Fact[],
  cards: Record<string, SrsCard>,
  now: number,
  count: number,
  rng: () => number,
  mode: SampleMode,
): Fact[] {
  if (pool.length === 0 || (mode === 'weighted' && count <= 0)) return []
  if (mode === 'all') return shuffle(pool, rng)
  return weightedSample(
    pool,
    pool.map((fact) => factWeight(cards[factId(fact.a, fact.b)], now)),
    count,
    rng,
  )
}

export function pickWeightedFact(
  pool: readonly Fact[],
  cards: Record<string, SrsCard>,
  now: number,
  rng: () => number,
  avoidId?: string,
): Fact {
  if (pool.length === 0) {
    throw new Error('没有可以出的题目')
  }
  const usable = avoidId ? pool.filter((fact) => factId(fact.a, fact.b) !== avoidId) : pool.slice()
  const source = usable.length > 0 ? usable : pool.slice()
  const [picked] = weightedSample(
    source,
    source.map((fact) => factWeight(cards[factId(fact.a, fact.b)], now)),
    1,
    rng,
  )
  if (!picked) throw new Error('没有可以出的题目')
  return { a: picked.a, b: picked.b }
}

export function fillQueue(
  queue: readonly Fact[],
  pool: readonly Fact[],
  cards: Record<string, SrsCard>,
  now: number,
  minLength: number,
  rng: () => number,
): Fact[] {
  const next = queue.map((fact) => ({ a: fact.a, b: fact.b }))
  if (pool.length === 0) return next
  let guard = 0
  while (next.length < minLength && guard < minLength + pool.length + 2) {
    guard += 1
    const last = next[next.length - 1]
    const avoid = last ? factId(last.a, last.b) : undefined
    next.push(pickWeightedFact(pool, cards, now, rng, avoid))
  }
  return next
}

export function requeueFact(queue: readonly Fact[], fact: Fact, gap: number): Fact[] {
  const next = queue.map((item) => ({ a: item.a, b: item.b }))
  const index = Math.max(0, Math.min(gap, next.length))
  next.splice(index, 0, { a: fact.a, b: fact.b })
  return next
}

export interface Session {
  queue: Fact[]
  phase: 'asking' | 'feedback' | 'done'
  reviewing: Fact | null
  reviewingCorrect: boolean
  answered: number
  correctCount: number
  repeats: Record<string, number>
  missed: Fact[]
  maxRepeats: number
  gap: number
}

export function createSession(
  queue: readonly Fact[],
  options?: { maxRepeats?: number; gap?: number },
): Session {
  return {
    queue: queue.map((fact) => ({ a: fact.a, b: fact.b })),
    phase: 'asking',
    reviewing: null,
    reviewingCorrect: false,
    answered: 0,
    correctCount: 0,
    repeats: {},
    missed: [],
    maxRepeats: options?.maxRepeats ?? 2,
    gap: options?.gap ?? 2,
  }
}

export function answerCurrent(session: Session, correct: boolean): Session {
  if (session.phase !== 'asking') return session
  const current = session.queue[0]
  if (!current) return session

  const id = factId(current.a, current.b)
  let queue = session.queue.slice(1)
  const repeats = { ...session.repeats }
  if (!correct) {
    const used = repeats[id] ?? 0
    if (used < session.maxRepeats) {
      queue = requeueFact(queue, current, session.gap)
      repeats[id] = used + 1
    }
  }

  const alreadyMissed = session.missed.some((fact) => factId(fact.a, fact.b) === id)
  const missed = !correct && !alreadyMissed ? [...session.missed, { a: current.a, b: current.b }] : session.missed

  return {
    ...session,
    queue,
    phase: 'feedback',
    reviewing: { a: current.a, b: current.b },
    reviewingCorrect: correct,
    answered: session.answered + 1,
    correctCount: session.correctCount + (correct ? 1 : 0),
    repeats,
    missed,
  }
}

export function continueSession(session: Session): Session {
  if (session.phase === 'done') return session
  if (session.queue.length === 0) {
    return { ...session, phase: 'done' }
  }
  return { ...session, phase: 'asking' }
}

export function retryDelay(session: Session): 'now' | 'soon' | 'no' {
  if (!session.reviewing || session.reviewingCorrect) return 'no'
  const id = factId(session.reviewing.a, session.reviewing.b)
  const index = session.queue.findIndex((fact) => factId(fact.a, fact.b) === id)
  if (index < 0) return 'no'
  if (index === 0) return 'now'
  return 'soon'
}

export function starsForAccuracy(correct: number, total: number): Mastery {
  if (total <= 0 || correct <= 0) return 0
  const ratio = correct / total
  if (ratio >= 1) return 3
  if (ratio >= 0.85) return 2
  if (ratio >= 0.6) return 1
  return 0
}

export function starsForTimed(correct: number): Mastery {
  if (correct >= 18) return 3
  if (correct >= 12) return 2
  if (correct >= 6) return 1
  return 0
}

export function starsForResult(kind: 'set' | 'timed', correct: number, total: number): Mastery {
  if (kind === 'timed') return starsForTimed(correct)
  return starsForAccuracy(correct, total)
}

export interface LevelRecord {
  stars: Mastery
  bestCorrect: number
  attempts: number
}

export function mergeLevelResult(
  prev: LevelRecord | undefined,
  stars: Mastery,
  correctCount: number,
): LevelRecord {
  const merged = Math.max(prev?.stars ?? 0, stars)
  const safeStars: Mastery = merged >= 3 ? 3 : merged >= 2 ? 2 : merged >= 1 ? 1 : 0
  return {
    stars: safeStars,
    bestCorrect: Math.max(prev?.bestCorrect ?? 0, Math.max(0, correctCount)),
    attempts: (prev?.attempts ?? 0) + 1,
  }
}

export interface MasterySummary {
  mastered: number
  learning: number
  fresh: number
  total: number
}

export function summarizeMastery(cards: Record<string, SrsCard>): MasterySummary {
  let mastered = 0
  let learning = 0
  let fresh = 0
  for (const fact of ALL_FACTS) {
    const level = masteryOf(cards[factId(fact.a, fact.b)])
    if (level === 0) fresh += 1
    else if (level === 3) mastered += 1
    else learning += 1
  }
  return { mastered, learning, fresh, total: ALL_FACTS.length }
}

export function answerTotals(cards: Record<string, SrsCard>): { correct: number; wrong: number } {
  let correct = 0
  let wrong = 0
  for (const card of Object.values(cards)) {
    correct += card.correct
    wrong += card.wrong
  }
  return { correct, wrong }
}

export function weakFacts(cards: Record<string, SrsCard>, limit = 5): SrsCard[] {
  return Object.values(cards)
    .filter((card) => {
      const level = masteryOf(card)
      return level > 0 && level < 3
    })
    .sort((a, b) => b.wrong - a.wrong || a.streak - b.streak || a.dueAt - b.dueAt)
    .slice(0, limit)
}
