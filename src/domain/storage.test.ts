import { describe, expect, it } from 'vitest'
import { createCard } from './srs.ts'
import { defaultAppData, loadAppData, saveAppData, STORAGE_KEY, type KeyValueStore } from './storage.ts'

function memoryStore(initial?: string): KeyValueStore & { raw: Map<string, string> } {
  const raw = new Map<string, string>()
  if (initial != null) raw.set(STORAGE_KEY, initial)
  return {
    raw,
    getItem: (key) => raw.get(key) ?? null,
    setItem: (key, value) => {
      raw.set(key, value)
    },
  }
}

describe('本地进度', () => {
  it('存进去再读出来还是原来的记录', () => {
    const store = memoryStore()
    const data = defaultAppData()
    data.soundOn = false
    data.tipDismissed = true
    data.cards['3x4'] = { ...createCard(3, 4), correct: 2, streak: 2, dueAt: 40 }
    data.levels.t1 = { stars: 2, bestCorrect: 8, attempts: 1 }
    saveAppData(store, data)
    expect(loadAppData(store)).toEqual(data)
  })

  it('坏数据、旧版本和不合格的题目会被丢掉', () => {
    expect(loadAppData(memoryStore('{'))) .toEqual(defaultAppData())
    expect(loadAppData(memoryStore(JSON.stringify({ version: 2 })))).toEqual(defaultAppData())
    const loaded = loadAppData(
      memoryStore(
        JSON.stringify({
          version: 1,
          soundOn: false,
          cards: {
            '3x4': { a: 3, b: 4, correct: 2, wrong: 1, streak: 0, intervalMs: 0, dueAt: 5 },
            '0x2': { a: 0, b: 2, correct: 1, wrong: 0, streak: 1, intervalMs: 0, dueAt: 0 },
            '9x9': { a: 8, b: 9, correct: 1, wrong: 0, streak: 1, intervalMs: 0, dueAt: 0 },
          },
          levels: {
            t1: { stars: 4, bestCorrect: 3, attempts: 2 },
            missing: { stars: 3, bestCorrect: 1, attempts: 1 },
          },
        }),
      ),
    )
    expect(loaded.soundOn).toBe(false)
    expect(loaded.speechOn).toBe(true)
    expect(loaded.speechVoice).toBe('')
    expect(loaded.speechRate).toBe(0.8)
    expect(loaded.speechPitch).toBe(1.05)
    expect(loaded.speechPreset).toBe('fox')
    const kept = loadAppData(memoryStore(JSON.stringify({ version: 1, speechVoice: 'Tingting' })))
    expect(kept.speechVoice).toBe('Tingting')
    expect(kept.speechPreset).toBe('custom')
    expect(Object.keys(loaded.cards)).toEqual(['3x4'])
    expect(loaded.levels.t1?.stars).toBe(0)
    expect(loaded.levels.missing).toBeUndefined()
  })

  it('写不进去时不抛错', () => {
    const broken: KeyValueStore = {
      getItem: () => null,
      setItem: () => {
        throw new Error('full')
      },
    }
    expect(() => saveAppData(broken, defaultAppData())).not.toThrow()
  })
})
