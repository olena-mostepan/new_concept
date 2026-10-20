'use client'

import * as React from 'react'
import { ArrowRight, FileText } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { PendingChange } from '@/lib/supplier/profile/types'

export function ReviewChangesBanner({
  count,
  onReview,
}: {
  count: number
  onReview: () => void
}) {
  if (count === 0) return null

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--cq-green)]/20 bg-[var(--cq-accent-muted)] px-4 py-3 sm:px-5">
      <p className="text-sm text-cq-text">
        Based on the files you&apos;ve submitted, we&apos;ve identified a few changes to your
        profile data.
      </p>
      <button
        type="button"
        onClick={onReview}
        className="btn-primary shrink-0"
      >
        Review changes ({count})
      </button>
    </div>
  )
}

export function ReviewChangesModal({
  open,
  onOpenChange,
  changes,
  onAccept,
  onReject,
  onAcceptAll,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  changes: PendingChange[]
  onAccept: (id: string) => void
  onReject: (id: string) => void
  onAcceptAll: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg gap-0 p-0 sm:max-w-lg" showCloseButton>
        <DialogHeader className="space-y-0 border-b border-cq-border px-6 pb-4 pt-6 text-left">
          <DialogTitle className="text-lg font-semibold text-cq-text">
            Verify your account
          </DialogTitle>
          <DialogDescription className="text-sm text-cq-text-secondary">
            Confirm these details extracted from your documents to verify your company account.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] space-y-4 overflow-y-auto px-6 py-4">
          {changes.map((change) => (
            <div
              key={change.id}
              className="rounded-lg border border-cq-border bg-cq-bg p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-cq-text-secondary">
                    {change.section}
                  </p>
                  <p className="mt-0.5 font-semibold text-cq-text">{change.label}</p>
                </div>
                <span className="inline-flex items-center gap-1 rounded bg-white px-2 py-1 text-cq-text-secondary p7">
                  <FileText className="h-3 w-3" />
                  {change.sourceDocument.length > 24
                    ? `${change.sourceDocument.slice(0, 24)}…`
                    : change.sourceDocument}
                </span>
              </div>

              <div className="mt-3 flex items-center gap-3 text-sm">
                <span className="text-cq-muted line-through">{change.currentValue}</span>
                <ArrowRight className="h-4 w-4 shrink-0 text-[var(--cq-green)]" aria-hidden />
                <span className="font-semibold text-cq-text">{change.suggestedValue}</span>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => onAccept(change.id)}
                  className="btn-primary-sm"
                >
                  Accept & verify
                </button>
                <button
                  type="button"
                  onClick={() => onReject(change.id)}
                  className="btn-secondary-sm"
                >
                  Dismiss
                </button>
              </div>
            </div>
          ))}
        </div>

        {changes.length > 1 && (
          <DialogFooter className="border-t border-cq-border px-6 py-4 sm:justify-between">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="btn-secondary"
            >
              Close
            </button>
            <button
              type="button"
              onClick={onAcceptAll}
              className="btn-primary"
            >
              Accept all & verify account
            </button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
