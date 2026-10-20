import { OWNER_LABEL, SERVICES, TODAY, service, type Account, type Batch, type Need, type Owner, type ProjectRow, type ServiceId, type SolutionId, type Visit, type Workstream } from './model'

/** Customers only see batches once a plan has been shared with them */
export const customerBatches = (a: Account) => a.batches.filter((b) => b.planState !== 'draft')

export const getBatch = (a: Account, id: string) => a.batches.find((b) => b.id === id)
export const getWorkstream = (a: Account, id: string) => a.workstreams.find((w) => w.id === id)
export const getBuilding = (a: Account, id: string) => a.buildings.find((b) => b.id === id)!
export const wsIn = (a: Account, batchId: string) => a.workstreams.filter((w) => w.batchId === batchId)
export const batchesFor = (a: Account, buildingId: string) => a.batches.filter((b) => b.buildingIds.includes(buildingId))

export const isLive = (w: Workstream) => w.owner !== 'done' && !w.proposed

/** Projects done with this workstream's service (last step), dropped ones excluded */
export const doneCount = (w: Workstream) => {
  if (w.owner === 'done') return w.projects.filter((p) => !p.dropped).length
  const last = service(w.service).steps.length - 1
  return w.projects.filter((p) => p.step === last && !p.dropped).length
}
export const activeProjects = (w: Workstream) => w.projects.filter((p) => !p.dropped)

/** Distinct projects (building × solution) in a batch */
export const projectCount = (a: Account, b: Batch) =>
  new Set(wsIn(a, b.id).flatMap((w) => w.projects.map((p) => `${p.buildingId}:${w.solution}`))).size

export const openNeeds = (w: Workstream) => w.needs.filter((n) => !n.received)
export const yourNeeds = (w: Workstream) => openNeeds(w).filter((n) => n.owner === 'you')

export function batchOwner(a: Account, b: Batch): Owner {
  if (b.planState === 'proposed') return 'you'
  const ws = wsIn(a, b.id)
  for (const o of ['you', 'cquel', 'suppliers'] as Owner[]) if (ws.some((w) => w.owner === o)) return o
  return 'done'
}

export const isBatchDone = (a: Account, b: Batch) => b.planState === 'live' && wsIn(a, b.id).every((w) => w.owner === 'done')

/** Per route service: live/done workstreams and project counts. Used by the workstream page route. */
export type ServiceSlot = { service: ServiceId; inRoute: boolean; state: 'done' | 'now' | 'planned' | 'skip'; done: number; total: number; ws: Workstream[] }

