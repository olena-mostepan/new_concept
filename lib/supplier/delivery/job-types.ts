import type { ClaimStatus } from './types'

export type JobStageStatus = 'paid' | 'invoiced' | 'next' | 'upcoming'

/** How the stage £ is currently sourced. */
export type StageAmountSource = 'model' | 'invoice'

/** How sure we are the stage/date is right (separate from ≈ on £). */
export type StageConfidence = 'confirmed' | 'likely' | 'estimated'

export type ConfidenceReason = 'invoice' | 'external' | 'similar' | 'model'

export type JobDeliveryStage = {
  name: string
  /** Stage weight as percentage points (e.g. 35 = 35%). */
  pct: number
  /** Effective £ — model-derived unless invoice was adopted. */
  amount: number
  date: string
  est: boolean
  status: JobStageStatus
  /** Ingested invoice £ for this stage, if any. */
  invoiceAmount: number | null
  /** What drives `amount`. Firm when `'invoice'`. */
  amountSource: StageAmountSource
  /** Set after resolving a model-vs-invoice disagreement. */
  conflictResolved?: 'invoice' | 'model' | null
  /** Certainty that stage/date is right. */
  confidence: StageConfidence
  /** Why we believe this confidence level. */
  confidenceReason: ConfidenceReason
}

export type PaymentModelStageDef = {
  name: string
  pct: number
}

/** Named payment plan — a model, not a fact. */
export type PaymentModel = {
  id: string
  name: string
  stages: PaymentModelStageDef[]
}

export type PaymentModelScope = 'this' | 'portfolio' | 'selected'

/** Shape of GET /projects/:id/delivery */
export type JobLifecycleStatus = 'in delivery' | 'complete'

export type JobOverviewInfo = {
  type: string
  sizeOfInstallation: string
  roofCovering: string
  usableRoofArea: string
  photoUrl: string
}

export type JobDeliveryDetail = {
  id: string
  programme: string
  solution: string
  property: string
  location: string
  customer: { name: string }
  supplier: { name: string }
  lifecycleStatus: JobLifecycleStatus
  overview: JobOverviewInfo
  /** Contracted job value — the firm anchor. */
  gmv: number
  /** Commission rate as percentage points (e.g. 6 = 6%). */
  commissionPct: number
  /** Derived £ — approximate until invoices firm stages. */
  commissionAmount: number
  /** Named payment model governing stage weights. */
  model: PaymentModel
  /** Invoiceable CTA £ for the current/next stage. */
  dueNow: number
  startDate: string
  currentStage: string
  daysInPhase: number
  stages: JobDeliveryStage[]
  /** Shared claim confirm state (PATCH /claims/:id) */
  confirmStatus: ClaimStatus
  confidence: 'high' | 'medium'
  daysStuck?: number
}
