import { SERVICES, type ServiceId } from '@/lib/concept/model'

export const BASE = '/concept'
export const OPS = `${BASE}/ops`

export const hrefs = {
  portfolio: BASE,
  batches: `${BASE}/batches`,
  batch: (id: string) => `${BASE}/batches/${id}`,
  workstreams: (s?: ServiceId) => `${BASE}/workstreams${s ? `?service=${s}` : ''}`,
  service: (s: ServiceId) => `${BASE}/services/${s}`,
  workstream: (id: string) => `${BASE}/workstreams/${id}`,
  project: (workstreamId: string, buildingId: string) => `${BASE}/projects/${workstreamId}/${buildingId}`,
  ops: OPS,
  opsNewBatch: `${OPS}/batches/new`,
  opsBatch: (id: string) => `${OPS}/batches/${id}`,
}

export interface NavItem {
  id: string
  label: string
  href: string
  match: (path: string) => boolean
}

export const CUSTOMER_NAV: NavItem[] = [
  { id: 'portfolio', label: 'Portfolio', href: hrefs.portfolio, match: (p) => p === BASE || p === `${BASE}/` || p.startsWith(`${BASE}/batches`) },
  { id: 'workstreams', label: 'Workstreams', href: hrefs.workstreams(), match: (p) => p.startsWith(`${BASE}/workstreams`) },
  ...SERVICES.map((s) => ({
    id: s.id,
    label: s.label,
    href: hrefs.service(s.id),
    match: (p: string) => p.startsWith(hrefs.service(s.id)),
  })),
]

export const OPS_NAV: NavItem[] = [
  { id: 'ops-portfolio', label: 'Portfolio', href: hrefs.ops, match: (p) => p === OPS || p.startsWith(`${OPS}/batches`) },
]

/** Same place on the other side, or its home */
export function counterpart(path: string): string {
  if (path.startsWith(OPS)) {
    const m = path.match(/\/ops\/batches\/([^/?]+)/)
    return m && m[1] !== 'new' ? hrefs.batch(m[1]) : BASE
  }
  const m = path.match(/\/concept\/batches\/([^/?]+)/)
  return m ? hrefs.opsBatch(m[1]) : OPS
}