export function batchSlots(a: Account, b: Batch): ServiceSlot[] {
  return SERVICES.map((s) => {
    const inRoute = b.route.includes(s.id)
    const ws = wsIn(a, b.id).filter((w) => w.service === s.id)
    const real = ws.filter((w) => !w.proposed)
    const total = real.reduce((n, w) => n + activeProjects(w).length, 0)
    const done = real.reduce((n, w) => n + doneCount(w), 0)
    let state: ServiceSlot['state'] = 'planned'
    if (!inRoute) state = 'skip'
    else if (real.length && real.every((w) => w.owner === 'done')) state = 'done'
    else if (real.length) state = 'now'
    return { service: s.id, inRoute, state, done, total, ws }
  })
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const parse = (d: string) => {
  const [day, mon, year] = d.split(' ')
  return new Date(year ? Number(year) : 2026, MONTHS.indexOf(mon), Number(day)).getTime()
}
/** Days from a past date to today */
export const days = (d: string) => Math.round((parse(TODAY) - parse(d)) / 86400000)
/** "14 Oct 2026" → "14 Oct" */
export const short = (d?: string) => (d ? d.split(' ').slice(0, 2).join(' ') : '')

const noun = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`

/** Next line for a live workstream. Days and building counts come from the data. */
export function nextLine(w: Workstream): string {
  if (w.owner === 'done') return ''
  if (w.service === 'delivery') {
    const line = deliveryNextLine(w)
    if (line) return line
  }
  const n = w.next
  if (!n) return w.now
  if (n.kind === 'roof') {
    return `Roof drawings for ${activeProjects(w).length} buildings — asked ${short(n.since)} · waiting ${days(n.since)} days`
  }
  if (n.kind === 'decision') {
    const step = service(w.service).steps.indexOf('Presented')
    const count = w.projects.filter((p) => p.step === step && !p.dropped).length
    return `Go or no-go on ${count} estimates — presented ${short(n.since)} · waiting ${days(n.since)} days`
  }
  if (n.kind === 'offers') {
    const left = n.invited - n.in
    return `${n.in} of ${n.invited} offers in — last ${left} chased ${short(n.chased)}`
  }
  if (n.kind === 'price') return `Price from ${n.from} — Requested ${short(n.since)} · waiting ${days(n.since)} days`
  if (n.kind === 'installing') {
    const detail = n.detail ?? (w.activity?.length ? `started ${short([...w.activity].sort((a, b) => parse(b.date) - parse(a.date))[0].date)}` : '')
    return detail ? `Installing at ${n.place} — ${detail}` : `Installing at ${n.place}`
  }
  if (n.kind === 'gas') {
    return `Gas bills for ${activeProjects(w).length} buildings — asked ${short(n.since)} · waiting ${days(n.since)} days`
  }
  if (n.kind === 'carpark') {
    return `Car park ownership for ${activeProjects(w).length} buildings — asked ${short(n.since)} · waiting ${days(n.since)} days`
  }
  if (n.kind === 'agree') {
    const count = w.projects.filter((p) => p.decision === 'waiting').length || activeProjects(w).length
    return `Agree scope for ${count} projects — sent ${short(n.since)} · waiting ${days(n.since)} days`
  }
  if (n.kind === 'writing') {
    const visits = recordedVisits(w)
    const done = visits.filter((v) => v.state === 'done').length
    const latest = visits.filter((v) => v.state === 'done' && v.on).sort((a, b) => parse(b.on!) - parse(a.on!))[0]
    return `Scope written after the last survey — ${done} of ${visits.length} surveys done${latest?.on ? `, ${short(latest.on)}` : ''}`
  }
  if (n.kind === 'choose') return `Choose a supplier — results sent ${short(n.since)} · waiting ${days(n.since)} days`
  if (n.kind === 'brief') return `Agree the brief — sent ${short(n.since)} · waiting ${days(n.since)} days`
  if (n.kind === 'shortlist') return `Shortlisting suppliers — brief agreed ${short(n.on)}`
  if (n.kind === 'agreePrice') return `Agree the price — Analysis sent ${short(n.since)} · waiting ${days(n.since)} days`
  if (n.kind === 'sign') return `Sign the contract — Sent ${short(n.since)} · waiting ${days(n.since)} days`
  if (n.kind === 'overdue') return `${n.place} overdue — Installation due ${short(n.due)} · ${days(n.due)} days late`
  if (n.kind === 'design') return `Design for ${n.n} sites — Site checks done ${short(n.on)}`
  const ready = w.projects.filter((p) => p.ready).length
  const readyOn = w.needs.find((need) => need.since)?.since
  return readyOn
    ? `Estimates as building data lands — ${ready} more ready ${short(readyOn)} · ${ready} of ${w.projects.length}`
    : `Estimates as building data lands — ${ready} of ${w.projects.length} ready`
}

/** Latest dated event on the workstream. Not stored; read from the record. */
export function lastChangedOn(w: Workstream): string {
  const found: string[] = []
  const add = (d?: string) => {
    if (d) found.push(d)
  }
  add(w.startedOn)
  add(w.completedOn)
  for (const item of w.activity ?? []) add(item.date)
  for (const need of w.needs) {
    add(need.since)
    add(need.received)
  }
  for (const project of w.projects) {
    add(project.visit?.on)
    add(project.presentedOn)
    add(project.decidedOn)
  }
  if (!found.length) return ''
  return found.reduce((best, d) => (parse(d) > parse(best) ? d : best))
}

/** Within 7 days of today, counting today. Done workstreams never qualify. */
export function changedRecently(w: Workstream): boolean {
  if (w.owner === 'done') return false
  const on = lastChangedOn(w)
  if (!on) return false
  const age = days(on)
  return age >= 0 && age <= 7
}

/** Dots first, newest change first; then the rest, longest sitting first. Ties keep the current order. */
export function byRecentChange(list: Workstream[]): Workstream[] {
  const current = [...list].sort((a, b) => Number(b.owner === 'you') - Number(a.owner === 'you'))
  return current.sort((a, b) => {
    const ar = changedRecently(a)
    const br = changedRecently(b)
    if (ar !== br) return ar ? -1 : 1
    const ad = days(lastChangedOn(a))
    const bd = days(lastChangedOn(b))
    if (ad !== bd) return ar ? ad - bd : bd - ad
    return 0
  })
}

/** Split a next line into the main clause and the detail after " — ". */
export function nextParts(w: Workstream): { main: string; detail: string } {
  if (w.owner === 'done') return { main: w.outcome || '—', detail: '' }
  const line = nextLine(w)
  const split = line.indexOf(' — ')
  if (split === -1) return { main: line || '—', detail: '' }
  return { main: line.slice(0, split), detail: line.slice(split + 3) }
}

/** Projects finished with this service, over every project in the workstream. */
export function buildingProgress(w: Workstream) {
  const last = service(w.service).steps.length - 1
  const done = w.owner === 'done' ? w.projects.length : w.projects.filter((p) => p.step === last).length
  return { done, total: w.projects.length }
}

/** Portfolio pipeline: live workstreams per service, plus done workstreams. */
export function pipeline(a: Account) {
  const shared = a.workstreams.filter((w) => !w.proposed)
  const segments = [
    ...SERVICES.map((s) => ({
      id: s.id,
      label: s.label,
      n: shared.filter((w) => w.service === s.id && w.owner !== 'done').length,
    })),
    { id: 'done', label: 'Done', n: shared.filter((w) => w.owner === 'done').length },
  ].filter((s) => s.n > 0)
  return { segments, total: shared.length, batches: customerBatches(a).length }
}

export function rightNow(a: Account) {
  const visible = a.workstreams.filter((w) => !w.proposed && customerBatches(a).some((b) => b.id === w.batchId))
  return {
    you: visible.filter((w) => w.owner === 'you'),
    progress: visible.filter((w) => w.owner === 'cquel' || w.owner === 'suppliers'),
    done: visible.filter((w) => w.owner === 'done'),
  }
}

export function waitingCounts(a: Account) {
  const g = rightNow(a)
  return {
    you: g.you.length,
    cquel: g.progress.filter((w) => w.owner === 'cquel').length,
    suppliers: g.progress.filter((w) => w.owner === 'suppliers').length,
  }
}

export type BatchCell =
  | { service: ServiceId; kind: 'skip' }
  | { service: ServiceId; kind: 'planned' }
  | { service: ServiceId; kind: 'live'; total: number; done: number; you: number }

export function batchCells(a: Account, b: Batch): BatchCell[] {
  return SERVICES.map((s) => {
    if (!b.route.includes(s.id)) return { service: s.id, kind: 'skip' }
    const ws = wsIn(a, b.id).filter((w) => w.service === s.id && !w.proposed)
    if (!ws.length) return { service: s.id, kind: 'planned' }
    return {
      service: s.id,
      kind: 'live',
      total: ws.length,
      done: ws.filter((w) => w.owner === 'done').length,
      you: ws.filter((w) => w.owner === 'you').length,
    }
  })
}

export function batchSummary(a: Account, b: Batch) {
  const n = wsIn(a, b.id).filter((w) => !w.proposed).length
  const bits = [noun(n, 'workstream', 'workstreams')]
  if (b.target) bits.push(`by ${b.target}`)
  return { goal: b.goal, meta: bits.join(' · '), line: [b.goal, ...bits].join(' · ') }
}

export type StageState = 'done' | 'now' | 'next' | 'planned' | 'skip'

export interface RouteStage {
  id: string
  label: string
  state: StageState
  caption: string
}

export interface PanelItem {
  tone: 'you' | 'other' | 'done'
  text: string
  sub?: string
  action?: 'agree' | 'estimates' | 'scope'
}

export interface RoutePanel {
  stageId: string
  heading: string
  solid: boolean
  span: number
  items: PanelItem[]
  email?: string
}

function latestDone(ws: Workstream[]) {
  return ws
    .map((w) => w.completedOn)
    .filter((d): d is string => Boolean(d))
    .sort((x, y) => parse(x) - parse(y))
    .at(-1)
}

export function routeStages(a: Account, b: Batch): RouteStage[] {
  const kickoff = b.planState !== 'live'
  const start: RouteStage = {
    id: 'start',
    label: 'Getting started',
    state: kickoff ? 'now' : 'done',
    caption: kickoff ? 'Now · plan ready' : `Agreed ${short(b.planAgreed)}`,
  }
  let nextAssigned = false
  const services: RouteStage[] = SERVICES.map((s) => {
    if (!b.route.includes(s.id)) {
      const label = s.id === 'tender' || s.id === 'pricing' ? `or ${s.label}` : s.label
      return { id: s.id, label, state: 'skip', caption: 'Not needed' }
    }
    const ws = wsIn(a, b.id).filter((w) => w.service === s.id && !w.proposed)
    if (kickoff || !ws.length) {
      const state: StageState = nextAssigned ? 'planned' : 'next'
      nextAssigned = true
      return { id: s.id, label: s.label, state, caption: state === 'next' ? 'Next' : 'Planned' }
    }
    const doneWs = ws.filter((w) => w.owner === 'done')
    if (doneWs.length === ws.length) {
      return { id: s.id, label: s.label, state: 'done', caption: `Done ${short(latestDone(ws))}` }
    }
    const caption = doneWs.length
      ? `${noun(ws.length, 'workstream', 'workstreams')} · ${doneWs.length} done`
      : noun(ws.length, 'workstream', 'workstreams')
    return { id: s.id, label: s.label, state: 'now', caption }
  })
  return [start, ...services]
}

function pilotPanels(a: Account, b: Batch): RoutePanel[] {
  const panels: RoutePanel[] = []
  if (b.planState !== 'live') {
    panels.push({
      stageId: 'start',
      heading: 'To start',
      solid: true,
      span: 1,
      items: [
        { tone: 'done', text: `Files received ${short(b.filesReceived)}` },
        { tone: 'done', text: `Plan proposed ${short(b.planProposed)}` },
        { tone: 'you', text: 'You agree the plan', action: 'agree' },
      ],
    })
  }
  const open = wsIn(a, b.id).flatMap((w) => openNeeds(w))
  const first = b.lead?.split(' ')[0]
  panels.push({
    stageId: 'indicative',
      heading: 'Indicative pricing needs',
    solid: b.planState === 'live',
      span: 1,
    items: [
      ...open.map((n) => ({ tone: 'you' as const, text: n.label, sub: n.why })),
      { tone: 'done' as const, text: b.filesSummary ?? 'Files received', sub: `Received ${short(b.filesReceived)}` },
    ],
    email: first ? `Reply to ${first}` : undefined,
  })
  return panels
}

function panelItems(w: Workstream): PanelItem[] {
  const n = w.next
  if (n?.kind === 'decision') {
    const step = service(w.service).steps.indexOf('Presented')
    const count = w.projects.filter((p) => p.step === step && !p.dropped).length
    return [{ tone: 'you', text: `Go or no-go on ${count} ${w.name} estimates (Presented ${short(n.since)})`, action: 'estimates' }]
  }
  if (n?.kind === 'roof') {
    const survey = w.needs.find((need) => need.owner !== 'you' && !need.received)
    return [
      { tone: 'you', text: `Roof drawings — ${activeProjects(w).length} buildings (Asked ${short(n.since)})` },
      ...(survey ? [{ tone: 'other' as const, text: `${survey.label} (${survey.why})` }] : []),
    ]
  }
  if (n?.kind === 'offers') {
    const left = n.invited - n.in
    return [{ tone: 'other', text: `Offers from ${left} suppliers (${n.in} of ${n.invited} in)` }]
  }
  if (n?.kind === 'price') {
    return [{ tone: 'other', text: `Price from ${n.from} (Asked ${short(n.since)})` }]
  }
  if (n?.kind === 'agreePrice') {
    return [{ tone: 'you', text: `Agree the price — ${w.name} (Sent ${short(n.since)})`, action: 'scope' }]
  }
  if (n?.kind === 'sign') {
    return [{ tone: 'you', text: `Sign the contract — ${w.name} (Sent ${short(n.since)})`, action: 'scope' }]
  }
  if (n?.kind === 'overdue') {
    return [{ tone: 'other', text: `${n.place} overdue — due ${short(n.due)} · ${days(n.due)} days late` }]
  }
  if (n?.kind === 'design') {
    return [{ tone: 'other', text: `Design for ${n.n} sites (Site checks ${short(n.on)})` }]
  }
  if (n?.kind === 'installing') {
    return [{ tone: 'done', text: `Nothing from you (${nextLine(w)})` }]
  }
  if (n?.kind === 'landing') {
    return [{ tone: 'other', text: nextLine(w) }]
  }
  if (n?.kind === 'gas') {
    return [{ tone: 'you', text: `Gas bills for ${activeProjects(w).length} buildings (Asked ${short(n.since)})` }]
  }
  if (n?.kind === 'carpark') {
    return [{ tone: 'you', text: `Car park ownership — ${activeProjects(w).length} buildings (Asked ${short(n.since)})` }]
  }
  if (n?.kind === 'agree') {
    const count = w.projects.filter((p) => p.decision === 'waiting').length || activeProjects(w).length
    return [{ tone: 'you', text: `Agree scope for ${count} projects (Sent ${short(n.since)})`, action: 'scope' }]
  }
  if (n?.kind === 'writing') {
    return [{ tone: 'other', text: nextLine(w) }]
  }
  if (n?.kind === 'choose') {
    return [{ tone: 'you', text: `Choose a supplier — ${w.name} (Results sent ${short(n.since)})`, action: 'scope' }]
  }
  if (n?.kind === 'brief') {
    return [{ tone: 'you', text: `Agree the brief — ${w.name} (Sent ${short(n.since)})`, action: 'scope' }]
  }
  if (n?.kind === 'shortlist') {
    return [{ tone: 'other', text: `Supplier shortlist — ${w.name} (CQuel)` }]
  }
  return openNeeds(w).map((need) => ({
    tone: need.owner === 'you' ? ('you' as const) : ('other' as const),
    text: need.since ? `${need.label} (Asked ${short(need.since)})` : need.why ? `${need.label} (${need.why})` : need.label,
  }))
}

function maturePanels(a: Account, b: Batch): RoutePanel[] {
  const panels: RoutePanel[] = []
  for (const s of SERVICES) {
    if (!b.route.includes(s.id)) continue
    const live = wsIn(a, b.id).filter((w) => w.service === s.id && w.owner !== 'done' && (!w.proposed || b.planState === 'proposed' || b.planState === 'agreed'))
    const items = live.flatMap(panelItems)
    if (!items.length) continue
    panels.push({
      stageId: s.id,
      heading: 'Needs',
      solid: true,
      span: 1,
      items,
      email: items.some((i) => i.tone === 'you' && !i.action) ? 'Reply by email' : undefined,
    })
  }
  return panels
}

export function routePanels(a: Account, b: Batch): RoutePanel[] {
  return b.filesSummary ? pilotPanels(a, b) : maturePanels(a, b)
}

export function routeAside(a: Account, b: Batch, variant: 'dashboard' | 'page') {
  if (variant === 'dashboard') {
    const n = wsIn(a, b.id).length
    return `${b.buildingIds.length} buildings · ${noun(n, 'workstream', 'workstreams')}${b.lead ? ` · Lead ${b.lead}` : ''}`
  }
  const live = wsIn(a, b.id).filter(isLive)
  const parts = (['you', 'cquel', 'suppliers'] as Owner[])
    .map((o) => ({ o, n: live.filter((w) => w.owner === o).length }))
    .filter((x) => x.n > 0)
    .map((x) => `${OWNER_LABEL[x.o]}: ${x.n}`)
  return parts.join(' · ')
}

export function workstreamBlockMeta(a: Account, b: Batch) {
  if (b.planState === 'proposed') return `Proposed ${short(b.planProposed)}`
  const ws = wsIn(a, b.id).filter((w) => !w.proposed)
  const done = ws.filter((w) => w.owner === 'done').length
  return `${noun(ws.length - done, 'in progress', 'in progress')} · ${noun(done, 'done', 'done')}`.replace('1 in progress', '1 in progress')
}

export function stepMarks(w: Workstream, notStarted: boolean) {
  const steps = service(w.service).steps
  if (notStarted) {
    const count = activeProjects(w).length
    return steps.map((label, i) => ({ label, state: 'upcoming' as const, count: i === 0 ? count : 0, showCount: i === 0 }))
  }
  return steps.map((label, i) => {
    const count = w.projects.filter((p) => p.step === i).length
    const sitting = count > 0
    const allPast = w.projects.every((p) => p.step > i)
    const state = sitting ? ('now' as const) : allPast ? ('passed' as const) : ('upcoming' as const)
    return { label, state, count, showCount: sitting }
  })
}

export function buildingNames(a: Account, w: Workstream) {
  const names = w.projects.filter((p) => !p.dropped).map((p) => getBuilding(a, p.buildingId).name)
  return { shown: names.slice(0, 4), extra: Math.max(0, names.length - 4) }
}

export function doneFold(ws: Workstream[]) {
  const done = ws.filter((w) => w.owner === 'done')
  const indicative = done.filter((w) => w.service === 'indicative').sort((a, b) => parse(b.completedOn || '') - parse(a.completedOn || ''))
  const rest = done.filter((w) => w.service !== 'indicative').sort((a, b) => parse(b.completedOn || '') - parse(a.completedOn || ''))
  return [...indicative, ...rest]
    .map((w) => {
      const when = short(w.completedOn)
      const tail = w.outcome ? `${w.outcome} ${when}` : when
      return `${w.name} — ${service(w.service).label}, ${tail}`
    })
    .join(' | ')
}

export function batchActivity(a: Account, b: Batch) {
  return a.activity.filter((item) => item.batchId === b.id)
}

export function money(range: [number, number]): string {
  if (range[0] >= 1000 || range[1] >= 1000) {
    const fmt = (n: number) => (n / 1000).toFixed(1).replace(/\.0$/, '')
    return `€${fmt(range[0])}–${fmt(range[1])}m`
  }
  return `€${range[0]}–${range[1]}k`
}

export function paybackLabel(years: ProjectRow['paybackYears']): string {
  if (years === 'over12') return 'Over 12 years'
  if (typeof years === 'number') return years === 1 ? '1 year' : `${years} years`
  return '—'
}

export function presentedTotal(w: Workstream): { text: string; count: number } {
  const rows = w.projects.filter((p) => p.estimate)
  if (!rows.length) return { text: '—', count: 0 }
  const lo = rows.reduce((s, p) => s + p.estimate![0], 0)
  const hi = rows.reduce((s, p) => s + p.estimate![1], 0)
  return { text: money([lo, hi]), count: rows.length }
}

export function decisionLabel(p: ProjectRow): string {
  if (!p.decision || p.decision === 'waiting') return '—'
  if (p.decision === 'no' && p.paybackYears === 'over12') return 'Not proceeding — payback over 12 years'
  if (p.decision === 'no') return `Not now · ${short(p.decidedOn)}`
  if (p.decision === 'scope') return `To Scope definition · ${short(p.decidedOn)}`
  return `Going ahead · ${short(p.decidedOn)}`
}

export function waitingDays(w: Workstream): number {
  const n = w.next
  if (n && 'since' in n && n.since) return days(n.since)
  return 0
}

export function decidedLine(w: Workstream): string {
  const when = short(w.completedOn)
  const tender = w.projects.filter((p) => p.destination === 'tender').length
  const scopeN = w.projects.filter((p) => p.destination === 'scope').length
  if (tender && scopeN) return `You decided ${when} — ${tender} to Tender, ${scopeN} to Scope definition`
  if (tender) return `You decided ${when} — all ${tender} to Tender`
  return w.outcome ? `${w.outcome} — ${when}` : `You decided ${when}`
}

export function splitLine(line: string): { main: string; detail: string } {
  const split = line.indexOf(' — ')
  if (split === -1) return { main: line || '—', detail: '' }
  return { main: line.slice(0, split), detail: line.slice(split + 3) }
}

const COLLECT: Partial<Record<SolutionId, string>> = {
  solar: 'We gather floor plans, roof details and energy use for each project.',
  ev: 'We gather site plans, car park details and energy use for each project.',
  ashp: 'We gather gas bills and energy use for each project.',
}

const RECEIVED: Partial<Record<SolutionId, string>> = {
  led: 'Floor plans, site photos, 12 months of bills',
  solar: 'Floor plans and 12 months of bills',
  ev: 'Site plans and 12 months of bills',
  ashp: 'Gas bills and building data',
}

export interface StepColumn {
  label: string
  state: 'passed' | 'now' | 'upcoming'
  count: number
  /** Replaces "N projects" — used for a passed or upcoming step with nobody on it. */
  countLabel?: string
  happens: string
  panel?: {
    heading: string
    tone: 'muted' | 'dashed' | 'solid'
    items: Array<{ mark: 'tick' | 'you' | 'other'; text: string; sub?: string; action?: 'email' }>
  }
}

export function indicativeSteps(a: Account, w: Workstream): StepColumn[] {
  const def = service(w.service)
  const happens = (def.happens ?? []).map((line, i) => (i === 0 && w.solution !== 'led' ? COLLECT[w.solution] ?? line : line))
  return def.steps.map((label, i) => {
    const here = w.projects.filter((p) => p.step === i)
    const past = w.projects.filter((p) => p.step > i)
    const state = here.length ? 'now' : past.length ? 'passed' : 'upcoming'
    const count = here.length || past.length
    return { label, state, count, happens: happens[i] ?? '', panel: stepPanel(a, w, i) }
  })
}

function stepPanel(a: Account, w: Workstream, i: number): StepColumn['panel'] {
  const names = (rows: ProjectRow[]) => rows.map((p) => getBuilding(a, p.buildingId).name)
  if (i === 0) {
    if (w.projects.every((p) => p.step === 0) && w.next?.kind === 'gas') {
      return {
        heading: 'Needs',
        tone: 'solid',
        items: [{ mark: 'you', text: `Gas bills for ${w.projects.length} buildings — asked ${short(w.next.since)} · waiting ${days(w.next.since)} days` }],
      }
    }
    if (w.projects.some((p) => p.step > 0)) {
      return { heading: 'Received', tone: 'muted', items: [{ mark: 'tick', text: `${RECEIVED[w.solution] ?? 'Building data'} — From you` }] }
    }
  }
  if (i === 1) {
    const preparing = w.projects.filter((p) => p.step === 1 && !p.ready)
    const ready = w.projects.filter((p) => p.step === 1 && p.ready)
    if (!preparing.length && !ready.length) return undefined
    const items: NonNullable<StepColumn['panel']>['items'] = []
    if (preparing.length) {
      const who = preparing.length <= 4 ? names(preparing).join(', ') : `${preparing.length} projects`
      items.push({ mark: 'other', text: `Estimates for ${who} — CQuel is preparing them` })
    }
    if (ready.length) {
      items.push({ mark: 'other', text: `${ready.length} of ${w.projects.length} ready — CQuel is preparing the rest` })
    }
    return { heading: 'Needs', tone: 'dashed', items }
  }
  if (i === 2 && w.next?.kind === 'decision') {
    const n = w.projects.filter((p) => p.step === 2 && p.decision === 'waiting').length
    if (!n) return undefined
    return {
      heading: 'Needs',
      tone: 'solid',
      items: [{ mark: 'you', text: `Your go or no-go on ${n} estimates — Presented ${short(w.next.since)} · waiting ${days(w.next.since)} days` }],
    }
  }
  if (i === 3) {
    const go = w.projects.filter((p) => p.decision === 'go').length
    const no = w.projects.filter((p) => p.decision === 'no').length
    const scopeN = w.projects.filter((p) => p.decision === 'scope').length
    if (!go && !no && !scopeN) return undefined
    const when = w.projects.map((p) => p.decidedOn).filter((d): d is string => Boolean(d)).sort((x, y) => parse(y) - parse(x))[0]
    let text = ''
    if (w.owner === 'done' && (scopeN || w.projects.some((p) => p.destination))) {
      const tender = w.projects.filter((p) => p.destination === 'tender').length
      const toScope = w.projects.filter((p) => p.destination === 'scope').length
      text = toScope ? `${tender} to Tender, ${toScope} to Scope definition` : `All ${tender} to Tender`
    } else if (go && no) text = `${go} going ahead, ${no} not proceeding`
    else if (go) text = `${go} going ahead`
    else text = `${no} not proceeding`
    return { heading: 'Decided', tone: 'muted', items: [{ mark: 'tick', text: when ? `${text} — Decided ${short(when)}` : text }] }
  }
  return undefined
}

export function waitingForDecision(w: Workstream) {
  return w.projects.filter((p) => p.decision === 'waiting').length
}

export function projectHistory(a: Account, w: Workstream, row: ProjectRow) {
  if (row.history?.length) return row.history
  const batch = getBatch(a, w.batchId)
  const items: Array<{ event: string; detail: string; date: string }> = []
  if (row.presentedOn && row.estimate) {
    items.push({
      event: 'Estimate presented',
      detail: `Cost ${money(row.estimate)}, payback ${paybackLabel(row.paybackYears).toLowerCase()}.`,
      date: short(row.presentedOn),
    })
  }
  if (w.startedOn) {
    items.push({ event: `Joined ${w.name}`, detail: `Allocated from ${batch?.name ?? 'the batch'}.`, date: short(w.startedOn) })
  }
  return items
}

const BASIS: Partial<Record<SolutionId, Array<{ label: string; source: string }>>> = {
  led: [
    { label: 'Floor area', source: 'Floor plans' },
    { label: 'Current lighting', source: 'Site photos' },
    { label: 'Electricity use', source: '12 months of bills' },
    { label: 'Operating hours', source: 'Your schedule' },
  ],
  solar: [
    { label: 'Roof area', source: 'Floor plans' },
    { label: 'Electricity use', source: '12 months of bills' },
  ],
  ev: [
    { label: 'Car park', source: 'Site plans' },
    { label: 'Electricity use', source: '12 months of bills' },
  ],
  ashp: [
    { label: 'Gas use', source: '12 months of bills' },
    { label: 'Floor area', source: 'Floor plans' },
  ],
}

export function basisRows(w: Workstream, row: ProjectRow) {
  if (row.basedOn?.length) return row.basedOn
  return (BASIS[w.solution] ?? []).map((field) => ({ ...field, value: '—' }))
}

export function recordedVisits(w: Workstream): Visit[] {
  return w.projects.flatMap((p) => (p.visit && p.visit.state !== 'skip' ? [p.visit] : []))
}

/** Surveys column: "8 done — last on 3 Oct". */
export function surveyLine(w: Workstream): string {
  const visits = recordedVisits(w)
  const note = w.surveyNote
  if (!visits.length) return note ? `Not needed — ${note}` : 'Not needed'
  const done = visits.filter((v) => v.state === 'done').length
  const booked = visits.filter((v) => v.state === 'booked').length
  if (visits.every((v) => v.state === 'unbooked')) return `To be booked — ${visits.length}${note ? `, ${note}` : ''}`
  if (done === visits.length) return note ? `${done} done — ${note}` : `${done} done`
  if (booked) return `${done} of ${visits.length} done — ${booked} booked${note ? `, ${note}` : ''}`
  return `${done} of ${visits.length} done`
}

export function visitWord(serviceId: ServiceId, n: number) {
  if (serviceId === 'tender' || serviceId === 'delivery') return n === 1 ? 'site check' : 'site checks'
  return n === 1 ? 'survey' : 'surveys'
}

export function visitCountLabel(w: Workstream) {
  const n = recordedVisits(w).length
  return `${n} ${visitWord(w.service, n)}`
}

/** The open state a workstream's visits sit under. Mixed visits use the state still open. */
export function visitBucket(w: Workstream): 'unbooked' | 'booked' | 'done' | null {
  const visits = recordedVisits(w)
  if (!visits.length) return null
  if (visits.some((v) => v.state === 'unbooked')) return 'unbooked'
  if (visits.some((v) => v.state === 'booked')) return 'booked'
  return 'done'
}

export function visitStateLabel(v: Visit): string {
  if (v.state === 'skip') return 'Not needed'
  if (v.state === 'unbooked') return 'Not booked yet'
  if (v.state === 'booked') return v.note ? `Booked — ${v.note}` : 'Booked — date to confirm'
  if (v.on) return `Done ${short(v.on)}`
  if (v.note) return `Done · ${v.note}`
  return 'Done'
}

export function openGapsLine(w: Workstream): string {
  const gaps = new Map<string, number>()
  for (const p of w.projects) if (p.gap) gaps.set(p.gap, (gaps.get(p.gap) ?? 0) + 1)
  if (!gaps.size) return '—'
  return [...gaps].map(([label, n]) => `${label} · ${noun(n, 'project', 'projects')}`).join(', ')
}

export function scopeProjectsAside(w: Workstream): string {
  const n = w.projects.length
  const gaps = [...new Set(w.projects.map((p) => p.gap).filter((g): g is string => Boolean(g)))]
  if (w.next?.kind === 'agree' && w.projects.some((p) => p.decision === 'waiting')) {
    const waiting = w.projects.filter((p) => p.decision === 'waiting').length
    return waiting === n ? `${n} · all waiting for you to agree` : `${n} · ${waiting} waiting for you to agree`
  }
  if (gaps.length === 1 && w.projects.every((p) => p.gap === gaps[0])) return `${n} · all waiting on ${gaps[0].toLowerCase()}`
  return String(n)
}

export function sectionOutcome(w: Workstream): string {
  if (w.service === 'indicative') return decidedLine(w)
  if (w.service === 'scope' && w.owner === 'done') return `Scope agreed ${short(w.completedOn)} — ${w.projects.length} projects to Pricing`
  if (w.service === 'tender' && w.owner === 'done') {
    const who = w.supplier ?? w.outcome?.replace(/ chosen.*/, '') ?? 'Supplier'
    return `${who} chosen ${short(w.completedOn)} — ${w.projects.length} projects to Delivery`
  }
  if (w.service === 'pricing' && w.owner === 'done') return `Contract signed ${short(w.completedOn)} — ${w.projects.length} projects to Delivery`
  if (w.service === 'delivery' && w.owner === 'done') return `All ${w.projects.length} handed over ${short(w.completedOn)} — Installed`
  return w.outcome || short(w.completedOn) || '—'
}

export function moneyOne(n: number): string {
  if (n >= 1000) return `€${(n / 1000).toFixed(1).replace(/\.0$/, '')}m`
  return `€${n}k`
}

export function pricingTotal(w: Workstream): number | null {
  const sum = w.projects.reduce((total, project) => total + (project.price ?? 0), 0)
  if (sum) return sum
  return w.pricing?.total ?? null
}

/** Price column: "€132k — 4 projects". */
export function priceLine(w: Workstream): string {
  const total = pricingTotal(w)
  if (!total) return `Not received yet — ${w.projects.length} projects`
  if (w.pricing?.agreedOn) return `${moneyOne(total)} — Agreed ${short(w.pricing.agreedOn)}`
  return `${moneyOne(total)} — ${w.projects.length} projects`
}

export function pricingProjectsAside(w: Workstream): string {
  const total = pricingTotal(w)
  const steps = service('pricing').steps
  const at = new Set(w.projects.map((project) => project.step))
  if (total && w.pricing?.agreedOn) return `${w.projects.length} · ${moneyOne(total)} agreed`
  if (total) return `${w.projects.length} · ${moneyOne(total)} in total`
  if (at.size === 1) return `${w.projects.length} · all at ${steps[[...at][0]]}`
  return String(w.projects.length)
}

export function pricingSteps(w: Workstream): StepColumn[] {
  const def = service('pricing')
  return def.steps.map((label, i) => {
    const here = w.projects.filter((project) => project.step === i).length
    const passed = w.projects.some((project) => project.step > i)
    const finished = w.owner === 'done'
    const state = finished ? 'passed' : here ? 'now' : passed ? 'passed' : 'upcoming'
    return {
      label,
      state,
      count: here,
      countLabel: finished || !here ? '—' : undefined,
      happens: def.happens?.[i] ?? '',
      panel: pricingPanel(w, i, state),
    }
  })
}

function pricingPanel(w: Workstream, i: number, state: 'passed' | 'now' | 'upcoming'): StepColumn['panel'] {
  const info = w.pricing
  const total = pricingTotal(w)
  const n = w.next
  if (i === 0 && state === 'passed' && w.supplier && info?.setOn) {
    const note = info.setNote ? ` — ${info.setNote}` : ''
    return { heading: 'Set', tone: 'muted', items: [{ mark: 'tick', text: `${w.supplier}${note} — ${short(info.setOn)}` }] }
  }
  if (i === 1 && state === 'now' && n?.kind === 'price') {
    return { heading: 'Needs', tone: 'dashed', items: [{ mark: 'other', text: `Price from ${n.from} — Requested ${short(n.since)} · waiting ${days(n.since)} days` }] }
  }
  if (i === 2 && state === 'passed' && info?.receivedOn && total) {
    return { heading: 'Received', tone: 'muted', items: [{ mark: 'tick', text: `${moneyOne(total)} for ${w.projects.length} projects — ${short(info.receivedOn)}` }] }
  }
  if (i === 3 && state === 'passed' && info?.analysedOn && info.analysisNote) {
    return { heading: 'Checked', tone: 'muted', items: [{ mark: 'tick', text: `${info.analysisNote} — ${short(info.analysedOn)}` }] }
  }
  if (i === 4 && state === 'passed' && info?.agreedOn && total) {
    return { heading: 'Agreed', tone: 'muted', items: [{ mark: 'tick', text: `Price agreed — ${moneyOne(total)} for ${w.projects.length} projects — ${short(info.agreedOn)}` }] }
  }
  if (i === 4 && state === 'now' && n?.kind === 'agreePrice') {
    const waiting = w.projects.filter((project) => project.decision === 'waiting').length
    if (!waiting) return undefined
    return { heading: 'Needs', tone: 'solid', items: [{ mark: 'you', text: `Agree the price for ${waiting} projects — Sent ${short(n.since)} · waiting ${days(n.since)} days` }] }
  }
  if (i === 5 && state === 'now' && n?.kind === 'sign') {
    return { heading: 'Needs', tone: 'solid', items: [{ mark: 'you', text: `Contract to sign — Sent ${short(n.since)} · waiting ${days(n.since)} days` }] }
  }
  if (i === 5 && w.owner === 'done') {
    return { heading: 'Signed', tone: 'muted', items: [{ mark: 'tick', text: `Contract signed ${short(w.completedOn)}` }] }
  }
  return undefined
}

const DELIVERY_PHASE_IDS = ['start', 'phase1', 'phase2', 'phase3', 'phase4', 'complete'] as const

export function deliveryNextLine(w: Workstream): string {
  const confirming = w.projects.filter((project) => project.delivery?.confirmPhase)
  if (!confirming.length || !w.supplier) return ''
  const dates = confirming
    .map((project) => {
      const phase = project.delivery?.confirmPhase
      return phase ? project.delivery?.phases[phase]?.on : undefined
    })
    .filter((date): date is string => Boolean(date))
    .sort((a, b) => parse(a) - parse(b))
    .map((date) => short(date))
  const n = confirming.length
  const sameMonth = dates.length > 1 && dates.every((date) => date.split(' ')[1] === dates[0].split(' ')[1])
  const when = !dates.length
    ? ''
    : dates.length === 1
      ? dates[0]
      : sameMonth
        ? `${dates.slice(0, -1).map((date) => date.split(' ')[0]).join(', ')} and ${dates[dates.length - 1]}`
        : `${dates.slice(0, -1).join(', ')} and ${dates[dates.length - 1]}`
  return `Confirm ${n} ${n === 1 ? 'date' : 'dates'} — From ${w.supplier}'s invoices, ${when}`
}

