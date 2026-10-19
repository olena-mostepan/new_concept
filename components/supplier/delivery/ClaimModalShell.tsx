'use client'

import type { ReactNode } from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export function ClaimModalShell({
  open,
  onOpenChange,
  title,
  subtitle,
  children,
  primaryLabel,
  onPrimary,
  primaryDisabled,
  cancelClassName = 'btn-secondary',
  contentClassName,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  subtitle: string
  children: ReactNode
  primaryLabel: string
  onPrimary: () => void
  primaryDisabled?: boolean
  cancelClassName?: string
  contentClassName?: string
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className={
          contentClassName ??
          'gap-0 overflow-hidden border-cq-border p-0 sm:max-w-[480px]'
        }
      >
        <DialogHeader className="space-y-1 border-b border-cq-border px-6 py-5 text-left">
          <DialogTitle className="text-xl font-semibold text-black">
            {title}
          </DialogTitle>
          <p className="text-sm text-cq-text-secondary">{subtitle}</p>
        </DialogHeader>

        <div className="max-h-[min(70vh,32rem)] space-y-4 overflow-y-auto px-6 py-5">
          {children}
        </div>

        <DialogFooter className="flex-row items-center justify-between gap-2 border-t border-cq-border px-6 py-4 sm:justify-between">
          <button
            type="button"
            className={cancelClassName}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn-primary"
            disabled={primaryDisabled}
            onClick={onPrimary}
          >
            {primaryLabel}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
