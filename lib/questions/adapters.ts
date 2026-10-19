import type { Clarification } from '@/lib/clarifications/types'
import {
  clarificationsForTenderSlug,
  type ClarificationsProjectSlug,
} from '@/lib/clarifications/mock-data'
import { groupClarificationsByDispatch } from '@/lib/clarifications/dispatch-groups'
import type { AnswerStatus, SupplierAnswer, TenderQuestion } from './types'
import { agoToIso } from './time'
import { tenderSuppliersForSlug } from './tender-suppliers'

function shortSupplierName(name: string): string {
  if (name.length <= 14) return name
  const first = name.split(' ')[0]
  return first && first.length <= 12 ? first : name.slice(0, 12)
}

function memberToAnswerStatus(m: Clarification): AnswerStatus {
  if (m.reply?.text) return 'answered'
  if (m.status === 'awaiting') return 'awaiting'
  return 'not_asked'
}

export function clarificationsToTenderQuestions(
  items: Clarification[],
  slug: ClarificationsProjectSlug,
): TenderQuestion[] {
  const tenderItems = clarificationsForTenderSlug(items, slug)
  const groups = groupClarificationsByDispatch(tenderItems)

  return groups.map((g) => {
    const answers: SupplierAnswer[] = g.members.map((m) => {
      const status = memberToAnswerStatus(m)
      return {
        supplierId: m.supplierId ?? m.supplier,
        supplierName: shortSupplierName(m.supplier),
        status,
        answerText:
          status === 'answered' && m.reply?.text ? m.reply.text.trim() : undefined,
        ageLabel: m.reply?.timeAgo,
        attachments: m.reply?.attachments,
        hasAttachment: Boolean(m.reply?.attachments?.length),
        clarificationId: m.id,
      }
    })

    const lead = g.members[0]!
    return {
      id: `supplier-${g.dispatchId}`,
      questionText: g.question,
      type: 'supplier',
      tenderSlug: slug,
      createdAt: agoToIso(g.raisedAgo),
      ageLabel: g.raisedAgo,
      answers,
      detailClarificationId: lead.id,
    }
  })
}

export function mergeTenderQuestions(
  slug: ClarificationsProjectSlug,
  aiQuestions: TenderQuestion[],
  clarifications: Clarification[],
): TenderQuestion[] {
  const ai = aiQuestions.filter((q) => q.tenderSlug === slug)
  const supplier = clarificationsToTenderQuestions(clarifications, slug)
  return [...ai, ...supplier].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )
}

export function countUniqueSuppliers(questions: TenderQuestion[]): number {
  const ids = new Set<string>()
  for (const q of questions) {
    for (const a of q.answers) {
      if (a.status !== 'not_asked') ids.add(a.supplierId)
    }
  }
  if (ids.size === 0) {
    return tenderSuppliersForSlug(questions[0]?.tenderSlug ?? 'solar').length
  }
  return ids.size
}

/** Mock AI extraction for a newly asked question. */
export function mockAiAnswersForQuestion(
  slug: ClarificationsProjectSlug,
  questionText: string,
): SupplierAnswer[] {
  const suppliers = tenderSuppliersForSlug(slug)
  const snippets = [
    'Stated in pricing schedule section 4.2',
    'Not explicitly mentioned in bid PDF',
    'See equipment schedule — page 12',
    'Included in technical submission',
    'Referenced in O&M appendix',
    'Mentioned in cover letter only',
  ]
  return suppliers.map((s, i) => ({
    supplierId: s.id,
    supplierName: shortSupplierName(s.name),
    status: i % 5 === 0 ? ('awaiting' as const) : ('answered' as const),
    answerText:
      i % 5 === 0
        ? undefined
        : `${snippets[i % snippets.length]!} — re: ${questionText}`,
    ageLabel: 'just now',
  }))
}
