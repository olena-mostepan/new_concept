/**
 * Workstreams concept — data model.
 * Mirrors docs/concept/taxonomy.md: Portfolio → Batches · Workstreams · Projects.
 * Batch = buildings with a goal. Workstream = one service × one solution, "buildings with a plan".
 */

export type ServiceId = 'indicative' | 'scope' | 'tender' | 'pricing' | 'delivery'
export type SolutionId = 'generic' | 'ev' | 'solar' | 'led' | 'ashp'

/** Who the work is with right now — the one status customers see. */
export type Owner = 'you' | 'cquel' | 'suppliers' | 'done'

export interface ServiceDef {
  id: ServiceId
  label: string
  done: string
  /** Light steps, stored per project. The last step means the project is done with this service. */
  steps: string[]
  /** What happens at each step, for services that have a workstream page. */
  happens?: string[]
}

export const SERVICES: ServiceDef[] = [
  {
    id: 'indicative',
    label: 'Indicative pricing',
    done: 'You have decided',
    steps: ['Data collected', 'Estimate', 'Presented', 'Decision'],
    happens: [
      'We gather floor plans, current lighting and energy use for each project.',
      'We work out cost and payback for each project.',
      'We share the estimates with you, project by project.',
      'You decide which projects go ahead.',
    ],
  },
  {
    id: 'scope',
    label: 'Scope definition',
    done: 'Scope agreed',
    steps: ['Gap found', 'Info requested', 'Survey booked', 'Survey done', 'Scope agreed'],
    happens: [
      "We check what's missing before anything can be tendered.",
      "We ask you for what's missing.",
      "We book a roof survey where drawings can't answer it.",
      'The surveyor checks each roof can take panels.',
      "You agree the scope; it's ready to tender.",
    ],
  },
  {
    id: 'tender',
    label: 'Tender',
    done: 'Supplier chosen',
    steps: ['Brief ready', 'Shortlisted', 'Invited', 'Responses in', 'Results', 'Supplier chosen'],
    happens: [
      'We write what suppliers price against; you agree it.',
      'We match suppliers in the CQuel network to the brief.',
      'Matched suppliers price the brief.',
      'We check each offer is complete and comparable.',
      'We compare the offers and send you the results.',
      'You choose a supplier; projects move on.',
    ],
  },
  // Contracting sits in Pricing, not Delivery (Rich, round 1)
  {
    id: 'pricing',
    label: 'Pricing',
    done: 'Price agreed, contract signed',
    steps: ['Supplier set', 'Price requested', 'Price received', 'Analysed', 'Decision', 'Contracting'],
    happens: [
      'Your incumbent prices the work, so no tender is needed.',
      'We ask the supplier to price each project.',
      'The supplier sends a price per project.',
      'We check each price against your contract rates.',
      'You agree the price, project by project.',
      'We draw up the contract; you sign it.',
    ],
  },
  {
    id: 'delivery',
    label: 'Delivery',
    done: 'Installed',
    steps: ['Kick-off', 'Design & survey', 'Installation', 'Commissioning', 'Handover', 'Complete'],
    happens: [
      'Contract signed; the supplier plans the work.',
      'The supplier checks the site and designs the install.',
      'The supplier installs.',
      'The supplier tests and switches it on.',
      'You get the documents and warranties.',
      'Installed and handed over.',
    ],
  },
]

export const SOLUTIONS: Record<SolutionId, string> = {
  generic: 'Generic',
  ev: 'EV Charging',
  solar: 'Solar PV',
  led: 'Lighting',
  ashp: 'Heat pumps',
}

export const OWNER_LABEL: Record<Owner, string> = {
  you: 'Your Action',
  cquel: "CQuel's Action",
  suppliers: 'Suppliers Action',
  done: 'Done',
}

