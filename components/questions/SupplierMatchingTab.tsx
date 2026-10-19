'use client'

import { cn } from '@/lib/utils'

type MatchSupplier = {
  id: string
  name: string
  quality: 1 | 2 | 3
  perUnit: number
  unitLabel: string
}

const QUALITY_LABEL: Record<1 | 2 | 3, string> = {
  1: 'Strong match',
  2: 'Partial match',
  3: 'Weak match',
}

export function SupplierMatchingTab({
  suppliers,
  currencySymbol = '£',
}: {
  suppliers: MatchSupplier[]
  currencySymbol?: string
}) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-extrabold text-cq-text">Supplier matching</h3>
        <p className="mt-1 text-sm text-cq-text-secondary">
          Fit scores from tender requirements vs submitted CapEx bids
        </p>
      </div>
      <div className="overflow-hidden rounded-xl border border-cq-border bg-white shadow-sm">
        <ul className="divide-y divide-cq-border">
          {suppliers.map((s) => (
            <li
              key={s.id}
              className="flex flex-col gap-2 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-bold text-cq-text">{s.name}</p>
                <p className="text-sm text-cq-text-secondary">
                  {currencySymbol}
                  {s.perUnit.toLocaleString('en-GB')} {s.unitLabel}
                </p>
              </div>
              <span
                className={cn(
                  'inline-flex w-fit rounded-md border px-2.5 py-1 text-xs font-bold',
                  s.quality === 1 && 'border-cq-green/40 bg-cq-green/10 text-cq-green',
                  s.quality === 2 && 'border-amber-500/40 bg-amber-500/10 text-amber-800',
                  s.quality === 3 && 'border-cq-border bg-cq-bg text-cq-text-secondary',
                )}
              >
                {QUALITY_LABEL[s.quality]}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
