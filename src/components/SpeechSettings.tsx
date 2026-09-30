import { useEffect, useState } from 'react'
import {
  canSpeak,
  pickVoiceForPreset,
  prepareSpeech,
  rankChineseVoices,
  rateLabel,
  SPEECH_RATE_MAX,
  SPEECH_RATE_MIN,
  speakChinese,
  voiceBlurb,
  type SpeechPresetId,
  type VoiceInfo,
} from '../domain/speech.ts'
import { spokenRhyme } from '../domain/rhyme.ts'
import { useProgress } from '../hooks/useProgress.ts'
import { useSpeaking } from '../hooks/useSpeaking.ts'
import { FoxImage } from './FoxImage.tsx'
import { IconRabbit, IconTurtle } from './icons.tsx'
import { SoundWaves } from './SoundWaves.tsx'

const CARDS: { id: SpeechPresetId; title: string; blurb: string }[] = [
  { id: 'fox', title: '小狐狸推荐', blurb: '刚刚好的语速' },
  { id: 'bear', title: '大熊叔叔', blurb: '慢一点，声音低' },
  { id: 'kid', title: '小朋友', blurb: '语调更活泼' },
]

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
  const { data, setSpeechVoice, setSpeechRate, setSpeechPreset } = useProgress()
  const voices = useChineseVoices()
  const speaking = useSpeaking()
  const [hint, setHint] = useState('')
  const savedMissing = data.speechVoice !== '' && !voices.some((voice) => voice.name === data.speechVoice)
  const span = SPEECH_RATE_MAX - SPEECH_RATE_MIN
  const ratio = (data.speechRate - SPEECH_RATE_MIN) / span

  function applyPreset(preset: SpeechPresetId) {
    const voice = pickVoiceForPreset(voices, preset)
    setSpeechPreset(preset, voice?.name ?? '')
  }

  return (
    <div className="grid gap-2">
      <h2 className="text-lg font-black text-white">选一个声音</h2>
      <div className="grid gap-2.5" role="radiogroup" aria-label="选择声音">
        {CARDS.map((card) => {
          const on = data.speechPreset === card.id
          return (
            <div key={card.id} className={`cast-card ${on ? 'cast-card-on' : ''}`}>
              <button type="button" role="radio" aria-checked={on} className="cast-main" onClick={() => applyPreset(card.id)}>
                <CastFace id={card.id} />
                <span className="min-w-0 flex-1 text-left">
                  <span className="block text-lg font-black">{card.title}</span>
                  <span className="block text-sm font-bold text-muted">{card.blurb}</span>
                </span>
              </button>
              <button
                type="button"
                className="cast-play"
                aria-label={`听${card.title}`}
                onClick={() => {
                  applyPreset(card.id)
                  const ok = speakChinese(spokenRhyme(1, 3))
                  setHint(ok ? '' : '这台设备现在读不出来，我们看口诀吧')
                }}
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                  <path fill="currentColor" d="M8 5.5v13l12-6.5z" />
                </svg>
              </button>
            </div>
          )
        })}
      </div>
      {voices.length === 0 ? (
        <p className="soft-hint">还没找到中文语音，会用这台设备的默认声音。不同手机装的声音不一样。</p>
      ) : null}

      <details className="more-voices">
        <summary>更多声音</summary>
        <div className="mt-2 grid gap-2" role="radiogroup" aria-label="系统语音">
          <button
            type="button"
            role="radio"
            aria-checked={data.speechVoice === '' && data.speechPreset === 'custom'}
            className={`voice-card ${data.speechVoice === '' && data.speechPreset === 'custom' ? 'voice-card-on' : ''}`}
            onClick={() => setSpeechVoice('')}
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#efe6ff] text-lg font-black text-[#6a4de0]">自</span>
            <span>
              <span className="block text-lg font-black">自动</span>
              <span className="block text-sm font-bold text-muted">这台设备最好的</span>
            </span>
          </button>
          {savedMissing ? (
            <button type="button" role="radio" aria-checked className="voice-card voice-card-on" onClick={() => setSpeechVoice(data.speechVoice)}>
              <span className="block text-lg font-black">{data.speechVoice}</span>
            </button>
          ) : null}
          {voices.map((voice) => {
            const on = data.speechVoice === voice.name && data.speechPreset === 'custom'
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
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#ffe0ef] text-lg font-black">{voice.name.slice(0, 1)}</span>
                <span className="min-w-0">
                  <span className="block truncate text-lg font-black">{voice.name}</span>
                  <span className="block text-sm font-bold text-muted">{voiceBlurb(voice.name)}</span>
                </span>
              </button>
            )
          })}
        </div>
      </details>

      <section className="rounded-[1.35rem] bg-white px-3 py-2 shadow-[0_5px_0_#efe4f6]">
        <div className="relative px-1 pt-7">
          <p className="rate-bubble" style={{ left: `clamp(0px, calc(${ratio * 100}% - 1.7rem), calc(100% - 4.2rem))` }}>
            {rateLabel(data.speechRate)}
          </p>
          <div className="flex items-center gap-2">
            <IconTurtle />
            <input
              className="rate-slider"
              type="range"
              min={SPEECH_RATE_MIN}
              max={SPEECH_RATE_MAX}
              step={0.05}
              value={data.speechRate}
              aria-label="语速"
              onChange={(event) => setSpeechRate(Number(event.target.value))}
            />
            <IconRabbit />
          </div>
        </div>
      </section>

      <button
        type="button"
        className="listen-btn"
        onClick={() => {
          const ok = speakChinese(spokenRhyme(3, 4))
          setHint(ok ? '' : '这台设备现在读不出来，我们看口诀吧')
        }}
      >
        <SoundWaves active={speaking} />
        试听一下
      </button>
      {hint ? <p className="text-base font-bold text-white">{hint}</p> : null}
      <p className="text-sm font-bold leading-relaxed text-white/85">可选的声音取决于这台设备，全部离线可用。</p>
    </div>
  )
}

function CastFace({ id }: { id: SpeechPresetId }) {
  if (id === 'fox') {
    return (
      <span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-full bg-[#fff1e4]">
        <FoxImage mood="happy" className="w-12" />
      </span>
    )
  }
  if (id === 'bear') {
    return (
      <svg viewBox="0 0 64 64" className="h-12 w-12" aria-hidden="true">
        <circle cx="16" cy="16" r="10" fill="#8a5a32" />
        <circle cx="48" cy="16" r="10" fill="#8a5a32" />
        <circle cx="32" cy="36" r="20" fill="#c4844a" />
        <ellipse cx="32" cy="40" rx="10" ry="8" fill="#f3d2a4" />
        <circle cx="25" cy="32" r="2.2" fill="#2a2142" />
        <circle cx="39" cy="32" r="2.2" fill="#2a2142" />
        <ellipse cx="32" cy="40" rx="3" ry="2.2" fill="#5a3820" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 64 64" className="h-12 w-12" aria-hidden="true">
      <circle cx="32" cy="34" r="18" fill="#ffd0b0" />
      <path d="M16 30c2-12 8-16 16-16s14 4 16 16" fill="#5b3a22" />
      <circle cx="25" cy="34" r="2.2" fill="#2a2142" />
      <circle cx="39" cy="34" r="2.2" fill="#2a2142" />
      <path d="M28 42c1.4 1.6 6.6 1.6 8 0" fill="none" stroke="#e07a8a" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
