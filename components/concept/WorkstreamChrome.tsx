'use client'

import { useEffect, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Info, X } from 'lucide-react'
import { service, SOLUTIONS, type Phase, type SolutionId, type Workstream } from '@/lib/concept/model'
import { currentPhase, getBatch, moneyOne, presentedTotal, pricingTotal, proposedStart, selectedPhase, short, surveyLine, totalCapacity, workstreamMeta } from '@/lib/concept/derive'
import { cn } from '@/lib/utils'
import { Card, CardLink, PageHeader } from './ui'
import { StatusPill } from './StatusPill'
import { hrefs } from './hrefs'
import { useConcept } from './store'

const SOLUTION_NAME: Record<SolutionId, string> = {
  led: 'LED',
  solar: 'Solar PV',
  ev: 'EV charging',
  ashp: 'Heat pumps',
  generic: SOLUTIONS.generic,
}

export function TabDot() {
  return <span role="img" aria-label="New" className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-brand-6" />
}

const COLS = ['', 'sm:grid-cols-1', 'sm:grid-cols-2', 'sm:grid-cols-3', 'sm:grid-cols-4', 'sm:grid-cols-5']

/** Drop the full stop, and use a middle dot where the copy used a dash or a colon. */
export function shortFact(text: string): string {
  return text.replace(/\s*[—–]\s*/g, ' · ').replace(/:\s+/g, ' · ').replace(/\.\s*$/, '')
}

export function WorkstreamHeader({ w }: { w: Workstream }) {
  const { account } = useConcept()
  const searchParams = useSearchParams()
  const [info, setInfo] = useState(false)
  const batch = getBatch(account, w.batchId)
  const fromService = searchParams.get('from') === 'service'
  const crumbs = fromService
    ? [{ label: service(w.service).label, href: hrefs.service(w.service) }, { label: w.name }]
    : [
        { label: 'Batches', href: hrefs.batches },
        { label: batch?.name ?? 'Batch', href: batch ? hrefs.batch(batch.id) : undefined },
        { label: w.name },
      ]
  return (
    <>
      <PageHeader
        className="mb-6"
        crumbs={crumbs}
        title={w.name}
        meta={<span className="p6 text-text-secondary">{workstreamMeta(w, batch?.name)}</span>}
        actions={
          <>
            {w.owner === 'you' && <StatusPill owner="you" />}
            <button type="button" className="btn-secondary" onClick={() => setInfo(true)}>
              <Info className="h-4 w-4" aria-hidden />
              See info
            </button>
          </>
        }
      />
      <InfoDrawer w={w} batchName={batch?.name ?? 'Batch'} open={info} onClose={() => setInfo(false)} />
    </>
  )
}

function infoRows(w: Workstream, batchName: string): Array<{ label: string; value: string }> {
  const phase = currentPhase(w)
  const since = phase.startedOn ? ` · since ${short(phase.startedOn)}` : ''
  const later = w.phases.slice(w.phases.findIndex((item) => item.service === phase.service) + 1)
  const next = later.map((item) => service(item.service).label)
  const dropped = w.projects.filter((project) => project.dropped).length
  const rows: Array<{ label: string; value: string }> = [
    { label: 'Batch', value: batchName },
    { label: 'Solution', value: SOLUTION_NAME[w.solution] },
    { label: 'Current service', value: `${service(w.service).label}${since}` },
  ]
  if (next.length === 1) rows.push({ label: 'Next services', value: next[0] })
  if (next.length > 1) rows.push({ label: 'Next services', value: `${next.slice(0, -1).join(', ')}, then ${next[next.length - 1]}` })
  rows.push({
    label: 'Projects',
    value: dropped ? `${w.projects.length} · ${dropped} not proceeding` : String(w.projects.length),
  })
  if (w.service === 'indicative') {
    const total = presentedTotal(w)
    if (total.count) rows.push({ label: 'Estimated cost', value: `${total.text} · ${total.count} estimated` })
  } else if (w.service === 'tender') {
    const size = totalCapacity(w)
    if (size) rows.push({ label: 'Total size', value: size })
  } else if (w.service === 'delivery' && w.deliveryProfile?.contractValue) {
    rows.push({ label: 'Contract value', value: moneyOne(w.deliveryProfile.contractValue) })
  } else if (w.service === 'scope') {
    const fact = surveyLine(w).split(' — ')[0]
    if (fact) rows.push({ label: 'Surveys', value: fact })
  } else if (w.service === 'pricing') {
    const total = pricingTotal(w)
    if (total) rows.push({ label: 'Price', value: moneyOne(total) })
  }
  rows.push({
    label: 'Done when',
    value: w.service === 'indicative' ? 'You have decided on every project' : service(w.service).done,
  })
  return rows
}

function InfoDrawer({ w, batchName, open, onClose }: { w: Workstream; batchName: string; open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-40" role="presentation">
      <button type="button" className="absolute inset-0 cursor-default" style={{ backgroundColor: 'rgba(30,40,50,.25)' }} aria-label="Close info" onClick={onClose} />
      <aside className="absolute inset-y-0 right-0 flex w-[400px] max-w-full flex-col bg-white shadow-xl" role="dialog" aria-label={`${w.name} · info`}>
        <div className="flex items-start justify-between gap-3 px-6 py-5">
          <h2 className="h7 text-text-primary">{w.name} · info</h2>
          <button type="button" className="inline-flex h-8 w-8 items-center justify-center text-text-tertiary hover:text-text-primary" aria-label="Close" onClick={onClose}>
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6">
          {infoRows(w, batchName).map((row) => (
            <div key={row.label} className="border-t border-border-light py-3">
              <p className="p7 text-text-tertiary">{row.label}</p>
              <p className="p6 text-text-primary">{row.value}</p>
            </div>
          ))}
          <Link href={hrefs.batch(w.batchId)} className="mt-2 inline-block py-3 p6 font-semibold text-text-primary">
            View batch
          </Link>
        </div>
      </aside>
    </div>
  )
}

