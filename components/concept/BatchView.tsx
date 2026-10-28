'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, ChevronRight } from 'lucide-react'
import { activeProjects, batchActivity, byCompleted, byRecentChange, getBuilding, isCompleted, nextParts, noun, phaseOutcome, routeAside, routeStages, workstreamBlockMeta, wsIn } from '@/lib/concept/derive'
import { pricingNotNeeded, SERVICES, SERVICE_LABEL, SOLUTIONS, service as serviceDef, type Account, type Batch, type Workstream } from '@/lib/concept/model'
import { Card, CardLink, ChangedMark } from './ui'
import { ServiceTag } from './ServiceTag'
import { StatusPill } from './StatusPill'
import { RouteWithNeeds } from './RouteWithNeeds'
import { hrefs } from './hrefs'
import { useConcept } from './store'

const rowStyle = { gridTemplateColumns: 'minmax(0,1.2fr) 160px minmax(0,1.5fr) 120px 16px' }

function PageWorkstream({ w, done, rule }: { w: Workstream; done?: boolean; rule: boolean }) {
  const projects = noun(activeProjects(w).length, 'project', 'projects')
  const phase = w.phases.find((item) => item.service === 'delivery' && item.state === 'done')
  const outcome = done && phase ? phaseOutcome('delivery', w, phase) : null
  const parts = outcome ?? nextParts(w)
  const yours = !done && w.owner === 'you'
  return (
    <li className={rule ? 'border-t border-border-light' : undefined}>
      <Link href={hrefs.workstream(w.id)} className="grid items-center gap-x-6 py-3.5 pl-11 pr-6 hover:bg-black-1" style={rowStyle}>
        <div className="min-w-0">
          <p className={done ? 'p6 text-text-tertiary' : 'h8 text-text-title'}>
            {done ? w.name : <ChangedMark w={w}>{w.name}</ChangedMark>}
          </p>
          <p className="p7 text-text-tertiary">{projects}</p>
        </div>
        <ServiceTag s={w.service} muted={done} />
        <div className="min-w-0">
          <p className={done ? 'p6 text-text-tertiary' : yours ? 'h8 text-text-primary' : 'p6 text-text-primary'}>{parts.main}</p>
          {parts.detail && <p className="mt-0.5 p7 text-text-tertiary">{parts.detail}</p>}
        </div>
        <div className="flex justify-end">{yours && <StatusPill owner="you" />}</div>
        <ChevronRight className="h-4 w-4 text-text-tertiary" aria-hidden />
      </Link>
    </li>
  )
}

function ActivityList({ items }: { items: Account['activity'] }) {
  return (
    <ul>
      {items.map((item, index) => (
        <li key={`${item.date}-${item.title}`} className={`flex justify-between gap-4 py-3 ${index > 0 ? 'border-t border-border-light' : ''}`}>
          <div className="min-w-0">
            <p className="h8 text-text-title">{item.title}</p>
            <p className="p7 text-text-secondary">{item.text}</p>
          </div>
          <span className="shrink-0 whitespace-nowrap p7 text-text-tertiary">{item.date}</span>
        </li>
      ))}
    </ul>
  )
}

const pilotCard = { titleClassName: 'h7 text-text-primary', headerClassName: 'px-6 py-3' }

function aside(text: string) {
  return <span className="p7 text-text-secondary">{text}</span>
}

function sentence(text: string) {
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : text
}

