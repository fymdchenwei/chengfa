import { Link } from 'react-router'
import { isIos, runningStandalone } from '../domain/platform.ts'
import { summarizeMastery } from '../domain/srs.ts'
import { usePageTitle } from '../hooks/usePageTitle.ts'
import { useProgress } from '../hooks/useProgress.ts'
import { buttonClass } from '../components/buttonClass.ts'
import { Fox } from '../components/Fox.tsx'
import { Button, ProgressBar } from '../components/ui.tsx'

export function HomePage() {
  usePageTitle('乘法')
  const { data, dismissTip } = useProgress()
  const summary = summarizeMastery(data.cards)
  const showTip = !data.tipDismissed && !runningStandalone()

  return (
    <div className="flex flex-col gap-4">
      <header className="flex items-center gap-3">
        <Fox mood="wave" className="h-28 w-28" />
        <div>
          <h1 className="text-5xl font-black tracking-tight">乘法</h1>
          <p className="mt-1 text-lg font-bold text-muted">九九乘法表，一起记住</p>
        </div>
      </header>

      <section className="rounded-[1.8rem] bg-white/95 p-4 shadow-[0_10px_0_rgb(255,214,186)]">
        <div className="flex items-start gap-3">
          <svg viewBox="0 0 24 24" className="star-bounce h-10 w-10 shrink-0 fill-[#ffc857]" aria-hidden="true">
            <path d="m12 2 2.6 6.6L22 11l-7.4 2.4L12 20l-2.6-6.6L2 11l7.4-2.4Z" />
          </svg>
          <div className="min-w-0 flex-1">
            <p className="text-lg font-extrabold">
              已经掌握 {summary.mastered} / {summary.total} 道题
            </p>
            <div className="mt-3">
              <ProgressBar value={summary.mastered} max={summary.total} label="已掌握的题目" />
            </div>
            <p className="mt-3 text-base font-bold text-muted">
              {summary.mastered === 0 ? '还没有掌握的题目，我们从 1 的口诀开始。' : `还有 ${summary.learning} 道正在学。`}
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-3">
        <HomeLink to="/learn/1" title="学口诀" detail="一边看，一边读" variant="yellow" />
        <HomeLink to="/practice" title="做练习" detail="选答案，或者自己写" variant="blue" />
        <HomeLink to="/challenge" title="去闯关" detail="一关一关，收集星星" variant="pink" />
      </div>

      {showTip ? (
        <section className="rounded-[1.8rem] bg-white/95 p-4">
          <h2 className="text-xl font-extrabold">放到手机桌面上</h2>
          <p className="mt-2 text-base font-bold leading-relaxed text-muted">
            {isIos()
              ? 'iPhone 和 iPad 请用 Safari 打开。点分享按钮，再点「添加到主屏幕」。放好以后，没有网络也能练习。'
              : '用浏览器菜单里的「添加到主屏幕」或「安装应用」。放好以后，没有网络也能练习。'}
          </p>
          <Button className="mt-3 w-full" variant="white" onClick={dismissTip}>
            知道了
          </Button>
        </section>
      ) : null}
    </div>
  )
}

function HomeLink({
  to,
  title,
  detail,
  variant,
}: {
  to: string
  title: string
  detail: string
  variant: 'yellow' | 'blue' | 'pink'
}) {
  return (
    <Link to={to} className={buttonClass(variant, 'lg', 'min-h-[4.6rem] w-full justify-between px-5')}>
      <span className="text-left">
        <span className="block text-2xl font-black">{title}</span>
        <span className="block text-base font-bold">{detail}</span>
      </span>
      <span aria-hidden="true" className="text-3xl font-black">
        ›
      </span>
    </Link>
  )
}
