import type { CustomerDeliveryPayload, CustomerPhaseId, CustomerPhaseNode, CustomerProject, DateConfirmState } from '@/lib/customer/delivery/types'
import {
  TODAY,
  type Account,
  type DeliveryDateState,
  type DeliveryPhaseId,
  type ProjectRow,
  type Workstream,
} from '@/lib/concept/model'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export const DELIVERY_PHASES: Array<{ id: DeliveryPhaseId; label: string; shortLabel: string; step: number }> = [
  { id: 'start', label: 'Kick-off', shortLabel: 'Kick-off', step: 0 },
  { id: 'phase1', label: 'Design & survey', shortLabel: 'Design & survey', step: 1 },
  { id: 'phase2', label: 'Installation', shortLabel: 'Installation', step: 2 },
  { id: 'phase3', label: 'Commissioning', shortLabel: 'Commissioning', step: 3 },
  { id: 'phase4', label: 'Handover', shortLabel: 'Handover', step: 4 },
  { id: 'complete', label: 'Complete', shortLabel: 'Complete', step: 5 },
]

const CONFIRM_EVENT: Partial<Record<DeliveryPhaseId, string>> = {
  phase2: 'Installation start confirmed',
  complete: 'Completion confirmed',
}

export function conceptDateToIso(d: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d
  const [day, mon, year] = d.split(' ')
  const month = MONTHS.indexOf(mon)
  return `${year ?? '2026'}-${String(month + 1).padStart(2, '0')}-${String(Number(day)).padStart(2, '0')}`
}

export function isoToConcept(iso: string): string {
  const [year, month, day] = iso.slice(0, 10).split('-').map(Number)
  return `${day} ${MONTHS[(month ?? 1) - 1]} ${year}`
}

export function phaseOf(step: number): DeliveryPhaseId {
  return DELIVERY_PHASES.find((phase) => phase.step === step)?.id ?? 'start'
}

export function stepOf(id: CustomerPhaseId): number {
  return DELIVERY_PHASES.find((phase) => phase.id === id)?.step ?? 0
}

function stateOf(state?: DeliveryDateState): DateConfirmState {
  if (state === 'from_invoice' || state === 'estimate' || state === 'needs_confirm') return state
  return 'confirmed'
}

/** Keep the date that was on screen when "Yes — looks right" stamps today. */
export function keepShownDate(before: CustomerProject, after: CustomerProject): CustomerProject {
  if (before.needsConfirm === after.needsConfirm) return after
  const shown = before.phases.find((phase) => phase.id === before.currentPhaseId)?.date
  if (!shown) return after
  return {
    ...after,
    phases: after.phases.map((phase) => (phase.id === before.currentPhaseId ? { ...phase, date: shown } : phase)),
    keyDates: {
      ...after.keyDates,
      lastStageChange: { date: shown, state: 'confirmed' },
    },
  }
}

