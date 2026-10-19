'use client'

import * as React from 'react'
import { toast } from 'sonner'
import type { ClarificationsProjectSlug } from '@/lib/clarifications/mock-data'
import {
  clarificationBidId,
  clarificationProjectLabel,
  DEFAULT_CLARIFICATION_PROJECT,
} from '@/lib/clarifications/mock-data'
import { useClarifications } from '@/lib/clarifications/store'
import type { AskDestination, TenderQuestion } from './types'
import { mergeTenderQuestions, mockAiAnswersForQuestion } from './adapters'
import { answerCanBeAsked } from './needs-supplier'
import { tenderSuppliersForSlug } from './tender-suppliers'
import { SEED_AI_QUESTIONS_SOLAR } from './mock-ai-data'

function newQuestionId(prefix: string): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`
  }
  return `${prefix}-${Date.now()}`
}

const ALL_TENDER_SLUGS: ClarificationsProjectSlug[] = ['solar', 'led', 'led-rostock']

export type SendToSuppliersModalState = {
  questionId: string
  supplierIds: string[]
} | null

type QuestionsContextValue = {
  getQuestions: (slug: ClarificationsProjectSlug) => TenderQuestion[]
  getQuestionById: (id: string) => TenderQuestion | undefined
  askQuestion: (
    slug: ClarificationsProjectSlug,
    question: string,
    destination: AskDestination,
    supplierIds: string[],
  ) => void
  sendExistingQuestionToSuppliers: (questionId: string, supplierIds: string[]) => void
  askModalOpen: boolean
  openAskModal: () => void
  closeAskModal: () => void
  sendToSuppliersModal: SendToSuppliersModalState
  openSendToSuppliersModal: (questionId: string, supplierIds: string[]) => void
  closeSendToSuppliersModal: () => void
}

const QuestionsContext = React.createContext<QuestionsContextValue | undefined>(
  undefined,
)

export function QuestionsProvider({ children }: { children: React.ReactNode }) {
  const { items: clarifications, sendNewClarifications } = useClarifications()
  const [aiQuestions, setAiQuestions] = React.useState<TenderQuestion[]>(
    SEED_AI_QUESTIONS_SOLAR,
  )
  const [askModalOpen, setAskModalOpen] = React.useState(false)
  const [sendToSuppliersModal, setSendToSuppliersModal] =
    React.useState<SendToSuppliersModalState>(null)

  const getQuestions = React.useCallback(
    (slug: ClarificationsProjectSlug) =>
      mergeTenderQuestions(slug, aiQuestions, clarifications),
    [aiQuestions, clarifications],
  )

  const getQuestionById = React.useCallback(
    (id: string) => {
      const fromAi = aiQuestions.find((q) => q.id === id)
      if (fromAi) return fromAi
      for (const slug of ALL_TENDER_SLUGS) {
        const found = mergeTenderQuestions(slug, aiQuestions, clarifications).find(
          (q) => q.id === id,
        )
        if (found) return found
      }
      return undefined
    },
    [aiQuestions, clarifications],
  )

  const askQuestion = React.useCallback(
    (
      slug: ClarificationsProjectSlug,
      question: string,
      destination: AskDestination,
      supplierIds: string[],
    ) => {
      const text = question.trim()
      if (!text) return

      if (destination === 'ai') {
        const row: TenderQuestion = {
          id: newQuestionId('ai'),
          questionText: text,
          type: 'ai',
          tenderSlug: slug,
          createdAt: new Date().toISOString(),
          ageLabel: 'just now',
          answers: mockAiAnswersForQuestion(slug, text),
        }
        setAiQuestions((prev) => [row, ...prev])
        return
      }

      const recipients = tenderSuppliersForSlug(slug).filter((s) =>
        supplierIds.includes(s.id),
      )
      if (recipients.length === 0) return

      sendNewClarifications({
        question: text,
        recipients,
        bidId: clarificationBidId(slug),
        bidLabel: `Bid ${clarificationBidId(slug)}`,
        project:
          slug === 'solar'
            ? DEFAULT_CLARIFICATION_PROJECT
            : clarificationProjectLabel(slug),
        raisedBy: 'You',
      })
    },
    [sendNewClarifications],
  )

  const sendExistingQuestionToSuppliers = React.useCallback(
    (questionId: string, supplierIds: string[]) => {
      const question = aiQuestions.find((q) => q.id === questionId)
      if (!question || question.type !== 'ai') return

      const slug = question.tenderSlug
      const askable = new Set(
        question.answers
          .filter((a) => answerCanBeAsked(a) && supplierIds.includes(a.supplierId))
          .map((a) => a.supplierId),
      )
      const recipients = tenderSuppliersForSlug(slug).filter((s) => askable.has(s.id))
      if (recipients.length === 0) return

      sendNewClarifications({
        question: question.questionText,
        recipients,
        bidId: clarificationBidId(slug),
        bidLabel: `Bid ${clarificationBidId(slug)}`,
        project:
          slug === 'solar'
            ? DEFAULT_CLARIFICATION_PROJECT
            : clarificationProjectLabel(slug),
        raisedBy: 'You',
      })

      setAiQuestions((prev) =>
        prev.map((q) => {
          if (q.id !== questionId) return q
          return {
            ...q,
            answers: q.answers.map((a) => {
              if (!askable.has(a.supplierId)) return a
              return {
                ...a,
                status: 'sent' as const,
                ageLabel: 'Sent · awaiting response',
              }
            }),
          }
        }),
      )

      const n = recipients.length
      toast.success(
        n === 1 ? 'Sent to supplier' : `Sent to ${n} suppliers`,
        {
          description: 'They can reply in clarifications',
        },
      )
    },
    [aiQuestions, sendNewClarifications],
  )

  const value = React.useMemo(
    () => ({
      getQuestions,
      getQuestionById,
      askQuestion,
      sendExistingQuestionToSuppliers,
      askModalOpen,
      openAskModal: () => setAskModalOpen(true),
      closeAskModal: () => setAskModalOpen(false),
      sendToSuppliersModal,
      openSendToSuppliersModal: (questionId: string, supplierIds: string[]) =>
        setSendToSuppliersModal({ questionId, supplierIds }),
      closeSendToSuppliersModal: () => setSendToSuppliersModal(null),
    }),
    [
      getQuestions,
      getQuestionById,
      askQuestion,
      sendExistingQuestionToSuppliers,
      askModalOpen,
      sendToSuppliersModal,
    ],
  )

  return (
    <QuestionsContext.Provider value={value}>{children}</QuestionsContext.Provider>
  )
}

export function useQuestions() {
  const ctx = React.useContext(QuestionsContext)
  if (!ctx) {
    throw new Error('useQuestions must be used within QuestionsProvider')
  }
  return ctx
}
