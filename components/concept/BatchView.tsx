'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { batchActivity, buildingNames, byRecentChange, doneFold, routeAside, routePanels, routeStages, workstreamBlockMeta, wsIn } from '@/lib/concept/derive'
import type { Account, Batch, Workstream } from '@/lib/concept/model'
import { Card, CardLink, ChangedMark } from './ui'
import { ServiceTag } from './ServiceTag'
import { StatusPill } from './StatusPill'
import { RouteWithNeeds } from './RouteWithNeeds'
import { WorkstreamSteps } from './WorkstreamSteps'
import { hrefs } from './hrefs'
import { useConcept } from './store'

function WorkstreamRow({ account, w, notStarted }: { account: Account; w: Workstream; notStarted: boolean }) {
  const names = buildingNames(account, w)
  return (
    <li className="border-t border-cq-border-light py-4 pl-9 pr-5">
      <div className="flex flex-wrap items-center gap-2">
        <p className="font-semibold">
          <Link href={hrefs.workstream(w.id)} className="text-cq-text hover:text-cq-accent">
            <ChangedMark w={w}>{w.name}</ChangedMark>
          </Link>
        </p>
        <ServiceTag s={w.service} />
      </div>
      <div className="mt-4 flex flex-wrap items-start gap-x-8 gap-y-4">
        <div className="w-[42rem] max-w-full shrink-0">
          <WorkstreamSteps w={w} notStarted={notStarted} />
        </div>
        <div className="flex min-w-[16rem] flex-1 items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-cq-text-secondary s3">Projects</p>
            <p className="mt-1 text-sm text-cq-text">
              {names.shown.join(', ')}
              {names.extra > 0 && <span className="text-cq-text-secondary"> +{names.extra}</span>}
            </p>
            {w.exclusion && <p className="mt-1 text-sm text-cq-text-secondary">{w.exclusion}</p>}
            {w.gives && <p className="mt-2 text-sm text-cq-text">You get: {w.gives}</p>}
          </div>
          <StatusPill owner={w.owner} />
        </div>
      </div>
    </li>
  )
}

function ActivityList({ items }: { items: Account['activity'] }) {
  return (
    <ul className="space-y-4">
      {items.map((item) => (
        <li key={`${item.date}-${item.title}`} className="flex justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-cq-text">{item.title}</p>
            <p className="text-sm text-cq-text-secondary">{item.text}</p>
          </div>
          <span className="shrink-0 text-xs text-cq-muted">{item.date}</span>
        </li>
      ))}
    </ul>
  )
}

export function BatchView({ account, batch, variant }: { account: Account; batch: Batch; variant: 'dashboard' | 'page' }) {
  const router = useRouter()
  const { agreePlan } = useConcept()
  const [showDone, setShowDone] = useState(false)
  const all = wsIn(account, batch.id)
  const live = byRecentChange(all.filter((w) => w.owner !== 'done'))
  const done = all.filter((w) => w.owner === 'done')
  const notStarted = batch.planState !== 'live'
  const activity = batchActivity(account, batch)
  const docs = account.documents.filter((d) => d.batchId === batch.id)
  const estimates = all.find((w) => w.next?.kind === 'decision')

  return (
    <div className="space-y-6">
      <Card title={variant === 'dashboard' ? batch.name : 'Route'} right={routeAside(account, batch, variant)}>
        {variant === 'dashboard' && <p className="mb-5 text-sm text-cq-text">Goal: {batch.goal}</p>}
        <RouteWithNeeds
          stages={routeStages(account, batch)}
          panels={variant === 'dashboard' ? routePanels(account, batch) : []}
          later={variant === 'dashboard' ? batch.upcoming?.map((item) => ({ stage: item.stage, label: item.label, why: item.why })) : undefined}
          workstreams={all}
          onAgree={() => agreePlan(batch.id)}
          onEstimates={estimates ? () => router.push(hrefs.workstream(estimates.id)) : undefined}
        />
      </Card>

      <Card title="Workstreams in this batch" right={workstreamBlockMeta(account, batch)} bodyClassName="p-0">
        <ul>
          {live.map((w) => (
            <WorkstreamRow key={w.id} account={account} w={w} notStarted={notStarted || Boolean(w.proposed)} />
          ))}
        </ul>
        {variant === 'page' && done.length > 0 && (
          <div className="flex items-center justify-between gap-4 border-t border-cq-border-light bg-cq-bg py-3 pl-9 pr-5 text-sm text-cq-text-secondary">
            <p>
              <span className="font-semibold uppercase tracking-wide">Done · {done.length}</span> {doneFold(done)}
            </p>
            <button type="button" className="btn-link shrink-0" onClick={() => setShowDone((v) => !v)}>
              {showDone ? 'Hide' : 'Show'}
            </button>
          </div>
        )}
        {showDone && (
          <ul>
            {done.map((w) => (
              <WorkstreamRow key={w.id} account={account} w={w} notStarted={false} />
            ))}
          </ul>
        )}
      </Card>

      {variant === 'dashboard' ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card title="Recent activity" right={<CardLink href={hrefs.workstreams()}>See all</CardLink>}>
            <ActivityList items={activity} />
          </Card>
          <Card title="Documents" right={<CardLink href={hrefs.workstreams()}>See all</CardLink>}>
            <ul className="space-y-4">
              {docs.map((doc) => (
                <li key={doc.name} className={doc.action ? '' : 'text-cq-muted'}>
                  <p className={doc.action ? 'text-sm font-semibold text-cq-text' : 'text-sm font-semibold text-cq-muted'}>{doc.name}</p>
                  <p className="text-sm text-cq-text-secondary">{doc.meta}</p>
                  {doc.action && (
                    <button type="button" className="btn-link mt-1">
                      {doc.action}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      ) : (
        <Card title="Recent activity">
          <ActivityList items={activity} />
        </Card>
      )}
    </div>
  )
}