export function datesToConfirm(w: Workstream): number {
  return w.projects.filter((project) => project.delivery?.confirmPhase).length
}

export function needsAttention(w: Workstream): boolean {
  return w.owner !== 'done' && w.projects.some((project) => project.delivery?.confirmPhase || project.delivery?.overdueDue)
}

/** Delivery column: "2 of 6 complete — 2 dates to confirm". */
export function deliveryLine(w: Workstream): string {
  const total = w.projects.length
  const complete = w.owner === 'done' ? total : w.projects.filter((project) => project.step >= 5).length
  const head = `${complete} of ${total} complete`
  if (w.owner === 'done') return `${head} — Handed over`
  const confirm = datesToConfirm(w)
  if (confirm) return `${head} — ${confirm} ${confirm === 1 ? 'date' : 'dates'} to confirm`
  const overdue = w.projects.filter((project) => project.delivery?.overdueDue).length
  if (overdue) return `${head} — ${overdue} overdue`
  const sitting = w.projects.filter((project) => project.step < 5)
  const phase = sitting.length ? service('delivery').steps[Math.min(...sitting.map((project) => project.step))] : 'Complete'
  return `${head} — ${phase}`
}

export function deliveryProjectsAside(w: Workstream): string {
  const confirm = datesToConfirm(w)
  return confirm ? `${w.projects.length} · ${confirm} to confirm` : String(w.projects.length)
}

