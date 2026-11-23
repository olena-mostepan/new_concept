import { service, type Account, type MoveKind, type ProjectRow, type Workstream } from './model'
import { getWorkstream, resolveMoveDestination, short } from './derive'
import { t, type Lang } from './i18n'

/** Lowercase ending for "Ended <date> · <ending>". Empty for a package that hasn't ended. */
export function endingWord(account: Account, w: Workstream, lang: Lang = 'en'): string {
  const e = w.ending
  if (!e) return ''
  if (e.kind === 'outside') return t(lang, 'supplier outside CQuel')
  if (e.kind === 'not_going_ahead') return t(lang, 'not going ahead')
  const to = e.to ? getWorkstream(account, e.to) : undefined
  const label = to ? t(lang, service(to.service).label) : ''
  return t(lang, 'continued in {0}', lang === 'en' ? label.toLowerCase() : label)
}

/** Sentence-case ending for the batch Packages tab and the asset row outcome. */
export function endingTitle(account: Account, w: Workstream, lang: Lang = 'en'): string {
  const e = w.ending
  if (!e) return ''
  if (e.kind === 'outside') return t(lang, 'Supplier chosen outside CQuel')
  if (e.kind === 'not_going_ahead') return t(lang, 'Not going ahead')
  const to = e.to ? getWorkstream(account, e.to) : undefined
  return t(lang, 'Continued in {0}', to ? t(lang, service(to.service).label) : '')
}

/** Asset row outcome on the batch Assets tab: "Tender · supplier outside CQuel". */
export function endingRowLine(account: Account, w: Workstream, lang: Lang = 'en'): string {
  return `${t(lang, service(w.service).label)} · ${endingWord(account, w, lang)}`
}

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
    case 'not_going_ahead':
      return 'not going ahead'
  }
}

/** In package fact (asset header): one line only, same words as IN PACKAGE column part 1. */
export function inPackageFactLine(account: Account, w: Workstream, row: ProjectRow, lang: Lang = 'en'): string {
  const started = w.startedOn ? short(w.startedOn) : '—'
  if (w.ending && w.ending.kind !== 'continued' && !row.left) {
    return t(lang, 'Ended {0} · {1}', short(w.ending.on, lang), endingWord(account, w, lang))
  }
  if (w.from?.kind === 'continued' && !row.joined && !row.left) {
    return t(lang, 'Since {0}', short(w.from.on, lang))
  }
  if (row.left?.kind === 'not_going_ahead') {
    return t(lang, 'Ended {0} · {1}', short(row.left.on, lang), t(lang, 'not going ahead'))
  }
  if (row.left?.kind === 'continued') {
    const to = row.left.to ? getWorkstream(account, row.left.to) : undefined
    const label = to ? t(lang, service(to.service).label) : ''
    return t(lang, 'Continued {0} · in {1}', short(row.left.on, lang), label)
  }
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
  if (w.ending && w.ending.kind !== 'continued' && !project.left) {
    return { line1: `Ended ${short(w.ending.on)}`, line2: endingWord(account, w) }
  }
  if (project.left?.kind === 'continued') {
    const to = project.left.to ? getWorkstream(account, project.left.to) : undefined
    return { line1: `Continued ${short(project.left.on)}`, line2: to ? `in ${service(to.service).label}` : undefined }
  }
  if (project.left?.kind === 'not_going_ahead') {
    return { line1: `Ended ${short(project.left.on)}`, line2: 'not going ahead' }
  }
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
