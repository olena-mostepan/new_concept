'use client'

import * as React from 'react'
import { FileText, ImageIcon, Loader2, Upload } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import type { ProfileDocument } from '@/lib/supplier/profile/types'

function DocIcon({ type }: { type: ProfileDocument['type'] | 'pending' }) {
  if (type === 'image') return <ImageIcon className="h-4 w-4 shrink-0 text-cq-text-secondary" />
  return <FileText className="h-4 w-4 shrink-0 text-cq-text-secondary" />
}

function isExtractable(filename: string) {
  return /\.(pdf|doc|docx|xls|xlsx|csv|txt|jpg|jpeg|png)$/i.test(filename)
}

const STAT_CARDS = [
  { value: '32%', label: 'more bids on complete profiles' },
  { value: '~15%', label: 'lower contingency pricing' },
]

export function ImproveProfileModal({
  open,
  onOpenChange,
  documents,
  onUpload,
  onExtractComplete,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  documents: ProfileDocument[]
  onUpload: (files: FileList) => void
  onExtractComplete: (sourceDocument: string) => void
}) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = React.useState(false)
  const [stagedFiles, setStagedFiles] = React.useState<File[]>([])
  const [processingFiles, setProcessingFiles] = React.useState<string[]>([])
  const processingTimerRef = React.useRef<number | null>(null)

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
      onOpenChange(false)
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
        className="w-[min(1100px,calc(100vw-2rem))] max-w-[1100px] gap-0 overflow-hidden rounded-2xl border-cq-border p-0 sm:max-w-[1100px]"
        showCloseButton
      >
        <DialogHeader className="space-y-0 px-8 pb-2 pt-8 text-left">
          <DialogTitle className="text-2xl font-semibold tracking-tight text-cq-text">
            Get more from your profile
          </DialogTitle>
          <DialogDescription className="mt-3 max-w-xl text-sm leading-relaxed text-cq-text-secondary">
            Drop in your brochures or certificates — we&apos;ll read them and suggest updates for
            you to approve.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 px-8 py-6">
          <div className="grid gap-3 sm:grid-cols-2">
            {STAT_CARDS.map((stat) => (
              <div
                key={stat.value}
                className="rounded-[8px] border border-[rgba(28,117,188,0.25)] bg-[rgba(28,117,188,0.09)] px-5 py-5"
              >
                <p className="text-[2rem] font-semibold leading-none tracking-tight text-cq-text">
                  {stat.value}
                </p>
                <p className="mt-2 text-sm font-normal leading-snug text-cq-text">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

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
              'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-12 text-center transition-colors',
              isProcessing && 'pointer-events-none opacity-60',
              dragOver
                ? 'border-[var(--cq-green)] bg-[var(--cq-accent-muted)]'
                : 'border-cq-border bg-white hover:border-cq-text-secondary',
            )}
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-8 w-8 animate-spin text-[var(--cq-green)]" aria-hidden />
                <p className="text-sm font-semibold text-cq-text">
                  Reading {processingFiles.length} file{processingFiles.length === 1 ? '' : 's'}…
                </p>
                <ul className="mt-1 space-y-1">
                  {processingFiles.map((name) => (
                    <li key={name} className="max-w-full truncate text-xs text-cq-text-secondary">
                      {name}
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <>
                <Upload className="h-8 w-8 text-[var(--cq-green)]" strokeWidth={2} aria-hidden />
                <span className="text-base font-semibold text-[var(--cq-green)]">Upload files</span>
                <span className="text-xs text-cq-text-secondary">
                  PDF, DOC, XLS, JPG · up to 50 MB · max 50 files
                </span>
                {stagedFiles.length > 0 && (
                  <span className="mt-2 rounded-full bg-[var(--cq-accent-muted)] px-3 py-1 text-xs font-semibold text-[var(--cq-green)]">
                    {stagedFiles.length} file{stagedFiles.length === 1 ? '' : 's'} ready
                  </span>
                )}
              </>
            )}
          </div>

          {(documents.length > 0 || stagedFiles.length > 0) && !isProcessing && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-cq-text-secondary">
                Uploaded files
              </p>
              <ul className="max-h-40 divide-y divide-cq-border-light overflow-y-auto rounded-[8px] border border-cq-border">
                {stagedFiles.map((file) => (
                  <li key={`staged-${file.name}`} className="flex items-center gap-2 px-3 py-2.5">
                    <DocIcon type="pending" />
                    <span className="min-w-0 flex-1 truncate text-sm text-cq-text" title={file.name}>
                      {file.name}
                    </span>
                    <span className="shrink-0 rounded bg-cq-bg px-1.5 py-0.5 text-cq-text-secondary p7">
                      Ready
                    </span>
                  </li>
                ))}
                {[...documents].reverse().map((doc) => (
                  <li key={doc.id} className="flex items-center gap-2 px-3 py-2.5">
                    <DocIcon type={doc.type} />
                    <span className="min-w-0 flex-1 truncate text-sm text-cq-text" title={doc.filename}>
                      {doc.filename}
                    </span>
                    {doc.extracted && (
                      <span className="shrink-0 rounded bg-[rgba(28,117,188,0.09)] px-1.5 py-0.5 text-[var(--cq-link)] p7">
                        Parsed
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <DialogFooter className="flex-row justify-end gap-3 border-t border-cq-border px-8 py-5">
          <button
            type="button"
            disabled={isProcessing}
            onClick={() => onOpenChange(false)}
            className="btn-secondary"
          >
            Not now
          </button>
          <button
            type="button"
            disabled={isProcessing}
            onClick={runUpload}
            className="btn-primary"
          >
            Upload &amp; improve
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
