import { Link } from 'react-router'
import { usePageTitle } from '../hooks/usePageTitle.ts'
import { Mascot } from '../components/Mascot.tsx'
import { buttonClass } from '../components/buttonClass.ts'

export function NotFoundPage() {
  usePageTitle('找不到')
  return (
    <div className="flex flex-col items-start gap-4">
      <Mascot mood="think" />
      <h1 className="text-4xl font-black">这里没有页面</h1>
      <p className="text-lg font-bold text-muted">回首页继续学乘法吧。</p>
      <Link to="/" className={buttonClass()}>
        回首页
      </Link>
    </div>
  )
}
