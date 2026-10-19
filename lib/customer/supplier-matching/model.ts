import { parseIso } from '@/lib/customer/delivery/dates'

export const BID_STATUS = {
  offerReceived: 'offer_received',
  partialOffer: 'partial_offer',
  biddingNoDate: 'bidding_no_date',
  declined: 'declined',
  noResponse: 'no_response',
} as const

export type BidStatus = (typeof BID_STATUS)[keyof typeof BID_STATUS]

export const BID_STATUS_LABEL: Record<BidStatus, string> = {
  offer_received: 'Offer received',
  partial_offer: 'Partial offer',
  bidding_no_date: 'Bidding, no date',
  declined: 'Declined',
  no_response: 'No response yet',
}

export const BID_STATUS_ORDER: BidStatus[] = [
  'offer_received',
  'partial_offer',
  'bidding_no_date',
  'declined',
  'no_response',
]

/** Same fills as the portfolio pipeline chart, light to dark. */
export const BID_STATUS_BAR: Record<BidStatus, { color: string; onDark: boolean }> = {
  offer_received: { color: '#D7DCE3', onDark: false },
  partial_offer: { color: '#9AA3B2', onDark: false },
  bidding_no_date: { color: '#7B8FA8', onDark: true },
  declined: { color: '#3D4654', onDark: true },
  no_response: { color: '#1E2430', onDark: true },
}

/** Same washes as Delivery key-date tags: confirmed, needs confirm, estimate. */
export const BID_STATUS_PILL: Record<BidStatus, string> = {
  offer_received: 'border-[var(--cq-green)]/30 bg-[var(--cq-green)]/10 text-[var(--cq-green)]',
  partial_offer: 'border-[var(--cq-link)]/30 bg-[var(--cq-link)]/10 text-[var(--cq-link)]',
  bidding_no_date: 'border-cq-border bg-cq-bg text-cq-text-secondary',
  declined: 'border-cq-border bg-cq-bg text-cq-text-secondary',
  no_response: 'border-cq-border bg-cq-bg text-cq-text-secondary',
}

export const RELEVANCE_WEIGHTS = [
  { id: 'capability', label: 'Capability', weight: 0.45 },
  { id: 'location', label: 'Location', weight: 0.2 },
  { id: 'trackRecord', label: 'Track record', weight: 0.2 },
  { id: 'capacity', label: 'Capacity', weight: 0.15 },
] as const

export const COMPANY_CHECKS = [
  { id: 'experience', label: 'Experience' },
  { id: 'quality', label: 'Quality' },
  { id: 'finance', label: 'Finance' },
] as const

export type MatchingAudience = 'customer' | 'internal'

export type ScoreFactor = {
  id: string
  score: number
  reason: string
  missing: boolean
  /** Open label when `missing` is true. Defaults to "Not on record". */
  missingLabel?: string
}

export type InvitedSupplier = {
  id: string
  name: string
  profileHref: string
  partnerLabel: string
  tenderCount: number
  bidStatus: BidStatus
  /** Prose under the badge. Not a status label. */
  statusNote: string
  invitationSentDate: string | null
  invitationOpenedDate: string | null
  confirmedDate: string | null
  promisedSubmissionDate: string | null
  submittedDate: string | null
  declinedDate: string | null
  /** Published relevance figure for this project, out of 10. */
  relevanceScore: number
  /** Null when there is no company score to show. */
  companyScore: number | null
  relevance: ScoreFactor[]
  company: ScoreFactor[]
  completedTenders: number
}

export type ExclusionReason = {
  id: string
  label: string
  detail: string
  count: number
}

export type UnassessedSupplier = {
  id: string
  name: string
  missing: string
}

export type MatchingTender = {
  closeDate: string
  status: 'open' | 'closed'
  contacted: number
  metRequirements: number
  stageIndex: number
  suppliers: InvitedSupplier[]
  exclusionReasons: ExclusionReason[]
  unassessed: UnassessedSupplier[]
}

