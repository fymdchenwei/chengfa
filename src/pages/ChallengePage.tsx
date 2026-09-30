import { Link } from 'react-router'
import { isLevelUnlocked, LEVELS } from '../domain/levels.ts'
import { usePageTitle } from '../hooks/usePageTitle.ts'
import { useProgress } from '../hooks/useProgress.ts'
import { FoxImage } from '../components/FoxImage.tsx'
import { Stars } from '../components/ui.tsx'

export function ChallengePage() {
  usePageTitle('闯关')
  const { data } = useProgress()
  const stars = LEVELS.map((level) => data.levels[level.id]?.stars ?? 0)

  return (
    <div className="flex flex-col gap-4">
      <header className="flex items-center justify-between gap-2">
        <div>
          <h1 className="display text-[2rem]">闯关</h1>
          <p className="mt-1 text-base font-bold text-muted">拿到星星，就能打开下一关</p>
        </div>
        <FoxImage mood="cheer" className="w-28" />
      </header>
      <ul className="grid gap-3">
        {LEVELS.map((level, index) => {
          const unlocked = isLevelUnlocked(index, stars)
          const earned = stars[index] ?? 0
          const meta = level.kind === 'timed' ? '60 秒' : `${level.count} 道题`
          const body = (
            <>
              <span className="flex items-start justify-between gap-3">
                <span>
                  <span className="block text-2xl font-black">{level.title}</span>
                  <span className="mt-1 block text-base font-bold text-muted">
                    {meta} · {level.blurb}
                  </span>
                </span>
                <Stars count={earned} size="sm" />
              </span>
              {!unlocked ? <span className="mt-2 inline-flex rounded-full bg-[#ffe6a8] px-3 py-1 text-base font-extrabold">还没打开</span> : null}
            </>
          )
          return (
            <li key={level.id}>
              {unlocked ? (
                <Link to={`/challenge/${level.id}`} className="block rounded-[1.6rem] bg-white p-4 shadow-[0_6px_0_#f0e2d0]">
                  {body}
                </Link>
              ) : (
                <div className="rounded-[1.6rem] bg-white/80 p-4" aria-disabled="true">
                  {body}
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
