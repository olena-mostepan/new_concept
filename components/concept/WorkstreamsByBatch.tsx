'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Check, ChevronRight } from 'lucide-react'
import { SERVICES, SOLUTIONS, type ServiceId, type SolutionId, type Workstream } from '@/lib/concept/model'
import { activeProjects, batchSummary, byCompleted, byRecentChange, customerBatches, getBuilding, noun, short, stepNote } from '@/lib/concept/derive'
import { useConcept } from './store'
import { ClearFilters, FilterBar, FilterField, FilterSearch, FilterSelect, PageHeader, SummaryCards, YourActionOnly, matchesResponsibility } from './ui'
import { ServiceTag } from './ServiceTag'
import { hrefs } from './hrefs'

const rowStyle = { gridTemplateColumns: 'minmax(0,1.3fr) 170px minmax(0,1.5fr) 110px 16px' }

function WorkstreamLine({ w, done }: { w: Workstream; done?: boolean }) {
  const projects = noun(activeProjects(w).length, 'project', 'projects')
  return (
    <Link href={hrefs.workstream(w.id)} className="grid items-center gap-x-6 border-t border-border-light px-6 py-3 hover:bg-black-1" style={rowStyle}>
      {done ? (
        <p className="min-w-0">
          <span className="p6 text-text-tertiary">{w.name}</span>
          <span className="p7 text-text-tertiary"> · {projects}</span>
        </p>
      ) : (
        <div className="min-w-0">
          <p className="h8 text-text-title">{w.name}</p>
          <p className="p7 text-text-tertiary">{projects}</p>
        </div>
      )}
      <ServiceTag s={w.service} muted={done} />
      {done ? (
        <p className="flex min-w-0 items-center gap-1.5 text-text-tertiary">
          <Check className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
          <span className="p6">Done {short(w.completedOn)}</span>
        </p>
      ) : (
        <p className="min-w-0 p6 text-text-secondary">{stepNote(w)}</p>
      )}
      {w.owner === 'you' && !done ? (
        <p className="flex items-center gap-1.5 p6 text-text-primary">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-6" aria-hidden />
          Your action
        </p>
      ) : (
        <span />
      )}
      <ChevronRight className="h-4 w-4 text-text-tertiary" aria-hidden />
    </Link>
  )
}

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
  const responsibility = params.get('responsibility') === 'you' ? 'you' : ''

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
        : hrefs.batches
      : hrefs.batches
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
      <PageHeader title="Workstreams" className="mb-4" />
      <SummaryCards
        total={filtered.length}
        batches={new Set(filtered.map((w) => w.batchId)).size}
        yourAction={filtered.filter((w) => w.owner === 'you').length}
        live={filtered.filter((w) => w.owner !== 'done').length}
        serviceLabel="progress"
        thirdLabel="Done"
        thirdCount={filtered.filter((w) => w.owner === 'done').length}
        thirdLine="done"
        responsibility={responsibility}
        onResponsibility={(next) => write({ responsibility: next })}
      />

      <FilterBar selects={3}>
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
        <YourActionOnly checked={responsibility === 'you'} onChange={(checked) => write({ responsibility: checked ? 'you' : '' })} />
        {filtering && (
          <ClearFilters onClick={() => write({ q: '', batch: '', service: serviceId ? service : '', solution: '', responsibility: '' })} />
        )}
      </FilterBar>

      <div className="space-y-4">
        {batches.map((b) => {
          const rows = shown.filter((w) => w.batchId === b.id)
          if (!rows.length) return null
          const serviceAt = (id: string) => SERVICES.findIndex((s) => s.id === id)
          const live = byRecentChange(rows.filter((w) => w.owner !== 'done')).sort((a, c) => serviceAt(a.service) - serviceAt(c.service))
          const done = byCompleted(rows.filter((w) => w.owner === 'done'))
          const yours = live.filter((w) => w.owner === 'you').length
          const expanded = Boolean(open[b.id]) && responsibility !== 'you'
          return (
            <section key={b.id} className="overflow-hidden rounded-xl border border-border-dark bg-white">
              <header className="flex items-start justify-between gap-6 border-b border-border-light px-6 py-4">
                <div className="min-w-0">
                  <h2 className="h7 text-text-primary">{b.name}</h2>
                  <p className="mt-1 p7 text-text-secondary">{batchSummary(account, b).line}</p>
                </div>
                <div className="flex shrink-0 items-center gap-5">
                  {yours > 0 && (
                    <p className="flex items-center gap-1.5 p7 text-text-primary">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-6" aria-hidden />
                      Your action: {yours}
                    </p>
                  )}
                  <Link href={hrefs.batch(b.id)} className="h8 text-text-primary underline underline-offset-[3px] decoration-border-dark">
                    View batch
                  </Link>
                </div>
              </header>
              {(live.length > 0 || expanded) && (
                <div className="grid items-center gap-x-6 border-b border-border-light px-6 py-2 s3 text-text-tertiary" style={rowStyle}>
                  <span>Workstream</span>
                  <span>Service</span>
                  <span>Current step</span>
                  <span />
                  <span />
                </div>
              )}
              {live.map((w) => (
                <WorkstreamLine key={w.id} w={w} />
              ))}
              {done.length > 0 && responsibility !== 'you' && (
                <div className="flex items-center justify-between border-t border-border-light bg-black-1 px-6 py-3">
                  <span className="h9 text-text-secondary">Done · {done.length}</span>
                  <button type="button" className="btn-link shrink-0" onClick={() => setOpen((v) => ({ ...v, [b.id]: !v[b.id] }))}>
                    {open[b.id] ? 'Hide' : 'Show'}
                  </button>
                </div>
              )}
              {expanded && done.map((w) => <WorkstreamLine key={w.id} w={w} done />)}
            </section>
          )
        })}
      </div>
    </div>
  )
}
