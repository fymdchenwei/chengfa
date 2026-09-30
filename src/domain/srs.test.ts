import { describe, expect, it } from 'vitest'
import { factId } from './facts.ts'
import { isLevelUnlocked, levelById, LEVELS } from './levels.ts'
import { mulberry32 } from './rng.ts'
import {
  answerCurrent,
  answerTotals,
  applyAnswer,
  buildPracticeQueue,
  continueSession,
  createCard,
  createSession,
  factWeight,
  fillQueue,
  masteryOf,
  mergeLevelResult,
  pickWeightedFact,
  requeueFact,
  retryDelay,
  starsForAccuracy,
  starsForTimed,
  summarizeMastery,
  weakFacts,
  type SrsCard,
} from './srs.ts'
import { practiceQuestionCount, startLevelSession, startPracticeSession } from './startSession.ts'

const A = { a: 3, b: 4 }
const B = { a: 3, b: 5 }
const C = { a: 3, b: 6 }
const D = { a: 3, b: 7 }

describe('间隔重复', () => {
  it('答对会拉长复习间隔，答错会马上到期', () => {
    const card = createCard(3, 4)
    const first = applyAnswer(card, true, 1_000)
    expect(card.streak).toBe(0)
    expect(first.streak).toBe(1)
    expect(first.correct).toBe(1)
    expect(first.intervalMs).toBe(30_000)
    expect(first.dueAt).toBe(31_000)

    const second = applyAnswer(first, true, 2_000)
    expect(second.intervalMs).toBe(120_000)
    expect(second.dueAt).toBe(122_000)
    expect(masteryOf(second)).toBe(2)

    const missed = applyAnswer(second, false, 5_000)
    expect(missed.streak).toBe(0)
    expect(missed.wrong).toBe(1)
    expect(missed.correct).toBe(2)
    expect(missed.dueAt).toBe(5_000)
    expect(missed.intervalMs).toBe(0)
    expect(masteryOf(missed)).toBe(1)
  })

  it('连续答对四次算掌握，答错后降下来', () => {
    let card = createCard(2, 2)
    expect(masteryOf(card)).toBe(0)
    expect(masteryOf(undefined)).toBe(0)
    card = applyAnswer(card, true, 1)
    expect(masteryOf(card)).toBe(1)
    card = applyAnswer(card, true, 2)
    expect(masteryOf(card)).toBe(2)
    card = applyAnswer(card, true, 3)
    card = applyAnswer(card, true, 4)
    expect(masteryOf(card)).toBe(3)
    card = applyAnswer(card, false, 5)
    expect(masteryOf(card)).toBe(1)
  })

  it('更长的连续答对不会把间隔无限加大', () => {
    let card = createCard(9, 9)
    for (let i = 0; i < 8; i += 1) card = applyAnswer(card, true, i)
    expect(card.intervalMs).toBe(259_200_000)
  })

  it('没练过和经常错的题，比已经掌握的题更优先', () => {
    const mastered: SrsCard = {
      a: 2,
      b: 2,
      correct: 6,
      wrong: 0,
      streak: 6,
      intervalMs: 86_400_000,
      dueAt: 10_000,
    }
    const weak: SrsCard = {
      a: 6,
      b: 8,
      correct: 1,
      wrong: 4,
      streak: 0,
      intervalMs: 0,
      dueAt: 0,
    }
    expect(factWeight(undefined, 0)).toBeGreaterThan(factWeight(mastered, 0))
    expect(factWeight(weak, 100)).toBeGreaterThan(factWeight(mastered, 100))
  })

  it('多次抽样时，薄弱的题出现得更多', () => {
    const weak = applyAnswer(applyAnswer(createCard(6, 7), false, 0), false, 0)
    let mastered = createCard(2, 2)
    for (let i = 0; i < 6; i += 1) mastered = applyAnswer(mastered, true, 0)
    mastered = { ...mastered, dueAt: 1_000_000 }
    const cards = {
      [factId(6, 7)]: weak,
      [factId(2, 2)]: mastered,
    }
    const pool = [
      { a: 6, b: 7 },
      { a: 2, b: 2 },
    ]
    let weakHits = 0
    const rng = mulberry32(4)
    for (let i = 0; i < 240; i += 1) {
      const picked = pickWeightedFact(pool, cards, 10, rng)
      if (picked.a === 6 && picked.b === 7) weakHits += 1
    }
    expect(weakHits).toBeGreaterThan(200)
  })
})

