"use client";

import type { ReactNode } from "react";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import * as Tabs from "@radix-ui/react-tabs";
import {
  activeProjects,
  batchActivity,
  buildingChanged,
  getBatch,
  getBuilding,
  getWorkstream,
  closedOnDate,
  isClosed,
  isCompleted,
  isContinuedAway,
  noun,
  parse,
  phasesIn,
  placeNoun,
  routeStages,
  rowIsInactive,
  short,
  solutionName,
  wsIn,
  wsInAll,
} from "@/lib/concept/derive";
import { endingRowLine, endingTitle, leftHowLabel } from "@/lib/concept/moves";
import { nAssets, nPackages, nProjects } from "@/lib/concept/words";
import { formatDate } from "@/lib/concept/i18n/format";
import { t, type Lang } from "@/lib/concept/i18n";
import { useConceptI18n } from "./useConceptI18n";
import {
  pricingNotNeeded,
  service as serviceDef,
  SERVICES,
  SERVICE_LABEL,
  SOLUTIONS,
  type Account,
  type Batch,
  type ProjectRow,
  type ServiceId,
  type Workstream,
} from "@/lib/concept/model";
import {
  Button,
  Icon,
  Card,
  CardLink,
  ChangedDot,
  DocumentList,
  ListMore,
  ChipTrack,
  OwnerPill,
  ServiceIcon,
  FactsRow,
  TypeLabelInfo,
  RoundTick,
  focusRing,
  groupTitle,
  tableRowLinkClass,
  tableRowNameCellClass,
  tabListClass,
  tabTriggerClass,
} from "./ui";
import { RouteWithNeeds } from "./RouteWithNeeds";
import { RouteGates } from "./RouteOptions";
import { SiteAssetList } from "./PilotSite";
import { useHrefs } from "./useHrefs";
import { useConcept } from "./store";
import { cn } from "@/lib/utils";

function ActivityList({ items }: { items: Account["activity"] }) {
  const { t, lang } = useConceptI18n();
  return (
    <ul>
      {items.map((item, index) => (
        <li
          key={`${item.date}-${item.title}`}
          className={`flex justify-between gap-4 py-3 ${index > 0 ? "border-t border-border-light" : ""}`}
        >
          <div className="min-w-0">
            <p className="h8 text-text-title">{t(item.title)}</p>
            <p className="p7 text-text-secondary">{t(item.text)}</p>
          </div>
          <span className="shrink-0 whitespace-nowrap p7 text-text-tertiary">
            {formatDate(item.date, lang)}
          </span>
        </li>
      ))}
    </ul>
  );
}

function aside(text: string) {
  return <span className="p7 text-text-secondary">{text}</span>;
}

function sentence(text: string) {
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : text;
}

type ExtraFilter = "" | "dropped" | "moved" | "ended";

/** Building has at least one live (non-inactive) project row in this batch. */
function batchProjectsForBuilding(
  account: Account,
  batch: Batch,
  buildingId: string,
): { workstream: Workstream; row: ProjectRow }[] {
  const out: { workstream: Workstream; row: ProjectRow }[] = [];
  for (const w of wsInAll(account, batch.id)) {
    if (w.proposed || isClosed(w)) continue;
    for (const row of w.projects) {
      if (row.buildingId !== buildingId) continue;
      if (!rowIsInactive(row)) out.push({ workstream: w, row });
    }
  }
  return out;
}

/** Rows that ended: in a package that ended (supplier outside CQuel, not going ahead), or an asset that stopped when the rest continued. */
function endedRows(
  account: Account,
  batch: Batch,
  buildingId: string,
): { workstream: Workstream; row: ProjectRow }[] {
  const out: { workstream: Workstream; row: ProjectRow }[] = [];
  for (const w of wsInAll(account, batch.id)) {
    if (w.proposed) continue;
    const packageEnded = Boolean(w.ending && w.ending.kind !== "continued");
    for (const row of w.projects) {
      if (row.buildingId !== buildingId) continue;
      if (row.left?.kind === "not_going_ahead" || (packageEnded && !row.left))
        out.push({ workstream: w, row });
    }
  }
  return out;
}

function countEndedAssets(account: Account, batch: Batch): number {
  return batch.buildingIds.filter(
    (id) => endedRows(account, batch, id).length > 0,
  ).length;
}

/** "After Tender · 9 Oct" for a package that continued from another one. */
function afterLine(account: Account, w: Workstream, lang: Lang): string | null {
  if (w.from?.kind !== "continued") return null;
  const src = getWorkstream(account, w.from.workstreamId);
  if (!src) return null;
  return t(
    lang,
    "After {0} · {1}",
    t(lang, serviceDef(src.service).label),
    short(w.from.on, lang),
  );
}

function inactiveLeftRows(
  account: Account,
  batch: Batch,
  buildingId: string,
): { workstream: Workstream; row: ProjectRow }[] {
  const out: { workstream: Workstream; row: ProjectRow }[] = [];
  for (const w of wsInAll(account, batch.id)) {
    if (w.proposed) continue;
    for (const row of w.projects) {
      if (row.buildingId !== buildingId) continue;
      if (!rowIsInactive(row)) continue;
      const k = row.left?.kind;
      if (k === "dropped" || k === "moved") out.push({ workstream: w, row });
    }
  }
  return out;
}

function countAssetsWithLiveInService(
  account: Account,
  batch: Batch,
  serviceId: ServiceId,
): number {
  const ids = new Set<string>();
  for (const w of wsIn(account, batch.id)) {
    if (w.proposed || w.service !== serviceId) continue;
    for (const row of w.projects) {
      if (rowIsInactive(row)) continue;
      ids.add(row.buildingId);
    }
  }
  return ids.size;
}

function countAssetsAnyLive(account: Account, batch: Batch): number {
  const ids = new Set<string>();
  for (const w of wsIn(account, batch.id)) {
    if (w.proposed) continue;
    for (const row of w.projects) {
      if (rowIsInactive(row)) continue;
      ids.add(row.buildingId);
    }
  }
  return ids.size;
}