function caption(phase: Phase, nextUp: boolean): string {
  if (phase.state === 'planned') return nextUp ? 'Next' : 'Later'
  if (phase.state === 'now') return phase.startedOn ? `Now · since ${short(phase.startedOn)}` : 'Now'
  const when = short(phase.completedOn)
  const finished = when ? `Finished ${when}` : 'Finished'
  return phase.outcome ? `${finished} · ${phase.outcome}` : finished
}

export function ServiceCards({ w }: { w: Workstream }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const selected = selectedPhase(w, searchParams.get('service'))
  const opening = proposedStart(w)

  const open = (serviceId: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('service', serviceId)
    params.delete('tab')
    router.push(`${hrefs.workstream(w.id)}?${params.toString()}`, { scroll: false })
  }

  return (
    <div className={cn('grid grid-cols-1 gap-3', COLS[w.phases.length] ?? 'sm:grid-cols-5')}>
      {w.phases.map((phase, index) => {
        const nextUp = opening && index === 0
        const planned = phase.state === 'planned' && !nextUp
        const current = phase.state === 'now' || nextUp
        const isSelected = selected.service === phase.service
        const clickable = phase.state === 'done' || (phase.state === 'now' && !isSelected)
        const body = (
          <>
            <p className={cn('text-[15px] leading-5', planned ? 'font-normal text-text-tertiary' : 'font-semibold text-text-primary')}>
              {service(phase.service).label}
            </p>
            <p className="p7 mt-1 text-text-tertiary">{caption(phase, nextUp)}</p>
          </>
        )
        const className = cn(
          'w-full rounded-xl border py-3.5 pl-5 pr-4 text-left',
          current ? 'border-brand-2 bg-bg-accent' : planned ? 'border-black-2 bg-black-1' : 'border-border-dark bg-white',
          clickable && 'cursor-pointer',
        )
        const selectedStyle = isSelected ? { borderLeftWidth: 4, borderLeftColor: 'var(--brand-6)' } : undefined
        if (!clickable) {
          return (
            <div key={phase.service} className={className} style={selectedStyle} aria-current={isSelected ? 'true' : undefined}>
              {body}
            </div>
          )
        }
        return (
          <button key={phase.service} type="button" className={className} style={selectedStyle} aria-current={isSelected ? 'true' : undefined} onClick={() => open(phase.service)}>
            {body}
          </button>
        )
      })}
    </div>
  )
}

export function stepsAside(w: Workstream): string {
  if (w.service === 'tender' && w.tender?.offersDue) return `Offers due ${short(w.tender.offersDue)}`
  return 'Projects at each step'
}

export function WorkstreamFacts({
  activity,
  documents,
}: {
  activity: Array<{ date: string; title: string; text: string }>
  documents?: Array<{ name: string; meta: string; action?: string; muted?: boolean }>
}) {
  const path = usePathname()
  const params = useSearchParams()
  const qs = params.toString()
  const seeAll = qs ? `${path}?${qs}` : path
  const docs = documents ?? []
  if (!activity.length && !docs.length) return null
  return (
    <div className={activity.length && docs.length ? 'grid gap-6 lg:grid-cols-2' : ''}>
      {activity.length > 0 && (
        <Card title="Recent activity" right={<CardLink href={seeAll}>See all</CardLink>}>
          <ul>
            {activity.map((item, index) => (
              <li key={`${item.date}-${item.title}`} className={cn('flex justify-between gap-4 py-3', index > 0 && 'border-t border-border-light')}>
                <div>
                  <p className="text-sm font-semibold text-cq-text">{shortFact(item.title)}</p>
                  {item.text && <p className="text-sm text-cq-text-secondary">{shortFact(item.text)}</p>}
                </div>
                <span className="shrink-0 text-xs text-cq-muted">{item.date}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
      {docs.length > 0 && (
        <Card title="Documents" right={<CardLink href={seeAll}>See all</CardLink>}>
          <ul>
            {docs.map((doc, index) => (
              <li key={doc.name} className={cn('flex items-start justify-between gap-4 py-3', index > 0 && 'border-t border-border-light', doc.muted && 'text-cq-muted')}>
                <div>
                  <p className={cn('text-sm font-semibold', doc.muted ? 'text-cq-muted' : 'text-cq-text')}>{shortFact(doc.name)}</p>
                  <p className={cn('text-sm', doc.muted ? 'text-cq-muted' : 'text-cq-text-secondary')}>{shortFact(doc.meta)}</p>
                </div>
                {doc.action && !doc.muted && (
                  <button type="button" className="btn-link shrink-0">
                    {doc.action}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  )
}

export function WorkstreamFrame({ live, children }: { live: Workstream; children: ReactNode }) {
  return (
    <>
      <WorkstreamHeader w={live} />
      <div className="space-y-6 pb-12">
        <ServiceCards w={live} />
        {children}
      </div>
    </>
  )
}
