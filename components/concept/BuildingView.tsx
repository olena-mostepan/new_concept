"use client";

import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import * as Tabs from "@radix-ui/react-tabs";
import {
  service,
  SERVICES,
  type Account,
  type Building,
  type DeliveryPhase,
  type DeliveryPhaseId,
  type Doc,
  type ProjectRow,
  type ServiceId,
  type Workstream,
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
  historyEventWaitsOnCustomer,
  historyEventYear,
  isClosed,
  isCompleted,
  money,
  moneyOne,
  packageAssets,
  parse,
  paybackLabel,
  phaseIsInheritedFrom,
  projectsAtBuilding,
  rowIsInactive,
  scopeLine,
  short,
  visitStateLabel,
  type BuildingProject,
} from "@/lib/concept/derive";
import { inPackageFactLine, leftHowLabel } from "@/lib/concept/moves";
import { cn } from "@/lib/utils";
import {
  PackageCard,
  Button,
  Card,
  CardLink,
  ChipTrack,
  focusRing,
  DocumentList,
  PackagePicker,
  Page,
  PageHeader,
  ServiceIcon,
  TabDot,
  Timeline,
  type FactItem,
  tabListClass,
  tabTriggerClass,
} from "./ui";
import { DetailsGrid } from "./DetailsGrid";
import { hrefs } from "./hrefs";
import { useConcept } from "./store";
import { shortFact } from "./WorkstreamChrome";
import { buildingCrumbs } from "./crumbs";
import { WORDS } from "@/lib/concept/words";
import { phaseStarted } from "./serviceChips";
import { packagePrimaryTab } from "./packageStatus";

const STAGES = DELIVERY_PHASES.filter((phase) => phase.id !== "complete");

const BASE_ASSET = `${hrefs.buildings}`;

const SERVICE_TITLE: Record<ServiceId, string> = {
  indicative: "Estimates",
  scope: "Planning",
  tender: "Tender",
  pricing: "Pricing",
  delivery: "Delivery",
};

function assetAtTitle(sid: ServiceId): string {
  return `${SERVICE_TITLE[sid]} at this asset`;
}

/** Package page tab → workstream service id for current dot. */
function packagePrimaryService(w: Workstream): ServiceId {
  const tab = packagePrimaryTab(w);
  if (tab === "estimates") return "indicative";
  if (tab === "survey") return "scope";
  if (
    tab === "brief" ||
    tab === "supplier-matching" ||
    tab === "tender-results"
  )
    return "tender";
  if (tab === "contract") return "pricing";
  return tab as ServiceId;
}

