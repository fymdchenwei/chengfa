import { useEffect, useState } from 'react'
import {
  canSpeak,
  formatSpeechRate,
  prepareSpeech,
  rankChineseVoices,
  rateLabel,
  SPEECH_RATE_MAX,
  SPEECH_RATE_MIN,
  speakChinese,
  voiceBlurb,
  type VoiceInfo,
} from '../domain/speech.ts'
import { spokenRhyme } from '../domain/rhyme.ts'
import { useProgress } from '../hooks/useProgress.ts'
import { useSpeaking } from '../hooks/useSpeaking.ts'
import { SoundWaves } from './SoundWaves.tsx'
import { buttonClass } from './buttonClass.ts'

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
  const speaking = useSpeaking()
  const [hint, setHint] = useState('')
  const savedMissing = data.speechVoice !== '' && !voices.some((voice) => voice.name === data.speechVoice)

  return (
    <div className="grid gap-3">
      <h2 className="text-lg font-black">选一个声音</h2>
      <div className="grid gap-2" role="radiogroup" aria-label="选择声音">
        <button
          type="button"
          role="radio"
          aria-checked={data.speechVoice === ''}
          className={`voice-card ${data.speechVoice === '' ? 'voice-card-on' : ''}`}
          onClick={() => setSpeechVoice('')}
        >
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#efe6ff] text-lg font-black text-[#6a4de0]">
            自
          </span>
          <span>
            <span className="block text-lg font-black">自动</span>
            <span className="block text-sm font-bold text-muted">这台设备最好的</span>
          </span>
        </button>
        {savedMissing ? (
          <button
            type="button"
            role="radio"
            aria-checked
            className="voice-card voice-card-on"
            onClick={() => setSpeechVoice(data.speechVoice)}
          >
            <span className="block text-lg font-black">{data.speechVoice}</span>
          </button>
        ) : null}
        {voices.map((voice) => {
          const on = data.speechVoice === voice.name
          return (
            <button
              key={`${voice.name}-${voice.lang}`}
              type="button"
              role="radio"
              aria-checked={on}
              className={`voice-card ${on ? 'voice-card-on' : ''}`}
              onClick={() => {
                setSpeechVoice(voice.name)
                setHint('')
              }}
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#ffe0ef] text-lg font-black">
                {voice.name.slice(0, 1)}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-lg font-black">{voice.name}</span>
                <span className="block text-sm font-bold text-muted">{voiceBlurb(voice.name)}</span>
              </span>
            </button>
          )
        })}
        {voices.length === 0 ? <p className="text-base font-bold text-muted">还没找到中文语音。不同手机装的声音不一样。</p> : null}
      </div>

      <section className="rounded-[1.35rem] bg-white p-4 shadow-[0_5px_0_#efe4f6]">
        <div className="flex items-center justify-between">
          <p className="text-lg font-black">语速</p>
          <p className="text-lg font-black text-[#7a5cff]">
            {rateLabel(data.speechRate)}
            <span className="ml-1 text-sm text-muted">{formatSpeechRate(data.speechRate)}</span>
          </p>
        </div>
        <input
          className="mt-3 w-full accent-[#8b6cff]"
          type="range"
          min={SPEECH_RATE_MIN}
          max={SPEECH_RATE_MAX}
          step={0.05}
          value={data.speechRate}
          aria-label="语速"
          onChange={(event) => setSpeechRate(Number(event.target.value))}
        />
        <div className="mt-1 flex justify-between text-sm font-bold text-muted">
          <span>慢一点</span>
          <span>快一点</span>
        </div>
      </section>

      <button
        type="button"
        className={buttonClass('pink', 'lg', 'w-full')}
        onClick={() => {
          const ok = speakChinese(spokenRhyme(3, 4))
          setHint(ok ? '' : '这台设备现在读不出来，我们看口诀吧')
        }}
      >
        <SoundWaves active={speaking} />
        试听一下
      </button>
      {hint ? <p className="text-base font-bold text-muted">{hint}</p> : null}
      <p className="text-sm font-bold leading-relaxed text-muted">可选的声音取决于这台设备，全部离线可用。</p>
    </div>
  )
}
