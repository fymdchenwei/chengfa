import { Link } from 'react-router'
import { rhyme } from '../domain/rhyme.ts'
import { tableColor } from '../domain/facts.ts'
import { usePageTitle } from '../hooks/usePageTitle.ts'
import { buttonClass } from '../components/buttonClass.ts'

export function LearnPage() {
  usePageTitle('学习')

  return (
    <div className="flex flex-col gap-4">
      <header>
        <h1 className="text-4xl font-black">学口诀</h1>
        <p className="mt-1 text-lg font-bold text-muted">点一行，看 9 道算式</p>
      </header>
      <ul className="grid gap-3">
        {Array.from({ length: 9 }, (_, index) => {
          const n = index + 1
          return (
            <li key={n}>
              <Link
                to={`/learn/${n}`}
                className="flex min-h-20 items-center gap-3 rounded-[1.6rem] bg-white px-3 py-3 shadow-[0_6px_0_#f0e2d0]"
              >
                <span
                  className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl text-3xl font-black"
                  style={{ backgroundColor: tableColor(n) }}
                >
                  {n}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-2xl font-black">{n} 的口诀</span>
                  <span className="block truncate text-lg font-bold text-muted">{rhyme(n, n)}</span>
                </span>
                <span aria-hidden="true" className="text-3xl font-black">
                  ›
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
      <Link to="/learn/table" className={buttonClass('white', 'lg', 'w-full')}>
        看整张九九表
      </Link>
    </div>
  )
}
