'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { OWNER_LABEL, SOLUTIONS, service, type Owner, type ServiceId, type SolutionId, type Workstream } from '@/lib/concept/model'
import { byRecentChange, customerBatches, days, getBuilding, nextParts, presentedTotal, priceLine, sectionOutcome, splitLine, suppliersLine, surveyLine, wsIn } from '@/lib/concept/derive'
import { BOTH_ACTIONS, ChangedKey, ChangedMark, ClearFilters, FilterBar, FilterField, FilterSearch, FilterSelect, PageHeader, SummaryCards, groupTitle, matchesResponsibility, td, th } from './ui'
import { StatusPill } from './StatusPill'
import { hrefs } from './hrefs'
import { useConcept } from './store'
import { SurveysTab } from './SurveysTab'

function rowsFor(serviceId: ServiceId, list: Workstream[]) {
  const mine = list.filter((w) => w.service === serviceId && !w.proposed)
  const decision =
    serviceId === 'indicative'
      ? mine.filter((w) => w.owner === 'you' && w.projects.some((p) => p.decision === 'waiting'))
      : mine.filter((w) => w.owner === 'you')
  const progress = mine.filter((w) => w.owner !== 'done' && !decision.includes(w))
  const done = mine.filter((w) => w.owner === 'done').sort((a, b) => days(a.completedOn || '19 Oct 2026') - days(b.completedOn || '19 Oct 2026'))
  return [
    { id: 'decision', title: serviceId === 'scope' ? 'Needs your input' : 'Needs your decision', rows: byRecentChange(decision), outcome: false },
    { id: 'progress', title: 'In progress', rows: byRecentChange(progress), outcome: false },
    { id: 'done', title: 'Done', rows: done, outcome: true },
  ]
}

