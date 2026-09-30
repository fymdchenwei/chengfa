import { useEffect, useRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { buttonClass } from './buttonClass.ts'

type Variant = 'sun' | 'white' | 'ink' | 'ghost'
type Size = 'md' | 'lg'

export function Button({
  variant = 'sun',
  size = 'lg',
  className = '',
  type = 'button',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return <button type={type} className={buttonClass(variant, size, className)} {...props} />
}

export function Dialog({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean
  title: string
  children: ReactNode
  onClose: () => void
}) {
  const panel = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    panel.current?.focus()
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/45 p-3 sm:items-center">
      <button type="button" aria-label="关闭" className="absolute inset-0 cursor-pointer" onClick={onClose} />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        tabIndex={-1}
        className="app-frame relative z-10 w-full rounded-t-[2rem] bg-cream p-5 shadow-2xl outline-none sm:rounded-[2rem]"
      >
        <h2 id="dialog-title" className="text-2xl font-extrabold">
          {title}
        </h2>
        <div className="mt-3">{children}</div>
      </div>
    </div>
  )
}

export function ProgressBar({ value, max, label }: { value: number; max: number; label: string }) {
  const pct = max <= 0 ? 0 : Math.max(0, Math.min(100, Math.round((value / max) * 100)))
  return (
    <div
      className="h-4 overflow-hidden rounded-full bg-[#ffe3cc]"
      role="progressbar"
      aria-label={label}
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
    >
      <div className="h-full rounded-full bg-gradient-to-r from-[#ffb067] to-[#ff7a2e]" style={{ width: `${pct}%` }} />
    </div>
  )
}

export function Stars({ count, max = 3, size = 'md' }: { count: number; max?: number; size?: 'sm' | 'md' | 'lg' }) {
  const px = size === 'lg' ? 'text-5xl' : size === 'sm' ? 'text-xl' : 'text-2xl'
  const safe = Math.max(0, Math.min(max, count))
  return (
    <p className={`flex gap-1 leading-none ${px}`} aria-label={`${safe} 颗星，满星 ${max} 颗`}>
      {Array.from({ length: max }, (_, index) => (
        <span key={index} aria-hidden="true" className={index < safe ? 'text-[#e3a008]' : 'text-[#e4d5c3]'}>
          ★
        </span>
      ))}
    </p>
  )
}

export function MasteryLegend() {
  const items = [
    { label: '还没练', color: '#FFFFFF' },
    { label: '正在学', color: '#FFE0B5' },
    { label: '越来越熟', color: '#C8F5DE' },
    { label: '掌握了', color: '#FFE38A' },
  ]
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((item) => (
        <li
          key={item.label}
          className="rounded-full px-3 py-1 text-base font-bold ring-1 ring-[#f0e2d0]"
          style={{ backgroundColor: item.color }}
        >
          {item.label}
        </li>
      ))}
    </ul>
  )
}