export type DatedLine = {
  primary: string
  supporting: string
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function formatScore(value: number | null): string {
  if (value == null) return '—'
  const rounded = Math.round(value * 100) / 100
  const oneDecimal = Math.round(rounded * 10) / 10
  if (Math.abs(rounded - oneDecimal) < 0.001) return oneDecimal.toFixed(1)
  return rounded.toFixed(2)
}

export function formatDayMonth(iso: string): string {
  const date = parseIso(iso)
  return `${date.getDate()} ${MONTHS[date.getMonth()]}`
}

export function formatDayMonthYear(iso: string): string {
  const date = parseIso(iso)
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`
}

function calendarDaysBetween(fromIso: string, today: Date): number {
  const from = parseIso(fromIso)
  const to = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12)
  return Math.round((to.getTime() - from.getTime()) / 86_400_000)
}

function daysWord(count: number): string {
  return `${count} ${count === 1 ? 'day' : 'days'}`
}

export function factorLabel(id: string): string {
  return (
    RELEVANCE_WEIGHTS.find((item) => item.id === id)?.label ??
    COMPANY_CHECKS.find((item) => item.id === id)?.label ??
    id
  )
}

export function partnerMeta(supplier: InvitedSupplier): string {
  if (supplier.tenderCount === 0) return `${supplier.partnerLabel} · no tenders yet`
  const word = supplier.tenderCount === 1 ? 'tender' : 'tenders'
  return `${supplier.partnerLabel} · ${supplier.tenderCount} ${word}`
}

export function isSubmitted(status: BidStatus): boolean {
  return status === 'offer_received' || status === 'partial_offer'
}

/** Overdue only when a promised date is on record and still in the past. */
export function isOverdue(supplier: InvitedSupplier, today: Date): boolean {
  if (!supplier.promisedSubmissionDate) return false
  if (supplier.bidStatus === 'offer_received' || supplier.bidStatus === 'declined') return false
  return calendarDaysBetween(supplier.promisedSubmissionDate, today) > 0
}

export function summaryParts(
  suppliers: InvitedSupplier[],
): Array<{ id: string; color: string; text: string }> {
  const invited = suppliers.length
  const submitted = suppliers.filter((supplier) => isSubmitted(supplier.bidStatus)).length
  const still = suppliers.filter((supplier) => supplier.bidStatus === 'bidding_no_date').length
  const silent = suppliers.filter((supplier) => supplier.bidStatus === 'no_response').length
  const declined = suppliers.filter((supplier) => supplier.bidStatus === 'declined').length
  const parts: Array<{ id: string; color: string; text: string }> = [
    {
      id: 'submitted',
      color: '#3D4654',
      text: `${submitted} of ${invited} suppliers have submitted pricing`,
    },
  ]
  if (still > 0) {
    parts.push({
      id: 'still',
      color: BID_STATUS_BAR.bidding_no_date.color,
      text: still === 1 ? '1 is still to submit' : `${still} are still to submit`,
    })
  }
  if (silent > 0) {
    parts.push({
      id: 'silent',
      color: BID_STATUS_BAR.no_response.color,
      text: silent === 1 ? '1 has not responded' : `${silent} have not responded`,
    })
  }
  if (declined > 0) {
    parts.push({
      id: 'declined',
      color: BID_STATUS_BAR.declined.color,
      text: declined === 1 ? '1 declined' : `${declined} declined`,
    })
  }
  return parts
}

export function summarySentence(suppliers: InvitedSupplier[]): string {
  const parts = summaryParts(suppliers)
  if (parts.length === 0) return ''
  const [head, ...rest] = parts
  return rest.length === 0 ? `${head.text}.` : `${head.text}. ${rest.map((part) => part.text).join(', ')}.`
}

export function statusCounts(suppliers: InvitedSupplier[]): Array<{ status: BidStatus; count: number }> {
  return BID_STATUS_ORDER.map((status) => ({
    status,
    count: suppliers.filter((supplier) => supplier.bidStatus === status).length,
  })).filter((entry) => entry.count > 0)
}

export function excludedCount(tender: MatchingTender): number {
  return tender.contacted - tender.metRequirements
}

export function bidStatusSupport(supplier: InvitedSupplier, audience: MatchingAudience): string {
  if (audience === 'customer') {
    if (supplier.bidStatus === 'no_response') {
      return supplier.invitationSentDate
        ? `Invited ${formatDayMonth(supplier.invitationSentDate)}`
        : 'Not on record'
    }
    if (supplier.bidStatus === 'bidding_no_date' && supplier.confirmedDate) {
      return `Confirmed ${formatDayMonth(supplier.confirmedDate)}`
    }
    return supplier.statusNote
  }
  if (supplier.bidStatus === 'no_response') {
    return supplier.invitationOpenedDate
      ? `Invitation opened ${formatDayMonth(supplier.invitationOpenedDate)}`
      : 'Invitation not opened'
  }
  if (supplier.bidStatus === 'bidding_no_date' && supplier.confirmedDate) {
    return `Confirmed ${formatDayMonth(supplier.confirmedDate)}, no submission yet`
  }
  return supplier.statusNote
}

export function responseDue(supplier: InvitedSupplier, today: Date): DatedLine {
  if (supplier.bidStatus === 'offer_received') {
    return {
      primary: 'Received',
      supporting: supplier.submittedDate
        ? `Submitted ${formatDayMonth(supplier.submittedDate)}`
        : 'Submitted date not on record',
    }
  }
  if (supplier.bidStatus === 'declined') {
    return {
      primary: 'Withdrawn',
      supporting: supplier.declinedDate
        ? `Declined ${formatDayMonth(supplier.declinedDate)}`
        : 'Declined date not on record',
    }
  }
  if (supplier.promisedSubmissionDate && isOverdue(supplier, today)) {
    const late = calendarDaysBetween(supplier.promisedSubmissionDate, today)
    return {
      primary: `Overdue by ${daysWord(late)}`,
      supporting: `Promised ${formatDayMonth(supplier.promisedSubmissionDate)}`,
    }
  }
  if (supplier.promisedSubmissionDate) {
    return {
      primary: formatDayMonth(supplier.promisedSubmissionDate),
      supporting: 'Promised date',
    }
  }
  if (supplier.invitationSentDate) {
    const since = Math.max(0, calendarDaysBetween(supplier.invitationSentDate, today))
    return {
      primary: 'No date set',
      supporting: `${daysWord(since)} since invitation`,
    }
  }
  return { primary: 'No date set', supporting: 'Invitation date not on record' }
}

export function pricingExpected(supplier: InvitedSupplier): DatedLine {
  if (supplier.bidStatus === 'offer_received') {
    return {
      primary: 'Received',
      supporting: supplier.submittedDate
        ? `Submitted ${formatDayMonth(supplier.submittedDate)}`
        : 'Submitted date not on record',
    }
  }
  if (supplier.bidStatus === 'partial_offer') {
    if (!supplier.promisedSubmissionDate) {
      return { primary: 'No date set', supporting: 'Not on record' }
    }
    return {
      primary: `Expected ${formatDayMonth(supplier.promisedSubmissionDate)}`,
      supporting: 'Remainder to follow',
    }
  }
  if (supplier.bidStatus === 'declined') {
    return {
      primary: 'Withdrawn',
      supporting: supplier.declinedDate
        ? `Declined ${formatDayMonth(supplier.declinedDate)}`
        : 'Declined date not on record',
    }
  }
  if (supplier.bidStatus === 'bidding_no_date') {
    return { primary: 'Date to confirm', supporting: '' }
  }
  return { primary: 'Awaiting reply', supporting: '' }
}

export type ReviewFlag = {
  supplierId: string
  supplierName: string
  text: string
}

export function reviewFlags(suppliers: InvitedSupplier[]): ReviewFlag[] {
  return suppliers.flatMap((supplier) => {
    const flags: ReviewFlag[] = []
    const missing = [...supplier.relevance, ...supplier.company].filter((factor) => factor.missing)
    if (missing.length > 0) {
      const names = missing.map((factor) => factorLabel(factor.id))
      const list = names.length === 1 ? names[0] : `${names.slice(0, -1).join(', ')} and ${names.at(-1)}`
      flags.push({
        supplierId: supplier.id,
        supplierName: supplier.name,
        text: `${list} ${names.length === 1 ? 'is' : 'are'} not on record, so ${names.length === 1 ? 'that score is' : 'those scores are'} misleading.`,
      })
    }
    if (supplier.completedTenders === 0 && supplier.companyScore != null) {
      flags.push({
        supplierId: `${supplier.id}-tenders`,
        supplierName: supplier.name,
        text: `Company score of ${formatScore(supplier.companyScore)} with no completed tenders to support it.`,
      })
    }
    return flags
  })
}

function chaseRank(supplier: InvitedSupplier, today: Date): number {
  if (supplier.bidStatus === 'declined') return 3
  if (supplier.bidStatus === 'offer_received') return 2
  if (isOverdue(supplier, today)) return 0
  return 1
}

export function sortForAudience(
  suppliers: InvitedSupplier[],
  audience: MatchingAudience,
  today: Date,
): InvitedSupplier[] {
  const indexed = suppliers.map((supplier, index) => ({ supplier, index }))
  if (audience === 'customer') {
    indexed.sort((a, b) => {
      const byScore = b.supplier.relevanceScore - a.supplier.relevanceScore
      return byScore !== 0 ? byScore : a.index - b.index
    })
  } else {
    indexed.sort((a, b) => {
      const byChase = chaseRank(a.supplier, today) - chaseRank(b.supplier, today)
      return byChase !== 0 ? byChase : a.index - b.index
    })
  }
  return indexed.map((entry) => entry.supplier)
}
