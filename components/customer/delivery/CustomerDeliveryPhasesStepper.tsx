'use client'

import * as React from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { sectionTitleClass } from '@/lib/ui/headings'
import { formatShortDate } from '@/lib/customer/delivery/dates'
import type { CustomerPhaseNode, CustomerProject } from '@/lib/customer/delivery/types'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function CustomerDeliveryPhasesStepper({
  project,
  onDateClick,
  onYes,
  onChangeDate,
}: {
  project: CustomerProject
  onDateClick: (phase: CustomerPhaseNode) => void
  onYes: () => void
  onChangeDate: () => void
}) {
  const showConfirm =
    project.currentPhaseId !== 'complete' && project.insight !== 'complete'
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <section className="rounded-xl border border-cq-border bg-white px-5 py-5  sm:px-6">
      <h2 className={sectionTitleClass}>Delivery phases</h2>

      <ol className="mt-6 flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-0">
        {project.phases.map((phase, index) => {
          const kind = phase.status
          const isLast = index === project.phases.length - 1
          const isCurrent = kind === 'current'
          const isConfirmNode = isCurrent && showConfirm
          const lineFilled = kind === 'done'

          return (
            <li
              key={phase.id}
              className="relative flex flex-1 gap-3 lg:flex-col lg:items-center lg:gap-3 lg:px-0"
            >
              {!isLast ? (
                <span
                  className={cn(
                    'pointer-events-none absolute hidden lg:block',
                    'left-1/2 top-4 z-0 h-px w-full',
                    lineFilled ? 'bg-[var(--cq-green)]' : 'bg-cq-border',
                  )}
                  aria-hidden
                />
              ) : null}

              {!isLast ? (
                <span
                  className={cn(
                    'pointer-events-none absolute left-4 top-8 z-0 h-[calc(100%+0.5rem)] w-px lg:hidden',
                    lineFilled ? 'bg-[var(--cq-green)]' : 'bg-cq-border',
                  )}
                  aria-hidden
                />
              ) : null}

              <div className="relative z-10 flex shrink-0 flex-col items-center bg-white">
                <span
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold',
                    kind === 'done' &&
                      'border-[var(--cq-green)] bg-[var(--cq-green)] text-white',
                    kind === 'current' &&
                      'border-[var(--cq-green)] bg-white text-[var(--cq-green)] ring-4 ring-[var(--cq-accent-muted)]',
                    kind === 'upcoming' &&
                      'border-cq-border bg-cq-bg text-cq-muted',
                  )}
                >
                  {kind === 'done' ? (
                    <Check className="h-4 w-4" strokeWidth={2.5} aria-hidden />
                  ) : (
                    index + 1
                  )}
                </span>
              </div>

              <div
                className={cn(
                  'relative z-10 min-w-0 flex-1 lg:w-full lg:flex-none lg:text-center',
                  isConfirmNode &&
                    'rounded-lg border border-[var(--cq-green)]/40 bg-[var(--cq-accent-muted)]/50 px-3 py-3 lg:mt-1 lg:px-2',
                )}
              >
                <p
                  className={cn(
                    'text-sm font-normal',
                    kind === 'upcoming'
                      ? 'text-cq-text-secondary'
                      : 'text-cq-text',
                  )}
                >
                  {phase.shortLabel}
                </p>

                {isCurrent && phase.daysInPhase != null ? (
                  <p className="mt-0.5 text-sm font-semibold text-text-primary">
                    {phase.daysInPhase}d in stage
                    {phase.overdue ? ' · overdue' : ''}
                  </p>
                ) : (
                  <p className="mt-0.5 text-sm text-cq-muted">—</p>
                )}

                <button
                  type="button"
                  className={cn(
                    'mt-1 text-sm underline-offset-2 hover:underline',
                    kind === 'upcoming'
                      ? 'text-cq-muted'
                      : 'text-cq-text-secondary',
                  )}
                  onClick={() => onDateClick(phase)}
                >
                  {phase.date
                    ? kind === 'upcoming'
                      ? `est ${formatShortDate(phase.date)}`
                      : formatShortDate(phase.date)
                    : '—'}
                </button>

                {isConfirmNode ? (
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
                            Yes — looks right
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={onChangeDate}
                          >
                            Change date
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
                ) : isCurrent ? (
                  <p className="mt-2 text-xs text-cq-text-secondary lg:mx-auto lg:max-w-[12rem]">
                    we think this is the current stage
                  </p>
                ) : null}
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