export function BuildingView({ buildingId }: { buildingId: string }) {
  const { account } = useConcept();
  const router = useRouter();
  const search = useSearchParams();
  const building = getBuilding(account, buildingId);
  const allProjects = projectsAtBuilding(account, buildingId);
  if (!building) {
    return (
      <Page>
        <PageHeader title={`${WORDS.Asset} not found`} />
      </Page>
    );
  }

  const live = allProjects.filter(
    (p) => !rowIsInactive(p.row) && !isClosed(p.workstream),
  );
  const earlier = allProjects.filter(
    (p) => rowIsInactive(p.row) || isClosed(p.workstream),
  );

  const crumbs = buildingCrumbs(account, buildingId, search).map(
    ({ label, href }) => ({ label, href }),
  );

  const selectedId = resolvePackageId(live, earlier, search);
  const selected =
    [...live, ...earlier].find((item) => item.workstream.id === selectedId) ??
    live[0] ??
    earlier[0];

  const { flat, groups } = buildPickerData(account, live, earlier, selectedId);
  const packageIndex = flat.findIndex((o) => o.id === selectedId) + 1;

  const packagePickerValue = renderPackagePickerControl(
    flat,
    groups,
    selectedId,
    packageIndex || 1,
    (id) => setPackageQuery(router, search, buildingId, id),
  );

  const headerFacts =
    selected &&
    assetHeaderFacts(
      account,
      building,
      selected,
      flat.length,
      packageIndex || 1,
      packagePickerValue,
    );

  const mergedHistory = mergeAssetHistory(account, allProjects);
  const historyOn = mergedHistory.length > 0;
  const docs = listedDocuments(account.buildings, allProjects, building.name);

  const tabParam = search.get("tab") ?? "overview";
  let tab: "overview" | ServiceId = "overview";
  if (
    tabParam !== "overview" &&
    isServiceId(tabParam) &&
    selected &&
    assetHasServiceRow(selected, tabParam)
  ) {
    tab = tabParam;
  }

  const tabServices = selected ? servicesForAssetTabs(selected) : [];

  const dotSid =
    selected && !assetLeftPackage(selected)
      ? packagePrimaryService(selected.workstream)
      : null;

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
            projects={live}
          />
        }
        kind="asset"
        title={building.name}
        facts={headerFacts ?? []}
        aside={photo}
      />
      {selected && (
        <Tabs.Root
          value={tab}
          onValueChange={(v) =>
            setTabQuery(router, search, buildingId, selected.workstream.id, v)
          }
        >
          <Tabs.List className={tabListClass} aria-label="Asset">
            <Tabs.Trigger value="overview" className={tabTriggerClass}>
              Overview
            </Tabs.Trigger>
            {tabServices.map((sid) => (
              <Tabs.Trigger key={sid} value={sid} className={tabTriggerClass}>
                <span className="inline-flex items-center gap-1.5">
                  {SERVICE_TITLE[sid]}
                  {dotSid === sid && (
                    <TabDot label="Current service" />
                  )}
                </span>
              </Tabs.Trigger>
            ))}
          </Tabs.List>
          <div className="mt-6 space-y-6">
            <Tabs.Content value="overview" className="outline-none">
              <OverviewPanel account={account} building={building} item={selected} />
            </Tabs.Content>
            {tabServices.map((sid) => (
              <Tabs.Content key={sid} value={sid} className="outline-none">
                <ServiceTabPanel
                  account={account}
                  item={selected}
                  serviceId={sid}
                />
              </Tabs.Content>
            ))}
          </div>
        </Tabs.Root>
      )}

      <div className="space-y-4 pb-12">
        {(historyOn || docs.length > 0) && (
          <div
            className={cn(
              "grid gap-4",
              historyOn && docs.length > 0 && "lg:grid-cols-2",
            )}
          >
            {historyOn && <HistoryMerged items={mergedHistory} />}
            {docs.length > 0 && (
              <Documents docs={docs} buildingId={building.id} />
            )}
          </div>
        )}
      </div>
    </Page>
  );
}

function setTabQuery(
  router: ReturnType<typeof useRouter>,
  search: { toString(): string },
  buildingId: string,
  packageId: string,
  value: string,
) {
  const params = new URLSearchParams(search.toString());
  params.delete("service");
  params.set("package", packageId);
  if (value === "overview") params.delete("tab");
  else params.set("tab", value);
  const qs = params.toString();
  router.replace(`${BASE_ASSET}/${buildingId}${qs ? `?${qs}` : ""}`, {
    scroll: false,
  });
}

function setPackageQuery(
  router: ReturnType<typeof useRouter>,
  search: { toString(): string },
  buildingId: string,
  packageId: string,
) {
  const params = new URLSearchParams(search.toString());
  params.delete("service");
  params.delete("tab");
  params.set("package", packageId);
  const qs = params.toString();
  router.replace(`${BASE_ASSET}/${buildingId}${qs ? `?${qs}` : ""}`, {
    scroll: false,
  });
}

function isServiceId(v: string): v is ServiceId {
  return (
    v === "indicative" ||
    v === "scope" ||
    v === "tender" ||
    v === "pricing" ||
    v === "delivery"
  );
}

