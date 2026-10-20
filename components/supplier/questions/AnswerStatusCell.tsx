'use client'

import type { ReactNode } from 'react'
import { Check, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import type {
  SupplierQuestion,
  SupplierQuestionAnswer,
  SupplierQuestionAnswerAttachment,
} from '@/lib/supplier/questions/types'

function answerAttachments(
  answer: SupplierQuestionAnswer,
): SupplierQuestionAnswerAttachment[] {
  if (answer.attachments?.length) return answer.attachments
  return []
}

function answeredByPrefix(answeredBy: string): string {
  const first = answeredBy.split(' ')[0] ?? answeredBy
  return first
}

function AnswerAttachments({
  attachments,
}: {
  attachments: SupplierQuestionAnswerAttachment[]
}) {
  if (attachments.length === 0) return null

  return (
    <ul className="mt-2 flex flex-wrap gap-2">
      {attachments.map((file, i) => (
        <li
          key={`${file.name}-${i}`}
          className="flex max-w-full items-center gap-2 rounded-md border border-cq-border bg-cq-bg/40 px-2.5 py-1.5 text-xs"
        >
          <FileText
            className="h-3.5 w-3.5 shrink-0 text-cq-text-secondary"
            aria-hidden
          />
          <span className="min-w-0 truncate font-normal text-cq-text">{file.name}</span>
          <span className="shrink-0 tabular-nums text-cq-text-secondary">
            {file.sizeLabel}
          </span>
        </li>
      ))}
    </ul>
  )
}

function AnsweredByLine({ answer }: { answer: SupplierQuestionAnswer }) {
  const attachments = answerAttachments(answer)

  return (
    <>
      <p className="whitespace-pre-wrap">
        <span className="font-normal text-cq-text">
          {answeredByPrefix(answer.answeredBy)}:
        </span>{' '}
        <span className="text-cq-text-secondary">{answer.text}</span>
      </p>
      <AnswerAttachments attachments={attachments} />
    </>
  )
}

function hasAnswerText(answer?: SupplierQuestionAnswer): answer is SupplierQuestionAnswer {
  return Boolean(answer?.text?.trim())
}

export function AnswerStatusCell({ question }: { question: SupplierQuestion }) {
  const { status, answer, direction } = question

  if (status === 'awaiting_cquel') {
    return (
      <StatusRow dotClass="bg-cq-muted">
        Awaiting CQuel
      </StatusRow>
    )
  }

  if (status === 'cquel_answered') {
    if (hasAnswerText(answer)) {
      return (
        <StatusRow dotClass="bg-emerald-500">
          <AnsweredByLine answer={answer} />
        </StatusRow>
      )
    }
    return <span className="text-sm text-cq-text-secondary">—</span>
  }

  if (status === 'awaiting_you') {
    return (
      <StatusRow dotClass="bg-red-500">
        Awaiting your response
      </StatusRow>
    )
  }

  if (status === 'you_answered') {
    if (hasAnswerText(answer)) {
      return (
        <StatusRow dotClass="bg-emerald-500">
          <AnsweredByLine answer={answer} />
        </StatusRow>
      )
    }
    return (
      <StatusRow dotClass="bg-emerald-500">
        Sent · awaiting CQuel review
      </StatusRow>
    )
  }

  if (status === 'need_more_info') {
    return (
      <StatusRow dotClass="bg-amber-500">
        You marked: I need more info
      </StatusRow>
    )
  }

  if (status === 'resolved') {
    if (hasAnswerText(answer)) {
      return (
        <div className="flex items-start gap-2 text-sm text-cq-text-secondary">
          <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
          <div className="min-w-0 flex-1 leading-relaxed">
            <AnsweredByLine answer={answer} />
          </div>
        </div>
      )
    }
    return (
      <div className="flex items-start gap-2 text-sm text-cq-text-secondary">
        <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
        <span>Resolved</span>
      </div>
    )
  }

  if (hasAnswerText(answer) && direction === 'you_asked') {
    return (
      <StatusRow dotClass="bg-emerald-500">
        <AnsweredByLine answer={answer} />
      </StatusRow>
    )
  }

  return <span className="text-sm text-cq-text-secondary">—</span>
}

function StatusRow({
  dotClass,
  children,
}: {
  dotClass: string
  children: ReactNode
}) {
  return (
    <div className="flex items-start gap-2 text-sm text-cq-text-secondary">
      <span className={cn('mt-2 h-2 w-2 shrink-0 rounded-full', dotClass)} aria-hidden />
      <div className="min-w-0 flex-1 leading-relaxed">{children}</div>
    </div>
  )
}
