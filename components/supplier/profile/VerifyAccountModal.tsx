'use client'

import * as React from 'react'
import { FileText, Loader2, Upload } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import type { ProfileDocument, SupplierProfileData } from '@/lib/supplier/profile/types'
import {
  countEmptyVerificationFields,
  getVerificationFields,
  groupVerificationFields,
} from '@/lib/supplier/profile/verification-fields'

function isExtractable(filename: string) {
  return /\.(pdf|doc|docx|xls|xlsx|csv|txt|jpg|jpeg|png)$/i.test(filename)
}

function VerifyFieldRow({ label, value, isEmpty }: { label: string; value: string; isEmpty: boolean }) {
  return (
    <div
      className={cn(
        'grid grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] items-start gap-4 rounded-lg px-3 py-2.5',
        isEmpty && 'border border-dashed border-[rgba(233,87,31,0.22)] bg-[rgba(233,87,31,0.05)]',
      )}
    >
      <span className={cn('text-sm', isEmpty ? 'text-cq-text-secondary' : 'text-cq-text-secondary')}>
        {label}
      </span>
      <span
        className={cn(
          'text-right text-sm',
          isEmpty ? 'font-normal italic text-cq-muted' : 'font-semibold text-cq-text',
        )}
      >
        {isEmpty ? 'Not provided' : value}
      </span>
    </div>
  )
}