export function deliverySteps(a: Account, w: Workstream): StepColumn[] {
  const def = service('delivery')
  const happens = [...(def.happens ?? [])]
  if (w.solution === 'ev') happens[2] = 'The supplier installs the chargers.'
  return def.steps.map((label, i) => {
    const here = w.projects.filter((project) => project.step === i).length
    const passed = w.projects.some((project) => project.step > i)
    const finished = w.owner === 'done'
    const state = finished ? 'passed' : here ? 'now' : passed ? 'passed' : 'upcoming'
    return {
      label,
      state,
      count: here,
      countLabel: finished || !here ? '—' : undefined,
      happens: happens[i] ?? '',
      panel: deliveryPanel(a, w, i, state),
    }
  })
}

function deliveryPanel(a: Account, w: Workstream, i: number, state: 'passed' | 'now' | 'upcoming'): StepColumn['panel'] {
  if (i === 0 && state === 'now') {
    const need = w.needs.find((item) => item.owner === 'suppliers' && !item.received)
    if (need) return { heading: 'Needs', tone: 'dashed', items: [{ mark: 'other', text: `${need.label} — ${need.why}` }] }
  }
  if (i === 1 && state === 'passed' && w.deliveryProfile?.siteChecksOn) {
    const n = w.deliveryProfile.siteChecks ?? w.projects.filter((project) => project.visit?.state === 'done').length
    return { heading: 'Site checks', tone: 'muted', items: [{ mark: 'tick', text: `${n} site checks done — ${short(w.deliveryProfile.siteChecksOn)}` }] }
  }
  const confirming = w.projects.filter((project) => project.delivery?.confirmPhase && DELIVERY_PHASE_IDS.indexOf(project.delivery.confirmPhase) === i)
  if (confirming.length) {
    return {
      heading: 'To confirm',
      tone: 'solid',
      items: confirming.map((project) => {
        const phase = project.delivery!.confirmPhase!
        const on = project.delivery?.phases[phase]?.on
        const name = getBuilding(a, project.buildingId).name
        const what = phase === 'complete' ? 'Completion' : 'Installation start'
        return { mark: 'you' as const, text: `${what} at ${name} — From invoice · ${short(on)}` }
      }),
    }
  }
  if (i === 2 && state === 'now' && w.next?.kind === 'overdue') {
    return { heading: 'Needs', tone: 'dashed', items: [{ mark: 'other', text: `${w.next.place} overdue — due ${short(w.next.due)} · ${days(w.next.due)} days late` }] }
  }
  if (i === 5 && w.owner === 'done') {
    return { heading: 'Done', tone: 'muted', items: [{ mark: 'tick', text: `All ${w.projects.length} handed over ${short(w.completedOn)}` }] }
  }
  return undefined
}

