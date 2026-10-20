'use client'

import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { FileIcon, X } from 'lucide-react'

export function UploadFilesModal({
  open,
  onOpenChange,
  questionText,
  onUpload,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  questionText: string
  onUpload: (files: File[]) => void
}) {
  const [files, setFiles] = React.useState<File[]>([])
  const [dragOver, setDragOver] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (!open) setFiles([])
  }, [open])

  const addFiles = (list: FileList | File[]) => {
    const next = Array.from(list)
    setFiles((prev) => [...prev, ...next])
  }

  const removeAt = (i: number) => {
    setFiles((prev) => prev.filter((_, idx) => idx !== i))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[480px] gap-0 p-0 sm:max-w-[480px]" showCloseButton>
        <DialogHeader className="border-b border-cq-border px-6 pb-4 pt-6">
          <DialogTitle className="text-lg font-semibold text-cq-text">Upload Files</DialogTitle>
        </DialogHeader>

        <div className="space-y-1 px-6 pt-4">
          <p className="text-sm text-cq-text-secondary">Add supporting documents for:</p>
          <p className="text-sm leading-relaxed text-cq-text">{questionText}</p>
        </div>

        <div className="px-6 pt-5">
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            multiple
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            onChange={(e) => {
              if (e.target.files?.length) addFiles(e.target.files)
              e.target.value = ''
            }}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragEnter={(e) => {
              e.preventDefault()
              setDragOver(true)
            }}
            onDragOver={(e) => {
              e.preventDefault()
              setDragOver(true)
            }}
            onDragLeave={(e) => {
              e.preventDefault()
              setDragOver(false)
            }}
            onDrop={(e) => {
              e.preventDefault()
              setDragOver(false)
              if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files)
            }}
            className={
              dragOver
                ? 'flex h-[200px] w-full flex-col items-center justify-center rounded-xl border-2 border-[var(--cq-green)] bg-[var(--cq-accent-muted)] transition-colors'
                : 'flex h-[200px] w-full flex-col items-center justify-center rounded-xl border border-dashed border-cq-border bg-cq-bg transition-colors'
            }
          >
            <span className="text-sm font-semibold text-[var(--cq-green)]">Upload a file</span>
            <span className="mt-1 text-sm text-cq-text">or drag and drop</span>
            <span className="mt-2 text-xs text-cq-text-secondary">
              PDF, DOCX, JPG or PNG up to 10MB
            </span>
          </button>
        </div>

        {files.length > 0 ? (
          <ul className="mt-4 max-h-40 space-y-2 overflow-y-auto px-6">
            {files.map((f, i) => (
              <li
                key={`${f.name}-${i}`}
                className="flex items-center gap-2 rounded-lg border border-cq-border bg-white px-3 py-2 text-sm"
              >
                <FileIcon className="h-4 w-4 shrink-0 text-cq-text-secondary" />
                <span className="min-w-0 flex-1 truncate font-normal text-cq-text">{f.name}</span>
                <span className="shrink-0 text-xs text-cq-text-secondary">
                  {(f.size / 1024).toFixed(0)} KB
                </span>
                <button
                  type="button"
                  className="shrink-0 rounded p-1 text-cq-text-secondary hover:bg-cq-bg hover:text-cq-text"
                  aria-label={`Remove ${f.name}`}
                  onClick={() => removeAt(i)}
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        ) : null}

        <DialogFooter className="mt-6 border-t border-cq-border px-6 py-4">
          <button type="button" className="btn-secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-primary"
            disabled={files.length === 0}
            onClick={() => {
              onUpload(files)
              onOpenChange(false)
            }}
          >
            Upload
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
