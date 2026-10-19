import type { Clarification, Section } from './types'
import {
  sectionFromPerspective,
  type Perspective,
} from './perspective'

export type DispatchGroup = {
  dispatchId: string
  title: string
  question: string
  project: string
  raisedAgo: string
  members: Clarification[]
  answeredCount: number
  totalCount: number
  lastSubmissionAgo: string | null
  /** Supplier who submitted the most recent answer in this dispatch. */
  lastSubmissionSupplier: string | null
  /** Higher = more recently answered (or raised if none answered). */
  lastActivitySortKey: number
}

function parseTimeAgoToMs(ago: string): number | null {
  const t = ago.trim().toLowerCase()
  if (t === 'just now') return 0
  const m = t.match(
    /^(\d+)\s*(m|min|mins|minute|minutes|h|hr|hrs|hour|hours|d|day|days|w|week|weeks)\s*ago$/,
  )
  if (!m) return null
  const n = parseInt(m[1]!, 10)
  const u = m[2]!
  if (u.startsWith('m')) return n * 60_000
  if (u.startsWith('h')) return n * 3_600_000
  if (u.startsWith('d')) return n * 86_400_000
  if (u.startsWith('w')) return n * 604_800_000
  return null
}

/** More recent relative times sort higher. */
export function timeAgoToSortKey(ago: string): number {
  const ms = parseTimeAgoToMs(ago)
  if (ms === null) return Number.NEGATIVE_INFINITY
  return -ms
}

export function groupClarificationsByDispatch(
  items: Clarification[],
): DispatchGroup[] {
  const byDispatch = new Map<string, Clarification[]>()
  for (const item of items) {
    const list = byDispatch.get(item.dispatchId) ?? []
    list.push(item)
    byDispatch.set(item.dispatchId, list)
  }

  const groups: DispatchGroup[] = []
  for (const [dispatchId, members] of byDispatch) {
    const sortedMembers = [...members].sort((a, b) =>
      a.bidLabel.localeCompare(b.bidLabel, undefined, { numeric: true }),
    )
    const lead = sortedMembers[0]!
    const withReply = sortedMembers.filter((m) => m.reply)
    const answeredCount = withReply.length
    const replySortKeys = withReply.map((m) =>
      timeAgoToSortKey(m.reply!.timeAgo),
    )
    const lastSubmissionSortKey =
      replySortKeys.length > 0
        ? Math.max(...replySortKeys)
        : Number.NEGATIVE_INFINITY

    const mostRecentReply = withReply.reduce<Clarification | null>((best, m) => {
      if (!best?.reply) return m
      if (!m.reply) return best
      return timeAgoToSortKey(m.reply.timeAgo) >
        timeAgoToSortKey(best.reply.timeAgo)
        ? m
        : best
    }, null)

    const lastActivitySortKey =
      lastSubmissionSortKey > Number.NEGATIVE_INFINITY
        ? lastSubmissionSortKey
        : timeAgoToSortKey(lead.raisedAgo)

    groups.push({
      dispatchId,
      title: lead.title,
      question: lead.question,
      project: lead.project,
      raisedAgo: lead.raisedAgo,
      members: sortedMembers,
      answeredCount,
      totalCount: sortedMembers.length,
      lastSubmissionAgo: mostRecentReply?.reply?.timeAgo ?? null,
      lastSubmissionSupplier: mostRecentReply?.supplier ?? null,
      lastActivitySortKey,
    })
  }

  return groups
}

export function sectionForDispatchGroup(
  group: DispatchGroup,
  perspective: Perspective,
): Section {
  const sections = group.members.map((m) =>
    sectionFromPerspective(m, perspective),
  )
  if (sections.includes('needs_attention')) return 'needs_attention'
  if (sections.includes('in_progress')) return 'in_progress'
  return 'done'
}

export function sortDispatchGroupsByLastActivity(
  groups: DispatchGroup[],
): DispatchGroup[] {
  return [...groups].sort((a, b) => {
    if (b.lastActivitySortKey !== a.lastActivitySortKey) {
      return b.lastActivitySortKey - a.lastActivitySortKey
    }
    return timeAgoToSortKey(b.raisedAgo) - timeAgoToSortKey(a.raisedAgo)
  })
}

export function partitionDispatchGroups(
  groups: DispatchGroup[],
  perspective: Perspective,
): Record<Section, DispatchGroup[]> {
  const buckets: Record<Section, DispatchGroup[]> = {
    needs_attention: [],
    in_progress: [],
    done: [],
  }
  for (const group of groups) {
    buckets[sectionForDispatchGroup(group, perspective)].push(group)
  }
  return {
    needs_attention: sortDispatchGroupsByLastActivity(
      buckets.needs_attention,
    ),
    in_progress: sortDispatchGroupsByLastActivity(buckets.in_progress),
    done: sortDispatchGroupsByLastActivity(buckets.done),
  }
}

/** Ops review / supplier reply entry for a dispatch row. */
export function primaryMemberForDispatchGroup(
  group: DispatchGroup,
  perspective: Perspective,
): Clarification {
  const needs = group.members.filter(
    (m) => sectionFromPerspective(m, perspective) === 'needs_attention',
  )
  const pool = needs.length > 0 ? needs : group.members
  const withReply = pool.filter((m) => m.reply)
  if (withReply.length > 0) {
    return withReply.reduce((best, m) =>
      timeAgoToSortKey(m.reply!.timeAgo) > timeAgoToSortKey(best.reply!.timeAgo)
        ? m
        : best,
    )
  }
  return pool[0]!
}

export function answeredSummaryLabel(answered: number, total: number): string {
  return `${answered} of ${total} answered`
}

export function dispatchSupplierSummaryLabel(group: DispatchGroup): string {
  if (group.totalCount === 1) {
    return group.members[0]!.supplier
  }
  return answeredSummaryLabel(group.answeredCount, group.totalCount)
}

export function lastAnswerLabel(group: DispatchGroup): string {
  if (!group.lastSubmissionAgo) return 'No answers yet'
  if (group.totalCount > 1 && group.lastSubmissionSupplier) {
    return `Last answer ${group.lastSubmissionAgo} by ${group.lastSubmissionSupplier}`
  }
  return `Last answer ${group.lastSubmissionAgo}`
}
