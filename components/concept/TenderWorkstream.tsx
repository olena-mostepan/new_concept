'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import * as Tabs from '@radix-ui/react-tabs'
import { SOLUTIONS, service as serviceDef, type OfferSplit, type Workstream } from '@/lib/concept/model'
import { getBatch, short, siteChecksLine, tenderProjectsAside, tenderSteps, totalCapacity } from '@/lib/concept/derive'
import { WALTER_SCOTT_MATCHING } from '@/lib/customer/supplier-matching/fixture'
import { SupplierMatchingReview } from '@/components/customer/supplier-matching/SupplierMatchingReview'
import { cn } from '@/lib/utils'
import { Card, Page, PageHeader } from './ui'
import { StatusPill } from './StatusPill'
import { DetailTags, DetailsGrid, DetailsToggle, useDetailsOpen } from './DetailsGrid'
import { StepsWithNeeds } from './StepsWithNeeds'
import { ProjectsTable } from './ProjectsTable'
import { hrefs } from './hrefs'
import { useConcept } from './store'

const tabTriggerClass = cn(
  'shrink-0 whitespace-nowrap border-b-2 border-transparent px-0.5 py-3 text-sm font-normal outline-none transition-colors',
  'text-cq-text-secondary hover:text-cq-text',
  'data-[state=active]:border-[var(--cq-green)] data-[state=active]:text-text-primary',
)

type TenderTab = 'overview' | 'brief' | 'supplier-matching' | 'offers'

function offersIn(offers?: OfferSplit) {
  if (!offers) return 0
  return offers.received + (offers.partial ?? 0)
}

function offerSegments(offers: OfferSplit) {
  const items: Array<{ label: string; count: number; color: string; onDark: boolean }> = []
  if (offers.received) items.push({ label: 'Offer received', count: offers.received, color: '#1e2832', onDark: true })
  if (offers.partial) items.push({ label: 'Partial offer', count: offers.partial, color: '#9ca3af', onDark: false })
  if (offers.declined) items.push({ label: 'Declined', count: offers.declined, color: '#6b7280', onDark: true })
  if (offers.noResponse) items.push({ label: 'No response yet', count: offers.noResponse, color: '#e5e7eb', onDark: false })
  return items
}

function offerSummary(offers: OfferSplit) {
  if (offers.summary) return offers.summary
  return [
    offers.received ? `${offers.received} received` : null,
    offers.partial ? `${offers.partial} partial` : null,
    offers.declined ? `${offers.declined} declined` : null,
    offers.noResponse ? `${offers.noResponse} no response` : null,
  ]
    .filter(Boolean)
    .join(' · ')
}

function Soon({ label, noun }: { label: string; noun: string }) {
  return (
    <div className="rounded-xl border border-dashed border-cq-border bg-white px-5 py-10 text-center ">
      <p className="text-sm font-normal text-cq-text">{label} — coming soon</p>
      <p className="mt-1 text-sm text-cq-text-secondary">Placeholder for the customer {noun} view.</p>
    </div>
  )
}

