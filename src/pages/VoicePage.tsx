import { useState } from 'react'
import { spokenRhyme } from '../domain/rhyme.ts'
import { speakChinese } from '../domain/speech.ts'
import { usePageTitle } from '../hooks/usePageTitle.ts'
import { useProgress } from '../hooks/useProgress.ts'
import { FoxImage } from '../components/FoxImage.tsx'
import { SpeechSettings } from '../components/SpeechSettings.tsx'

export function VoicePage() {
  usePageTitle('语音设置')
  const { data } = useProgress()
  const [hint, setHint] = useState('')

  return (
    <div className="flex flex-col gap-3">
      <header className="flex items-start justify-between gap-2">
        <div className="min-w-0 pt-2">
          <h1 className="display text-[2rem]">朗读声音</h1>
          <p className="mt-2 text-sm font-extrabold text-[#6d5a86]">小狐狸在听</p>
        </div>
        <FoxImage mood="listen" className="-mr-2 w-40" />
      </header>
      <button
        type="button"
        className="speech-bubble mx-auto max-w-[16rem] px-4 py-3 text-center text-xl font-black"
        onClick={() => {
          if (!data.speechOn) {
            setHint('朗读关着，可以在「进步」里打开')
            return
          }
          const ok = speakChinese(spokenRhyme(3, 4))
          setHint(ok ? '' : '这台设备现在读不出来，我们看口诀吧')
        }}
      >
        三四十二
      </button>
      {hint ? <p className="text-center text-base font-bold">{hint}</p> : null}
      <SpeechSettings />
    </div>
  )
}
