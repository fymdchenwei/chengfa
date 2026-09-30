export function Mascot({ mood = 'happy' }: { mood?: 'happy' | 'cheer' | 'think' | 'oops' }) {
  const mouth = {
    happy: 'M32 62c8 10 28 10 36 0',
    cheer: 'M30 58c10 16 32 16 42 0',
    think: 'M34 66h28',
    oops: 'M32 70c8-10 28-10 36 0',
  }[mood]

  return (
    <svg viewBox="0 0 96 96" className="h-24 w-24 shrink-0" aria-hidden="true">
      <circle cx="48" cy="48" r="44" fill="#FF8A3D" />
      <circle cx="48" cy="48" r="34" fill="#FFF6EA" />
      <circle cx="36" cy="44" r="4.5" fill="#2A2142" />
      <circle cx="60" cy="44" r="4.5" fill="#2A2142" />
      <path d={mouth} fill="none" stroke="#2A2142" strokeWidth="4" strokeLinecap="round" />
      {mood === 'cheer' ? <circle cx="78" cy="18" r="10" fill="#FFC857" /> : null}
      {mood === 'oops' ? <circle cx="28" cy="56" r="5" fill="#FFB4A2" /> : null}
      {mood === 'oops' ? <circle cx="68" cy="56" r="5" fill="#FFB4A2" /> : null}
    </svg>
  )
}
