export type ClaimStatus =
  | 'confirmable'
  | 'future'
  | 'not_started'
  | 'stuck'
  /** Stage confirmed — invoice ready to raise (not yet paid). */
  | 'confirmed'
  | 'settled'

export type ClaimStage = {
  name: string
  projectedDate: string
  done: boolean
}

export type DeliveryClaim = {
  id: string
  job: string
  currentStage: string
  stages: ClaimStage[]
  projectedDate: string
  amount: number
  status: ClaimStatus
  confidence: 'high' | 'medium'
  daysStuck?: number
}

export type SupplierDeliveryPayload = {
  supplier: { id: string; name: string }
  commissionRate: number
  claims: DeliveryClaim[]
}
