export function isIos(): boolean {
  if (typeof navigator === 'undefined') return false
  const nav = navigator as Navigator & { platform?: string; maxTouchPoints?: number }
  return /iPad|iPhone|iPod/.test(nav.userAgent) || (nav.platform === 'MacIntel' && (nav.maxTouchPoints ?? 0) > 1)
}

/** 竖屏且宽度像手机时，提示横过来。不锁定方向，也不旋转页面。 */
export function needsRotatePrompt(width: number, height: number): boolean {
  return width <= 520 && height > width
}

export function runningStandalone(): boolean {
  if (typeof window === 'undefined') return false
  const nav = window.navigator as Navigator & { standalone?: boolean }
  return window.matchMedia('(display-mode: standalone)').matches || nav.standalone === true
}