/** Suppliers column: "11 invited — 57 approached". */
export function suppliersLine(w: Workstream): string {
  const t = w.tender
  if (w.owner === 'done' && w.service === 'tender') {
    const offers = t?.offers?.received
    return offers ? `${w.supplier ?? 'Supplier'} — ${offers} offers` : w.supplier ?? '—'
  }
  if (!t?.invited) {
    if (t?.approached) return `Shortlisting — ${t.approached} approached`
    return 'Not invited yet'
  }
  if (w.next?.kind === 'choose' && t.offers) return `${t.offers.received} offers — ${t.invited} invited`
  if (t.approached) return `${t.invited} invited — ${t.approached} approached`
  return `${t.invited} invited`
}

export function capacityLabel(kwp: number): string {
  if (kwp >= 1000) return `${(kwp / 1000).toFixed(1).replace(/\.0$/, '')} MWp`
  return `${kwp} kWp`
}

export function totalCapacity(w: Workstream): string | null {
  const kwp = w.projects.reduce((sum, p) => sum + (p.sizeKwp ?? 0), 0)
  return kwp ? capacityLabel(kwp) : null
}

export function siteChecksLine(w: Workstream): string | null {
  const done = w.projects.filter((p) => p.visit?.state === 'done').length
  return done ? `${done} done` : null
}

