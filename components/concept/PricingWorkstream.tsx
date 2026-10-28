'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import * as Tabs from '@radix-ui/react-tabs'
import { service as serviceDef, type Workstream } from '@/lib/concept/model'
import { pricingProjectsAside, pricingSteps } from '@/lib/concept/derive'
import { cn } from '@/lib/utils'
import { Card, Page } from './ui'
import { SimpleSteps } from './SimpleSteps'
import { ProjectsTable } from './ProjectsTable'
import { stepsAside, WorkstreamFacts, WorkstreamFrame } from './WorkstreamChrome'
import { hrefs } from './hrefs'

const tabTriggerClass = cn(
  'shrink-0 whitespace-nowrap border-b-2 border-transparent px-0.5 py-3 text-sm font-normal outline-none transition-colors',
  'text-cq-text-secondary hover:text-cq-text',
  'data-[state=active]:border-[var(--cq-green)] data-[state=active]:text-text-primary',
)

type PricingTab = 'overview' | 'pricing' | 'contract'

function Soon({ label }: { label: string }) {
  return (
    <div className="rounded-xl border border-dashed border-cq-border bg-white px-5 py-10 text-center ">
      <p className="text-sm font-normal text-cq-text">{label} — coming soon</p>
      <p className="mt-1 text-sm text-cq-text-secondary">Placeholder for the customer {label.toLowerCase()} view.</p>
    </div>
  )
}

export function PricingWorkstream({ w, live = w }: { w: Workstream; live?: Workstream }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const info = w.pricing
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

  return (
    <Page>
      <WorkstreamFrame live={live}>
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
            <SimpleSteps title={`${serviceDef(w.service).label} steps`} columns={pricingSteps(w)} right={stepsAside(w)} />
            <Card title="Projects" right={pricingProjectsAside(w)} bodyClassName="p-0">
              <ProjectsTable w={w} />
            </Card>
            <WorkstreamFacts activity={w.activity ?? []} documents={w.documents} />
          </>
        )}
      </WorkstreamFrame>
    </Page>
  )
}
