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
                className="flex items-center gap-3 rounded-[1.4rem] bg-white px-3 py-2.5 shadow-[0_5px_0_#f0e2d0]"
              >
                <span
                  className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-2xl font-black"
                  style={{ backgroundColor: tableColor(n) }}
                >
                  {n}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xl font-black">{n} 的口诀</span>
                  <span className="mt-1 flex items-center gap-2 whitespace-nowrap">
                    <span className="text-base font-extrabold">
                      {n} × {n} = {n * n}
                    </span>
                    <span className="rounded-full bg-[#ffe6a8] px-2 py-0.5 text-sm font-black">{rhyme(n, n)}</span>
                  </span>
                </span>
                <span aria-hidden="true" className="text-2xl font-black text-muted">
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
