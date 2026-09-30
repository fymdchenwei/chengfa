import { useEffect, useState } from 'react'
import { subscribeSpeaking } from '../domain/speech.ts'

export function useSpeaking(): boolean {
  const [speaking, setSpeaking] = useState(false)
  useEffect(() => subscribeSpeaking(setSpeaking), [])
  return speaking
}