describe('练习队列', () => {
  it('答错后隔开再插入，答对不放回', () => {
    const queue = requeueFact([B, C, D], A, 2)
    expect(queue).toEqual([B, C, A, D])

    const original = { a: 2, b: 3 }
    const copied = requeueFact([{ a: 1, b: 1 }], original, 0)
    original.a = 9
    expect(copied[0]).toEqual({ a: 2, b: 3 })

    let session = createSession([A, B, C, D])
    const untouched = session.queue.slice()
    session = answerCurrent(session, false)
    expect(untouched.map((fact) => factId(fact.a, fact.b))).toEqual(['3x4', '3x5', '3x6', '3x7'])
    expect(session.queue.map((fact) => factId(fact.a, fact.b))).toEqual(['3x5', '3x6', '3x4', '3x7'])
    expect(session.phase).toBe('feedback')
    expect(retryDelay(session)).toBe('soon')
    expect(answerCurrent(session, true)).toBe(session)

    session = continueSession(session)
    session = answerCurrent(session, true)
    expect(session.queue.map((fact) => factId(fact.a, fact.b))).toEqual(['3x6', '3x4', '3x7'])
    expect(session.correctCount).toBe(1)
    expect(session.missed).toEqual([A])
  })

  it('只剩一道错题时马上再练，超过次数后不再放回', () => {
    let session = createSession([A], { maxRepeats: 1, gap: 2 })
    session = answerCurrent(session, false)
    expect(session.queue).toEqual([A])
    expect(retryDelay(session)).toBe('now')
    session = continueSession(session)
    session = answerCurrent(session, false)
    expect(session.queue).toEqual([])
    expect(session.repeats[factId(A.a, A.b)]).toBe(1)
    expect(session.missed).toEqual([A])
    session = continueSession(session)
    expect(session.phase).toBe('done')
    expect(session.answered).toBe(2)
    expect(session.correctCount).toBe(0)
  })

  it('同一行会出满 9 道且不重复，混合练习抽 10 道', () => {
    const single = startPracticeSession({ tables: [4], answer: 'choice' }, {}, 0, mulberry32(3))
    expect(single.queue).toHaveLength(9)
    expect(new Set(single.queue.map((fact) => factId(fact.a, fact.b))).size).toBe(9)
    expect(single.queue.every((fact) => fact.a === 4)).toBe(true)

    const mixed = startPracticeSession({ tables: [1, 2, 3, 4, 5, 6, 7, 8, 9], answer: 'input' }, {}, 0, mulberry32(8))
    expect(mixed.queue).toHaveLength(practiceQuestionCount([1, 2, 3]))
    expect(new Set(mixed.queue.map((fact) => factId(fact.a, fact.b))).size).toBe(10)
  })

  it('关卡会覆盖整行，计时模式先准备好几题', () => {
    const table = levelById('t8')
    const timed = levelById('timed')
    expect(table).toBeDefined()
    expect(timed).toBeDefined()
    if (!table || !timed) return
    const row = startLevelSession(table, {}, 0, mulberry32(2))
    expect(row.queue).toHaveLength(9)
    expect(new Set(row.queue.map((fact) => fact.b))).toEqual(new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]))
    const race = startLevelSession(timed, {}, 0, mulberry32(5))
    expect(race.queue.length).toBeGreaterThanOrEqual(5)
    for (let i = 1; i < race.queue.length; i += 1) {
      expect(factId(race.queue[i].a, race.queue[i].b)).not.toBe(factId(race.queue[i - 1].a, race.queue[i - 1].b))
    }
  })

  it('计时补题不会连着出同一道', () => {
    const pool = [
      { a: 1, b: 1 },
      { a: 1, b: 2 },
      { a: 1, b: 3 },
    ]
    const queue = fillQueue([], pool, {}, 0, 6, mulberry32(1))
    expect(queue).toHaveLength(6)
    for (let i = 1; i < queue.length; i += 1) {
      expect(factId(queue[i].a, queue[i].b)).not.toBe(factId(queue[i - 1].a, queue[i - 1].b))
    }
    const avoided = pickWeightedFact(pool, {}, 0, () => 0, '1x1')
    expect(factId(avoided.a, avoided.b)).not.toBe('1x1')
  })

  it('空题库得到空队列', () => {
    expect(buildPracticeQueue([], {}, 0, 5, () => 0, 'weighted')).toEqual([])
    expect(buildPracticeQueue([{ a: 1, b: 1 }], {}, 0, 0, () => 0, 'weighted')).toEqual([])
  })
})

