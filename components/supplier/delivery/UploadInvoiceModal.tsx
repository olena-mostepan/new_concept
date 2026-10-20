'use client'

import * as React from 'react'
import { FileUp, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatGbp } from '@/lib/supplier/delivery/mock-data'
import { modelAmount, paymentStages } from '@/lib/supplier/delivery/payment-model'
import type { JobDeliveryDetail } from '@/lib/supplier/delivery/job-types'
import { ClaimModalShell } from '@/components/supplier/delivery/ClaimModalShell'

export type UploadInvoiceResult = {
  stageName: string
  amount: number
  fileName: string
}

export function UploadInvoiceModal({
  open,
  onOpenChange,
  job,
  focusStage = null,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  job: JobDeliveryDetail | null
  focusStage?: string | null
  onConfirm: (result: UploadInvoiceResult) => void
}) {
  const inputRef = React.useRef<HTMLInputElement | null>(null)
  const [file, setFile] = React.useState<File | null>(null)
  const [dragging, setDragging] = React.useState(false)
  const [stageName, setStageName] = React.useState('')
  const [amount, setAmount] = React.useState('')

  const stages = job ? paymentStages(job.stages) : []

  React.useEffect(() => {
    if (!job || !open) return
    const preferred =
      focusStage && stages.some((s) => s.name === focusStage)
        ? focusStage
        : (stages.find((s) => s.status === 'next')?.name ??
          stages.find((s) => s.status === 'invoiced')?.name ??
          stages[0]?.name ??
          '')
    setStageName(preferred)
    const stage = stages.find((s) => s.name === preferred)
    setAmount(
      stage ? String(modelAmount(job.gmv, stage.pct)) : '',
    )
    setFile(null)
    setDragging(false)
  }, [job, open, focusStage]) // eslint-disable-line react-hooks/exhaustive-deps -- stages derived from job

  React.useEffect(() => {
    if (!job || !stageName) return
    const stage = stages.find((s) => s.name === stageName)
    if (!stage) return
    setAmount(String(modelAmount(job.gmv, stage.pct)))
  }, [stageName]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!job) return null

  const parsedAmount = Number(amount.replace(/[,£\s]/g, ''))
  const canSubmit =
    Boolean(file) && Boolean(stageName) && Number.isFinite(parsedAmount) && parsedAmount > 0

  return (
    <ClaimModalShell
      open={open}
      onOpenChange={onOpenChange}
      title="Upload invoice"
      subtitle={`${job.solution} — ${job.property} · ${formatGbp(job.gmv)} GMV`}
      primaryLabel="Upload invoice"
      primaryDisabled={!canSubmit}
      onPrimary={() => {
        if (!file || !canSubmit) return
        onConfirm({
          stageName,
          amount: parsedAmount,
          fileName: file.name,
        })
        onOpenChange(false)
      }}
    >
      <label className="block space-y-1.5">
        <span className="text-sm font-normal text-cq-text">Stage</span>
        <select
          value={stageName}
          onChange={(e) => setStageName(e.target.value)}
          className="w-full rounded-md border border-cq-border bg-white px-3 py-2 text-sm text-cq-text outline-none focus:border-[var(--cq-green)]"
        >
          {stages.map((s) => (
            <option key={s.name} value={s.name}>
              {s.name} · {s.pct}% · {formatGbp(modelAmount(job.gmv, s.pct))}
            </option>
          ))}
        </select>
      </label>

      <label className="block space-y-1.5">
        <span className="text-sm font-normal text-cq-text">Invoice amount</span>
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-cq-muted">
            £
          </span>
          <input
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full rounded-md border border-cq-border bg-white py-2 pl-7 pr-3 text-sm text-cq-text outline-none focus:border-[var(--cq-green)]"
          />
        </div>
        <p className="text-xs text-cq-text-secondary">
          If this differs from the model, you&apos;ll get a chance to reconcile on
          the stage row.
        </p>
      </label>

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.png,.jpg,.jpeg,.webp"
        className="sr-only"
        onChange={(e) => {
          const next = e.target.files?.[0]
          if (next) setFile(next)
        }}
      />

      {file ? (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-cq-border bg-cq-bg/50 px-3 py-2">
          <p className="min-w-0 truncate text-sm text-cq-text">{file.name}</p>
          <button
            type="button"
            className="shrink-0 text-cq-muted hover:text-cq-text"
            onClick={() => setFile(null)}
            aria-label="Remove file"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          className={cn(
            'flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-8 text-center transition-colors',
            dragging
              ? 'border-[var(--cq-green)] bg-[var(--cq-accent-muted)]'
              : 'border-cq-border bg-cq-bg/40 hover:border-[var(--cq-green)]/50 hover:bg-[var(--cq-accent-muted)]/40',
          )}
          onClick={() => inputRef.current?.click()}
          onDragEnter={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={(e) => {
            e.preventDefault()
            setDragging(false)
          }}
          onDrop={(e) => {
            e.preventDefault()
            setDragging(false)
            const next = e.dataTransfer.files?.[0]
            if (next) setFile(next)
          }}
        >
          <FileUp className="h-5 w-5 text-[var(--cq-green)]" aria-hidden />
          <span className="text-sm font-normal text-cq-text">
            Drop invoice or browse
          </span>
          <span className="text-xs text-cq-text-secondary">
            PDF or image
          </span>
        </button>
      )}
    </ClaimModalShell>
  )
}
