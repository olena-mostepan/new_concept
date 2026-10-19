'use client'

import Link from 'next/link'
import type { SupplierQuestion } from '@/lib/supplier/questions/types'
import { getSupplierProjectName } from '@/lib/supplier/questions/mock-data'
import { sectionTitleClass } from '@/lib/ui/headings'
import { AnswerStatusCell } from '@/components/supplier/questions/AnswerStatusCell'
import { QuestionDirectionBadge } from '@/components/supplier/questions/QuestionDirectionBadge'

export function SupplierQuestionsTable({
  rows,
  onRespond,
  onView,
  showProjectUnderQuestion = false,
}: {
  rows: SupplierQuestion[]
  onRespond: (question: SupplierQuestion) => void
  onView: (question: SupplierQuestion) => void
  /** Cross-project lists: show tender name under question meta */
  showProjectUnderQuestion?: boolean
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-cq-border bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full table-fixed text-sm">
          <thead>
            <tr className="border-b border-cq-border bg-cq-bg/50 text-left">
              <th className={`w-[40%] px-4 py-3 ${sectionTitleClass}`}>
                Question
              </th>
              <th className={`w-[50%] px-4 py-3 ${sectionTitleClass}`}>
                Answer
              </th>
              <th className={`w-[10%] px-4 py-3 ${sectionTitleClass}`}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cq-border">
            {rows.map((row) => {
              const showRespond =
                row.direction === 'cquel_asked' && row.status === 'awaiting_you'
              const projectLabel =
                row.projectName ?? getSupplierProjectName(row.projectId)
              const showProject = showProjectUnderQuestion

              return (
                <tr key={row.id} className="transition-colors hover:bg-cq-bg/60">
                  <td className="px-4 py-4 align-top">
                    <p className="font-medium text-cq-text">{row.questionText}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <QuestionDirectionBadge direction={row.direction} />
                      <span className="text-xs text-cq-text-secondary">
                        {row.ageLabel}
                      </span>
                    </div>
                    {showProject ? (
                      <p className="mt-1.5">
                        <Link
                          href={`/supplier/projects/${row.projectId}?tab=questions`}
                          className="text-xs text-cq-text-secondary hover:text-cq-link hover:underline"
                        >
                          {projectLabel}
                        </Link>
                      </p>
                    ) : null}
                  </td>
                  <td className="px-4 py-4 align-top">
                    <AnswerStatusCell question={row} />
                  </td>
                  <td className="px-4 py-4 align-top">
                    {showRespond ? (
                      <button
                        type="button"
                        className="btn-primary-sm"
                        onClick={() => onRespond(row)}
                      >
                        Respond
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn-secondary-sm"
                        onClick={() => onView(row)}
                      >
                        View
                      </button>
                    )}
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
