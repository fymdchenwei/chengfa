import { useState } from 'react'
import { canSpeak, speakChinese } from '../domain/speech.ts'

const TONES = {
  orange: 'bg-gradient-to-b from-[#ffd0a4] to-[#ff8a3d] text-white shadow-[0_3px_0_#d26522]',
  mint: 'bg-gradient-to-b from-[#c8f6df] to-[#3dcb8e] text-white shadow-[0_3px_0_#2aa874]',
  lilac: 'bg-gradient-to-b from-[#e4d9ff] to-[#8b6cff] text-white shadow-[0_3px_0_#6a4de0]',
  pink: 'bg-gradient-to-b from-[#ffd0e4] to-[#ff5d8f] text-white shadow-[0_3px_0_#e23b6a]',
  sun: 'bg-gradient-to-b from-[#ffe98a] to-[#ffc44a] text-[#5a3a12] shadow-[0_3px_0_#e29a1e]',
} as const

export type SpeakerTone = keyof typeof TONES

export function SpeakerButton({
  text,
  enabled,
  size = 'lg',
  tone = 'orange',
  onDenied,
  onPlay,
}: {
  text: string
  enabled: boolean
  size?: 'sm' | 'md' | 'lg'
  tone?: SpeakerTone
  onDenied?: (message: string) => void
  onPlay?: () => void
}) {
  const [hint, setHint] = useState('')
  const box = size === 'sm' ? 'h-9 w-9' : size === 'md' ? 'h-12 w-12' : 'h-16 w-16'
  const icon = size === 'sm' ? 'h-4 w-4' : size === 'md' ? 'h-6 w-6' : 'h-8 w-8'

  return (
    <div className="flex shrink-0 flex-col items-center">
      <button
        type="button"
        className={`grid ${box} cursor-pointer place-items-center rounded-full active:translate-y-0.5 ${TONES[tone]}`}
        aria-label="读出来"
        onClick={() => {
          if (!enabled) {
            const message = '朗读关着，可以在「进步」里打开'
            if (onDenied) onDenied(message)
            else setHint(message)
            return
          }
          if (!canSpeak()) {
            const message = '这台设备现在读不出来，我们看口诀吧'
            if (onDenied) onDenied(message)
            else setHint(message)
            return
          }
          speakChinese(text)
          onPlay?.()
          setHint('')
        }}
      >
        <svg viewBox="0 0 24 24" className={icon} aria-hidden="true">
          <path fill="currentColor" d="M4 9h4l5-4v14l-5-4H4z" />
          <path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M16 9a4 4 0 0 1 0 6M18.5 7a7 7 0 0 1 0 10" />
        </svg>
      </button>
      {hint ? <p className="mt-2 max-w-24 text-center text-sm font-bold text-muted">{hint}</p> : null}
    </div>
  )
}
