'use client'

import * as React from 'react'
import { ChevronDown, ChevronRight, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

export function AttachmentsAccordion({
  attachments,
}: {
  attachments: Array<{ name: string; sizeLabel: string }>
}) {
  const [open, setOpen] = React.useState(true)
  const n = attachments.length
  return (
    <div className="rounded-lg border border-cq-border">
      <button
        type="button"
        className="flex w-full items-center justify-between px-3 py-2 text-left text-sm font-semibold text-cq-text hover:bg-cq-bg/80"
        onClick={() => setOpen((v) => !v)}
      >
        <span>Attachments ({n})</span>
        {open ? (
          <ChevronDown className="h-4 w-4 text-cq-text-secondary" />
        ) : (
          <ChevronRight className="h-4 w-4 text-cq-text-secondary" />
        )}
      </button>
      <div className={cn('border-t border-cq-border px-3 py-2', !open && 'hidden')}>
        <ul className="flex flex-col gap-2">
          {attachments.map((a, i) => (
            <li
              key={`${a.name}-${i}`}
              className="flex items-center gap-3 text-sm text-cq-text"
            >
              <FileText className="h-4 w-4 shrink-0 text-cq-text-secondary" />
              <span className="min-w-0 flex-1 truncate font-medium">{a.name}</span>
              <span className="tabular-nums text-cq-text-secondary">
                {a.sizeLabel}
              </span>
              <button
                type="button"
                className="shrink-0 rounded-md border border-cq-border px-2 py-1 text-xs font-bold text-cq-text hover:bg-cq-bg"
              >
                Download
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
