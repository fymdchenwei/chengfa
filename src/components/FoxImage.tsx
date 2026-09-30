const FILES = {
  happy: 'fox-happy.svg',
  sing: 'fox-sing.svg',
  think: 'fox-think.svg',
  cheer: 'fox-cheer.svg',
  listen: 'fox-listen.svg',
} as const

export type FoxArt = keyof typeof FILES

export function FoxImage({ mood, className = '' }: { mood: FoxArt; className?: string }) {
  return (
    <img
      src={`${import.meta.env.BASE_URL}fox/${FILES[mood]}`}
      alt=""
      aria-hidden="true"
      draggable={false}
      className={`fox-bob pointer-events-none h-auto shrink-0 select-none ${className}`}
    />
  )
}
