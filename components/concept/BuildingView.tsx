"use client";

import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  service,
  SERVICES,
  TODAY,
  type Account,
  type Building,
  type DeliveryPhase,
  type DeliveryPhaseId,
  type Doc,
  type ProjectRow,
  type ServiceId,
} from "@/lib/concept/model";
import {
  DELIVERY_PHASES,
  deliveryPhaseDateNote,
} from "@/lib/concept/delivery";
import {
  days,
  decisionLabel,
  getBatch,
  getBuilding,
  getWorkstream,
  isCompleted,
  money,
  moneyOne,
  packageAssets,
  paybackLabel,
  projectsAtBuilding,
  scopeLine,
  short,
  solutionName,
  visitStateLabel,
  type BuildingProject,
} from "@/lib/concept/derive";
import { cn } from "@/lib/utils";
import {
  PackageCard,
  Card,
  CardLink,
  ChipTrack,
  DocumentList,
  FactsRow,
  PackagePicker,
  Page,
  PageHeader,
  type FactItem,
  type PackagePickerOption,
} from "./ui";
import { hrefs } from "./hrefs";
import { useConcept } from "./store";
import { shortFact } from "./WorkstreamChrome";
import { assetPackageScopeLine } from "./packageTabs";
import { buildingCrumbs } from "./crumbs";
import { WORDS } from "@/lib/concept/words";
import { phaseStarted } from "./serviceChips";

const STAGES = DELIVERY_PHASES.filter((phase) => phase.id !== "complete");

const PANEL_TITLE: Record<ServiceId, string> = {
  indicative: "Estimate at this asset",
  scope: "Planning at this asset",
  tender: "Tender at this asset",
  pricing: "Price at this asset",
  delivery: "Delivery at this asset",
};

export function BuildingView({ buildingId }: { buildingId: string }) {
  const { account } = useConcept();
  const router = useRouter();
  const search = useSearchParams();
  const building = getBuilding(account, buildingId);
  const projects = projectsAtBuilding(account, buildingId);
  if (!building) {
    return (
      <Page>
        <PageHeader title={`${WORDS.Asset} not found`} />
      </Page>
    );
  }
  const crumbs = buildingCrumbs(account, buildingId, search).map(
    ({ label, href }) => ({ label, href }),
  );

  const selectedId = resolvePackageId(projects, search);
  const selected =
    projects.find((item) => item.workstream.id === selectedId) ?? projects[0];
  const packageOptions = packagePickerOptions(account, projects, selectedId);
  const packageRank = [...projects].sort(
    (a, b) => packageActivityDay(b) - packageActivityDay(a),
  );
  const packageIndex =
    packageRank.findIndex((item) => item.workstream.id === selectedId) + 1;

  const headerFacts = selected
    ? assetHeaderFacts(
        account,
        building,
        selected,
        projects.length,
        packageIndex || 1,
        projects.length >= 2 ? (
          <PackagePicker
            options={packageOptions}
            selectedId={selected.workstream.id}
            selectedIndex={packageIndex || 1}
            total={projects.length}
            onSelect={(id) => setPackageQuery(router, search, building.id, id)}
          />
        ) : (
          selected.workstream.name
        ),
      )
    : [];

  const historyOn = projects.some(({ row }) => (row.history ?? []).length > 0);
  const docs = listedDocuments(account.buildings, projects, building.name);

  const effectiveService = selected
    ? resolveServiceId(selected, search.get("service"))
    : undefined;
  const panel =
    selected && effectiveService
      ? panelForService(selected, effectiveService)
      : null;

  const chipState =
    selected && effectiveService
      ? serviceChipItems(selected, effectiveService, (sid) =>
          setServiceQuery(
            router,
            search,
            building.id,
            selected.workstream.id,
            sid,
          ),
        )
      : { switchable: false, chips: [] };

  const photo = building.photo ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={building.photo}
      alt=""
      className="h-[164px] w-[260px] shrink-0 rounded-lg object-cover"
    />
  ) : undefined;

  return (
    <Page>
      <PageHeader
        crumbs={crumbs}
        crumbAside={
          <AssetPager
            account={account}
            buildingId={building.id}
            search={search}
            projects={projects}
          />
        }
        kind="asset"
        title={building.name}
        facts={headerFacts}
        aside={photo}
      />
      <div className="space-y-4 pb-12">
        {selected && (
          <PackageCard
            packageName={selected.workstream.name}
            chips={chipState.chips}
            switchable={chipState.switchable}
            scopeLine={assetPackageScopeLine(selected.workstream)}
            openPackageHref={hrefs.workstream(
              selected.workstream.id,
              "building",
              building.id,
            )}
            openPackageAriaLabel={`Open ${selected.workstream.name} package`}
            panelTitle={panel?.title}
            panelAside={panel?.aside}
            panelChildren={panel?.children}
          />
        )}
        {(historyOn || docs.length > 0) && (
          <div
            className={cn(
              "grid gap-4",
              historyOn && docs.length > 0 && "lg:grid-cols-2",
            )}
          >
            {historyOn && <History projects={projects} />}
            {docs.length > 0 && (
              <Documents docs={docs} buildingId={building.id} />
            )}
          </div>
        )}
      </div>
    </Page>
  );
}

