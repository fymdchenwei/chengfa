import { Link } from 'react-router'
import { isIos, runningStandalone } from '../domain/platform.ts'
import { summarizeMastery } from '../domain/srs.ts'
import { usePageTitle } from '../hooks/usePageTitle.ts'
import { useProgress } from '../hooks/useProgress.ts'
import { Mascot } from '../components/Mascot.tsx'
import { Button, ProgressBar } from '../components/ui.tsx'

export function HomePage() {
  usePageTitle('乘法')
  const { data, dismissTip } = useProgress()
  const summary = summarizeMastery(data.cards)
  const showTip = !data.tipDismissed && !runningStandalone()

  return (
    <div className="flex flex-col gap-4">
      <header className="flex items-center gap-3">
        <Mascot mood={summary.mastered > 0 ? 'cheer' : 'happy'} />
        <div>
          <h1 className="text-5xl font-black tracking-tight">乘法</h1>
          <p className="mt-1 text-lg font-bold text-muted">九九乘法表，一起记住</p>
        </div>
      </header>

      <section className="rounded-[1.8rem] bg-white p-4 shadow-[0_8px_0_rgba(42,33,66,0.05)]">
        <p className="text-lg font-extrabold">已经掌握 {summary.mastered} / {summary.total} 道题</p>
        <div className="mt-3">
          <ProgressBar value={summary.mastered} max={summary.total} label="已掌握的题目" />
        </div>
        <p className="mt-3 text-base font-bold text-muted">
          {summary.mastered === 0 ? '还没有掌握的题目，我们从 1 的口诀开始。' : `还有 ${summary.learning} 道正在学。`}
        </p>
      </section>

      <div className="grid gap-3">
        <HomeLink to="/learn" title="学口诀" detail="一边看，一边读" className="bg-[#ffe6a8] shadow-[0_6px_0_#e6c56a]" />
        <HomeLink to="/practice" title="做练习" detail="选答案，或者自己写" className="bg-[#c9e2ff] shadow-[0_6px_0_#9fc4ef]" />
        <HomeLink to="/challenge" title="去闯关" detail="一关一关，收集星星" className="bg-[#ffd0ea] shadow-[0_6px_0_#e7a8c8]" />
      </div>

      {showTip ? (
        <section className="rounded-[1.8rem] bg-white p-4">
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

function HomeLink({ to, title, detail, className }: { to: string; title: string; detail: string; className: string }) {
  return (
    <Link
      to={to}
      className={`flex min-h-20 items-center justify-between rounded-[1.6rem] px-5 py-4 text-ink active:translate-y-1 ${className}`}
    >
      <span>
        <span className="block text-2xl font-black">{title}</span>
        <span className="block text-base font-bold">{detail}</span>
      </span>
      <span aria-hidden="true" className="text-3xl font-black">
        ›
      </span>
    </Link>
  )
}
