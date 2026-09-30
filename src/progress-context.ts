import { createContext } from 'react'
import type { Mastery } from './domain/srs.ts'
import type { AppData } from './domain/storage.ts'

export interface ProgressApi {
  data: AppData
  recordAnswer: (a: number, b: number, correct: boolean) => void
  recordLevel: (levelId: string, stars: Mastery, correctCount: number) => void
  setSound: (on: boolean) => void
  setSpeech: (on: boolean) => void
  setSpeechVoice: (name: string) => void
  setSpeechRate: (rate: number) => void
  dismissTip: () => void
  resetProgress: () => void
}

export const ProgressContext = createContext<ProgressApi | null>(null)