function PilotDashboard({ account, batch }: { account: Account; batch: Batch }) {
  const { agreePlan } = useConcept()
  const all = wsIn(account, batch.id)
  const activity = batchActivity(account, batch)
  const docs = account.documents.filter((d) => d.batchId === batch.id)
  const projects = all.reduce((n, w) => n + w.projects.filter((p) => !p.dropped).length, 0)
  const needs = all.flatMap((w) => w.needs.filter((need) => need.owner === 'you' && !need.received))
  const stages = routeStages(account, batch).map((stage) =>
    stage.state === 'skip' && stage.label.startsWith('or ') ? { ...stage, label: stage.label.slice(3) } : stage,
  )
  const notes = Object.fromEntries(
    stages.map((stage) => {
      const skipped = stage.id === 'pricing' && stage.state === 'skip'
      const text = skipped ? pricingNotNeeded : SERVICE_LABEL[stage.id as keyof typeof SERVICE_LABEL]
      return [stage.id, { text, muted: stage.state === 'skip' }]
    }),
  )
  return (
    <div className="space-y-4">
      <Card title={batch.name} right={aside(all.map((w) => SOLUTIONS[w.solution]).join(' · '))} {...pilotCard}>
        <p className="mb-5 p6 text-text-secondary">Goal: {batch.goal}</p>
        <RouteWithNeeds
          pilot
          stages={stages}
          panels={[]}
          notes={notes}
          onAgree={batch.planState === 'live' ? undefined : () => agreePlan(batch.id)}
        />
      </Card>

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
        <Card title="What we have" right={aside(`${batch.filesCount ?? 0} files`)} bodyClassName="px-6 py-2" {...pilotCard}>
          <ul>
            {(batch.received ?? []).map((file) => (
              <li key={file.label} className="flex gap-2 py-1.5">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-icon-dark" strokeWidth={2} aria-hidden />
                <div>
                  <p className="p6 text-text-primary">{file.label}</p>
                  <p className="p7 text-text-tertiary">{file.date}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
        <Card title="What we still need" right={aside('After you agree the plan')} bodyClassName="px-6 py-2" {...pilotCard}>
          <ul>
            {needs.map((need) => (
              <li key={need.label} className="flex gap-2 py-1.5">
                <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-brand-6" aria-hidden />
                <div>
                  <p className="p6 text-text-primary">{need.label}</p>
                  <p className="p7 text-text-tertiary">{need.scope ? `${need.scope} · ${need.why}` : need.why}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card
        title="Solutions"
        right={aside(`${serviceDef(all[0]?.service ?? 'indicative').label} · ${projects} projects`)}
        bodyClassName="px-6 py-0"
        {...pilotCard}
      >
        <ul>
          {all.map((w, index) => {
            const names = w.projects.filter((p) => !p.dropped).map((p) => getBuilding(account, p.buildingId).name)
            return (
              <li key={w.id} className={index > 0 ? 'border-t border-border-light py-3.5' : 'py-3.5'}>
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[180px_minmax(0,1fr)_260px]">
                  <div>
                    <p className="h8 text-text-title">{SOLUTIONS[w.solution]}</p>
                    <p className="p7 text-text-secondary">{names.length === 1 ? '1 site' : `${names.length} sites`}</p>
                  </div>
                  <div>
                    <p className="p6 text-text-primary">{names.join(', ')}</p>
                    {w.exclusion && <p className="mt-1 p7 text-text-tertiary">Excluded: Leeds, Nottingham, Reading · pitched or shared roofs</p>}
                  </div>
                  <div>
                    <p className="p7 text-text-tertiary">Result</p>
                    <p className="p6 text-text-primary">{sentence(w.gives ?? '')}</p>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </Card>

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
        <Card title="Recent activity" right={<CardLink href={hrefs.batches}>See all</CardLink>} bodyClassName="px-6 py-2" {...pilotCard}>
          <ul>
            {activity.map((item) => (
              <li key={`${item.date}-${item.title}`} className="flex items-start justify-between gap-4 py-1.5">
                <div>
                  <p className="h8 text-text-title">{item.title}</p>
                  <p className="p7 text-text-secondary">{item.text}</p>
                </div>
                <span className="shrink-0 p7 text-text-tertiary">{item.date}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card title="Documents" right={<CardLink href={hrefs.batches}>See all</CardLink>} bodyClassName="px-6 py-2" {...pilotCard}>
          <ul>
            {docs.map((doc) => (
              <li key={doc.name} className="flex items-start justify-between gap-4 py-1.5">
                <div>
                  <p className={doc.action ? 'h8 text-text-title' : 'h8 text-text-tertiary'}>{doc.name}</p>
                  <p className="p7 text-text-secondary">{doc.meta}</p>
                </div>
                {doc.action && (
                  <button type="button" className="btn-link shrink-0">
                    {doc.action}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  )
}

export function BatchView({ account, batch, variant }: { account: Account; batch: Batch; variant: 'dashboard' | 'page' }) {
  const { agreePlan } = useConcept()
  const [showDone, setShowDone] = useState(false)
  const all = wsIn(account, batch.id)
  const live = byRecentChange(all.filter((w) => !isCompleted(w) && w.owner !== 'done'))
  const done = all.filter(isCompleted)
  const activity = batchActivity(account, batch)

  if (variant === 'dashboard') return <PilotDashboard account={account} batch={batch} />

  const serviceAt = (id: string) => SERVICES.findIndex((s) => s.id === id)
  const liveRows = byRecentChange(live).sort((a, b) => serviceAt(a.service) - serviceAt(b.service))
  const doneRows = byCompleted(done)
  const pageCard = { titleClassName: 'h7 text-text-primary', headerClassName: 'px-6 py-3' }
  const meta = (text: string) => <span className="p7 text-text-secondary">{text}</span>

  return (
    <div className="space-y-4">
      <Card title="Route" right={meta(routeAside(account, batch, variant))} className="relative z-10 overflow-visible" bodyClassName="px-6 py-5" {...pageCard}>
        <RouteWithNeeds stages={routeStages(account, batch)} panels={[]} workstreams={all} onAgree={() => agreePlan(batch.id)} />
      </Card>

      <Card title="Workstreams in this batch" right={meta(workstreamBlockMeta(account, batch))} bodyClassName="p-0" {...pageCard}>
        <div className="grid items-center gap-x-6 border-b border-border-light py-2.5 pl-11 pr-6 h9 text-text-tertiary" style={rowStyle}>
          <span>Workstream</span>
          <span>Service</span>
          <span>Next step</span>
          <span />
          <span />
        </div>
        <ul>
          {liveRows.map((w, index) => (
            <PageWorkstream key={w.id} w={w} rule={index > 0} />
          ))}
        </ul>
        {doneRows.length > 0 && (
          <div className="flex items-center justify-between border-t border-border-light bg-black-1 px-6 py-3">
            <span className="h9 text-text-secondary">Completed · {doneRows.length}</span>
            <button type="button" className="btn-link shrink-0" onClick={() => setShowDone((v) => !v)}>
              {showDone ? 'Hide' : 'Show'}
            </button>
          </div>
        )}
        {showDone && (
          <ul>
            {doneRows.map((w, index) => (
              <PageWorkstream key={w.id} w={w} done rule={index > 0} />
            ))}
          </ul>
        )}
      </Card>

      <Card title="Recent activity" bodyClassName="px-6 py-1" {...pageCard}>
        <ActivityList items={activity} />
      </Card>
    </div>
  )
}
