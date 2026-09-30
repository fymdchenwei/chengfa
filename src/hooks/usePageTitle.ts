import { useEffect } from 'react'

export function usePageTitle(title: string): void {
  useEffect(() => {
    document.title = title === '乘法' ? '乘法' : `${title} · 乘法`
  }, [title])
}
