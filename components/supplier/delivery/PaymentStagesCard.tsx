'use client'

import { AlertCircle, FileUp, HelpCircle, Pencil } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatGbp } from '@/lib/supplier/delivery/mock-data'
import { formatShortDate } from '@/lib/supplier/delivery/dates'
import {
  effectiveStageAmount,
  formatPct,
  hasInvoiceConflict,
} from '@/lib/supplier/delivery/payment-model'
import { isStageOverdue } from '@/lib/supplier/delivery/stage-confidence'
import { sectionTitleClass } from '@/lib/ui/headings'
import type {
  JobDeliveryDetail,
  JobDeliveryStage,
  JobStageStatus,
} from '@/lib/supplier/delivery/job-types'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

const PILL: Record<
  JobStageStatus,
  { label: string; className: string }
> = {
  paid: {
    label: 'paid',
    className: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  },
  invoiced: {
    label: 'invoiced',
    className: 'border-sky-200 bg-sky-50 text-sky-800',
  },
  next: {
    label: 'next',
    className:
      'border-[var(--cq-link)]/30 bg-[var(--cq-link)]/10 text-[var(--cq-link)]',
  },
  upcoming: {
    label: 'est',
    className: 'border-cq-border bg-cq-bg text-cq-text-secondary',
  },
}

