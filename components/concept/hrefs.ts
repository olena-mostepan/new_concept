import { SERVICES, type ServiceId } from "@/lib/concept/model";
import { WORDS } from "@/lib/concept/words";

/**
 * Two versions of the concept, no toggle between them:
 * - Ops (the main prototype) at /concept: the customer's pages plus what Ops does
 *   (create batches, add packages, fix assets, start estimates).
 * - Customer at /concept/customer: the same pages, read the way the customer sees them.
 */
export const BASE = "/concept";
export const CUSTOMER = `${BASE}/customer`;
/** @deprecated Ops is the main version at /concept now. Kept for old imports. */
export const OPS = BASE;

export type BuildingFrom = "buildings" | "workstream" | "search" | "batch";
export type BuildingVia = "batch" | "service";
export type WorkstreamFrom = "batch" | "service" | "building";
export type ConceptMode = "ops" | "customer";

/** Is this path in the customer version? */
export const isCustomerPath = (path: string) =>
  path === CUSTOMER || path.startsWith(`${CUSTOMER}/`) || path.startsWith(`${CUSTOMER}?`);

export const modeOf = (path: string): ConceptMode => (isCustomerPath(path) ? "customer" : "ops");

/** The same path without the /customer prefix, for matching routes in either version. */
export const mainPath = (path: string) =>
  isCustomerPath(path) ? `${BASE}${path.slice(CUSTOMER.length)}` : path;

/** The same page in the other version. */
export const customerPathOf = (path: string) =>
  isCustomerPath(path) ? path : `${CUSTOMER}${path.slice(BASE.length)}`;

function makeHrefs(base: string) {
  const building = (
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
    return `${base}/assets/${buildingId}${query ? `?${query}` : ""}`;
  };
  const workstream = (id: string, from?: WorkstreamFrom, buildingId?: string) => {
    const sp = new URLSearchParams();
    if (from) sp.set("from", from);
    if (buildingId) sp.set("building", buildingId);
    const query = sp.toString();
    return `${base}/packages/${id}${query ? `?${query}` : ""}`;
  };
  const batch = (id: string) => `${base}/batches/${id}`;
  return {
    overview: base,
    /** Alias of overview, so older links keep working. */
    portfolio: base,
    buildings: `${base}/assets`,
    building,
    batches: `${base}/batches`,
    batch,
    workstreams: (s?: ServiceId) => `${base}/packages${s ? `?service=${s}` : ""}`,
    service: (s: ServiceId) => `${base}/services/${s}`,
    workstream,
    project: (workstreamId: string, buildingId: string) => `${base}/assets/${buildingId}?project=${workstreamId}`,
    newBatch: `${base}/batches/new`,
    /* Ops actions live on the main pages now; these names are kept for existing callers. */
    ops: base,
    opsNewBatch: `${base}/batches/new`,
    opsBatch: batch,
    opsPackage: (id: string) => workstream(id),
    opsAsset: (buildingId: string, opts?: { package?: string }) =>
      building(buildingId, opts?.package ? { package: opts.package } : undefined),
  };
}

/** Links in the main (Ops) version. */
export const hrefs = makeHrefs(BASE);
/** Links in the customer version. */
export const customerHrefs: typeof hrefs = makeHrefs(CUSTOMER);

export const hrefsFor = (mode: ConceptMode) => (mode === "customer" ? customerHrefs : hrefs);
export const hrefsForPath = (path: string) => hrefsFor(modeOf(path));

export interface NavItem {
  id: string;
  label: string;
  href: string;
  group: "structure" | "services";
  match: (path: string) => boolean;
  /** A live workstream in this service changed in the last 7 days. */
  changed?: boolean;
}

/** One nav for both versions: Overview, Assets, then the services. Matching ignores the /customer prefix. */
export function navFor(mode: ConceptMode): NavItem[] {
  const h = hrefsFor(mode);
  return [
    {
      id: "overview",
      group: "structure",
      label: "Overview",
      href: h.overview,
      match: (p) => mainPath(p) === BASE || mainPath(p) === `${BASE}/`,
    },
    {
      id: "buildings",
      group: "structure",
      label: WORDS.Assets,
      href: h.buildings,
      match: (p) => mainPath(p).startsWith(`${BASE}/assets`),
    },
    ...SERVICES.map((s) => ({
      id: s.id,
      group: "services" as const,
      label: s.label,
      href: h.service(s.id),
      match: (p: string) => mainPath(p).startsWith(`${BASE}/services/${s.id}`),
    })),
  ];
}

/** @deprecated Use navFor(mode). */
export const CUSTOMER_NAV: NavItem[] = navFor("ops");
