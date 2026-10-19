import type { SupplierAnswer, TenderQuestion } from './types'

/** Bid extraction missing — shown as "Missing from bid". */
export function answerNeedsSupplierAsk(a: SupplierAnswer): boolean {
  return a.status === 'awaiting'
}

export function answersNeedingSupplier(question: TenderQuestion): SupplierAnswer[] {
  return question.answers.filter(answerNeedsSupplierAsk)
}

/** Ops can dispatch a clarification ask (excludes sent / not on list). */
export function answerCanBeAsked(a: SupplierAnswer): boolean {
  return a.status !== 'sent' && a.status !== 'not_asked'
}

export function answersAskable(question: TenderQuestion): SupplierAnswer[] {
  return question.answers.filter(answerCanBeAsked)
}
