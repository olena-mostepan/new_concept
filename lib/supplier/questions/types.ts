export type QuestionDirection = 'you_asked' | 'cquel_asked'

export type SupplierQuestionStatus =
  | 'awaiting_cquel'
  | 'cquel_answered'
  | 'awaiting_you'
  | 'you_answered'
  | 'need_more_info'
  | 'resolved'

export type SupplierQuestionAnswerAttachment = {
  name: string
  sizeLabel: string
}

export type SupplierQuestionAnswer = {
  text: string
  answeredBy: string
  ageLabel: string
  /** @deprecated Prefer `attachments` */
  hasAttachment?: boolean
  attachments?: SupplierQuestionAnswerAttachment[]
}

export type SupplierQuestionBidContext = {
  field: string
  submittedValue: string
}

export type SupplierQuestion = {
  id: string
  projectId: string
  /** Tender / project display name for cross-project lists */
  projectName?: string
  questionText: string
  direction: QuestionDirection
  status: SupplierQuestionStatus
  createdAt: string
  ageLabel: string
  askedBy: string
  answer?: SupplierQuestionAnswer
  linkedBidField?: string
  bidContext?: SupplierQuestionBidContext
  /** Links back to clarifications seed row when sourced from Bid Clarifications */
  clarificationId?: string
}

export type SupplierQuestionFilter = 'all' | 'you_asked' | 'cquel_asked'

export type ClarifyResponseTab = 'details' | 'files' | 'blocked'
