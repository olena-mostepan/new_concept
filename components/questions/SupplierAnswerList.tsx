import { FileText } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import type { SupplierAnswer } from '@/lib/questions/types'
import { answerCanBeAsked } from '@/lib/questions/needs-supplier'
import { cn } from '@/lib/utils'

const STATUS_DOT: Record<SupplierAnswer['status'], string> = {
  answered: 'bg-emerald-500',
  partial: 'bg-amber-500',
  awaiting: 'bg-red-500',
  sent: 'bg-sky-500',
  not_asked: 'bg-cq-border',
}

const checkboxCx =
  'border-cq-border data-[state=checked]:border-cq-green data-[state=checked]:bg-[var(--cq-green)] data-[state=checked]:text-white'

function statusLabel(a: SupplierAnswer): string {
  if (a.status === 'sent') return 'Sent'
  if (a.status === 'awaiting') return 'Missing from bid'
  if (a.status === 'not_asked') return '—'
  if (a.answerText) return a.answerText
  return '—'
}

function answerAttachments(a: SupplierAnswer) {
  if (a.attachments?.length) return a.attachments
  return []
}

export function SupplierAnswerList({
  answers,
  emptyLabel = 'No supplier answers yet',
  hideAgeLabels = false,
  selection,
}: {
  answers: SupplierAnswer[]
  emptyLabel?: string
  /** Hide per-answer age labels (ops question detail). */
  hideAgeLabels?: boolean
  /** Bulk-select suppliers before asking. */
  selection?: {
    selectedIds: Set<string>
    onSelectionChange: (ids: Set<string>) => void
  }
}) {
  const visible = answers.filter((a) => a.status !== 'not_asked')
  if (visible.length === 0) {
    return <p className="text-sm text-cq-text-secondary">{emptyLabel}</p>
  }

  const toggleSelection = (supplierId: string, checked: boolean) => {
    if (!selection) return
    const next = new Set(selection.selectedIds)
    if (checked) next.add(supplierId)
    else next.delete(supplierId)
    selection.onSelectionChange(next)
  }

  return (
    <ul className="space-y-3">
      {visible.map((a) => {
        const attachments = answerAttachments(a)
        const isSelectable = answerCanBeAsked(a)
        const checkboxId = `supplier-answer-${a.supplierId}`

        return (
          <li
            key={a.supplierId}
            className="flex items-start gap-2 text-sm leading-relaxed text-cq-text"
          >
            {selection ? (
              <Checkbox
                id={checkboxId}
                checked={selection.selectedIds.has(a.supplierId)}
                disabled={!isSelectable}
                onCheckedChange={(c) => toggleSelection(a.supplierId, c === true)}
                className={cn('mt-0.5', checkboxCx)}
                aria-label={
                  isSelectable
                    ? `Select ${a.supplierName}`
                    : a.status === 'sent'
                      ? `${a.supplierName} — sent, awaiting response`
                      : `${a.supplierName} — not selectable`
                }
              />
            ) : null}
            <span
              className={cn('mt-2 h-2 w-2 shrink-0 rounded-full', STATUS_DOT[a.status])}
              aria-hidden
            />
            <div className="min-w-0 flex-1">
              <p>
                <span className="font-semibold">{a.supplierName}:</span>{' '}
                <span
                  className={cn(
                    (a.status === 'awaiting' ||
                      a.status === 'sent' ||
                      a.status === 'not_asked') &&
                      'text-cq-text-secondary',
                  )}
                >
                  {statusLabel(a)}
                </span>
                {!hideAgeLabels &&
                  a.ageLabel &&
                  a.status !== 'not_asked' &&
                  a.status !== 'awaiting' &&
                  a.status !== 'sent' && (
                    <span className="ml-1 text-xs text-cq-text-secondary">{a.ageLabel}</span>
                  )}
              </p>
              {attachments.length > 0 && (
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
                      <span className="min-w-0 truncate font-medium text-cq-text">
                        {file.name}
                      </span>
                      <span className="shrink-0 tabular-nums text-cq-text-secondary">
                        {file.sizeLabel}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </li>
        )
      })}
    </ul>
  )
}