export function tenderProjectsAside(w: Workstream): string {
  const steps = service(w.service).steps
  const at = new Set(w.projects.map((p) => p.step))
  if (at.size === 1) return `${w.projects.length} · all at ${steps[[...at][0]]}`
  return String(w.projects.length)
}

export function tenderSteps(w: Workstream): StepColumn[] {
  const def = service('tender')
  return def.steps.map((label, i) => {
    const here = w.projects.filter((p) => p.step === i).length
    const passed = w.projects.some((p) => p.step > i)
    const finished = w.owner === 'done'
    const state = finished ? 'passed' : here ? 'now' : passed ? 'passed' : 'upcoming'
    return {
      label,
      state,
      count: here,
      countLabel: finished || !here ? '—' : undefined,
      happens: def.happens?.[i] ?? '',
      panel: tenderPanel(w, i, state),
    }
  })
}

function tenderPanel(w: Workstream, i: number, state: 'passed' | 'now' | 'upcoming'): StepColumn['panel'] {
  const t = w.tender
  const n = w.next
  if (i === 0 && state === 'passed' && t?.briefAgreedOn) {
    return { heading: 'Agreed', tone: 'muted', items: [{ mark: 'tick', text: `Brief agreed — ${short(t.briefAgreedOn)}` }] }
  }
  if (i === 0 && state === 'now' && n?.kind === 'brief') {
    return { heading: 'Needs', tone: 'solid', items: [{ mark: 'you', text: `Brief to agree — Sent ${short(n.since)} · waiting ${days(n.since)} days` }] }
  }
  if (i === 1 && state === 'passed' && t?.invited && t.approached && t.matchedOn) {
    return { heading: 'Matched', tone: 'muted', items: [{ mark: 'tick', text: `${t.invited} of ${t.approached} suppliers match — Matched ${short(t.matchedOn)}` }] }
  }
  if (i === 1 && state === 'now' && n?.kind === 'shortlist') {
    return { heading: 'Needs', tone: 'dashed', items: [{ mark: 'other', text: `Supplier shortlist — Brief agreed ${short(n.on)}` }] }
  }
  if (i === 2 && state === 'now' && n?.kind === 'offers') {
    const left = n.invited - n.in
    const due = t?.offersDue ? ` · due ${short(t.offersDue)}` : ''
    return { heading: 'Needs', tone: 'dashed', items: [{ mark: 'other', text: `Offers from ${left} suppliers — Chased ${short(n.chased)}${due}` }] }
  }
  if (i === 4 && state === 'now' && n?.kind === 'choose') {
    return { heading: 'Needs', tone: 'solid', items: [{ mark: 'you', text: `Your choice of supplier — Sent ${short(n.since)} · waiting ${days(n.since)} days` }] }
  }
  if (i === 5 && w.owner === 'done' && w.supplier) {
    return { heading: 'Chosen', tone: 'muted', items: [{ mark: 'tick', text: `${w.supplier} chosen ${short(w.completedOn)}` }] }
  }
  return undefined
}

