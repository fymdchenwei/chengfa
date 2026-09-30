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
        const palette = [
          'bg-gradient-to-b from-[#ffe98a] to-[#ffc44a] shadow-[0_6px_0_#e29a1e]',
          'bg-gradient-to-b from-[#d7ecff] to-[#8ec4ff] shadow-[0_6px_0_#6aa4e4]',
          'bg-gradient-to-b from-[#ffd6ee] to-[#ff9dcb] shadow-[0_6px_0_#e57aaa]',
          'bg-gradient-to-b from-[#d9f8e6] to-[#8ee0b5] shadow-[0_6px_0_#6bc498]',
        ]
        const tone = isAnswer
          ? 'bg-[#b6f3d4] shadow-[0_5px_0_#79d7aa]'
          : isMiss
            ? 'bg-[#ffd0c2] shadow-[0_5px_0_#e7b2a4]'
            : palette[choices.indexOf(choice) % palette.length]
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
