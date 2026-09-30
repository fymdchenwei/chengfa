export interface VoiceInfo {
  name: string
  lang: string
  localService?: boolean
}

export interface SpeechPrefs {
  voiceName: string
  rate: number
}

export const DEFAULT_SPEECH_RATE = 0.8
export const SPEECH_RATE_MIN = 0.5
export const SPEECH_RATE_MAX = 1.5
export const SPEECH_PITCH = 1

const prefs: SpeechPrefs = { voiceName: '', rate: DEFAULT_SPEECH_RATE }

export function getSpeechPrefs(): SpeechPrefs {
  return { ...prefs }
}

export function setSpeechPrefs(next: SpeechPrefs): void {
  prefs.voiceName = sanitizeSpeechVoice(next.voiceName)
  prefs.rate = normalizeSpeechRate(next.rate)
}

export function sanitizeSpeechVoice(value: unknown): string {
  if (typeof value !== 'string') return ''
  const name = value.trim()
  if (name.length === 0 || name.length > 120) return ''
  if ([...name].some((char) => char.charCodeAt(0) < 32)) return ''
  return name
}

export function normalizeSpeechRate(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return DEFAULT_SPEECH_RATE
  const clamped = Math.min(SPEECH_RATE_MAX, Math.max(SPEECH_RATE_MIN, value))
  return Math.round(clamped * 100) / 100
}

export function voiceBlurb(name: string): string {
  const label = name.toLowerCase()
  if (/tingting|meijia|ting-ting|female|女声/.test(label)) return '温柔的女声，适合跟读'
  if (/sinji|child|kid|童声|小朋友/.test(label)) return '语调更活泼'
  if (/male|男声|yunyang|kangkang/.test(label)) return '沉稳的男声'
  return '这台设备的中文语音'
}

export function rateLabel(rate: number): string {
  if (rate < 0.75) return '慢一点'
  if (rate <= 1) return '刚刚好'
  return '快一点'
}

export function formatSpeechRate(value: number): string {
  const rate = normalizeSpeechRate(value)
  const digits = Number.isInteger(rate) ? rate.toFixed(1) : String(rate)
  return `${digits}x`
}

type SpeechListener = (speaking: boolean) => void

let speechGeneration = 0
let speakingNow = false
const speechListeners = new Set<SpeechListener>()

function publishSpeaking(next: boolean): void {
  speakingNow = next
  for (const listener of speechListeners) listener(next)
}

export function isSpeaking(): boolean {
  return speakingNow
}

export function subscribeSpeaking(listener: SpeechListener): () => void {
  speechListeners.add(listener)
  listener(speakingNow)
  return () => {
    speechListeners.delete(listener)
  }
}

export function noteSpeechStart(): number {
  speechGeneration += 1
  publishSpeaking(true)
  return speechGeneration
}

export function noteSpeechEnd(token: number): void {
  if (token !== speechGeneration) return
  publishSpeaking(false)
}

export function noteSpeechStop(): void {
  speechGeneration += 1
  publishSpeaking(false)
}

export function isChineseVoice(voice: VoiceInfo): boolean {
  const lang = voice.lang.toLowerCase().replaceAll('_', '-')
  if (lang === 'zh' || lang.startsWith('zh-')) return true
  return /中文|普通话|國語|粤语|粵語|chinese/i.test(voice.name)
}

export function voiceScore(voice: VoiceInfo): number {
  const lang = voice.lang.toLowerCase().replaceAll('_', '-')
  let score = 0
  if (lang.startsWith('zh-cn') || lang === 'zh-hans' || lang.startsWith('zh-hans-')) score += 200
  else if (lang.startsWith('zh-tw')) score += 90
  else if (lang.startsWith('zh-hk')) score += 70
  else if (lang.startsWith('zh')) score += 50

  if (/ting-?ting/i.test(voice.name)) score += 130
  else if (/mei-?jia/i.test(voice.name)) score += 110
  else if (/sin-?ji/i.test(voice.name)) score += 80
  if (/google/i.test(voice.name) && /普通话|國語|中文|mandarin/i.test(voice.name)) score += 120
  if (/premium|enhanced|natural|neural/i.test(voice.name)) score += 45
  if (/compact/i.test(voice.name)) score -= 35
  if (voice.localService === true) score += 12
  if (voice.localService === false) score -= 12
  return score
}

export function rankChineseVoices<T extends VoiceInfo>(voices: readonly T[]): T[] {
  return voices
    .filter((voice) => voice.name.trim() !== '' && isChineseVoice(voice))
    .slice()
    .sort((left, right) => {
      const score = voiceScore(right) - voiceScore(left)
      if (score !== 0) return score
      return left.name.localeCompare(right.name, 'zh')
    })
}

export function pickChineseVoice<T extends VoiceInfo>(voices: readonly T[], preferredName = ''): T | undefined {
  const ranked = rankChineseVoices(voices)
  const wanted = preferredName.trim()
  if (wanted) {
    const chosen = ranked.find((voice) => voice.name === wanted)
    if (chosen) return chosen
  }
  return ranked[0]
}

export function canSpeak(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance === 'function'
}

function prepareUtterance(text: string, synth: SpeechSynthesis): SpeechSynthesisUtterance {
  const current = getSpeechPrefs()
  const utter = new SpeechSynthesisUtterance(text)
  utter.lang = 'zh-CN'
  utter.rate = current.rate
  utter.pitch = SPEECH_PITCH
  const voice = pickChineseVoice(synth.getVoices(), current.voiceName)
  if (voice) {
    utter.voice = voice as SpeechSynthesisVoice
    if (voice.lang) utter.lang = voice.lang
  }
  return utter
}

export function stopSpeech(): void {
  noteSpeechStop()
  if (!canSpeak()) return
  window.speechSynthesis.cancel()
}

export function speakChinese(text: string): boolean {
  if (!canSpeak() || text.trim() === '') return false
  const synth = window.speechSynthesis
  synth.cancel()
  synth.resume()
  const token = noteSpeechStart()
  const utter = prepareUtterance(text, synth)
  utter.onend = () => noteSpeechEnd(token)
  utter.onerror = () => noteSpeechEnd(token)
  synth.speak(utter)
  return true
}

export function speakSequence(parts: readonly string[], onStep?: (index: number) => void): boolean {
  const lines = parts.filter((part) => part.trim() !== '')
  if (!canSpeak() || lines.length === 0) return false
  const synth = window.speechSynthesis
  synth.cancel()
  synth.resume()
  const token = noteSpeechStart()
  let index = 0
  const next = () => {
    if (index >= lines.length) {
      noteSpeechEnd(token)
      return
    }
    onStep?.(index)
    const utter = prepareUtterance(lines[index] ?? '', synth)
    index += 1
    utter.onend = () => next()
    utter.onerror = () => noteSpeechEnd(token)
    synth.speak(utter)
  }
  next()
  return true
}

export function prepareSpeech(): void {
  if (!canSpeak()) return
  window.speechSynthesis.getVoices()
}
