'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import * as Tabs from '@radix-ui/react-tabs'
import { SOLUTIONS, service as serviceDef, type Workstream } from '@/lib/concept/model'
import { getBatch, moneyOne, pricingProjectsAside, pricingSteps, pricingTotal, short } from '@/lib/concept/derive'
import { cn } from '@/lib/utils'
import { Card, Page, PageHeader } from './ui'
import { StatusPill } from './StatusPill'
import { DetailsGrid, DetailsToggle, useDetailsOpen } from './DetailsGrid'
import { StepsWithNeeds } from './StepsWithNeeds'
import { ProjectsTable } from './ProjectsTable'
import { hrefs } from './hrefs'
import { useConcept } from './store'

const tabTriggerClass = cn(
  'shrink-0 whitespace-nowrap border-b-2 border-transparent px-0.5 py-3 text-sm font-normal outline-none transition-colors',
  'text-cq-text-secondary hover:text-cq-text',
  'data-[state=active]:border-[var(--cq-green)] data-[state=active]:text-text-primary',
)

type PricingTab = 'overview' | 'pricing' | 'contract'

function solutionLabel(id: Workstream['solution']) {
  return id === 'ev' ? 'EV charging' : SOLUTIONS[id]
}

function Soon({ label }: { label: string }) {
  return (
    <div className="rounded-xl border border-dashed border-cq-border bg-white px-5 py-10 text-center ">
      <p className="text-sm font-normal text-cq-text">{label} — coming soon</p>
      <p className="mt-1 text-sm text-cq-text-secondary">Placeholder for the customer {label.toLowerCase()} view.</p>
    </div>
  )
}

export function PricingWorkstream({ w }: { w: Workstream }) {
  const { account } = useConcept()
  const router = useRouter()
  const searchParams = useSearchParams()
  const batch = getBatch(account, w.batchId)!
  const detailsOpen = useDetailsOpen()
  const def = serviceDef(w.service)
  const info = w.pricing
  const total = pricingTotal(w)
  const tabs: Array<{ id: PricingTab; label: string }> = [
    { id: 'overview', label: 'Overview' },
    { id: 'pricing', label: 'Pricing' },
  ]
  if (info?.contractOn) tabs.push({ id: 'contract', label: 'Contract' })
  const requested = searchParams.get('tab')
  const tab: PricingTab = tabs.some((item) => item.id === requested) ? (requested as PricingTab) : 'overview'

  const setTab = (next: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (next === 'overview') params.delete('tab')
    else params.set('tab', next)
    const qs = params.toString()
    router.replace(`${hrefs.workstream(w.id)}${qs ? `?${qs}` : ''}`, { scroll: false })
  }

  const details: Array<{ label: string; value: ReactNode }> = [
    { label: 'Service', value: def.label },
    { label: 'Started', value: short(w.startedOn) },
    ...(info?.priced ? [{ label: 'Priced', value: info.priced }] : []),
    { label: 'Solution', value: solutionLabel(w.solution) },
    { label: 'Projects', value: String(w.projects.length) },
    ...(total ? [{ label: 'Price', value: moneyOne(total) }] : []),
    {
      label: 'Batch',
      value: (
        <Link href={hrefs.batch(batch.id)} className="hover:text-cq-accent">
          {batch.name}
        </Link>
      ),
    },
    ...(w.supplier ? [{ label: 'Supplier', value: w.supplier }] : []),
    ...(info?.receivedOn ? [{ label: 'Price received', value: short(info.receivedOn) }] : []),
    { label: 'Lead', value: w.lead },
    ...(info?.source ? [{ label: 'Supplier source', value: info.source }] : []),
    { label: 'Done when', value: def.done },
  ]

  return (
    <Page>
      <PageHeader
        crumbs={[
          { label: def.label, href: hrefs.service(w.service) },
          { label: w.name },
        ]}
        title={w.name}
        meta={[SOLUTIONS[w.solution], batch.name, w.supplier, `${w.projects.length} projects`, `Lead ${w.lead}`].filter(Boolean).join(' · ')}
        actions={
          <>
            <StatusPill owner={w.owner} />
            <Link href={hrefs.batch(batch.id)} className="btn-secondary-sm">
              View batch
            </Link>
            <DetailsToggle open={detailsOpen.open} onToggle={detailsOpen.toggle} />
          </>
        }
      />
      <div className="space-y-6 pb-12">
        {detailsOpen.open && <DetailsGrid flow="three" items={details} tags={[def.label, SOLUTIONS[w.solution], ...(w.supplier ? [w.supplier] : [])]} />}

        <Tabs.Root value={tab} onValueChange={setTab}>
          <Tabs.List className="flex gap-6 border-b border-cq-border-light" aria-label="Workstream">
            {tabs.map((item) => (
              <Tabs.Trigger key={item.id} value={item.id} className={tabTriggerClass}>
                {item.label}
              </Tabs.Trigger>
            ))}
          </Tabs.List>
        </Tabs.Root>

        {tab === 'pricing' && <Soon label="Pricing" />}
        {tab === 'contract' && <Soon label="Contract" />}

        {tab === 'overview' && (
          <>
            <Card title="Steps" right="Projects at each step">
              <div className="overflow-x-auto">
                <div className="min-w-[1080px]">
                  <StepsWithNeeds columns={pricingSteps(w)} />
                </div>
              </div>
            </Card>

            <Card title="Projects" right={pricingProjectsAside(w)} bodyClassName="p-0">
              <ProjectsTable w={w} />
            </Card>

            {(w.activity?.length || w.documents?.length) && (
              <div className={w.documents?.length && w.activity?.length ? 'grid gap-6 lg:grid-cols-2' : ''}>
                {w.activity && w.activity.length > 0 && (
                  <Card title="Recent activity">
                    <ul className="space-y-4">
                      {w.activity.map((item) => (
                        <li key={`${item.date}-${item.title}`} className="flex justify-between gap-4">
                          <div>
                            <p className="text-sm font-semibold text-cq-text">{item.title}</p>
                            {item.text && <p className="text-sm text-cq-text-secondary">{item.text}</p>}
                          </div>
                          <span className="shrink-0 text-xs text-cq-muted">{item.date}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}
                {w.documents && w.documents.length > 0 && (
                  <Card title="Documents">
                    <ul className="space-y-4">
                      {w.documents.map((doc) => (
                        <li key={doc.name} className={doc.muted ? 'text-cq-muted' : ''}>
                          <p className={cn('text-sm font-semibold', doc.muted ? 'text-cq-muted' : 'text-cq-text')}>{doc.name}</p>
                          <p className={cn('text-sm', doc.muted ? 'text-cq-muted' : 'text-cq-text-secondary')}>{doc.meta}</p>
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
            )}
          </>
        )}
      </div>
    </Page>
  )
}
