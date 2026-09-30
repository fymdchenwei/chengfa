import { useEffect, useState } from 'react'
import { spokenRhyme } from '../domain/rhyme.ts'
import {
  canSpeak,
  prepareSpeech,
  rankChineseVoices,
  SPEECH_RATES,
  speakChinese,
  type VoiceInfo,
} from '../domain/speech.ts'
import { useProgress } from '../hooks/useProgress.ts'
import { Button } from './ui.tsx'

function useChineseVoices(): VoiceInfo[] {
  const [voices, setVoices] = useState<VoiceInfo[]>([])

  useEffect(() => {
    if (!canSpeak()) return
    const load = () => {
      setVoices(
        rankChineseVoices(window.speechSynthesis.getVoices()).map((voice) => ({
          name: voice.name,
          lang: voice.lang,
          localService: voice.localService,
        })),
      )
    }
    prepareSpeech()
    load()
    window.speechSynthesis.addEventListener('voiceschanged', load)
    return () => window.speechSynthesis.removeEventListener('voiceschanged', load)
  }, [])

  return voices
}

export function SpeechSettings() {
  const { data, setSpeechVoice, setSpeechRate } = useProgress()
  const voices = useChineseVoices()
  const [hint, setHint] = useState('')
  const savedMissing = data.speechVoice !== '' && !voices.some((voice) => voice.name === data.speechVoice)

  return (
    <section className="rounded-[1.4rem] bg-white p-4">
      <h2 className="text-xl font-extrabold">朗读声音</h2>
      <p className="mt-1 text-base font-bold leading-relaxed text-muted">
        用这台设备自己的中文语音，不联网。自动会挑 Tingting、Google 普通话这类更自然的声音；没有就用设备里的其他中文语音。
      </p>
      <label className="mt-3 block text-base font-extrabold" htmlFor="speech-voice">
        声音
        <select
          id="speech-voice"
          className="mt-1 min-h-14 w-full cursor-pointer rounded-2xl bg-[#fff6ea] px-3 text-lg font-extrabold"
          value={data.speechVoice}
          onChange={(event) => {
            setSpeechVoice(event.target.value)
            setHint('')
          }}
        >
          <option value="">自动（这台设备最好的）</option>
          {savedMissing ? <option value={data.speechVoice}>{data.speechVoice}</option> : null}
          {voices.map((voice) => (
            <option key={`${voice.name}-${voice.lang}`} value={voice.name}>
              {voice.name}
            </option>
          ))}
        </select>
      </label>
      {voices.length === 0 ? (
        <p className="mt-2 text-base font-bold text-muted">还没找到中文语音。不同手机装的声音不一样，没有的话只能看字。</p>
      ) : null}
      <p className="mt-4 text-base font-extrabold">速度</p>
      <div className="mt-2 grid grid-cols-3 gap-2">
        {SPEECH_RATES.map((preset) => {
          const selected = data.speechRate === preset.rate
          return (
            <button
              key={preset.id}
              type="button"
              aria-pressed={selected}
              onClick={() => setSpeechRate(preset.rate)}
              className={`min-h-12 cursor-pointer rounded-full text-base font-extrabold ${
                selected ? 'bg-[#ffe6a8] shadow-[0_3px_0_#e6c56a]' : 'bg-[#fff6ea]'
              }`}
            >
              {preset.label}
            </button>
          )
        })}
      </div>
      <Button
        variant="white"
        className="mt-3 w-full"
        onClick={() => {
          const ok = speakChinese(spokenRhyme(3, 4))
          setHint(ok ? '' : '这台设备现在读不出来，我们看口诀吧')
        }}
      >
        听一句
      </Button>
      {hint ? <p className="mt-2 text-base font-bold text-muted">{hint}</p> : null}
    </section>
  )
}
