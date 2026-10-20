'use client'

import { cn } from '@/lib/utils'
import type { QuestionDirection } from '@/lib/supplier/questions/types'

export function QuestionDirectionBadge({
  direction,
}: {
  direction: QuestionDirection
}) {
  const isYou = direction === 'you_asked'

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border border-cq-border px-2 py-0.5 text-xs font-normal text-cq-text-secondary',
      )}
    >
      {isYou ? 'You' : 'CQuel'}
    </span>
  )
}
