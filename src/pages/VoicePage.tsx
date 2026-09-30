import { useState } from 'react'
import { rhyme, spokenRhyme } from '../domain/rhyme.ts'
import { speakChinese } from '../domain/speech.ts'
import { usePageTitle } from '../hooks/usePageTitle.ts'
import { useProgress } from '../hooks/useProgress.ts'
import { FoxImage } from '../components/FoxImage.tsx'
import { IconNote } from '../components/icons.tsx'
import { SpeechSettings } from '../components/SpeechSettings.tsx'

export function VoicePage() {
  usePageTitle('语音设置')
  const { data } = useProgress()
  const [hint, setHint] = useState('')
  const sample = [...rhyme(1, 3)].join(' ')

  return (
    <div className="flex flex-col gap-2">
      <header className="flex items-center justify-between gap-2">
        <h1 className="voice-title">朗读声音</h1>
        <p className="listen-chip">小狐狸在听</p>
      </header>
      <div className="flex flex-col items-center">
        <FoxImage mood="listen" className="w-[34vw] max-w-[9rem]" />
        <button
          type="button"
          className="speech-bubble -mt-1 whitespace-nowrap px-4 py-2.5 text-center text-xl font-black tracking-wide"
          onClick={() => {
            if (!data.speechOn) {
              setHint('朗读关着，可以在「进步」里打开')
              return
            }
            const ok = speakChinese(spokenRhyme(1, 3))
            setHint(ok ? '' : '这台设备现在读不出来，我们看口诀吧')
          }}
        >
          {sample}
          <IconNote className="ml-1" />
        </button>
      </div>
      {hint ? <p className="text-center text-base font-bold text-white">{hint}</p> : null}
      <SpeechSettings />
    </div>
  )
}