function setPackageQuery(
  router: ReturnType<typeof useRouter>,
  search: { toString(): string },
  buildingId: string,
  packageId: string,
) {
  const params = new URLSearchParams(search.toString());
  params.delete("tab");
  params.delete("service");
  params.set("package", packageId);
  const qs = params.toString();
  router.replace(`${hrefs.building(buildingId)}${qs ? `?${qs}` : ""}`, {
    scroll: false,
  });
}

function setServiceQuery(
  router: ReturnType<typeof useRouter>,
  search: { toString(): string },
  buildingId: string,
  packageId: string,
  serviceId: ServiceId,
) {
  const params = new URLSearchParams(search.toString());
  params.delete("tab");
  params.set("package", packageId);
  params.set("service", serviceId);
  const qs = params.toString();
  router.replace(`${hrefs.building(buildingId)}${qs ? `?${qs}` : ""}`, {
    scroll: false,
  });
}

function packageActivityDay(item: BuildingProject) {
  const w = item.workstream;
  const dates = w.phases.flatMap((phase) =>
    [phase.completedOn, phase.startedOn].filter(Boolean),
  ) as string[];
  if (w.completedOn) dates.push(w.completedOn);
  if (!dates.length) return 0;
  return Math.max(...dates.map((date) => days(date)));
}

function resolvePackageId(
  projects: BuildingProject[],
  search: { get(key: string): string | null },
) {
  if (!projects.length) return "";
  const fromWs =
    search.get("from") === "workstream" ? search.get("ws") : null;
  if (fromWs && projects.some((item) => item.workstream.id === fromWs))
    return fromWs;
  const requested = search.get("package");
  if (requested && projects.some((item) => item.workstream.id === requested))
    return requested;
  return [...projects].sort(
    (a, b) => packageActivityDay(b) - packageActivityDay(a),
  )[0].workstream.id;
}

function orderPackages(
  projects: BuildingProject[],
  selectedId: string,
): BuildingProject[] {
  const selected = projects.find((item) => item.workstream.id === selectedId);
  const rest = projects
    .filter((item) => item.workstream.id !== selectedId)
    .sort((a, b) => packageActivityDay(b) - packageActivityDay(a));
  return selected ? [selected, ...rest] : rest;
}

function packagePickerOptions(
  account: ReturnType<typeof useConcept>["account"],
  projects: BuildingProject[],
  selectedId: string,
): PackagePickerOption[] {
  return orderPackages(projects, selectedId).map((item) => {
    const w = item.workstream;
    const batch = getBatch(account, w.batchId);
    const batchName = batch?.name ?? "Batch";
    const subline = isCompleted(w)
      ? `${batchName} · Complete`
      : `${batchName} · ${service(w.service).label}`;
    return { id: w.id, name: w.name, subline };
  });
}

function assetHeaderFacts(
  account: Account,
  building: Building,
  selected: BuildingProject,
  packageCount: number,
  packageIndex: number,
  packageValue: ReactNode,
): FactItem[] {
  const w = selected.workstream;
  const batch = getBatch(account, w.batchId);
  const facts: FactItem[] = [
    {
      label:
        packageCount >= 2
          ? `Package · ${packageIndex} of ${packageCount}`
          : "Package",
      value: packageValue,
    },
  ];
  if (batch?.name) {
    facts.push({
      label: "Batch",
      value: batch.name,
      href: hrefs.batch(batch.id),
    });
  }
  facts.push({
    label: "Solution",
    value: solutionName(w.solution),
  });
  if (building.city) facts.push({ label: "City", value: building.city });
  return facts;
}

function resolveServiceId(
  item: BuildingProject,
  requested: string | null,
): ServiceId {
  const w = item.workstream;
  if (
    requested &&
    isServiceId(requested) &&
    assetServiceHasContent(item, requested)
  ) {
    return requested;
  }
  return w.service;
}

