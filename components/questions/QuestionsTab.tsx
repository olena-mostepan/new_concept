'use client'

import * as React from 'react'
import { Plus } from 'lucide-react'
import type { ClarificationsProjectSlug } from '@/lib/clarifications/mock-data'
import type { QuestionFilter } from '@/lib/questions/types'
import { countUniqueSuppliers } from '@/lib/questions/adapters'
import { useQuestions } from '@/lib/questions/store'
import { QuestionsFilters } from '@/components/questions/QuestionsFilters'
import { QuestionsTable } from '@/components/questions/QuestionsTable'
import { AskQuestionModal } from '@/components/questions/AskQuestionModal'

export function QuestionsTab({
  tenderSlug,
}: {
  tenderSlug: ClarificationsProjectSlug
}) {
  const { getQuestions, openAskModal } = useQuestions()
  const allQuestions = getQuestions(tenderSlug)

  const [filter, setFilter] = React.useState<QuestionFilter>('all')
  const [search, setSearch] = React.useState('')

  const counts = React.useMemo(
    () => ({
      all: allQuestions.length,
      ai: allQuestions.filter((q) => q.type === 'ai').length,
      supplier: allQuestions.filter((q) => q.type === 'supplier').length,
    }),
    [allQuestions],
  )

  const filtered = React.useMemo(() => {
    let rows = allQuestions
    if (filter === 'ai') rows = rows.filter((q) => q.type === 'ai')
    if (filter === 'supplier') rows = rows.filter((q) => q.type === 'supplier')
    const q = search.trim().toLowerCase()
    if (q) rows = rows.filter((r) => r.questionText.toLowerCase().includes(q))
    return rows
  }, [allQuestions, filter, search])

  const supplierCount = countUniqueSuppliers(allQuestions)
  return (
    <div className="space-y-5">
      <p className="text-sm text-cq-text-secondary">
        {allQuestions.length} question{allQuestions.length === 1 ? '' : 's'} across{' '}
        {supplierCount} supplier{supplierCount === 1 ? '' : 's'}
      </p>

      {allQuestions.length > 0 && (
        <QuestionsFilters
          filter={filter}
          onFilterChange={setFilter}
          counts={counts}
          search={search}
          onSearchChange={setSearch}
        />
      )}

      {allQuestions.length === 0 ? (
        <div className="rounded-xl border border-cq-border bg-white px-8 py-12 text-center shadow-sm">
          <p className="text-base font-bold text-cq-text">
            No questions yet · Ask the first question about this tender
          </p>
          <button
            type="button"
            onClick={openAskModal}
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-cq-green px-4 py-2 text-sm font-bold text-primary-foreground hover:bg-cq-green-hover"
          >
            <Plus className="h-4 w-4" aria-hidden />
            Ask question
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-cq-border bg-white px-8 py-10 text-center shadow-sm">
          <p className="text-sm font-bold text-cq-text">No questions match this filter</p>
          <button
            type="button"
            onClick={() => {
              setFilter('all')
              setSearch('')
            }}
            className="mt-3 text-sm font-bold text-cq-link underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <QuestionsTable rows={filtered} />
      )}

      <AskQuestionModal tenderSlug={tenderSlug} />
    </div>
  )
}
