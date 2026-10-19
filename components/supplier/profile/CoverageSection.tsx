'use client'

import * as React from 'react'
import { ChevronDown } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import {
  COVERAGE_CATEGORIES,
  COVERAGE_MARKETS,
  COVERAGE_SERVICES,
  findMarket,
} from '@/lib/supplier/profile/coverage-data'
import type { CoverageEntry, CoverageMarket, ProfileField } from '@/lib/supplier/profile/types'

type DraftEntry = {
  category: string
  services: string[]
  marketCodes: string[]
  notes: string
}

const EMPTY_DRAFT: DraftEntry = {
  category: '',
  services: [],
  marketCodes: [],
  notes: '',
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-cq-border bg-white px-2 py-0.5 text-xs text-cq-text">
      {children}
    </span>
  )
}

function CoverageEntryRow({
  entry,
  showDivider,
  onEdit,
  onRemove,
}: {
  entry: CoverageEntry
  showDivider: boolean
  onEdit: () => void
  onRemove: () => void
}) {
  return (
    <div
      className="px-5 py-4"
      style={showDivider ? { borderTop: '0.5px solid var(--cq-border)' } : undefined}
    >
      <div className="flex items-start justify-between gap-3">
        <h4 className="text-base font-extrabold text-cq-text">{entry.category}</h4>
        <div className="flex shrink-0 items-center gap-2 text-sm font-bold">
          <button
            type="button"
            onClick={onEdit}
            className="text-[var(--cq-green)] hover:underline"
          >
            Edit
          </button>
          <span className="font-normal text-cq-muted" aria-hidden>
            |
          </span>
          <button
            type="button"
            onClick={onRemove}
            className="text-[var(--color-text-danger)] hover:underline"
          >
            Remove
          </button>
        </div>
      </div>

      <div className="mt-3 space-y-3">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <span className="shrink-0 text-sm text-cq-text-secondary">Services:</span>
          {entry.services.map((service) => (
            <Chip key={service}>{service}</Chip>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <span className="shrink-0 text-sm text-cq-text-secondary">Markets:</span>
          {entry.markets.map((market) => (
            <Chip key={market.code}>
              {market.flag} {market.name}
            </Chip>
          ))}
        </div>
        {entry.notes.trim() && (
          <p className="text-sm italic text-cq-text">{entry.notes}</p>
        )}
      </div>
    </div>
  )
}

function MarketsMultiSelect({
  marketCodes,
  onChange,
}: {
  marketCodes: string[]
  onChange: (codes: string[]) => void
}) {
  const [query, setQuery] = React.useState('')
  const [open, setOpen] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)

  const selectedMarkets = marketCodes
    .map((code) => findMarket(code))
    .filter((m): m is CoverageMarket => m != null)

  const filtered = COVERAGE_MARKETS.filter(
    (m) =>
      !marketCodes.includes(m.code) &&
      (query.trim() === '' || m.name.toLowerCase().includes(query.trim().toLowerCase())),
  )

  React.useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const addMarket = (code: string) => {
    if (marketCodes.includes(code)) return
    onChange([...marketCodes, code])
    setQuery('')
    setOpen(false)
  }

  const removeMarket = (code: string) => {
    onChange(marketCodes.filter((c) => c !== code))
  }

  return (
    <div ref={containerRef} className="relative mt-1.5">
      <div
        className="flex min-h-[42px] flex-wrap items-center gap-1.5 rounded-lg border border-cq-border bg-white px-2.5 py-2"
        onClick={() => setOpen(true)}
      >
        {selectedMarkets.map((market) => (
          <span
            key={market.code}
            className="inline-flex items-center gap-1 rounded-full border border-cq-border bg-[var(--color-background-secondary)] px-2 py-0.5 text-xs text-cq-text"
          >
            {market.flag} {market.name}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                removeMarket(market.code)
              }}
              className="ml-0.5 leading-none text-cq-text-secondary hover:text-cq-text"
              aria-label={`Remove ${market.name}`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          placeholder={selectedMarkets.length === 0 ? 'Select a country…' : 'Add another…'}
          className="min-w-[8rem] flex-1 border-0 bg-transparent px-1 py-0.5 text-sm text-cq-text outline-none placeholder:text-cq-muted"
        />
      </div>
      {open && filtered.length > 0 && (
        <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-cq-border bg-white py-1 shadow-lg">
          {filtered.map((market) => (
            <li key={market.code}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => addMarket(market.code)}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-cq-text hover:bg-[var(--color-background-secondary)]"
              >
                {market.flag} {market.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function CoverageForm({
  draft,
  onChange,
  onCancel,
  onSave,
  showDivider,
  formId = 'coverage',
}: {
  draft: DraftEntry
  onChange: (draft: DraftEntry) => void
  onCancel: () => void
  onSave: () => void
  showDivider?: boolean
  formId?: string
}) {
  const toggleService = (service: string) => {
    onChange({
      ...draft,
      services: draft.services.includes(service)
        ? draft.services.filter((s) => s !== service)
        : [...draft.services, service],
    })
  }

  return (
    <div
      className="px-5 py-4"
      style={showDivider ? { borderTop: '0.5px solid var(--cq-border)' } : undefined}
    >
      <div className="rounded-lg border border-cq-border bg-[var(--color-background-secondary)] px-5 py-5">
        <div className="space-y-5">
          <div>
            <label htmlFor={`${formId}-category`} className="text-sm font-semibold text-cq-text">
              Solution category <span className="text-[var(--color-text-danger)]">*</span>
            </label>
            <div className="relative mt-1.5">
              <select
                id={`${formId}-category`}
                value={draft.category}
                onChange={(e) => onChange({ ...draft, category: e.target.value })}
                className="w-full appearance-none rounded-lg border border-cq-border bg-white px-3 py-2.5 pr-10 text-sm text-cq-text outline-none focus:border-[var(--cq-link)] focus:ring-1 focus:ring-[var(--cq-link)]"
              >
                <option value="">Select a category…</option>
                {COVERAGE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cq-text-secondary"
                aria-hidden
              />
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-cq-text">Services</p>
            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2">
              {COVERAGE_SERVICES.map((service) => (
                <label key={service} className="inline-flex cursor-pointer items-center gap-2">
                  <Checkbox
                    checked={draft.services.includes(service)}
                    onCheckedChange={() => toggleService(service)}
                    className="border-cq-border data-[state=checked]:border-[var(--cq-green)] data-[state=checked]:bg-[var(--cq-green)]"
                  />
                  <span className="text-sm text-cq-text">{service}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-cq-text">Markets</p>
            <MarketsMultiSelect
              marketCodes={draft.marketCodes}
              onChange={(marketCodes) => onChange({ ...draft, marketCodes })}
            />
          </div>

          <div>
            <label htmlFor={`${formId}-notes`} className="text-sm font-semibold text-cq-text">
              Notes
            </label>
            <textarea
              id={`${formId}-notes`}
              value={draft.notes}
              onChange={(e) => onChange({ ...draft, notes: e.target.value })}
              placeholder="Any notes about this coverage…"
              className="mt-1.5 min-h-[60px] w-full resize-y rounded-lg border border-cq-border bg-white px-3 py-2.5 text-sm text-cq-text outline-none placeholder:text-cq-muted focus:border-[var(--cq-link)] focus:ring-1 focus:ring-[var(--cq-link)]"
            />
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-cq-border bg-white px-5 py-2.5 text-sm font-bold text-cq-text hover:bg-white/80"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!draft.category.trim()}
            onClick={onSave}
            className="rounded-lg bg-[#D85A30] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#c24f29] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

function draftFromEntry(entry: CoverageEntry): DraftEntry {
  return {
    category: entry.category,
    services: [...entry.services],
    marketCodes: entry.markets.map((m) => m.code),
    notes: entry.notes,
  }
}

function entryFromDraft(draft: DraftEntry, id: string): CoverageEntry {
  return {
    id,
    category: draft.category,
    services: draft.services,
    markets: draft.marketCodes
      .map((code) => findMarket(code))
      .filter((m): m is CoverageMarket => m != null),
    notes: draft.notes.trim(),
  }
}

export function CoverageSection({
  field,
  onChange,
}: {
  field?: ProfileField<CoverageEntry[]>
  onChange: (entries: CoverageEntry[]) => void
}) {
  const [formOpen, setFormOpen] = React.useState(false)
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [draft, setDraft] = React.useState<DraftEntry>(EMPTY_DRAFT)

  const entries = field?.value ?? []

  const openAdd = () => {
    setEditingId(null)
    setDraft(EMPTY_DRAFT)
    setFormOpen(true)
  }

  const openEdit = (entry: CoverageEntry) => {
    setEditingId(entry.id)
    setDraft(draftFromEntry(entry))
    setFormOpen(true)
  }

  const closeForm = () => {
    setFormOpen(false)
    setEditingId(null)
    setDraft(EMPTY_DRAFT)
  }

  const handleSave = () => {
    if (!draft.category.trim()) return
    const next = entryFromDraft(draft, editingId ?? `cov-${Date.now()}`)
    if (editingId) {
      onChange(entries.map((e) => (e.id === editingId ? next : e)))
    } else {
      onChange([...entries, next])
    }
    closeForm()
  }

  const handleRemove = (id: string) => {
    onChange(entries.filter((e) => e.id !== id))
    if (editingId === id) closeForm()
  }

  return (
    <section className="overflow-hidden rounded-xl border border-cq-border bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-cq-border bg-cq-bg px-5 py-3">
        <h3 className="text-[11px] font-bold uppercase tracking-[0.12em] text-cq-text-secondary">
          Coverage
        </h3>
        {!formOpen && (
          <button
            type="button"
            onClick={openAdd}
            className="text-sm font-bold text-[var(--cq-green)] hover:underline"
          >
            + Add
          </button>
        )}
      </div>

      {entries.length === 0 && !formOpen ? (
        <p className="px-5 py-6 text-sm text-cq-text-secondary">
          No coverage entries yet. Add your first solution category and markets.
        </p>
      ) : (
        entries.map((entry, index) => {
          const showDivider = index > 0
          if (formOpen && editingId === entry.id) {
            return (
              <CoverageForm
                key={entry.id}
                formId={`coverage-edit-${entry.id}`}
                showDivider={showDivider}
                draft={draft}
                onChange={setDraft}
                onCancel={closeForm}
                onSave={handleSave}
              />
            )
          }
          return (
            <CoverageEntryRow
              key={entry.id}
              entry={entry}
              showDivider={showDivider}
              onEdit={() => openEdit(entry)}
              onRemove={() => handleRemove(entry.id)}
            />
          )
        })
      )}

      {formOpen && editingId === null && (
        <CoverageForm
          formId="coverage-add"
          showDivider={entries.length > 0}
          draft={draft}
          onChange={setDraft}
          onCancel={closeForm}
          onSave={handleSave}
        />
      )}
    </section>
  )
}
