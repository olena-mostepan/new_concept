'use client'

import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { SupplierQuestion } from '@/lib/supplier/questions/types'
import type { ClarifyResponseTab } from '@/lib/supplier/questions/types'
import {
  ClarifyResponseTabs,
  btnGhost,
  btnGreenFilled,
} from '@/components/supplier/questions/ClarifyResponseTabs'

export function SupplierClarifyModal({
  open,
  onOpenChange,
  question,
  onSubmitText,
  onSubmitFiles,
  onMarkBlocked,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  question: SupplierQuestion | null
  onSubmitText: (text: string) => void
  onSubmitFiles: (files: File[], message?: string) => void
  onMarkBlocked: () => void
}) {
  const [activeTab, setActiveTab] = React.useState<ClarifyResponseTab>('details')
  const [detailsText, setDetailsText] = React.useState('')
  const [files, setFiles] = React.useState<File[]>([])
  const [fileMessage, setFileMessage] = React.useState('')

  React.useEffect(() => {
    if (!open) {
      setActiveTab('details')
      setDetailsText('')
      setFiles([])
      setFileMessage('')
    }
  }, [open])

  if (!question) return null

  const title = question.linkedBidField
    ? `Clarify · ${question.linkedBidField}`
    : 'Clarify'

  const canSendDetails = detailsText.trim().length > 0
  const canSendFiles = files.length > 0

  function handleSend() {
    if (activeTab === 'details' && canSendDetails) {
      onSubmitText(detailsText.trim())
      onOpenChange(false)
      return
    }
    if (activeTab === 'files' && canSendFiles) {
      onSubmitFiles(files, fileMessage.trim() || undefined)
      onOpenChange(false)
    }
  }

  function handleBlocked() {
    onMarkBlocked()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="max-h-[calc(100dvh-2rem)] gap-0 overflow-y-auto border-cq-border p-0 sm:max-w-[640px]"
      >
        <DialogHeader className="border-b border-cq-border px-6 pb-4 pt-6 text-left">
          <DialogTitle className="text-lg font-extrabold text-cq-text">{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 px-6 py-5">
          <section className="rounded-xl border border-[rgba(28,117,188,0.12)] bg-[rgba(28,117,188,0.06)] px-5 py-4">
            <p className="text-xs font-semibold text-cq-text-secondary">
              {question.askedBy} · {question.ageLabel}
            </p>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-cq-text">
              {question.questionText}
            </p>
          </section>

          {question.bidContext ? (
            <section className="rounded-xl border border-cq-border bg-white p-5">
              <h3 className="text-sm font-bold text-cq-text">Your bid — context</h3>
              <div className="mt-3 rounded-r-md border-l-2 border-[var(--cq-green)] bg-cq-bg/50 py-2 pl-3 pr-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-cq-text-secondary">
                  {question.bidContext.field}
                </p>
                <p className="mt-0.5 text-sm font-medium text-cq-text">
                  {question.bidContext.submittedValue}
                  <span className="ml-2 font-normal text-cq-text-secondary">
                    ← question is about this
                  </span>
                </p>
              </div>
            </section>
          ) : null}

          <ClarifyResponseTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            detailsText={detailsText}
            onDetailsTextChange={setDetailsText}
            files={files}
            onFilesChange={setFiles}
            fileMessage={fileMessage}
            onFileMessageChange={setFileMessage}
            onConfirmBlocked={handleBlocked}
          />
        </div>

        {activeTab !== 'blocked' ? (
          <DialogFooter className="border-t border-cq-border px-6 py-4 sm:justify-between">
            <button type="button" className={btnGhost} onClick={() => onOpenChange(false)}>
              Cancel
            </button>
            <button
              type="button"
              className={btnGreenFilled}
              disabled={
                activeTab === 'details' ? !canSendDetails : !canSendFiles
              }
              onClick={handleSend}
            >
              Send response
            </button>
          </DialogFooter>
        ) : (
          <div className="border-t border-cq-border px-6 py-4">
            <button type="button" className={btnGhost} onClick={() => onOpenChange(false)}>
              Cancel
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
