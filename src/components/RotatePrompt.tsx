import { useEffect, useState } from 'react'
import { needsRotatePrompt } from '../domain/platform.ts'
import { FoxImage } from './FoxImage.tsx'

const FLOATS = [
  { text: '×', className: 'left-[8%] top-[18%] text-4xl text-[#ff7a2e] rotate-delay-0' },
  { text: '3', className: 'right-[10%] top-[14%] text-3xl text-[#7a5cff] rotate-delay-1' },
  { text: '7', className: 'left-[12%] top-[62%] text-3xl text-[#e23b6a] rotate-delay-2' },
  { text: '9', className: 'right-[8%] top-[58%] text-4xl text-[#2aa874] rotate-delay-3' },
]

export function RotatePrompt() {
  const [open, setOpen] = useState(() => needsRotatePrompt(window.innerWidth, window.innerHeight))

  useEffect(() => {
    const update = () => setOpen(needsRotatePrompt(window.innerWidth, window.innerHeight))
    window.addEventListener('resize', update)
    window.addEventListener('orientationchange', update)
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('orientationchange', update)
    }
  }, [])

  if (!open) return null

  return (
    <div className="rotate-prompt" role="status">
      <div className="scene-sky" aria-hidden="true">
        <span className="cloud left-[4%] top-10 w-28" />
        <span className="cloud right-[2%] top-24 w-24" />
        <span className="cloud left-[18%] bottom-24 w-20 opacity-80" />
        <span className="confetti left-[16%] top-16 h-3 w-3 bg-[#ff8a3d]" />
        <span className="confetti right-[18%] top-12 h-2.5 w-2.5 bg-[#7aa7ff]" />
        <span className="confetti right-[12%] top-[46%] h-3 w-3 bg-[#ff9dcb]" />
        <span className="confetti left-[8%] top-[40%] h-2 w-2 bg-[#ffc857]" />
        <svg viewBox="0 0 24 24" className="sparkle absolute top-20 right-[28%] h-5 w-5 fill-[#ffe56a]">
          <path d="m12 2 1.6 6.4L20 10l-6.4 1.6L12 18l-1.6-6.4L4 10l6.4-1.6Z" />
        </svg>
        <svg viewBox="0 0 24 24" className="sparkle absolute bottom-28 left-[22%] h-4 w-4 fill-white">
          <path d="m12 2 1.6 6.4L20 10l-6.4 1.6L12 18l-1.6-6.4L4 10l6.4-1.6Z" />
        </svg>
        <svg viewBox="0 0 24 24" className="sparkle absolute top-[48%] right-[16%] h-3.5 w-3.5 fill-[#ffd0ea]">
          <path d="m12 2 1.6 6.4L20 10l-6.4 1.6L12 18l-1.6-6.4L4 10l6.4-1.6Z" />
        </svg>
      </div>
      <div className="relative z-10 flex min-h-dvh flex-col items-center px-5 pb-8 pt-8">
        <h1 className="display text-[2.6rem]">横过来</h1>
        <div className="relative mt-2 flex flex-1 items-center justify-center">
          {FLOATS.map((item) => (
            <span key={item.text} className={`drift-token ${item.className}`} aria-hidden="true">
              {item.text}
            </span>
          ))}
          <div className="relative">
            <FoxImage mood="happy" className="w-64" />
            <div className="phone-tilt" aria-hidden="true">
              <div className="phone">
                <div className="phone-screen">3×4</div>
              </div>
            </div>
          </div>
        </div>
        <p className="speech-bubble max-w-[18rem] px-4 py-3 text-center text-lg font-black leading-snug">
          把手机横过来，一起玩乘法吧！
        </p>
        <p className="mt-4 text-center text-sm font-extrabold text-[#3a4f78]">横着玩，口诀看得更清楚</p>
      </div>
    </div>
  )
}
