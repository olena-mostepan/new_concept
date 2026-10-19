'use client'

import { formatGbp } from '@/lib/supplier/delivery/mock-data'

export function MoneyLeverBanner({
  sumProjected,
  commission,
  onLooksRight,
  onSomethingsOff,
}: {
  sumProjected: number
  commission: number
  onLooksRight: () => void
  onSomethingsOff: () => void
}) {
  return (
    <section className="relative overflow-hidden rounded-xl border border-[var(--cq-green)]/35 bg-gradient-to-br from-[var(--cq-accent-muted)] via-[var(--cq-accent-muted)]/50 to-white px-5 py-5 shadow-sm sm:px-6">
      <div
        className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-[var(--cq-green)]/15"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-14 -left-10 h-32 w-32 rounded-full bg-[var(--cq-green)]/10"
        aria-hidden
      />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="min-w-0 flex-1 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--cq-green)]">
            Cash picture
          </p>
          <p className="text-base font-medium text-cq-text sm:text-lg">
            Based on this picture, you&apos;ll invoice{' '}
            <span className="font-semibold text-black">
              {formatGbp(sumProjected)}
            </span>{' '}
            over the next 3 months and owe CQuel{' '}
            <span className="font-semibold text-black">
              {formatGbp(commission)}
            </span>{' '}
            commission.
          </p>
          <p className="text-sm text-cq-text-secondary">
            If a date or stage is wrong, your cash flow and commission are wrong
            too — so fix it below.
          </p>
        </div>

        <div className="flex shrink-0 flex-row flex-wrap items-center justify-end gap-2">
          <button type="button" className="btn-primary" onClick={onLooksRight}>
            Looks right
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={onSomethingsOff}
          >
            Something&apos;s off
          </button>
        </div>
      </div>
    </section>
  )
}
