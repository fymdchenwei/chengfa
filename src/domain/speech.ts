export interface VoiceInfo {
  name: string
  lang: string
  localService?: boolean
}

export interface SpeechPrefs {
  voiceName: string
  rate: number
}

export const SPEECH_RATES = [
  { id: 'slow', label: '慢一点', rate: 0.72 },
  { id: 'steady', label: '正好', rate: 0.8 },
  { id: 'brisk', label: '快一点', rate: 0.95 },
] as const

export const DEFAULT_SPEECH_RATE = 0.8
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
  let best: (typeof SPEECH_RATES)[number] = SPEECH_RATES[1]
  let bestDistance = Infinity
  for (const preset of SPEECH_RATES) {
    const distance = Math.abs(preset.rate - value)
    if (distance < bestDistance) {
      best = preset
      bestDistance = distance
    }
  }
  return best.rate
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
  if (!canSpeak()) return
  window.speechSynthesis.cancel()
}

export function speakChinese(text: string): boolean {
  if (!canSpeak() || text.trim() === '') return false
  const synth = window.speechSynthesis
  synth.cancel()
  synth.resume()
  synth.speak(prepareUtterance(text, synth))
  return true
}

export function speakSequence(parts: readonly string[]): boolean {
  const lines = parts.filter((part) => part.trim() !== '')
  if (!canSpeak() || lines.length === 0) return false
  const synth = window.speechSynthesis
  synth.cancel()
  synth.resume()
  let index = 0
  const next = () => {
    if (index >= lines.length) return
    const utter = prepareUtterance(lines[index] ?? '', synth)
    index += 1
    utter.onend = () => next()
    synth.speak(utter)
  }
  next()
  return true
}

export function prepareSpeech(): void {
  if (!canSpeak()) return
  window.speechSynthesis.getVoices()
}
