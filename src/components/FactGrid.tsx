import { ALL_TABLES, factId, type Fact } from '../domain/facts.ts'
import { masteryLabel, masteryOf, MASTERY_COLORS, type SrsCard } from '../domain/srs.ts'

export function FactGrid({ cards, onPick }: { cards: Record<string, SrsCard>; onPick: (fact: Fact) => void }) {
  return (
    <div className="overflow-x-auto pb-1">
      <div className="min-w-[22rem]">
        <div className="mb-1 grid grid-cols-[1.6rem_repeat(9,minmax(0,1fr))] gap-1 text-sm font-extrabold text-muted">
          <span />
          {ALL_TABLES.map((n) => (
            <span key={n} className="grid place-items-center">
              {n}
            </span>
          ))}
        </div>
        {ALL_TABLES.map((a) => (
          <div key={a} className="mb-1 grid grid-cols-[1.6rem_repeat(9,minmax(0,1fr))] gap-1">
            <div className="grid place-items-center text-sm font-extrabold">{a}</div>
            {ALL_TABLES.map((b) => {
              const level = masteryOf(cards[factId(a, b)])
              return (
                <button
                  key={b}
                  type="button"
                  className="grid min-h-9 cursor-pointer place-items-center rounded-lg text-sm font-extrabold ring-1 ring-[#f0e2d0]"
                  style={{ backgroundColor: MASTERY_COLORS[level] }}
                  aria-label={`${a}乘${b}等于${a * b}，${masteryLabel(level)}`}
                  onClick={() => onPick({ a, b })}
                >
                  {a * b}
                </button>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