export function VerifyAccountModal({
  open,
  onOpenChange,
  profile,
  documents,
  onUpload,
  onExtractComplete,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  profile: SupplierProfileData
  documents: ProfileDocument[]
  onUpload: (files: FileList) => void
  onExtractComplete: (sourceDocument: string) => void
}) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = React.useState(false)
  const [stagedFiles, setStagedFiles] = React.useState<File[]>([])
  const [processingFiles, setProcessingFiles] = React.useState<string[]>([])
  const processingTimerRef = React.useRef<number | null>(null)

  const fields = React.useMemo(() => getVerificationFields(profile), [profile])
  const groups = React.useMemo(() => groupVerificationFields(fields), [fields])
  const emptyCount = countEmptyVerificationFields(profile)

  React.useEffect(() => {
    if (!open) {
      setStagedFiles([])
      setProcessingFiles([])
      setDragOver(false)
      if (processingTimerRef.current) {
        window.clearTimeout(processingTimerRef.current)
        processingTimerRef.current = null
      }
    }
  }, [open])

  React.useEffect(() => {
    return () => {
      if (processingTimerRef.current) window.clearTimeout(processingTimerRef.current)
    }
  }, [])

  const addFiles = (files: FileList | File[]) => {
    const incoming = Array.from(files)
    setStagedFiles((prev) => {
      const names = new Set(prev.map((f) => f.name))
      return [...prev, ...incoming.filter((f) => !names.has(f.name))]
    })
  }

  const runUpload = () => {
    if (stagedFiles.length === 0) {
      inputRef.current?.click()
      return
    }

    const dt = new DataTransfer()
    for (const file of stagedFiles) dt.items.add(file)
    onUpload(dt.files)

    const extractable = stagedFiles.filter((f) => isExtractable(f.name))
    if (extractable.length === 0) {
      setStagedFiles([])
      return
    }

    const names = extractable.map((f) => f.name)
    setProcessingFiles(names)
    setStagedFiles([])

    if (processingTimerRef.current) window.clearTimeout(processingTimerRef.current)
    const duration = 1400 + extractable.length * 500
    processingTimerRef.current = window.setTimeout(() => {
      setProcessingFiles([])
      onExtractComplete(extractable[0].name)
      onOpenChange(false)
      processingTimerRef.current = null
    }, duration)
  }

  const isProcessing = processingFiles.length > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex h-[min(92vh,900px)] max-h-[92vh] w-[min(1100px,calc(100vw-2rem))] max-w-[1100px] flex-col gap-0 overflow-hidden rounded-2xl border-cq-border p-0"
        showCloseButton
      >
        <DialogHeader className="shrink-0 space-y-2 border-b border-cq-border px-6 py-5 text-left sm:px-8">
          <DialogTitle className="text-2xl font-semibold tracking-tight text-cq-text">
            Verify profile
          </DialogTitle>
          <DialogDescription className="max-w-xl text-sm leading-relaxed text-cq-text-secondary">
            Review your company details below. Fields marked lightly still need information — upload
            a brochure or certificate and we&apos;ll suggest updates for you to approve.
          </DialogDescription>
          {emptyCount > 0 && (
            <p className="text-sm text-cq-text">
              <span className="font-semibold text-[var(--cq-green)]">{emptyCount}</span> fields
              still need information
            </p>
          )}
        </DialogHeader>

        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5 sm:px-8">
          {groups.map((group) => (
            <section key={group.section}>
              <h3 className="mb-2 tracking-[0.12em] text-cq-text-secondary s3">
                {group.label}
              </h3>
              <div className="space-y-1">
                {group.fields.map((field) => (
                  <VerifyFieldRow
                    key={field.key}
                    label={field.label}
                    value={field.value}
                    isEmpty={field.isEmpty}
                  />
                ))}
              </div>
            </section>
          ))}

          <section className="rounded-xl border border-cq-border bg-cq-bg p-4">
            <p className="text-sm font-semibold text-cq-text">Upload documents to fill gaps</p>
            <p className="mt-1 text-xs leading-relaxed text-cq-text-secondary">
              PDF, DOC, XLS, or JPG — we&apos;ll read them and suggest profile updates.
            </p>

            <input
              ref={inputRef}
              type="file"
              className="hidden"
              multiple
              accept=".pdf,.csv,.txt,.doc,.docx,.xls,.xlsx,.pptx,.jpg,.jpeg,.png"
              onChange={(e) => {
                if (e.target.files?.length) addFiles(e.target.files)
                e.target.value = ''
              }}
            />

            <div
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  if (!isProcessing) inputRef.current?.click()
                }
              }}
              onClick={() => !isProcessing && inputRef.current?.click()}
              onDragEnter={(e) => {
                e.preventDefault()
                if (!isProcessing) setDragOver(true)
              }}
              onDragOver={(e) => {
                e.preventDefault()
                if (!isProcessing) setDragOver(true)
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault()
                setDragOver(false)
                if (!isProcessing && e.dataTransfer.files?.length) addFiles(e.dataTransfer.files)
              }}
              className={cn(
                'mt-3 flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed px-4 py-8 text-center transition-colors',
                isProcessing && 'pointer-events-none opacity-60',
                dragOver
                  ? 'border-[var(--cq-green)] bg-[var(--cq-accent-muted)]'
                  : 'border-cq-border bg-white hover:border-cq-text-secondary',
              )}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-6 w-6 animate-spin text-[var(--cq-green)]" aria-hidden />
                  <p className="text-sm font-semibold text-cq-text">
                    Reading {processingFiles.length} file{processingFiles.length === 1 ? '' : 's'}…
                  </p>
                </>
              ) : (
                <>
                  <Upload className="h-6 w-6 text-[var(--cq-green)]" strokeWidth={2} aria-hidden />
                  <span className="text-sm font-semibold text-[var(--cq-green)]">Upload files</span>
                  {stagedFiles.length > 0 && (
                    <span className="text-xs text-cq-text-secondary">
                      {stagedFiles.length} file{stagedFiles.length === 1 ? '' : 's'} ready
                    </span>
                  )}
                </>
              )}
            </div>

            {documents.length > 0 && !isProcessing && (
              <ul className="mt-3 space-y-1.5">
                {documents.slice(-3).map((doc) => (
                  <li
                    key={doc.id}
                    className="flex items-center gap-2 text-xs text-cq-text-secondary"
                  >
                    <FileText className="h-3.5 w-3.5 shrink-0" aria-hidden />
                    <span className="truncate">{doc.filename}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-3 border-t border-cq-border px-6 py-4 sm:px-8">
          <button
            type="button"
            disabled={isProcessing}
            onClick={() => onOpenChange(false)}
            className="btn-link disabled:opacity-50"
          >
            Not now
          </button>
          <button
            type="button"
            disabled={isProcessing}
            onClick={runUpload}
            className="btn-primary"
          >
            {stagedFiles.length > 0 ? 'Upload & analyse' : 'Choose files'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
