import type { Account, MoveKind, ProjectRow, Workstream } from './model'
import { getWorkstream, resolveMoveDestination, short } from './derive'

/** Lowercase how for "Left <date> · <how>". */
export function leftHowLabel(kind: MoveKind): string {
  switch (kind) {
    case 'split':
      return 'split'
    case 'moved':
      return 'moved'
    case 'continued':
      return 'continued'
    case 'tendered_again':
      return 'tendered again'
    case 'not_chosen':
      return 'not chosen'
    case 'dropped':
      return 'dropped'
  }
}

/** In package fact (asset header): one line only, same words as IN PACKAGE column part 1. */
export function inPackageFactLine(account: Account, w: Workstream, row: ProjectRow): string {
  const started = w.startedOn ? short(w.startedOn) : '—'
  if (row.joined?.on) return `Joined ${short(row.joined.on)}`
  if (row.hold?.since) return `On hold since ${short(row.hold.since)}`
  if (row.left) {
    return `Left ${short(row.left.on)} · ${leftHowLabel(row.left.kind)}`
  }
  return `Since ${started}`
}

/**
 * Package page IN PACKAGE column: first line + optional second line (other package name only).
 */
export function inPackageColumnLines(
  account: Account,
  w: Workstream,
  project: ProjectRow,
): { line1: string; line2?: string } {
  const startedLabel = w.startedOn ? short(w.startedOn) : '—'
  if (project.joined?.on) {
    const line1 = `Joined ${short(project.joined.on)}`
    let line2: string | undefined
    if (project.joined.from) {
      const fromWs = getWorkstream(account, project.joined.from)
      if (fromWs) line2 = fromWs.name
    }
    return { line1, line2 }
  }
  if (project.hold?.since) {
    return { line1: `On hold since ${short(project.hold.since)}` }
  }
  if (project.left) {
    const line1 = `Left ${short(project.left.on)} · ${leftHowLabel(project.left.kind)}`
    let line2: string | undefined
    if (project.left.to) line2 = resolveMoveDestination(account, project.left.to)
    return { line1, line2 }
  }
  return { line1: `Since ${startedLabel}` }
}
