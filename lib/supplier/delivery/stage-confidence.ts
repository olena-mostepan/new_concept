import type {
  ConfidenceReason,
  JobDeliveryStage,
  StageConfidence,
} from './job-types'

const REASON_COPY: Record<ConfidenceReason, string> = {
  invoice: 'Backed by an invoice / actual',
  external: 'Corroborated by external data (tracker, WhatsApp, customer sheet)',
  similar: 'Inferred from similar projects',
  model: 'Payment-model assumption only',
}

export function confidenceReasonLabel(reason: ConfidenceReason): string {
  return REASON_COPY[reason]
}

/** Date is in the past and no invoice backs the stage. */
export function isStageOverdue(
  stage: JobDeliveryStage,
  now: Date = new Date(),
): boolean {
  if (stage.name === 'Complete') return false
  if (stage.status === 'paid') return false
  if (stage.invoiceAmount != null) return false
  if (stage.amountSource === 'invoice') return false

  const day = new Date(now)
  day.setHours(0, 0, 0, 0)
  const stageDay = new Date(`${stage.date}T12:00:00`)
  if (Number.isNaN(stageDay.getTime())) return false

  return (
    stageDay < day &&
    (stage.status === 'next' || stage.status === 'upcoming')
  )
}

/** Days from today to stage date (negative = past). */
export function daysUntilStage(
  stage: JobDeliveryStage,
  now: Date = new Date(),
): number {
  const day = new Date(now)
  day.setHours(0, 0, 0, 0)
  const stageDay = new Date(`${stage.date}T12:00:00`)
  return Math.round((stageDay.getTime() - day.getTime()) / 86_400_000)
}

/**
 * Far-future stages (>45 days) default to estimated even if tagged likely.
 * Invoice-backed stages stay confirmed.
 */
export function resolveStageConfidence(
  stage: JobDeliveryStage,
  now: Date = new Date(),
): { confidence: StageConfidence; reason: ConfidenceReason } {
  if (stage.amountSource === 'invoice' || stage.conflictResolved === 'invoice') {
    return { confidence: 'confirmed', reason: 'invoice' }
  }
  if (stage.invoiceAmount != null && stage.status === 'invoiced') {
    return { confidence: 'confirmed', reason: 'invoice' }
  }

  const baseConfidence = stage.confidence ?? 'estimated'
  const baseReason = stage.confidenceReason ?? 'model'
  const days = daysUntilStage(stage, now)

  if (baseConfidence !== 'confirmed' && days > 45) {
    return { confidence: 'estimated', reason: baseReason === 'model' ? 'model' : baseReason }
  }

  return { confidence: baseConfidence, reason: baseReason }
}

/** Accent Confirm only for low-confidence current stages (not overdue — those get their own prompt). */
export function shouldNudgeConfirm(
  stage: JobDeliveryStage,
  opts: { isCurrent: boolean; settled: boolean },
  now: Date = new Date(),
): boolean {
  if (!opts.isCurrent || opts.settled) return false
  if (isStageOverdue(stage, now)) return false
  const { confidence } = resolveStageConfidence(stage, now)
  return confidence === 'estimated'
}

export function isFarFutureStage(
  stage: JobDeliveryStage,
  now: Date = new Date(),
): boolean {
  if (stage.status === 'paid' || stage.status === 'invoiced') return false
  return daysUntilStage(stage, now) > 45
}
