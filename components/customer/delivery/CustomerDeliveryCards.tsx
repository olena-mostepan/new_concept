'use client'

import type { ReactNode } from 'react'
import type { CustomerProject } from '@/lib/customer/delivery/types'
import { formatShortDate } from '@/lib/customer/delivery/dates'
import { MoneyWashCard } from '@/components/supplier/delivery/MoneyWashCard'

function WhiteCard({
  label,
  value,
  children,
}: {
  label: string
  value: string
  children: ReactNode
}) {
  return (
    <article className="rounded-xl border border-cq-border bg-white px-5 py-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-cq-text-secondary">
        {label}
      </p>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-text-primary">
        {value}
      </p>
      <div className="mt-2 text-sm text-cq-text-secondary">{children}</div>
    </article>
  )
}

export function CustomerDeliveryCards({
  project,
}: {
  project: CustomerProject
}) {
  const current =
    project.phases.find((p) => p.id === project.currentPhaseId) ??
    project.phases.find((p) => p.status === 'current')
  const stageCount = project.phases.filter((p) => p.id !== 'complete').length
  const completion = project.keyDates.expectedCompletion
  const completionLabel = completion.date
    ? completion.state === 'estimate'
      ? `est ${formatShortDate(completion.date)}`
      : formatShortDate(completion.date)
    : '—'

  const highlightLabel = project.needsConfirm ? 'Confirm date' : 'Current stage'
  const highlightValue = current?.shortLabel ?? '—'
  const highlightDetail = project.needsConfirm
    ? project.confirmBanner
      ? `${project.confirmBanner.phaseLabel} · ${project.confirmBanner.nextAround}`
      : 'Date needs confirming'
    : current?.date
      ? current.daysInPhase
        ? `${formatShortDate(current.date)} · ${current.daysInPhase} days in phase`
        : formatShortDate(current.date)
      : project.insight === 'awaiting_start'
        ? 'Awaiting start'
        : 'No date set'

  return (
    <div className="grid gap-3 md:grid-cols-3">
      <MoneyWashCard as="article" className="px-5 py-5 sm:px-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--cq-green)]">
          {highlightLabel}
        </p>
        <p className="mt-3 text-2xl font-semibold tracking-tight text-text-primary">
          {highlightValue}
        </p>
        <p className="mt-2 text-sm text-cq-text-secondary">{highlightDetail}</p>
      </MoneyWashCard>

      <WhiteCard
        label="Contract value"
        value={project.overview.contractValue}
      >
        across {stageCount} delivery stages
      </WhiteCard>

      <WhiteCard label="Expected completion" value={completionLabel}>
        {project.insightLabel}
        {project.supplier ? ` · ${project.supplier}` : null}
      </WhiteCard>
    </div>
  )
}
