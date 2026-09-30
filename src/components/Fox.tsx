export type FoxMood = 'wave' | 'sing' | 'headphones' | 'think' | 'cheer' | 'happy' | 'oops'

export function Fox({ mood = 'happy', className = 'h-28 w-28' }: { mood?: FoxMood; className?: string }) {
  const cheering = mood === 'cheer'
  const thinking = mood === 'think'
  const singing = mood === 'sing'
  const worried = mood === 'oops'
  const eyeY = thinking ? 66 : 70

  return (
    <svg viewBox="0 0 160 160" className={`fox-bob shrink-0 ${className}`} aria-hidden="true">
      <ellipse cx="124" cy="118" rx="22" ry="14" fill="#FFB15A" transform="rotate(-28 124 118)" />
      <ellipse cx="78" cy="122" rx="38" ry="24" fill="#FF9A3C" />
      <circle cx="78" cy="74" r="44" fill="#FF9A3C" />
      <path d="M40 58 54 22 74 54Z" fill="#FF9A3C" />
      <path d="M116 58 102 22 82 54Z" fill="#FF9A3C" />
      <path d="M48 54 56 32 68 52Z" fill="#FFD0DC" />
      <path d="M108 54 100 32 88 52Z" fill="#FFD0DC" />
      <ellipse cx="78" cy="86" rx="28" ry="22" fill="#FFF6EA" />
      <ellipse cx="62" cy={eyeY} rx="7" ry="8" fill="#2A2142" />
      <ellipse cx="94" cy={eyeY} rx="7" ry="8" fill="#2A2142" />
      <circle cx="64" cy={eyeY - 2} r="2.2" fill="#fff" />
      <circle cx="96" cy={eyeY - 2} r="2.2" fill="#fff" />
      <ellipse cx="50" cy="86" rx="7" ry="4" fill="#FFB4C8" opacity="0.9" />
      <ellipse cx="106" cy="86" rx="7" ry="4" fill="#FFB4C8" opacity="0.9" />
      {singing || cheering ? (
        <ellipse cx="78" cy="96" rx="8" ry="6" fill="#2A2142" />
      ) : worried ? (
        <path d="M66 100c8-8 20-8 28 0" fill="none" stroke="#2A2142" strokeWidth="3" strokeLinecap="round" />
      ) : thinking ? (
        <path d="M68 98h20" fill="none" stroke="#2A2142" strokeWidth="3" strokeLinecap="round" />
      ) : (
        <path d="M66 94c8 10 20 10 28 0" fill="none" stroke="#2A2142" strokeWidth="3" strokeLinecap="round" />
      )}
      {mood === 'wave' ? <ellipse cx="122" cy="96" rx="11" ry="9" fill="#FFB15A" /> : null}
      {cheering ? (
        <>
          <ellipse cx="36" cy="108" rx="11" ry="9" fill="#FFB15A" />
          <ellipse cx="120" cy="108" rx="11" ry="9" fill="#FFB15A" />
          <path d="M128 36l2.2 6.2 6.4.4-5 4 1.6 6.2-5.2-3.6-5.2 3.6 1.6-6.2-5-4 6.4-.4Z" fill="#FFC857" />
        </>
      ) : null}
      {thinking ? <ellipse cx="108" cy="108" rx="12" ry="9" fill="#FFB15A" /> : null}
      {mood === 'headphones' ? (
        <>
          <path d="M40 70c0-24 18-40 38-40s38 16 38 40" fill="none" stroke="#2A2142" strokeWidth="6" strokeLinecap="round" />
          <rect x="30" y="66" width="16" height="24" rx="6" fill="#7AA7FF" />
          <rect x="110" y="66" width="16" height="24" rx="6" fill="#7AA7FF" />
        </>
      ) : null}
      {singing ? (
        <>
          <circle cx="128" cy="42" r="5" fill="#7AA7FF" />
          <path d="M133 42v-16" stroke="#7AA7FF" strokeWidth="3" strokeLinecap="round" />
          <circle cx="138" cy="58" r="4" fill="#FF8A3D" />
          <path d="M142 58v-12" stroke="#FF8A3D" strokeWidth="2.5" strokeLinecap="round" />
        </>
      ) : null}
    </svg>
  )
}
