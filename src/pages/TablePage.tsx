import { useState } from 'react'
import { Link } from 'react-router'
import { equationText, factId, type Fact } from '../domain/facts.ts'
import { rhyme, spokenAnswer } from '../domain/rhyme.ts'
import { masteryLabel, masteryOf } from '../domain/srs.ts'
import { usePageTitle } from '../hooks/usePageTitle.ts'
import { useProgress } from '../hooks/useProgress.ts'
import { FactGrid } from '../components/FactGrid.tsx'
import { SpeakerButton } from '../components/SpeakerButton.tsx'
import { Dialog, MasteryLegend } from '../components/ui.tsx'

export function TablePage() {
  usePageTitle('九九表')
  const { data } = useProgress()
  const [picked, setPicked] = useState<Fact | null>(null)
  const card = picked ? data.cards[factId(picked.a, picked.b)] : undefined

  return (
    <div className="flex flex-col gap-4">
      <Link to="/learn" className="inline-flex min-h-12 items-center text-lg font-extrabold">
        ‹ 全部口诀
      </Link>
      <header>
        <h1 className="text-4xl font-black">整张九九表</h1>
        <p className="mt-1 text-lg font-bold text-muted">点一格，看算式和口诀</p>
      </header>
      <MasteryLegend />
      <FactGrid cards={data.cards} onPick={setPicked} />
      <Dialog open={picked != null} title={picked ? equationText(picked.a, picked.b) : ''} onClose={() => setPicked(null)}>
        {picked ? (
          <div className="flex flex-col gap-3">
            <p className="text-3xl font-black">{rhyme(picked.a, picked.b)}</p>
            <p className="text-lg font-bold text-muted">{masteryLabel(masteryOf(card))}</p>
            <div className="flex items-center justify-between gap-3">
              <SpeakerButton text={spokenAnswer(picked.a, picked.b)} enabled={data.speechOn} />
              <button type="button" className="min-h-16 flex-1 rounded-full bg-coral text-xl font-extrabold" onClick={() => setPicked(null)}>
                关闭
              </button>
            </div>
          </div>
        ) : null}
      </Dialog>
    </div>
  )
}