function resolvePackageId(
  live: BuildingProject[],
  earlier: BuildingProject[],
  search: { get(key: string): string | null },
) {
  const fromWs =
    search.get("from") === "workstream" ? search.get("ws") : null;
  const all = [...live, ...earlier];
  if (fromWs && all.some((item) => item.workstream.id === fromWs))
    return fromWs;
  const requested = search.get("package");
  if (requested && all.some((item) => item.workstream.id === requested))
    return requested;
  if (live.length) return live[0].workstream.id;
  return earlier[0]?.workstream.id ?? "";
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

type PickerOpt = { id: string; name: string; subline: string };

function buildPickerData(
  account: Account,
  live: BuildingProject[],
  earlier: BuildingProject[],
  selectedId: string,
): { flat: PickerOpt[]; groups: Array<{ label?: string; options: PickerOpt[] }> | undefined } {
  const liveOpts = orderPackages(live, selectedId).map((item) =>
    toPickerOption(account, item, false),
  );
  const earlierOpts = orderPackages(earlier, selectedId).map((item) =>
    toPickerOption(account, item, true),
  );
  const flat = [...liveOpts, ...earlierOpts];
  const groups =
    earlierOpts.length > 0
      ? [
          ...(liveOpts.length ? [{ options: liveOpts }] : []),
          { label: "Earlier", options: earlierOpts },
        ]
      : undefined;
  return { flat, groups };
}

function renderPackagePickerControl(
  flat: PickerOpt[],
  groups: Array<{ label?: string; options: PickerOpt[] }> | undefined,
  selectedId: string,
  selectedIndex: number,
  onSelect: (id: string) => void,
): ReactNode {
  if (flat.length < 2) return flat[0]?.name ?? "—";
  return (
    <PackagePicker
      groups={groups}
      options={groups ? undefined : flat}
      selectedId={selectedId}
      selectedIndex={selectedIndex}
      total={flat.length}
      onSelect={onSelect}
    />
  );
}

function toPickerOption(
  account: Account,
  item: BuildingProject,
  isEarlierGroup: boolean,
): PickerOpt {
  const w = item.workstream;
  const batch = getBatch(account, w.batchId);
  const batchName = batch?.name ?? "Batch";
  let subline: string;
  if (isClosed(w)) {
    subline = "Closed";
  } else if (isEarlierGroup && rowIsInactive(item.row)) {
    subline = `${batchName} · Earlier`;
  } else {
    subline = isCompleted(w)
      ? `${batchName} · Complete`
      : `${batchName} · ${service(w.service).label}`;
  }
  return { id: w.id, name: w.name, subline };
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

function assetLeftPackage(item: BuildingProject): boolean {
  return rowIsInactive(item.row);
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
  const inPkg = inPackageFactLine(account, w, selected.row);
  return [
    {
      label:
        packageCount >= 2
          ? `Package · ${packageIndex} of ${packageCount}`
          : "Package",
      value: packageValue,
    },
    { label: "In package", value: inPkg },
    ...(batch?.name
      ? [
          {
            label: "Batch",
            value: batch.name,
            href: hrefs.batch(batch.id),
          } as FactItem,
        ]
      : []),
    ...(building.city ? [{ label: "City", value: building.city }] : []),
  ];
}

function rowForService(
  item: BuildingProject,
  serviceId: ServiceId,
): ProjectRow {
  const { workstream: w, row } = item;
  const phase = w.phases.find((entry) => entry.service === serviceId);
  if (!phase || phase.state === "planned") return row;
  const snap = phase.projects?.find(
    (project) => project.buildingId === row.buildingId,
  );
  return snap ?? row;
}

function assetHasServiceRow(
  item: BuildingProject,
  sid: ServiceId,
): boolean {
  const { workstream: w, row } = item;
  const phase = w.phases.find((p) => p.service === sid);
  if (!phase || phase.state === "planned") return false;
  if (phase.projects?.some((p) => p.buildingId === row.buildingId))
    return true;
  if (
    w.service === sid &&
    w.projects.some((p) => p.buildingId === row.buildingId)
  )
    return true;
  return false;
}

function servicesForAssetTabs(item: BuildingProject): ServiceId[] {
  return SERVICES.map((s) => s.id).filter((sid) => assetHasServiceRow(item, sid));
}

function phaseDoneForService(
  item: BuildingProject,
  sid: ServiceId,
): boolean {
  const ph = item.workstream.phases.find((p) => p.service === sid);
  return ph?.state === "done";
}

function serviceIsFinishedLater(item: BuildingProject, sid: ServiceId): boolean {
  const idx = SERVICES.findIndex((s) => s.id === sid);
  const { workstream: w } = item;
  for (let j = idx + 1; j < SERVICES.length; j++) {
    const next = SERVICES[j].id;
    if (phaseStarted(w, next) && assetHasServiceRow(item, next)) return true;
  }
  return false;
}

function lastServiceForAsset(item: BuildingProject): ServiceId {
  const w = item.workstream;
  if (!assetLeftPackage(item)) return w.service;
  for (let i = SERVICES.length - 1; i >= 0; i--) {
    const sid = SERVICES[i].id;
    const ph = w.phases.find((p) => p.service === sid);
    if (!ph || ph.state === "planned") continue;
    if (ph.projects?.some((p) => p.buildingId === item.row.buildingId)) {
      return sid;
    }
  }
  return w.service;
}

function OverviewPanel({
  account,
  building,
  item,
}: {
  account: Account;
  building: Building;
  item: BuildingProject;
}) {
  const w = item.workstream;
  const sid = lastServiceForAsset(item);
  const panelTitle = assetAtTitle(sid);
  const panelAside = panelAsideForService(item, sid);
  const chips = SERVICES.flatMap((entry) => {
    const phase = w.phases.find((c) => c.service === entry.id);
    if (!phase || (phase.state !== "done" && phase.state !== "now"))
      return [];
    return [
      {
        id: entry.id,
        label: entry.label,
        lead: phase.state === "now" ? ("now" as const) : ("done" as const),
      },
    ];
  });

  const panelChildren =
    sid === "delivery" && item.row.delivery ? (
      <DeliveryTrack item={item} />
    ) : (
      <ServiceStepTrack item={item} serviceId={sid} />
    );

  const left = assetLeftPackage(item);
  const headline = assetStatusHeadlineCopy(w, left);
  const asideContent =
    !left && headline.name ? (
      <div className="flex shrink-0 items-center gap-6">
        <div className="flex items-center gap-4">
          <ServiceIcon service={w.service} size={72} className="shrink-0" />
          <div className="min-w-0">
            <p className="p7 text-text-tertiary">{headline.lead}</p>
            <p className="h4 text-text-primary">{headline.name}</p>
          </div>
        </div>
        <Button
          type="strong"
          size="large"
          icon="chevron-right"
          iconPosition="right"
          href={hrefs.workstream(w.id, "building", building.id)}
          ariaLabel={`Open ${w.name}`}
          className="shrink-0"
        >
          Open package
        </Button>
      </div>
    ) : (
      <Button
        type="strong"
        size="large"
        icon="chevron-right"
        iconPosition="right"
        href={hrefs.workstream(w.id, "building", building.id)}
        ariaLabel={`Open ${w.name}`}
        className="shrink-0"
      >
        Open package
      </Button>
    );

  return (
    <PackageCard
      packageName={w.name}
      chips={chips}
      asideContent={asideContent}
      panelTitle={panelTitle}
      panelAside={panelAside}
      panelChildren={panelChildren}
    />
  );
}

function assetStatusHeadlineCopy(w: Workstream, left: boolean) {
  if (left) return { lead: "", name: null as string | null };
  if (isClosed(w) && w.closedOn) {
    return { lead: "This asset is in", name: `Closed · ${short(w.closedOn)}` };
  }
  if (isCompleted(w)) {
    return { lead: "This asset is complete", name: null as string | null };
  }
  return { lead: "This asset is in", name: service(w.service).label };
}

function panelAsideForService(item: BuildingProject, sid: ServiceId): string {
  const { workstream: w } = item;
  const phase = w.phases.find((p) => p.service === sid);
  if (phase?.completedOn) return short(phase.completedOn);
  if (phase?.startedOn) return short(phase.startedOn);
  return "—";
}

function ServiceTabPanel({
  account,
  item,
  serviceId,
}: {
  account: Account;
  item: BuildingProject;
  serviceId: ServiceId;
}) {
  const w = item.workstream;
  const row = rowForService(item, serviceId);
  const inherited = phaseIsInheritedFrom(w, account, serviceId);
  const fromWs = w.from ? getWorkstream(account, w.from.workstreamId) : null;
  const phase = w.phases.find((p) => p.service === serviceId);
  const rightDate =
    inherited && fromWs
      ? `From ${fromWs.name} · ${short(
          phase?.completedOn ?? fromWs.completedOn ?? "",
        )}`
      : latestFactDate(row, serviceId, phase);

  const track =
    serviceId === "delivery" && row.delivery ? (
      <DeliveryTrack item={item} />
    ) : (
      <ServiceStepTrack item={item} serviceId={serviceId} />
    );

  const facts = assetServiceFactsForTab(item, serviceId);

  return (
    <Card
      title={assetAtTitle(serviceId)}
      right={<span className="p7 text-text-tertiary">{rightDate}</span>}
    >
      <div className="space-y-6">
        {track}
        {facts.length > 0 && <DetailsGrid items={facts} />}
      </div>
    </Card>
  );
}

function latestFactDate(
  row: ProjectRow,
  serviceId: ServiceId,
  phase: { completedOn?: string; startedOn?: string } | undefined,
): string {
  const candidates: string[] = [];
  if (phase?.completedOn) candidates.push(phase.completedOn);
  if (phase?.startedOn) candidates.push(phase.startedOn);
  if (serviceId === "indicative") {
    if (row.presentedOn) candidates.push(row.presentedOn);
    if (row.decidedOn) candidates.push(row.decidedOn);
  }
  if (serviceId === "scope" && row.visit?.on) candidates.push(row.visit.on);
  if (serviceId === "tender" && row.visit?.state === "done" && row.visit.on) {
    candidates.push(row.visit.on);
  }
  if (serviceId === "pricing" && row.decidedOn) candidates.push(row.decidedOn);
  if (!candidates.length) return "—";
  return short(candidates.reduce((a, b) => (parse(a) > parse(b) ? a : b)));
}

function ServiceStepTrack({
  item,
  serviceId,
}: {
  item: BuildingProject;
  serviceId: ServiceId;
}) {
  const row = rowForService(item, serviceId);
  const labels = service(serviceId).steps;
  const w = item.workstream;
  const finished =
    serviceIsFinishedLater(item, serviceId) || phaseDoneForService(item, serviceId);
  const steps = labels.map((label, i) => {
    let lead: "done" | "now" | "next";
    if (finished || row.step > i) lead = "done";
    else if (row.step === i) lead = "now";
    else lead = "next";
    const noteText = stepNotes(item, serviceId, label, row);
    return {
      key: label,
      lead,
      label,
      notes: noteText
        ? [{ text: noteText, className: "p7 text-text-secondary" }]
        : [],
    };
  });
  return <ChipTrack steps={steps} />;
}

function stepNotes(
  item: BuildingProject,
  serviceId: ServiceId,
  stepLabel: string,
  row: ProjectRow,
): string {
  if (serviceId === "indicative") {
    if (stepLabel === "Estimate" && row.estimate) return money(row.estimate);
    if (stepLabel === "Presented" && row.presentedOn)
      return short(row.presentedOn);
    if (stepLabel === "Decision" && row.decision && row.decision !== "waiting")
      return decisionLabel(row);
  }
  if (serviceId === "scope") {
    if (stepLabel === "Gap found" && row.gap) return row.gap;
    if (
      stepLabel === "Survey done" &&
      row.visit?.state === "done" &&
      row.visit.on
    ) {
      return short(row.visit.on);
    }
  }
  if (serviceId === "tender") {
    if (stepLabel === "Supplier chosen" && item.workstream.supplier) {
      return item.workstream.supplier;
    }
  }
  if (serviceId === "pricing") {
    if (stepLabel === "Decision" && row.decision && row.decision !== "waiting")
      return decisionLabel(row);
  }
  return "";
}

function assetServiceFactsForTab(
  item: BuildingProject,
  serviceId: ServiceId,
): FactItem[] {
  const { workstream: w } = item;
  const row = rowForService(item, serviceId);
  if (!phaseStarted(w, serviceId)) return [];
  if (serviceId === "indicative") {
    const facts: FactItem[] = [];
    if (row.estimate) facts.push({ label: "Cost", value: money(row.estimate) });
    if (row.paybackYears !== undefined) {
      facts.push({ label: "Payback", value: paybackLabel(row.paybackYears) });
    }
    if (row.decision) {
      facts.push({
        label: "Your decision",
        value:
          row.decision === "waiting"
            ? "Waiting for your decision"
            : decisionLabel(row),
      });
    }
    return facts;
  }
  if (serviceId === "scope") {
    const facts: FactItem[] = [];
    if (row.gap) facts.push({ label: "Open gap", value: row.gap });
    if (row.visit) {
      facts.push({ label: "Survey", value: visitStateLabel(row.visit) });
    }
    const sc = scopeLine(w, row);
    if (sc && sc !== "—") facts.push({ label: "Scope", value: sc });
    return facts;
  }
  if (serviceId === "tender") {
    const facts: FactItem[] = [];
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
    const facts: FactItem[] = [];
    if (row.price) facts.push({ label: "Price", value: moneyOne(row.price) });
    if (row.analysis) facts.push({ label: "Analysis", value: row.analysis });
    if (row.decision) {
      facts.push({
        label: "Your decision",
        value:
          row.decision === "waiting"
            ? "Waiting for your decision"
            : decisionLabel(row),
      });
    }
    return facts;
  }
  return [];
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
        const src = phaseSource(
          stage.id,
          phase,
          row.visit?.state === "done" ? row.visit.on : undefined,
        );
        const dateNote = deliveryPhaseDateNote(phase, !allDone && index === current);
        const notes = dateNote ? [dateNote] : [];
        if (src) {
          notes.push({ text: src, className: "p7 text-text-tertiary" });
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

type HistoryMergedItem = {
  event: string;
  detail: string;
  date: string;
  year: string;
  you?: boolean;
};

function mergeAssetHistory(
  account: Account,
  projects: BuildingProject[],
): HistoryMergedItem[] {
  const synthetic: HistoryMergedItem[] = [];
  for (const { workstream: w, row } of projects) {
    const pkg = w.name;
    if (row.joined?.on) {
      synthetic.push({
        event: "Joined package",
        detail: pkg,
        date: row.joined.on,
        year: historyEventYear(row.joined.on),
      });
    }
    if (row.hold?.since) {
      synthetic.push({
        event: "On hold",
        detail: pkg,
        date: row.hold.since,
        year: historyEventYear(row.hold.since),
      });
    }
    if (row.left?.on && row.left.kind) {
      synthetic.push({
        event: `Left package · ${leftHowLabel(row.left.kind)}`,
        detail: pkg,
        date: row.left.on,
        year: historyEventYear(row.left.on),
      });
    }
  }
  const fromRows = projects.flatMap(({ workstream: w, row }) =>
    (row.history ?? []).map((item) => ({
      event: shortFact(item.event),
      detail: w.name,
      date: item.date,
      year: historyEventYear(item.date),
      you: historyEventWaitsOnCustomer(row, item.event),
    })),
  );
  const merged = [...synthetic, ...fromRows];
  return merged.sort((a, b) => parse(b.date) - parse(a.date));
}

function HistoryMerged({ items }: { items: HistoryMergedItem[] }) {
  const timelineItems = items.map((item) => ({
    event: item.event,
    detail: item.detail,
    date: short(item.date),
    year: item.year,
    you: item.you,
  }));
  return (
    <Card title="History" className="h-full">
      <Timeline items={timelineItems} />
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
  const tab = search.get("tab");
  const pkg = search.get("package");
  const hrefFor = (id: string) => {
    const sp = new URLSearchParams();
    if (w?.id) {
      sp.set("project", w.id);
      sp.set("from", "workstream");
      sp.set("ws", w.id);
      if (via === "service" || via === "batch") sp.set("via", via);
    }
    if (pkg) sp.set("package", pkg);
    if (tab) sp.set("tab", tab);
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
          className={cn(
            "rounded-sm text-text-secondary outline-none hover:text-text-primary",
            focusRing,
          )}
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
          className={cn(
            "rounded-sm text-text-secondary outline-none hover:text-text-primary",
            focusRing,
          )}
        >
          {name(next.buildingId)} ›
        </Link>
      ) : (
        <span className="text-text-disabled">Next ›</span>
      )}
    </div>
  );
}
