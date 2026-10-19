import type { TenderQuestion } from './types'

/** Whether the ops Questions table row should be clickable. */
export function canNavigateQuestionRow(row: TenderQuestion): boolean {
  if (row.type === 'ai') return true
  return row.type === 'supplier' && Boolean(row.detailClarificationId)
}

/** Route for row click — supplier clarifications review or AI bid intelligence detail. */
export function questionRowHref(row: TenderQuestion): string | null {
  if (row.type === 'supplier' && row.detailClarificationId) {
    return `/clarifications/${row.detailClarificationId}`
  }
  if (row.type === 'ai') {
    return `/questions/${row.id}`
  }
  return null
}
