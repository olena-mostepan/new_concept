'use client'

import * as React from 'react'
import { ArrowRight, ChevronLeft, FileText } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import type { CaseStudySuggestion, ProfileFieldChange, ReviewSession } from '@/lib/supplier/profile/review-changes-data'
import { countReviewItems } from '@/lib/supplier/profile/review-changes-data'

type SelectedValues = Record<string, string>

function SourceTag({ filename }: { filename: string }) {
  return (
    <p className="mt-3 text-right text-xs text-cq-text-secondary">
      from{' '}
      <span className="inline-flex items-center gap-1 font-medium text-cq-text">
        <FileText className="h-3.5 w-3.5 text-[var(--cq-green)]" aria-hidden />
        {filename}
      </span>
    </p>
  )
}

function FieldChangeCard({
  change,
  selected,
  suggestedValue,
  onToggle,
  onValueChange,
}: {
  change: ProfileFieldChange
  selected: boolean
  suggestedValue: string
  onToggle: () => void
  onValueChange: (value: string) => void
}) {
  return (
    <div className="rounded-xl border border-cq-border bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <Checkbox
          checked={selected}
          onCheckedChange={onToggle}
          className="mt-0.5 border-cq-border data-[state=checked]:border-[var(--cq-green)] data-[state=checked]:bg-[var(--cq-green)]"
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-extrabold leading-snug text-cq-text">{change.label}</p>

          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
            <div>
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-cq-text-secondary">
                Current
              </p>
              <div className="rounded-[8px] bg-cq-bg px-3 py-2.5 text-sm text-cq-text">
                {change.currentValue}
              </div>
            </div>
            <ArrowRight className="hidden h-4 w-4 shrink-0 text-cq-muted sm:mb-3 sm:block" aria-hidden />
            <div>
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-cq-text-secondary">
                Suggested
              </p>
              <input
                type="text"
                value={suggestedValue}
                onChange={(e) => onValueChange(e.target.value)}
                className="w-full rounded-[8px] border border-cq-border bg-white px-3 py-2.5 text-sm text-cq-text outline-none focus:border-[var(--cq-link)] focus:ring-1 focus:ring-[var(--cq-link)]"
              />
            </div>
          </div>

          <SourceTag filename={change.sourceDocument} />
        </div>
      </div>
    </div>
  )
}

function CaseStudyCard({
  study,
  selected,
  onToggle,
}: {
  study: CaseStudySuggestion
  selected: boolean
  onToggle: () => void
}) {
  return (
    <div className="rounded-xl border border-cq-border bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <Checkbox
          checked={selected}
          onCheckedChange={onToggle}
          className="mt-0.5 border-cq-border data-[state=checked]:border-[var(--cq-green)] data-[state=checked]:bg-[var(--cq-green)]"
        />
        <div className="min-w-0 flex-1 space-y-4">
          {study.fields.map((field) => (
            <div key={field.label}>
              <p className="text-[10px] font-bold uppercase tracking-wide text-cq-text-secondary">
                {field.label}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-cq-text">{field.value}</p>
            </div>
          ))}
          <SourceTag filename={study.sourceDocument} />
        </div>
      </div>
    </div>
  )
}

