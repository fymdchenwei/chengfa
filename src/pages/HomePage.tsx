import { Link } from 'react-router'
import { LEVELS } from '../domain/levels.ts'
import { passedLevelCount, suggestTable, totalStars } from '../domain/home.ts'
import { isIos, runningStandalone } from '../domain/platform.ts'
import { usePageTitle } from '../hooks/usePageTitle.ts'
import { useProgress } from '../hooks/useProgress.ts'
import { Fox } from '../components/Fox.tsx'

export function HomePage() {
  usePageTitle('乘法乐园')
  const { data, dismissTip } = useProgress()
  const stars = totalStars(data.levels)
  const passed = passedLevelCount(data.levels)
  const table = suggestTable(data.cards)
  const showTip = !data.tipDismissed && !runningStandalone()

  return (
    <div className="flex min-h-[calc(100dvh-7.2rem)] flex-col">
      <header className="flex items-start justify-between gap-3">
        <h1 className="display text-[2.35rem]">乘法乐园</h1>
        <Link to="/me" className="star-chip" aria-label={`星星 ${stars}`}>
          <svg viewBox="0 0 24 24" className="star-bounce h-7 w-7 fill-[#ffc857]" aria-hidden="true">
            <path d="m12 2.5 2.5 6.2 6.6.6-5 4.3 1.5 6.4L12 16.7 6.4 20l1.5-6.4-5-4.3 6.6-.6Z" />
          </svg>
          <span className="text-lg">{stars}</span>
        </Link>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center pb-2">
        <Fox mood="wave" className="h-64 w-52" />
        <Link to={`/learn/${table}`} className="speech-bubble -mt-1 max-w-[17.5rem] px-4 py-3 text-center text-lg font-black leading-snug">
          今天我们一起练 {table} 的口诀吧！
        </Link>
      </div>

      <div className="grid gap-3 pb-1">
        <Link to="/practice" className="mint-cta">
          <span className="text-2xl font-black">练一练</span>
          <span className="text-sm font-extrabold">答对有星星</span>
        </Link>
        <Link to="/challenge" className="progress-pill text-lg">
          已通过 {passed} / {LEVELS.length} 关
        </Link>
        {showTip ? (
          <button type="button" className="install-hint" onClick={dismissTip}>
            <span>
              {isIos()
                ? '用 Safari 的分享，添加到主屏幕，离线也能练'
                : '用浏览器「添加到主屏幕」，离线也能练'}
            </span>
            <span className="grid h-7 w-7 place-items-center rounded-full bg-white text-base" aria-hidden="true">
              ×
            </span>
            <span className="sr-only">关掉提示</span>
          </button>
        ) : null}
      </div>
    </div>
  )
}