describe('星星和进度', () => {
  it('按正确率给星', () => {
    expect(starsForAccuracy(0, 10)).toBe(0)
    expect(starsForAccuracy(5, 10)).toBe(0)
    expect(starsForAccuracy(6, 10)).toBe(1)
    expect(starsForAccuracy(8, 10)).toBe(1)
    expect(starsForAccuracy(9, 10)).toBe(2)
    expect(starsForAccuracy(17, 20)).toBe(2)
    expect(starsForAccuracy(9, 9)).toBe(3)
    expect(starsForAccuracy(1, 0)).toBe(0)
  })

  it('计时挑战按答对题数给星', () => {
    expect(starsForTimed(0)).toBe(0)
    expect(starsForTimed(5)).toBe(0)
    expect(starsForTimed(6)).toBe(1)
    expect(starsForTimed(11)).toBe(1)
    expect(starsForTimed(12)).toBe(2)
    expect(starsForTimed(17)).toBe(2)
    expect(starsForTimed(18)).toBe(3)
  })

  it('星星只增不减', () => {
    const first = mergeLevelResult(undefined, 1, 6)
    expect(first).toEqual({ stars: 1, bestCorrect: 6, attempts: 1 })
    const second = mergeLevelResult(first, 0, 4)
    expect(second.stars).toBe(1)
    expect(second.bestCorrect).toBe(6)
    expect(second.attempts).toBe(2)
    expect(mergeLevelResult(second, 3, 12).stars).toBe(3)
  })

  it('要先拿到上一关的星星', () => {
    expect(isLevelUnlocked(0, [])).toBe(true)
    expect(isLevelUnlocked(1, [0])).toBe(false)
    expect(isLevelUnlocked(1, [1])).toBe(true)
    expect(isLevelUnlocked(2, [3, 0])).toBe(false)
    expect(isLevelUnlocked(2, [3, 1])).toBe(true)
    expect(LEVELS).toHaveLength(12)
  })

  it('统计掌握情况和还要练的题', () => {
    const cards = {
      [factId(1, 1)]: [1, 2, 3, 4].reduce((card) => applyAnswer(card, true, 1), createCard(1, 1)),
      [factId(2, 3)]: applyAnswer(createCard(2, 3), false, 1),
    }
    const summary = summarizeMastery(cards)
    expect(summary.total).toBe(81)
    expect(summary.mastered).toBe(1)
    expect(summary.learning).toBe(1)
    expect(summary.fresh).toBe(79)
    expect(answerTotals(cards)).toEqual({ correct: 4, wrong: 1 })
    expect(weakFacts(cards).map((card) => factId(card.a, card.b))).toEqual(['2x3'])
  })
})
