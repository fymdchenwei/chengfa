import { describe, expect, it } from 'vitest'
import {
  DEFAULT_SPEECH_RATE,
  formatSpeechRate,
  isChineseVoice,
  isSpeaking,
  normalizeSpeechRate,
  noteSpeechEnd,
  noteSpeechStart,
  noteSpeechStop,
  pickChineseVoice,
  rankChineseVoices,
  sanitizeSpeechVoice,
  voiceScore,
  type VoiceInfo,
} from './speech.ts'

const VOICES: VoiceInfo[] = [
  { name: 'Samantha', lang: 'en-US', localService: true },
  { name: 'Compact', lang: 'zh-CN', localService: true },
  { name: 'Google 普通话', lang: 'zh-CN', localService: true },
  { name: 'Tingting', lang: 'zh-CN', localService: true },
  { name: 'Meijia', lang: 'zh-TW', localService: true },
  { name: 'Sinji', lang: 'zh-HK', localService: true },
  { name: 'Remote Natural', lang: 'zh-CN', localService: false },
]

describe('中文语音选择', () => {
  it('优先用普通话里更自然的声音', () => {
    expect(pickChineseVoice(VOICES)?.name).toBe('Tingting')
    const ranked = rankChineseVoices(VOICES).map((voice) => voice.name)
    expect(ranked.indexOf('Tingting')).toBeLessThan(ranked.indexOf('Google 普通话'))
    expect(ranked.indexOf('Google 普通话')).toBeLessThan(ranked.indexOf('Meijia'))
    expect(ranked.indexOf('Meijia')).toBeLessThan(ranked.indexOf('Sinji'))
    expect(ranked).not.toContain('Samantha')
  })

  it('点名要某个声音时用它，没有就退回最好的', () => {
    expect(pickChineseVoice(VOICES, 'Sinji')?.name).toBe('Sinji')
    expect(pickChineseVoice(VOICES, '不存在')?.name).toBe('Tingting')
    expect(pickChineseVoice(VOICES, 'Samantha')?.name).toBe('Tingting')
  })

  it('增强语音和本机语音得分更高', () => {
    const enhanced = voiceScore({ name: 'Tingting Premium', lang: 'zh-CN', localService: true })
    const plain = voiceScore({ name: 'Tingting', lang: 'zh-CN', localService: true })
    const remote = voiceScore({ name: 'Tingting', lang: 'zh-CN', localService: false })
    expect(enhanced).toBeGreaterThan(plain)
    expect(plain).toBeGreaterThan(remote)
    expect(isChineseVoice({ name: 'Chinese', lang: 'en-US' })).toBe(true)
    expect(isChineseVoice({ name: 'Samantha', lang: 'en-US' })).toBe(false)
  })

  it('速度和声音名字会收成可以保存的值', () => {
    expect(normalizeSpeechRate(undefined)).toBe(DEFAULT_SPEECH_RATE)
    expect(normalizeSpeechRate(0.72)).toBe(0.72)
    expect(normalizeSpeechRate(0.79)).toBe(0.79)
    expect(normalizeSpeechRate(0.2)).toBe(0.5)
    expect(normalizeSpeechRate(9)).toBe(1.5)
    expect(formatSpeechRate(0.8)).toBe('0.8x')
    expect(formatSpeechRate(1)).toBe('1.0x')
    expect(formatSpeechRate(1.5)).toBe('1.5x')
    expect(sanitizeSpeechVoice('  Tingting  ')).toBe('Tingting')
    expect(sanitizeSpeechVoice('')).toBe('')
    expect(sanitizeSpeechVoice('a'.repeat(121))).toBe('')
    expect(sanitizeSpeechVoice('坏\n名字')).toBe('')
  })

  it('过期的朗读结束不会把新的朗读关掉', () => {
    const older = noteSpeechStart()
    const newer = noteSpeechStart()
    noteSpeechEnd(older)
    expect(isSpeaking()).toBe(true)
    noteSpeechEnd(newer)
    expect(isSpeaking()).toBe(false)
    noteSpeechStart()
    noteSpeechStop()
    expect(isSpeaking()).toBe(false)
  })
})