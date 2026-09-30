const DIGITS = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'] as const

export function numberToZh(value: number): string {
  if (!Number.isInteger(value) || value < 0 || value > 99) return String(value)
  if (value < 10) return DIGITS[value] ?? String(value)
  if (value === 10) return '十'
  if (value < 20) return `十${DIGITS[value % 10]}`
  const tens = Math.floor(value / 10)
  const ones = value % 10
  return `${DIGITS[tens]}十${ones === 0 ? '' : DIGITS[ones]}`
}

/**
 * 传统乘法口诀：小数在前。
 * 得数是一位数时用「得」；二五得十说成「二五一十」；
 * 十几会省掉「一」，例如「三四十二」而不是「三四一十二」。
 */
export function rhyme(a: number, b: number): string {
  const left = Math.min(a, b)
  const right = Math.max(a, b)
  const head = `${DIGITS[left]}${DIGITS[right]}`
  const product = left * right
  if (product < 10) return `${head}得${DIGITS[product]}`
  if (product === 10) return `${head}一十`
  if (product < 20) return `${head}十${DIGITS[product % 10]}`
  return `${head}${numberToZh(product)}`
}

export function spokenQuestion(a: number, b: number): string {
  return `${numberToZh(a)}乘${numberToZh(b)}等于多少？`
}

export function spokenAnswer(a: number, b: number): string {
  return `${numberToZh(a)}乘${numberToZh(b)}等于${numberToZh(a * b)}。${rhyme(a, b)}`
}

/** 把口诀读成一拍一拍的短语，逗号留给语音引擎停一下。 */
export function spokenRhyme(a: number, b: number): string {
  const left = Math.min(a, b)
  const right = Math.max(a, b)
  const head = `${DIGITS[left]}${DIGITS[right]}`
  const product = left * right
  if (product < 10) return `${head}，得${DIGITS[product]}`
  if (product === 10) return `${head}，一十`
  if (product < 20) return `${head}，十${DIGITS[product % 10]}`
  return `${head}，${numberToZh(product)}`
}
