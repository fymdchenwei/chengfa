export function shuffle<T>(items: readonly T[], rng: () => number): T[] {
  const next = items.slice()
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.min(i, Math.floor(rng() * (i + 1)))
    const current = next[i]
    next[i] = next[j] as T
    next[j] = current as T
  }
  return next
}

export function weightedSample<T>(
  items: readonly T[],
  weights: readonly number[],
  count: number,
  rng: () => number,
): T[] {
  const pool = items.map((item, index) => ({
    item,
    weight: Math.max(0, weights[index] ?? 0),
  }))
  const picked: T[] = []
  const target = Math.min(count, pool.length)
  while (picked.length < target) {
    const total = pool.reduce((sum, entry) => sum + entry.weight, 0)
    let index = 0
    if (total <= 0) {
      index = Math.min(pool.length - 1, Math.floor(rng() * pool.length))
    } else {
      let ticket = rng() * total
      for (let i = 0; i < pool.length; i += 1) {
        ticket -= pool[i]?.weight ?? 0
        index = i
        if (ticket <= 0) break
      }
    }
    const chosen = pool[index]
    if (!chosen) break
    picked.push(chosen.item)
    pool.splice(index, 1)
  }
  return picked
}

function uniquePositive(values: readonly number[], answer: number): number[] {
  const seen = new Set<number>()
  const result: number[] = []
  for (const value of values) {
    if (!Number.isInteger(value) || value <= 0 || value > 99 || value === answer || seen.has(value)) continue
    seen.add(value)
    result.push(value)
  }
  return result
}

export function createChoices(a: number, b: number, rng: () => number): number[] {
  const answer = a * b
  const preferred = uniquePositive(
    [
      a * (b - 1),
      a * (b + 1),
      (a - 1) * b,
      (a + 1) * b,
      answer + 1,
      answer - 1,
      answer + a,
      answer - a,
      a + b,
      answer + b,
      answer - b,
    ],
    answer,
  )

  let step = 1
  while (preferred.length < 3 && step <= 30) {
    preferred.push(...uniquePositive([answer + step, answer - step], answer).filter((value) => !preferred.includes(value)))
    step += 1
  }

  const distractors = shuffle(preferred, rng).slice(0, 3)
  return shuffle([answer, ...distractors], rng)
}