export function scopeDecisionLabel(p: ProjectRow): string {
  if (p.decision === 'go') return `Scope agreed · ${short(p.decidedOn)}`
  return '—'
}

const SCOPE_HAPPENS: Partial<Record<SolutionId, [string, string]>> = {
  ev: ['We book a survey where the plans can\'t answer it.', 'The surveyor checks the car park can take chargers.'],
  ashp: ['We book a survey where the information can\'t answer it.', 'The surveyor checks the plant room and the heating load.'],
}

export function scopeSteps(a: Account, w: Workstream): StepColumn[] {
  const def = service('scope')
  const happens = (def.happens ?? []).map((line, i) => (i === 2 || i === 3 ? SCOPE_HAPPENS[w.solution]?.[i - 2] ?? line : line))
  return def.steps.map((label, i) => {
    const here = w.projects.filter((p) => p.step === i).length
    const passed = w.projects.some((p) => p.step > i)
    const state = here ? 'now' : passed ? 'passed' : 'upcoming'
    return { label, state, count: here, countLabel: here ? undefined : '—', happens: happens[i] ?? '', panel: scopePanel(a, w, i) }
  })
}

function scopePanel(a: Account, w: Workstream, i: number): StepColumn['panel'] {
  const names = (ids: string[]) => ids.map((id) => getBuilding(a, id).name)
  if (i === 0 && w.found && w.projects.some((p) => p.step > 0)) {
    return { heading: 'Found', tone: 'muted', items: [{ mark: 'tick', text: w.found }] }
  }
  if (i === 1 && w.projects.some((p) => p.step === 1) && w.next && 'since' in w.next && (w.next.kind === 'roof' || w.next.kind === 'carpark')) {
    const gap = w.projects.find((p) => p.gap)?.gap ?? 'Information'
    const n = w.projects.filter((p) => p.step === 1).length
    return {
      heading: 'Needs',
      tone: 'solid',
      items: [{ mark: 'you', text: `${gap} — ${n} buildings — Asked ${short(w.next.since)} · waiting ${days(w.next.since)} days`, action: 'email' }],
    }
  }
  if (i === 2) {
    const booked = w.projects.filter((p) => p.visit?.state === 'booked')
    if (booked.length) {
      return {
        heading: 'Needs',
        tone: 'dashed',
        items: booked.map((p) => ({ mark: 'other' as const, text: `${getBuilding(a, p.buildingId).name} — Booked, ${p.visit?.note ?? 'date to confirm'}` })),
      }
    }
    if (w.projects.length && w.projects.every((p) => p.visit?.state === 'skip')) {
      return { heading: 'Not needed', tone: 'muted', items: [{ mark: 'tick', text: w.surveyNote ? w.surveyNote[0].toUpperCase() + w.surveyNote.slice(1) : 'Not needed' }] }
    }
    const survey = w.needs.find((need) => need.owner === 'cquel' && !need.received)
    if (survey && w.projects.some((p) => p.visit?.state === 'unbooked')) {
      return { heading: 'Needs', tone: 'dashed', items: [{ mark: 'other', text: `${survey.label} — ${survey.why}` }] }
    }
  }
  if (i === 3 && w.next?.kind === 'agree') {
    const n = w.projects.filter((p) => p.decision === 'waiting').length
    if (!n) return undefined
    return {
      heading: 'Needs',
      tone: 'solid',
      items: [{ mark: 'you', text: `Agree scope for ${n} projects — Sent ${short(w.next.since)} · waiting ${days(w.next.since)} days` }],
    }
  }
  if (i === 3) {
    const done = w.projects.filter((p) => p.visit?.state === 'done' && p.visit.on)
    if (done.length && w.projects.some((p) => p.step < 3)) {
      return { heading: 'Done', tone: 'muted', items: [{ mark: 'tick', text: `${names(done.map((p) => p.buildingId)).join(', ')} — Done ${short(done[0].visit!.on)}` }] }
    }
  }
  if (i === 4 && w.owner === 'done' && w.projects.every((p) => p.step === 4)) {
    return { heading: 'Agreed', tone: 'muted', items: [{ mark: 'tick', text: sectionOutcome(w) }] }
  }
  return undefined
}

