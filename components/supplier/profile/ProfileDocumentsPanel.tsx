'use client'

import * as React from 'react'
import { FileText, ImageIcon, Trash2, Upload } from 'lucide-react'
import type { ProfileDocument } from '@/lib/supplier/profile/types'
import { sectionTitleClass } from '@/lib/ui/headings'

function DocIcon({ type }: { type: ProfileDocument['type'] }) {
  if (type === 'image') return <ImageIcon className="h-4 w-4 shrink-0 text-cq-text-secondary" />
  return <FileText className="h-4 w-4 shrink-0 text-cq-text-secondary" />
}

export function ProfileDocumentsPanel({
  documents,
  onRemove,
  onUpload,
  embedded = false,
}: {
  documents: ProfileDocument[]
  onRemove: (id: string) => void
  onUpload: (files: FileList) => void
  embedded?: boolean
}) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = React.useState(false)

  return (
    <div
      className={
        embedded
          ? 'flex h-fit flex-col'
          : 'flex h-fit flex-col rounded-xl border border-cq-border bg-white lg:sticky lg:top-24'
      }
    >
      {!embedded && (
        <div className="border-b border-cq-border px-4 py-4">
          <h2 className={sectionTitleClass}>Documents</h2>
          <p className="mt-1 text-xs leading-relaxed text-cq-text-secondary">
            Upload documents to automatically improve your profile data.
          </p>
        </div>
      )}

      <ul className="max-h-[320px] divide-y divide-cq-border-light overflow-y-auto">
        {documents.map((doc) => (
          <li key={doc.id} className="flex items-center gap-2 px-4 py-2.5">
            <DocIcon type={doc.type} />
            <span className="min-w-0 flex-1 truncate text-sm text-cq-text" title={doc.filename}>
              {doc.filename}
            </span>
            {doc.extracted && (
              <span className="shrink-0 rounded bg-[var(--cq-accent-muted)] px-1.5 py-0.5 text-[var(--cq-green)] p7">
                Parsed
              </span>
            )}
            <button
              type="button"
              onClick={() => onRemove(doc.id)}
              className="shrink-0 rounded p-1 text-cq-muted hover:bg-cq-bg hover:text-cq-text"
              aria-label={`Remove ${doc.filename}`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>

      <div className="border-t border-cq-border p-4">
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          multiple
          accept=".pdf,.csv,.txt,.doc,.docx,.xls,.xlsx,.pptx,.jpg,.jpeg,.png"
          onChange={(e) => {
            if (e.target.files?.length) onUpload(e.target.files)
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
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragOver(false)
            if (e.dataTransfer.files?.length) onUpload(e.dataTransfer.files)
          }}
          className={`flex w-full flex-col items-center gap-2 rounded-lg border-2 border-dashed px-4 py-6 text-center transition-colors ${
            dragOver
              ? 'border-[var(--cq-green)] bg-[var(--cq-accent-muted)]'
              : 'border-cq-border bg-cq-bg hover:border-cq-text-secondary'
          }`}
        >
          <Upload className="h-5 w-5 text-[var(--cq-green)]" aria-hidden />
          <span className="text-sm font-semibold text-[var(--cq-green)]">Upload Files</span>
          <span className="text-cq-text-secondary p7">
            PDF, CSV, TXT, DOC, DOCX, XLS, XLSX, PPTX, JPG, JPEG, or PNG up to 50MB · max 50 files
          </span>
        </button>
      </div>
    </div>
  )
}
