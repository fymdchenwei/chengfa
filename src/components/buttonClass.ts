type Variant = 'sun' | 'white' | 'ink' | 'ghost' | 'yellow' | 'blue' | 'pink'
type Size = 'md' | 'lg'

const VARIANTS: Record<Variant, string> = {
  sun: 'candy candy-orange',
  white: 'candy candy-white',
  ink: 'candy candy-ink',
  ghost: 'bg-transparent text-ink shadow-none',
  yellow: 'candy candy-yellow',
  blue: 'candy candy-blue',
  pink: 'candy candy-pink',
}

export function buttonClass(variant: Variant = 'sun', size: Size = 'lg', className = ''): string {
  const height = size === 'lg' ? 'min-h-16 px-5 text-xl' : 'min-h-12 px-4 text-lg'
  return [
    'inline-flex cursor-pointer select-none items-center justify-center gap-2 rounded-full text-center font-extrabold',
    'transition-transform active:translate-y-1 active:shadow-none',
    'disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:active:translate-y-0',
    'focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-ink',
    height,
    VARIANTS[variant],
    className,
  ].join(' ')
}
