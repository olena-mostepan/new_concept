import type { ClarificationsProjectSlug } from '@/lib/clarifications/mock-data'

export type QuestionType = 'ai' | 'supplier'

/** Who initiated a clarification-style question (not used for AI rows). */
export type QuestionDirection = 'cquel_asked' | 'supplier_asked'

export type AnswerStatus =
  | 'answered'
  | 'partial'
  | 'awaiting'
  | 'sent'
  | 'not_asked'

export type SupplierAnswerAttachment = {
  name: string
  sizeLabel: string
}

export type SupplierAnswer = {
  supplierId: string
  supplierName: string
  status: AnswerStatus
  answerText?: string
  ageLabel?: string
  /** @deprecated Prefer `attachments` — kept for older rows */
  hasAttachment?: boolean
  attachments?: SupplierAnswerAttachment[]
  /** Ops clarification row — used for row navigation */
  clarificationId?: string
}

export type TenderQuestion = {
  id: string
  questionText: string
  type: QuestionType
  /** Clarification rows only — AI questions omit this. */
  direction?: QuestionDirection
  tenderSlug: ClarificationsProjectSlug
  createdAt: string
  ageLabel: string
  answers: SupplierAnswer[]
  /** Supplier-asked rows — who raised the question */
  askedByLabel?: string
  /** First clarification in dispatch — supplier-type View link */
  detailClarificationId?: string
}

export type QuestionFilter = 'all' | 'ai' | 'to_suppliers' | 'from_suppliers'

export type AskDestination = 'ai' | 'supplier'