/** Facts the next line is built from. Counts and "days waiting" are derived, not stored. */
export type NextFact =
  | { kind: 'roof'; since: string }
  | { kind: 'decision'; since: string }
  | { kind: 'offers'; in: number; invited: number; chased: string }
  | { kind: 'price'; since: string; from: string }
  | { kind: 'installing'; place: string; detail?: string }
  | { kind: 'landing' }
  | { kind: 'gas'; since: string }
  | { kind: 'carpark'; since: string }
  | { kind: 'agree'; since: string }
  | { kind: 'writing' }
  | { kind: 'choose'; since: string }
  | { kind: 'brief'; since: string }
  | { kind: 'shortlist'; on: string }
  | { kind: 'agreePrice'; since: string }
  | { kind: 'sign'; since: string }
  | { kind: 'overdue'; place: string; due: string }
  | { kind: 'design'; n: number; on: string }

/** A decision on one project's estimate. */
export type Decision = 'waiting' | 'go' | 'no' | 'scope'

export interface Building {
  id: string
  name: string
  city: string
  address?: string
  postcode?: string
  /** Property type, when ops or the portfolio recorded one. */
  type?: string
}

/**
 * Plan state of a batch (ops-side). Customers see a batch from "proposed" on.
 * draft → proposed (shared) → agreed (customer agreed) → live (workstreams started)
 */
export type PlanState = 'draft' | 'agreed' | 'proposed' | 'live'

export interface Need {
  label: string
  /** One line: where it comes from or why it's needed */
  why: string
  owner: Exclude<Owner, 'done'>
  /** When it was asked for (drives "waiting N days") */
  since?: string
  received?: string
}

export interface Known {
  label: string
  value: string
  source: string
}

export interface Batch {
  id: string
  name: string
  /** Free text, set by ops */
  goal: string
  /** Only when the platform already holds one */
  target?: string
  buildingIds: string[]
  /** Services this batch goes through. Tender or Pricing — the other is "Not needed". */
  route: ServiceId[]
  /** One line per route service, shown in the plan */
  routeNotes?: Partial<Record<ServiceId, string>>
  planState: PlanState
  filesReceived?: string
  filesCount?: number
  planProposed?: string
  planAgreed?: string
  /** When ops start the workstreams. */
  planLive?: string
  /** Named lead, when the batch has one */
  lead?: string
  /** One received bundle, shown under the stage that will use it */
  filesSummary?: string
  /** Things we'll need at a later stage — signalled, not asked yet */
  upcoming?: Array<Need & { stage: ServiceId }>
  known?: Known[]
  /** Short line on changes this month, from transitions */
  changes?: string
  createdOn: string
}

export interface Basis {
  label: string
  value: string
  source: string
}

/** A visit to a building. Scope definition calls it a survey; Tender and Delivery call it a site check. */
export type VisitState = 'unbooked' | 'booked' | 'done' | 'skip'

export interface Visit {
  state: VisitState
  /** A date the platform holds. Absent means there is no date. */
  on?: string
  /** Shown instead of a date: "date to confirm", "July". */
  note?: string
  /** Line under the survey state on the project page. */
  detail?: string
}

export interface HistoryItem {
  event: string
  detail: string
  date: string
}

export interface ProjectRow {
  buildingId: string
  step: number
  note?: string
  dropped?: boolean
  /** € thousands, low–high */
  estimate?: [number, number]
  paybackYears?: number | 'over12'
  decision?: Decision
  decidedOn?: string
  presentedOn?: string
  /** Estimate step, ready to present */
  ready?: boolean
  destination?: 'tender' | 'scope' | 'pricing'
  basedOn?: Basis[]
  /** Open gap still with the customer, e.g. "Roof drawings". */
  gap?: string
  visit?: Visit
  history?: HistoryItem[]
  /** Installed capacity, kWp. */
  sizeKwp?: number
  briefLabel?: string
  /** Own brief, shown semibold. */
  briefStrong?: boolean
  briefNote?: string
  /** Agreed or offered price, € thousands. */
  price?: number
  /** Compared with the customer's own contract rates. */
  analysis?: string
  analysisStrong?: boolean
  /** Phase dates for Delivery. The product components read these through the adapter. */
  delivery?: ProjectDelivery
}