function countDroppedAssets(account: Account, batch: Batch): number {
  let n = 0;
  for (const id of batch.buildingIds) {
    const muted = inactiveLeftRows(account, batch, id).filter(
      ({ row }) => row.left?.kind === "dropped",
    );
    const live = batchProjectsForBuilding(account, batch, id);
    if (muted.length && !live.length) n += 1;
  }
  return n;
}

function countMovedOnlyAssets(account: Account, batch: Batch): number {
  let n = 0;
  for (const id of batch.buildingIds) {
    const muted = inactiveLeftRows(account, batch, id).filter(
      ({ row }) => row.left?.kind === "moved",
    );
    const live = batchProjectsForBuilding(account, batch, id);
    if (muted.length && !live.length) n += 1;
  }
  return n;
}

function closedPackageFootprint(w: Workstream): number {
  const est = w.phases.find((ph) => ph.service === "indicative");
  const snap = est?.projects;
  if (snap?.length) {
    return new Set(snap.map((p) => p.buildingId)).size;
  }
  return new Set(w.projects.map((p) => p.buildingId)).size;
}

function closedPackageOutcomeLine(w: Workstream): string {
  const rows = w.projects.filter((p) => p.left);
  const droppedN = rows.filter((p) => p.left?.kind === "dropped").length;
  const splitTo = new Set(
    rows
      .filter((p) => p.left?.kind === "split" && p.left.to)
      .map((p) => p.left!.to as string),
  ).size;
  const parts: string[] = [];
  if (splitTo >= 2) parts.push(`Split in ${splitTo}`);
  if (droppedN > 0) parts.push(`${droppedN} dropped`);
  return parts.join(" · ");
}

function batchNowLine(account: Account, w: Workstream, lang: Lang): string {
  if (isClosed(w)) return t(lang, "Closed · {0}", short(closedOnDate(w), lang));
  if (w.proposed) return t(lang, "Proposed");
  if (isCompleted(w))
    return t(
      lang,
      "Complete · {0}",
      w.completedOn ? short(w.completedOn, lang) : "—",
    );
  return t(lang, serviceDef(w.service).label);
}

function movedToBatchName(account: Account, batchId: string): string {
  return getBatch(account, batchId)?.name ?? batchId;
}

