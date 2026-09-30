import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { equationText, tableColor } from '../domain/facts.ts'
import { rhyme, spokenRhyme } from '../domain/rhyme.ts'
import { speakSequence, stopSpeech } from '../domain/speech.ts'
import { usePageTitle } from '../hooks/usePageTitle.ts'
import { useProgress } from '../hooks/useProgress.ts'
import { buttonClass } from '../components/buttonClass.ts'
import { Fox } from '../components/Fox.tsx'
import { SoundWaves } from '../components/SoundWaves.tsx'
import { useSpeaking } from '../hooks/useSpeaking.ts'
import { SpeakerButton } from '../components/SpeakerButton.tsx'
import { Button } from '../components/ui.tsx'

export function LearnRowPage() {
  const params = useParams()
  const navigate = useNavigate()
  const n = Number(params.n)
  const valid = Number.isInteger(n) && n >= 1 && n <= 9
  usePageTitle(valid ? `${n} 的口诀` : '学习')
  const { data } = useProgress()
  const speaking = useSpeaking()
  const [hint, setHint] = useState('')

  useEffect(() => () => stopSpeech(), [])

  if (!valid) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-4xl font-black">没有这一行</h1>
        <p className="text-lg font-bold text-muted">口诀是从 1 到 9。</p>
        <Link to="/learn" className={buttonClass()}>
          返回口诀
        </Link>
      </div>
    )
  }

  const lines = Array.from({ length: 9 }, (_, index) => spokenRhyme(n, index + 1))

  return (
    <div className="flex flex-col gap-4">
      <Link to="/learn" className="inline-flex min-h-12 items-center text-lg font-extrabold">
        ‹ 返回
      </Link>
      <header className="flex items-center gap-2">
        <Fox mood="sing" className="h-24 w-24" />
        <div className="min-w-0">
          <h1 className="text-4xl font-black">{n} 的口诀</h1>
          <p className="text-base font-bold text-muted">算式和口诀在一起</p>
        </div>
      </header>
      <div className="grid grid-cols-9 gap-1" role="group" aria-label="选择哪一句口诀">
        {Array.from({ length: 9 }, (_, index) => {
          const value = index + 1
          const active = value === n
          return (
            <button
              key={value}
              type="button"
              aria-pressed={active}
              className={`digit cursor-pointer ${active ? 'digit-active' : ''}`}
              onClick={() => {
                if (value !== n) navigate(`/learn/${value}`)
              }}
            >
              {value}
            </button>
          )
        })}
      </div>
      <button
        type="button"
        className={buttonClass('yellow', 'lg', 'w-full')}
        onClick={() => {
          if (!data.speechOn) {
            setHint('朗读关着，可以在「我的」里打开')
            return
          }
          const ok = speakSequence(lines)
          setHint(ok ? '' : '这台设备现在读不出来，我们看口诀吧')
        }}
      >
        <SoundWaves active={speaking} />
        跟着读
      </button>
      {hint ? <p className="text-base font-bold">{hint}</p> : null}
      <ul className="grid gap-2">
        {Array.from({ length: 9 }, (_, index) => {
          const b = index + 1
          return (
            <li
              key={b}
              className="flex items-center gap-2 rounded-[1.25rem] bg-white/95 px-3 py-2 shadow-[0_4px_0_#f0e2d0]"
              style={{ boxShadow: `0 4px 0 ${tableColor(n)}` }}
            >
              <p className="shrink-0 whitespace-nowrap text-xl font-black leading-none tracking-tight">
                {n}
                <span className="px-1 text-muted">×</span>
                {b}
                <span className="px-1 text-[#e06a28]">=</span>
                <span className="text-[#e06a28]">{n * b}</span>
              </p>
              <p className="shrink-0 whitespace-nowrap rounded-full bg-[#ffe6a8] px-2.5 py-1 text-base font-black leading-none">
                {rhyme(n, b)}
              </p>
              <div className="ml-auto">
                <SpeakerButton text={spokenRhyme(n, b)} enabled={data.speechOn} size="md" />
              </div>
              <p className="sr-only">{equationText(n, b)}</p>
            </li>
          )
        })}
      </ul>
      <Button variant="white" className="w-full" onClick={() => stopSpeech()}>
        停止
      </Button>
    </div>
  )
}
