import type { Clarification, Section, Status } from './types'
import { DEMO_SUPPLIER_ID, DEMO_SUPPLIER_NAME } from './mock-data'

export type Perspective = 'ops' | 'supplier'

/**
 * Maps stored status → whose court (semantic), per viewer.
 * `your` / `their` are resolved to labels via `courtLabel`.
 */
export function courtFromPerspective(
  c: Clarification,
  p: Perspective,
): 'your' | 'their' | null {
  if (c.status === 'applied' || c.status === 'closed') return null

  if (p === 'ops') {
    switch (c.status) {
      case 'awaiting':
        return 'their'
      case 'review':
      case 'need_response':
        return 'your'
      default:
        return null
    }
  }

  switch (c.status) {
    case 'awaiting':
      return 'your'
    case 'review':
    case 'need_response':
      return 'their'
    default:
      return null
  }
}

export function courtLabel(court: 'your' | 'their' | null, p: Perspective): string {
  if (court === null) return ''
  if (court === 'your') return 'Your Court'
  return p === 'supplier' ? 'CQuel Court' : 'Supplier Court'
}

export function statusLabelFromPerspective(
  status: Status,
  perspective: Perspective,
): string {
  if (perspective === 'ops') {
    switch (status) {
      case 'awaiting':
        return 'awaiting reply'
      case 'review':
        return 'review'
      case 'need_response':
        return 'need to respond'
      case 'applied':
        return 'accepted'
      case 'closed':
        return 'closed'
    }
  }
  switch (status) {
    case 'awaiting':
      return 'awaiting'
    case 'review':
      return 'answered'
    case 'need_response':
      return 'Need more info'
    case 'applied':
      return 'accepted'
    case 'closed':
      return 'closed'
  }
}

export function sectionFromPerspective(
  c: Clarification,
  p: Perspective,
): Section {
  if (c.status === 'applied' || c.status === 'closed') return 'done'
  const court = courtFromPerspective(c, p)
  if (court === null) return 'done'
  return court === 'your' ? 'needs_attention' : 'in_progress'
}

export function isVisibleToDemoSupplier(
  c: Clarification,
  supplierId: string,
): boolean {
  if (c.supplierId === supplierId) return true
  if (
    supplierId === DEMO_SUPPLIER_ID &&
    c.supplierId == null &&
    c.supplier === DEMO_SUPPLIER_NAME
  ) {
    return true
  }
  return false
}
