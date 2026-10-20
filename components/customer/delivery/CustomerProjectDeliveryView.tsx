'use client'

import * as React from 'react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { sectionTitleClass } from '@/lib/ui/headings'
import type {
  CustomerPhaseNode,
  CustomerProject,
  DateConfirmState,
} from '@/lib/customer/delivery/types'
import {
  confirmProjectPhase,
  patchProjectDates,
} from '@/lib/customer/delivery/mock-data'
import { formatShortDate } from '@/lib/customer/delivery/dates'
import { CustomerDeliveryCards } from '@/components/customer/delivery/CustomerDeliveryCards'
import { CustomerDeliveryPhasesStepper } from '@/components/customer/delivery/CustomerDeliveryPhasesStepper'
import { CustomerChangeDateModal } from '@/components/customer/delivery/CustomerChangeDateModal'

function statePill(state: DateConfirmState) {
  switch (state) {
    case 'needs_confirm':
      return {
        label: 'needs confirm',
        className:
          'border-[var(--cq-link)]/30 bg-[var(--cq-link)]/10 text-[var(--cq-link)]',
      }
    case 'estimate':
      return {
        label: 'estimate',
        className: 'border-cq-border bg-cq-bg text-cq-text-secondary',
      }
    case 'from_invoice':
      return {
        label: 'from invoice',
        className:
          'border-[var(--cq-link)]/30 bg-[var(--cq-link)]/10 text-[var(--cq-link)]',
      }
    default:
      return {
        label: 'confirmed',
        className:
          'border-[var(--cq-green)]/30 bg-[var(--cq-green)]/10 text-[var(--cq-green)]',
      }
  }
}

export function CustomerProjectDeliveryView({
  project: initial,
  onProjectChange,
}: {
  project: CustomerProject
  onProjectChange?: (project: CustomerProject) => void
}) {
  const [project, setProject] = React.useState(initial)
  const [modal, setModal] = React.useState<null | 'phase' | 'correct'>(null)
  const [datePhase, setDatePhase] = React.useState<CustomerPhaseNode | null>(
    null,
  )

  React.useEffect(() => {
    setProject(initial)
  }, [initial])

  const update = (next: CustomerProject) => {
    setProject(next)
    onProjectChange?.(next)
  }

  const currentPhase = project.phases.find(
    (p) => p.id === project.currentPhaseId,
  )

  function confirmYes() {
    update(confirmProjectPhase(project))
    toast.success('Stage confirmed')
  }

  return (
    <div className="space-y-6">
      <CustomerDeliveryCards project={project} />

      <CustomerDeliveryPhasesStepper
        project={project}
        onDateClick={(phase) => {
          setDatePhase(phase)
          setModal('phase')
        }}
        onYes={confirmYes}
        onChangeDate={() => {
          setDatePhase(currentPhase ?? null)
          setModal('phase')
        }}
      />

      <section className="overflow-hidden rounded-xl border border-cq-border bg-white ">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-cq-border px-5 py-4 sm:px-6">
          <h2 className={sectionTitleClass}>Key dates</h2>
          <button
            type="button"
            className="btn-secondary-sm"
            onClick={() => setModal('correct')}
            disabled={project.insight === 'complete'}
          >
            Correct dates
          </button>
        </header>
        <ul className="divide-y divide-cq-border">
          {(
            [
              ['Start', project.keyDates.start],
              ['Expected completion', project.keyDates.expectedCompletion],
              ['Last stage change', project.keyDates.lastStageChange],
            ] as const
          ).map(([label, entry]) => {
            const pill = statePill(entry.state)
            return (
              <li
                key={label}
                className="grid grid-cols-1 gap-2 px-5 py-4 sm:grid-cols-[1fr_10rem_auto_1fr] sm:items-center sm:gap-x-4 sm:px-6"
              >
                <p className="text-sm font-normal text-cq-text">{label}</p>
                <p className="text-left text-sm text-cq-text-secondary">
                  {entry.date
                    ? entry.state === 'estimate'
                      ? `est ${formatShortDate(entry.date)}`
                      : formatShortDate(entry.date)
                    : '—'}
                </p>
                <span
                  className={cn(
                    'inline-flex w-fit shrink-0 rounded-full border px-2.5 py-1 text-xs font-normal capitalize',
                    pill.className,
                  )}
                >
                  {pill.label}
                </span>
              </li>
            )
          })}
        </ul>
      </section>

      <CustomerChangeDateModal
        open={modal === 'phase'}
        onOpenChange={(open) => {
          if (!open) {
            setModal(null)
            setDatePhase(null)
          }
        }}
        title={`Confirm ${datePhase?.label ?? currentPhase?.label ?? 'date'}`}
        subtitle={`${project.name} · ${datePhase?.label ?? currentPhase?.label ?? 'Current stage'}`}
        stageLabel={datePhase?.label ?? currentPhase?.label ?? null}
        initialDate={datePhase?.date ?? currentPhase?.date ?? null}
        onConfirm={(date) => {
          const phaseId = datePhase?.id ?? project.currentPhaseId
          update(
            patchProjectDates(confirmProjectPhase(project, date), {
              phaseDate: { phaseId, date },
              ...(phaseId === 'start' || !project.startConfirmed
                ? { start: date }
                : {}),
            }),
          )
          toast.success('Stage date updated')
          setModal(null)
          setDatePhase(null)
        }}
      />

      <CustomerChangeDateModal
        open={modal === 'correct'}
        onOpenChange={(open) => {
          if (!open) setModal(null)
        }}
        title="Correct expected completion"
        subtitle={project.name}
        stageLabel="Expected completion"
        initialDate={project.keyDates.expectedCompletion.date}
        onConfirm={(date) => {
          update(patchProjectDates(project, { expectedCompletion: date }))
          toast.success('Key dates updated')
          setModal(null)
        }}
      />
    </div>
  )
}
