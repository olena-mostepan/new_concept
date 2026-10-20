'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'
import { Check, ChevronRight, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { OWNER_LABEL, SERVICES, service as serviceDef, type Account, type Batch, type Need, type Owner, type ServiceId, type Workstream } from '@/lib/concept/model'
import { batchSlots, changedRecently, doneCount, activeProjects, short } from '@/lib/concept/derive'

/* ------------------------------------------------------------------ type */

export const pageTitle = 'h4 text-text-primary'
export const sectionTitle = 's3 text-text-tertiary'
/** Group titles such as In progress, Needs your decision, Done. */
export const groupTitle = 'h5 text-text-primary'
export const th = 'px-5 py-3 text-left s3 text-text-tertiary'
export const td = 'px-5 py-3.5 align-top text-sm text-cq-text'
export const dot = <span className="mx-2 text-cq-muted">·</span>

export function Page({ children }: { children: ReactNode }) {
  return <div className="mx-auto w-full max-w-screen-2xl px-6 pt-8 sm:px-8 lg:px-10">{children}</div>
}

export function ChangedKey() {
  return (
    <p className="flex items-center gap-2 text-cq-text-secondary p6">
      <span className="h-[7px] w-[7px] rounded-full bg-cq-accent" aria-hidden />
      Changed in the last 7 days
    </p>
  )
}

export function workstreamSummary(list: Array<{ batchId: string; owner: string }>) {
  if (!list.length) return 'No workstreams match'
  const batches = new Set(list.map((w) => w.batchId)).size
  const done = list.filter((w) => w.owner === 'done').length
  const live = list.length - done
  const workstreams = list.length === 1 ? 'workstream' : 'workstreams'
  const batchWord = batches === 1 ? 'batch' : 'batches'
  return `${list.length} ${workstreams} across ${batches} ${batchWord} · ${live} in progress · ${done} done`
}

/** Count line at the far right, with the changed key directly under it. */
export function ChapterAside({ summary }: { summary: string }) {
  return (
    <div className="flex flex-col items-end gap-1.5 text-right">
      <p className="text-sm text-cq-text-secondary">{summary}</p>
      <ChangedKey />
    </div>
  )
}

/** 7px dot, 12px to the left of the name. The name stays put. */
export function ChangedMark({ w, children }: { w: Workstream; children: ReactNode }) {
  return (
    <span className="relative inline-flex items-center">
      {changedRecently(w) && (
        <span role="img" aria-label="Changed in the last 7 days" className="absolute right-full top-1/2 mr-3 h-[7px] w-[7px] -translate-y-1/2 rounded-full bg-cq-accent" />
      )}
      {children}
    </span>
  )
}

export function PageHeader({
  crumbs,
  title,
  meta,
  actions,
  legend,
}: {
  crumbs?: Array<{ label: string; href?: string }>
  title: ReactNode
  meta?: ReactNode
  actions?: ReactNode
  legend?: ReactNode
}) {
  return (
    <div className="mb-7">
      {crumbs && crumbs.length > 0 && (
        <nav className="mb-2 flex flex-wrap items-center gap-1 text-sm text-cq-text-secondary">
          {crumbs.map((c, i) => (
            <span key={i} className="inline-flex items-center gap-1">
              {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-cq-muted" aria-hidden />}
              {c.href ? (
                <Link href={c.href} className="hover:text-cq-text">
                  {c.label}
                </Link>
              ) : (
                <span>{c.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className={pageTitle}>{title}</h1>
          {(meta || legend) && (
            <div className="mt-1.5 flex items-center gap-4">
              {meta && <div className="text-sm text-cq-text-secondary">{meta}</div>}
              {legend && <div className="ml-auto shrink-0">{legend}</div>}
            </div>
          )}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-3">{actions}</div>}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ card */

export function Card({
  title,
  right,
  children,
  className,
  bodyClassName,
}: {
  title?: ReactNode
  right?: ReactNode
  children: ReactNode
  className?: string
  bodyClassName?: string
}) {
  return (
    <section className={cn('overflow-hidden rounded-xl border border-cq-border bg-white shadow-sm', className)}>
      {(title || right) && (
        <header className="flex items-center justify-between gap-3 border-b border-cq-border-light px-5 py-4">
          {title && <h2 className="h7 text-text-primary">{title}</h2>}
          {right && <div className="text-sm text-cq-text-secondary">{right}</div>}
        </header>
      )}
      <div className={cn('p-5', bodyClassName)}>{children}</div>
    </section>
  )
}

export function CardLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="text-sm font-normal text-cq-text underline underline-offset-4 hover:text-cq-accent">
      {children}
    </Link>
  )
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="text-sm text-cq-text-secondary">{children}</p>
}

/* --------------------------------------------------------------- status */

const OWNER_STYLE: Record<Owner, string> = {
  you: 'bg-[var(--cq-accent-muted)] text-[var(--cq-accent)]',
  cquel: 'border border-[var(--cq-owner-cquel-border)] bg-[var(--cq-owner-cquel-bg)] text-cq-owner-cquel',
  suppliers: 'bg-[var(--cq-link)]/10 text-[var(--cq-link)]',
  done: 'bg-cq-bg text-cq-text-secondary',
}

export function OwnerPill({ owner, label, className }: { owner: Owner; label?: string; className?: string }) {
  return (
    <span className={cn('inline-flex w-fit shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-normal', OWNER_STYLE[owner], className)}>
      {owner === 'done' && <Check className="h-3 w-3" strokeWidth={2.5} aria-hidden />}
      {label ?? OWNER_LABEL[owner]}
    </span>
  )
}

export const ownerText: Record<Owner, string> = {
  you: 'text-cq-owner-you',
  cquel: 'text-cq-owner-cquel',
  suppliers: 'text-cq-owner-suppliers',
  done: 'text-cq-text-secondary',
}

export { ServiceTag } from './ServiceTag'

export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex w-fit shrink-0 whitespace-nowrap rounded-md border border-cq-border bg-cq-bg px-2 py-0.5 text-xs font-normal text-cq-text-secondary">
      {children}
    </span>
  )
}

/** Thin progress bar: done share in ink, rest light */
export function Bar({ done, total, tone = 'ink', className }: { done: number; total: number; tone?: 'ink' | 'accent'; className?: string }) {
  const pct = total ? Math.round((done / total) * 100) : 0
  return (
    <div className={cn('h-1.5 w-full overflow-hidden rounded-full bg-cq-border-light', className)}>
      <div className={cn('h-full rounded-full', tone === 'ink' ? 'bg-cq-text' : 'bg-cq-accent')} style={{ width: `${pct}%` }} />
    </div>
  )
}

/* ---------------------------------------------------------------- route */

/**
 * A batch's route: Getting started, then every service. Services outside the
 * route show as "Not needed" so the layout stays the same for every batch.
 */
export function Route({ account, batch, highlight }: { account: Account; batch: Batch; highlight?: ServiceId }) {
  const slots = batchSlots(account, batch)
  const kickoff = batch.planState !== 'live'
  const firstPlanned = slots.find((s) => s.inRoute && s.state === 'planned')?.service
  const cols = [
    {
      key: 'start',
      label: 'Getting started',
      state: kickoff ? 'now' : 'done',
      lines: kickoff ? ['Now · plan ready'] : [`Agreed ${short(batch.planAgreed)}`],
      done: kickoff ? 2 : 3,
      total: 3,
    },
    ...slots.map((s) => {
      const label = serviceDef(s.service).label
      if (s.state === 'skip') return { key: s.service, label: s.service === 'tender' || s.service === 'pricing' ? `or ${label}` : label, state: 'skip', lines: ['Not needed'], done: 0, total: 0 }
      if (s.state === 'done') return { key: s.service, label, state: 'done', lines: [`Done · ${s.total} projects`], done: 1, total: 1 }
      if (s.state === 'now') return { key: s.service, label, state: 'now', lines: [`${s.done} of ${s.total} done`], done: s.done, total: s.total }
      return { key: s.service, label, state: 'planned', lines: [kickoff && s.service === firstPlanned ? 'Next' : 'Planned'], done: 0, total: 0 }
    }),
  ]
  return (
    <ol className="grid grid-cols-3 gap-x-3 gap-y-5 md:grid-cols-6">
      {cols.map((c) => (
        <li key={c.key} className={cn('min-w-0 rounded-lg', highlight === c.key && 'bg-cq-bg p-2 -m-2 ring-1 ring-cq-border')}>
          <p className={cn('mb-2 truncate text-sm', c.state === 'skip' ? 'text-cq-muted' : 'font-semibold text-cq-text')}>{c.label}</p>
          <div
            className={cn(
              'h-2.5 overflow-hidden rounded-full',
              c.state === 'done' && 'bg-cq-text',
              c.state === 'now' && 'bg-[var(--cq-accent-muted-strong)]',
              c.state === 'planned' && 'bg-cq-border-light',
              c.state === 'skip' && 'border border-dashed border-cq-border bg-white',
            )}
          >
            {c.state === 'now' && <div className="h-full rounded-full bg-cq-accent" style={{ width: `${Math.max(8, c.total ? (c.done / c.total) * 100 : 0)}%` }} />}
          </div>
          {c.lines.map((l, i) => (
            <p key={i} className={cn('mt-2 text-xs', i === 0 && c.state === 'now' ? 'font-semibold text-cq-text' : i === 0 && c.state !== 'skip' ? 'text-cq-text-secondary' : 'text-cq-muted', i > 0 && 'mt-0.5 text-cq-text-secondary')}>
              {l}
            </p>
          ))}
        </li>
      ))}
    </ol>
  )
}

/* ---------------------------------------------------------------- steps */

/** Where this workstream's projects sit in its service's steps */
export function Steps({ w }: { w: Workstream }) {
  const def = serviceDef(w.service)
  const live = activeProjects(w)
  const counts = def.steps.map((_, i) => live.filter((p) => p.step === i).length)
  const minStep = live.length ? Math.min(...live.map((p) => p.step)) : 0
  const allDone = w.owner === 'done'
  return (
    <ol className="grid gap-3" style={{ gridTemplateColumns: `repeat(${def.steps.length}, minmax(0, 1fr))` }}>
      {def.steps.map((label, i) => {
        const passed = allDone || i < minStep
        const here = !allDone && counts[i] > 0
        return (
          <li key={label}>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border p7',
                  passed && 'border-cq-text bg-cq-text text-white',
                  here && 'border-cq-accent bg-white text-cq-accent ring-2 ring-[var(--cq-accent-muted)]',
                  !passed && !here && 'border-cq-border bg-white text-cq-muted',
                )}
              >
                {passed ? <Check className="h-3 w-3" strokeWidth={3} aria-hidden /> : i + 1}
              </span>
              {i < def.steps.length - 1 && <span className={cn('h-px flex-1', passed ? 'bg-cq-text' : 'bg-cq-border')} />}
            </div>
            <p className={cn('mt-2 text-sm', passed || here ? 'text-cq-text' : 'text-cq-muted', here && 'font-semibold')}>{label}</p>
            {here && (
              <p className="text-xs text-cq-text-secondary">
                {counts[i]} {counts[i] === 1 ? 'project' : 'projects'}
              </p>
            )}
          </li>
        )
      })}
    </ol>
  )
}

/* ---------------------------------------------------------------- needs */

/**
 * What the current stage needs. Open items from the customer come first and are
 * highlighted; items CQuel or suppliers are getting are shown as taken care of;
 * received items fold to the bottom.
 */
export function NeedRow({ n, tag, action = true }: { n: Need; tag?: ReactNode; action?: boolean }) {
  const yours = !n.received && n.owner === 'you'
  return (
    <li className={cn('flex items-start justify-between gap-4 rounded-lg border px-4 py-3', yours ? 'border-cq-accent/40 bg-[var(--cq-accent-muted)]' : 'border-cq-border-light bg-white', n.received && 'bg-cq-bg')}>
      <div className="flex min-w-0 gap-3">
        {n.received ? (
          <Check className="mt-0.5 h-4 w-4 shrink-0 text-cq-text-secondary" aria-hidden />
        ) : (
          <Circle className={cn('mt-0.5 h-4 w-4 shrink-0', yours ? 'text-cq-owner-you' : 'text-cq-muted')} aria-hidden />
        )}
        <div className="min-w-0">
          <p className={cn('text-sm font-normal', n.received ? 'text-cq-text-secondary' : 'text-cq-text')}>{n.label}</p>
          <p className="mt-0.5 text-xs text-cq-text-secondary">
            {tag}
            {tag && ' · '}
            {n.received ? `Received ${short(n.received)}` : n.why}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        {!n.received && (yours ? action ? <a className="btn-link" href="mailto:">Reply by email</a> : <OwnerPill owner="you" /> : <OwnerPill owner={n.owner} />)}
      </div>
    </li>
  )
}

export function sortNeeds<T extends { need: Need }>(items: T[]) {
  const order = (n: Need) => (n.received ? 3 : n.owner === 'you' ? 0 : n.owner === 'cquel' ? 1 : 2)
  return [...items].sort((a, b) => order(a.need) - order(b.need))
}

export function Needs({ needs }: { needs: Need[] }) {
  const sorted = sortNeeds(needs.map((need) => ({ need }))).map((x) => x.need)
  if (!sorted.length) return <Empty>Nothing from you.</Empty>
  return (
    <ul className="space-y-2">
      {sorted.map((n) => (
        <NeedRow key={n.label} n={n} />
      ))}
    </ul>
  )
}

export const workstreamLabel = (w: Workstream) => w.name

export { SERVICES, doneCount }
