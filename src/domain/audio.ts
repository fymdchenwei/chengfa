let context: AudioContext | null = null

function getContext(): AudioContext | null {
  if (typeof window === 'undefined' || typeof window.AudioContext !== 'function') return null
  if (!context) context = new window.AudioContext()
  if (context.state === 'suspended') void context.resume()
  return context
}

function tone(frequency: number, start: number, duration: number, ctx: AudioContext): void {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.value = frequency
  gain.gain.setValueAtTime(0.0001, start)
  gain.gain.exponentialRampToValueAtTime(0.16, start + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(start)
  osc.stop(start + duration + 0.02)
}

export function playTone(kind: 'right' | 'again'): void {
  try {
    const ctx = getContext()
    if (!ctx) return
    const now = ctx.currentTime
    if (kind === 'right') {
      tone(523.25, now, 0.12, ctx)
      tone(659.25, now + 0.1, 0.12, ctx)
      tone(783.99, now + 0.2, 0.18, ctx)
    } else {
      tone(349.23, now, 0.12, ctx)
      tone(293.66, now + 0.12, 0.16, ctx)
    }
  } catch {
    // 没有音频设备时静默继续。
  }
}
