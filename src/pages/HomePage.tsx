import { Link } from 'react-router'
import { HOME_LEVEL_TOTAL, passedLevelCount, suggestTable, totalStars } from '../domain/home.ts'
import { usePageTitle } from '../hooks/usePageTitle.ts'
import { useProgress } from '../hooks/useProgress.ts'
import { FoxImage } from '../components/FoxImage.tsx'
import { IconArrow, IconBook, IconNote, IconPencil, IconTrophy } from '../components/icons.tsx'

export function HomePage() {
  usePageTitle('乘法乐园')
  const { data } = useProgress()
  const stars = totalStars(data.levels)
  const passed = passedLevelCount(data.levels)
  const table = suggestTable(data.cards)

  return (
    <div className="flex min-h-[calc(100dvh-8rem)] flex-col gap-2">
      <header className="flex items-start justify-between gap-3">
        <h1 className="park-title">
          <span className="park-stroke" aria-hidden="true">
            乘法乐园
          </span>
          <span className="park-fill">乘法乐园</span>
        </h1>
        <Link to="/me" className="star-chip" aria-label={`星星 ${stars}`}>
          <svg viewBox="0 0 24 24" className="star-bounce h-7 w-7 fill-[#ffc857]" aria-hidden="true">
            <path d="m12 2.5 2.5 6.2 6.6.6-5 4.3 1.5 6.4L12 16.7 6.4 20l1.5-6.4-5-4.3 6.6-.6Z" />
          </svg>
          <span className="text-lg">{stars}</span>
        </Link>
      </header>

      <div className="flex flex-col items-center">
        <FoxImage mood="happy" className="w-[62vw] max-w-[16rem]" />
        <Link to={`/learn/${table}`} className="speech-bubble -mt-1 max-w-[18rem] px-4 py-2.5 text-center text-base font-black leading-snug">
          嗨！今天我们一起练<span className="bubble-num">{table}</span>的口诀吧
          <IconNote className="ml-1" />
        </Link>
      </div>

      <div className="mt-auto grid gap-2 pb-1">
        <Link to={`/learn/${table}`} className="home-cta home-cta-blue">
          <span className="home-ico">
            <IconBook className="h-7 w-7" />
          </span>
          <span className="min-w-0 flex-1 text-left">
            <span className="block text-xl font-black leading-tight">学口诀</span>
            <span className="block text-xs font-extrabold text-white/90">跟着小狐狸读一读</span>
          </span>
          <span className="home-arrow">
            <IconArrow />
          </span>
        </Link>
        <Link to="/practice" className="home-cta home-cta-green">
          <span className="home-ico">
            <IconPencil className="h-7 w-7" />
          </span>
          <span className="min-w-0 flex-1 text-left">
            <span className="block text-xl font-black leading-tight">练一练</span>
            <span className="block text-xs font-extrabold text-white/90">答对有星星</span>
          </span>
          <span className="home-arrow">
            <IconArrow />
          </span>
        </Link>
        <Link to="/challenge" className="home-cta home-cta-orange">
          <span className="home-ico">
            <IconTrophy className="h-7 w-7" />
          </span>
          <span className="min-w-0 flex-1 text-left">
            <span className="block text-xl font-black leading-tight">闯关</span>
            <span className="block text-xs font-extrabold text-white/90">
              已通过 {passed} / {HOME_LEVEL_TOTAL} 关
            </span>
          </span>
          <span className="home-arrow">
            <IconArrow />
          </span>
        </Link>
      </div>
    </div>
  )
}
