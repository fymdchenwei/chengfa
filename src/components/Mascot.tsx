import { Fox, type FoxMood } from './Fox.tsx'

const MOODS: Record<'happy' | 'cheer' | 'think' | 'oops', FoxMood> = {
  happy: 'happy',
  cheer: 'cheer',
  think: 'think',
  oops: 'oops',
}

export function Mascot({ mood = 'happy', className }: { mood?: keyof typeof MOODS; className?: string }) {
  return <Fox mood={MOODS[mood]} className={className} />
}