function isServiceId(value: string): value is ServiceId {
  return (
    value === "indicative" ||
    value === "scope" ||
    value === "tender" ||
    value === "pricing" ||
    value === "delivery"
  );
}

function serviceChipItems(
  item: BuildingProject,
  activeService: ServiceId,
  onSelect: (sid: ServiceId) => void,
) {
  const w = item.workstream;
  const chips = SERVICES.flatMap((entry) => {
    const phase = w.phases.find((candidate) => candidate.service === entry.id);
    if (!phase || (phase.state !== "done" && phase.state !== "now")) return [];
    return [
      {
        id: entry.id,
        label: entry.label,
        lead: phase.state === "now" ? ("now" as const) : ("done" as const),
      },
    ];
  });
  const withData = chips.filter((chip) =>
    assetServiceHasContent(item, chip.id as ServiceId),
  );
  const switchable = withData.length >= 2;
  return {
    switchable,
    chips: chips.map((chip) => {
      const sid = chip.id as ServiceId;
      const hasData = assetServiceHasContent(item, sid);
      return {
        ...chip,
        selectable: switchable && hasData,
        selected: activeService === sid,
        onSelect:
          switchable && hasData ? () => onSelect(sid) : undefined,
      };
    }),
  };
}

function panelForService(item: BuildingProject, serviceId: ServiceId) {
  if (!assetServiceHasContent(item, serviceId)) return null;
  const { workstream: w, row } = item;
  if (serviceId === "delivery" && row.delivery) {
    const supplier = w.supplier ? `${w.supplier} · ` : "";
    return {
      title: PANEL_TITLE.delivery,
      aside: `${supplier}contract ${moneyOne(row.delivery.value ?? 0)}`,
      children: <DeliveryTrack item={item} />,
    };
  }
  return {
    title: PANEL_TITLE[serviceId],
    aside: panelAside(item, serviceId),
    children: (
      <FactsRow facts={assetServiceFactItems(item, serviceId)} />
    ),
  };
}

function panelAside(item: BuildingProject, serviceId: ServiceId) {
  const { workstream: w } = item;
  const phase = w.phases.find((entry) => entry.service === serviceId);
  if (phase?.completedOn) return short(phase.completedOn);
  if (phase?.startedOn) return short(phase.startedOn);
  return undefined;
}

function assetServiceHasContent(item: BuildingProject, sid: ServiceId) {
  if (sid === "delivery") {
    return phaseStarted(item.workstream, sid) && Boolean(item.row.delivery);
  }
  return assetServiceFacts(item, sid).length > 0;
}

function AssetPager({
  account,
  buildingId,
  search,
  projects,
}: {
  account: Account;
  buildingId: string;
  search: { get(key: string): string | null; toString(): string };
  projects: BuildingProject[];
}) {
  const router = useRouter();
  const fromPackage = search.get("from") === "workstream";
  const wsId = search.get("ws") ?? "";
  const w = fromPackage && wsId ? getWorkstream(account, wsId) : undefined;
  const assets = w ? packageAssets(w) : [];
  const index = assets.findIndex((row) => row.buildingId === buildingId);
  const previous = index > 0 ? assets[index - 1] : undefined;
  const next =
    index >= 0 && index < assets.length - 1 ? assets[index + 1] : undefined;
  const via = search.get("via");
  const hrefFor = (id: string) => {
    const sp = new URLSearchParams();
    if (w?.id) {
      sp.set("project", w.id);
      sp.set("from", "workstream");
      sp.set("ws", w.id);
      if (via === "service" || via === "batch") sp.set("via", via);
    }
    const pkg = search.get("package");
    if (pkg) sp.set("package", pkg);
    const svc = search.get("service");
    if (svc) sp.set("service", svc);
    const qs = sp.toString();
    return `${hrefs.building(id)}${qs ? `?${qs}` : ""}`;
  };

  useEffect(() => {
    if (!w || assets.length < 2 || index < 0) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "[" && event.key !== "]") return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      )
        return;
      const row = event.key === "[" ? previous : next;
      if (!row) return;
      event.preventDefault();
      router.push(hrefFor(row.buildingId));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [w, assets.length, index, previous, next, router]);

  if (!w || assets.length < 2 || index < 0) return null;
  const name = (id: string) => getBuilding(account, id).name;
  return (
    <div className="flex shrink-0 items-center gap-4 p6">
      {previous ? (
        <Link
          href={hrefFor(previous.buildingId)}
          aria-label="Previous asset in this package"
          className="text-text-secondary hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black-7"
        >
          ‹ {name(previous.buildingId)}
        </Link>
      ) : (
        <span className="text-text-disabled">‹ Previous</span>
      )}
      <span className="text-text-tertiary">
        {index + 1} of {assets.length} in this {WORDS.package}
      </span>
      {next ? (
        <Link
          href={hrefFor(next.buildingId)}
          aria-label="Next asset in this package"
          className="text-text-secondary hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black-7"
        >
          {name(next.buildingId)} ›
        </Link>
      ) : (
        <span className="text-text-disabled">Next ›</span>
      )}
    </div>
  );
}

