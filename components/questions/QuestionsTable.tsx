'use client'

import { useRouter } from 'next/navigation'
import type { TenderQuestion } from '@/lib/questions/types'
import {
  canNavigateQuestionRow,
  questionRowHref,
} from '@/lib/questions/navigation'
import { QuestionTypeBadge } from '@/components/questions/QuestionTypeBadge'
import { SupplierAnswerList } from '@/components/questions/SupplierAnswerList'
import { cn } from '@/lib/utils'

export function QuestionsTable({ rows }: { rows: TenderQuestion[] }) {
  const router = useRouter()
  const hasInbound = rows.some((r) => r.direction === 'supplier_asked')
  const hasOutbound = rows.some((r) => r.direction !== 'supplier_asked')
  const answersColumnLabel =
    hasInbound && hasOutbound
      ? 'Answers'
      : hasInbound
        ? 'CQuel response'
        : 'Supplier answers'

  const handleRowNavigate = (row: TenderQuestion) => {
    const href = questionRowHref(row)
    if (href) router.push(href)
  }

  return (
    <div className="overflow-hidden rounded-xl border border-cq-border bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full table-fixed text-sm">
          <thead>
            <tr className="border-b border-cq-border bg-cq-bg/50 text-left text-xs font-bold uppercase tracking-wide text-cq-text-secondary">
              <th className="w-[30%] px-4 py-3 font-bold">Question</th>
              <th className="w-[70%] px-4 py-3 font-bold">{answersColumnLabel}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cq-border">
            {rows.map((row) => {
              const canNavigate = canNavigateQuestionRow(row)
              return (
                <tr
                  key={row.id}
                  className={cn(
                    'transition-colors',
                    canNavigate && 'cursor-pointer hover:bg-cq-bg/60',
                  )}
                  onClick={() => canNavigate && handleRowNavigate(row)}
                >
                  <td className="px-4 py-4 align-top">
                    <p className="font-bold text-cq-text">{row.questionText}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <QuestionTypeBadge type={row.type} direction={row.direction} />
                      {row.askedByLabel ? (
                        <span className="text-xs text-cq-text-secondary">
                          {row.askedByLabel}
                        </span>
                      ) : null}
                      <span className="text-xs text-cq-text-secondary">
                        {row.ageLabel}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 align-top">
                    <SupplierAnswerList
                      answers={row.answers}
                      emptyLabel={
                        row.direction === 'supplier_asked'
                          ? 'No CQuel response yet'
                          : 'No supplier answers yet'
                      }
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
