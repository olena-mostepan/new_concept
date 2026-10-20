'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { OWNER_LABEL, SERVICES, SOLUTIONS, type Owner, type ServiceId, type SolutionId, type Workstream } from '@/lib/concept/model'
import { batchOwner, buildingProgress, byRecentChange, customerBatches, doneFold, getBuilding, nextParts } from '@/lib/concept/derive'
import { useConcept } from './store'
import { BOTH_ACTIONS, Bar, ChangedKey, ChangedMark, ClearFilters, FilterBar, FilterField, FilterSearch, FilterSelect, PageHeader, SummaryCards, matchesResponsibility, td, th } from './ui'
import { ServiceTag } from './ServiceTag'
import { StatusPill } from './StatusPill'
import { hrefs } from './hrefs'

const OWNERS: Owner[] = ['you', 'cquel', 'suppliers', 'done']

function matchesQuery(accountBuildings: (id: string) => string, w: Workstream, q: string) {
  if (!q) return true
  const hay = [w.name, ...w.projects.map((p) => accountBuildings(p.buildingId))].join(' ').toLowerCase()
  return hay.includes(q.trim().toLowerCase())
}

export function WorkstreamsByBatch({ serviceId }: { serviceId?: ServiceId }) {
  const router = useRouter()
  const params = useSearchParams()
  const { account } = useConcept()
  const [open, setOpen] = useState<Record<string, boolean>>({})

  const q = params.get('q') ?? ''
  const batchId = params.get('batch') ?? ''
  const service = serviceId ?? ((params.get('service') as ServiceId | null) || '')
  const solution = (params.get('solution') as SolutionId | null) || ''
  const responsibility = params.get('responsibility') ?? ''

  const batches = customerBatches(account)
  const shared = account.workstreams.filter((w) => batches.some((b) => b.id === w.batchId))

  const write = (patch: { q?: string; batch?: string; service?: string; solution?: string; responsibility?: string }) => {
    const next = {
      q,
      batch: batchId,
      service: serviceId ?? (params.get('service') ?? ''),
      solution,
      responsibility,
      ...patch,
    }
    const rest = new URLSearchParams()
    for (const [key, value] of Object.entries(next)) {
      if (!value || key === 'service') continue
      rest.set(key, value)
    }
    const qs = rest.toString()
    const path = serviceId
      ? next.service
        ? hrefs.service(next.service as ServiceId)
        : hrefs.workstreams()
      : hrefs.workstreams()
    if (!serviceId && next.service) rest.set('service', next.service)
    const query = serviceId ? qs : rest.toString()
    router.replace(query ? `${path}?${query}` : path)
  }

  const filtered = shared.filter((w) => {
    if (service && w.service !== service) return false
    if (batchId && w.batchId !== batchId) return false
    if (solution && w.solution !== solution) return false
    return matchesQuery((id) => getBuilding(account, id).name, w, q)
  })
  const shown = filtered.filter((w) => matchesResponsibility(w.owner, responsibility))
  const filtering = Boolean(q || batchId || service || solution || responsibility)

  const solutions = [...new Set(shared.map((w) => w.solution))]

  return (
    <div>
      <PageHeader title="Workstreams" className="mb-4" actions={<ChangedKey className="p7 text-text-secondary" />} />
      <SummaryCards list={filtered} responsibility={responsibility} onResponsibility={(next) => write({ responsibility: next })} />

      <FilterBar selects={4}>
        <FilterField label="Search">
          <FilterSearch value={q} onChange={(value) => write({ q: value })} />
        </FilterField>
        <FilterField label="Batch">
          <FilterSelect value={batchId} onChange={(value) => write({ batch: value })}>
            <option value="">All batches</option>
            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </FilterSelect>
        </FilterField>
        <FilterField label="Service">
          <FilterSelect value={service} onChange={(value) => write({ service: value })}>
            <option value="">All services</option>
            {SERVICES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </FilterSelect>
        </FilterField>
        <FilterField label="Solution">
          <FilterSelect value={solution} onChange={(value) => write({ solution: value })}>
            <option value="">All solutions</option>
            {solutions.map((id) => (
              <option key={id} value={id}>
                {SOLUTIONS[id]}
              </option>
            ))}
          </FilterSelect>
        </FilterField>
        <FilterField label="Responsibility">
          <FilterSelect value={responsibility} onChange={(value) => write({ responsibility: value })}>
            <option value="">All</option>
            {responsibility === BOTH_ACTIONS && <option value={BOTH_ACTIONS}>CQuel's or suppliers' action</option>}
            {OWNERS.map((o) => (
              <option key={o} value={o}>
                {OWNER_LABEL[o]}
              </option>
            ))}
          </FilterSelect>
        </FilterField>
        {filtering && (
          <ClearFilters onClick={() => write({ q: '', batch: '', service: serviceId ? service : '', solution: '', responsibility: '' })} />
        )}
      </FilterBar>

      <div className="space-y-6">
        {batches.map((b) => {
          const rows = shown.filter((w) => w.batchId === b.id)
          if (!rows.length) return null
          const live = byRecentChange(rows.filter((w) => w.owner !== 'done'))
          const done = rows.filter((w) => w.owner === 'done')
          const owner = batchOwner(account, b)
          const expanded = open[b.id] || responsibility === 'done'
          return (
            <section key={b.id} className="overflow-hidden rounded-xl border border-cq-border bg-white ">
              <header className="flex flex-wrap items-start justify-between gap-4 border-b border-cq-border-light py-4 pl-9 pr-5">
                <div className="min-w-0">
                  <h2 className="text-base font-semibold text-cq-text">{b.name}</h2>
                  <p className="mt-1 text-sm text-cq-text-secondary">
                    {b.goal} · {b.buildingIds.length} buildings{b.target ? ` · by ${b.target}` : ''}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  {owner !== 'you' && <StatusPill owner={owner} />}
                  <Link href={hrefs.batch(b.id)} className="btn-secondary-sm">
                    View batch
                  </Link>
                </div>
              </header>
              {(live.length > 0 || expanded) && (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[880px]">
                    <thead className="border-b border-cq-border-light">
                      <tr>
                        <th className={th} style={{ paddingLeft: 36 }}>Workstream</th>
                        <th className={th}>Service</th>
                        <th className={th}>Supplier</th>
                        <th className={th}>Progress</th>
                        <th className={th}>Next</th>
                        <th className={th}>Responsibility</th>
                        <th className={th} />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-cq-border-light">
                      {(expanded ? [...live, ...done] : live).map((w) => {
                        const progress = buildingProgress(w)
                        const parts = nextParts(w)
                        return (
                          <tr key={w.id}>
                            <td className={td} style={{ paddingLeft: 36 }}>
                              <Link href={hrefs.workstream(w.id)} className="font-normal text-cq-text hover:text-cq-accent">
                                <ChangedMark w={w}>{w.name}</ChangedMark>
                              </Link>
                            </td>
                            <td className={td}>
                              <ServiceTag s={w.service} />
                            </td>
                            <td className={td}>{w.supplier ?? '—'}</td>
                            <td className={td}>
                              <span className="tabular-nums">
                                {progress.done} of {progress.total} projects done
                              </span>
                              <Bar done={progress.done} total={progress.total} className="mt-1.5 max-w-40" />
                            </td>
                            <td className={td}>
                              <p className={w.owner === 'you' ? 'font-semibold text-cq-text' : 'text-cq-text'}>{parts.main}</p>
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
              {done.length > 0 && responsibility === '' && (
                <div className="flex items-center justify-between gap-4 border-t border-cq-border-light bg-cq-bg py-3 pl-9 pr-5 text-sm text-cq-text-secondary">
                  <p>
                    <span className="font-semibold uppercase tracking-wide">Done · {done.length}</span> {doneFold(done)}
                  </p>
                  <button type="button" className="btn-link shrink-0" onClick={() => setOpen((v) => ({ ...v, [b.id]: !v[b.id] }))}>
                    {open[b.id] ? 'Hide' : 'Show'}
                  </button>
                </div>
              )}
            </section>
          )
        })}
      </div>
    </div>
  )
}
