export type FoxMood = 'wave' | 'sing' | 'headphones' | 'think' | 'cheer' | 'happy' | 'oops'

export function Fox({ mood = 'happy', className = 'h-32 w-28' }: { mood?: FoxMood; className?: string }) {
  const singing = mood === 'sing'
  const thinking = mood === 'think'
  const cheering = mood === 'cheer'
  const worried = mood === 'oops'
  const waving = mood === 'wave' || mood === 'happy'
  const eyeY = thinking ? 96 : 100

  return (
    <svg viewBox="0 0 200 270" className={`fox-bob shrink-0 overflow-visible ${className}`} aria-hidden="true">
      <ellipse cx="100" cy="254" rx="48" ry="9" fill="#7eb6e8" opacity="0.35" />
      <path d="M46 176c-30 10-42 40-26 60 10 12 30 12 36 0" fill="#E8832A" />
      <ellipse cx="30" cy="232" rx="16" ry="13" fill="#FFF6EA" />
      <ellipse cx="76" cy="226" rx="16" ry="20" fill="#FF9A3C" />
      <ellipse cx="124" cy="226" rx="16" ry="20" fill="#FF9A3C" />
      <ellipse cx="76" cy="242" rx="17" ry="8" fill="#FFC278" />
      <ellipse cx="124" cy="242" rx="17" ry="8" fill="#FFC278" />
      <ellipse cx="100" cy="188" rx="54" ry="48" fill="#FF9A3C" />
      <ellipse cx="100" cy="200" rx="32" ry="28" fill="#FFF6EA" />
      <path d="M54 158c12 16 80 16 92 0 2 20-14 38-46 42-32-4-48-22-46-42z" fill="#FF4D6A" />
      <path d="M124 176c16 6 26 24 18 40-6 8-16 4-16-4l-8-36z" fill="#E2304C" />
      <circle cx="142" cy="210" r="5" fill="#FFF6EA" />
      {!cheering && !singing ? (
        <ellipse cx="50" cy="196" rx="14" ry="12" fill="#FFB15A" transform="rotate(18 50 196)" />
      ) : null}
      <circle cx="100" cy="102" r="60" fill="#FF9A3C" />
      <path d="M48 78 66 18 94 68Z" fill="#FF9A3C" />
      <path d="M152 78 134 18 106 68Z" fill="#FF9A3C" />
      <path d="M58 72 70 32 86 64Z" fill="#FFD0DC" />
      <path d="M142 72 130 32 114 64Z" fill="#FFD0DC" />
      <ellipse cx="100" cy="116" rx="38" ry="30" fill="#FFF6EA" />
      <ellipse cx="80" cy={eyeY} rx="9" ry="11" fill="#2A2142" />
      <ellipse cx="120" cy={eyeY} rx="9" ry="11" fill="#2A2142" />
      <circle cx="83" cy={eyeY - 3} r="3" fill="#fff" />
      <circle cx="123" cy={eyeY - 3} r="3" fill="#fff" />
      {thinking ? <path d="M70 84c6-6 12-6 16 0" fill="none" stroke="#2A2142" strokeWidth="3" strokeLinecap="round" /> : null}
      <ellipse cx="62" cy="116" rx="9" ry="5" fill="#FFB4C8" />
      <ellipse cx="138" cy="116" rx="9" ry="5" fill="#FFB4C8" />
      <ellipse cx="100" cy="118" rx="5.5" ry="4" fill="#2A2142" />
      {singing || cheering ? (
        <ellipse cx="100" cy="132" rx="10" ry="8" fill="#2A2142" />
      ) : worried ? (
        <path d="M84 136c10-8 22-8 32 0" fill="none" stroke="#2A2142" strokeWidth="3.2" strokeLinecap="round" />
      ) : thinking ? (
        <path d="M88 132h24" fill="none" stroke="#2A2142" strokeWidth="3.2" strokeLinecap="round" />
      ) : (
        <path d="M84 128c10 12 22 12 32 0" fill="none" stroke="#2A2142" strokeWidth="3.2" strokeLinecap="round" />
      )}
      {waving ? (
        <g className="fox-wave">
          <ellipse cx="162" cy="158" rx="16" ry="13" fill="#FFB15A" transform="rotate(-36 162 158)" />
          <ellipse cx="184" cy="132" rx="15" ry="13" fill="#FFC278" />
        </g>
      ) : null}
      {cheering ? (
        <>
          <ellipse cx="42" cy="150" rx="15" ry="12" fill="#FFB15A" transform="rotate(30 42 150)" />
          <ellipse cx="158" cy="150" rx="15" ry="12" fill="#FFB15A" transform="rotate(-30 158 150)" />
          <path d="M168 46l2.4 6.4 6.6.4-5.2 4.2 1.8 6.4-5.6-3.6-5.6 3.6 1.8-6.4-5.2-4.2 6.6-.4Z" fill="#FFC857" />
        </>
      ) : null}
      {thinking ? <ellipse cx="146" cy="168" rx="14" ry="11" fill="#FFB15A" transform="rotate(-20 146 168)" /> : null}
      {worried ? <ellipse cx="150" cy="188" rx="13" ry="11" fill="#FFB15A" /> : null}
      {mood === 'headphones' ? (
        <>
          <path d="M46 104c0-36 24-60 54-60s54 24 54 60" fill="none" stroke="#3A2D5C" strokeWidth="8" strokeLinecap="round" />
          <rect x="32" y="96" width="20" height="32" rx="8" fill="#7AA7FF" />
          <rect x="148" y="96" width="20" height="32" rx="8" fill="#7AA7FF" />
        </>
      ) : null}
      {singing ? (
        <>
          <g transform="translate(148 150)">
            <rect x="8" y="0" width="18" height="30" rx="9" fill="#5B4A86" />
            <rect x="11" y="4" width="12" height="16" rx="6" fill="#D7CBFF" />
            <path d="M6 16c0 14 22 14 22 0" fill="none" stroke="#5B4A86" strokeWidth="3" />
            <path d="M17 30v14" stroke="#5B4A86" strokeWidth="3" strokeLinecap="round" />
            <path d="M10 44h14" stroke="#5B4A86" strokeWidth="3" strokeLinecap="round" />
          </g>
          <circle className="sparkle" cx="168" cy="48" r="5" fill="#7AA7FF" />
          <path d="M173 48v-16" stroke="#7AA7FF" strokeWidth="3" strokeLinecap="round" />
          <circle className="sparkle" cx="184" cy="70" r="4" fill="#FF8A3D" />
          <path d="M188 70v-12" stroke="#FF8A3D" strokeWidth="2.6" strokeLinecap="round" />
        </>
      ) : null}
    </svg>
  )
}
