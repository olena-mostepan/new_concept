import { MessageCircle, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { QuestionDirection, QuestionType } from '@/lib/questions/types'

function labelFor(type: QuestionType, direction?: QuestionDirection): string {
  if (type === 'ai') return 'CQuel Agent'
  if (direction === 'supplier_asked') return 'From supplier'
  return 'To suppliers'
}

export function QuestionTypeBadge({
  type,
  direction,
  className,
}: {
  type: QuestionType
  direction?: QuestionDirection
  className?: string
}) {
  const isAi = type === 'ai'
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md border border-cq-border bg-white px-2 py-0.5 text-xs font-bold text-cq-text',
        className,
      )}
    >
      {isAi ? (
        <Sparkles className="h-3 w-3 text-cq-green" aria-hidden />
      ) : (
        <MessageCircle className="h-3 w-3 text-cq-text-secondary" aria-hidden />
      )}
      {labelFor(type, direction)}
    </span>
  )
}