export function toCustomerProject(account: Account, w: Workstream, row: ProjectRow): CustomerProject {
  const building = account.buildings.find((item) => item.id === row.buildingId)
  const info = row.delivery
  const current = phaseOf(row.step)
  const finished = w.owner === 'done' || row.step === 5
  const awaiting = row.step === 0 && !info?.phases.start?.on
  const overdue = Boolean(info?.overdueDue) && !finished
  const phases: CustomerPhaseNode[] = DELIVERY_PHASES.map((phase) => {
    const stored = info?.phases[phase.id]
    const status: CustomerPhaseNode['status'] = finished ? 'done' : phase.step < row.step ? 'done' : phase.step === row.step ? 'current' : 'upcoming'
    return {
      id: phase.id,
      label: phase.label,
      shortLabel: phase.shortLabel,
      date: stored?.on ? conceptDateToIso(stored.on) : null,
      status,
      overdue: status === 'current' && overdue,
    }
  })
  const confirmOn = info?.confirmPhase ? info.phases[info.confirmPhase]?.on : undefined
  const insight = finished ? 'complete' : overdue ? 'overdue' : awaiting ? 'awaiting_start' : 'on_track'
  const insightLabel = insight === 'complete' ? 'Complete' : insight === 'overdue' ? 'Overdue' : insight === 'awaiting_start' ? 'Awaiting start' : 'On track'
  const start = info?.phases.start
  const expected = info?.expectedCompletion
  const last = confirmOn
    ? { on: confirmOn, state: 'from_invoice' as const }
    : [...DELIVERY_PHASES].reverse().map((phase) => info?.phases[phase.id]).find((phase) => phase?.on)
  const value = info?.value ? `€${info.value}k` : '—'
  return {
    id: `${w.id}:${row.buildingId}`,
    name: building?.name ?? row.buildingId,
    batchId: w.id,
    solution: w.solution === 'ev' ? 'EV charging' : w.solution,
    location: building?.city ?? '',
    supplier: w.supplier ?? '',
    startDate: start?.on ? conceptDateToIso(start.on) : null,
    startConfirmed: awaiting ? true : Boolean(start?.on),
    valueLabel: value,
    overview: {
      type: w.solution === 'ev' ? 'EV charging' : w.solution,
      sizeOfInstallation: '',
      property: building?.name ?? '',
      contractValue: value,
      photoUrl: '',
    },
    phases,
    currentPhaseId: finished ? 'complete' : current,
    insight,
    insightLabel,
    needsConfirm: Boolean(info?.confirmPhase),
    confirmBanner: info?.confirmPhase && confirmOn
      ? {
          phaseLabel: `${info.confirmPhase === 'complete' ? 'Completed' : 'Started'} ${confirmOn.split(' ').slice(0, 2).join(' ')}`,
          nextAround: 'from invoice',
        }
      : undefined,
    keyDates: {
      start: { date: start?.on ? conceptDateToIso(start.on) : null, state: stateOf(start?.state) },
      expectedCompletion: { date: expected?.on ? conceptDateToIso(expected.on) : null, state: expected?.state ?? 'estimate' },
      lastStageChange: { date: last?.on ? conceptDateToIso(last.on) : null, state: last?.state ?? 'confirmed' },
    },
  }
}

export function writeDelivery(row: ProjectRow, next: CustomerProject): { event: string } | null {
  const prev = row.delivery
  const phases = { ...prev?.phases }
  for (const phase of next.phases) {
    const id = phase.id as DeliveryPhaseId
    const old = phases[id]
    phases[id] = {
      on: phase.date ? isoToConcept(phase.date) : old?.on,
      state: prev?.confirmPhase === id && !next.needsConfirm ? 'confirmed' : old?.state,
    }
  }
  const expected = next.keyDates.expectedCompletion
  row.delivery = {
    ...prev,
    phases,
    confirmPhase: next.needsConfirm ? prev?.confirmPhase : undefined,
    expectedCompletion: expected.date
      ? { on: isoToConcept(expected.date), state: expected.state === 'confirmed' ? 'confirmed' : prev?.expectedCompletion?.state ?? 'estimate' }
      : prev?.expectedCompletion,
  }
  row.step = stepOf(next.currentPhaseId)
  if (!prev?.confirmPhase || next.needsConfirm) return null
  return { event: CONFIRM_EVENT[prev.confirmPhase] ?? 'Date confirmed' }
}

export function deliveryProjectId(workstreamId: string, buildingId: string) {
  return `${workstreamId}:${buildingId}`
}

export function splitDeliveryId(id: string): { workstreamId: string; buildingId: string } | null {
  const split = id.indexOf(':')
  if (split < 0) return null
  return { workstreamId: id.slice(0, split), buildingId: id.slice(split + 1) }
}

export const HISTORY_TODAY = TODAY.split(' ').slice(0, 2).join(' ')

function deliveryRank(project: CustomerProject) {
  if (project.needsConfirm) return 0
  if (project.insight === 'complete') return 1
  if (project.insight === 'awaiting_start') return 3
  return 2
}

export function toDeliveryPayload(account: Account, streams: Workstream[]): CustomerDeliveryPayload {
  const projects = streams.flatMap((stream) =>
    stream.projects
      .map((row) => toCustomerProject(account, stream, row))
      .sort((a, b) => deliveryRank(a) - deliveryRank(b)),
  )
  const batches = streams.map((stream) => {
    const mine = projects.filter((project) => project.batchId === stream.id)
    const value = stream.deliveryProfile?.contractValue
    return {
      id: stream.id,
      name: stream.name,
      locationSummary: account.batches.find((batch) => batch.id === stream.batchId)?.name ?? '',
      projectCount: mine.length,
      valueLabel: value ? `€${value}k` : '—',
      toConfirmCount: mine.filter((project) => project.needsConfirm).length,
      projectIds: mine.map((project) => project.id),
    }
  })
  return {
    customer: { id: account.id, name: account.customer },
    batches,
    projects,
    datesNeedingConfirm: projects.filter((project) => project.needsConfirm).length,
  }
}
