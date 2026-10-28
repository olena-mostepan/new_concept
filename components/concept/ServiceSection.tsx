'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import { SOLUTIONS, service, type ServiceId, type SolutionId, type Workstream } from '@/lib/concept/model'
import { activeProjects, asPhase, byRecentChange, customerBatches, getBuilding, historyInService, nextParts, noun, phaseOutcome, presentedTotal, priceLine, splitLine, suppliersLine, surveyLine, type PhaseRef } from '@/lib/concept/derive'
import { ChangedKey, ChangedMark, ClearFilters, FilterBar, FilterField, FilterSearch, FilterSelect, PageHeader, YourActionOnly, groupTitle } from './ui'
import { StatusPill } from './StatusPill'
import { hrefs } from './hrefs'
import { useConcept } from './store'
import { SurveysTab } from './SurveysTab'

const rowGrid = { gridTemplateColumns: 'minmax(0,1.2fr) minmax(0,1fr) minmax(0,0.8fr) minmax(0,1.2fr) 120px 16px' }

function serviceColumn(serviceId: ServiceId, w: Workstream) {
  if (serviceId === 'scope') return splitLine(surveyLine(w))
  if (serviceId === 'tender') return splitLine(suppliersLine(w))
  if (serviceId === 'pricing') return splitLine(priceLine(w))
  const estimate = presentedTotal(w)
  return { main: estimate.count ? estimate.text : '—', detail: noun(activeProjects(w).length, 'project', 'projects') }
}

function matches(account: ReturnType<typeof useConcept>['account'], w: Workstream, projects: Workstream['projects'], batch: string, solution: string, supplier: string, needle: string) {
  if (batch && w.batchId !== batch) return false
  if (solution && w.solution !== solution) return false
  if (supplier && w.supplier !== supplier) return false
  if (!needle) return true
  const names = projects.map((p) => getBuilding(account, p.buildingId).name).join(' ')
  return `${w.name} ${names}`.toLowerCase().includes(needle)
}

