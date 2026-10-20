'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import * as Tabs from '@radix-ui/react-tabs'
import { SOLUTIONS, service as serviceDef, type Building, type ProjectRow, type ServiceId, type Workstream } from '@/lib/concept/model'
import { deliveryProjectsAside, deliverySteps, getBatch, moneyOne, short } from '@/lib/concept/derive'
import { keepShownDate, splitDeliveryId, toCustomerProject, toDeliveryPayload } from '@/lib/concept/delivery'
import { CustomerDeliveryView } from '@/components/customer/delivery/CustomerDeliveryView'
import { CustomerProjectDeliveryView } from '@/components/customer/delivery/CustomerProjectDeliveryView'
import { cn } from '@/lib/utils'
import { Card, Page, PageHeader } from './ui'
import { StatusPill } from './StatusPill'
import { DetailsGrid, DetailsToggle, useDetailsOpen } from './DetailsGrid'
import { StepsWithNeeds } from './StepsWithNeeds'
import { ProjectRoute } from './ProjectRoute'
import { hrefs } from './hrefs'
import { useConcept } from './store'

const tabTriggerClass = cn(
  'shrink-0 whitespace-nowrap border-b-2 border-transparent px-0.5 py-3 text-sm font-normal outline-none transition-colors',
  'text-cq-text-secondary hover:text-cq-text',
  'data-[state=active]:border-[var(--cq-green)] data-[state=active]:text-text-primary',
)

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

