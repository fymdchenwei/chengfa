import { useState } from 'react'
import { canSpeak, speakChinese } from '../domain/speech.ts'

export function SpeakerButton({ text, enabled, size = 'lg' }: { text: string; enabled: boolean; size?: 'md' | 'lg' }) {
  const [hint, setHint] = useState('')
  const box = size === 'md' ? 'h-12 w-12' : 'h-16 w-16'
  const icon = size === 'md' ? 'h-6 w-6' : 'h-8 w-8'

  return (
    <div className="flex shrink-0 flex-col items-center">
      <button
        type="button"
        className={`grid ${box} cursor-pointer place-items-center rounded-full bg-[#fff1cc] text-ink shadow-[0_4px_0_#e7d3a1] active:translate-y-0.5`}
        aria-label="读出来"
        onClick={() => {
          if (!enabled) {
            setHint('朗读关着，可以在「进步」里打开')
            return
          }
          if (!canSpeak()) {
            setHint('这台设备现在读不出来，我们看口诀吧')
            return
          }
          speakChinese(text)
          setHint('')
        }}
      >
        <svg viewBox="0 0 24 24" className={icon} aria-hidden="true">
          <path fill="currentColor" d="M4 9h4l5-4v14l-5-4H4z" />
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            d="M16 9a4 4 0 0 1 0 6M18.5 7a7 7 0 0 1 0 10"
          />
        </svg>
      </button>
      {hint ? <p className="mt-2 max-w-24 text-center text-sm font-bold text-muted">{hint}</p> : null}
    </div>
  )
}
