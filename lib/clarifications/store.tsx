'use client'

import * as React from 'react'
import type { Clarification } from './types'
import type { RaiseModalPrefill } from './types'
import {
  DEFAULT_CLARIFICATION_PROJECT,
  DEMO_SUPPLIER_NAME,
  SEED_CLARIFICATIONS,
} from './mock-data'

function newClarificationId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `cl-${crypto.randomUUID()}`
  }
  return `cl-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function formatAttachmentSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '0 B'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function deriveTitle(question: string): string {
  const t = question.trim().replace(/\s+/g, ' ')
  if (t.length <= 52) return t || 'Clarification'
  return `${t.slice(0, 49)}…`
}

type ClarificationsContextValue = {
  items: Clarification[]
  raiseModalOpen: boolean
  prefillRaise: RaiseModalPrefill | null
  openRaiseModal: (prefill?: RaiseModalPrefill | null) => void
  closeRaiseModal: () => void
  sendNewClarifications: (draft: {
    question: string
    recipients: Array<{ id: string; name: string }>
    bidId: string
    bidLabel: string
    project: string
    linkedField?: string
    raisedBy: string
  }) => void
  acceptClarification: (id: string) => void
  submitSupplierTextReply: (id: string, text: string) => void
  submitSupplierAttachmentReply: (
    id: string,
    files: File[],
  ) => void
  submitSupplierBlocked: (id: string) => void
}

const ClarificationsContext = React.createContext<
  ClarificationsContextValue | undefined
>(undefined)

export function ClarificationsProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [items, setItems] = React.useState<Clarification[]>(SEED_CLARIFICATIONS)
  const [raiseModalOpen, setRaiseModalOpen] = React.useState(false)
  const [prefillRaise, setPrefillRaise] = React.useState<RaiseModalPrefill | null>(
    null,
  )

  const openRaiseModal = React.useCallback((prefill?: RaiseModalPrefill | null) => {
    setPrefillRaise(prefill ?? null)
    setRaiseModalOpen(true)
  }, [])

  const closeRaiseModal = React.useCallback(() => {
    setRaiseModalOpen(false)
    setPrefillRaise(null)
  }, [])

  const sendNewClarifications = React.useCallback(
    (draft: {
      question: string
      recipients: Array<{ id: string; name: string }>
      bidId: string
      bidLabel: string
      project: string
      linkedField?: string
      raisedBy: string
    }) => {
      const title = deriveTitle(draft.question)
      const dispatchId =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `disp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
      const additions: Clarification[] = draft.recipients.map((r) => ({
        id: newClarificationId(),
        dispatchId,
        title,
        question: draft.question.trim(),
        linkedField: draft.linkedField,
        bidId: draft.bidId,
        bidLabel: draft.bidLabel,
        supplier: r.name,
        supplierId: r.id,
        project: draft.project || DEFAULT_CLARIFICATION_PROJECT,
        raisedAgo: 'just now',
        raisedBy: draft.raisedBy,
        status: 'awaiting',
      }))
      setItems((prev) => [...additions, ...prev])
    },
    [],
  )

  const acceptClarification = React.useCallback((id: string) => {
    setItems((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status: 'applied' as const } : c,
      ),
    )
  }, [])

  const applySupplierReply = React.useCallback(
    (
      id: string,
      reply: NonNullable<Clarification['reply']>,
      impactPatch?: Clarification['impact'],
    ) => {
      setItems((prev) =>
        prev.map((c) => {
          if (c.id !== id) return c
          const impact =
            impactPatch ??
            (c.linkedField
              ? {
                  fieldLabel: c.linkedField,
                  currentValue:
                    c.bidContext?.[c.linkedField] ??
                    c.impact?.currentValue ??
                    '—',
                  proposedValue:
                    reply.text.length > 160
                      ? `${reply.text.slice(0, 157)}…`
                      : reply.text,
                }
              : c.impact)
          return {
            ...c,
            status: 'review' as const,
            reply,
            impact: impact ?? c.impact,
          }
        }),
      )
    },
    [],
  )

  const submitSupplierTextReply = React.useCallback(
    (id: string, text: string) => {
      const trimmed = text.trim()
      const reply = {
        text: trimmed,
        from: 'Tom',
        fromCompany: DEMO_SUPPLIER_NAME,
        timeAgo: 'just now',
        source: 'on-platform reply' as const,
        trust: 'high' as const,
      }
      applySupplierReply(id, reply)
    },
    [applySupplierReply],
  )

  const submitSupplierAttachmentReply = React.useCallback(
    (id: string, files: File[]) => {
      const attachments = files.map((f) => ({
        name: f.name,
        sizeLabel: formatAttachmentSize(f.size),
      }))
      const reply = {
        text: '(supporting documents attached)',
        from: 'Tom',
        fromCompany: DEMO_SUPPLIER_NAME,
        timeAgo: 'just now',
        source: 'on-platform reply' as const,
        trust: 'high' as const,
        attachments,
      }
      applySupplierReply(id, reply)
    },
    [applySupplierReply],
  )

  const submitSupplierBlocked = React.useCallback((id: string) => {
    setItems((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              status: 'need_response' as const,
            }
          : c,
      ),
    )
  }, [])

  const value = React.useMemo(
    () => ({
      items,
      raiseModalOpen,
      prefillRaise,
      openRaiseModal,
      closeRaiseModal,
      sendNewClarifications,
      acceptClarification,
      submitSupplierTextReply,
      submitSupplierAttachmentReply,
      submitSupplierBlocked,
    }),
    [
      items,
      raiseModalOpen,
      prefillRaise,
      openRaiseModal,
      closeRaiseModal,
      sendNewClarifications,
      acceptClarification,
      submitSupplierTextReply,
      submitSupplierAttachmentReply,
      submitSupplierBlocked,
    ],
  )

  return (
    <ClarificationsContext.Provider value={value}>
      {children}
    </ClarificationsContext.Provider>
  )
}

export function useClarifications(): ClarificationsContextValue {
  const ctx = React.useContext(ClarificationsContext)
  if (!ctx) {
    throw new Error(
      'useClarifications must be used within ClarificationsProvider',
    )
  }
  return ctx
}