export function TenderWorkstream({ w }: { w: Workstream }) {
  const { account } = useConcept()
  const router = useRouter()
  const searchParams = useSearchParams()
  const batch = getBatch(account, w.batchId)!
  const detailsOpen = useDetailsOpen()
  const def = serviceDef(w.service)
  const t = w.tender
  const invited = t?.invited ?? 0
  const inCount = offersIn(t?.offers)
  const tabs: Array<{ id: TenderTab; label: string }> = [
    { id: 'overview', label: 'Overview' },
    { id: 'brief', label: 'Brief' },
  ]
  if (invited > 0) {
    tabs.push({ id: 'supplier-matching', label: `Supplier matching (${invited})` })
    if (inCount > 0) tabs.push({ id: 'offers', label: `Offers (${inCount})` })
  }
  const requested = searchParams.get('tab')
  const tab: TenderTab = tabs.some((item) => item.id === requested) ? (requested as TenderTab) : 'overview'

  const setTab = (next: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (next === 'overview') params.delete('tab')
    else params.set('tab', next)
    const qs = params.toString()
    router.replace(`${hrefs.workstream(w.id)}${qs ? `?${qs}` : ''}`, { scroll: false })
  }

  const size = totalCapacity(w)
  const checks = siteChecksLine(w)
  const details: Array<{ label: string; value: ReactNode }> = [
    { label: 'Service', value: def.label },
    { label: 'Started', value: short(w.startedOn) },
    ...(t?.source ? [{ label: 'Supplier source', value: t.source }] : []),
    { label: 'Solution', value: SOLUTIONS[w.solution] },
    { label: 'Projects', value: String(w.projects.length) },
    ...(t?.offersDue ? [{ label: 'Offers due', value: short(t.offersDue) }] : []),
    {
      label: 'Batch',
      value: (
        <Link href={hrefs.batch(batch.id)} className="hover:text-cq-accent">
          {batch.name}
        </Link>
      ),
    },
    ...(size ? [{ label: 'Total size', value: size }] : []),
    ...(t?.brief ? [{ label: 'Brief', value: t.brief }] : []),
    { label: 'Lead', value: w.lead },
    { label: 'Done when', value: def.done },
    ...(checks ? [{ label: 'Site checks', value: checks }] : []),
  ]

  const offersRight = invited
    ? [t?.invitedOn ? `${invited} suppliers invited ${short(t.invitedOn)}` : `${invited} suppliers invited`, t?.offersDue ? `offers due ${short(t.offersDue)}` : null]
        .filter(Boolean)
        .join(' · ')
    : null

  return (
    <Page>
      <PageHeader
        crumbs={[
          { label: def.label, href: hrefs.service(w.service) },
          { label: w.name },
        ]}
        title={w.name}
        meta={[SOLUTIONS[w.solution], batch.name, t?.source, `${w.projects.length} projects`, `Lead ${w.lead}`].filter(Boolean).join(' · ')}
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
        {detailsOpen.open && (
          <>
            <DetailsGrid flow="three" items={details} tags={[def.label, SOLUTIONS[w.solution]]} />
            <DetailTags label="Criteria" tags={t?.criteria ?? []} />
          </>
        )}

        {tabs.length > 1 && (
          <Tabs.Root value={tab} onValueChange={setTab}>
            <Tabs.List className="flex gap-6 border-b border-cq-border">
              {tabs.map((item) => (
                <Tabs.Trigger key={item.id} value={item.id} className={tabTriggerClass}>
                  {item.label}
                </Tabs.Trigger>
              ))}
            </Tabs.List>
          </Tabs.Root>
        )}

        {tab === 'brief' && <Soon label="Brief" noun="brief" />}
        {tab === 'offers' && <Soon label="Tender" noun="tender" />}
        {tab === 'supplier-matching' &&
          (w.id === 'solar-de' ? (
            <SupplierMatchingReview
              audience="customer"
              tender={{
                ...WALTER_SCOTT_MATCHING,
                closeDate: '2026-10-24',
                status: 'open',
                contacted: t?.approached ?? WALTER_SCOTT_MATCHING.contacted,
                metRequirements: invited,
                exclusionReasons: [],
                unassessed: [],
              }}
            />
          ) : (
            <Soon label="Supplier matching" noun="supplier matching" />
          ))}

        {tab === 'overview' && (
          <>
            <Card title="Steps" right="Projects at each step">
              <div className="overflow-x-auto">
                <div className="min-w-[1080px]">
                  <StepsWithNeeds columns={tenderSteps(w)} />
                </div>
              </div>
            </Card>

            {invited > 0 && t?.offers && (
              <Card title="Offers" right={offersRight ?? undefined}>
                <OffersBar offers={t.offers} />
                <p className="mt-3 text-sm text-cq-text-secondary">{offerSummary(t.offers)}</p>
              </Card>
            )}

            <Card title="Projects" right={tenderProjectsAside(w)} bodyClassName="p-0">
              <ProjectsTable w={w} />
            </Card>

            {(w.activity?.length || w.documents?.length) && (
              <div className={w.documents?.length ? 'grid gap-6 lg:grid-cols-2' : ''}>
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

function OffersBar({ offers }: { offers: OfferSplit }) {
  const segments = offerSegments(offers)
  return (
    <div>
      <div className="flex w-full gap-1.5">
        {segments.map((segment) => (
          <div key={segment.label} className="min-w-0 text-center" style={{ flex: `${segment.count} 1 0` }}>
            <p className="truncate text-xs text-cq-text-secondary">{segment.label}</p>
          </div>
        ))}
      </div>
      <div className="mt-2 flex h-10 w-full overflow-hidden rounded-full" role="img" aria-label="Offers">
        {segments.map((segment) => (
          <div
            key={segment.label}
            className="flex h-full items-center justify-center text-sm font-semibold tabular-nums"
            style={{ flex: `${segment.count} 1 0`, backgroundColor: segment.color, color: segment.onDark ? '#fff' : '#1e2832' }}
          >
            {segment.count}
          </div>
        ))}
      </div>
    </div>
  )
}
