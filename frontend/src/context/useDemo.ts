import { useContext } from 'react'
import { DemoContext } from './contextModel'

export function useDemo() {
  const context = useContext(DemoContext)
  if (!context) throw new Error('useDemo must be used inside DemoProvider')
  return context
}
