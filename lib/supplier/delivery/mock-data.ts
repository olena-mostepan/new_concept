import type { DeliveryClaim, SupplierDeliveryPayload } from './types'
import {
  JOB_DELIVERY_BY_ID,
  LIST_JOB_IDS,
  jobToDeliveryClaim,
} from './job-mock-data'

/** Delivery list — derived from job detail so GMV × model % stays in sync. */
export const INITIAL_DELIVERY_CLAIMS: DeliveryClaim[] = LIST_JOB_IDS.map(
  (id) => jobToDeliveryClaim(JOB_DELIVERY_BY_ID[id]),
)

export const INITIAL_DELIVERY_PAYLOAD: SupplierDeliveryPayload = {
  supplier: { id: 'arin-power', name: 'Arin Power' },
  commissionRate: 0.06,
  claims: INITIAL_DELIVERY_CLAIMS,
}

export function formatGbp(amount: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function sumProjected(claims: DeliveryClaim[]): number {
  return claims
    .filter((c) => c.status !== 'settled')
    .reduce((sum, c) => sum + c.amount, 0)
}

export function commissionDue(
  claims: DeliveryClaim[],
  rate: number,
): number {
  return Math.round(sumProjected(claims) * rate)
}
