import { useState } from 'react'
import { Link } from 'react-router'
import { equationText, factId, type Fact } from '../domain/facts.ts'
import { LEVELS } from '../domain/levels.ts'
import { rhyme, spokenRhyme } from '../domain/rhyme.ts'
import { answerTotals, masteryLabel, masteryOf, summarizeMastery, weakFacts } from '../domain/srs.ts'
import { usePageTitle } from '../hooks/usePageTitle.ts'
import { useProgress } from '../hooks/useProgress.ts'
import { FactGrid } from '../components/FactGrid.tsx'
import { buttonClass } from '../components/buttonClass.ts'
import { Mascot } from '../components/Mascot.tsx'
import { SpeakerButton } from '../components/SpeakerButton.tsx'
import { Button, Dialog, MasteryLegend, Stars } from '../components/ui.tsx'

export function ProgressPage() {
  usePageTitle('进步')
  const { data, setSound, setSpeech, resetProgress } = useProgress()
  const summary = summarizeMastery(data.cards)
  const totals = answerTotals(data.cards)
  const weak = weakFacts(data.cards, 4)
  const [picked, setPicked] = useState<Fact | null>(null)
  const [confirmReset, setConfirmReset] = useState(false)
  const starCount = LEVELS.reduce((sum, level) => sum + (data.levels[level.id]?.stars ?? 0), 0)
  const pickedCard = picked ? data.cards[factId(picked.a, picked.b)] : undefined

  return (
    <div className="flex flex-col gap-4">
      <header className="flex items-center gap-3">
        <Mascot mood={summary.mastered === 81 ? 'cheer' : summary.fresh === 81 ? 'think' : 'happy'} />
        <div>
          <h1 className="text-4xl font-black">我的进步</h1>
          <p className="text-lg font-bold text-muted">记录只在这台设备上</p>
        </div>
      </header>

      <section className="grid grid-cols-3 gap-2">
        <Stat label="掌握了" value={summary.mastered} />
        <Stat label="正在学" value={summary.learning} />
        <Stat label="还没练" value={summary.fresh} />
      </section>

      <section className="rounded-[1.6rem] bg-white p-4">
        <p className="text-lg font-extrabold">累计答对 {totals.correct} 题</p>
        <p className="mt-1 text-base font-bold text-muted">一共做过 {totals.correct + totals.wrong} 题</p>
        <p className="mt-3 text-lg font-extrabold">关卡星星 {starCount} / {LEVELS.length * 3}</p>
      </section>

      {summary.mastered === 81 ? (
        <section className="rounded-[1.6rem] bg-[#ffe38a] p-4">
          <p className="text-2xl font-black">九九乘法表都被你记住啦！</p>
        </section>
      ) : weak.length > 0 ? (
        <section>
          <h2 className="text-2xl font-extrabold">这些还要再练</h2>
          <ul className="mt-3 grid gap-2">
            {weak.map((card) => (
              <li key={factId(card.a, card.b)} className="flex items-center justify-between gap-3 rounded-[1.4rem] bg-white px-4 py-3">
                <div>
                  <p className="text-2xl font-black">{equationText(card.a, card.b)}</p>
                  <p className="text-lg font-bold text-muted">{rhyme(card.a, card.b)} · {masteryLabel(masteryOf(card))}</p>
                </div>
                <SpeakerButton text={spokenRhyme(card.a, card.b)} enabled={data.speechOn} />
              </li>
            ))}
          </ul>
        </section>
      ) : summary.fresh === 81 ? (
        <section className="rounded-[1.6rem] bg-white p-4">
          <p className="text-xl font-extrabold">还没有练习记录</p>
          <p className="mt-1 text-base font-bold text-muted">先去看口诀，或者做一关。</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Link to="/learn" className="grid min-h-14 place-items-center rounded-full bg-[#ffe6a8] text-lg font-extrabold">
              去学习
            </Link>
            <Link to="/challenge" className="grid min-h-14 place-items-center rounded-full bg-[#ffd0ea] text-lg font-extrabold">
              去闯关
            </Link>
          </div>
        </section>
      ) : (
        <section className="rounded-[1.6rem] bg-white p-4">
          <p className="text-xl font-extrabold">练过的题都记住了</p>
          <p className="mt-1 text-base font-bold text-muted">还有 {summary.fresh} 道还没碰到，可以去闯关。</p>
        </section>
      )}

      <section>
        <h2 className="text-2xl font-extrabold">每一道题</h2>
        <div className="mt-3">
          <MasteryLegend />
        </div>
        <div className="mt-3">
          <FactGrid cards={data.cards} onPick={setPicked} />
        </div>
      </section>

      <section className="grid gap-2">
        <Toggle label="音效" on={data.soundOn} onToggle={() => setSound(!data.soundOn)} />
        <Toggle label="朗读" on={data.speechOn} onToggle={() => setSpeech(!data.speechOn)} />
      </section>

      <Link to="/voice" className={buttonClass('pink', 'lg', 'w-full')}>
        语音设置
      </Link>

      <section>
        <h2 className="text-2xl font-extrabold">各关星星</h2>
        <ul className="mt-3 grid grid-cols-4 gap-2">
          {LEVELS.map((level) => (
            <li key={level.id} className="rounded-2xl bg-white px-2 py-3 text-center">
              <p className="text-base font-extrabold">{level.short}</p>
              <div className="mt-1 flex justify-center">
                <Stars count={data.levels[level.id]?.stars ?? 0} size="sm" />
              </div>
            </li>
          ))}
        </ul>
      </section>

      <Button variant="white" className="w-full" onClick={() => setConfirmReset(true)}>
        清空进度
      </Button>

      <Dialog open={picked != null} title={picked ? equationText(picked.a, picked.b) : ''} onClose={() => setPicked(null)}>
        {picked ? (
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-3xl font-black">{rhyme(picked.a, picked.b)}</p>
              <p className="mt-1 text-lg font-bold text-muted">{masteryLabel(masteryOf(pickedCard))}</p>
            </div>
            <SpeakerButton text={spokenRhyme(picked.a, picked.b)} enabled={data.speechOn} />
          </div>
        ) : null}
      </Dialog>

      <Dialog open={confirmReset} title="清空练习记录？" onClose={() => setConfirmReset(false)}>
        <p className="text-lg font-bold text-muted">星星和做过的题目都会消失，口诀还在。</p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button variant="white" onClick={() => setConfirmReset(false)}>
            再想想
          </Button>
          <Button
            onClick={() => {
              resetProgress()
              setConfirmReset(false)
            }}
          >
            清空
          </Button>
        </div>
      </Dialog>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[1.4rem] bg-white px-2 py-3 text-center">
      <p className="text-3xl font-black">{value}</p>
      <p className="text-base font-bold text-muted">{label}</p>
    </div>
  )
}

function Toggle({ label, on, onToggle }: { label: string; on: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onToggle}
      className="flex min-h-16 w-full cursor-pointer items-center justify-between rounded-[1.4rem] bg-white px-4"
    >
      <span className="text-xl font-extrabold">{label}</span>
      <span className={`rounded-full px-4 py-2 text-lg font-extrabold ${on ? 'bg-[#b6f3d4]' : 'bg-[#f0e2d0]'}`}>{on ? '开' : '关'}</span>
    </button>
  )
}
