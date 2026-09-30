import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { equationText, tableColor } from '../domain/facts.ts'
import { rhyme, spokenAnswer } from '../domain/rhyme.ts'
import { speakSequence, stopSpeech } from '../domain/speech.ts'
import { usePageTitle } from '../hooks/usePageTitle.ts'
import { useProgress } from '../hooks/useProgress.ts'
import { SpeakerButton } from '../components/SpeakerButton.tsx'
import { buttonClass } from '../components/buttonClass.ts'
import { Button } from '../components/ui.tsx'

export function LearnRowPage() {
  const params = useParams()
  const n = Number(params.n)
  const valid = Number.isInteger(n) && n >= 1 && n <= 9
  usePageTitle(valid ? `${n} 的口诀` : '学习')
  const { data } = useProgress()
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

  const lines = Array.from({ length: 9 }, (_, index) => spokenAnswer(n, index + 1))

  return (
    <div className="flex flex-col gap-4">
      <Link to="/learn" className="inline-flex min-h-12 items-center text-lg font-extrabold">
        ‹ 全部口诀
      </Link>
      <header className="rounded-[1.8rem] px-5 py-4" style={{ backgroundColor: tableColor(n) }}>
        <h1 className="text-4xl font-black">{n} 的口诀</h1>
        <div className="mt-3 flex gap-2">
          <Button
            onClick={() => {
              if (!data.speechOn) {
                setHint('朗读关着，可以在「进步」里打开')
                return
              }
              const ok = speakSequence(lines)
              setHint(ok ? '' : '这台设备现在读不出来，我们看口诀吧')
            }}
          >
            连着读
          </Button>
          <Button variant="white" onClick={() => stopSpeech()}>
            停止
          </Button>
        </div>
        {hint ? <p className="mt-3 text-base font-bold">{hint}</p> : null}
      </header>
      <ul className="grid gap-3">
        {Array.from({ length: 9 }, (_, index) => {
          const b = index + 1
          return (
            <li key={b} className="rounded-[1.6rem] bg-white p-4 shadow-[0_6px_0_#f0e2d0]">
              <div className="flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-4xl font-black tracking-tight">{n} × {b}</p>
                  <p className="mt-1 text-3xl font-black text-[#d26522]">= {n * b}</p>
                </div>
                <SpeakerButton text={spokenAnswer(n, b)} enabled={data.speechOn} />
              </div>
              <p className="mt-3 text-base font-bold text-muted">口诀</p>
              <p className="mt-1 inline-flex rounded-full bg-[#ffe6a8] px-4 py-2 text-2xl font-black">{rhyme(n, b)}</p>
              <p className="sr-only">{equationText(n, b)}</p>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