export function scopeLine(w: Workstream, row: ProjectRow): string {
  const agreed = service('scope').steps.indexOf('Scope agreed')
  const surveyed = service('scope').steps.indexOf('Survey done')
  if (row.step >= agreed && row.decidedOn) return `Agreed ${short(row.decidedOn)}`
  if (row.step === surveyed && row.decision === 'waiting' && w.next?.kind === 'agree') {
    return `Sent ${short(w.next.since)} · waiting ${days(w.next.since)} days`
  }
  if (row.visit?.state === 'skip') return 'Written from the information you send'
  return 'Written once the survey is done'
}

/** Earlier service this project already finished, used on the project route. */
export function priorProject(a: Account, w: Workstream, buildingId: string) {
  const earlier = a.workstreams.find(
    (other) =>
      other.id !== w.id &&
      other.batchId === w.batchId &&
      other.solution === w.solution &&
      other.service === 'indicative' &&
      other.owner === 'done' &&
      other.projects.some((p) => p.buildingId === buildingId),
  )
  const row = earlier?.projects.find((p) => p.buildingId === buildingId)
  return earlier && row ? { workstream: earlier, row } : null
}

export const needsByStage = (a: Account, b: Batch) => {
  const ws = wsIn(a, b.id).filter((w) => w.owner !== 'done')
  const items: Array<{ need: Need; w: Workstream }> = ws.flatMap((w) => w.needs.map((need) => ({ need, w })))
  return items
}
