export type CustomerPhaseId =
  | 'start'
  | 'phase1'
  | 'phase2'
  | 'phase3'
  | 'phase4'
  | 'complete'

export type PhaseNodeStatus = 'done' | 'current' | 'upcoming'

export type DateConfirmState = 'confirmed' | 'needs_confirm' | 'estimate' | 'from_invoice'

export type ProjectInsightStatus =
  | 'on_track'
  | 'overdue'
  | 'complete'
  | 'awaiting_start'

export type CustomerPhaseNode = {
  id: CustomerPhaseId
  label: string
  shortLabel: string
  date: string | null
  status: PhaseNodeStatus
  daysInPhase?: number
  overdue?: boolean
}

export type CustomerKeyDates = {
  start: { date: string | null; state: DateConfirmState }
  expectedCompletion: { date: string | null; state: DateConfirmState }
  lastStageChange: { date: string | null; state: DateConfirmState }
}

export type CustomerProjectDetail = {
  label: string
  value: string
}

export type CustomerProjectOverview = {
  type: string
  sizeOfInstallation: string
  property: string
  contractValue: string
  photoUrl: string
  details?: CustomerProjectDetail[]
}

export type CustomerProject = {
  id: string
  name: string
  batchId: string
  solution: string
  location: string
  supplier: string
  startDate: string | null
  startConfirmed: boolean
  valueLabel: string
  overview: CustomerProjectOverview
  phases: CustomerPhaseNode[]
  currentPhaseId: CustomerPhaseId
  insight: ProjectInsightStatus
  insightLabel: string
  needsConfirm: boolean
  confirmBanner?: {
    phaseLabel: string
    nextAround: string
  }
  keyDates: CustomerKeyDates
  note?: string
}

export type CustomerBatch = {
  id: string
  name: string
  locationSummary: string
  projectCount: number
  valueLabel: string
  toConfirmCount: number
  projectIds: string[]
}

export type CustomerDeliveryPayload = {
  customer: { id: string; name: string }
  batches: CustomerBatch[]
  projects: CustomerProject[]
  datesNeedingConfirm: number
}
