'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { service, type Phase, type Workstream } from '@/lib/concept/model'
import { getBatch, proposedStart, selectedPhase, short, workstreamMeta } from '@/lib/concept/derive'
import { cn } from '@/lib/utils'
import { Card, PageHeader } from './ui'
import { StatusPill } from './StatusPill'
import { hrefs } from './hrefs'
import { useConcept } from './store'

const COLS = ['', 'sm:grid-cols-1', 'sm:grid-cols-2', 'sm:grid-cols-3', 'sm:grid-cols-4', 'sm:grid-cols-5']

/** Drop the full stop, and use a middle dot where the copy used a dash or a colon. */
export function shortFact(text: string): string {
  return text.replace(/\s*[—–]\s*/g, ' · ').replace(/:\s+/g, ' · ').replace(/\.\s*$/, '')
}

export function WorkstreamHeader({ w }: { w: Workstream }) {
  const { account } = useConcept()
  const batch = getBatch(account, w.batchId)
  return (
    <PageHeader
      className="mb-6"
      crumbs={[
        { label: 'Batches', href: hrefs.batches },
        { label: batch?.name ?? 'Batch', href: batch ? hrefs.batch(batch.id) : undefined },
        { label: w.name },
      ]}
      title={w.name}
      meta={<span className="p6 text-text-secondary">{workstreamMeta(w)}</span>}
      actions={
        <>
          {w.owner === 'you' && <StatusPill owner="you" />}
          <Link href={hrefs.batch(w.batchId)} className="btn-secondary">
            View batch
          </Link>
        </>
      }
    />
  )
}

function caption(w: Workstream, phase: Phase, nextUp: boolean): string {
  if (phase.state === 'planned') return nextUp ? 'Next' : 'Later'
  if (phase.state === 'now') return phase.startedOn ? `Now · since ${short(phase.startedOn)}` : 'Now'
  const when = short(phase.completedOn)
  const finished = when ? `Finished ${when}` : 'Finished'
  const outcome = phase.outcome ?? goAhead(w, phase)
  return outcome ? `${finished} · ${outcome}` : finished
}

/** Indicative, all projects "go", and the workstream is still in the service it moved to. */
function goAhead(w: Workstream, phase: Phase): string | undefined {
  if (phase.service !== 'indicative') return undefined
  const projects = phase.projects ?? []
  const decided = projects.filter((project) => project.decision && project.decision !== 'waiting')
  if (!decided.length || decided.some((project) => project.decision !== 'go')) return undefined
  const index = w.phases.findIndex((item) => item.service === phase.service)
  const next = w.phases[index + 1]
  if (next?.service === w.service) return 'you decided to go ahead'
  return undefined
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
        const isSelected = selected.service === phase.service
        const clickable = phase.state === 'done' || (phase.state === 'now' && !isSelected)
        const box = planned
          ? 'border border-black-2 bg-black-1'
          : isSelected
            ? 'border-[1.5px] border-black-7 bg-white'
            : 'border border-border-dark bg-white'
        const body = (
          <>
            <span
              className={cn(
                'block h-1 w-full rounded-full',
                planned ? 'bg-black-2' : phase.state === 'done' ? 'bg-black-6' : 'bg-black-4',
              )}
              aria-hidden
            />
            <p
              className={cn(
                'mt-3 text-[15px] leading-5',
                planned ? 'font-normal text-text-tertiary' : 'font-semibold text-text-primary',
              )}
            >
              {service(phase.service).label}
            </p>
            <p className="p7 mt-1 text-text-tertiary">{caption(w, phase, nextUp)}</p>
          </>
        )
        const className = cn('w-full rounded-xl px-4 py-3.5 text-left', clickable && 'cursor-pointer', box)
        if (!clickable) {
          return (
            <div key={phase.service} className={className} aria-current={isSelected ? 'true' : undefined}>
              {body}
            </div>
          )
        }
        return (
          <button key={phase.service} type="button" className={className} aria-current={isSelected ? 'true' : undefined} onClick={() => open(phase.service)}>
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
  const docs = documents ?? []
  if (!activity.length && !docs.length) return null
  return (
    <div className={activity.length && docs.length ? 'grid gap-6 lg:grid-cols-2' : ''}>
      {activity.length > 0 && (
        <Card title="Recent activity">
          <ul className="space-y-4">
            {activity.map((item) => (
              <li key={`${item.date}-${item.title}`} className="flex justify-between gap-4">
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
        <Card title="Documents">
          <ul className="space-y-4">
            {docs.map((doc) => (
              <li key={doc.name} className={doc.muted ? 'text-cq-muted' : ''}>
                <p className={cn('text-sm font-semibold', doc.muted ? 'text-cq-muted' : 'text-cq-text')}>{shortFact(doc.name)}</p>
                <p className={cn('text-sm', doc.muted ? 'text-cq-muted' : 'text-cq-text-secondary')}>{shortFact(doc.meta)}</p>
                {doc.action && !doc.muted && (
                  <button type="button" className="btn-link mt-1">
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
