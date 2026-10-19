import type { Clarification, FocusItem } from './types'

export function clarificationToFocusItem(c: Clarification): FocusItem {
  const ageLabel = c.raisedAgo.replace(/\s+ago$/i, '').trim()
  return {
    id: `fi-q-${c.id}`,
    kind: 'question',
    title: c.title,
    contextLine: `${c.project} · ${c.bidLabel}`,
    ageLabel: ageLabel || '—',
    primaryAction: 'answer',
    clarificationId: c.id,
    overdue: c.overdue,
  }
}
