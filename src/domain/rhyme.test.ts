import { describe, expect, it } from 'vitest'
import { numberToZh, rhyme, spokenAnswer, spokenQuestion, spokenRhyme } from './rhyme.ts'

const RHYMES: Array<[number, number, string]> = [
  [1, 1, '一一得一'],
  [1, 2, '一二得二'],
  [1, 3, '一三得三'],
  [1, 4, '一四得四'],
  [1, 5, '一五得五'],
  [1, 6, '一六得六'],
  [1, 7, '一七得七'],
  [1, 8, '一八得八'],
  [1, 9, '一九得九'],
  [2, 2, '二二得四'],
  [2, 3, '二三得六'],
  [2, 4, '二四得八'],
  [2, 5, '二五一十'],
  [2, 6, '二六十二'],
  [2, 7, '二七十四'],
  [2, 8, '二八十六'],
  [2, 9, '二九十八'],
  [3, 3, '三三得九'],
  [3, 4, '三四十二'],
  [3, 5, '三五十五'],
  [3, 6, '三六十八'],
  [3, 7, '三七二十一'],
  [3, 8, '三八二十四'],
  [3, 9, '三九二十七'],
  [4, 4, '四四十六'],
  [4, 5, '四五二十'],
  [4, 6, '四六二十四'],
  [4, 7, '四七二十八'],
  [4, 8, '四八三十二'],
  [4, 9, '四九三十六'],
  [5, 5, '五五二十五'],
  [5, 6, '五六三十'],
  [5, 7, '五七三十五'],
  [5, 8, '五八四十'],
  [5, 9, '五九四十五'],
  [6, 6, '六六三十六'],
  [6, 7, '六七四十二'],
  [6, 8, '六八四十八'],
  [6, 9, '六九五十四'],
  [7, 7, '七七四十九'],
  [7, 8, '七八五十六'],
  [7, 9, '七九六十三'],
  [8, 8, '八八六十四'],
  [8, 9, '八九七十二'],
  [9, 9, '九九八十一'],
]

describe('乘法口诀', () => {
  it('覆盖小九九的每一句', () => {
    for (const [a, b, expected] of RHYMES) {
      expect(rhyme(a, b)).toBe(expected)
    }
  })

  it('颠倒乘数仍然读同一句口诀', () => {
    expect(rhyme(4, 3)).toBe('三四十二')
    expect(rhyme(5, 2)).toBe('二五一十')
    expect(rhyme(9, 8)).toBe('八九七十二')
    expect(rhyme(4, 3)).toBe(rhyme(3, 4))
  })

  it('把得数读成中文', () => {
    expect(numberToZh(2)).toBe('二')
    expect(numberToZh(10)).toBe('十')
    expect(numberToZh(12)).toBe('十二')
    expect(numberToZh(20)).toBe('二十')
    expect(numberToZh(21)).toBe('二十一')
    expect(numberToZh(81)).toBe('八十一')
  })

  it('朗读题目时不说出答案，朗读答案时带上口诀', () => {
    expect(spokenQuestion(3, 4)).toBe('三乘四等于多少？')
    expect(spokenAnswer(3, 4)).toBe('三乘四等于十二。三四十二')
  })

  it('把口诀读成带停顿的短语，而不是算式', () => {
    expect(spokenRhyme(1, 1)).toBe('一一，得一')
    expect(spokenRhyme(1, 9)).toBe('一九，得九')
    expect(spokenRhyme(2, 5)).toBe('二五，一十')
    expect(spokenRhyme(5, 2)).toBe('二五，一十')
    expect(spokenRhyme(3, 4)).toBe('三四，十二')
    expect(spokenRhyme(3, 7)).toBe('三七，二十一')
    expect(spokenRhyme(9, 9)).toBe('九九，八十一')
  })
})