function PilotDashboard({
  account,
  batch,
  onBatchPage,
}: {
  account: Account;
  batch: Batch;
  /** The batch page of a proposed plan: the page header already names the batch and its goal. */
  onBatchPage?: boolean;
}) {
  const hrefs = useHrefs();
  const { agreePlan } = useConcept();
  const { lang, t: tr, words } = useConceptI18n();
  const all = wsIn(account, batch.id);
  const activity = batchActivity(account, batch);
  const docs = account.documents.filter((d) => d.batchId === batch.id);
  const projects = all.reduce(
    (n, w) => n + w.projects.filter((p) => !rowIsInactive(p)).length,
    0,
  );
  const needs = all.flatMap((w) =>
    w.needs.filter((need) => need.owner === "you" && !need.received),
  );
  // Services this batch skips (e.g. Pricing with no existing supplier) are left out of the pilot plan.
  const stages = routeStages(account, batch)
    .filter((stage) => stage.state !== "skip")
    .map((stage) => ({ ...stage, label: tr(stage.label), caption: tr(stage.caption) }));
  const notes = Object.fromEntries(
    stages.map((stage) => {
      const skipped = stage.id === "pricing" && stage.state === "skip";
      const text = skipped
        ? pricingNotNeeded
        : SERVICE_LABEL[stage.id as keyof typeof SERVICE_LABEL];
      return [stage.id, { text: tr(text), muted: stage.state === "skip" }];
    }),
  );
  // The route as a story: where you are now, the services, and where your first decision falls.
  type TrackStep = { id: string; label: string; lead: "now" | "next"; note: string; noteClass: string };
  const live = batch.planState === "live";
  const track: TrackStep[] = [];
  if (!live)
    track.push({ id: "plan", label: tr("Plan"), lead: "now", note: tr("Waiting for you"), noteClass: "p7 text-text-primary" });
  stages.forEach((stage, index) => {
    track.push({ id: stage.id, label: stage.label, lead: "next", note: notes[stage.id]?.text ?? "", noteClass: "p7 text-text-secondary" });
    if (index === 0 && batch.firstDecision)
      track.push({
        id: "decision",
        label: tr("Your decision"),
        lead: "next",
        note: tr("{0} up to here", tr(batch.firstDecision.cost)),
        noteClass: "p7 text-text-title",
      });
  });
  const isOptional = (w: Workstream) => w.optional ?? /\(optional\)/i.test(w.name);
  const included = all.filter((w) => !isOptional(w));
  const optional = all.filter(isOptional);
  const includedSites = (w: Workstream) =>
    w.projects
      .filter((p) => !rowIsInactive(p))
      .map((p) => getBuilding(account, p.buildingId).name)
      .join(", ");
  const inPlanIds = new Set(
    all.filter((w) => !isOptional(w)).flatMap((w) => w.projects.filter((p) => !rowIsInactive(p)).map((p) => p.buildingId)),
  );
  const siteAssets = batch.buildingIds.map((id, index) => {
    const building = getBuilding(account, id);
    return {
      id,
      n: index + 1,
      name: building?.name ?? id,
      type: building?.type ? tr(building.type) : undefined,
      inPlan: inPlanIds.has(id),
      href: hrefs.building(id, { from: "buildings" }),
    };
  });
  const pkgGrid = {
    gridTemplateColumns: "minmax(0,1fr) minmax(0,1.2fr) minmax(0,1.2fr) 16px",
  };
  const proposed = batch.planState !== "live";
  return (
    <div className="space-y-4 pb-12">
      {/* The one card that needs you, built like the supplier OfferCard: pill + date, title, one line, the action on the right, the route under it. */}
      <section
        className={cn(
          "flex flex-col gap-5 rounded-lg border border-border-dark bg-bg-container px-6 py-5",
          proposed && "border-t-4 border-t-brand-6",
        )}
      >
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="flex min-w-0 flex-col gap-1.5">
            <div className="flex items-center gap-3">
              {proposed && <OwnerPill owner="you" />}
              {proposed && batch.planProposed && (
                <span className="s3 text-text-tertiary">
                  {tr("Proposed {0}", formatDate(batch.planProposed, lang))}
                </span>
              )}
              {!proposed && batch.planAgreed && (
                <span className="s3 text-text-tertiary">
                  {tr("Agreed {0}", formatDate(batch.planAgreed, lang))}
                </span>
              )}
            </div>
            <h2 className="h6 text-text-primary">
              {proposed
                ? tr("Agree the plan for {0}", included.map((w) => tr(w.name)).join(", "))
                : tr("Estimates under way for {0}", included.map((w) => tr(w.name)).join(", "))}
            </h2>
            {proposed && batch.firstDecision && (
              <p className="p6 text-text-secondary">
                {tr("Estimates cost {0}. After the business case, you decide whether to go on.", tr(batch.firstDecision.cost))}
              </p>
            )}
            {!proposed && (
              <p className="p6 text-text-secondary">
                {tr("We'll send you the business case. Then you decide whether to go on.")}
              </p>
            )}
          </div>
          {!proposed && included[0] && (
            /* After agreeing nothing waits on her here: the strong button is the one way on (design system), to the package's Estimates. */
            <div className="flex shrink-0 flex-col items-end gap-2">
              <Button type="strong" size="large" icon="chevron-right" iconPosition="right" href={hrefs.workstream(included[0].id)}>
                {tr("Open Estimates")}
              </Button>
            </div>
          )}
          {proposed && (
            <div className="flex shrink-0 flex-col items-end gap-2">
              <Button type="primary" size="large" onClick={() => agreePlan(batch.id)}>
                {tr("Agree plan")}
              </Button>
              <p className="p6 text-text-secondary">
                {tr("Not sure?")} <Button type="link">{tr("Ask a question")}</Button>
              </p>
            </div>
          )}
        </div>
        <RouteGates
          agreed={!proposed}
          services={stages.map((s) => ({
            id: s.id,
            label: s.label,
            caption: notes[s.id]?.text ?? "",
          }))}
        />
      </section>

      {/* Packages as two tiles: what the plan includes (solid, ticked) and what stays optional (dashed, like a later step). */}
      <Card title={words.Packages} right={aside(nPackages(all.length, lang))}>
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {all.map((w) => {
            const optional = isOptional(w);
            const sites = w.projects
              .filter((p) => !rowIsInactive(p))
              .map((p) => getBuilding(account, p.buildingId).name);
            return (
              <li key={w.id}>
                <Link
                  href={hrefs.workstream(w.id)}
                  className={cn(
                    "flex h-full flex-col gap-2 rounded-md p-3 outline-none focus-visible:shadow-focus",
                    optional
                      ? "border border-dashed border-black-4 hover:bg-black-1"
                      : "border border-border-dark hover:border-black-4",
                  )}
                >
                  <span className="flex items-start justify-between gap-3">
                    {/* s3 caps label, the same for both tiles; the border tells them apart. */}
                    <span className="s3 text-text-tertiary">
                      {optional
                        ? tr("Optional · you decide later")
                        : proposed
                          ? tr("In this plan")
                          : tr("Estimates · started {0}", formatDate(batch.planAgreed ?? "", lang))}
                    </span>
                    <ServiceIcon
                      service={(w.solution === "ev" ? "ev-charging" : "solar-pv") as ServiceId}
                      size={48}
                      grayscale={optional}
                      className={cn("-my-1 -mr-1", optional && "opacity-70")}
                    />
                  </span>
                  <span className="-mt-6 min-w-0">
                    <span className="block h6 text-text-primary">
                      {tr(w.name).replace(/ \(optional\)$/i, "")}
                    </span>
                    <span className="mt-0.5 block p7 text-text-secondary">{sites.join(", ")}</span>
                  </span>
                  <span className="p6 text-text-primary">{sentence(tr(w.gives ?? ""))}</span>
                  <span className="mt-auto flex items-center gap-1 pt-1 h8 text-text-primary">
                    {tr("Open package")}
                    <Icon name="chevron-right" size={16} />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </Card>

      {/* What we have is in Documents ("Your files"); only what we still need stays as its own card. */}
      <div>
        <Card
          className="h-full"
          title={proposed ? tr("What we still need") : tr("What we need from you")}
          right={proposed ? aside(tr("After you agree the plan")) : <OwnerPill owner="you" />}
        >
          <ul className="space-y-3">
            {/* Only what the agreed packages need; an optional package's needs wait until it's chosen. */}
            {included.flatMap((w) => w.needs.filter((n) => n.owner === "you" && !n.received)).map((need) => (
              <li key={need.label} className="flex gap-2">
                <span
                  className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-brand-6"
                  aria-hidden
                />
                <div>
                  <p className="h8 text-text-title">{tr(need.label)}</p>
                  <p className="p7 text-text-secondary">
                    {[need.scope && tr(need.scope), tr(need.why), !proposed && batch.planAgreed && tr("asked {0}", formatDate(batch.planAgreed, lang))]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card
          className="h-full"
          title={tr("Recent activity")}
          right={<CardLink href={hrefs.batches}>{tr("See all")}</CardLink>}
          bodyClassName="px-4 py-0"
        >
          <ul>
            {activity.map((item, index) => (
              <li
                key={`${item.date}-${item.title}`}
                className={cn(
                  "flex items-start justify-between gap-4 py-3",
                  index > 0 && "border-t border-border-light",
                )}
              >
                <div className="min-w-0">
                  <p className="h8 text-text-title">{tr(item.title)}</p>
                  <p className="mt-0.5 p7 text-text-secondary">{tr(item.text)}</p>
                </div>
                <span className="shrink-0 p7 text-text-tertiary">
                  {formatDate(item.date, lang)}
                </span>
              </li>
            ))}
          </ul>
        </Card>
        <Card
          className="h-full"
          title={tr("Documents")}
          right={<CardLink href={hrefs.batches}>{tr("See all")}</CardLink>}
          bodyClassName="px-4 py-0"
        >
          <DocumentList docs={docs} />
        </Card>
      </div>
    </div>
  );
}

/** Pilot: what the batch is about, as a white column at the page edge (like the supplier TenderRail). */
export function PilotRail({ account, batch }: { account: Account; batch: Batch }) {
  const hrefs = useHrefs();
  const { lang, t: tr, words } = useConceptI18n();
  const all = wsIn(account, batch.id);
  const isOptional = (w: Workstream) => w.optional ?? /\(optional\)/i.test(w.name);
  // Which agreed package each asset is in (optional packages don't count yet).
  const packageOf = new Map<string, string>();
  for (const w of all.filter((x) => !isOptional(x)))
    for (const p of w.projects.filter((x) => !rowIsInactive(x)))
      if (!packageOf.has(p.buildingId)) packageOf.set(p.buildingId, tr(w.name));
  const inPackage = batch.buildingIds.filter((id) => packageOf.has(id)).length;
  const siteAssets = batch.buildingIds.map((id, index) => {
    const building = getBuilding(account, id);
    return {
      id,
      n: index + 1,
      name: building?.name ?? id,
      type: building?.type ? tr(building.type) : undefined,
      inPlan: packageOf.has(id),
      status: packageOf.has(id) ? tr("In {0}", packageOf.get(id)) : undefined,
      href: hrefs.building(id, { from: "buildings" }),
    };
  });
  return (
        <aside className="relative flex w-full shrink-0 flex-col border-b border-border-dark bg-white lg:min-h-[calc(100vh-130px)] lg:w-[360px] lg:border-r lg:border-b-0 lg:before:absolute lg:before:inset-y-0 lg:before:right-full lg:before:w-screen lg:before:bg-white lg:before:content-['']">
          <div className="relative overflow-hidden border-b border-status-info-border bg-status-info-bg px-8 pb-5 pt-6">
            <div className="relative flex flex-col gap-1">
              <span className="flex items-center gap-1 s3 text-text-tertiary">
                {tr("Batch")}
                <span className="-my-1">
                  <TypeLabelInfo kind="batch" />
                </span>
              </span>
              <h2 className="h6 text-text-primary">{batch.name}</h2>
              <p className="p7 text-text-secondary">
                {[
                  getBuilding(account, batch.buildingIds[0])?.city,
                  nAssets(batch.buildingIds.length, lang),
                  inPackage < batch.buildingIds.length ? tr("{0} in a package", inPackage) : "",
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-6 px-8 pb-6 pt-5">
            <div className="flex flex-col gap-1">
              <h3 className="s3 text-text-tertiary">{tr("Goal")}</h3>
              <p className="p6 text-text-primary">{sentence(tr(batch.goal))}</p>
            </div>
            <dl className="border-t border-border-light">
              {[
                { label: tr("Solution"), value: [...new Set(all.map((w) => solutionName(w.solution, lang)))].join(", ") },
                { label: words.Packages, value: String(all.length) },
                { label: tr("Plan proposed"), value: batch.planProposed ? formatDate(batch.planProposed, lang) : "" },
              ]
                .filter((f) => f.value)
                .map((f) => (
                  <div key={f.label} className="flex items-baseline justify-between gap-4 border-b border-border-light py-2">
                    <dt className="p6 text-text-secondary">{f.label}</dt>
                    <dd className="text-right h8 text-text-primary">{f.value}</dd>
                  </div>
                ))}
            </dl>
            <div className="flex flex-col gap-2">
              <h3 className="s3 text-text-tertiary">{words.Assets}</h3>
              <SiteAssetList assets={siteAssets} />
            </div>
          </div>
        </aside>
  );
}

function nowProjects(account: Account, batch: Batch, serviceId: string) {
  return wsIn(account, batch.id)
    .filter(
      (w) =>
        w.service === serviceId && !w.proposed && w.owner !== "done",
    )
    .reduce((n, w) => n + activeProjects(w).length, 0);
}

function passedProjects(account: Account, batch: Batch, serviceId: string) {
  return phasesIn(account, batch, serviceId as Workstream["service"])
    .filter(
      ({ workstream, phase }) =>
        phase.state === "done" &&
        (workstream.service !== serviceId || isCompleted(workstream)),
    )
    .reduce(
      (n, { phase, workstream }) =>
        n +
        (phase.projects ?? workstream.projects).filter(
          (project) => !rowIsInactive(project),
        ).length,
      0,
    );
}

type AssetTableRow =
  | {
      kind: "building";
      buildingId: string;
      live: { workstream: Workstream; row: ProjectRow }[];
      muted: { workstream: Workstream; row: ProjectRow }[];
    }
  | { kind: "fold"; variant: "dropped" | "moved"; ids: string[] };

function BatchPage({
  account,
  batch,
  actions,
}: {
  account: Account;
  batch: Batch;
  /** Ops: an action at the right end of the tabs (Change assets, Add package). */
  actions?: { assets?: ReactNode; packages?: ReactNode };
}) {
  const hrefs = useHrefs();
  const router = useRouter();
  const params = useSearchParams();
  const { lang, t: tr, words } = useConceptI18n();
  const [showActivity, setShowActivity] = useState(false);
  const activity = batchActivity(account, batch);

  const view = params.get("view") === "packages" ? "packages" : "assets";
  const rawService = params.get("service") ?? "";
  const extra: ExtraFilter =
    rawService === "dropped" || rawService === "moved" || rawService === "ended"
      ? rawService
      : "";

  const serviceCards = [
    {
      id: "",
      label: tr("All"),
      // Assets with live work or an ended package: the rows the list shows.
      count: batch.buildingIds.filter(
        (id) =>
          batchProjectsForBuilding(account, batch, id).length > 0 ||
          endedRows(account, batch, id).length > 0,
      ).length,
      done: 0,
    },
    ...SERVICES.map((item) => ({
      id: item.id,
      label: tr(item.label),
      count: countAssetsWithLiveInService(account, batch, item.id),
      done: passedProjects(account, batch, item.id),
    })).filter((card) => card.count > 0),
  ];

  const nDroppedOnly = countDroppedAssets(account, batch);
  const nMovedOnly = countMovedOnlyAssets(account, batch);
  const moveCards: Array<{ id: ExtraFilter; label: string; count: number }> =
    [];
  if (nDroppedOnly > 0)
    moveCards.push({ id: "dropped", label: tr("Dropped"), count: nDroppedOnly });
  if (nMovedOnly > 0)
    moveCards.push({
      id: "moved",
      label: tr("Moved out"),
      count: nMovedOnly,
    });

  const nEnded = countEndedAssets(account, batch);
  if (nEnded > 0)
    moveCards.push({ id: "ended", label: tr("Ended"), count: nEnded });

  const cards = [...serviceCards, ...moveCards];

  const validService = SERVICES.some((s) => s.id === rawService);
  const selected =
    rawService === "" ||
    rawService === "dropped" ||
    rawService === "moved" ||
    rawService === "ended" ||
    validService
      ? rawService
      : "";

  const select = (id: string) => {
    const next = new URLSearchParams(params.toString());
    if (id) next.set("service", id);
    else next.delete("service");
    const qs = next.toString();
    router.replace(
      qs ? `${hrefs.batch(batch.id)}?${qs}` : hrefs.batch(batch.id),
      { scroll: false },
    );
  };

  const setView = (nextView: "assets" | "packages") => {
    const next = new URLSearchParams(params.toString());
    if (nextView === "packages") next.set("view", "packages");
    else next.delete("view");
    const qs = next.toString();
    router.replace(
      qs ? `${hrefs.batch(batch.id)}?${qs}` : hrefs.batch(batch.id),
      { scroll: false },
    );
  };

  const tableRows: AssetTableRow[] = [];
  const foldDropped: string[] = [];
  const foldMoved: string[] = [];

  for (const id of batch.buildingIds) {
    const liveAll = batchProjectsForBuilding(account, batch, id);
    const allMuted = inactiveLeftRows(account, batch, id);
    const ended = endedRows(account, batch, id);

    if (extra === "ended") {
      if (!ended.length) continue;
      tableRows.push({ kind: "building", buildingId: id, live: liveAll, muted: ended });
      continue;
    }

    if (extra === "dropped" || extra === "moved") {
      const muted = allMuted.filter((m) => m.row.left?.kind === extra);
      if (!muted.length) continue;
      const liveFiltered = selected
        ? liveAll.filter((x) => x.workstream.service === selected)
        : liveAll;
      tableRows.push({
        kind: "building",
        buildingId: id,
        live: liveFiltered,
        muted,
      });
      continue;
    }

    const liveFiltered = selected
      ? liveAll.filter((x) => x.workstream.service === selected)
      : liveAll;

    const mutedDropMove = allMuted.filter(
      (m) => m.row.left?.kind === "dropped" || m.row.left?.kind === "moved",
    );

    if (liveFiltered.length || (!selected && ended.length)) {
      tableRows.push({
        kind: "building",
        buildingId: id,
        live: liveFiltered,
        muted: selected ? mutedDropMove : [...ended, ...mutedDropMove],
      });
    } else if (mutedDropMove.length) {
      if (mutedDropMove.some((m) => m.row.left?.kind === "dropped"))
        foldDropped.push(id);
      if (mutedDropMove.some((m) => m.row.left?.kind === "moved"))
        foldMoved.push(id);
    }
  }

  tableRows.sort((a, b) => {
    if (a.kind === "fold" || b.kind === "fold") return 0;
    const ba = account.buildings.find((x) => x.id === a.buildingId)!;
    const bb = account.buildings.find((x) => x.id === b.buildingId)!;
    const aLive = a.live.length > 0;
    const bLive = b.live.length > 0;
    if (aLive !== bLive) return aLive ? -1 : 1;
    const aCh = buildingChanged(account, ba.id);
    const bCh = buildingChanged(account, bb.id);
    if (aCh !== bCh) return aCh ? -1 : 1;
    return ba.name.localeCompare(bb.name);
  });

  const [openDropped, setOpenDropped] = useState(false);
  const [openMoved, setOpenMoved] = useState(false);
  const [list, setList] = useState({ sig: "", open: false });
  const mainRows = tableRows.filter((r) => r.kind === "building");
  const signature = `${view}:${selected}:${mainRows.map((r) => (r.kind === "building" ? r.buildingId : "")).join("|")}`;
  if (list.sig !== signature) setList({ sig: signature, open: false });
  const shownBuildings = list.open ? mainRows : mainRows.slice(0, 8);

  const expandedDropped = extra === "dropped" || openDropped;
  const expandedMoved = extra === "moved" || openMoved;

  // One row per line of work: a package that continued is carried by its successor.
  const packageCount = wsInAll(account, batch.id).filter(
    (w) => !w.proposed && !isContinuedAway(w),
  ).length;

  return (
    <div className="space-y-4">
      <div className="relative">
      {actions?.[view] && (
        <div className="absolute right-0 top-[-6px] z-10">{actions[view]}</div>
      )}
      <Tabs.Root
        value={view}
        onValueChange={(v) => setView(v === "packages" ? "packages" : "assets")}
      >
        <Tabs.List className={tabListClass} aria-label={batch.name}>
          <Tabs.Trigger value="assets" className={tabTriggerClass}>
            {words.Assets} ({batch.buildingIds.length})
          </Tabs.Trigger>
          <Tabs.Trigger value="packages" className={tabTriggerClass}>
            {words.Packages} ({packageCount})
          </Tabs.Trigger>
        </Tabs.List>
      </Tabs.Root>
      </div>

      {view === "assets" && (
        <div className="mt-4 space-y-4">
          <div
            className="grid gap-2"
            style={{
              gridTemplateColumns: `repeat(${cards.length}, minmax(0, 1fr))`,
            }}
          >
            {cards.map((card) => {
              const isMove =
                card.id === "dropped" ||
                card.id === "moved" ||
                card.id === "ended";
              const on = card.id === selected;
              return (
                <button
                  key={card.id || "all"}
                  type="button"
                  onClick={() => select(card.id)}
                  className={cn(
                    "relative overflow-hidden rounded-md border border-border-dark bg-bg-container px-4 py-3 text-left",
                    focusRing,
                    !on && "cursor-pointer hover:bg-black-2",
                  )}
                >
                  {on && (
                    <span
                      aria-hidden
                      className="absolute inset-x-0 top-0 h-1 bg-brand-6"
                    />
                  )}
                  <p
                    className={cn(
                      "h8",
                      isMove ? "text-text-tertiary" : "text-text-primary",
                    )}
                  >
                    {card.label}
                  </p>
                  <p
                    className={cn(
                      "h4 tabular-nums",
                      isMove ? "text-text-tertiary" : "text-text-primary",
                    )}
                  >
                    {card.count}
                  </p>
                  {!isMove && "done" in card && card.done > 0 && (
                    <p className="p7 text-text-tertiary">
                      {tr("+{0} done", card.done)}
                    </p>
                  )}
                </button>
              );
            })}
          </div>

          <Card bodyClassName="p-0">
            <div className="overflow-x-auto">
              <div className="min-w-[720px]">
                <div className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,1.2fr)_minmax(0,0.8fr)_16px] items-center gap-x-6 border-b border-border-light py-2.5 pl-8 pr-4">
                  <span className="s3 text-text-tertiary">{words.Asset}</span>
                  <span className="s3 text-text-tertiary">{words.Package}</span>
                  <span className="s3 text-text-tertiary">{tr("Services")}</span>
                  <span />
                </div>
                {shownBuildings.map((row) => {
                  if (row.kind !== "building") return null;
                  const building = getBuilding(account, row.buildingId);
                  return (
                    <Link
                      key={building.id}
                      href={hrefs.building(building.id, {
                        from: "batch",
                        batch: batch.id,
                      })}
                      className={cn(
                        "grid min-h-14 grid-cols-[minmax(0,1.2fr)_minmax(0,1.2fr)_minmax(0,0.8fr)_16px] items-center gap-x-6 border-t border-border-light py-3 pl-8 pr-4",
                        tableRowLinkClass,
                      )}
                    >
                      <span className="min-w-0">
                        <ChangedDot on={buildingChanged(account, building.id)}>
                          <span
                            className={cn(
                              "block h8",
                              // An asset whose packages have all ended is a muted row.
                              row.live.length ? "text-text-title" : "text-text-tertiary",
                              tableRowNameCellClass,
                            )}
                          >
                            {building.name}
                          </span>
                        </ChangedDot>
                        <span className="mt-0.5 block p7 text-text-tertiary">
                          {building.city}
                        </span>
                      </span>
                      <span className="min-w-0 space-y-1">
                        {row.live.map((item) => (
                          <span
                            key={`${item.workstream.id}-live`}
                            className="block p6 text-text-secondary"
                          >
                            {item.workstream.name}
                          </span>
                        ))}
                        {row.muted.map((item) => (
                          <span
                            key={`${item.workstream.id}-muted-${item.row.buildingId}`}
                            className="block p6 text-text-tertiary"
                          >
                            {item.workstream.name}
                          </span>
                        ))}
                      </span>
                      <span className="min-w-0 space-y-1">
                        {row.live.map((item) => {
                          const after = afterLine(account, item.workstream, lang);
                          return (
                            <span
                              key={`${item.workstream.id}-svc`}
                              className="block p6 text-text-primary"
                            >
                              {tr(serviceDef(item.workstream.service).label)}
                              {after && (
                                <span className="text-text-tertiary">
                                  {" · "}
                                  {after.charAt(0).toLowerCase() + after.slice(1)}
                                </span>
                              )}
                            </span>
                          );
                        })}
                        {row.muted.map((item) => {
                          if (item.workstream.ending && !item.row.left) {
                            return (
                              <span
                                key={`${item.workstream.id}-end`}
                                className="block p6 text-text-tertiary"
                              >
                                {endingRowLine(account, item.workstream, lang)}
                              </span>
                            );
                          }
                          const lk = item.row.left?.kind;
                          const reason = item.row.left?.reason ?? "";
                          if (lk === "not_going_ahead") {
                            return (
                              <span
                                key={`${item.workstream.id}-nga`}
                                className="block p6 text-text-tertiary"
                              >
                                {tr(serviceDef(item.workstream.service).label)}
                                {" · "}
                                {tr("not going ahead")}
                              </span>
                            );
                          }
                          if (lk === "dropped") {
                            return (
                              <span
                                key={`${item.workstream.id}-drop`}
                                className="block p6 text-text-tertiary"
                              >
                                {tr("Dropped ·")} {reason}
                              </span>
                            );
                          }
                          if (lk === "moved" && item.row.left?.to) {
                            const dest = movedToBatchName(
                              account,
                              item.row.left.to,
                            );
                            return (
                              <span
                                key={`${item.workstream.id}-mv`}
                                className="block p6 text-text-tertiary"
                              >
                                {tr("Moved to")} {dest} ·{" "}
                                {short(item.row.left.on, lang)}
                              </span>
                            );
                          }
                          return null;
                        })}
                      </span>
                      <Icon
                        name="chevron-right"
                        size={16}
                        className="text-text-tertiary"
                      />
                    </Link>
                  );
                })}

                {!extra && foldDropped.length > 0 && (
                  <>
                    <button
                      type="button"
                      onClick={() => setOpenDropped(!openDropped)}
                      className={cn(
                        "grid w-full grid-cols-[minmax(0,1.2fr)_minmax(0,1.2fr)_minmax(0,0.8fr)_16px] items-center gap-x-6 border-t border-border-light py-3.5 pl-8 pr-6 text-left",
                        tableRowLinkClass,
                      )}
                    >
                      <span className="p6 text-text-tertiary">
                        {tr("{0} dropped", foldDropped.length)}
                      </span>
                      <span />
                      <span />
                      <Icon
                        name={expandedDropped ? "chevron-up" : "chevron-down"}
                        size={16}
                        className="text-text-tertiary"
                      />
                    </button>
                    {expandedDropped &&
                      foldDropped.map((bid) => {
                        const b = getBuilding(account, bid);
                        const muted = inactiveLeftRows(account, batch, bid).filter(
                          (m) => m.row.left?.kind === "dropped",
                        );
                        return (
                          <Link
                            key={bid}
                            href={hrefs.building(bid, {
                              from: "batch",
                              batch: batch.id,
                            })}
                            className={cn(
                        "grid min-h-14 grid-cols-[minmax(0,1.2fr)_minmax(0,1.2fr)_minmax(0,0.8fr)_16px] items-center gap-x-6 border-t border-border-light py-3 pl-8 pr-4",
                        tableRowLinkClass,
                      )}
                          >
                            <span className="min-w-0">
                              <span
                                className={cn(
                                  "block h8 text-text-title",
                                  tableRowNameCellClass,
                                )}
                              >
                                {b.name}
                              </span>
                              <span className="mt-0.5 block p7 text-text-tertiary">
                                {b.city}
                              </span>
                            </span>
                            <span className="min-w-0 space-y-1">
                              {muted.map((m) => (
                                <span
                                  key={`${m.workstream.id}-f`}
                                  className="block p6 text-text-tertiary"
                                >
                                  {m.workstream.name}
                                </span>
                              ))}
                            </span>
                            <span className="min-w-0 space-y-1">
                              {muted.map((m) => (
                                <span
                                  key={`${m.workstream.id}-fd`}
                                  className="block p6 text-text-tertiary"
                                >
                                  Dropped · {m.row.left?.reason ?? ""}
                                </span>
                              ))}
                            </span>
                            <Icon
                              name="chevron-right"
                              size={16}
                              className="text-text-tertiary"
                            />
                          </Link>
                        );
                      })}
                  </>
                )}

                {!extra && foldMoved.length > 0 && (
                  <>
                    <button
                      type="button"
                      onClick={() => setOpenMoved(!openMoved)}
                      className={cn(
                        "grid w-full grid-cols-[minmax(0,1.2fr)_minmax(0,1.2fr)_minmax(0,0.8fr)_16px] items-center gap-x-6 border-t border-border-light py-3.5 pl-8 pr-6 text-left",
                        tableRowLinkClass,
                      )}
                    >
                      <span className="p6 text-text-tertiary">
                        {tr("{0} moved out", foldMoved.length)}
                      </span>
                      <span />
                      <span />
                      <Icon
                        name={expandedMoved ? "chevron-up" : "chevron-down"}
                        size={16}
                        className="text-text-tertiary"
                      />
                    </button>
                    {expandedMoved &&
                      foldMoved.map((bid) => {
                        const b = getBuilding(account, bid);
                        const muted = inactiveLeftRows(account, batch, bid).filter(
                          (m) => m.row.left?.kind === "moved",
                        );
                        return (
                          <Link
                            key={bid}
                            href={hrefs.building(bid, {
                              from: "batch",
                              batch: batch.id,
                            })}
                            className={cn(
                        "grid min-h-14 grid-cols-[minmax(0,1.2fr)_minmax(0,1.2fr)_minmax(0,0.8fr)_16px] items-center gap-x-6 border-t border-border-light py-3 pl-8 pr-4",
                        tableRowLinkClass,
                      )}
                          >
                            <span className="min-w-0">
                              <span
                                className={cn(
                                  "block h8 text-text-title",
                                  tableRowNameCellClass,
                                )}
                              >
                                {b.name}
                              </span>
                              <span className="mt-0.5 block p7 text-text-tertiary">
                                {b.city}
                              </span>
                            </span>
                            <span className="min-w-0 space-y-1">
                              {muted.map((m) => (
                                <span
                                  key={`${m.workstream.id}-fm`}
                                  className="block p6 text-text-tertiary"
                                >
                                  {m.workstream.name}
                                </span>
                              ))}
                            </span>
                            <span className="min-w-0 space-y-1">
                              {muted.map((m) => (
                                <span
                                  key={`${m.workstream.id}-fmt`}
                                  className="block p6 text-text-tertiary"
                                >
                                  {tr("Moved to")}{" "}
                                  {movedToBatchName(account, m.row.left!.to!)} ·{" "}
                                  {short(m.row.left!.on, lang)}
                                </span>
                              ))}
                            </span>
                            <Icon
                              name="chevron-right"
                              size={16}
                              className="text-text-tertiary"
                            />
                          </Link>
                        );
                      })}
                  </>
                )}
              </div>
            </div>
            <ListMore
              total={mainRows.length}
              limit={8}
              open={list.open}
              noun={words.assets}
              onOpen={() => setList({ sig: signature, open: true })}
            />
          </Card>
        </div>
      )}

      {view === "packages" && (
        <div className="mt-4">
          <PackagesTable account={account} batch={batch} />
        </div>
      )}

      <Card
        title={tr("Recent activity")}
        right={
          !showActivity && (
            <button
              type="button"
              className="p6 text-text-primary underline underline-offset-4 hover:text-text-primary"
              onClick={() => setShowActivity(true)}
            >
              {tr("See all")}
            </button>
          )
        }
      >
        <ActivityList items={showActivity ? activity : activity.slice(0, 5)} />
      </Card>
    </div>
  );
}

function PackagesTable({ account, batch }: { account: Account; batch: Batch }) {
  const hrefs = useHrefs();
  const { lang, t: tr, words } = useConceptI18n();
  const inBatch = wsInAll(account, batch.id);
  const byStart = (a: Workstream, b: Workstream) =>
    parse(b.startedOn || "1 Jan 2000") - parse(a.startedOn || "1 Jan 2000") ||
    a.name.localeCompare(b.name, "en", { sensitivity: "base" });
  const proposed = inBatch
    .filter((w) => w.proposed)
    .sort((a, b) => a.name.localeCompare(b.name));
  // One row per line of work: a package that continued has no row of its own.
  const rest = inBatch.filter((w) => !w.proposed && !isContinuedAway(w));
  const openPackages = rest
    .filter((w) => !isClosed(w) && !isCompleted(w))
    .sort(byStart);
  const completed = rest
    .filter((w) => !isClosed(w) && isCompleted(w))
    .sort(byStart);
  const ended = rest
    .filter((w) => isClosed(w))
    .sort(
      (a, b) =>
        parse(closedOnDate(b) || "1 Jan 2000") -
          parse(closedOnDate(a) || "1 Jan 2000") ||
        a.name.localeCompare(b.name, "en", { sensitivity: "base" }),
    );

  // DS Table: one flush Card per group (h7 title + count), column labels, rows 12/16/12/32, at least 56 tall.
  const cols =
    "grid-cols-[minmax(0,1.3fr)_minmax(0,1.2fr)_minmax(0,0.6fr)_16px]";
  const rowClass = cn(
    "grid min-h-14 items-center gap-x-6 border-t border-border-light py-3 pl-8 pr-4",
    cols,
  );

  /** Second line under NOW: where the package came from, or when it started. */
  const cameFrom = (w: Workstream): string => {
    const after = afterLine(account, w, lang);
    if (after) return after;
    if (w.from) {
      const src = getWorkstream(account, w.from.workstreamId);
      return tr(
        "From {0} · {1}",
        src?.name ?? w.from.workstreamId,
        leftHowLabel(w.from.kind),
      );
    }
    if (w.startedOn) return tr("Started {0}", short(w.startedOn, lang));
    return "";
  };

  type Row = {
    w: Workstream;
    main: string;
    detail: string;
    assets: string;
    link: boolean;
  };
  const liveRow = (w: Workstream): Row => ({
    w,
    main: batchNowLine(account, w, lang),
    detail: cameFrom(w),
    assets: String(activeProjects(w).length),
    link: true,
  });
  const proposedRow = (w: Workstream): Row => ({
    w,
    main: tr("Proposed"),
    detail: "",
    assets: String(activeProjects(w).length),
    link: false,
  });
  const endedRow = (w: Workstream): Row => {
    const on = closedOnDate(w);
    return {
      w,
      main: w.ending?.kind === "continued"
        ? tr(
            "Continued in {0} · {1} of {2}",
            tr(
              serviceDef(
                getWorkstream(account, w.ending.to ?? "")?.service ?? w.service,
              ).label,
            ),
            w.projects.filter((r) => r.left?.kind === "continued").length,
            closedPackageFootprint(w),
          )
        : w.ending
        ? endingTitle(account, w, lang)
        : closedPackageOutcomeLine(w).startsWith("Split")
          ? tr("Split · {0}", short(on, lang))
          : tr("Closed · {0}", short(on, lang)),
      detail: w.ending
        ? `${tr(serviceDef(w.service).label)} · ${short(on, lang)}`
        : closedPackageOutcomeLine(w),
      assets: tr("{0} at the start", closedPackageFootprint(w)),
      link: true,
    };
  };

  const groups: Array<{ id: string; title: string; rows: Row[]; muted: boolean }> = [
    {
      id: "live",
      title: tr("In progress"),
      rows: [...openPackages.map(liveRow), ...proposed.map(proposedRow)],
      muted: false,
    },
    { id: "completed", title: tr("Completed"), rows: completed.map(liveRow), muted: true },
    { id: "ended", title: tr("Ended"), rows: ended.map(endedRow), muted: true },
  ].filter((g) => g.rows.length > 0);

  return (
    <div className="space-y-4">
      {groups.map((g) => (
        <section
          key={g.id}
          className="overflow-hidden rounded-lg border border-border-dark bg-bg-container"
        >
          <header className="border-b border-border-light py-4 pl-8 pr-6">
            <h2 className={groupTitle}>
              {g.title}{" "}
              <span className="p6 text-text-tertiary tabular-nums">
                {g.rows.length}
              </span>
            </h2>
          </header>
          <div className="overflow-x-auto">
            <div className="min-w-[760px]">
              <div
                className={cn(
                  "grid items-center gap-x-6 py-2.5 pl-8 pr-4",
                  cols,
                )}
              >
                <span className="s3 text-text-tertiary">{words.Package}</span>
                <span className="s3 text-text-tertiary">{tr("Now")}</span>
                <span className="s3 text-right text-text-tertiary">
                  {words.Assets}
                </span>
                <span />
              </div>
              {g.rows.map((r) => {
                const body = (
                  <>
                    <span
                      className={cn(
                        "min-w-0 h8",
                        g.muted ? "text-text-tertiary" : "text-text-title",
                        r.link && tableRowNameCellClass,
                      )}
                    >
                      {r.w.name}
                    </span>
                    <span className="min-w-0">
                      <span
                        className={cn(
                          "block p6",
                          g.muted ? "text-text-tertiary" : "text-text-secondary",
                        )}
                      >
                        {r.main}
                      </span>
                      {r.detail && (
                        <span className="mt-0.5 block p7 text-text-tertiary">
                          {r.detail}
                        </span>
                      )}
                    </span>
                    <span
                      className={cn(
                        "p6 text-right tabular-nums",
                        g.muted ? "text-text-tertiary" : "text-text-secondary",
                      )}
                    >
                      {r.assets}
                    </span>
                    {r.link ? (
                      <Icon
                        name="chevron-right"
                        size={16}
                        className="text-text-tertiary"
                      />
                    ) : (
                      <span />
                    )}
                  </>
                );
                return r.link ? (
                  <Link
                    key={r.w.id}
                    href={hrefs.workstream(r.w.id, "batch")}
                    className={cn(rowClass, tableRowLinkClass)}
                  >
                    {body}
                  </Link>
                ) : (
                  <div key={r.w.id} className={rowClass}>
                    {body}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}

function ToDashboard() {
  const router = useRouter();
  const hrefs = useHrefs();
  useEffect(() => {
    router.replace(hrefs.overview);
  }, [router, hrefs.overview]);
  return null;
}

export function BatchView({
  account,
  batch,
  variant,
  actions,
}: {
  account: Account;
  batch: Batch;
  variant: "dashboard" | "page";
  actions?: { assets?: ReactNode; packages?: ReactNode };
}) {
  if (variant === "dashboard")
    return <PilotDashboard account={account} batch={batch} />;
  // A proposed plan has no live work yet: the plan lives on the dashboard, so the batch page sends you there.
  if (batch.planState === "proposed") return <ToDashboard />;
  return <BatchPage account={account} batch={batch} actions={actions} />;
}