export function DeliveryWorkstream({ w }: { w: Workstream }) {
  const { account, saveDelivery } = useConcept()
  const router = useRouter()
  const searchParams = useSearchParams()
  const batch = getBatch(account, w.batchId)!
  const detailsOpen = useDetailsOpen()
  const def = serviceDef(w.service)
  const info = w.deliveryProfile
  const complete = w.owner === 'done' ? w.projects.length : w.projects.filter((project) => project.step >= 5).length
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'contract', label: 'Contract' },
    { id: 'delivery', label: 'Delivery' },
  ]
  const requested = searchParams.get('tab')
  const tab = tabs.some((item) => item.id === requested) ? requested! : 'overview'
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
    { label: 'Complete', value: `${complete} of ${w.projects.length}` },
    { label: 'Solution', value: solutionLabel(w.solution) },
    { label: 'Projects', value: String(w.projects.length) },
    ...(info?.expectedCompletion ? [{ label: 'Expected completion', value: `est ${short(info.expectedCompletion)}` }] : []),
    { label: 'Batch', value: <Link href={hrefs.batch(batch.id)} className="hover:text-cq-accent">{batch.name}</Link> },
    ...(w.supplier ? [{ label: 'Supplier', value: w.supplier }] : []),
    { label: 'Done when', value: def.done },
    { label: 'Lead', value: w.lead },
    ...(info?.contractValue ? [{ label: 'Contract value', value: moneyOne(info.contractValue) }] : []),
  ]
  const payload = toDeliveryPayload(account, [w])

  return (
    <Page>
      <PageHeader
        crumbs={[{ label: def.label, href: hrefs.service(w.service) }, { label: w.name }]}
        title={w.name}
        meta={[SOLUTIONS[w.solution], batch.name, w.supplier, `${w.projects.length} projects`, `Lead ${w.lead}`].filter(Boolean).join(' · ')}
        actions={<><StatusPill owner={w.owner} /><Link href={hrefs.batch(batch.id)} className="btn-secondary-sm">View batch</Link><DetailsToggle open={detailsOpen.open} onToggle={detailsOpen.toggle} /></>}
      />
      <div className="space-y-6 pb-12">
        {detailsOpen.open && <DetailsGrid flow="three" items={details} tags={[def.label, SOLUTIONS[w.solution], ...(w.supplier ? [w.supplier] : [])]} />}
        <Tabs.Root value={tab} onValueChange={setTab}>
          <Tabs.List className="flex gap-6 border-b border-cq-border-light" aria-label="Workstream">
            {tabs.map((item) => (
              <Tabs.Trigger key={item.id} value={item.id} className={tabTriggerClass}>{item.label}</Tabs.Trigger>
            ))}
          </Tabs.List>
        </Tabs.Root>
        {tab === 'contract' && <Soon label="Contract" />}
        {tab === 'delivery' && (
          <CustomerDeliveryView
            payload={payload}
            onPayloadChange={saveDelivery}
            embedded
            showBanner={false}
            projectHref={(project) => {
              const parts = splitDeliveryId(project.id)
              return parts ? hrefs.project(parts.workstreamId, parts.buildingId) : hrefs.workstream(w.id)
            }}
          />
        )}
        {tab === 'overview' && (
          <>
            <Card title="Delivery stages" right="Projects at each stage">
              <div className="overflow-x-auto">
                <div className="min-w-[1080px]">
                  <StepsWithNeeds columns={deliverySteps(account, w)} />
                </div>
              </div>
            </Card>
            <Card title="Projects" right={deliveryProjectsAside(w)} bodyClassName="p-0">
              <CustomerDeliveryView
                payload={payload}
                onPayloadChange={saveDelivery}
                embedded
                bare
                showBanner={false}
                showCity
                conceptRows
                projectHref={(project) => {
                  const parts = splitDeliveryId(project.id)
                  return parts ? hrefs.project(parts.workstreamId, parts.buildingId) : hrefs.workstream(w.id)
                }}
              />
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
                        <li key={doc.name}>
                          <p className="text-sm font-semibold text-cq-text">{doc.name}</p>
                          <p className="text-sm text-cq-text-secondary">{doc.meta}</p>
                          {doc.action && <button type="button" className="btn-link mt-1">{doc.action}</button>}
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

function routeFor(w: Workstream, row: ProjectRow) {
  const now = { state: 'now' as const, title: `Now · ${serviceDef('delivery').steps[row.step]}`, detail: `In ${w.name}` }
  if (w.id === 'ev-voltreny') {
    return {
      indicative: { state: 'done' as const, title: 'Done 30 May', detail: '€23–28k' },
      scope: { state: 'skip' as const, title: 'Not needed', detail: 'Car park plans were enough' },
      tender: { state: 'done' as const, title: 'Done 5 Aug', detail: 'Voltreny chosen' },
      pricing: { state: 'skip' as const, title: 'Not needed', detail: 'The supplier comes from the tender' },
      delivery: now,
    }
  }
  if (w.id === 'ev-be') {
    return {
      indicative: { state: 'skip' as const, title: 'Not needed', detail: 'Same Voltreny contract as Flagship' },
      scope: { state: 'skip' as const, title: 'Not needed', detail: 'Same Voltreny contract as Flagship' },
      tender: { state: 'skip' as const, title: 'Not needed', detail: 'Same Voltreny contract as Flagship' },
      pricing: { state: 'skip' as const, title: 'Not needed' },
      delivery: now,
    }
  }
  if (w.id === 'led-lumora') {
    return {
      indicative: { state: 'skip' as const, title: 'Not needed', detail: 'Like-for-like LED' },
      scope: { state: 'skip' as const, title: 'Not needed', detail: 'Lumora framework price' },
      tender: { state: 'skip' as const, title: 'Not needed', detail: 'Lumora framework price' },
      pricing: { state: 'skip' as const, title: 'Not needed', detail: 'Lumora framework price' },
      delivery: now,
    }
  }
  return { delivery: now } satisfies Partial<Record<ServiceId, { state: 'done' | 'now' | 'planned' | 'skip'; title: string; detail?: string }>>
}

export function DeliveryProject({ w, building, row }: { w: Workstream; building: Building; row: ProjectRow }) {
  const { account, saveDelivery } = useConcept()
  const router = useRouter()
  const searchParams = useSearchParams()
  const batch = getBatch(account, w.batchId)!
  const project = toCustomerProject(account, w, row)
  const tab = searchParams.get('tab') === 'contract' ? 'contract' : 'overview'
  const setTab = (next: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (next === 'overview') params.delete('tab')
    else params.set('tab', next)
    const qs = params.toString()
    router.replace(`${hrefs.project(w.id, building.id)}${qs ? `?${qs}` : ''}`, { scroll: false })
  }

  return (
    <Page>
      <PageHeader
        crumbs={[
          { label: 'Delivery', href: hrefs.service('delivery') },
          { label: w.name, href: hrefs.workstream(w.id) },
          { label: building.name },
        ]}
        title={<>{building.name} · {solutionLabel(w.solution)} <span className="font-normal text-cq-text-secondary">{building.city}</span></>}
        actions={<><StatusPill owner={w.owner} /><Link href={hrefs.batch(batch.id)} className="btn-secondary-sm">View batch</Link></>}
      />
      <div className="space-y-6 pb-12">
        <Card title="Details">
          <DetailsGrid
            items={[
              { label: 'Batch', value: <Link href={hrefs.batch(batch.id)} className="hover:text-cq-accent">{batch.name}</Link> },
              { label: 'Workstream', value: <Link href={hrefs.workstream(w.id)} className="hover:text-cq-accent">{w.name}</Link> },
              { label: 'Solution', value: solutionLabel(w.solution) },
              { label: 'Supplier', value: w.supplier ?? '—' },
            ]}
          />
        </Card>
        <Card title="Route" right="Services for this project">
          <ProjectRoute batch={batch} serviceId="delivery" workstreamName={w.name} captions={routeFor(w, row)} />
        </Card>
        <Tabs.Root value={tab} onValueChange={setTab}>
          <Tabs.List className="flex gap-6 border-b border-cq-border-light" aria-label="Project">
            <Tabs.Trigger value="overview" className={tabTriggerClass}>Overview</Tabs.Trigger>
            <Tabs.Trigger value="contract" className={tabTriggerClass}>Contract</Tabs.Trigger>
          </Tabs.List>
        </Tabs.Root>
        {tab === 'contract' ? <Soon label="Contract" /> : (
          <>
            <CustomerProjectDeliveryView
              project={project}
              onProjectChange={(next) => saveDelivery(keepShownDate(project, next))}
            />
            {row.history && row.history.length > 0 && (
              <Card title="History" bodyClassName="p-0">
                <table className="w-full">
                  <tbody>
                    {row.history.map((item) => (
                      <tr key={item.event} className="border-t border-cq-border-light first:border-t-0">
                        <td className="px-5 py-3.5 text-sm font-normal">{item.event}</td>
                        <td className="px-5 py-3.5 text-sm text-cq-text-secondary">{item.detail}</td>
                        <td className="px-5 py-3.5 text-right text-sm text-cq-muted">{item.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            )}
          </>
        )}
      </div>
    </Page>
  )
}
