import {
  service,
  SERVICES,
  type Account,
  type Workstream,
} from "@/lib/concept/model";
import { getBatch, getBuilding, getWorkstream } from "@/lib/concept/derive";
import { WORDS } from "@/lib/concept/words";
import { hrefs } from "./hrefs";

export type Crumb = { label: string; href?: string; tab: string };

type Query = { get(key: string): string | null };

/** At most three crumbs. The active tab is whichever tab the first crumb belongs to. */
export function trimCrumbs(crumbs: Crumb[]): Crumb[] {
  return crumbs.length > 3 ? crumbs.slice(crumbs.length - 3) : crumbs;
}

export function workstreamCrumbs(
  account: Account,
  w: Workstream,
  query: Query,
): Crumb[] {
  const batch = getBatch(account, w.batchId);
  const from = query.get("from");
  if (from === "service") {
    return [
      {
        label: service(w.service).label,
        href: hrefs.service(w.service),
        tab: w.service,
      },
      { label: w.name, tab: w.service },
    ];
  }
  if (from === "building") {
    return [
      {
        label: "Overview",
        href: hrefs.overview,
        tab: "overview",
      },
      {
        label: batch?.name ?? "Batch",
        href: batch ? hrefs.batch(w.batchId) : hrefs.overview,
        tab: "overview",
      },
      { label: w.name, tab: "overview" },
    ];
  }
  return [
    {
      label: "Overview",
      href: hrefs.overview,
      tab: "overview",
    },
    {
      label: batch?.name ?? "Batch",
      href: batch ? hrefs.batch(batch.id) : hrefs.overview,
      tab: "overview",
    },
    { label: w.name, tab: "overview" },
  ];
}

export function buildingCrumbs(
  account: Account,
  buildingId: string,
  query: Query,
): Crumb[] {
  const building = getBuilding(account, buildingId);
  const name = building?.name ?? WORDS.Asset;
  const from = query.get("from");
  const via = query.get("via");
  const wsId = query.get("ws") || query.get("project");
  if (from === "batch") {
    const requested = query.get("batch");
    const batch =
      (requested && getBatch(account, requested)) ||
      account.batches.find(
        (item) =>
          item.planState !== "draft" && item.buildingIds.includes(buildingId),
      );
    return [
      {
        label: "Overview",
        href: hrefs.overview,
        tab: "overview",
      },
      {
        label: batch?.name ?? "Batch",
        href: batch ? hrefs.batch(batch.id) : hrefs.overview,
        tab: "overview",
      },
      { label: name, tab: "overview" },
    ];
  }
  if (from === "workstream" && wsId) {
    const w = getWorkstream(account, wsId);
    if (w && via === "service") {
      return trimCrumbs([
        {
          label: service(w.service).label,
          href: hrefs.service(w.service),
          tab: w.service,
        },
        {
          label: w.name,
          href: hrefs.workstream(w.id, "service"),
          tab: w.service,
        },
        { label: name, tab: w.service },
      ]);
    }
    if (w && via === "batch") {
      const batch = getBatch(account, w.batchId);
      return trimCrumbs([
        {
          label: "Overview",
          href: hrefs.overview,
          tab: "overview",
        },
        {
          label: batch?.name ?? "Batch",
          href: batch ? hrefs.batch(batch.id) : hrefs.overview,
          tab: "overview",
        },
        {
          label: w.name,
          href: hrefs.workstream(w.id, "batch"),
          tab: "overview",
        },
        { label: name, tab: "overview" },
      ]);
    }
    if (w) {
      const batch = getBatch(account, w.batchId);
      return [
        {
          label: "Overview",
          href: hrefs.overview,
          tab: "overview",
        },
        {
          label: batch?.name ?? "Batch",
          href: batch ? hrefs.batch(batch.id) : hrefs.overview,
          tab: "overview",
        },
        {
          label: w.name,
          href: hrefs.workstream(w.id),
          tab: "overview",
        },
        { label: name, tab: "overview" },
      ];
    }
  }
  return [
    { label: WORDS.Assets, href: hrefs.buildings, tab: "buildings" },
    { label: name, tab: "buildings" },
  ];
}

/** The active tab follows the first breadcrumb, not the URL, once you leave a section page. */
export function activeCustomerTab(
  pathname: string,
  query: Query,
  account: Account,
): string {
  if (pathname === hrefs.overview || pathname === `${hrefs.overview}/`)
    return "overview";
  if (pathname === hrefs.buildings || pathname === `${hrefs.buildings}/`)
    return "buildings";
  const section = SERVICES.find((item) =>
    pathname.startsWith(hrefs.service(item.id)),
  );
  if (section) return section.id;
  if (/^\/concept\/batches\/[^/]+/.test(pathname)) return "overview";
  const workstream = pathname.match(/^\/concept\/packages\/([^/]+)/);
  if (workstream) {
    const w = getWorkstream(account, workstream[1]);
    return w
      ? (workstreamCrumbs(account, w, query)[0]?.tab ?? "overview")
      : "overview";
  }
  const building = pathname.match(/^\/concept\/assets\/([^/]+)/);
  if (building)
    return buildingCrumbs(account, building[1], query)[0]?.tab ?? "buildings";
  return "overview";
}
