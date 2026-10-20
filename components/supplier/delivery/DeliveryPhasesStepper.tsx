'use client'

import * as React from 'react'
import { Check, ChevronDown, HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatGbp } from '@/lib/supplier/delivery/mock-data'
import { formatShortDate } from '@/lib/supplier/delivery/dates'
import {
  effectiveStageAmount,
  formatPct,
} from '@/lib/supplier/delivery/payment-model'
import {
  isFarFutureStage,
  isStageOverdue,
  shouldNudgeConfirm,
} from '@/lib/supplier/delivery/stage-confidence'
import { sectionTitleClass } from '@/lib/ui/headings'
import type { JobDeliveryDetail, JobDeliveryStage } from '@/lib/supplier/delivery/job-types'
import { StageConfidenceChip } from '@/components/supplier/delivery/StageConfidenceChip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

function nodeKind(stage: JobDeliveryStage): 'done' | 'current' | 'upcoming' {
  if (stage.status === 'paid' || stage.status === 'invoiced') return 'done'
  if (stage.status === 'next') return 'current'
  return 'upcoming'
}

export function DeliveryPhasesStepper({
  job,
  onDateClick,
  onYes,
  onChangeDate,
  onMovedOn,
  onAlreadyInvoiced,
  onUploadInvoice,
  onEditPlan,
}: {
  job: JobDeliveryDetail
  onDateClick: (stage: JobDeliveryStage) => void
  onYes: () => void
  onChangeDate: () => void
  onMovedOn: () => void
  onAlreadyInvoiced: () => void
  onUploadInvoice: (stage: JobDeliveryStage) => void
  onEditPlan: () => void
}) {
  const settled = job.confirmStatus === 'settled'
  const [mounted, setMounted] = React.useState(false)
  const [hovered, setHovered] = React.useState<number | null>(null)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <section className="overflow-hidden rounded-xl border border-cq-border bg-white ">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-cq-border px-5 py-4 sm:px-6">
        <h2 className={sectionTitleClass}>Delivery phases</h2>
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

      <ol
        className="flex flex-col gap-8 px-5 py-6 sm:px-6 lg:flex-row lg:items-start lg:gap-0"
        aria-label="Delivery phases — click a stage to change its date"
      >
        {job.stages.map((stage, index) => {
          const kind = nodeKind(stage)
          const isLast = index === job.stages.length - 1
          const isCurrent = kind === 'current'
          const overdue = isStageOverdue(stage)
          const far = isFarFutureStage(stage)
          const showConfirm = shouldNudgeConfirm(stage, {
            isCurrent,
            settled,
          })
          const showPrompt = (overdue && isCurrent) || showConfirm
          const lineFilled = kind === 'done'
          const active = hovered === index && !settled

          return (
            <li
              key={stage.name}
              className={cn(
                'relative flex flex-1 gap-3 lg:flex-col lg:items-center lg:gap-3 lg:px-0',
                far && kind === 'upcoming' && 'opacity-70',
              )}
            >
              {!isLast ? (
                <span
                  className={cn(
                    'pointer-events-none absolute hidden lg:block',
                    'left-1/2 top-4 z-0 h-0.5 w-full',
                    active || hovered === index + 1
                      ? 'bg-[var(--cq-green)]/40'
                      : lineFilled
                        ? 'bg-neutral-400'
                        : far
                          ? 'border-t border-dashed border-neutral-200 bg-transparent'
                          : 'bg-neutral-200',
                  )}
                  aria-hidden
                />
              ) : null}

              {!isLast ? (
                <span
                  className={cn(
                    'pointer-events-none absolute left-4 top-8 z-0 h-[calc(100%+0.5rem)] w-0.5 lg:hidden',
                    active || hovered === index + 1
                      ? 'bg-[var(--cq-green)]/40'
                      : lineFilled
                        ? 'bg-neutral-400'
                        : far
                          ? 'border-l border-dashed border-neutral-200 bg-transparent'
                          : 'bg-neutral-200',
                  )}
                  aria-hidden
                />
              ) : null}

              <div className="relative z-10 flex shrink-0 flex-col items-center bg-white">
                <button
                  type="button"
                  disabled={settled}
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cq-green)] focus-visible:ring-offset-1',
                    settled ? 'cursor-default' : 'cursor-pointer',
                    !active &&
                      kind === 'done' &&
                      'border-neutral-400 bg-neutral-400 text-white',
                    !active &&
                      kind === 'current' &&
                      'border-neutral-500 bg-white text-neutral-600',
                    !active &&
                      kind === 'upcoming' &&
                      (far
                        ? 'border-dashed border-neutral-200 bg-neutral-50 text-neutral-400'
                        : 'border-neutral-200 bg-neutral-50 text-neutral-400'),
                    active &&
                      'border-[var(--cq-green)] bg-[var(--cq-green)] text-white',
                  )}
                  onMouseEnter={() => setHovered(index)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => onDateClick(stage)}
                  aria-label={`Change date for ${stage.name}`}
                >
                  {kind === 'done' ? (
                    <Check className="h-4 w-4" strokeWidth={2.5} aria-hidden />
                  ) : (
                    index + 1
                  )}
                </button>
              </div>

              <div
                className={cn(
                  'relative z-10 min-w-0 flex-1 lg:w-full lg:flex-none lg:text-center',
                  showPrompt &&
                    'rounded-lg border border-cq-border bg-cq-bg/80 px-3 py-3 lg:mt-1 lg:px-2',
                )}
              >
                <p
                  className={cn(
                    'text-sm font-normal',
                    kind === 'upcoming' ? 'text-cq-text-secondary' : 'text-cq-text',
                  )}
                >
                  {stage.name}
                </p>

                {stage.name !== 'Complete' ? (
                  <div className="mt-1 flex lg:justify-center">
                    <StageConfidenceChip stage={stage} />
                  </div>
                ) : null}

                {stage.name !== 'Complete' && stage.pct > 0 ? (
                  <p className="mt-1 text-sm font-semibold text-text-primary">
                    <span className="text-cq-text-secondary">
                      {formatPct(stage.pct)}
                    </span>
                    <span className="mx-1 text-cq-muted">·</span>
                    {stage.amountSource === 'model' &&
                    stage.status !== 'paid' &&
                    stage.status !== 'invoiced'
                      ? `≈ ${formatGbp(effectiveStageAmount(stage))}`
                      : formatGbp(effectiveStageAmount(stage))}
                  </p>
                ) : (
                  <p className="mt-1 text-sm text-cq-muted">—</p>
                )}

                <button
                  type="button"
                  className={cn(
                    'mt-1 text-sm underline-offset-2 hover:underline',
                    kind === 'upcoming'
                      ? 'text-cq-muted'
                      : 'text-cq-text-secondary',
                  )}
                  onClick={() => onDateClick(stage)}
                >
                  {kind === 'upcoming' || stage.est
                    ? `est ${formatShortDate(stage.date)}`
                    : formatShortDate(stage.date)}
                </button>

                {overdue && isCurrent ? (
                  <div className="mt-3 flex flex-col items-stretch gap-2 lg:items-center">
                    {mounted ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            className="btn-primary-sm inline-flex w-full justify-center lg:w-auto"
                          >
                            Confirm
                            <ChevronDown className="h-4 w-4" aria-hidden />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="center" className="w-56">
                          <DropdownMenuItem
                            className="cursor-pointer font-normal"
                            onClick={onChangeDate}
                          >
                            Change date
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => onUploadInvoice(stage)}
                          >
                            Upload invoice
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={onMovedOn}
                          >
                            It&apos;s moved
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <button
                        type="button"
                        className="btn-primary-sm inline-flex w-full justify-center lg:w-auto"
                        disabled
                      >
                        Confirm
                        <ChevronDown className="h-4 w-4" aria-hidden />
                      </button>
                    )}
                  </div>
                ) : showConfirm ? (
                  <div className="mt-3 flex flex-col items-stretch gap-2 lg:items-center">
                    <p className="text-xs text-cq-text-secondary">
                      Is this right?
                    </p>
                    {mounted ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            className="btn-primary-sm inline-flex w-full justify-center lg:w-auto"
                          >
                            Confirm
                            <ChevronDown className="h-4 w-4" aria-hidden />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="center" className="w-56">
                          <DropdownMenuItem
                            className="cursor-pointer font-normal"
                            onClick={onYes}
                          >
                            Yes — raise it
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={onChangeDate}
                          >
                            Change date
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={onMovedOn}
                          >
                            It&apos;s moved on
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={onAlreadyInvoiced}
                          >
                            Already invoiced
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <button
                        type="button"
                        className="btn-primary-sm inline-flex w-full justify-center lg:w-auto"
                        disabled
                      >
                        Confirm
                        <ChevronDown className="h-4 w-4" aria-hidden />
                      </button>
                    )}
                  </div>
                ) : null}
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