function rowForService(item: BuildingProject, serviceId: ServiceId): ProjectRow {
  const { workstream: w, row } = item;
  const phase = w.phases.find((entry) => entry.service === serviceId);
  const snap = phase?.projects?.find(
    (project) => project.buildingId === row.buildingId,
  );
  return snap ?? row;
}

function assetServiceFacts(
  item: BuildingProject,
  serviceId: ServiceId,
): Array<{ label: string; value: string }> {
  const { workstream: w } = item;
  const row = rowForService(item, serviceId);
  if (!phaseStarted(w, serviceId)) return [];
  if (serviceId === "indicative") {
    const facts: Array<{ label: string; value: string }> = [];
    if (row.estimate) facts.push({ label: "Cost", value: money(row.estimate) });
    if (row.paybackYears !== undefined)
      facts.push({ label: "Payback", value: paybackLabel(row.paybackYears) });
    if (row.decision)
      facts.push({
        label: "Your decision",
        value:
          row.decision === "waiting"
            ? "Waiting for your decision"
            : decisionLabel(row),
      });
    return facts;
  }
  if (serviceId === "scope") {
    const facts: Array<{ label: string; value: string }> = [];
    if (row.gap) facts.push({ label: "Open gap", value: row.gap });
    if (row.visit)
      facts.push({
        label: "Survey",
        value: visitStateLabel(row.visit),
      });
    const scope = scopeLine(w, row);
    if (scope && scope !== "\u2014")
      facts.push({ label: "Scope", value: scope });
    return facts;
  }
  if (serviceId === "tender") {
    const facts: Array<{ label: string; value: string }> = [];
    if (w.supplier) facts.push({ label: "Supplier", value: w.supplier });
    if (row.price)
      facts.push({
        label: "Price for this asset",
        value: moneyOne(row.price),
      });
    if (row.visit?.state === "done") {
      const detail = row.visit.detail
        ? shortFact(row.visit.detail)
        : row.visit.on
          ? `Done · ${short(row.visit.on)}`
          : "Done";
      facts.push({ label: "Site check", value: detail });
    } else if (row.visit && row.visit.state !== "skip") {
      facts.push({
        label: "Site check",
        value: visitStateLabel(row.visit),
      });
    }
    return facts;
  }
  if (serviceId === "pricing") {
    const facts: Array<{ label: string; value: string }> = [];
    if (row.price) facts.push({ label: "Price", value: moneyOne(row.price) });
    if (row.analysis) facts.push({ label: "Analysis", value: row.analysis });
    if (row.decision)
      facts.push({
        label: "Your decision",
        value:
          row.decision === "waiting"
            ? "Waiting for your decision"
            : decisionLabel(row),
      });
    return facts;
  }
  return [];
}

function assetServiceFactItems(
  item: BuildingProject,
  serviceId: ServiceId,
): FactItem[] {
  return assetServiceFacts(item, serviceId).map((fact) => ({
    label: fact.label,
    value: fact.value,
  }));
}

function DeliveryTrack({ item }: { item: BuildingProject }) {
  const { row } = item;
  const phases = row.delivery?.phases ?? {};
  const confirmAt = STAGES.findIndex(
    (stage) => stage.id === row.delivery?.confirmPhase,
  );
  const firstOpen = STAGES.findIndex(
    (stage) => phases[stage.id]?.state !== "confirmed",
  );
  const current = confirmAt >= 0 ? confirmAt : firstOpen;
  const allDone = current < 0;
  return (
    <ChipTrack
      steps={STAGES.map((stage, index) => {
        const phase = phases[stage.id];
        const done = allDone || index < current;
        const now = !allDone && index === current;
        const source = phaseSource(
          stage.id,
          phase,
          row.visit?.state === "done" ? row.visit.on : undefined,
        );
        const dateNote = deliveryPhaseDateNote(phase, !allDone && index === current);
        const notes = dateNote ? [dateNote] : [];
        if (source) {
          notes.push({ text: source, className: "p7 text-text-tertiary" });
        }
        return {
          key: stage.id,
          lead: done ? ("done" as const) : now ? ("now" as const) : ("next" as const),
          label: stage.label,
          notes,
        };
      })}
    />
  );
}

