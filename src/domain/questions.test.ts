import { describe, expect, it } from 'vitest'
import { ALL_FACTS } from './facts.ts'
import { mulberry32 } from './rng.ts'
import { createChoices, shuffle, weightedSample } from './questions.ts'

describe('选项生成', () => {
  it('每道题都有 4 个不同的正整数选项，并且包含正确答案', () => {
    for (const fact of ALL_FACTS) {
      for (let seed = 1; seed <= 20; seed += 1) {
        const choices = createChoices(fact.a, fact.b, mulberry32(seed))
        expect(choices).toHaveLength(4)
        expect(new Set(choices).size).toBe(4)
        expect(choices).toContain(fact.a * fact.b)
        for (const choice of choices) {
          expect(Number.isInteger(choice)).toBe(true)
          expect(choice).toBeGreaterThan(0)
          expect(choice).toBeLessThanOrEqual(99)
        }
      }
    }
  })

  it('1×1 和 9×9 也不会出现 0 或重复答案', () => {
    for (const [a, b] of [
      [1, 1],
      [9, 9],
    ] as const) {
      const choices = createChoices(a, b, mulberry32(7))
      expect(choices).toContain(a * b)
      expect(choices.every((choice) => choice > 0)).toBe(true)
    }
  })
})

describe('抽样', () => {
  it('洗牌不改原数组，结果仍是同一组元素', () => {
    const input = [1, 2, 3, 4]
    const shuffled = shuffle(input, () => 0)
    expect(input).toEqual([1, 2, 3, 4])
    expect(shuffled).toHaveLength(4)
    expect(new Set(shuffled)).toEqual(new Set(input))
    expect(shuffled).not.toEqual(input)
  })

  it('权重大的项目会先被抽到，抽满时不重复', () => {
    expect(weightedSample(['a', 'b'], [1000, 0.001], 1, () => 0.5)).toEqual(['a'])
    const all = weightedSample(['a', 'b', 'c'], [1, 1, 1], 5, () => 0)
    expect(new Set(all)).toEqual(new Set(['a', 'b', 'c']))
    expect(all).toHaveLength(3)
  })
})
