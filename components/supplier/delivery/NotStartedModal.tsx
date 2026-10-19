'use client'

import * as React from 'react'
import type { DeliveryClaim } from '@/lib/supplier/delivery/types'
import { claimSubtitle } from '@/lib/supplier/delivery/dates'
import { ClaimModalShell } from '@/components/supplier/delivery/ClaimModalShell'

export type NotStartedResult = { startDate: string }

export function NotStartedModal({
  open,
  onOpenChange,
  claim,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  claim: DeliveryClaim | null
  onConfirm: (claimId: string, result: NotStartedResult) => void
}) {
  const [startDate, setStartDate] = React.useState('')

  React.useEffect(() => {
    if (!claim || !open) return
    setStartDate(claim.projectedDate)
  }, [claim, open])

  if (!claim) return null

  return (
    <ClaimModalShell
      open={open}
      onOpenChange={onOpenChange}
      title="Not started yet"
      subtitle={claimSubtitle(claim)}
      primaryLabel="Set start date"
      primaryDisabled={!startDate}
      onPrimary={() => {
        onConfirm(claim.id, { startDate })
        onOpenChange(false)
      }}
    >
      <div className="space-y-1.5">
        <label
          htmlFor="not-started-date"
          className="text-sm font-medium text-cq-text"
        >
          When will this start?
        </label>
        <input
          id="not-started-date"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-full rounded-lg border border-cq-border bg-white px-3 py-2.5 text-sm text-cq-text focus:border-[var(--cq-green)] focus:outline-none focus:ring-1 focus:ring-[var(--cq-green)]"
        />
        <p className="text-xs text-cq-text-secondary">
          A month is fine if you don&apos;t have the exact day.
        </p>
      </div>

      <p className="rounded-lg border border-cq-border bg-cq-bg/50 px-3 py-2.5 text-sm text-cq-text-secondary">
        We&apos;ll hold the later stages until it starts.
      </p>
    </ClaimModalShell>
  )
}
