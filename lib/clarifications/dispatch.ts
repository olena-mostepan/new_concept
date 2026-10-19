import type { Clarification } from './types'

/** All instances from the same Raise-clarification submit, stable order for prev/next. */
export function getDispatchSiblings(
  items: Clarification[],
  dispatchId: string,
): Clarification[] {
  return items
    .filter((c) => c.dispatchId === dispatchId)
    .sort((a, b) =>
      a.bidLabel.localeCompare(b.bidLabel, undefined, { numeric: true }),
    )
}

export function getDispatchSiblingNav(
  siblings: Clarification[],
  currentId: string,
): {
  index: number
  total: number
  prev: Clarification | null
  next: Clarification | null
} {
  const index = siblings.findIndex((c) => c.id === currentId)
  const total = siblings.length
  return {
    index,
    total,
    prev: index > 0 ? siblings[index - 1]! : null,
    next: index >= 0 && index < total - 1 ? siblings[index + 1]! : null,
  }
}
