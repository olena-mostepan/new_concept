'use client'

import { useState, type ReactNode } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

export function useDetailsOpen(initial = true) {
  const [open, setOpen] = useState(initial)
  return { open, toggle: () => setOpen((value) => !value) }
}

export function DetailsToggle({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-cq-border bg-white text-cq-text-secondary hover:bg-cq-bg"
      aria-expanded={open}
      aria-label={open ? 'Hide workstream details' : 'Show workstream details'}
      onClick={onToggle}
    >
      {open ? <ChevronUp className="h-4 w-4" aria-hidden /> : <ChevronDown className="h-4 w-4" aria-hidden />}
    </button>
  )
}

export function DetailTags({ label, tags }: { label?: string; tags: string[] }) {
  if (!tags.length) return null
  return (
    <div>
      {label && <p className="text-cq-text-secondary s3">{label}</p>}
      <ul className={`flex flex-wrap gap-2 ${label ? 'mt-3' : ''}`}>
        {tags.map((tag) => (
          <li key={tag} className="rounded-full border border-cq-border bg-white px-3 py-1 text-sm text-cq-text">
            {tag}
          </li>
        ))}
      </ul>
    </div>
  )
}

export function DetailsGrid({
  items,
  flow = 'row',
  tags,
  tagLabel,
}: {
  items: Array<{ label: string; value: ReactNode }>
  flow?: 'row' | 'col' | 'three'
  tags?: string[]
  tagLabel?: string
}) {
  const columns =
    flow === 'col'
      ? 'grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-3 lg:grid-cols-4'
      : flow === 'three'
        ? 'grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-3 lg:grid-cols-4'
        : 'grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-3 lg:grid-cols-5'
  return (
    <div className="space-y-6">
      <dl className={`grid ${columns}`}>
        {items.map((item) => (
          <div key={item.label}>
            <dt className="text-xs text-cq-text-secondary">{item.label}</dt>
            <dd className="mt-1 text-sm font-normal text-cq-text">{item.value}</dd>
          </div>
        ))}
      </dl>
      <DetailTags label={tagLabel} tags={tags ?? []} />
    </div>
  )
}
