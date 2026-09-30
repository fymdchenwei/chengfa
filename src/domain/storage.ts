import { LEVELS } from './levels.ts'
import { createCard, type LevelRecord, type Mastery, type SrsCard } from './srs.ts'

export const STORAGE_KEY = 'chengfa-progress-v1'

export interface AppData {
  version: 1
  cards: Record<string, SrsCard>
  levels: Record<string, LevelRecord>
  soundOn: boolean
  speechOn: boolean
  tipDismissed: boolean
}

export interface KeyValueStore {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
}

export function defaultAppData(): AppData {
  return {
    version: 1,
    cards: {},
    levels: {},
    soundOn: true,
    speechOn: true,
    tipDismissed: false,
  }
}

function isMastery(value: number): value is Mastery {
  return value === 0 || value === 1 || value === 2 || value === 3
}

function sanitizeCards(value: unknown): Record<string, SrsCard> {
  if (!value || typeof value !== 'object') return {}
  const cards: Record<string, SrsCard> = {}
  for (const [key, raw] of Object.entries(value)) {
    if (!raw || typeof raw !== 'object') continue
    const card = raw as Partial<SrsCard>
    if (
      !Number.isInteger(card.a) ||
      !Number.isInteger(card.b) ||
      card.a == null ||
      card.b == null ||
      card.a < 1 ||
      card.a > 9 ||
      card.b < 1 ||
      card.b > 9 ||
      key !== `${card.a}x${card.b}`
    ) {
      continue
    }
    const next = createCard(card.a, card.b)
    next.correct = finiteCount(card.correct)
    next.wrong = finiteCount(card.wrong)
    next.streak = finiteCount(card.streak)
    next.intervalMs = finiteCount(card.intervalMs)
    next.dueAt = Number.isFinite(card.dueAt) ? Number(card.dueAt) : 0
    cards[key] = next
  }
  return cards
}

function finiteCount(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? Math.floor(value) : 0
}

function sanitizeLevels(value: unknown): Record<string, LevelRecord> {
  if (!value || typeof value !== 'object') return {}
  const known = new Set(LEVELS.map((level) => level.id))
  const levels: Record<string, LevelRecord> = {}
  for (const [key, raw] of Object.entries(value)) {
    if (!known.has(key) || !raw || typeof raw !== 'object') continue
    const record = raw as Partial<LevelRecord>
    const stars = typeof record.stars === 'number' && isMastery(record.stars) ? record.stars : 0
    levels[key] = {
      stars,
      bestCorrect: finiteCount(record.bestCorrect),
      attempts: finiteCount(record.attempts),
    }
  }
  return levels
}

export function loadAppData(storage: KeyValueStore): AppData {
  const fallback = defaultAppData()
  try {
    const raw = storage.getItem(STORAGE_KEY)
    if (!raw) return fallback
    const parsed = JSON.parse(raw) as Partial<AppData>
    if (!parsed || parsed.version !== 1) return fallback
    return {
      version: 1,
      cards: sanitizeCards(parsed.cards),
      levels: sanitizeLevels(parsed.levels),
      soundOn: parsed.soundOn !== false,
      speechOn: parsed.speechOn !== false,
      tipDismissed: parsed.tipDismissed === true,
    }
  } catch {
    return fallback
  }
}

export function saveAppData(storage: KeyValueStore, data: AppData): void {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // 存储满了或被浏览器拦住时，练习仍然可以继续，只是这次不会记住。
  }
}
