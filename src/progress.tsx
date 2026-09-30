import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { factId } from './domain/facts.ts'
import { applyAnswer, createCard, mergeLevelResult, type Mastery, type SrsCard } from './domain/srs.ts'
import { normalizeSpeechRate, sanitizeSpeechVoice, setSpeechPrefs } from './domain/speech.ts'
import { loadAppData, saveAppData, type AppData, type KeyValueStore } from './domain/storage.ts'
import { ProgressContext } from './progress-context.ts'

function safeStorage(): KeyValueStore {
  try {
    const probe = '__chengfa_probe__'
    window.localStorage.setItem(probe, '1')
    window.localStorage.removeItem(probe)
    return window.localStorage
  } catch {
    const mem = new Map<string, string>()
    return {
      getItem: (key) => mem.get(key) ?? null,
      setItem: (key, value) => {
        mem.set(key, value)
      },
    }
  }
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [store] = useState(safeStorage)
  const [data, setData] = useState<AppData>(() => loadAppData(store))

  useEffect(() => {
    saveAppData(store, data)
    setSpeechPrefs({ voiceName: data.speechVoice, rate: data.speechRate })
  }, [store, data])

  const recordAnswer = useCallback((a: number, b: number, correct: boolean) => {
    setData((prev) => {
      const id = factId(a, b)
      const card: SrsCard = prev.cards[id] ?? createCard(a, b)
      return {
        ...prev,
        cards: { ...prev.cards, [id]: applyAnswer(card, correct, Date.now()) },
      }
    })
  }, [])

  const recordLevel = useCallback((levelId: string, stars: Mastery, correctCount: number) => {
    setData((prev) => ({
      ...prev,
      levels: {
        ...prev.levels,
        [levelId]: mergeLevelResult(prev.levels[levelId], stars, correctCount),
      },
    }))
  }, [])

  const setSound = useCallback((on: boolean) => {
    setData((prev) => ({ ...prev, soundOn: on }))
  }, [])

  const setSpeech = useCallback((on: boolean) => {
    setData((prev) => ({ ...prev, speechOn: on }))
  }, [])

  const setSpeechVoice = useCallback((name: string) => {
    setData((prev) => {
      const next = { ...prev, speechVoice: sanitizeSpeechVoice(name) }
      setSpeechPrefs({ voiceName: next.speechVoice, rate: next.speechRate })
      return next
    })
  }, [])

  const setSpeechRate = useCallback((rate: number) => {
    setData((prev) => {
      const next = { ...prev, speechRate: normalizeSpeechRate(rate) }
      setSpeechPrefs({ voiceName: next.speechVoice, rate: next.speechRate })
      return next
    })
  }, [])

  const dismissTip = useCallback(() => {
    setData((prev) => ({ ...prev, tipDismissed: true }))
  }, [])

  const resetProgress = useCallback(() => {
    setData((prev) => ({ ...prev, cards: {}, levels: {} }))
  }, [])

  return (
    <ProgressContext.Provider
      value={{ data, recordAnswer, recordLevel, setSound, setSpeech, setSpeechVoice, setSpeechRate, dismissTip, resetProgress }}
    >
      {children}
    </ProgressContext.Provider>
  )
}
