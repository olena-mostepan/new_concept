'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { service as serviceDef } from '@/lib/concept/model'
import { activeProjects, getBatch, getBuilding, getWorkstream, nextLine, short, yourNeeds } from '@/lib/concept/derive'
import { Card, Needs, Page, PageHeader, Route, Steps, dot, td, th } from '@/components/concept/ui'
import { StatusPill } from '@/components/concept/StatusPill'
import { IndicativeWorkstream } from '@/components/concept/IndicativeWorkstream'
import { ScopeWorkstream } from '@/components/concept/ScopeWorkstream'
import { TenderWorkstream } from '@/components/concept/TenderWorkstream'
import { PricingWorkstream } from '@/components/concept/PricingWorkstream'
import { DeliveryWorkstream } from '@/components/concept/DeliveryWorkstream'
import { hrefs } from '@/components/concept/hrefs'
import { useConcept } from '@/components/concept/store'
import { cn } from '@/lib/utils'

export default function WorkstreamPage() {
  const { id } = useParams<{ id: string }>()
  const { account } = useConcept()
  const w = getWorkstream(account, id)
  if (!w) return <Page><PageHeader title="Workstream not found" /></Page>
  if (w.service === 'indicative') return <IndicativeWorkstream w={w} />
  if (w.service === 'scope') return <ScopeWorkstream w={w} />
  if (w.service === 'tender') {
    return (
      <Suspense>
        <TenderWorkstream w={w} />
      </Suspense>
    )
  }
  if (w.service === 'pricing') {
    return (
      <Suspense>
        <PricingWorkstream w={w} />
      </Suspense>
    )
  }
  if (w.service === 'delivery') {
    return (
      <Suspense>
        <DeliveryWorkstream w={w} />
      </Suspense>
    )
  }
  const b = getBatch(account, w.batchId)!
  const def = serviceDef(w.service)
  const mine = yourNeeds(w).length

  return (
    <Page>
      <PageHeader
        crumbs={[{ label: def.label, href: hrefs.service(w.service) }]}
        title={w.name}
        meta={
          <>
            <Link href={hrefs.batch(b.id)} className="hover:text-cq-text">{b.name}</Link>
            {dot}
            {activeProjects(w).length} projects
            {w.startedOn && <>{dot}Started {short(w.startedOn)}</>}
            {w.completedOn && <>{dot}Done {short(w.completedOn)}</>}
            {dot}Lead {w.lead}
          </>
        }
        actions={
          <>
            <StatusPill owner={w.owner} />
            <Link href={hrefs.batch(b.id)} className="btn-secondary-sm">View batch</Link>
          </>
        }
      />

      <div className="space-y-6">
        <Card title="Route">
          <Route account={account} batch={b} highlight={w.service} />
        </Card>

        <Card title={def.label} right={`Done when: ${def.done}`}>
          {(nextLine(w) || w.now) && <p className="mb-5 text-sm text-cq-text">{nextLine(w) || w.now}</p>}
          <Steps w={w} />
          {w.estimate && (
            <p className="mt-5 border-t border-cq-border-light pt-4 text-sm text-cq-text-secondary">
              Estimate <span className="font-normal text-cq-text">{w.estimate}</span>
            </p>
          )}
        </Card>

        {w.owner !== 'done' && (
          <Card title={`What ${def.label.toLowerCase()} still needs`} right={mine > 0 && <span className="font-normal text-cq-owner-you">{mine} from you</span>}>
            <Needs needs={w.needs} />
          </Card>
        )}

        <Card title="Projects" right={`${w.projects.length}`} bodyClassName="p-0">
          <table className="w-full">
            <thead className="border-b border-cq-border-light">
              <tr>
                <th className={th}>Project</th>
                <th className={th}>Step</th>
                <th className={th}>Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cq-border-light">
              {w.projects.map((p) => {
                const bd = getBuilding(account, p.buildingId)
                return (
                  <tr key={p.buildingId} className={cn(p.dropped && 'text-cq-muted')}>
                    <td className={td}>
                      <span className={cn('font-normal', p.dropped && 'text-cq-muted')}>{bd.name}</span>
                      <span className="ml-2 text-cq-text-secondary">{bd.city}</span>
                    </td>
                    <td className={td}>{p.dropped ? 'Dropped' : w.owner === 'done' ? 'Done' : def.steps[p.step]}</td>
                    <td className={cn(td, 'text-cq-text-secondary')}>{p.note}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </Card>
      </div>
    </Page>
  )
}
