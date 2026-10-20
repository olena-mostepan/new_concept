'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { SupplierQuestion } from '@/lib/supplier/questions/types'
import { AnswerStatusCell } from '@/components/supplier/questions/AnswerStatusCell'
import { QuestionDirectionBadge } from '@/components/supplier/questions/QuestionDirectionBadge'

export function ViewQuestionModal({
  open,
  onOpenChange,
  question,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  question: SupplierQuestion | null
}) {
  if (!question) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="max-h-[calc(100dvh-2rem)] gap-5 overflow-y-auto border-cq-border p-6 sm:max-w-[520px]"
      >
        <DialogHeader className="space-y-3 text-left">
          <div className="flex flex-wrap items-center gap-2">
            <QuestionDirectionBadge direction={question.direction} />
            <span className="text-xs text-cq-text-secondary">{question.ageLabel}</span>
          </div>
          <DialogTitle className="text-lg font-semibold leading-snug text-cq-text">
            {question.questionText}
          </DialogTitle>
          <p className="text-sm text-cq-text-secondary">Asked by {question.askedBy}</p>
        </DialogHeader>

        <div className="rounded-lg border border-cq-border bg-cq-bg/40 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-cq-text-secondary">
            Status
          </p>
          <div className="mt-2">
            <AnswerStatusCell question={question} />
          </div>
        </div>

        <div className="flex justify-end">
          <button type="button" className="btn-secondary" onClick={() => onOpenChange(false)}>
            Close
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
