export function canSpeak(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance === 'function'
}

function chineseVoice(synth: SpeechSynthesis): SpeechSynthesisVoice | undefined {
  const voices = synth.getVoices()
  return (
    voices.find((voice) => /zh[-_]cn/i.test(voice.lang)) ??
    voices.find((voice) => voice.lang.toLowerCase().startsWith('zh'))
  )
}

function prepareUtterance(text: string, synth: SpeechSynthesis): SpeechSynthesisUtterance {
  const utter = new SpeechSynthesisUtterance(text)
  utter.lang = 'zh-CN'
  utter.rate = 0.86
  utter.pitch = 1.05
  const voice = chineseVoice(synth)
  if (voice) utter.voice = voice
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
