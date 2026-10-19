import type { Clarification } from '@/lib/clarifications/types'
import {
  sectionFromPerspective,
  statusLabelFromPerspective,
  type Perspective,
} from '@/lib/clarifications/perspective'

export function StatusBlock({
  item,
  perspective,
  align = 'right',
}: {
  item: Clarification
  perspective: Perspective
  align?: 'left' | 'right'
}) {
  const section = sectionFromPerspective(item, perspective)
  const primary = statusLabelFromPerspective(item.status, perspective)

  let subLine: string | null = null

  if (item.overdue && (item.status === 'awaiting' || item.status === 'review')) {
    subLine = 'overdue'
  }

  return (
    <div className={align === 'left' ? 'text-left sm:text-right' : 'text-right'}>
      <p className="text-sm font-medium text-cq-text">{primary}</p>
      {subLine ? (
        <p className="text-xs text-cq-text-secondary">{subLine}</p>
      ) : null}
    </div>
  )
}
