import { useId, type ReactNode } from 'react'

function GradientIcon({
  className,
  from,
  to,
  children,
}: {
  className: string
  from: string
  to: string
  children: ReactNode
}) {
  const id = useId().replace(/:/g, '')
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={from} />
          <stop offset="100%" stopColor={to} />
        </linearGradient>
      </defs>
      <g fill={`url(#${id})`}>{children}</g>
    </svg>
  )
}

export function IconHome({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <GradientIcon className={className} from="#ffb067" to="#ff5d7a">
      <path d="M4 11.2 12 4l8 7.2V20a1 1 0 0 1-1 1h-5.2v-6.2H10.2V21H5a1 1 0 0 1-1-1z" />
    </GradientIcon>
  )
}

export function IconBook({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <GradientIcon className={className} from="#8ec4ff" to="#5b6dff">
      <path d="M6 4.2h11.2A1.8 1.8 0 0 1 19 6v13.4H7.2A2.2 2.2 0 0 0 5 21.6V6.4A2.2 2.2 0 0 1 7.2 4.2H6z" />
      <path fill="#fff" d="M8.1 8h6.6v1.7H8.1zm0 3.3h6.6V13H8.1z" />
    </GradientIcon>
  )
}

export function IconPencil({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <GradientIcon className={className} from="#7eecc0" to="#1faf72">
      <path d="M14.2 4.2 19.8 9.8 8.6 21H3v-5.6z" />
    </GradientIcon>
  )
}

export function IconTrophy({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <GradientIcon className={className} from="#ffe08a" to="#ff8a2a">
      <path d="M8 3h8v2h2.2A3.2 3.2 0 0 1 16 8.6 5 5 0 0 1 12.9 13H11v2.2H15V18H9v-2.8h3.9V13h-1.8A5 5 0 0 1 8 8.6 3.2 3.2 0 0 1 5.8 5H8z" />
      <path d="M5.2 5.2h2.2v1.6A2.4 2.4 0 0 1 5.2 5.2zM16.6 5.2h2.2A2.4 2.4 0 0 1 16.6 6.8z" />
    </GradientIcon>
  )
}

export function IconStar({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <GradientIcon className={className} from="#ffe56a" to="#ffb703">
      <path d="m12 2.6 2.4 5.7 6.2.6-4.7 4 1.4 6.1L12 16.4 6.7 19l1.4-6.1-4.7-4 6.2-.6z" />
    </GradientIcon>
  )
}

export function IconNote({ className = 'inline h-5 w-5 align-[-0.15em]' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width="1.15em" height="1.15em" className={`inline align-[-0.15em] ${className}`} aria-hidden="true">
      <path fill="#7c5cff" d="M9 17.6a2.4 2.4 0 1 1-1.7-2.3V6.1l9.2-2v9.2a2.4 2.4 0 1 1-1.7-2.3V6.6L9 8.2v9.4z" />
    </svg>
  )
}

export function IconArrow({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M9 6.5 15.5 12 9 17.5" fill="none" stroke="#7c5cff" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function IconClose({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M7 7l10 10M17 7 7 17" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  )
}

export function IconTurtle({ className = 'h-7 w-7' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <ellipse cx="12" cy="13" rx="7" ry="5.2" fill="#3dcb8e" />
      <circle cx="17.2" cy="11.2" r="2.1" fill="#7eecc0" />
      <path d="M6.2 16.2 4 18.2M9 17.4 8 20M15 17.4l1 2.6M17.8 15.2 20 17" stroke="#1f8f62" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

export function IconRabbit({ className = 'h-7 w-7' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M8.2 11c.2-4 1.4-7.2 2.2-7.2.6 0 1 1.6.8 4.2" fill="#ffd0ea" stroke="#ff7aab" strokeWidth="1.2" />
      <path d="M13.2 8.2c.4-3.2 1.2-5.4 1.9-5.4.7 0 1.2 2.2 1.1 5" fill="#ffd0ea" stroke="#ff7aab" strokeWidth="1.2" />
      <ellipse cx="12.2" cy="14.2" rx="5.2" ry="4.4" fill="#fff" stroke="#ff7aab" strokeWidth="1.3" />
      <circle cx="10.4" cy="13.6" r="0.7" fill="#2a2142" />
      <circle cx="14.2" cy="13.6" r="0.7" fill="#2a2142" />
    </svg>
  )
}
