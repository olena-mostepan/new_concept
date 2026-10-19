'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import type { DeliveryClaim } from '@/lib/supplier/delivery/types'
import {
  claimSubtitle,
  formatShortDate,
  getNextStages,
  getStagesFrom,
  monthValueToIso,
  shiftStagesByDelta,
  toMonthValue,
} from '@/lib/supplier/delivery/dates'
import { ClaimModalShell } from '@/components/supplier/delivery/ClaimModalShell'

type Precision = 'day' | 'month'

export type ChangeDateResult = {
  stage: string
  actualDate: string
  shiftedNextStages: Array<{
    stage: string
    projectedDate: string
    newDate: string
  }>
}

export function ChangeDateModal({
  open,
  onOpenChange,
  claim,
  focusStage = null,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  claim: DeliveryClaim | null
  /** When set, edit this stage's date (e.g. clicked from the graph). */
  focusStage?: string | null
  onConfirm: (claimId: string, result: ChangeDateResult) => void
}) {
  const [precision, setPrecision] = React.useState<Precision>('day')
  const [actualDate, setActualDate] = React.useState('')

  const stageName = focusStage || claim?.currentStage || ''
  const stageDate =
    claim?.stages.find((s) => s.name === stageName)?.projectedDate ??
    claim?.projectedDate ??
    ''

  React.useEffect(() => {
    if (!claim || !open) return
    setPrecision('day')
    setActualDate(stageDate)
  }, [claim, open, stageDate])

  if (!claim) return null

  const baselineDate = stageDate || claim.projectedDate
  const toShift = focusStage
    ? getStagesFrom(claim, focusStage)
    : [
        {
          stage: claim.currentStage,
          projectedDate: claim.projectedDate,
        },
        ...getNextStages(claim),
      ]

  const shifted = actualDate
    ? shiftStagesByDelta(toShift, baselineDate, actualDate)
    : toShift.map((s) => ({ ...s, newDate: s.projectedDate }))

  const previewRows = shifted.filter((row) => row.stage !== stageName)

  return (
    <ClaimModalShell
      open={open}
      onOpenChange={onOpenChange}
      title="Change the date"
      subtitle={
        focusStage
          ? `${claim.job} · ${focusStage}`
          : claimSubtitle(claim)
      }
      primaryLabel="Confirm date"
      primaryDisabled={!actualDate}
      onPrimary={() => {
        onConfirm(claim.id, {
          stage: stageName || claim.currentStage,
          actualDate,
          shiftedNextStages: shifted,
        })
        onOpenChange(false)
      }}
    >
      <div className="space-y-1.5">
        <p className="text-sm font-medium text-cq-text">
          {focusStage
            ? `When did '${focusStage}' actually happen?`
            : 'When did it actually happen?'}
        </p>
        <div className="inline-flex rounded-lg border border-cq-border bg-cq-bg p-1">
          {(['day', 'month'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => {
                setPrecision(mode)
                if (mode === 'month' && actualDate) {
                  setActualDate(monthValueToIso(toMonthValue(actualDate), 15))
                }
              }}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm font-medium capitalize transition-colors',
                precision === mode
                  ? 'bg-white text-black shadow-sm'
                  : 'text-cq-text-secondary hover:text-cq-text',
              )}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="change-date-input"
          className="text-xs font-semibold uppercase tracking-wide text-cq-text-secondary"
        >
          {precision === 'day' ? 'Date' : 'Month'}
        </label>
        {precision === 'day' ? (
          <input
            id="change-date-input"
            type="date"
            value={actualDate}
            onChange={(e) => setActualDate(e.target.value)}
            className="w-full rounded-lg border border-cq-border bg-white px-3 py-2.5 text-sm text-cq-text focus:border-[var(--cq-green)] focus:outline-none focus:ring-1 focus:ring-[var(--cq-green)]"
          />
        ) : (
          <input
            id="change-date-input"
            type="month"
            value={actualDate ? toMonthValue(actualDate) : ''}
            onChange={(e) =>
              setActualDate(
                e.target.value ? monthValueToIso(e.target.value, 15) : '',
              )
            }
            className="w-full rounded-lg border border-cq-border bg-white px-3 py-2.5 text-sm text-cq-text focus:border-[var(--cq-green)] focus:outline-none focus:ring-1 focus:ring-[var(--cq-green)]"
          />
        )}
        {precision === 'month' ? (
          <p className="text-xs text-cq-text-secondary">
            Exact day only matters for moves under a month — a month is fine.
          </p>
        ) : null}
      </div>

      {previewRows.length > 0 ? (
        <div className="rounded-lg border border-cq-border bg-cq-bg/50 px-3 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-cq-text-secondary">
            Shift preview
          </p>
          <ul className="mt-2 space-y-1.5">
            {previewRows.map((row) => (
              <li
                key={row.stage}
                className="flex flex-wrap items-baseline justify-between gap-2 text-sm"
              >
                <span className="font-medium capitalize text-cq-text">
                  {row.stage}
                </span>
                <span className="text-cq-text-secondary">
                  {formatShortDate(row.projectedDate)}
                  <span className="mx-1.5 text-cq-muted">→</span>
                  <span className="font-medium text-black">
                    {formatShortDate(row.newDate)}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </ClaimModalShell>
  )
}