export function ServiceSection({ serviceId }: { serviceId: ServiceId }) {
  const { account } = useConcept()
  const router = useRouter()
  const params = useSearchParams()
  const [open, setOpen] = useState(false)
  const def = service(serviceId)
  const surveys = serviceId === 'scope' && params.get('tab') === 'surveys'
  const q = params.get('q') ?? ''
  const batch = params.get('batch') ?? ''
  const solution = params.get('solution') ?? ''
  const responsibility = params.get('responsibility') ?? ''
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
  const all = account.workstreams.filter((w) => w.service === serviceId && !w.proposed)
  const needle = q.trim().toLowerCase()
  const filtered = all.filter((w) => {
    if (batch && w.batchId !== batch) return false
    if (solution && w.solution !== solution) return false
    if (supplier && w.supplier !== supplier) return false
    if (!needle) return true
    const names = w.projects.map((p) => getBuilding(account, p.buildingId).name).join(' ')
    return `${w.name} ${names}`.toLowerCase().includes(needle)
  })
  const shown = filtered.filter((w) => matchesResponsibility(w.owner, responsibility))
  const groups = rowsFor(serviceId, shown)
  const filtering = Boolean(q || batch || solution || responsibility || supplier)
  const solutions = [...new Set(all.map((w) => w.solution))]
  const suppliers = [...new Set(all.map((w) => w.supplier).filter((name): name is string => Boolean(name)))]
  const visitTotal = account.workstreams.reduce((n, w) => n + w.projects.filter((p) => p.visit && p.visit.state !== 'skip').length, 0)

  return (
    <>
      <PageHeader title={def.label} className="mb-4" actions={<ChangedKey className="p7 text-text-secondary" />} />
      <SummaryCards list={filtered} responsibility={responsibility} onResponsibility={(next) => write({ responsibility: next, state: '' })} />
      {serviceId === 'scope' && (
        <div className="mt-4 flex gap-6 border-b border-cq-border-light">
          <button type="button" onClick={() => write({ tab: '', q: '', batch: '', solution: '', responsibility: '', service: '', status: '', state: '' })} className={`-mb-px border-b-2 pb-2 text-sm font-normal ${surveys ? 'border-transparent text-cq-text-secondary' : 'border-cq-accent text-cq-text'}`}>
            Workstreams ({all.length})
          </button>
          <button type="button" onClick={() => write({ tab: 'surveys', q: '', batch: '', solution: '', responsibility: '', service: '', status: '', state: '' })} className={`-mb-px border-b-2 pb-2 text-sm font-normal ${surveys ? 'border-cq-accent text-cq-text' : 'border-transparent text-cq-text-secondary'}`}>
            Surveys ({visitTotal})
          </button>
        </div>
      )}
      {serviceId === 'tender' && (
        <div className="mt-4 flex gap-6 border-b border-cq-border-light">
          <span className="-mb-px border-b-2 border-cq-accent pb-2 text-sm font-normal text-cq-text">
            Workstreams ({all.length})
          </span>
          <span className="-mb-px cursor-default border-b-2 border-transparent pb-2 text-sm font-normal text-cq-text-secondary" aria-disabled="true">
            Briefs ({all.length})
          </span>
        </div>
      )}
      {surveys ? (
        <div className="mt-6">
          <SurveysTab />
        </div>
      ) : (
      <>
      <FilterBar selects={serviceId === 'pricing' ? 4 : 3}>
        <FilterField label="Search">
          <FilterSearch value={q} onChange={(value) => write({ q: value })} />
        </FilterField>
        <FilterField label="Batch">
          <FilterSelect value={batch} onChange={(value) => write({ batch: value })}>
            <option value="">All batches</option>
            {batches.filter((b) => wsIn(account, b.id).some((w) => w.service === serviceId)).map((b) => (
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
        <FilterField label="Responsibility">
          <FilterSelect value={responsibility} onChange={(value) => write({ responsibility: value })}>
            <option value="">All</option>
            {responsibility === BOTH_ACTIONS && <option value={BOTH_ACTIONS}>CQuel's or suppliers' action</option>}
            {(['you', 'cquel', 'suppliers', 'done'] as Owner[]).map((o) => (
              <option key={o} value={o}>
                {OWNER_LABEL[o]}
              </option>
            ))}
          </FilterSelect>
        </FilterField>
        {filtering && (
          <ClearFilters onClick={() => write({ q: '', batch: '', solution: '', responsibility: '', supplier: '', state: '' })} />
        )}
      </FilterBar>
      <div className="space-y-6">
        {groups.map((group) => {
          if (!group.rows.length) return null
          const folded = group.outcome && group.rows.length > 5 && !open
          const shown = folded ? [] : group.rows
          return (
            <section key={group.id} className="overflow-hidden rounded-xl border border-cq-border bg-white ">
              <header className="border-b border-cq-border-light py-4 pl-9 pr-5">
                <h2 className={groupTitle}>
                  {group.title} · {group.rows.length}
                </h2>
              </header>
              {shown.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px]">
                    <thead className="border-b border-cq-border-light">
                      <tr>
                        <th className={th} style={{ paddingLeft: 36 }}>Workstream</th>
                        <th className={th}>Batch</th>
                        <th className={th}>{serviceId === 'scope' ? 'Surveys' : serviceId === 'tender' ? 'Suppliers' : serviceId === 'pricing' ? 'Price' : 'Estimate'}</th>
                        <th className={th}>{group.outcome ? 'Outcome' : 'Next'}</th>
                        <th className={th}>Responsibility</th>
                        <th className={th} />
                      </tr>
                    </thead>
                    <tbody>
                      {shown.map((w) => {
                        const b = account.batches.find((x) => x.id === w.batchId)
                        const parts = group.outcome ? splitLine(sectionOutcome(w)) : nextParts(w)
                        const estimate = presentedTotal(w)
                        const extra = serviceId === 'scope' ? splitLine(surveyLine(w)) : serviceId === 'tender' ? splitLine(suppliersLine(w)) : serviceId === 'pricing' ? splitLine(priceLine(w)) : null
                        return (
                          <tr key={w.id} className="border-t border-cq-border-light">
                            <td className={td} style={{ paddingLeft: 36 }}>
                              <Link href={hrefs.workstream(w.id)} className="font-normal hover:text-cq-accent">
                                <ChangedMark w={w}>{w.name}</ChangedMark>
                              </Link>
                            </td>
                            <td className={td}>{b?.name}</td>
                            <td className={td}>
                              {extra ? (
                                <>
                                  <p>{extra.main}</p>
                                  {extra.detail && <p className="mt-0.5 text-cq-text-secondary">{extra.detail}</p>}
                                </>
                              ) : estimate.count ? (
                                <span className="font-semibold">{estimate.text}</span>
                              ) : (
                                '—'
                              )}
                            </td>
                            <td className={td}>
                              <p className={w.owner === 'you' ? 'font-semibold' : ''}>{parts.main}</p>
                              {parts.detail && <p className="mt-0.5 text-cq-text-secondary">{parts.detail}</p>}
                            </td>
                            <td className={td}>
                              <StatusPill owner={w.owner} />
                            </td>
                            <td className={td}>
                              <Link href={hrefs.workstream(w.id)} className="btn-secondary-sm">
                                View
                              </Link>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
              {folded && (
                <div className="flex items-center justify-between gap-4 bg-cq-bg py-3 pl-9 pr-5 text-sm text-cq-text-secondary">
                  <p>
                    <span className="font-semibold uppercase tracking-wide">{group.rows.length} done</span>
                  </p>
                  <button type="button" className="btn-link" onClick={() => setOpen(true)}>
                    Show
                  </button>
                </div>
              )}
            </section>
          )
        })}
      </div>
      </>
      )}
    </>
  )
}