export function ServiceSection({ serviceId }: { serviceId: ServiceId }) {
  const { account } = useConcept()
  const router = useRouter()
  const params = useSearchParams()
  const def = service(serviceId)
  const surveys = serviceId === 'scope' && params.get('tab') === 'surveys'
  const q = params.get('q') ?? ''
  const batch = params.get('batch') ?? ''
  const solution = params.get('solution') ?? ''
  const responsibility = params.get('responsibility') === 'you' ? 'you' : ''
  const supplier = params.get('supplier') ?? ''

  const write = (next: Record<string, string>) => {
    const sp = new URLSearchParams(params.toString())
    for (const [key, value] of Object.entries(next)) {
      if (value) sp.set(key, value)
      else sp.delete(key)
    }
    const query = sp.toString()
    router.replace(query ? `${hrefs.service(serviceId)}?${query}` : hrefs.service(serviceId))
  }

  const batches = customerBatches(account)
  const needle = q.trim().toLowerCase()
  const liveAll = account.workstreams.filter((w) => w.service === serviceId && !w.proposed && w.owner !== 'done')
  const pastAll = historyInService(account, serviceId)
  const keep = (w: Workstream, projects: Workstream['projects']) => matches(account, w, projects, batch, solution, supplier, needle)
  const live = liveAll.filter((w) => keep(w, w.projects))
  const past = pastAll.filter((row) => keep(row.workstream, row.phase.projects?.length ? row.phase.projects : row.workstream.projects))
  const liveShown = responsibility === 'you' ? live.filter((w) => w.owner === 'you') : live
  const pastShown = responsibility === 'you' ? [] : past
  const decision =
    serviceId === 'indicative'
      ? liveShown.filter((w) => w.owner === 'you' && w.projects.some((p) => p.decision === 'waiting'))
      : liveShown.filter((w) => w.owner === 'you')
  const progress = liveShown.filter((w) => !decision.includes(w))
  const groups: Array<{ id: string; title: string; rows: Workstream[]; past: PhaseRef[]; outcome: boolean }> = [
    { id: 'decision', title: serviceId === 'scope' ? 'Needs your input' : 'Needs your decision', rows: byRecentChange(decision), past: [], outcome: false },
    { id: 'progress', title: 'In progress', rows: byRecentChange(progress), past: [], outcome: false },
    { id: 'passed', title: 'Passed through', rows: [], past: pastShown, outcome: true },
  ]
  const filtering = Boolean(q || batch || solution || responsibility || supplier)
  const optionSource = [...liveAll, ...pastAll.map((row) => row.workstream)]
  const solutions = [...new Set(optionSource.map((w) => w.solution))]
  const suppliers = [...new Set(optionSource.map((w) => w.supplier).filter((name): name is string => Boolean(name)))]
  const visitTotal = account.workstreams.reduce((n, w) => n + w.projects.filter((p) => p.visit && p.visit.state !== 'skip').length, 0)
  const listed = liveAll.length + pastAll.length

  return (
    <>
      <PageHeader title={def.label} className="mb-4" actions={<ChangedKey className="p7 text-text-secondary" />} />
      {serviceId === 'scope' && (
        <div className="mt-4 flex gap-6 border-b border-cq-border-light">
          <button type="button" onClick={() => write({ tab: '', q: '', batch: '', solution: '', responsibility: '', service: '', status: '', state: '' })} className={`-mb-px border-b-2 pb-2 text-sm font-normal ${surveys ? 'border-transparent text-cq-text-secondary' : 'border-cq-accent text-cq-text'}`}>
            Workstreams ({listed})
          </button>
          <button type="button" onClick={() => write({ tab: 'surveys', q: '', batch: '', solution: '', responsibility: '', service: '', status: '', state: '' })} className={`-mb-px border-b-2 pb-2 text-sm font-normal ${surveys ? 'border-cq-accent text-cq-text' : 'border-transparent text-cq-text-secondary'}`}>
            Surveys ({visitTotal})
          </button>
        </div>
      )}
      {serviceId === 'tender' && (
        <div className="mt-4 flex gap-6 border-b border-cq-border-light">
          <span className="-mb-px border-b-2 border-cq-accent pb-2 text-sm font-normal text-cq-text">
            Workstreams ({listed})
          </span>
          <span className="-mb-px cursor-default border-b-2 border-transparent pb-2 text-sm font-normal text-cq-text-secondary" aria-disabled="true">
            Briefs ({listed})
          </span>
        </div>
      )}
      {surveys ? (
        <div className="mt-6">
          <SurveysTab />
        </div>
      ) : (
      <>
      <FilterBar selects={serviceId === 'pricing' ? 3 : 2}>
        <FilterField label="Search">
          <FilterSearch value={q} onChange={(value) => write({ q: value })} />
        </FilterField>
        <FilterField label="Batch">
          <FilterSelect value={batch} onChange={(value) => write({ batch: value })}>
            <option value="">All batches</option>
            {batches.filter((b) => optionSource.some((w) => w.batchId === b.id)).map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </FilterSelect>
        </FilterField>
        <FilterField label="Solution">
          <FilterSelect value={solution} onChange={(value) => write({ solution: value })}>
            <option value="">All solutions</option>
            {solutions.map((id) => (
              <option key={id} value={id}>
                {SOLUTIONS[id as SolutionId]}
              </option>
            ))}
          </FilterSelect>
        </FilterField>
        {serviceId === 'pricing' && (
          <FilterField label="Supplier">
            <FilterSelect value={supplier} onChange={(value) => write({ supplier: value })}>
              <option value="">All suppliers</option>
              {suppliers.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </FilterSelect>
          </FilterField>
        )}
        <YourActionOnly checked={responsibility === 'you'} onChange={(checked) => write({ responsibility: checked ? 'you' : '' })} />
        {filtering && (
          <ClearFilters onClick={() => write({ q: '', batch: '', solution: '', responsibility: '', supplier: '', state: '' })} />
        )}
      </FilterBar>
      <div className="space-y-6">
        {groups.map((group) => {
          const count = group.outcome ? group.past.length : group.rows.length
          if (!count) return null
          return (
            <section key={group.id} className="overflow-hidden rounded-xl border border-cq-border bg-white">
              <header className="border-b border-cq-border-light py-4 pl-11 pr-6">
                <h2 className={groupTitle}>
                  {group.title} · {count}
                </h2>
              </header>
              <div className="overflow-x-auto">
                <div className="min-w-[760px]">
                  <div className="grid items-center gap-x-6 border-b border-cq-border-light py-2.5 pl-11 pr-6" style={rowGrid}>
                    <span className="s3 text-text-tertiary">Workstream</span>
                    <span className="s3 text-text-tertiary">Batch</span>
                    <span className="s3 text-text-tertiary">{serviceId === 'scope' ? 'Surveys' : serviceId === 'tender' ? 'Suppliers' : serviceId === 'pricing' ? 'Price' : 'Estimate'}</span>
                    <span className="s3 text-text-tertiary">{group.outcome ? 'Outcome' : 'Next step'}</span>
                    <span />
                    <span />
                  </div>
                  {group.outcome
                    ? group.past.map((row) => (
                        <ServiceRow key={row.workstream.id} account={account} w={asPhase(row.workstream, row.phase)} source={row.workstream} serviceId={serviceId} past outcome={phaseOutcome(serviceId, row.workstream, row.phase)} />
                      ))
                    : group.rows.map((w) => <ServiceRow key={w.id} account={account} w={w} source={w} serviceId={serviceId} />)}
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

function ServiceRow({
  account,
  w,
  source,
  serviceId,
  past,
  outcome,
}: {
  account: ReturnType<typeof useConcept>['account']
  w: Workstream
  source: Workstream
  serviceId: ServiceId
  past?: boolean
  outcome?: { main: string; detail: string }
}) {
  const b = account.batches.find((item) => item.id === source.batchId)
  const column = serviceColumn(serviceId, w)
  const parts = outcome ?? nextParts(source)
  const muted = past ? 'text-text-tertiary' : 'text-text-primary'
  const yours = !past && source.owner === 'you'
  return (
    <Link href={hrefs.workstream(source.id, 'service')} className="grid items-center gap-x-6 border-t border-cq-border-light py-3.5 pl-11 pr-6 hover:bg-black-1" style={rowGrid}>
      <p className={`min-w-0 p6 ${muted}`}>
        {past ? source.name : <ChangedMark w={source}>{source.name}</ChangedMark>}
      </p>
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