function phaseSource(
  stageId: string,
  phase: DeliveryPhase | undefined,
  visitOn?: string,
): string {
  if (stageId === "start") {
    if (phase?.source === "contract_start") return "Contract start date";
    if (phase?.source === "contract_signed") return "Contract signed";
    if (phase?.source === "loi_signed") return "LOI signed";
    if (phase?.source === "first_invoice")
      return "From invoice · date to confirm";
    return phase?.state === "estimate" ? "Estimate" : "";
  }
  if (visitOn && phase?.on && phase.on === visitOn) return "Site check report";
  if (phase?.state === "from_invoice") return "From invoice · date to confirm";
  if (phase?.state === "estimate") return "Estimate";
  return "";
}

const HISTORY_YEAR = TODAY.split(" ")[2] ?? "";

function eventYear(date: string) {
  const last = date.trim().split(" ").at(-1) ?? "";
  return /^\d{4}$/.test(last) ? last : HISTORY_YEAR;
}

function waitsOnYou(
  phaseId: DeliveryPhaseId | undefined,
  phases: Partial<Record<DeliveryPhaseId, DeliveryPhase>> | undefined,
  date: string,
) {
  if (!phaseId || !phases) return false;
  const phase = phases[phaseId];
  return phase?.state === "from_invoice" && Boolean(phase.on) && short(phase.on) === date;
}

function History({ projects }: { projects: BuildingProject[] }) {
  const several = projects.length > 1;
  const items = projects
    .flatMap(({ workstream, row }) =>
      (row.history ?? []).map((item) => ({
        event: shortFact(item.event),
        detail: several
          ? `${solutionName(workstream.solution)} · ${shortFact(item.detail)}`
          : shortFact(item.detail),
        date: item.date,
        year: eventYear(item.date),
        you: waitsOnYou(
          row.delivery?.confirmPhase,
          row.delivery?.phases,
          item.date,
        ),
      })),
    )
    .sort((a, b) => days(a.date) - days(b.date));
  const years = new Set(items.map((item) => item.year));
  return (
    <Card title="History" className="h-full">
      <ol className="flex flex-col gap-3.5">
        {items.map((item, index) => {
          const showYear = index === 0 || item.year !== items[index - 1]?.year;
          const yearLabel = years.size > 1 ? showYear : index === 0;
          return (
            <li key={`${item.date}-${item.event}`}>
              {yearLabel && (
                <div className="grid grid-cols-[52px_16px_minmax(0,1fr)] gap-x-2.5 pb-2">
                  <p className="col-start-3 s3 text-text-tertiary">{item.year}</p>
                </div>
              )}
              <div className="grid grid-cols-[52px_16px_minmax(0,1fr)] gap-x-2.5">
                <p className="h9 text-right text-text-title">{item.date.replace(/ \d{4}$/, "")}</p>
                <div className="relative flex justify-center">
                  <span
                    className={cn(
                      "z-10 mt-1.5 h-2 w-2 shrink-0 rounded-full",
                      item.you
                        ? "bg-brand-6 shadow-[0_0_0_3px_var(--bg-accent)]"
                        : "bg-black-4",
                    )}
                  />
                  {index < items.length - 1 && (
                    <span
                      className="absolute top-3.5 -bottom-5 w-px bg-black-3"
                      aria-hidden
                    />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="h8 text-text-primary">{item.event}</p>
                  {item.detail && (
                    <p className="p7 text-text-secondary">{item.detail}</p>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </Card>
  );
}

function packageMeta(meta: string) {
  return `package · ${meta}`;
}

function listedDocuments(
  buildings: Building[],
  projects: BuildingProject[],
  buildingName: string,
) {
  const others = buildings
    .filter((item) => item.name !== buildingName)
    .map((item) => item.name);
  const seen = new Set<string>();
  const own: Doc[] = [];
  const shared: Doc[] = [];
  for (const { workstream } of projects) {
    for (const doc of workstream.documents ?? []) {
      if (seen.has(doc.name)) continue;
      if (others.some((name) => doc.name.includes(name))) continue;
      seen.add(doc.name);
      if (doc.name.includes(buildingName)) own.push(doc);
      else shared.push({ ...doc, meta: packageMeta(doc.meta) });
    }
  }
  return [...own, ...shared];
}

function Documents({
  docs,
  buildingId,
}: {
  docs: Doc[];
  buildingId: string;
}) {
  return (
    <Card
      title="Documents"
      right={<CardLink href={hrefs.building(buildingId)}>See all</CardLink>}
      className="h-full"
    >
      <DocumentList docs={docs} />
    </Card>
  );
}
