'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import * as Tabs from '@radix-ui/react-tabs'
import { service as serviceDef, type OfferSplit, type Workstream } from '@/lib/concept/model'
import { short, tenderProjectsAside, tenderSteps } from '@/lib/concept/derive'
import { WALTER_SCOTT_MATCHING } from '@/lib/customer/supplier-matching/fixture'
import { SupplierMatchingReview } from '@/components/customer/supplier-matching/SupplierMatchingReview'
import { cn } from '@/lib/utils'
import { Card, Page } from './ui'
import { DetailTags } from './DetailsGrid'
import { SimpleSteps } from './SimpleSteps'
import { ProjectsTable } from './ProjectsTable'
import { stepsAside, WorkstreamFacts, WorkstreamFrame } from './WorkstreamChrome'
import { hrefs } from './hrefs'

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

export function TenderWorkstream({ w, live = w }: { w: Workstream; live?: Workstream }) {
  const router = useRouter()
  const searchParams = useSearchParams()
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

  const offersRight = invited
    ? [t?.invitedOn ? `${invited} suppliers invited ${short(t.invitedOn)}` : `${invited} suppliers invited`, t?.offersDue ? `offers due ${short(t.offersDue)}` : null]
        .filter(Boolean)
        .join(' · ')
    : null

  return (
    <Page>
      <WorkstreamFrame live={live}>
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

        {tab === 'brief' && (
          <>
            <DetailTags label="Criteria" tags={t?.criteria ?? []} />
            <Soon label="Brief" noun="brief" />
          </>
        )}
        {tab === 'offers' && (
          <>
            {invited > 0 && t?.offers && (
              <Card title="Offers" right={offersRight ?? undefined}>
                <OffersBar offers={t.offers} />
                <p className="mt-3 text-sm text-cq-text-secondary">{offerSummary(t.offers)}</p>
              </Card>
            )}
            {!(invited > 0 && t?.offers) && <Soon label="Tender" noun="tender" />}
          </>
        )}
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
            <SimpleSteps title={`${serviceDef(w.service).label} steps`} columns={tenderSteps(w)} right={stepsAside(w)} />
            <Card title="Projects" right={tenderProjectsAside(w)} bodyClassName="p-0">
              <ProjectsTable w={w} />
            </Card>
            <WorkstreamFacts activity={w.activity ?? []} documents={w.documents} />
          </>
        )}
      </WorkstreamFrame>
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
