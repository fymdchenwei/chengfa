import { useEffect, useState } from 'react'
import { spokenRhyme } from '../domain/rhyme.ts'
import {
  canSpeak,
  formatSpeechRate,
  prepareSpeech,
  rankChineseVoices,
  SPEECH_RATE_MAX,
  SPEECH_RATE_MIN,
  speakChinese,
  type VoiceInfo,
} from '../domain/speech.ts'
import { useProgress } from '../hooks/useProgress.ts'
import { buttonClass } from './buttonClass.ts'
import { useSpeaking } from '../hooks/useSpeaking.ts'
import { SoundWaves } from './SoundWaves.tsx'

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
      <section className="rounded-[1.6rem] bg-white/95 p-4 shadow-[0_8px_0_#f0e2d0]">
        <label className="block text-lg font-extrabold" htmlFor="speech-voice">
          选择声音
          <select
            id="speech-voice"
            className="mt-2 min-h-14 w-full cursor-pointer rounded-2xl bg-[#fff6ea] px-3 text-lg font-extrabold"
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
          <p className="mt-2 text-base font-bold text-muted">还没找到中文语音。不同手机装的声音不一样。</p>
        ) : null}
      </section>

      <section className="rounded-[1.6rem] bg-white/95 p-4 shadow-[0_8px_0_#f0e2d0]">
        <div className="flex items-center justify-between">
          <p className="text-lg font-extrabold">语速</p>
          <p className="text-lg font-black text-[#e06a28]">{formatSpeechRate(data.speechRate)}</p>
        </div>
        <input
          className="mt-3 w-full accent-[#ff8a3d]"
          type="range"
          min={SPEECH_RATE_MIN}
          max={SPEECH_RATE_MAX}
          step={0.05}
          value={data.speechRate}
          aria-label="语速"
          onChange={(event) => setSpeechRate(Number(event.target.value))}
        />
        <div className="mt-1 flex justify-between text-sm font-bold text-muted">
          <span>慢</span>
          <span>快</span>
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
      <p className="text-base font-bold leading-relaxed text-muted">
        用这台设备自己的中文语音，不联网。自动会挑 Tingting、Google 普通话这类更自然的声音。
      </p>
    </div>
  )
}
