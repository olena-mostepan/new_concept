import { SERVICES, type ServiceId } from '@/lib/concept/model'

export const BASE = '/concept'
export const OPS = `${BASE}/ops`

export const hrefs = {
  portfolio: BASE,
  batches: `${BASE}/batches`,
  batch: (id: string) => `${BASE}/batches/${id}`,
  workstreams: (s?: ServiceId) => `${BASE}/workstreams${s ? `?service=${s}` : ''}`,
  service: (s: ServiceId) => `${BASE}/services/${s}`,
  workstream: (id: string, from?: 'batch' | 'service') => `${BASE}/workstreams/${id}${from ? `?from=${from}` : ''}`,
  project: (workstreamId: string, buildingId: string) => `${BASE}/projects/${workstreamId}/${buildingId}`,
  ops: OPS,
  opsNewBatch: `${OPS}/batches/new`,
  opsBatch: (id: string) => `${OPS}/batches/${id}`,
}

export interface NavItem {
  id: string
  label: string
  href: string
  group: 'structure' | 'services'
  match: (path: string) => boolean
  /** A live workstream in this service changed in the last 7 days. */
  changed?: boolean
}

export const CUSTOMER_NAV: NavItem[] = [
  { id: 'portfolio', group: 'structure', label: 'Portfolio', href: hrefs.portfolio, match: (p) => p === BASE || p === `${BASE}/` },
  { id: 'batches', group: 'structure', label: 'Batches', href: hrefs.batches, match: (p) => p.startsWith(`${BASE}/batches`) || p.startsWith(`${BASE}/workstreams`) },
  ...SERVICES.map((s) => ({
    id: s.id,
    group: 'services' as const,
    label: s.label,
    href: hrefs.service(s.id),
    match: (p: string) => p.startsWith(hrefs.service(s.id)),
  })),
]

/** The ops bar stays the previous customer nav: Portfolio, Workstreams, then the services. */
export const OPS_NAV: NavItem[] = [
  { id: 'ops-portfolio', group: 'structure', label: 'Portfolio', href: hrefs.ops, match: (p) => p === OPS || p === `${OPS}/` },
  { id: 'workstreams', group: 'structure', label: 'Workstreams', href: `${BASE}/workstreams`, match: (p) => p.startsWith(`${BASE}/workstreams`) },
  ...SERVICES.map((s) => ({
    id: s.id,
    group: 'services' as const,
    label: s.label,
    href: hrefs.service(s.id),
    match: (p: string) => p.startsWith(hrefs.service(s.id)),
  })),
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
