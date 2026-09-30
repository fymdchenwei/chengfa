const TONES = ['choice-blue', 'choice-green', 'choice-purple', 'choice-pink'] as const

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
    <div className="grid grid-cols-2 gap-4">
      {choices.map((choice, index) => {
        const revealed = disabled
        const isAnswer = revealed && choice === answer
        const isMiss = revealed && choice === picked && choice !== answer
        const tone = TONES[index % TONES.length]
        return (
          <button
            key={choice}
            type="button"
            disabled={disabled}
            className={`choice-pill ${tone} ${isAnswer ? 'choice-right' : ''} ${isMiss ? 'choice-soft' : ''}`}
            onClick={() => onPick(choice)}
          >
            {choice}
          </button>
        )
      })}
    </div>
  )
}
