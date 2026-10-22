'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { SOLUTIONS, type SolutionId } from '@/lib/concept/model'
import { byRecentChange, customerBatches, days, deliveryLine, getBuilding, needsAttention, nextParts, sectionOutcome, splitLine, wsIn } from '@/lib/concept/derive'
import { splitDeliveryId, toDeliveryPayload } from '@/lib/concept/delivery'
import { CustomerDeliveryView } from '@/components/customer/delivery/CustomerDeliveryView'
import { ChangedMark, PageHeader, SummaryCards, YourActionOnly, groupTitle, matchesResponsibility, td, th } from './ui'
import { StatusPill } from './StatusPill'
import { hrefs } from './hrefs'
import { useConcept } from './store'

const fieldClass = 'h-10 rounded-lg border border-cq-border bg-white text-sm text-cq-text'
const selectClass = `${fieldClass} min-w-0 flex-1 appearance-none bg-[length:16px] bg-[right_0.75rem_center] bg-no-repeat pl-3 pr-10`
const selectStyle = {
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%234d5761' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
}

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
  const [open, setOpen] = useState(false)

  const write = (next: Record<string, string>) => {
    const sp = new URLSearchParams(params.toString())
    for (const [key, value] of Object.entries(next)) {
      if (value) sp.set(key, value)
      else sp.delete(key)
    }
    const query = sp.toString()
    router.replace(query ? `${hrefs.service('delivery')}?${query}` : hrefs.service('delivery'))
  }

  const all = account.workstreams.filter((w) => w.service === 'delivery' && !w.proposed)
  const payload = toDeliveryPayload(account, all)
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
  const filtered = all.filter((w) => {
    if (batch && w.batchId !== batch) return false
    if (solution && w.solution !== solution) return false
    if (supplier && w.supplier !== supplier) return false
    if (!needle) return true
    const names = w.projects.map((p) => getBuilding(account, p.buildingId).name).join(' ')
    return `${w.name} ${names}`.toLowerCase().includes(needle)
  })
  const listed = filtered.filter((w) => matchesResponsibility(w.owner, responsibility))
  const attention = byRecentChange(listed.filter(needsAttention))
  const progress = byRecentChange(listed.filter((w) => w.owner !== 'done' && !needsAttention(w)))
  const done = listed.filter((w) => w.owner === 'done').sort((a, b) => days(a.completedOn || '19 Oct 2026') - days(b.completedOn || '19 Oct 2026'))
  const groups = [
    { id: 'attention', title: 'Needs attention', rows: attention, outcome: false },
    { id: 'progress', title: 'In progress', rows: progress, outcome: false },
    { id: 'done', title: 'Done', rows: done, outcome: true },
  ]
  const batches = customerBatches(account)
  const solutions = [...new Set(all.map((w) => w.solution))]
  const suppliers = [...new Set(all.map((w) => w.supplier).filter((name): name is string => Boolean(name)))]

  return (
    <>
      <PageHeader title="Delivery" className="mb-4" />
      <SummaryCards list={filtered} responsibility={responsibility} onResponsibility={(next) => write({ responsibility: next, state: '' })} />
      <div className="mt-4 flex gap-6 border-b border-cq-border-light">
        <button type="button" onClick={() => write({ tab: '' })} className={`-mb-px border-b-2 pb-2 text-sm font-normal ${contracts ? 'border-transparent text-cq-text-secondary' : 'border-cq-accent text-cq-text'}`}>
          Workstreams ({all.length})
        </button>
        <button type="button" onClick={() => write({ tab: 'contracts' })} className={`-mb-px border-b-2 pb-2 text-sm font-normal ${contracts ? 'border-cq-accent text-cq-text' : 'border-transparent text-cq-text-secondary'}`}>
          Contracts (21)
        </button>
      </div>
      {contracts ? (
        <div className="rounded-xl border border-dashed border-cq-border bg-white px-5 py-10 text-center ">
          <p className="text-sm font-normal text-cq-text">Contracts — coming soon</p>
          <p className="mt-1 text-sm text-cq-text-secondary">Placeholder for the customer contracts view.</p>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <CustomerDeliveryView
              payload={confirmPayload}
              onPayloadChange={saveDelivery}
              embedded
              showList={false}
              showCity
              conceptRows
              bannerDetail="Voltreny sent them with its invoices. If a start date or stage is wrong, tracking will be off too."
              projectHref={(project) => {
                const parts = splitDeliveryId(project.id)
                return parts ? hrefs.project(parts.workstreamId, parts.buildingId) : hrefs.service('delivery')
              }}
            />
          </div>
          <div className="mb-6 flex flex-wrap gap-3">
            <input type="search" value={q} placeholder="Search workstreams or projects" aria-label="Search workstreams or projects" onChange={(e) => write({ q: e.target.value })} className={`${fieldClass} w-full shrink-0 px-3 sm:w-72`} />
            <select aria-label="Batch" value={batch} onChange={(e) => write({ batch: e.target.value })} className={selectClass} style={selectStyle}>
              <option value="">Batch</option>
              {batches.filter((b) => wsIn(account, b.id).some((w) => w.service === 'delivery')).map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
            <select aria-label="Solution" value={solution} onChange={(e) => write({ solution: e.target.value })} className={selectClass} style={selectStyle}>
              <option value="">Solution</option>
              {solutions.map((id) => (
                <option key={id} value={id}>{SOLUTIONS[id as SolutionId]}</option>
              ))}
            </select>
            <select aria-label="Supplier" value={supplier} onChange={(e) => write({ supplier: e.target.value })} className={selectClass} style={selectStyle}>
              <option value="">Supplier</option>
              {suppliers.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
            <YourActionOnly checked={responsibility === 'you'} onChange={(checked) => write({ responsibility: checked ? 'you' : '' })} />
          </div>
          <div className="space-y-6">
            {groups.map((group) => {
              if (!group.rows.length) return null
              const folded = group.outcome && group.rows.length > 5 && !open
              const shown = folded ? [] : group.rows
              return (
                <section key={group.id} className="overflow-hidden rounded-xl border border-cq-border bg-white ">
                  <header className="border-b border-cq-border-light py-4 pl-9 pr-5">
                    <h2 className={groupTitle}>{group.title} · {group.rows.length}</h2>
                  </header>
                  {shown.length > 0 && (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[760px]">
                        <thead className="border-b border-cq-border-light">
                          <tr>
                            <th className={th} style={{ paddingLeft: 36 }}>Workstream</th>
                            <th className={th}>Batch</th>
                            <th className={th}>Delivery</th>
                            <th className={th}>{group.outcome ? 'Outcome' : 'Next'}</th>
                            <th className={th}>Responsibility</th>
                            <th className={th} />
                          </tr>
                        </thead>
                        <tbody>
                          {shown.map((w) => {
                            const b = account.batches.find((item) => item.id === w.batchId)
                            const column = splitLine(deliveryLine(w))
                            const parts = group.outcome ? splitLine(sectionOutcome(w)) : nextParts(w)
                            const strong = group.id === 'attention'
                            return (
                              <tr key={w.id} className="border-t border-cq-border-light">
                                <td className={td} style={{ paddingLeft: 36 }}>
                                  <Link href={hrefs.workstream(w.id)} className="font-normal hover:text-cq-accent">
                                    <ChangedMark w={w}>{w.name}</ChangedMark>
                                  </Link>
                                </td>
                                <td className={td}>{b?.name}</td>
                                <td className={td}>
                                  <p>{column.main}</p>
                                  {column.detail && <p className={`mt-0.5 ${strong ? 'font-semibold' : 'text-cq-text-secondary'}`}>{column.detail}</p>}
                                </td>
                                <td className={td}>
                                  <p className={strong ? 'font-semibold' : ''}>{parts.main}</p>
                                  {parts.detail && <p className="mt-0.5 text-cq-text-secondary">{parts.detail}</p>}
                                </td>
                                <td className={td}><StatusPill owner={w.owner} /></td>
                                <td className={td}>
                                  <Link href={hrefs.workstream(w.id)} className="btn-secondary-sm">View</Link>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {folded && (
                    <button type="button" className="btn-link py-3 pl-9 pr-5" onClick={() => setOpen(true)}>
                      Show {group.rows.length} done
                    </button>
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
