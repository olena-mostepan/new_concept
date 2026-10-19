'use client'

import * as React from 'react'
import { useSupplierQuestions } from '@/lib/supplier/questions/store'
import type { SupplierQuestionFilter } from '@/lib/supplier/questions/types'
import { SupplierQuestionsFilters } from '@/components/supplier/questions/SupplierQuestionsFilters'
import { SupplierQuestionsTable } from '@/components/supplier/questions/SupplierQuestionsTable'
import { SupplierClarifyModal } from '@/components/supplier/questions/SupplierClarifyModal'
import { ViewQuestionModal } from '@/components/supplier/questions/ViewQuestionModal'
import type { SupplierQuestion } from '@/lib/supplier/questions/types'

export function SupplierAllQuestionsView() {
  const {
    getAllQuestions,
    respondWithText,
    respondWithFiles,
    markNeedMoreInfo,
  } = useSupplierQuestions()

  const allQuestions = getAllQuestions()

  const [filter, setFilter] = React.useState<SupplierQuestionFilter>('all')
  const [search, setSearch] = React.useState('')
  const [clarifyTarget, setClarifyTarget] = React.useState<SupplierQuestion | null>(
    null,
  )
  const [viewTarget, setViewTarget] = React.useState<SupplierQuestion | null>(null)

  const counts = React.useMemo(
    () => ({
      all: allQuestions.length,
      you_asked: allQuestions.filter((q) => q.direction === 'you_asked').length,
      cquel_asked: allQuestions.filter((q) => q.direction === 'cquel_asked').length,
    }),
    [allQuestions],
  )

  const filtered = React.useMemo(() => {
    let rows = allQuestions
    if (filter === 'you_asked') {
      rows = rows.filter((q) => q.direction === 'you_asked')
    }
    if (filter === 'cquel_asked') {
      rows = rows.filter((q) => q.direction === 'cquel_asked')
    }
    const q = search.trim().toLowerCase()
    if (q) {
      rows = rows.filter(
        (r) =>
          r.questionText.toLowerCase().includes(q) ||
          (r.projectName ?? '').toLowerCase().includes(q),
      )
    }
    return rows
  }, [allQuestions, filter, search])

  return (
    <div className="space-y-5">
      {allQuestions.length > 0 ? (
        <SupplierQuestionsFilters
          filter={filter}
          onFilterChange={setFilter}
          counts={counts}
          search={search}
          onSearchChange={setSearch}
        />
      ) : null}

      {allQuestions.length === 0 ? (
        <div className="rounded-xl border border-cq-border bg-white px-8 py-12 text-center shadow-sm">
          <p className="text-base font-medium text-cq-text">No questions yet</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-cq-border bg-white px-8 py-10 text-center shadow-sm">
          <p className="text-sm font-medium text-cq-text">No questions match this filter</p>
          <button
            type="button"
            onClick={() => {
              setFilter('all')
              setSearch('')
            }}
            className="mt-3 text-sm font-medium text-cq-link underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <SupplierQuestionsTable
          rows={filtered}
          showProjectUnderQuestion
          onRespond={setClarifyTarget}
          onView={setViewTarget}
        />
      )}

      <SupplierClarifyModal
        open={clarifyTarget != null}
        onOpenChange={(open) => !open && setClarifyTarget(null)}
        question={clarifyTarget}
        onSubmitText={(text) => {
          if (clarifyTarget) respondWithText(clarifyTarget.id, text)
        }}
        onSubmitFiles={(files, message) => {
          if (clarifyTarget) respondWithFiles(clarifyTarget.id, files, message)
        }}
        onMarkBlocked={() => {
          if (clarifyTarget) markNeedMoreInfo(clarifyTarget.id)
        }}
      />

      <ViewQuestionModal
        open={viewTarget != null}
        onOpenChange={(open) => !open && setViewTarget(null)}
        question={viewTarget}
      />
    </div>
  )
}
