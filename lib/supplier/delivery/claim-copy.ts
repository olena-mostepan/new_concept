import type { DeliveryClaim } from './types'
import { formatGbp } from './mock-data'

function formatShortDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00`)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

export function claimNarrative(claim: DeliveryClaim): {
  claimLine: string
  moneyLine: string
} {
  const amount = formatGbp(claim.amount)
  const date = formatShortDate(claim.projectedDate)
  const stage = claim.currentStage

  switch (claim.status) {
    case 'confirmable':
      return {
        claimLine: `Passed '${stage}' on ${date}.`,
        moneyLine: `Invoice ${amount} now`,
      }
    case 'confirmed':
      return {
        claimLine: `'${stage}' confirmed · ${date}.`,
        moneyLine: `${amount} paid`,
      }
    case 'future':
      return {
        claimLine: `${stage} around ${date}.`,
        moneyLine: `${amount} due then`,
      }
    case 'not_started':
      return {
        claimLine: `'${stage}' not started — projected ${date}.`,
        moneyLine: `${amount} scheduled`,
      }
    case 'stuck':
      return {
        claimLine: `No movement in ${claim.daysStuck ?? 30} days.`,
        moneyLine: `${amount} on hold`,
      }
    case 'settled':
      return {
        claimLine: `Handover confirmed.`,
        moneyLine: `${amount} paid`,
      }
  }
}

/** Apply Looks-right confirm → invoice-ready state (not paid). */
export function confirmClaimPatch(claim: DeliveryClaim): Partial<DeliveryClaim> {
  return {
    status: 'confirmed',
    stages: claim.stages.map((s) =>
      s.name === claim.currentStage || s.done
        ? { ...s, done: true }
        : s,
    ),
  }
}

export function needsAttention(claim: DeliveryClaim): boolean {
  return claim.status === 'confirmable' || claim.status === 'stuck'
}

/** Unconfirmed jobs that can drive the cash-picture figure. */
export function isReviewCandidate(claim: DeliveryClaim): boolean {
  return (
    claim.status !== 'settled' && claim.status !== 'confirmed'
  )
}

function confidenceRank(claim: DeliveryClaim): number {
  return claim.confidence === 'medium' ? 0 : 1
}

/** Lowest confidence first, then attention items, then the rest. */
export function buildReviewQueue(claims: DeliveryClaim[]): DeliveryClaim[] {
  return claims
    .filter(isReviewCandidate)
    .slice()
    .sort((a, b) => {
      const byConfidence = confidenceRank(a) - confidenceRank(b)
      if (byConfidence !== 0) return byConfidence
      return Number(needsAttention(b)) - Number(needsAttention(a))
    })
}

/** True when every open claim is already high-confidence. */
export function isAllHighConfidence(claims: DeliveryClaim[]): boolean {
  const open = claims.filter(isReviewCandidate)
  return open.length > 0 && open.every((c) => c.confidence === 'high')
}
