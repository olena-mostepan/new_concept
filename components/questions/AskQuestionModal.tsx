'use client'

import * as React from 'react'
import { MessageCircle, Sparkles } from 'lucide-react'
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
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { AskDestination } from '@/lib/questions/types'
import type { ClarificationsProjectSlug } from '@/lib/clarifications/mock-data'
import { AI_QUESTION_SUGGESTIONS } from '@/lib/questions/mock-ai-data'
import { tenderSuppliersForSlug } from '@/lib/questions/tender-suppliers'
import { useQuestions } from '@/lib/questions/store'

const checkboxCx =
  'border-cq-border data-[state=checked]:border-cq-green data-[state=checked]:bg-[var(--cq-green)] data-[state=checked]:text-white'

export function AskQuestionModal({
  tenderSlug,
}: {
  tenderSlug: ClarificationsProjectSlug
}) {
  const { askModalOpen, closeAskModal, askQuestion } = useQuestions()
  const suppliers = tenderSuppliersForSlug(tenderSlug)

  const [question, setQuestion] = React.useState('')
  const [destination, setDestination] = React.useState<AskDestination>('ai')
  const [selected, setSelected] = React.useState<Set<string>>(new Set())

  React.useEffect(() => {
    if (!askModalOpen) return
    setQuestion('')
    setDestination('ai')
    setSelected(new Set(suppliers.map((s) => s.id)))
  }, [askModalOpen, tenderSlug, suppliers])

  const allIds = suppliers.map((s) => s.id)
  const setAllChecked = (on: boolean) => {
    setSelected(on ? new Set(allIds) : new Set())
  }

  const toggleId = (id: string, checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (checked) next.add(id)
      else next.delete(id)
      return next
    })
  }

  const canSend =
    question.trim().length > 0 &&
    (destination === 'ai' || (selected.size > 0 && selected.size <= allIds.length))

  function onSend() {
    if (!canSend) return
    askQuestion(
      tenderSlug,
      question.trim(),
      destination,
      destination === 'ai' ? allIds : Array.from(selected),
    )
    closeAskModal()
  }

  return (
    <Dialog open={askModalOpen} onOpenChange={(o) => !o && closeAskModal()}>
      <DialogContent
        showCloseButton
        className="max-h-[calc(100dvh-2rem)] gap-5 overflow-y-auto border-cq-border p-6 sm:max-w-[520px]"
      >
        <DialogHeader className="space-y-0 text-left">
          <DialogTitle className="text-xl font-bold text-cq-text">
            Ask a question
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-1.5">
          <Label htmlFor="ask-question-text" className="text-sm font-semibold text-cq-text">
            Question
          </Label>
          <Textarea
            id="ask-question-text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask your question about the tender…"
            rows={4}
            className="min-h-[96px] resize-y border-cq-border text-cq-text"
          />
        </div>

        {destination === 'ai' && (
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-cq-text">Suggestions</Label>
            <div className="flex flex-wrap gap-2">
              {AI_QUESTION_SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setQuestion(s)}
                  className="rounded-lg border border-cq-border bg-cq-bg/50 px-2.5 py-1 text-left text-xs font-medium text-cq-text hover:border-cq-green/50"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <div
          className={cn(
            'space-y-2',
            destination === 'ai' && 'pointer-events-none opacity-50',
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <Label className="text-sm font-semibold text-cq-text">Suppliers</Label>
            {destination === 'supplier' && (
              <button
                type="button"
                className="text-sm font-bold text-cq-link underline"
                onClick={() =>
                  setAllChecked(!(allIds.every((id) => selected.has(id)) && selected.size > 0))
                }
              >
                {allIds.every((id) => selected.has(id)) && selected.size > 0
                  ? 'Deselect all'
                  : 'Select all'}
              </button>
            )}
          </div>
          {destination === 'ai' ? (
            <p className="text-sm text-cq-text-secondary">
              CQuel Agent reads all available bids — no need to select suppliers.
            </p>
          ) : (
            <ul className="max-h-40 space-y-2 overflow-y-auto rounded-lg border border-cq-border p-3">
              {suppliers.map((s) => (
                <li key={s.id} className="flex items-center gap-2">
                  <Checkbox
                    id={`ask-supplier-${s.id}`}
                    checked={selected.has(s.id)}
                    onCheckedChange={(c) => toggleId(s.id, c === true)}
                    className={checkboxCx}
                  />
                  <label
                    htmlFor={`ask-supplier-${s.id}`}
                    className="cursor-pointer text-sm font-medium text-cq-text"
                  >
                    {s.name}
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold text-cq-text">Send to</Label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setDestination('ai')}
              className={cn(
                'rounded-lg border px-3 py-3 text-left transition-colors',
                destination === 'ai'
                  ? 'border-cq-green bg-cq-green/10'
                  : 'border-cq-border bg-white hover:bg-cq-bg',
              )}
            >
              <span className="flex items-center gap-1.5 text-sm font-bold text-cq-text">
                <Sparkles className="h-4 w-4 text-cq-green" />
                Ask CQuel Agent
              </span>
              <span className="mt-1 block text-xs text-cq-text-secondary">
                CQuel Agent will read the supplier bids and try to answer.
              </span>
            </button>
            <button
              type="button"
              onClick={() => setDestination('supplier')}
              className={cn(
                'rounded-lg border px-3 py-3 text-left transition-colors',
                destination === 'supplier'
                  ? 'border-cq-green bg-cq-green/10'
                  : 'border-cq-border bg-white hover:bg-cq-bg',
              )}
            >
              <span className="flex items-center gap-1.5 text-sm font-bold text-cq-text">
                <MessageCircle className="h-4 w-4 text-cq-text-secondary" />
                Ask supplier
              </span>
              <span className="mt-1 block text-xs text-cq-text-secondary">
                Sent to suppliers for them to answer.
              </span>
            </button>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          <DialogClose
            type="button"
            className="btn-secondary"
          >
            Cancel
          </DialogClose>
          <button
            type="button"
            disabled={!canSend}
            onClick={onSend}
            className="btn-primary"
          >
            {destination === 'ai' ? 'Send to CQuel Agent' : 'Send to suppliers'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
