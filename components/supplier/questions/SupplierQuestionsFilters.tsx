'use client'

import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SupplierQuestionFilter } from '@/lib/supplier/questions/types'

type Counts = { all: number; you_asked: number; cquel_asked: number }

export function SupplierQuestionsFilters({
  filter,
  onFilterChange,
  counts,
  search,
  onSearchChange,
}: {
  filter: SupplierQuestionFilter
  onFilterChange: (f: SupplierQuestionFilter) => void
  counts: Counts
  search: string
  onSearchChange: (q: string) => void
}) {
  const chips: { id: SupplierQuestionFilter; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: counts.all },
    { id: 'you_asked', label: 'You asked', count: counts.you_asked },
    { id: 'cquel_asked', label: 'CQuel asked', count: counts.cquel_asked },
  ]

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap gap-2">
        {chips.map((chip) => (
          <button
            key={chip.id}
            type="button"
            onClick={() => onFilterChange(chip.id)}
            className={cn(
              'rounded-lg border px-3 py-1.5 text-sm font-semibold transition-colors',
              filter === chip.id
                ? 'border-cq-green bg-cq-green/10 text-cq-green'
                : 'border-cq-border bg-white text-cq-text-secondary hover:bg-cq-bg',
            )}
          >
            {chip.label} ({chip.count})
          </button>
        ))}
      </div>
      <div className="relative min-w-0 flex-1 sm:max-w-md">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cq-text-secondary"
          aria-hidden
        />
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search questions…"
          className="w-full rounded-lg border border-cq-border bg-white py-2 pl-9 pr-3 text-sm text-cq-text placeholder:text-cq-text-secondary focus:border-cq-green focus:outline-none focus:ring-1 focus:ring-cq-green"
        />
      </div>
    </div>
  )
}
