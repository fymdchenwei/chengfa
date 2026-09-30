import { useState } from 'react'
import { useNavigate } from 'react-router'
import { ALL_TABLES, tableColor, type AnswerMode } from '../domain/facts.ts'
import { readPracticeSetup, savePracticeSetup } from '../domain/practiceSetup.ts'
import { practiceQuestionCount } from '../domain/startSession.ts'
import { usePageTitle } from '../hooks/usePageTitle.ts'
import { FoxImage } from '../components/FoxImage.tsx'
import { Button } from '../components/ui.tsx'

export function PracticePage() {
  usePageTitle('练习')
  const navigate = useNavigate()
  const saved = readPracticeSetup()
  const [table, setTable] = useState<number | 'mix'>(saved && saved.tables.length > 1 ? 'mix' : (saved?.tables[0] ?? 1))
  const [answer, setAnswer] = useState<AnswerMode>(saved?.answer ?? 'choice')
  const tables = table === 'mix' ? [...ALL_TABLES] : [table]
  const count = practiceQuestionCount(tables)

  return (
    <div className="flex flex-col gap-5">
      <header className="flex items-center justify-between gap-2">
        <div>
          <h1 className="display text-[2rem]">做练习</h1>
          <p className="mt-1 text-base font-bold text-muted">答错的题目，过一会儿还会再出现</p>
        </div>
        <FoxImage mood="think" className="w-28" />
      </header>

      <section>
        <h2 className="text-2xl font-extrabold">想练哪一行？</h2>
        <div className="mt-3 grid grid-cols-5 gap-2">
          {ALL_TABLES.map((n) => {
            const selected = table === n
            return (
              <button
                key={n}
                type="button"
                aria-pressed={selected}
                className="grid min-h-14 cursor-pointer place-items-center rounded-2xl text-2xl font-black ring-2 ring-transparent"
                style={{
                  backgroundColor: tableColor(n),
                  outline: selected ? '3px solid #2A2142' : undefined,
                }}
                onClick={() => setTable(n)}
              >
                {n}
              </button>
            )
          })}
          <button
            type="button"
            aria-pressed={table === 'mix'}
            className={`col-span-5 min-h-14 cursor-pointer rounded-2xl text-xl font-extrabold ${
              table === 'mix' ? 'bg-ink text-white' : 'bg-white'
            }`}
            onClick={() => setTable('mix')}
          >
            混合 1 到 9
          </button>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-extrabold">怎么回答？</h2>
        <div className="mt-3 grid gap-3">
          <button
            type="button"
            aria-pressed={answer === 'choice'}
            className={`min-h-20 rounded-[1.6rem] px-4 text-left ${answer === 'choice' ? 'bg-[#c9e2ff] ring-4 ring-ink' : 'bg-white'}`}
            onClick={() => setAnswer('choice')}
          >
            <span className="block text-2xl font-black">看选项</span>
            <span className="block text-base font-bold text-muted">四个答案里点一个</span>
          </button>
          <button
            type="button"
            aria-pressed={answer === 'input'}
            className={`min-h-20 rounded-[1.6rem] px-4 text-left ${answer === 'input' ? 'bg-[#ffe6a8] ring-4 ring-ink' : 'bg-white'}`}
            onClick={() => setAnswer('input')}
          >
            <span className="block text-2xl font-black">自己填</span>
            <span className="block text-base font-bold text-muted">用大按钮写出得数</span>
          </button>
        </div>
      </section>

      <Button
        className="w-full"
        onClick={() => {
          savePracticeSetup({ tables, answer })
          void navigate('/practice/run')
        }}
      >
        开始 {count} 题
      </Button>
    </div>
  )
}