export function PaymentStagesCard({
  job,
  onEditDate,
  onEditPlan,
  onUploadInvoice,
  onUseInvoiceAmount,
  onKeepModel,
  onMovedOn,
}: {
  job: JobDeliveryDetail
  onEditDate: (stage: JobDeliveryStage) => void
  onEditPlan: () => void
  onUploadInvoice: (stage: JobDeliveryStage) => void
  onUseInvoiceAmount: (stage: JobDeliveryStage) => void
  onKeepModel: (stage: JobDeliveryStage) => void
  onMovedOn: (stage: JobDeliveryStage) => void
}) {
  const rows = job.stages
  const settled = job.confirmStatus === 'settled'

  return (
    <section className="overflow-hidden rounded-xl border border-cq-border bg-white shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-cq-border px-5 py-4 sm:px-6">
        <div className="min-w-0">
          <h2 className={sectionTitleClass}>Payment stages &amp; dates</h2>
          <p className="mt-1 text-sm text-cq-text-secondary">
            From the{' '}
            <span className="font-normal text-cq-text">{job.model.name}</span>{' '}
            payment plan
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="inline-flex h-7 w-7 items-center justify-center rounded-full text-cq-muted transition-colors hover:bg-cq-bg hover:text-cq-text-secondary"
                  aria-label="About Edit plan"
                >
                  <HelpCircle className="h-4 w-4" aria-hidden />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" align="end" className="max-w-[18rem] text-xs leading-relaxed">
                Change how this project&apos;s value is split across payment
                stages. You can also apply the same plan to other projects in
                the programme.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <button
            type="button"
            className="btn-secondary-sm"
            onClick={onEditPlan}
            disabled={settled}
          >
            Edit plan
          </button>
        </div>
      </header>

      <div className="hidden border-b border-cq-border px-5 py-2 text-xs font-semibold uppercase tracking-wide text-cq-muted sm:grid sm:grid-cols-[minmax(0,1.15fr)_2.75rem_minmax(0,0.85fr)_minmax(0,0.85fr)_minmax(0,0.95fr)_minmax(5.5rem,auto)_minmax(4.5rem,auto)] sm:gap-x-4 sm:gap-y-2 sm:px-6">
        <span>Stage</span>
        <span>%</span>
        <span>£</span>
        <span>Commission</span>
        <span>Date</span>
        <span className="text-left">Status</span>
        <span className="pl-6 text-left">Invoice</span>
      </div>

      <ul className="divide-y divide-cq-border">
        {rows.map((stage) => {
          const isComplete = stage.name === 'Complete'
          const pill = PILL[stage.status]
          const conflict = !isComplete && hasInvoiceConflict(stage)
          const overdue = !isComplete && isStageOverdue(stage)
          const approx =
            !isComplete &&
            stage.amountSource === 'model' &&
            stage.status !== 'paid' &&
            stage.status !== 'invoiced'
          const displayAmount = effectiveStageAmount(stage)
          const stageCommission = isComplete
            ? 0
            : Math.round((displayAmount * job.commissionPct) / 100)
          const dateLabel =
            stage.est || stage.status === 'upcoming'
              ? `est ${formatShortDate(stage.date)}`
              : formatShortDate(stage.date)

          return (
            <li key={stage.name} className="px-5 py-4 sm:px-6">
              <div className="flex flex-col gap-2 sm:grid sm:grid-cols-[minmax(0,1.15fr)_2.75rem_minmax(0,0.85fr)_minmax(0,0.85fr)_minmax(0,0.95fr)_minmax(5.5rem,auto)_minmax(4.5rem,auto)] sm:items-center sm:gap-x-4 sm:gap-y-2">
                <p className="text-sm font-normal text-cq-text">{stage.name}</p>
                <p
                  className={cn(
                    'text-sm',
                    isComplete || stage.pct <= 0
                      ? 'text-cq-muted'
                      : 'font-semibold text-cq-text',
                  )}
                >
                  {isComplete || stage.pct <= 0 ? '—' : formatPct(stage.pct)}
                </p>
                <p
                  className={cn(
                    'text-sm',
                    isComplete || stage.pct <= 0
                      ? 'text-cq-muted'
                      : 'font-semibold text-text-primary',
                  )}
                >
                  {isComplete || stage.pct <= 0
                    ? '—'
                    : approx
                      ? `≈ ${formatGbp(displayAmount)}`
                      : formatGbp(displayAmount)}
                </p>
                <p
                  className={cn(
                    'text-sm',
                    isComplete || stage.pct <= 0
                      ? 'text-cq-muted'
                      : 'text-cq-text-secondary',
                  )}
                >
                  {isComplete || stage.pct <= 0
                    ? '—'
                    : approx
                      ? `≈ ${formatGbp(stageCommission)}`
                      : formatGbp(stageCommission)}
                </p>
                <button
                  type="button"
                  className={cn(
                    'inline-flex w-fit items-center gap-1.5 text-sm text-cq-text-secondary transition-colors',
                    overdue && 'font-normal text-cq-text',
                    settled ? 'cursor-default' : 'hover:text-cq-text',
                  )}
                  onClick={() => !settled && onEditDate(stage)}
                  disabled={settled}
                  aria-label={`Edit date for ${stage.name}`}
                >
                  <span>{dateLabel}</span>
                  {!settled ? (
                    <Pencil className="h-3 w-3 shrink-0" aria-hidden />
                  ) : null}
                </button>
                <div className="justify-self-start">
                  {isComplete ? (
                    <span className="text-sm text-cq-muted">—</span>
                  ) : (
                    <span
                      className={cn(
                        'inline-flex w-fit shrink-0 rounded-full border px-2.5 py-1 text-xs font-normal capitalize',
                        overdue
                          ? 'border-red-200 bg-red-50 text-red-700'
                          : pill.className,
                      )}
                    >
                      {overdue ? 'overdue' : pill.label}
                    </span>
                  )}
                </div>
                <div className="justify-self-start pl-6">
                  {!settled && !isComplete ? (
                    <button
                      type="button"
                      className="btn-link inline-flex items-center gap-1 text-xs"
                      onClick={() => onUploadInvoice(stage)}
                    >
                      <FileUp className="h-3 w-3" aria-hidden />
                      Upload
                    </button>
                  ) : (
                    <span className="text-sm text-cq-muted">—</span>
                  )}
                </div>
              </div>

              {overdue ? (
                <div className="mt-3 flex flex-col gap-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                  <p className="flex min-w-0 items-start gap-2 text-sm text-cq-text">
                    <AlertCircle
                      className="mt-0.5 h-4 w-4 shrink-0 text-amber-600"
                      aria-hidden
                    />
                    <span>
                      Expected{' '}
                      <span className="font-semibold">
                        {formatShortDate(stage.date)}
                      </span>{' '}
                      — no invoice yet. What happened?
                    </span>
                  </p>
                  <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
                    <button
                      type="button"
                      className="btn-primary-sm"
                      onClick={() => onUploadInvoice(stage)}
                    >
                      Upload invoice
                    </button>
                    <button
                      type="button"
                      className="btn-secondary-sm"
                      onClick={() => onMovedOn(stage)}
                    >
                      It&apos;s moved
                    </button>
                    <button
                      type="button"
                      className="btn-secondary-sm"
                      onClick={() => onEditDate(stage)}
                    >
                      Change date
                    </button>
                  </div>
                </div>
              ) : null}

              {conflict && stage.invoiceAmount != null ? (
                <div className="mt-3 flex flex-col gap-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                  <p className="flex min-w-0 items-start gap-2 text-sm text-cq-text">
                    <AlertCircle
                      className="mt-0.5 h-4 w-4 shrink-0 text-amber-600"
                      aria-hidden
                    />
                    <span>
                      Model said{' '}
                      <span className="font-semibold">
                        {formatGbp(stage.amount)}
                      </span>
                      , invoice came in at{' '}
                      <span className="font-semibold">
                        {formatGbp(stage.invoiceAmount)}
                      </span>
                      .
                    </span>
                  </p>
                  <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
                    <button
                      type="button"
                      className="btn-primary-sm"
                      onClick={() => onUseInvoiceAmount(stage)}
                    >
                      Use invoice amount
                    </button>
                    <button
                      type="button"
                      className="btn-secondary-sm"
                      onClick={() => onKeepModel(stage)}
                    >
                      Keep model
                    </button>
                  </div>
                </div>
              ) : null}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
