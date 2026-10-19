'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import * as React from 'react'
import { QuestionPromptSection } from '@/components/clarifications/QuestionPromptSection'
import { AiQuestionDetailHeader } from '@/components/questions/AiQuestionDetailHeader'
import { SendToSuppliersModal } from '@/components/questions/SendToSuppliersModal'
import { SupplierAnswerList } from '@/components/questions/SupplierAnswerList'
import { useQuestions } from '@/lib/questions/store'

const btnGhost =
  'rounded-lg border border-cq-border bg-white px-4 py-2.5 text-sm font-bold text-cq-text hover:bg-cq-bg'

const btnSecondaryBlack =
  'rounded-lg bg-cq-text px-4 py-2.5 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50'

const backHref = '/supplier-comparison?tab=questions'

export default function AiQuestionDetailPage() {
  const params = useParams()
  const rawId = params?.id as string | undefined
  const { getQuestionById, openSendToSuppliersModal } = useQuestions()
  const question = rawId ? getQuestionById(rawId) : undefined

  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set())

  React.useEffect(() => {
    setSelectedIds(new Set())
  }, [rawId])

  if (!question || question.type !== 'ai') {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <p className="text-cq-text-secondary">This question could not be found.</p>
        <Link
          href={backHref}
          className="mt-4 inline-block font-bold text-cq-link underline"
        >
          Back to Questions
        </Link>
      </div>
    )
  }

  const visible = question.answers.filter((a) => a.status !== 'not_asked')
  const selectedCount = selectedIds.size

  const openAsk = (supplierIds: string[]) => {
    if (!rawId || supplierIds.length === 0) return
    openSendToSuppliersModal(rawId, supplierIds)
  }

  const askButtonLabel =
    selectedCount === 1
      ? 'Ask 1 supplier'
      : selectedCount > 1
        ? `Ask ${selectedCount} suppliers`
        : 'Ask supplier(s)'

  return (
    <div className="mx-auto w-full max-w-[720px] px-6 pb-20 pt-6 sm:px-8">
      <article className="space-y-5">
        <AiQuestionDetailHeader question={question} />

        <QuestionPromptSection question={question.questionText} />

        {visible.length > 0 ? (
          <section className="rounded-xl border border-cq-border bg-white p-5 sm:p-6">
            <h2 className="text-base font-bold text-cq-text">Supplier answers</h2>
            <div className="mt-3">
              <SupplierAnswerList
                answers={question.answers}
                emptyLabel="No supplier answers yet"
                hideAgeLabels
                selection={{ selectedIds, onSelectionChange: setSelectedIds }}
              />
            </div>
          </section>
        ) : (
          <section className="rounded-xl border border-dashed border-cq-border bg-cq-bg/40 px-5 py-8 text-center sm:p-6">
            <p className="text-sm font-semibold text-cq-text">No answers yet</p>
            <p className="mt-1 text-sm text-cq-text-secondary">
              Suppliers have not returned extracted values for this question.
            </p>
          </section>
        )}

        <div className="flex flex-col gap-3 border-t border-cq-border pt-5 sm:flex-row sm:items-center sm:justify-between">
          <Link href={backHref} className={`${btnGhost} text-center`}>
            Back to Questions
          </Link>
          {visible.length > 0 ? (
            <button
              type="button"
              className={btnSecondaryBlack}
              disabled={selectedCount === 0}
              onClick={() => openAsk(Array.from(selectedIds))}
            >
              {askButtonLabel}
            </button>
          ) : null}
        </div>
      </article>

      <SendToSuppliersModal />
    </div>
  )
}
