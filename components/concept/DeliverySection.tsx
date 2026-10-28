'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import { SOLUTIONS, type SolutionId, type Workstream } from '@/lib/concept/model'
import { asPhase, byRecentChange, customerBatches, deliveryLine, getBuilding, historyInService, needsAttention, nextParts, phaseOutcome, splitLine, wsIn } from '@/lib/concept/derive'
import { splitDeliveryId, toDeliveryPayload } from '@/lib/concept/delivery'
import { CustomerDeliveryView } from '@/components/customer/delivery/CustomerDeliveryView'
import { ChangedKey, ChangedMark, ClearFilters, FilterBar, FilterField, FilterSearch, FilterSelect, PageHeader, YourActionOnly, groupTitle } from './ui'
import { StatusPill } from './StatusPill'
import { hrefs } from './hrefs'
import { useConcept } from './store'

const rowGrid = { gridTemplateColumns: 'minmax(0,1.2fr) minmax(0,1fr) minmax(0,0.8fr) minmax(0,1.2fr) 120px 16px' }

export function DeliverySection() {
  const { account, saveDelivery } = useConcept()
  const router = useRouter()
  const params = useSearchParams()
  const contracts = params.get('tab') === 'contracts'
  const q = params.get('q') ?? ''
  const batch = params.get('batch') ?? ''
  const solution = params.get('solution') ?? ''
  const supplier = params.get('supplier') ?? ''
  const responsibility = params.get('responsibility') === 'you' ? 'you' : ''

  const write = (next: Record<string, string>) => {
    const sp = new URLSearchParams(params.toString())
    for (const [key, value] of Object.entries(next)) {
      if (value) sp.set(key, value)
      else sp.delete(key)
    }
    const query = sp.toString()
    router.replace(query ? `${hrefs.service('delivery')}?${query}` : hrefs.service('delivery'))
  }

  const liveAll = account.workstreams.filter((w) => w.service === 'delivery' && !w.proposed && w.owner !== 'done')
  const pastAll = historyInService(account, 'delivery')
  const payload = toDeliveryPayload(account, liveAll)
  const confirming = payload.projects.filter((project) => project.needsConfirm)
  const confirmPayload = {
    ...payload,
    projects: confirming,
    datesNeedingConfirm: confirming.length,
    batches: payload.batches
      .map((item) => ({ ...item, projectIds: item.projectIds.filter((id) => confirming.some((project) => project.id === id)) }))
      .filter((item) => item.projectIds.length),
  }
  const needle = q.trim().toLowerCase()
  const keep = (w: Workstream) => {
    if (batch && w.batchId !== batch) return false
    if (solution && w.solution !== solution) return false
    if (supplier && w.supplier !== supplier) return false
    if (!needle) return true
    const names = w.projects.map((p) => getBuilding(account, p.buildingId).name).join(' ')
    return `${w.name} ${names}`.toLowerCase().includes(needle)
  }
  const live = liveAll.filter(keep)
  const past = pastAll.filter((row) => keep(row.workstream))
  const liveShown = responsibility === 'you' ? live.filter((w) => w.owner === 'you') : live
  const pastShown = responsibility === 'you' ? [] : past
  const attention = byRecentChange(liveShown.filter(needsAttention))
  const progress = byRecentChange(liveShown.filter((w) => !needsAttention(w)))
  const groups = [
    { id: 'attention', title: 'Needs attention', rows: attention, past: [] as typeof pastShown, outcome: false },
    { id: 'progress', title: 'In progress', rows: progress, past: [] as typeof pastShown, outcome: false },
    { id: 'done', title: 'Completed', rows: [] as Workstream[], past: pastShown, outcome: true },
  ]
  const batches = customerBatches(account)
  const optionSource = [...liveAll, ...pastAll.map((row) => row.workstream)]
  const solutions = [...new Set(optionSource.map((w) => w.solution))]
  const suppliers = [...new Set(optionSource.map((w) => w.supplier).filter((name): name is string => Boolean(name)))]
  const filtering = Boolean(q || batch || solution || supplier || responsibility)
  const listed = liveAll.length + pastAll.length

  return (
    <>
      <PageHeader title="Delivery" className="mb-4" actions={<ChangedKey className="p7 text-text-secondary" />} />
      <div className="mt-4 flex gap-6 border-b border-cq-border-light">
        <button type="button" onClick={() => write({ tab: '' })} className={`-mb-px border-b-2 pb-2 text-sm font-normal ${contracts ? 'border-transparent text-cq-text-secondary' : 'border-cq-accent text-cq-text'}`}>
          Workstreams ({listed})
        </button>
        <button type="button" onClick={() => write({ tab: 'contracts' })} className={`-mb-px border-b-2 pb-2 text-sm font-normal ${contracts ? 'border-cq-accent text-cq-text' : 'border-transparent text-cq-text-secondary'}`}>
          Contracts (21)
        </button>
      </div>
      {contracts ? (
        <div className="mt-6 rounded-xl border border-dashed border-cq-border bg-white px-5 py-10 text-center">
          <p className="text-sm font-normal text-cq-text">Contracts — coming soon</p>
          <p className="mt-1 text-sm text-cq-text-secondary">Placeholder for the customer contracts view.</p>
        </div>
      ) : (
        <>
          <div className="mt-6">
            <CustomerDeliveryView
              payload={confirmPayload}
              onPayloadChange={saveDelivery}
              embedded
              showList={false}
              showCity
              conceptRows
              projectHref={(project) => {
                const parts = splitDeliveryId(project.id)
                return parts ? hrefs.project(parts.workstreamId, parts.buildingId) : hrefs.service('delivery')
              }}
            />
          </div>
          <FilterBar selects={3}>
            <FilterField label="Search">
              <FilterSearch value={q} onChange={(value) => write({ q: value })} />
            </FilterField>
            <FilterField label="Batch">
              <FilterSelect value={batch} onChange={(value) => write({ batch: value })}>
                <option value="">All batches</option>
                {batches.filter((b) => optionSource.some((w) => w.batchId === b.id) || wsIn(account, b.id).some((w) => w.service === 'delivery')).map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </FilterSelect>
            </FilterField>
            <FilterField label="Solution">
              <FilterSelect value={solution} onChange={(value) => write({ solution: value })}>
                <option value="">All solutions</option>
                {solutions.map((id) => (
                  <option key={id} value={id}>{SOLUTIONS[id as SolutionId]}</option>
                ))}
              </FilterSelect>
            </FilterField>
            <FilterField label="Supplier">
              <FilterSelect value={supplier} onChange={(value) => write({ supplier: value })}>
                <option value="">All suppliers</option>
                {suppliers.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </FilterSelect>
            </FilterField>
            <YourActionOnly checked={responsibility === 'you'} onChange={(checked) => write({ responsibility: checked ? 'you' : '' })} />
            {filtering && <ClearFilters onClick={() => write({ q: '', batch: '', solution: '', supplier: '', responsibility: '' })} />}
          </FilterBar>
          <div className="space-y-6">
            {groups.map((group) => {
              const count = group.outcome ? group.past.length : group.rows.length
              if (!count) return null
              return (
                <section key={group.id} className="overflow-hidden rounded-xl border border-cq-border bg-white">
                  <header className="border-b border-cq-border-light py-4 pl-11 pr-6">
                    <h2 className={groupTitle}>{group.title} · {count}</h2>
                  </header>
                  <div className="overflow-x-auto">
                    <div className="min-w-[760px]">
                      <div className="grid items-center gap-x-6 border-b border-cq-border-light py-2.5 pl-11 pr-6" style={rowGrid}>
                        <span className="s3 text-text-tertiary">Workstream</span>
                        <span className="s3 text-text-tertiary">Batch</span>
                        <span className="s3 text-text-tertiary">Delivery</span>
                        <span className="s3 text-text-tertiary">{group.outcome ? 'Outcome' : 'Next step'}</span>
                        <span />
                        <span />
                      </div>
                      {group.outcome
                        ? group.past.map((row) => (
                            <DeliveryRow
                              key={row.workstream.id}
                              account={account}
                              w={row.workstream}
                              column={splitLine(deliveryLine(asPhase(row.workstream, row.phase)))}
                              parts={phaseOutcome('delivery', row.workstream, row.phase)}
                              past
                            />
                          ))
                        : group.rows.map((w) => (
                            <DeliveryRow key={w.id} account={account} w={w} column={splitLine(deliveryLine(w))} parts={nextParts(w)} />
                          ))}
                    </div>
                  </div>
                </section>
              )
            })}
          </div>
        </>
      )}
    </>
  )
}

function DeliveryRow({
  account,
  w,
  column,
  parts,
  past,
}: {
  account: ReturnType<typeof useConcept>['account']
  w: Workstream
  column: { main: string; detail: string }
  parts: { main: string; detail: string }
  past?: boolean
}) {
  const b = account.batches.find((item) => item.id === w.batchId)
  const muted = past ? 'text-text-tertiary' : 'text-text-primary'
  const yours = !past && w.owner === 'you'
  return (
    <Link href={hrefs.workstream(w.id, 'service')} className="grid items-center gap-x-6 border-t border-cq-border-light py-3.5 pl-11 pr-6 hover:bg-black-1" style={rowGrid}>
      <p className={`min-w-0 p6 ${muted}`}>{past ? w.name : <ChangedMark w={w}>{w.name}</ChangedMark>}</p>
      <p className={`min-w-0 p6 ${muted}`}>{b?.name}</p>
      <div className="min-w-0">
        <p className={`p6 ${muted}`}>{column.main}</p>
        {column.detail && <p className="mt-0.5 p7 text-text-tertiary">{column.detail}</p>}
      </div>
      <div className="min-w-0">
        <p className={past ? 'p6 text-text-tertiary' : yours ? 'h8 text-text-primary' : 'p6 text-text-primary'}>{parts.main}</p>
        {parts.detail && <p className="mt-0.5 p7 text-text-tertiary">{parts.detail}</p>}
      </div>
      <div className="flex justify-end">{yours && <StatusPill owner="you" />}</div>
      <ChevronRight className="h-4 w-4 text-text-tertiary" aria-hidden />
    </Link>
  )
}
