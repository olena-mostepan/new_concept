'use client'

import { Fragment } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { SERVICES, service, type Workstream } from '@/lib/concept/model'
import { customerBatches, days, getBuilding, recordedVisits, visitBucket, visitCountLabel, visitStateLabel } from '@/lib/concept/derive'
import { groupTitle, td, th } from './ui'
import { hrefs } from './hrefs'
import { useConcept } from './store'

const fieldClass = 'h-10 rounded-lg border border-cq-border bg-white text-sm text-cq-text'
const selectClass = `${fieldClass} min-w-0 flex-1 appearance-none bg-[length:16px] bg-[right_0.75rem_center] bg-no-repeat pl-3 pr-10`
const selectStyle = {
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%234d5761' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
}

const BUCKETS = [
  { id: 'unbooked', title: 'To be booked' },
  { id: 'booked', title: 'Booked' },
  { id: 'done', title: 'Done' },
] as const

function recency(w: Workstream) {
  const ons = w.projects.map((p) => p.visit?.on).filter((d): d is string => Boolean(d))
  if (ons.length) return Math.min(...ons.map(days))
  if (w.surveyNote?.includes('3 Oct')) return days('3 Oct 2026')
  if (w.surveyNote === 'July') return days('1 Jul 2026')
  return 9999
}

export function SurveysTab() {
  const { account } = useConcept()
  const router = useRouter()
  const params = useSearchParams()
  const q = params.get('q') ?? ''
  const batch = params.get('batch') ?? ''
  const serviceId = params.get('service') ?? ''
  const status = params.get('status') ?? ''

  const write = (next: Record<string, string>) => {
    const sp = new URLSearchParams(params.toString())
    sp.set('tab', 'surveys')
    for (const [key, value] of Object.entries(next)) {
      if (value) sp.set(key, value)
      else sp.delete(key)
    }
    router.replace(`${hrefs.service('scope')}?${sp.toString()}`)
  }

  const needle = q.trim().toLowerCase()
  const withVisits = account.workstreams.filter((w) => visitBucket(w))
  const filtered = withVisits.filter((w) => {
    if (batch && w.batchId !== batch) return false
    if (serviceId && w.service !== serviceId) return false
    if (!needle) return true
    const names = w.projects.map((p) => getBuilding(account, p.buildingId).name).join(' ')
    return `${w.name} ${names}`.toLowerCase().includes(needle)
  })

  const services = [...new Set(withVisits.map((w) => w.service))]
  const batches = customerBatches(account).filter((b) => withVisits.some((w) => w.batchId === b.id))

  return (
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
          {batches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
        <select aria-label="Service" value={serviceId} onChange={(e) => write({ service: e.target.value })} className={selectClass} style={selectStyle}>
          <option value="">Service</option>
          {SERVICES.filter((s) => services.includes(s.id)).map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
        <select aria-label="Status" value={status} onChange={(e) => write({ status: e.target.value })} className={selectClass} style={selectStyle}>
          <option value="">Status</option>
          {BUCKETS.map((b) => (
            <option key={b.id} value={b.id}>
              {b.title}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-6">
        {BUCKETS.filter((bucket) => !status || status === bucket.id).map((bucket) => {
          const rows = filtered.filter((w) => visitBucket(w) === bucket.id).sort((a, b) => recency(a) - recency(b))
          const visits = filtered.reduce((n, w) => n + recordedVisits(w).filter((v) => v.state === bucket.id).length, 0)
          if (!rows.length && !visits) return null
          return (
            <section key={bucket.id} className="overflow-hidden rounded-xl border border-cq-border bg-white shadow-sm">
              <header className="border-b border-cq-border-light px-5 py-4">
                <h2 className={groupTitle}>
                  {bucket.title} · {visits}
                </h2>
              </header>
              {rows.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px]">
                    <thead className="border-b border-cq-border-light">
                      <tr>
                        <th className={th}>Workstream</th>
                        <th className={th}>Batch</th>
                        <th className={th}>Service</th>
                        <th className={th}>Visits</th>
                        <th className={th}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((w) => {
                        const b = account.batches.find((x) => x.id === w.batchId)
                        const states = new Set(recordedVisits(w).map((v) => v.state))
                        const mixed = states.size > 1
                        return (
                          <Fragment key={w.id}>
                            <tr className="border-t border-cq-border-light">
                              <td className={td}>
                                <Link href={hrefs.workstream(w.id)} className="font-normal hover:text-cq-accent">
                                  {w.name}
                                </Link>
                              </td>
                              <td className={td}>{b?.name}</td>
                              <td className={td}>{service(w.service).label}</td>
                              <td className={td}>{visitCountLabel(w)}</td>
                              <td className={td}>
                                {w.surveyDocs ? (
                                  <button type="button" className="btn-secondary-sm">
                                    Survey documents
                                  </button>
                                ) : (
                                  <Link href={hrefs.workstream(w.id)} className="btn-secondary-sm">
                                    View
                                  </Link>
                                )}
                              </td>
                            </tr>
                            {mixed &&
                              w.projects
                                .filter((p) => p.visit && p.visit.state !== 'skip')
                                .map((p) => (
                                  <tr key={`${w.id}-${p.buildingId}`} className="border-t border-cq-border-light bg-cq-bg">
                                    <td className={`${td} pl-10 text-cq-text-secondary`}>{getBuilding(account, p.buildingId).name}</td>
                                    <td className={td} />
                                    <td className={td} />
                                    <td className={td} />
                                    <td className={`${td} text-cq-text-secondary`}>{visitStateLabel(p.visit!)}</td>
                                  </tr>
                                ))}
                          </Fragment>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )
        })}
      </div>
    </>
  )
}