export type DeliveryPhaseId = 'start' | 'phase1' | 'phase2' | 'phase3' | 'phase4' | 'complete'
export type DeliveryDateState = 'confirmed' | 'estimate' | 'from_invoice' | 'needs_confirm'

export interface DeliveryPhase {
  on?: string
  state?: DeliveryDateState
}

export interface ProjectDelivery {
  /** € thousands */
  value?: number
  /** Phase whose invoice date still needs a check. */
  confirmPhase?: DeliveryPhaseId
  /** Due date when this project is late. */
  overdueDue?: string
  phases: Partial<Record<DeliveryPhaseId, DeliveryPhase>>
  expectedCompletion?: DeliveryPhase
}

export interface DeliveryProfile {
  /** € thousands */
  contractValue?: number
  /** Estimate the workstream already holds, e.g. "16 Dec 2026". */
  expectedCompletion?: string
  siteChecksOn?: string
  siteChecks?: number
}

export interface PricingInfo {
  /** "Per project" when each project is priced on its own. */
  priced?: string
  source?: string
  total?: number
  setOn?: string
  setNote?: string
  requestedOn?: string
  receivedOn?: string
  analysedOn?: string
  /** Panel line, e.g. "3 match, 1 above on groundworks". */
  analysisNote?: string
  agreedOn?: string
  contractOn?: string
}

export interface Workstream {
  id: string
  batchId: string
  /** Display name as ops set it, e.g. "Solar PV DE" or "Heat pumps · Kelderby" */
  name: string
  service: ServiceId
  solution: SolutionId
  /** Named only when a supplier is already on the workstream */
  supplier?: string
  owner: Owner
  /** Next action — one line. Customer screens prefer `next`, so counts stay derived. */
  now: string
  /** Structured next line. Days and building counts are worked out in derive.ts. */
  next?: NextFact
  /** What this workstream gives the customer, without the "You get:" prefix */
  gives?: string
  /** Sites left out, and why */
  exclusion?: string
  /** Short result once the workstream is done, e.g. "Voltreny chosen" */
  outcome?: string
  /** Workstream-page activity. Portfolio activity stays on the account. */
  activity?: Activity[]
  documents?: Doc[]
  /** Detail after " — " on the Surveys column. */
  surveyNote?: string
  /** Survey documents exist for these visits. */
  surveyDocs?: boolean
  /** Grey "Found" line on the first scope step. */
  found?: string
  /** Where a finished workstream moved, and why. */
  movedTo?: { workstreamId: string; reason: string }
  tender?: TenderProfile
  pricing?: PricingInfo
  deliveryProfile?: DeliveryProfile
  /** In the plan but not started (batch not yet agreed) */
  proposed?: boolean
  startedOn?: string
  completedOn?: string
  estimate?: string
  needs: Need[]
  projects: ProjectRow[]
  lead: string
}

export interface Activity {
  date: string
  title: string
  text: string
  batchId?: string
}

export interface Doc {
  name: string
  meta: string
  action?: string
  batchId?: string
  /** Shown grey, with no action. */
  muted?: boolean
}

export interface OfferSplit {
  received: number
  partial?: number
  declined?: number
  noResponse?: number
  summary?: string
}

/** Supplier numbers for a tender. Counts the platform holds, not a guess. */
export interface TenderProfile {
  source?: string
  approached?: number
  invited?: number
  invitedOn?: string
  matchedOn?: string
  offersDue?: string
  brief?: string
  briefAgreedOn?: string
  criteria?: string[]
  offers?: OfferSplit
}

export interface Account {
  id: string
  customer: string
  /** Name in the welcome line */
  user: string
  kind: 'mature' | 'pilot'
  buildings: Building[]
  batches: Batch[]
  workstreams: Workstream[]
  activity: Activity[]
  documents: Doc[]
  /** Cumulative workstreams started and finished, for Momentum */
  momentum?: Array<{ month: string; started: number; finished: number }>
  /** Properties ops still need to reconcile into the portfolio */
  toReconcile?: number
}

export const service = (id: ServiceId) => SERVICES.find((s) => s.id === id)!
export const TODAY = '19 Oct 2026'
