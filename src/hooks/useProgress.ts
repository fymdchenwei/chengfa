import { useContext } from 'react'
import { ProgressContext, type ProgressApi } from '../progress-context.ts'

export function useProgress(): ProgressApi {
  const value = useContext(ProgressContext)
  if (!value) throw new Error('进度还没有准备好')
  return value
}
