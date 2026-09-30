import { describe, expect, it } from 'vitest'
import { needsRotatePrompt } from './platform.ts'

describe('needsRotatePrompt', () => {
  it('竖屏手机要提示', () => {
    expect(needsRotatePrompt(393, 852)).toBe(true)
    expect(needsRotatePrompt(390, 844)).toBe(true)
  })

  it('横过来之后不再提示', () => {
    expect(needsRotatePrompt(852, 393)).toBe(false)
    expect(needsRotatePrompt(844, 390)).toBe(false)
  })

  it('宽屏幕不提示', () => {
    expect(needsRotatePrompt(1280, 800)).toBe(false)
    expect(needsRotatePrompt(900, 1200)).toBe(false)
  })
})
