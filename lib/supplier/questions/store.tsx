'use client'

import * as React from 'react'
import { toast } from 'sonner'
import {
  buildAllSupplierQuestions,
  getSupplierProjectName,
} from './mock-data'
import { sortSupplierQuestions } from './sort'
import type { SupplierQuestion } from './types'

function formatAttachmentSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '0 B'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function newQuestionId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `sq-${crypto.randomUUID()}`
  }
  return `sq-${Date.now()}`
}

type SupplierQuestionsContextValue = {
  getQuestions: (projectId: string) => SupplierQuestion[]
  getAllQuestions: () => SupplierQuestion[]
  askQuestion: (projectId: string, text: string) => void
  respondWithText: (questionId: string, text: string) => void
  respondWithFiles: (questionId: string, files: File[], message?: string) => void
  markNeedMoreInfo: (questionId: string) => void
}

const SupplierQuestionsContext = React.createContext<
  SupplierQuestionsContextValue | undefined
>(undefined)

export function SupplierQuestionsProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [questions, setQuestions] = React.useState<SupplierQuestion[]>(() =>
    buildAllSupplierQuestions(),
  )

  const getQuestions = React.useCallback(
    (projectId: string) =>
      sortSupplierQuestions(questions.filter((q) => q.projectId === projectId)),
    [questions],
  )

  const getAllQuestions = React.useCallback(
    () => sortSupplierQuestions(questions),
    [questions],
  )

  const askQuestion = React.useCallback((projectId: string, text: string) => {
    const trimmed = text.trim()
    if (!trimmed) return

    const row: SupplierQuestion = {
      id: newQuestionId(),
      projectId,
      projectName: getSupplierProjectName(projectId),
      questionText: trimmed,
      direction: 'you_asked',
      status: 'awaiting_cquel',
      createdAt: new Date().toISOString(),
      ageLabel: 'just now',
      askedBy: 'You',
    }

    setQuestions((prev) => sortSupplierQuestions([row, ...prev]))
    toast.success('Sent — CQuel will respond by email and in-app')
  }, [])

  const respondWithText = React.useCallback((questionId: string, text: string) => {
    const trimmed = text.trim()
    if (!trimmed) return

    setQuestions((prev) =>
      sortSupplierQuestions(
        prev.map((q) =>
          q.id === questionId
            ? {
                ...q,
                status: 'you_answered' as const,
                answer: {
                  text: trimmed,
                  answeredBy: 'You',
                  ageLabel: 'just now',
                },
              }
            : q,
        ),
      ),
    )
    toast.success('Sent — CQuel will review')
  }, [])

  const respondWithFiles = React.useCallback(
    (questionId: string, files: File[], message?: string) => {
      if (files.length === 0) return

      const attachments = files.map((f) => ({
        name: f.name,
        sizeLabel: formatAttachmentSize(f.size),
      }))
      const names = files.map((f) => f.name).join(', ')
      const text = message?.trim()
        ? `${message.trim()} (${names})`
        : `Uploaded: ${names}`

      setQuestions((prev) =>
        sortSupplierQuestions(
          prev.map((q) =>
            q.id === questionId
              ? {
                  ...q,
                  status: 'you_answered' as const,
                  answer: {
                    text,
                    answeredBy: 'You',
                    ageLabel: 'just now',
                    hasAttachment: true,
                    attachments,
                  },
                }
              : q,
          ),
        ),
      )
      toast.success('Sent — CQuel will review')
    },
    [],
  )

  const markNeedMoreInfo = React.useCallback((questionId: string) => {
    setQuestions((prev) =>
      sortSupplierQuestions(
        prev.map((q) =>
          q.id === questionId
            ? {
                ...q,
                status: 'need_more_info' as const,
                answer: undefined,
              }
            : q,
        ),
      ),
    )
    toast.success("CQuel notified — they'll provide more info")
  }, [])

  const value = React.useMemo(
    () => ({
      getQuestions,
      getAllQuestions,
      askQuestion,
      respondWithText,
      respondWithFiles,
      markNeedMoreInfo,
    }),
    [
      getQuestions,
      getAllQuestions,
      askQuestion,
      respondWithText,
      respondWithFiles,
      markNeedMoreInfo,
    ],
  )

  return (
    <SupplierQuestionsContext.Provider value={value}>
      {children}
    </SupplierQuestionsContext.Provider>
  )
}

export function useSupplierQuestions() {
  const ctx = React.useContext(SupplierQuestionsContext)
  if (!ctx) {
    throw new Error(
      'useSupplierQuestions must be used within SupplierQuestionsProvider',
    )
  }
  return ctx
}
