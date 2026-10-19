import type { ClaimStage, DeliveryClaim } from './types'

export type NextStage = { stage: string; projectedDate: string }

export function parseIso(iso: string): Date {
  return new Date(`${iso.slice(0, 10)}T12:00:00`)
}

export function toIso(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function toMonthValue(iso: string): string {
  return iso.slice(0, 7)
}

export function monthValueToIso(monthValue: string, day = 1): string {
  const [y, m] = monthValue.split('-').map(Number)
  return toIso(new Date(y!, m! - 1, day, 12))
}

export function formatShortDate(iso: string): string {
  return parseIso(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function getNextStages(claim: DeliveryClaim): NextStage[] {
  const idx = claim.stages.findIndex((s) => s.name === claim.currentStage)
  const start = idx >= 0 ? idx + 1 : 0
  return claim.stages.slice(start).map((s) => ({
    stage: s.name,
    projectedDate: s.projectedDate,
  }))
}

/** Stages from `stageName` inclusive through the end (for fixing a clicked stage date). */
export function getStagesFrom(
  claim: DeliveryClaim,
  stageName: string,
): NextStage[] {
  const idx = claim.stages.findIndex((s) => s.name === stageName)
  const start = idx >= 0 ? idx : 0
  return claim.stages.slice(start).map((s) => ({
    stage: s.name,
    projectedDate: s.projectedDate,
  }))
}

export function shiftStagesByDelta(
  stages: NextStage[],
  fromIso: string,
  toIsoDate: string,
): Array<NextStage & { newDate: string }> {
  const deltaMs = parseIso(toIsoDate).getTime() - parseIso(fromIso).getTime()
  return stages.map((s) => {
    const next = new Date(parseIso(s.projectedDate).getTime() + deltaMs)
    return { ...s, newDate: toIso(next) }
  })
}

export function applyStageShift(
  stages: ClaimStage[],
  shifted: Array<{ stage: string; newDate: string }>,
): ClaimStage[] {
  const map = new Map(shifted.map((s) => [s.stage, s.newDate]))
  return stages.map((s) =>
    map.has(s.name) ? { ...s, projectedDate: map.get(s.name)! } : s,
  )
}

export function markStagesCompleteThrough(
  stages: ClaimStage[],
  stageName: string,
  date: string,
): ClaimStage[] {
  const idx = stages.findIndex((s) => s.name === stageName)
  return stages.map((s, i) => {
    if (i < idx) return { ...s, done: true }
    if (i === idx) return { ...s, done: true, projectedDate: date }
    return s
  })
}

export function claimSubtitle(claim: DeliveryClaim): string {
  return `${claim.job} · ${claim.currentStage}`
}
