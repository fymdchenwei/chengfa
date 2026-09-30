export function SoundWaves({ active, className = 'h-5 w-5' }: { active: boolean; className?: string }) {
  return (
    <span className={`inline-flex items-end justify-center gap-0.5 ${className}`} aria-hidden="true">
      {[8, 14, 10, 16].map((height) => (
        <span
          key={height}
          className={`w-1 rounded-full bg-current ${active ? 'sound-wave' : ''}`}
          style={{ height: active ? height : Math.max(6, height - 6) }}
        />
      ))}
    </span>
  )
}
