export function ChoiceGrid({
  choices,
  disabled,
  picked,
  answer,
  onPick,
}: {
  choices: readonly number[]
  disabled: boolean
  picked: number | null
  answer: number
  onPick: (value: number) => void
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {choices.map((choice) => {
        const revealed = disabled
        const isAnswer = revealed && choice === answer
        const isMiss = revealed && choice === picked && choice !== answer
        const tone = isAnswer ? 'bg-[#b6f3d4] shadow-[0_5px_0_#79d7aa]' : isMiss ? 'bg-[#ffd0c2] shadow-[0_5px_0_#e7b2a4]' : 'bg-white shadow-[0_5px_0_#e7d7c3]'
        return (
          <button
            key={choice}
            type="button"
            disabled={disabled}
            className={`min-h-24 cursor-pointer select-none rounded-[1.6rem] text-4xl font-black active:translate-y-1 active:shadow-none disabled:active:translate-y-0 ${tone}`}
            onClick={() => onPick(choice)}
          >
            {choice}
          </button>
        )
      })}
    </div>
  )
}