export function ApplyChangesModal({
  open,
  onOpenChange,
  session,
  onApply,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  session: ReviewSession | null
  onApply: (selected: {
    fieldChanges: ProfileFieldChange[]
    caseStudyIds: string[]
    values: SelectedValues
  }) => void
}) {
  const [selectedFields, setSelectedFields] = React.useState<Set<string>>(new Set())
  const [selectedCaseStudies, setSelectedCaseStudies] = React.useState<Set<string>>(new Set())
  const [editedValues, setEditedValues] = React.useState<SelectedValues>({})

  React.useEffect(() => {
    if (!open || !session) return
    setSelectedFields(new Set(session.fieldChanges.map((c) => c.id)))
    setSelectedCaseStudies(new Set(session.caseStudies.map((c) => c.id)))
    setEditedValues(
      Object.fromEntries(session.fieldChanges.map((c) => [c.id, c.suggestedValue])),
    )
  }, [open, session])

  if (!session) return null

  const totalItems = countReviewItems(session)
  const selectedCount = selectedFields.size + selectedCaseStudies.size
  const docCount = session.analysedDocuments.length

  const handleApply = () => {
    const fieldChanges = session.fieldChanges.filter((c) => selectedFields.has(c.id))
    onApply({
      fieldChanges,
      caseStudyIds: [...selectedCaseStudies],
      values: editedValues,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex h-[min(92vh,900px)] max-h-[92vh] w-[min(1100px,calc(100vw-2rem))] max-w-[1100px] flex-col gap-0 overflow-hidden rounded-2xl border-cq-border p-0"
        showCloseButton={false}
      >
        <div className="shrink-0 border-b border-cq-border bg-white px-6 py-5 sm:px-8">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-cq-text-secondary hover:text-cq-text"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
            Back
          </button>
          <DialogHeader className="space-y-2 text-left">
            <DialogTitle className="text-2xl font-extrabold tracking-tight text-cq-text">
              Review profile changes
            </DialogTitle>
            <DialogDescription className="max-w-2xl text-sm leading-relaxed text-cq-text-secondary">
              We analysed {docCount} document{docCount === 1 ? '' : 's'} and identified{' '}
              {totalItems} suggested changes to your profile. Review each one, tweak the value if
              needed, then save.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-cq-text-secondary">
              Documents analysed
            </p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {session.analysedDocuments.map((doc) => (
                <li
                  key={doc}
                  className="inline-flex items-center gap-2 rounded-lg border border-cq-border bg-cq-bg px-3 py-2 text-sm text-cq-text"
                >
                  <FileText className="h-4 w-4 text-[var(--cq-green)]" aria-hidden />
                  <span className="max-w-[240px] truncate">{doc}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex-1 space-y-8 overflow-y-auto bg-cq-bg px-6 py-6 sm:px-8">
          <div className="space-y-4">
            {session.fieldChanges.map((change) => (
              <FieldChangeCard
                key={change.id}
                change={change}
                selected={selectedFields.has(change.id)}
                suggestedValue={editedValues[change.id] ?? change.suggestedValue}
                onToggle={() =>
                  setSelectedFields((prev) => {
                    const next = new Set(prev)
                    if (next.has(change.id)) next.delete(change.id)
                    else next.add(change.id)
                    return next
                  })
                }
                onValueChange={(value) =>
                  setEditedValues((prev) => ({ ...prev, [change.id]: value }))
                }
              />
            ))}
          </div>

          {session.caseStudies.length > 0 && (
            <section>
              <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-lg font-extrabold text-cq-text">Case studies</h3>
                <p className="text-sm text-cq-text-secondary">
                  0 current → {session.caseStudies.length} suggestions
                </p>
              </div>
              <div className="space-y-4">
                {session.caseStudies.map((study) => (
                  <CaseStudyCard
                    key={study.id}
                    study={study}
                    selected={selectedCaseStudies.has(study.id)}
                    onToggle={() =>
                      setSelectedCaseStudies((prev) => {
                        const next = new Set(prev)
                        if (next.has(study.id)) next.delete(study.id)
                        else next.add(study.id)
                        return next
                      })
                    }
                  />
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="flex shrink-0 items-center justify-between gap-4 border-t border-cq-border bg-white px-6 py-4 sm:px-8">
          <p className="text-sm text-cq-text-secondary">
            <span className="font-extrabold text-cq-text">{selectedCount}</span> of{' '}
            {totalItems} changes selected
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="btn-link"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={selectedCount === 0}
              onClick={handleApply}
              className="btn-primary"
            >
              Apply {selectedCount} change{selectedCount === 1 ? '' : 's'}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
