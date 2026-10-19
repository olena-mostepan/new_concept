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
import { Textarea } from '@/components/ui/textarea'
import type { RaiseModalPrefill } from '@/lib/clarifications/types'
import {
  DEFAULT_CLARIFICATION_PROJECT,
  MOCK_CLARIFICATION_RECIPIENTS,
} from '@/lib/clarifications/mock-data'
import { useClarifications } from '@/lib/clarifications/store'
import { Label } from '@/components/ui/label'
function linkedContextChip(prefill: RaiseModalPrefill | null): string {
  if (!prefill) {
    return `— · Select suppliers · ${DEFAULT_CLARIFICATION_PROJECT}`
  }
  const core = `${prefill.bidLabel} · ${prefill.supplierNames[0] ?? 'Supplier'} · ${prefill.project}`
  if (prefill.linkedField) {
    return `${prefill.linkedField} · ${core}`
  }
  if (prefill.supplierNames.length > 1) {
    const names = prefill.supplierNames.join(', ')
    return `${prefill.bidLabel} · ${names} · ${prefill.project}`
  }
  return core
}

const checkboxCx =
  'border-cq-border data-[state=checked]:border-cq-green data-[state=checked]:bg-[var(--cq-green)] data-[state=checked]:text-white'

export function RaiseClarificationModal() {
  const {
    raiseModalOpen,
    closeRaiseModal,
    prefillRaise,
    sendNewClarifications,
  } = useClarifications()

  const [question, setQuestion] = React.useState('')
  const [selected, setSelected] = React.useState<Set<string>>(new Set())

  React.useEffect(() => {
    if (!raiseModalOpen) return
    setQuestion('')
    if (prefillRaise?.supplierIds?.length) {
      setSelected(new Set(prefillRaise.supplierIds))
    } else {
      setSelected(new Set())
    }
  }, [raiseModalOpen, prefillRaise])

  const toggleId = (id: string, checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (checked) next.add(id)
      else next.delete(id)
      return next
    })
  }

  const allIds = MOCK_CLARIFICATION_RECIPIENTS.map((s) => s.id)
  const allSelected = allIds.every((id) => selected.has(id)) && selected.size > 0
  const setAllChecked = (on: boolean) => {
    if (on) setSelected(new Set(allIds))
    else setSelected(new Set())
  }

  const chip = linkedContextChip(prefillRaise)
  const canSend =
    question.trim().length > 0 && selected.size >= 1 && selected.size <= allIds.length

  const bidId =
    prefillRaise?.bidId ??
    '-'
  const bidLabel =
    prefillRaise?.bidLabel ??
    'Open question'

  function onSend() {
    if (!canSend) return
    const recipients = MOCK_CLARIFICATION_RECIPIENTS.filter((s) =>
      selected.has(s.id),
    ).map((s) => ({ id: s.id, name: s.name }))
    sendNewClarifications({
      question: question.trim(),
      recipients,
      bidId,
      bidLabel,
      project: prefillRaise?.project ?? DEFAULT_CLARIFICATION_PROJECT,
      linkedField: prefillRaise?.linkedField,
      raisedBy: 'You',
    })
    closeRaiseModal()
  }

  return (
    <Dialog open={raiseModalOpen} onOpenChange={(o) => !o && closeRaiseModal()}>
      <DialogContent
        showCloseButton
        className="max-h-[calc(100dvh-2rem)] gap-6 overflow-y-auto border-cq-border p-6 sm:max-w-[480px]"
      >
        <DialogHeader className="space-y-0 text-left">
          <DialogTitle className="text-xl font-bold text-cq-text">
            Raise clarification
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-1.5">
          <Label className="text-sm font-semibold text-cq-text">Linked context</Label>
          <p className="rounded-lg border border-cq-border bg-cq-bg/40 px-3 py-2 text-sm leading-snug text-cq-text">
            {chip}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="cq-clar-q" className="text-sm font-semibold text-cq-text">
            Question
          </Label>
          <Textarea
            id="cq-clar-q"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="What needs clarifying?"
            rows={5}
            className="min-h-[5.5rem] resize-y rounded-lg border-cq-border"
          />
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold text-cq-text">Send to</p>
          <div className="flex items-center gap-2 rounded-lg border border-cq-border p-3">
            <Checkbox
              id="all-suppliers"
              checked={allSelected}
              onCheckedChange={(c) => setAllChecked(!!c)}
              className={checkboxCx}
            />
            <label
              htmlFor="all-suppliers"
              className="cursor-pointer text-sm font-semibold text-cq-text"
            >
              All suppliers
            </label>
          </div>
          <div className="grid gap-2">
            {MOCK_CLARIFICATION_RECIPIENTS.map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-2 rounded-lg border border-cq-border px-3 py-2"
              >
                <Checkbox
                  id={`sup-${s.id}`}
                  checked={selected.has(s.id)}
                  onCheckedChange={(c) => toggleId(s.id, !!c)}
                  className={checkboxCx}
                />
                <label
                  htmlFor={`sup-${s.id}`}
                  className="flex-1 cursor-pointer text-sm text-cq-text"
                >
                  {s.name}
                </label>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter className="flex w-full flex-col gap-2 sm:flex-row sm:justify-between sm:gap-3">
          <DialogClose asChild>
            <button type="button" className={bidCancelClass}>
              Cancel
            </button>
          </DialogClose>
          <button
            type="button"
            disabled={!canSend}
            onClick={onSend}
            className="inline-flex w-full shrink-0 items-center justify-center rounded-lg bg-[var(--cq-green)] px-4 py-2.5 text-sm font-bold text-white hover:bg-[var(--cq-green-hover)] disabled:pointer-events-none disabled:opacity-50 sm:w-auto"
          >
            Send
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

const bidCancelClass =
  'rounded-lg border border-cq-border bg-white px-4 py-2.5 text-sm font-bold text-cq-text hover:bg-cq-bg'
