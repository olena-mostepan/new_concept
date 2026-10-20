'use client'

import * as React from 'react'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { useQuestions } from '@/lib/questions/store'
import { answerCanBeAsked } from '@/lib/questions/needs-supplier'
import { tenderSuppliersForSlug } from '@/lib/questions/tender-suppliers'

const checkboxCx =
  'border-cq-border data-[state=checked]:border-cq-green data-[state=checked]:bg-[var(--cq-green)] data-[state=checked]:text-white'

export function SendToSuppliersModal() {
  const {
    sendToSuppliersModal,
    closeSendToSuppliersModal,
    getQuestionById,
    sendExistingQuestionToSuppliers,
  } = useQuestions()

  const question = sendToSuppliersModal
    ? getQuestionById(sendToSuppliersModal.questionId)
    : undefined

  const askableIds = React.useMemo(() => {
    if (!question) return []
    return question.answers
      .filter(answerCanBeAsked)
      .map((a) => a.supplierId)
  }, [question])

  const suppliers = question
    ? tenderSuppliersForSlug(question.tenderSlug).filter((s) =>
        askableIds.includes(s.id),
      )
    : []

  const [selected, setSelected] = React.useState<Set<string>>(new Set())

  React.useEffect(() => {
    if (!sendToSuppliersModal || !question) return
    const allowed = new Set(askableIds)
    const initial = sendToSuppliersModal.supplierIds.filter((id) => allowed.has(id))
    setSelected(new Set(initial.length > 0 ? initial : askableIds))
  }, [sendToSuppliersModal, question, askableIds])

  const allIds = suppliers.map((s) => s.id)
  const allSelected =
    allIds.length > 0 && allIds.every((id) => selected.has(id)) && selected.size > 0

  const toggleId = (id: string, checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (checked) next.add(id)
      else next.delete(id)
      return next
    })
  }

  const canSend = selected.size > 0 && Boolean(question)

  function onSend() {
    if (!sendToSuppliersModal || !canSend) return
    sendExistingQuestionToSuppliers(
      sendToSuppliersModal.questionId,
      Array.from(selected),
    )
    closeSendToSuppliersModal()
  }

  return (
    <Dialog
      open={Boolean(sendToSuppliersModal)}
      onOpenChange={(o) => !o && closeSendToSuppliersModal()}
    >
      <DialogContent
        showCloseButton
        className="max-h-[calc(100dvh-2rem)] gap-5 overflow-y-auto border-cq-border p-6 sm:max-w-[520px]"
      >
        <DialogHeader className="space-y-0 text-left">
          <DialogTitle className="text-xl font-semibold text-cq-text">
            Ask suppliers
          </DialogTitle>
          <p className="pt-1 text-sm text-cq-text-secondary">
            Send this CQuel Agent question to selected suppliers.
          </p>
        </DialogHeader>

        {question ? (
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold text-cq-text">Question</Label>
            <p className="rounded-lg border border-cq-border bg-cq-bg/40 px-3 py-2.5 text-sm leading-relaxed text-cq-text">
              {question.questionText}
            </p>
          </div>
        ) : (
          <p className="text-sm text-cq-text-secondary">Question not found.</p>
        )}

        {question && suppliers.length > 0 ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label className="text-sm font-semibold text-cq-text">Suppliers</Label>
              <button
                type="button"
                className="text-sm font-semibold text-cq-link underline"
                onClick={() =>
                  setSelected(allSelected ? new Set() : new Set(allIds))
                }
              >
                {allSelected ? 'Deselect all' : 'Select all'}
              </button>
            </div>
            <ul className="max-h-48 space-y-2 overflow-y-auto rounded-lg border border-cq-border p-3">
              {suppliers.map((s) => (
                <li key={s.id} className="flex items-center gap-2">
                  <Checkbox
                    id={`send-supplier-${s.id}`}
                    checked={selected.has(s.id)}
                    onCheckedChange={(c) => toggleId(s.id, c === true)}
                    className={checkboxCx}
                  />
                  <label
                    htmlFor={`send-supplier-${s.id}`}
                    className="cursor-pointer text-sm font-normal text-cq-text"
                  >
                    {s.name}
                  </label>
                </li>
              ))}
            </ul>
          </div>
        ) : question ? (
          <p className="text-sm text-cq-text-secondary">
            All suppliers are awaiting a response for this question.
          </p>
        ) : null}

        <DialogFooter className="gap-2 sm:justify-between">
          <DialogClose type="button" className="btn-secondary">
            Cancel
          </DialogClose>
          <button
            type="button"
            disabled={!canSend}
            onClick={onSend}
            className="btn-primary"
          >
            Send to suppliers
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
