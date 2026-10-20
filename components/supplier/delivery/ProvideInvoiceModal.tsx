'use client'

import * as React from 'react'
import { FileUp, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DeliveryClaim } from '@/lib/supplier/delivery/types'
import { claimSubtitle } from '@/lib/supplier/delivery/dates'
import { ClaimModalShell } from '@/components/supplier/delivery/ClaimModalShell'

export type ProvideInvoiceResult = {
  fileName: string
}

export function ProvideInvoiceModal({
  open,
  onOpenChange,
  claim,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  claim: DeliveryClaim | null
  onConfirm: (claimId: string, result: ProvideInvoiceResult) => void
}) {
  const inputRef = React.useRef<HTMLInputElement | null>(null)
  const [file, setFile] = React.useState<File | null>(null)
  const [dragging, setDragging] = React.useState(false)

  React.useEffect(() => {
    if (!open) {
      setFile(null)
      setDragging(false)
    }
  }, [open])

  if (!claim) return null

  function takeFile(next: File | null | undefined) {
    if (!next) return
    setFile(next)
  }

  return (
    <ClaimModalShell
      open={open}
      onOpenChange={onOpenChange}
      title="Provide an invoice"
      subtitle={claimSubtitle(claim)}
      primaryLabel="Upload invoice"
      primaryDisabled={!file}
      onPrimary={() => {
        if (!file) return
        onConfirm(claim.id, { fileName: file.name })
        onOpenChange(false)
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.png,.jpg,.jpeg,.webp"
        className="sr-only"
        onChange={(e) => takeFile(e.target.files?.[0])}
      />

      <button
        type="button"
        className={cn(
          'flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-10 text-center transition-colors',
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
          takeFile(e.dataTransfer.files?.[0])
        }}
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-full border border-cq-border bg-white text-cq-text-secondary">
          <FileUp className="h-5 w-5" aria-hidden />
        </span>
        <p className="text-sm font-normal text-cq-text">
          Drop invoice here, or browse
        </p>
        <p className="text-xs text-cq-text-secondary">PDF or image · mock upload</p>
      </button>

      {file ? (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-cq-border bg-white px-3 py-2.5">
          <p className="min-w-0 truncate text-sm font-normal text-cq-text">
            {file.name}
          </p>
          <button
            type="button"
            className="btn-link shrink-0 gap-0"
            onClick={() => setFile(null)}
            aria-label="Remove file"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
      ) : null}
    </ClaimModalShell>
  )
}
