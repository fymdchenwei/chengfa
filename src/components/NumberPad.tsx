const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '删', '0', '确定'] as const

export function NumberPad({
  disabled,
  onDigit,
  onDelete,
  onSubmit,
}: {
  disabled?: boolean
  onDigit: (digit: string) => void
  onDelete: () => void
  onSubmit: () => void
}) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {KEYS.map((key) => {
        const isSubmit = key === '确定'
        const isDelete = key === '删'
        return (
          <button
            key={key}
            type="button"
            disabled={disabled}
            className={`min-h-16 cursor-pointer select-none rounded-3xl font-black active:translate-y-1 active:shadow-none disabled:opacity-50 ${
              isSubmit
                ? 'bg-coral text-2xl shadow-[0_5px_0_#d26522]'
                : 'bg-white text-3xl shadow-[0_5px_0_#e7d7c3]'
            }`}
            onClick={() => {
              if (isSubmit) onSubmit()
              else if (isDelete) onDelete()
              else onDigit(key)
            }}
          >
            {key}
          </button>
        )
      })}
    </div>
  )
}
