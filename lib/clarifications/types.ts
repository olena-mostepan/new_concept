export type Status =
  | 'awaiting'
  | 'review'
  | 'need_response'
  | 'applied'
  | 'closed'

export type Section = 'needs_attention' | 'in_progress' | 'done'

export type TrustLevel = 'verified' | 'high' | 'medium' | 'low'

export type AnswerSource = 'on-platform reply' | 'doc-extract' | 'manual'

export type Clarification = {
  id: string
  /** Shared by every record created in the same Raise-clarification submit. */
  dispatchId: string
  title: string
  question: string
  linkedField?: string
  bidId: string
  bidLabel: string
  supplier: string
  supplierId?: string
  project: string
  raisedAgo: string
  raisedBy: string

  /** Single source of truth for workflow state; court & inbox section are derived per perspective. */
  status: Status
  overdue?: boolean

  tenderLabel?: string
  sentBulkCount?: number

  /** Bid line items for supplier answer screen context (label → display value) */
  bidContext?: Record<string, string>
  /** e.g. "Submitted 14 days ago" */
  bidSubmittedLabel?: string

  reply?: {
    text: string
    from: string
    fromCompany: string
    timeAgo: string
    source: AnswerSource
    trust: TrustLevel
    attachments?: Array<{
      name: string
      sizeLabel: string
    }>
  }

  impact?: {
    fieldLabel: string
    currentValue: string
    currentNote?: string
    proposedValue: string
    proposedNote?: string
  }
}

export type FocusItemKind = 'question' | 'bid_update' | 'profile'

export type FocusItem = {
  id: string
  kind: FocusItemKind
  title: string
  contextLine: string
  ageLabel: string
  primaryAction: 'answer' | 'go_to_project' | 'go_to_profile'
  clarificationId?: string
  overdue?: boolean
}

export type RaiseModalPrefill = {
  linkedField?: string
  bidId: string
  bidLabel: string
  supplierIds: string[]
  supplierNames: string[]
  project: string
}
