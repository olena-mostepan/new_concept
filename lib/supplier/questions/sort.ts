import type { SupplierQuestion } from './types'

/** `awaiting_you` first, then newest by `createdAt`. */
export function sortSupplierQuestions(
  questions: SupplierQuestion[],
): SupplierQuestion[] {
  return [...questions].sort((a, b) => {
    const aPriority = a.status === 'awaiting_you' ? 1 : 0
    const bPriority = b.status === 'awaiting_you' ? 1 : 0
    if (aPriority !== bPriority) return bPriority - aPriority
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
}
