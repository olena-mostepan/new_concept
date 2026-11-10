import { SERVICES, type ServiceId } from "@/lib/concept/model";
import { WORDS } from "@/lib/concept/words";

export const BASE = "/concept";
export const OPS = `${BASE}/ops`;

export type BuildingFrom = "buildings" | "workstream" | "search" | "batch";
export type BuildingVia = "batch" | "service";
export type WorkstreamFrom = "batch" | "service" | "building";

export const hrefs = {
  overview: BASE,
  /** Alias of overview, so older links keep working. */
  portfolio: BASE,
  buildings: `${BASE}/assets`,
  building: (
    buildingId: string,
    opts?: {
      project?: string;
      from?: BuildingFrom;
      ws?: string;
      via?: BuildingVia;
      batch?: string;
      package?: string;
      /** @deprecated Ignored; use tab */
      service?: string;
      tab?: string;
    },
  ) => {
    const sp = new URLSearchParams();
    if (opts?.project) sp.set("project", opts.project);
    if (opts?.from) sp.set("from", opts.from);
    if (opts?.ws) sp.set("ws", opts.ws);
    if (opts?.via) sp.set("via", opts.via);
    if (opts?.batch) sp.set("batch", opts.batch);
    if (opts?.package) sp.set("package", opts.package);
    if (opts?.tab) sp.set("tab", opts.tab);
    if (opts?.service) sp.set("service", opts.service);
    const query = sp.toString();
    return `${BASE}/assets/${buildingId}${query ? `?${query}` : ""}`;
  },
  batches: `${BASE}/batches`,
  batch: (id: string) => `${BASE}/batches/${id}`,
  workstreams: (s?: ServiceId) => `${BASE}/packages${s ? `?service=${s}` : ""}`,
  service: (s: ServiceId) => `${BASE}/services/${s}`,
  workstream: (id: string, from?: WorkstreamFrom, buildingId?: string) => {
    const sp = new URLSearchParams();
    if (from) sp.set("from", from);
    if (buildingId) sp.set("building", buildingId);
    const query = sp.toString();
    return `${BASE}/packages/${id}${query ? `?${query}` : ""}`;
  },
  project: (workstreamId: string, buildingId: string) =>
    `${BASE}/assets/${buildingId}?project=${workstreamId}`,
  ops: OPS,
  opsNewBatch: `${OPS}/batches/new`,
  opsBatch: (id: string) => `${OPS}/batches/${id}`,
  opsPackage: (id: string) => `${OPS}/packages/${id}`,
  opsAsset: (
    buildingId: string,
    opts?: { package?: string },
  ) => {
    const sp = new URLSearchParams();
    if (opts?.package) sp.set("package", opts.package);
    const q = sp.toString();
    return `${OPS}/assets/${buildingId}${q ? `?${q}` : ""}`;
  },
};

export interface NavItem {
  id: string;
  label: string;
  href: string;
  group: "structure" | "services";
  match: (path: string) => boolean;
  /** A live workstream in this service changed in the last 7 days. */
  changed?: boolean;
}

export const CUSTOMER_NAV: NavItem[] = [
  {
    id: "overview",
    group: "structure",
    label: "Overview",
    href: hrefs.overview,
    match: (p) => p === BASE || p === `${BASE}/`,
  },
  {
    id: "buildings",
    group: "structure",
    label: WORDS.Assets,
    href: hrefs.buildings,
    match: (p) => p.startsWith(`${BASE}/assets`),
  },
  ...SERVICES.map((s) => ({
    id: s.id,
    group: "services" as const,
    label: s.label,
    href: hrefs.service(s.id),
    match: (p: string) => p.startsWith(hrefs.service(s.id)),
  })),
];

/** The ops bar: Overview, Packages, then the services. Ops screens say package and asset. */
export const OPS_NAV: NavItem[] = [
  {
    id: "ops-portfolio",
    group: "structure",
    label: "Overview",
    href: hrefs.ops,
    match: (p) => p === OPS || p === `${OPS}/`,
  },
  {
    id: "workstreams",
    group: "structure",
    label: WORDS.Packages,
    href: hrefs.workstreams(),
    match: (p) => p.startsWith(`${BASE}/packages`),
  },
  ...SERVICES.map((s) => ({
    id: s.id,
    group: "services" as const,
    label: s.label,
    href: hrefs.service(s.id),
    match: (p: string) => p.startsWith(hrefs.service(s.id)),
  })),
];

/** Same place on the other side, or its home */
export function counterpart(path: string): string {
  if (path.startsWith(OPS)) {
    const pkg = path.match(/\/ops\/packages\/([^/?]+)/);
    if (pkg) return hrefs.workstream(pkg[1]);
    const asset = path.match(/\/ops\/assets\/([^/?]+)/);
    if (asset) return hrefs.building(asset[1]);
    const m = path.match(/\/ops\/batches\/([^/?]+)/);
    return m && m[1] !== "new" ? hrefs.batch(m[1]) : BASE;
  }
  const pkg = path.match(/\/concept\/packages\/([^/?]+)/);
  if (pkg) return hrefs.opsPackage(pkg[1]);
  const asset = path.match(/\/concept\/assets\/([^/?]+)/);
  if (asset) return hrefs.opsAsset(asset[1]);
  const m = path.match(/\/concept\/batches\/([^/?]+)/);
  return m ? hrefs.opsBatch(m[1]) : OPS;
}
