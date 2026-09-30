import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { equationText } from '../domain/facts.ts'
import { rhyme, spokenRhyme } from '../domain/rhyme.ts'
import { speakSequence, stopSpeech } from '../domain/speech.ts'
import { usePageTitle } from '../hooks/usePageTitle.ts'
import { useProgress } from '../hooks/useProgress.ts'
import { buttonClass } from '../components/buttonClass.ts'
import { FoxImage } from '../components/FoxImage.tsx'
import { SoundWaves } from '../components/SoundWaves.tsx'
import { useSpeaking } from '../hooks/useSpeaking.ts'
import { SpeakerButton, type SpeakerTone } from '../components/SpeakerButton.tsx'

const ROW_TONE = ['sun', 'mint', 'lilac', 'pink', 'sky'] as const
const SPEAKER_TONE: SpeakerTone[] = ['sun', 'mint', 'lilac', 'pink', 'orange']

export function LearnRowPage() {
  const params = useParams()
  const navigate = useNavigate()
  const n = Number(params.n)
  const valid = Number.isInteger(n) && n >= 1 && n <= 9
  usePageTitle(valid ? `${n} 的口诀` : '口诀')
  const { data } = useProgress()
  const speaking = useSpeaking()
  const [hint, setHint] = useState('')
  const [rowState, setRowState] = useState({ n, active: valid ? n : 1 })
  if (valid && rowState.n !== n) setRowState({ n, active: n })
  const active = rowState.active

  useEffect(() => () => stopSpeech(), [])

  if (!valid) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="display text-4xl">没有这一行</h1>
        <p className="text-lg font-bold text-muted">口诀是从 1 到 9。</p>
        <Link to="/learn/1" className={buttonClass()}>
          返回口诀
        </Link>
      </div>
    )
  }

  const lines = Array.from({ length: 9 }, (_, index) => spokenRhyme(n, index + 1))

  return (
    <div className="flex flex-col gap-3" style={{ paddingBottom: '4.2rem' }}>
      <header className="flex items-start justify-between gap-2">
        <div className="min-w-0 pt-2">
          <h1 className="display text-[2.15rem]">{n} 的口诀</h1>
          <p className="mt-2 text-sm font-extrabold text-[#6d5a86]">点一点小喇叭，听狐狸唱</p>
        </div>
        <FoxImage mood="sing" className="-mr-2 w-40" />
      </header>
      <div className="grid grid-cols-9 gap-1" role="group" aria-label="选择哪一句口诀">
        {Array.from({ length: 9 }, (_, index) => {
          const value = index + 1
          const on = value === n
          return (
            <button
              key={value}
              type="button"
              aria-pressed={on}
              className={`digit cursor-pointer ${on ? 'digit-active' : ''}`}
              onClick={() => {
                if (value !== n) navigate(`/learn/${value}`)
              }}
            >
              {value}
            </button>
          )
        })}
      </div>
      {hint ? <p className="text-base font-bold">{hint}</p> : null}
      <ul className="grid gap-1.5">
        {Array.from({ length: 9 }, (_, index) => {
          const b = index + 1
          const tone = ROW_TONE[index % ROW_TONE.length]
          return (
            <li key={b} className={`rhyme-row rhyme-${tone} ${active === b ? 'rhyme-on' : ''}`}>
              <p className="shrink-0 whitespace-nowrap text-lg font-black leading-none tracking-tight">
                {n}×{b}={n * b}
              </p>
              <span className="rhyme-split" aria-hidden="true" />
              <p className="min-w-0 flex-1 truncate text-lg font-black leading-none">{rhyme(n, b)}</p>
              <SpeakerButton
                text={spokenRhyme(n, b)}
                enabled={data.speechOn}
                size="sm"
                tone={SPEAKER_TONE[index % SPEAKER_TONE.length]}
                onDenied={setHint}
                onPlay={() => setRowState({ n, active: b })}
              />
              <p className="sr-only">{equationText(n, b)}</p>
            </li>
          )
        })}
      </ul>
      <div className="follow-dock">
        <button
          type="button"
          className="follow-bar"
          onClick={() => {
            if (speaking) {
              stopSpeech()
              return
            }
            if (!data.speechOn) {
              setHint('朗读关着，可以在「进步」里打开')
              return
            }
            const ok = speakSequence(lines, (index) => setRowState({ n, active: index + 1 }))
            setHint(ok ? '' : '这台设备现在读不出来，我们看口诀吧')
          }}
        >
          <SoundWaves active={speaking} />
          {speaking ? '停止' : '跟着读'}
        </button>
      </div>
    </div>
  )
}
