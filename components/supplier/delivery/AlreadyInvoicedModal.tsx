'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import type { DeliveryClaim } from '@/lib/supplier/delivery/types'
import { claimSubtitle } from '@/lib/supplier/delivery/dates'
import { ClaimModalShell } from '@/components/supplier/delivery/ClaimModalShell'

export type AlreadyInvoicedResult = {
  status: 'invoiced' | 'paid'
  amount: number
}

export function AlreadyInvoicedModal({
  open,
  onOpenChange,
  claim,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  claim: DeliveryClaim | null
  onConfirm: (claimId: string, result: AlreadyInvoicedResult) => void
}) {
  const [status, setStatus] = React.useState<'invoiced' | 'paid'>('invoiced')
  const [amount, setAmount] = React.useState('')

  React.useEffect(() => {
    if (!claim || !open) return
    setStatus('invoiced')
    setAmount(String(claim.amount))
  }, [claim, open])

  if (!claim) return null

  const parsed = Number(amount.replace(/[^0-9.]/g, ''))
  const canSave = Number.isFinite(parsed) && parsed > 0

  return (
    <ClaimModalShell
      open={open}
      onOpenChange={onOpenChange}
      title="Already invoiced / paid"
      subtitle={claimSubtitle(claim)}
      primaryLabel="Save"
      primaryDisabled={!canSave}
      onPrimary={() => {
        onConfirm(claim.id, { status, amount: parsed })
        onOpenChange(false)
      }}
    >
      <div className="space-y-2">
        {(
          [
            { id: 'invoiced', label: "I've raised this invoice" },
            { id: 'paid', label: 'The customer has paid it' },
          ] as const
        ).map((opt) => (
          <label
            key={opt.id}
            className={cn(
              'flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-3 text-sm font-medium transition-colors',
              status === opt.id
                ? 'border-[var(--cq-green)] bg-[var(--cq-accent-muted)] text-cq-text'
                : 'border-cq-border bg-white text-cq-text hover:bg-cq-bg/60',
            )}
          >
            <input
              type="radio"
              name="invoice-status"
              className="accent-[var(--cq-green)]"
              checked={status === opt.id}
              onChange={() => setStatus(opt.id)}
            />
            {opt.label}
          </label>
        ))}
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="invoice-amount"
          className="text-xs font-semibold uppercase tracking-wide text-cq-text-secondary"
        >
          Amount
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-cq-text-secondary">
            £
          </span>
          <input
            id="invoice-amount"
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full rounded-lg border border-cq-border bg-white py-2.5 pl-7 pr-3 text-sm text-cq-text focus:border-[var(--cq-green)] focus:outline-none focus:ring-1 focus:ring-[var(--cq-green)]"
          />
        </div>
        <p className="text-xs text-cq-text-secondary">approx is fine</p>
      </div>

      <p className="rounded-lg border border-cq-border bg-cq-bg/50 px-3 py-2.5 text-sm text-cq-text-secondary">
        We&apos;ll reconcile and drop it from &apos;to raise&apos;.
      </p>
    </ClaimModalShell>
  )
}
