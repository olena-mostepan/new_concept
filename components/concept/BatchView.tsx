"use client";

import type { ReactNode } from "react";

import { useState } from "react";
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
  isClosed,
  isCompleted,
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
import { leftHowLabel } from "@/lib/concept/moves";
import { nAssets, nProjects } from "@/lib/concept/words";
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
  Icon,
  Card,
  CardLink,
  ChangedDot,
  DocumentList,
  ListMore,
  focusRing,
  tableRowLinkClass,
  tableRowNameCellClass,
  tabListClass,
  tabTriggerClass,
} from "./ui";
import { RouteWithNeeds } from "./RouteWithNeeds";
import { useHrefs } from "./useHrefs";
import { useConcept } from "./store";
import { cn } from "@/lib/utils";

function ActivityList({ items }: { items: Account["activity"] }) {
  return (
    <ul>
      {items.map((item, index) => (
        <li
          key={`${item.date}-${item.title}`}
          className={`flex justify-between gap-4 py-3 ${index > 0 ? "border-t border-border-light" : ""}`}
        >
          <div className="min-w-0">
            <p className="h8 text-text-title">{item.title}</p>
            <p className="p7 text-text-secondary">{item.text}</p>
          </div>
          <span className="shrink-0 whitespace-nowrap p7 text-text-tertiary">
            {item.date}
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

type ExtraFilter = "" | "dropped" | "moved";

/** Building has at least one live (non-inactive) project row in this batch. */
function batchProjectsForBuilding(
  account: Account,
  batch: Batch,
  buildingId: string,
): { workstream: Workstream; row: ProjectRow }[] {
  const out: { workstream: Workstream; row: ProjectRow }[] = [];
  for (const w of wsInAll(account, batch.id)) {
    if (w.proposed) continue;
    for (const row of w.projects) {
      if (row.buildingId !== buildingId) continue;
      if (!rowIsInactive(row)) out.push({ workstream: w, row });
    }
  }
  return out;
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

function howItCameFrom(
  account: Account,
  w: Workstream,
  lang: Lang,
): { main: string; sub?: string } {
  if (isClosed(w)) {
    return {
      main: t(lang, "Closed · {0} at the start", closedPackageFootprint(w)),
    };
  }
  if (w.from) {
    const src = getWorkstream(account, w.from.workstreamId);
    const pkg = src?.name ?? w.from.workstreamId;
    return {
      main: t(lang, "From {0} · {1}", pkg, leftHowLabel(w.from.kind)),
    };
  }
  if (w.startedOn) return { main: t(lang, "Started {0}", short(w.startedOn, lang)) };
  return { main: w.proposed ? "—" : t(lang, "Started") };
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
  if (isClosed(w)) return t(lang, "Closed · {0}", short(w.closedOn, lang));
  if (w.proposed) return t(lang, "Proposed");
  if (isCompleted(w))
    return t(
      lang,
      "Complete · {0}",
      w.completedOn ? short(w.completedOn, lang) : "—",
    );
  return t(serviceDef(w.service).label);
}

function movedToBatchName(account: Account, batchId: string): string {
  return getBatch(account, batchId)?.name ?? batchId;
}

function PilotDashboard({
  account,
  batch,
}: {
  account: Account;
  batch: Batch;
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
  const stages = routeStages(account, batch).map((stage) =>
    stage.state === "skip" && stage.label.startsWith("or ")
      ? { ...stage, label: stage.label.slice(3) }
      : stage,
  );
  const notes = Object.fromEntries(
    stages.map((stage) => {
      const skipped = stage.id === "pricing" && stage.state === "skip";
      const text = skipped
        ? pricingNotNeeded
        : SERVICE_LABEL[stage.id as keyof typeof SERVICE_LABEL];
      return [stage.id, { text, muted: stage.state === "skip" }];
    }),
  );
  return (
    <div className="space-y-4">
      <Card
        title={batch.name}
        right={aside(
          all.map((w) => solutionName(w.solution, lang)).join(" · "),
        )}
      >
        <p className="mb-5 p6 text-text-secondary">
          {tr("Goal:")} {batch.goal}
        </p>
        <RouteWithNeeds
          pilot
          stages={stages}
          panels={[]}
          notes={notes}
          onAgree={
            batch.planState === "live" ? undefined : () => agreePlan(batch.id)
          }
        />
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card
          className="h-full"
          title={tr("What we have")}
          right={aside(tr("{0} files", batch.filesCount ?? 0))}
        >
          <ul>
            {(batch.received ?? []).map((file) => (
              <li key={file.label} className="flex gap-2 py-1.5">
                <Icon name="check" size={16} className="mt-0.5 shrink-0 text-icon-dark" />
                <div>
                  <p className="p6 text-text-primary">{file.label}</p>
                  <p className="p7 text-text-tertiary">{file.date}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
        <Card
          className="h-full"
          title={tr("What we still need")}
          right={aside(tr("After you agree the plan"))}
        >
          <ul>
            {needs.map((need) => (
              <li key={need.label} className="flex gap-2 py-1.5">
                <span
                  className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-brand-6"
                  aria-hidden
                />
                <div>
                  <p className="p6 text-text-primary">{need.label}</p>
                  <p className="p7 text-text-tertiary">
                    {need.scope ? `${need.scope} · ${need.why}` : need.why}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card
        title={tr("Solutions")}
        right={aside(
          tr(
            "{0} · {1}",
            nProjects(projects, lang),
            nAssets(batch.buildingIds.length, lang),
          ),
        )}
      >
        <ul>
          {all.map((w, index) => {
            const sites = w.projects
              .filter((p) => !rowIsInactive(p))
              .map((p) => getBuilding(account, p.buildingId));
            return (
              <li
                key={w.id}
                className={
                  index > 0 ? "border-t border-border-light py-3.5" : "py-3.5"
                }
              >
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[180px_minmax(0,1fr)_260px]">
                  <div>
                    <p className="h8 text-text-title">
                      {solutionName(w.solution, lang)}
                    </p>
                    <p className="p7 text-text-secondary">
                      {nAssets(sites.length, lang)}
                    </p>
                  </div>
                  <div>
                    <p className="p6 text-text-primary">
                      {sites.map((site, siteIndex) => (
                        <span key={site.id}>
                          {siteIndex > 0 && ", "}
                          <Link
                            href={hrefs.building(site.id, {
                              project: w.id,
                              from: "buildings",
                            })}
                            className="text-text-primary underline underline-offset-[3px] decoration-border-dark"
                          >
                            {site.name}
                          </Link>
                        </span>
                      ))}
                    </p>
                    {w.exclusion && (
                      <p className="mt-1 p7 text-text-tertiary">
                        Excluded: Leeds, Nottingham, Reading · pitched or shared
                        roofs
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="p7 text-text-tertiary">{tr("Result")}</p>
                    <p className="p6 text-text-primary">
                      {sentence(w.gives ?? "")}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card
          className="h-full"
          title={tr("Recent activity")}
          right={<CardLink href={hrefs.batches}>{tr("See all")}</CardLink>}
        >
          <ul>
            {activity.map((item) => (
              <li
                key={`${item.date}-${item.title}`}
                className="flex items-start justify-between gap-4 py-1.5"
              >
                <div>
                  <p className="h8 text-text-title">{item.title}</p>
                  <p className="p7 text-text-secondary">{item.text}</p>
                </div>
                <span className="shrink-0 p7 text-text-tertiary">
                  {item.date}
                </span>
              </li>
            ))}
          </ul>
        </Card>
        <Card
          className="h-full"
          title={tr("Documents")}
          right={<CardLink href={hrefs.batches}>{tr("See all")}</CardLink>}
        >
          <DocumentList docs={docs} />
        </Card>
      </div>
    </div>
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
    rawService === "dropped" || rawService === "moved" ? rawService : "";

  const serviceCards = [
    {
      id: "",
      label: tr("All"),
      count: countAssetsAnyLive(account, batch),
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

  const cards = [...serviceCards, ...moveCards];

  const validService = SERVICES.some((s) => s.id === rawService);
  const selected =
    rawService === "" ||
    rawService === "dropped" ||
    rawService === "moved" ||
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

    if (liveFiltered.length) {
      tableRows.push({
        kind: "building",
        buildingId: id,
        live: liveFiltered,
        muted: mutedDropMove,
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

  const packageCount = wsInAll(account, batch.id).filter((w) => !w.proposed)
    .length;

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
              const isMove = card.id === "dropped" || card.id === "moved";
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
                <div className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,1.2fr)_minmax(0,0.8fr)_16px] items-center gap-x-6 border-b border-border-light py-2.5 pl-8 pr-6">
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
                        "grid grid-cols-[minmax(0,1.2fr)_minmax(0,1.2fr)_minmax(0,0.8fr)_16px] items-start gap-x-6 border-t border-border-light py-3.5 pl-8 pr-6",
                        tableRowLinkClass,
                      )}
                    >
                      <span className="min-w-0">
                        <ChangedDot on={buildingChanged(account, building.id)}>
                          <span
                            className={cn(
                              "block h8 text-text-title",
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
                        {row.live.map((item) => (
                          <span
                            key={`${item.workstream.id}-svc`}
                            className="block p6 text-text-primary"
                          >
                            {tr(serviceDef(item.workstream.service).label)}
                          </span>
                        ))}
                        {row.muted.map((item) => {
                          const lk = item.row.left?.kind;
                          const reason = item.row.left?.reason ?? "";
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
                        className="mt-1 text-text-tertiary"
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
                        "grid grid-cols-[minmax(0,1.2fr)_minmax(0,1.2fr)_minmax(0,0.8fr)_16px] items-start gap-x-6 border-t border-border-light py-3.5 pl-8 pr-6",
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
                              className="mt-1 text-text-tertiary"
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
                        "grid grid-cols-[minmax(0,1.2fr)_minmax(0,1.2fr)_minmax(0,0.8fr)_16px] items-start gap-x-6 border-t border-border-light py-3.5 pl-8 pr-6",
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
                              className="mt-1 text-text-tertiary"
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
  const proposed = inBatch
    .filter((w) => w.proposed)
    .sort((a, b) => a.name.localeCompare(b.name));
  const rest = inBatch.filter((w) => !w.proposed);
  const openPackages = rest
    .filter((w) => !isClosed(w) && !isCompleted(w))
    .sort(
      (a, b) =>
        parse(b.startedOn || "1 Jan 2000") - parse(a.startedOn || "1 Jan 2000") ||
        a.name.localeCompare(b.name, "en", { sensitivity: "base" }),
    );
  const folded = rest
    .filter((w) => isClosed(w) || isCompleted(w))
    .sort(
      (a, b) =>
        parse(b.startedOn || "1 Jan 2000") - parse(a.startedOn || "1 Jan 2000") ||
        a.name.localeCompare(b.name, "en", { sensitivity: "base" }),
    );
  const [openClosed, setOpenClosed] = useState(false);

  const gridClass =
    "grid grid-cols-[minmax(0,1.2fr)_minmax(0,0.75fr)_minmax(0,0.5fr)_minmax(0,1.35fr)] items-start gap-x-6 border-t border-border-light py-3.5 pl-8 pr-6";

  return (
    <Card bodyClassName="p-0">
      <div className="overflow-x-auto">
        <div className="min-w-[900px]">
          <div className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,0.75fr)_minmax(0,0.5fr)_minmax(0,1.35fr)] items-center gap-x-6 border-b border-border-light py-2.5 pl-8 pr-6">
            <span className="s3 text-text-tertiary">{words.Package}</span>
            <span className="s3 text-text-tertiary">{tr("Now")}</span>
            <span className="s3 text-text-tertiary">{words.Assets}</span>
            <span className="s3 text-text-tertiary">{tr("How it came")}</span>
          </div>

          {openPackages.map((w) => {
            const fromLine = howItCameFrom(account, w, lang);
            const assetsN = activeProjects(w).length;
            return (
              <Link
                key={w.id}
                href={hrefs.workstream(w.id, "batch")}
                className={cn(gridClass, tableRowLinkClass)}
              >
                <span className="min-w-0">
                  <span
                    className={cn(
                      "block h8 text-text-title",
                      tableRowNameCellClass,
                    )}
                  >
                    {w.name}
                  </span>
                </span>
                <span className="p6 text-text-primary">
                  {batchNowLine(account, w, lang)}
                </span>
                <span className="p6 text-text-primary tabular-nums">{assetsN}</span>
                <span className="min-w-0 p6 text-text-secondary">
                  <span className="block">{fromLine.main}</span>
                  {fromLine.sub && (
                    <span className="mt-0.5 block p7 text-text-tertiary">
                      {fromLine.sub}
                    </span>
                  )}
                </span>
              </Link>
            );
          })}

          {proposed.map((w) => {
            const fromLine = howItCameFrom(account, w, lang);
            const assetsN = activeProjects(w).length;
            return (
              <div key={w.id} className={gridClass}>
                <span className="min-w-0">
                  <span className="block h8 text-text-title">{w.name}</span>
                </span>
                <span className="p6 text-text-primary">{tr("Proposed")}</span>
                <span className="p6 text-text-primary tabular-nums">{assetsN}</span>
                <span className="min-w-0 p6 text-text-secondary">
                  <span className="block">{fromLine.main}</span>
                </span>
              </div>
            );
          })}

          {folded.length > 0 && (
            <>
              <button
                type="button"
                onClick={() => setOpenClosed(!openClosed)}
                className={cn(
                  "grid w-full grid-cols-[minmax(0,1.2fr)_minmax(0,0.75fr)_minmax(0,0.5fr)_minmax(0,1.35fr)] items-center gap-x-6 border-t border-border-light py-3.5 pl-8 pr-6 text-left",
                  tableRowLinkClass,
                )}
              >
                <span className="p6 text-text-tertiary">
                  {tr("{0} closed", folded.length)}
                </span>
                <span />
                <span />
                <span className="flex justify-end">
                  <Icon
                    name={openClosed ? "chevron-up" : "chevron-down"}
                    size={16}
                    className="text-text-tertiary"
                  />
                </span>
              </button>
              {openClosed &&
                folded.map((w) => {
                  const atStart = closedPackageFootprint(w);
                  const outcome = closedPackageOutcomeLine(w);
                  const fromLine = howItCameFrom(account, w, lang);
                  const assetsCol = isClosed(w)
                    ? tr("{0} at the start", atStart)
                    : String(activeProjects(w).length);
                  const nowCol = batchNowLine(account, w, lang);
                  const body = (
                    <>
                      <span
                        className={cn(
                          "min-w-0 h8 text-text-tertiary",
                          tableRowNameCellClass,
                        )}
                      >
                        {w.name}
                      </span>
                      <span className="p6 text-text-tertiary">{nowCol}</span>
                      <span className="p6 text-text-tertiary tabular-nums">
                        {assetsCol}
                      </span>
                      <span className="min-w-0 p6 text-text-tertiary">
                        <span className="block">{fromLine.main}</span>
                        {isClosed(w) && outcome && (
                          <span className="mt-0.5 block p7 text-text-tertiary">
                            {outcome}
                          </span>
                        )}
                      </span>
                    </>
                  );
                  return (
                    <Link
                      key={w.id}
                      href={hrefs.workstream(w.id, "batch")}
                      className={cn(
                        gridClass,
                        tableRowLinkClass,
                        isClosed(w) && "bg-black-1",
                      )}
                    >
                      {body}
                    </Link>
                  );
                })}
            </>
          )}
        </div>
      </div>
    </Card>
  );
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
  return <BatchPage account={account} batch={batch} actions={actions} />;
}
