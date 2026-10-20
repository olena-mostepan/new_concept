'use client'

import type { ReactNode } from 'react'
import { formatGbp } from '@/lib/supplier/delivery/mock-data'
import { formatShortDate } from '@/lib/supplier/delivery/dates'
import {
  formatPct,
  hasApproximateAmounts,
} from '@/lib/supplier/delivery/payment-model'
import type { JobDeliveryDetail } from '@/lib/supplier/delivery/job-types'
import { MoneyWashCard } from '@/components/supplier/delivery/MoneyWashCard'

function WhiteMoneyCard({
  label,
  amount,
  children,
}: {
  label: string
  amount: string
  children: ReactNode
}) {
  return (
    <article className="rounded-xl border border-cq-border bg-white px-5 py-5 ">
      <p className="text-xs font-semibold uppercase tracking-wide text-cq-text-secondary">
        {label}
      </p>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-text-primary">
        {amount}
      </p>
      <div className="mt-2 text-sm text-cq-text-secondary">{children}</div>
    </article>
  )
}

export function JobMoneyCards({ job }: { job: JobDeliveryDetail }) {
  const stageCount = job.stages.length
  const next =
    job.stages.find((s) => s.status === 'next') ??
    job.stages.find((s) => s.name === job.currentStage)
  const approx = hasApproximateAmounts(job.stages)
  const commissionLabel = approx
    ? `≈ ${formatGbp(job.commissionAmount)}`
    : formatGbp(job.commissionAmount)

  return (
    <div className="grid gap-3 md:grid-cols-3">
      <MoneyWashCard as="article" className="px-5 py-5 sm:px-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--cq-green)]">
          Invoiceable now
        </p>
        <p className="mt-3 text-2xl font-semibold tracking-tight text-text-primary">
          {formatGbp(job.dueNow)}
        </p>
        <p className="mt-2 text-sm text-cq-text-secondary">
          {next && next.name !== 'Complete'
            ? `${next.name} · ${formatShortDate(next.date)}`
            : 'No stage ready'}
        </p>
      </MoneyWashCard>

      <WhiteMoneyCard label="Job value" amount={formatGbp(job.gmv)}>
        GMV · across {stageCount} stage{stageCount === 1 ? '' : 's'}
      </WhiteMoneyCard>

      <WhiteMoneyCard
        label="CQuel's commission"
        amount={formatPct(job.commissionPct)}
      >
        {commissionLabel} on {formatGbp(job.gmv)} GMV
      </WhiteMoneyCard>
    </div>
  )
}
