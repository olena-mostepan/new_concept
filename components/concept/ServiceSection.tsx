'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { OWNER_LABEL, SOLUTIONS, service, type Owner, type ServiceId, type SolutionId, type Workstream } from '@/lib/concept/model'
import { byRecentChange, customerBatches, days, getBuilding, nextParts, presentedTotal, priceLine, sectionOutcome, splitLine, suppliersLine, surveyLine, wsIn } from '@/lib/concept/derive'
import { ChangedMark, ChapterAside, PageHeader, groupTitle, td, th, workstreamSummary } from './ui'
import { StatusPill } from './StatusPill'
import { hrefs } from './hrefs'
import { useConcept } from './store'
import { SurveysTab } from './SurveysTab'

const fieldClass = 'h-10 rounded-lg border border-cq-border bg-white text-sm text-cq-text'
const selectClass = `${fieldClass} min-w-0 flex-1 appearance-none bg-[length:16px] bg-[right_0.75rem_center] bg-no-repeat pl-3 pr-10`
const selectStyle = {
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%234d5761' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
}

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
    if (responsibility && w.owner !== responsibility) return false
    if (supplier && w.supplier !== supplier) return false
    if (!needle) return true
    const names = w.projects.map((p) => getBuilding(account, p.buildingId).name).join(' ')
    return `${w.name} ${names}`.toLowerCase().includes(needle)
  })
  const groups = rowsFor(serviceId, filtered)
  const solutions = [...new Set(all.map((w) => w.solution))]
  const suppliers = [...new Set(all.map((w) => w.supplier).filter((name): name is string => Boolean(name)))]
  const visitTotal = account.workstreams.reduce((n, w) => n + w.projects.filter((p) => p.visit && p.visit.state !== 'skip').length, 0)

  return (
    <>
      <PageHeader title={def.label} actions={<ChapterAside summary={workstreamSummary(filtered)} />} />
      {serviceId === 'scope' && (
        <div className="mb-6 flex gap-6 border-b border-cq-border-light">
          <button type="button" onClick={() => write({ tab: '', q: '', batch: '', solution: '', responsibility: '', service: '', status: '' })} className={`-mb-px border-b-2 pb-2 text-sm font-normal${surveys ? 'border-transparent text-cq-text-secondary' : 'border-cq-accent text-cq-text'}`}>
            Workstreams ({all.length})
          </button>
          <button type="button" onClick={() => write({ tab: 'surveys', q: '', batch: '', solution: '', responsibility: '', service: '', status: '' })} className={`-mb-px border-b-2 pb-2 text-sm font-normal${surveys ? 'border-cq-accent text-cq-text' : 'border-transparent text-cq-text-secondary'}`}>
            Surveys ({visitTotal})
          </button>
        </div>
      )}
      {surveys ? (
        <SurveysTab />
      ) : (
      <>
      <div className="mb-6 flex flex-wrap gap-3">
        <input
          type="search"
          value={q}
          placeholder="Search workstreams or projects"
          aria-label="Search workstreams or projects"
          onChange={(e) => write({ q: e.target.value })}
          className={`${fieldClass} w-full shrink-0 px-3 sm:w-72`}
        />
        <select aria-label="Batch" value={batch} onChange={(e) => write({ batch: e.target.value })} className={selectClass} style={selectStyle}>
          <option value="">Batch</option>
          {batches.filter((b) => wsIn(account, b.id).some((w) => w.service === serviceId)).map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
        <select aria-label="Solution" value={solution} onChange={(e) => write({ solution: e.target.value })} className={selectClass} style={selectStyle}>
          <option value="">Solution</option>
          {solutions.map((id) => (
            <option key={id} value={id}>
              {SOLUTIONS[id as SolutionId]}
            </option>
          ))}
        </select>
        {serviceId === 'pricing' && (
          <select aria-label="Supplier" value={supplier} onChange={(e) => write({ supplier: e.target.value })} className={selectClass} style={selectStyle}>
            <option value="">Supplier</option>
            {suppliers.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        )}
        <select aria-label="Responsibility" value={responsibility} onChange={(e) => write({ responsibility: e.target.value })} className={selectClass} style={selectStyle}>
          <option value="">Responsibility</option>
          {(['you', 'cquel', 'suppliers', 'done'] as Owner[]).map((o) => (
            <option key={o} value={o}>
              {OWNER_LABEL[o]}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-6">
        {groups.map((group) => {
          if (!group.rows.length) return null
          const folded = group.outcome && group.rows.length > 5 && !open
          const shown = folded ? [] : group.rows
          return (
            <section key={group.id} className="overflow-hidden rounded-xl border border-cq-border bg-white ">
              <header className="border-b border-cq-border-light px-5 py-4">
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
                <div className="flex items-center justify-between gap-4 bg-cq-bg px-5 py-3 text-sm text-cq-text-secondary">
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
