'use client'

import * as React from 'react'
import { FileIcon, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ClarifyResponseTab } from '@/lib/supplier/questions/types'

const btnGhost =
  'rounded-lg border border-cq-border bg-white px-4 py-2 text-sm font-bold text-cq-text hover:bg-cq-bg'
const btnGreenFilled =
  'rounded-lg bg-[var(--cq-green)] px-4 py-2 text-sm font-bold text-white hover:bg-[var(--cq-green-hover)] disabled:opacity-50'

export function ClarifyResponseTabs({
  activeTab,
  onTabChange,
  detailsText,
  onDetailsTextChange,
  files,
  onFilesChange,
  fileMessage,
  onFileMessageChange,
  onConfirmBlocked,
}: {
  activeTab: ClarifyResponseTab
  onTabChange: (tab: ClarifyResponseTab) => void
  detailsText: string
  onDetailsTextChange: (text: string) => void
  files: File[]
  onFilesChange: (files: File[]) => void
  fileMessage: string
  onFileMessageChange: (text: string) => void
  onConfirmBlocked: () => void
}) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = React.useState(false)

  const tabs: { id: ClarifyResponseTab; label: string }[] = [
    { id: 'details', label: 'Add details' },
    { id: 'files', label: 'Upload files' },
    { id: 'blocked', label: "I don't have this information" },
  ]

  const addFiles = (list: FileList | File[]) => {
    onFilesChange([...files, ...Array.from(list)])
  }

  const removeFileAt = (index: number) => {
    onFilesChange(files.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-bold text-cq-text">Your response</p>
        <div
          className="mt-2 inline-flex rounded-lg border border-cq-border bg-cq-bg p-1"
          role="tablist"
          aria-label="Response type"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'rounded-md px-3 py-1.5 text-xs font-semibold transition-colors sm:text-sm',
                activeTab === tab.id
                  ? 'bg-white text-cq-text shadow-sm'
                  : 'text-cq-text-secondary hover:text-cq-text',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'details' ? (
        <textarea
          value={detailsText}
          onChange={(e) => onDetailsTextChange(e.target.value)}
          rows={4}
          placeholder="Type your answer…"
          className="w-full resize-y rounded-lg border border-cq-border bg-white px-3 py-2 text-sm text-cq-text outline-none focus:border-cq-text focus:ring-1 focus:ring-cq-text/10"
        />
      ) : null}

      {activeTab === 'files' ? (
        <div className="space-y-3">
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
                ? 'flex h-[160px] w-full flex-col items-center justify-center rounded-xl border-2 border-[var(--cq-green)] bg-[var(--cq-accent-muted)] transition-colors'
                : 'flex h-[160px] w-full flex-col items-center justify-center rounded-xl border border-dashed border-cq-border bg-cq-bg transition-colors'
            }
          >
            <span className="text-sm font-bold text-[var(--cq-green)]">Upload a file</span>
            <span className="mt-1 text-sm text-cq-text">or drag and drop</span>
            <span className="mt-2 text-xs text-cq-text-secondary">
              PDF, DOCX, JPG or PNG up to 10MB
            </span>
          </button>

          {files.length > 0 ? (
            <ul className="max-h-32 space-y-2 overflow-y-auto">
              {files.map((f, i) => (
                <li
                  key={`${f.name}-${i}`}
                  className="flex items-center gap-2 rounded-lg border border-cq-border bg-white px-3 py-2 text-sm"
                >
                  <FileIcon className="h-4 w-4 shrink-0 text-cq-text-secondary" />
                  <span className="min-w-0 flex-1 truncate font-medium text-cq-text">
                    {f.name}
                  </span>
                  <button
                    type="button"
                    className="shrink-0 rounded p-1 text-cq-text-secondary hover:bg-cq-bg"
                    aria-label={`Remove ${f.name}`}
                    onClick={() => removeFileAt(i)}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}

          <textarea
            value={fileMessage}
            onChange={(e) => onFileMessageChange(e.target.value)}
            rows={2}
            placeholder="Optional message with your files…"
            className="w-full resize-y rounded-lg border border-cq-border bg-white px-3 py-2 text-sm text-cq-text outline-none focus:border-cq-text focus:ring-1 focus:ring-cq-text/10"
          />
        </div>
      ) : null}

      {activeTab === 'blocked' ? (
        <div className="space-y-4 rounded-lg border border-cq-border bg-cq-bg/40 p-4">
          <p className="text-sm leading-relaxed text-cq-text-secondary">
            Marking this as blocked tells CQuel you can&apos;t answer. They&apos;ll either
            provide more info or close the question.
          </p>
          <button type="button" className={btnGreenFilled} onClick={onConfirmBlocked}>
            Confirm: I need more info
          </button>
        </div>
      ) : null}
    </div>
  )
}

export { btnGhost, btnGreenFilled }
