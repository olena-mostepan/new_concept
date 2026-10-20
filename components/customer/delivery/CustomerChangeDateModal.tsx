'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import {
  formatShortDate,
  monthValueToIso,
  toMonthValue,
} from '@/lib/customer/delivery/dates'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type Precision = 'day' | 'month'

export function CustomerChangeDateModal({
  open,
  onOpenChange,
  title,
  subtitle,
  stageLabel,
  initialDate,
  onConfirm,
  reviewProgress,
  onSkip,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  subtitle: string
  stageLabel?: string | null
  initialDate: string | null
  onConfirm: (date: string) => void
  reviewProgress?: { current: number; total: number } | null
  onSkip?: () => void
}) {
  const [precision, setPrecision] = React.useState<Precision>('day')
  const [actualDate, setActualDate] = React.useState('')

  React.useEffect(() => {
    if (!open) return
    setPrecision('day')
    setActualDate(initialDate ?? '')
  }, [open, initialDate])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="gap-0 overflow-hidden border-cq-border p-0 sm:max-w-[480px]"
      >
        <DialogHeader className="space-y-1 border-b border-cq-border px-6 py-5 text-left">
          <DialogTitle className="text-xl font-semibold text-text-primary">
            {title}
          </DialogTitle>
          <p className="text-sm text-cq-text-secondary">
            {reviewProgress
              ? `${subtitle} · ${reviewProgress.current} of ${reviewProgress.total}`
              : subtitle}
          </p>
        </DialogHeader>

        <div className="space-y-4 px-6 py-5">
          {stageLabel ? (
            <div className="rounded-lg border border-cq-border bg-cq-bg px-3 py-2.5">
              <p className="text-xs font-semibold uppercase tracking-wide text-cq-text-secondary">
                Stage
              </p>
              <p className="mt-0.5 text-sm font-semibold text-text-primary">
                {stageLabel}
              </p>
            </div>
          ) : null}

          <div className="space-y-1.5">
            <p className="text-sm font-normal text-cq-text">
              What is the correct date for {stageLabel ?? 'this stage'}?
            </p>
            <div className="inline-flex rounded-lg border border-cq-border bg-cq-bg p-1">
              {(['day', 'month'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => {
                    setPrecision(mode)
                    if (mode === 'month' && actualDate) {
                      setActualDate(
                        monthValueToIso(toMonthValue(actualDate), 15),
                      )
                    }
                  }}
                  className={cn(
                    'rounded-md px-3 py-1.5 text-sm font-normal capitalize transition-colors',
                    precision === mode
                      ? 'bg-white text-text-primary shadow-sm'
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
              htmlFor="customer-change-date"
              className="text-sm font-normal text-cq-text"
            >
              Date
            </label>
            <input
              id="customer-change-date"
              type={precision === 'day' ? 'date' : 'month'}
              value={
                precision === 'day'
                  ? actualDate.slice(0, 10)
                  : actualDate
                    ? toMonthValue(actualDate)
                    : ''
              }
              onChange={(e) => {
                const v = e.target.value
                setActualDate(
                  precision === 'day' ? v : monthValueToIso(v, 15),
                )
              }}
              className="w-full rounded-lg border border-cq-border bg-white px-3 py-2 text-sm text-cq-text outline-none focus:border-[var(--cq-green)]"
            />
            {actualDate ? (
              <p className="text-xs text-cq-text-secondary">
                Selected: {formatShortDate(actualDate)}
              </p>
            ) : null}
          </div>
        </div>

        <DialogFooter className="gap-2 border-t border-cq-border px-6 py-4 sm:justify-between">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </button>
          <div className="flex flex-wrap justify-end gap-2">
            {onSkip ? (
              <button type="button" className="btn-secondary" onClick={onSkip}>
                Skip
              </button>
            ) : null}
            <button
              type="button"
              className="btn-primary"
              disabled={!actualDate}
              onClick={() => onConfirm(actualDate)}
            >
              Confirm
            </button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
