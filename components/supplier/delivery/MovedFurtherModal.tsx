'use client'

import * as React from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DeliveryClaim } from '@/lib/supplier/delivery/types'
import { claimSubtitle } from '@/lib/supplier/delivery/dates'
import { ClaimModalShell } from '@/components/supplier/delivery/ClaimModalShell'

export type MovedFurtherResult = { newStage: string; date: string }

export function MovedFurtherModal({
  open,
  onOpenChange,
  claim,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  claim: DeliveryClaim | null
  onConfirm: (claimId: string, result: MovedFurtherResult) => void
}) {
  const [newStage, setNewStage] = React.useState('')
  const [date, setDate] = React.useState('')

  React.useEffect(() => {
    if (!claim || !open) return
    const next =
      claim.stages.find((s) => !s.done)?.name ?? claim.currentStage
    setNewStage(next)
    setDate(new Date().toISOString().slice(0, 10))
  }, [claim, open])

  if (!claim) return null

  const selectedIdx = claim.stages.findIndex((s) => s.name === newStage)

  return (
    <ClaimModalShell
      open={open}
      onOpenChange={onOpenChange}
      title="It's moved further"
      subtitle={claimSubtitle(claim)}
      primaryLabel="Confirm stage"
      primaryDisabled={!newStage || !date}
      onPrimary={() => {
        onConfirm(claim.id, { newStage, date })
        onOpenChange(false)
      }}
    >
      <div className="space-y-2">
        <p className="text-sm font-normal text-cq-text">
          Which stage is it at now?
        </p>
        <ul className="space-y-2">
          {claim.stages.map((stage, idx) => {
            const isDoneBefore = idx < selectedIdx
            const selected = stage.name === newStage
            return (
              <li key={stage.name}>
                <label
                  className={cn(
                    'flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-3 transition-colors',
                    selected
                      ? 'border-[var(--cq-green)] bg-[var(--cq-accent-muted)]'
                      : 'border-cq-border bg-white hover:bg-cq-bg/60',
                  )}
                >
                  <input
                    type="radio"
                    name="moved-stage"
                    className="mt-1 accent-[var(--cq-green)]"
                    checked={selected}
                    onChange={() => setNewStage(stage.name)}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2 text-sm font-normal text-cq-text">
                      {stage.name}
                      {isDoneBefore ? (
                        <Check
                          className="h-3.5 w-3.5 text-emerald-600"
                          aria-label="done"
                        />
                      ) : null}
                    </span>
                    {selected ? (
                      <span className="mt-2 block space-y-1.5">
                        <label
                          htmlFor="moved-date"
                          className="text-xs font-semibold uppercase tracking-wide text-cq-text-secondary"
                        >
                          When it reached this stage
                        </label>
                        <input
                          id="moved-date"
                          type="date"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          className="w-full rounded-lg border border-cq-border bg-white px-3 py-2 text-sm text-cq-text focus:border-[var(--cq-green)] focus:outline-none focus:ring-1 focus:ring-[var(--cq-green)]"
                        />
                      </span>
                    ) : null}
                  </span>
                </label>
              </li>
            )
          })}
        </ul>
      </div>
    </ClaimModalShell>
  )
}
