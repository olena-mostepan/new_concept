"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import * as Tabs from "@radix-ui/react-tabs";
import {
  service,
  SERVICES,
  type MoveKind,
  type ProjectRow,
  type ServiceId,
  type Workstream,
} from "@/lib/concept/model";
import { DELIVERY_PHASES } from "@/lib/concept/delivery";
import {
  activeProjects,
  buildingChanged,
  days,
  deliverySteps,
  getBuilding,
  getWorkstream,
  indicativeSteps,
  isClosed,
  parse,
  phaseIsInheritedFrom,
  pricingSteps,
  scopeSteps,
  short,
  tenderSteps,
  workstreamView,
  type StepColumn,
} from "@/lib/concept/derive";
import { inPackageColumnLines } from "@/lib/concept/moves";
import { useConceptI18n } from "./useConceptI18n";
import { cn } from "@/lib/utils";
import {
  Icon,
  Card,
  ChangedDot,
  ChipTrack,
  ListMore,
  PackageCard,
  type PackageCardChip,
  Page,
  TabDot,
  tableRowLinkClass,
  tableRowNameCellClass,
  tabListClass,
  tabTriggerClass,
} from "./ui";
import { Tag } from "@/components/ds/tag";
import {
  WorkstreamFacts,
  WorkstreamFrame,
  packagePrimaryTab,
} from "./WorkstreamChrome";
import { EstimatesPanel } from "./IndicativeWorkstream";
import { SurveysTab } from "./SurveysTab";
import { TenderPanel } from "./TenderWorkstream";
import { ContractPanel, PricingPanel } from "./PricingWorkstream";
import { DeliveryPanel } from "./DeliveryWorkstream";
import { hrefs } from "./hrefs";
import { useConcept } from "./store";
import { tabsFor, type PackageTabId } from "./packageTabs";

type TabId = PackageTabId;

const OLD_TAB: Record<string, TabId> = {
  offers: "tender-results",
  files: "estimates",
  surveys: "survey",
};

const SERVICE_TABS: Record<ServiceId, TabId[]> = {
  indicative: ["estimates"],
  scope: ["survey"],
  tender: ["brief", "supplier-matching", "tender-results"],
  pricing: ["pricing", "contract"],
  delivery: ["delivery"],
};

function viewFor(w: Workstream, id: ServiceId) {
  const phase = w.phases.find((item) => item.service === id);
  if (!phase || phase.state === "planned") return null;
  return workstreamView(w, phase);
}

function looks(columns: StepColumn[]) {
  return columns.map((column, index) => {
    if (column.state === "now") return "now" as const;
    const earlierNow = columns
      .slice(0, index)
      .some((item) => item.state === "now");
    if (column.state === "passed" && !earlierNow) return "passed" as const;
    return "upcoming" as const;
  });
}

function latest(dates: string[]) {
  return dates.reduce((a, b) => (days(a) <= days(b) ? a : b));
}

function earliest(dates: string[]) {
  return dates.reduce((a, b) => (days(a) >= days(b) ? a : b));
}

function phaseDates(w: Workstream, index: number) {
  const id = DELIVERY_PHASES[index]?.id;
  if (!id) return [];
  return w.projects
    .filter((project) => project.step === index)
    .map((project) => project.delivery?.phases[id]?.on)
    .filter((date): date is string => Boolean(date));
}

function startedLine(w: Workstream, index: number) {
  if (w.service === "delivery") {
    const dates = phaseDates(w, index);
    return dates.length ? `started ${short(earliest(dates))}` : null;
  }
  const since =
    w.next && "since" in w.next && typeof w.next.since === "string"
      ? w.next.since
      : undefined;
  if (!since) return null;
  const asked = w.needs.some(
    (need) => need.owner === "you" && need.since === since,
  );
  return `${asked ? "asked" : "started"} ${short(since)}`;
}

function PhaseSteps({ w, columns }: { w: Workstream; columns: StepColumn[] }) {
  const states = looks(columns);
  const delivery = w.service === "delivery";
  return (
    <ChipTrack
      steps={columns.map((column, index) => {
        const look = states[index];
        const startWaiting = delivery && index === 0 && column.count > 0;
        const complete =
          delivery && index === columns.length - 1 && column.count > 0;
        const underway = look === "now" && column.count > 0 && !startWaiting;
        let lead: "done" | "now" | "next" =
          look === "passed" ? "done" : look === "now" ? "now" : "next";
        let label = column.label;
        let note: string | null = null;
        if (startWaiting) {
          lead = "next";
          label = column.label;
          note = `${column.count} awaiting start`;
        } else if (complete) {
          lead = "done";
          label = `${column.label} · ${column.count}`;
          const dates = phaseDates(w, index);
          if (dates.length) note = `last ${short(latest(dates))}`;
        } else if (underway) {
          lead = "now";
          label = `${column.label} · ${column.count}`;
          note = (startedLine(w, index) ?? column.happens) || null;
        }
        return {
          key: column.label,
          lead,
          label,
          notes: note
            ? [{ text: note, className: "p7 text-text-secondary" }]
            : [],
        };
      })}
    />
  );
}

export function packageCardChips(w: Workstream): PackageCardChip[] {
  return SERVICES.flatMap((entry) => {
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
}

function packagePanelAside(w: Workstream) {
  const assets = `${w.projects.length} assets`;
  return w.supplier ? `${w.supplier} · ${assets}` : assets;
}

export function PackageOverviewSteps({
  account,
  w,
  columns,
  chips,
}: {
  account: ReturnType<typeof useConcept>["account"];
  w: Workstream;
  columns: StepColumn[];
  chips?: PackageCardChip[];
}) {
  const title = `${service(w.service).label} for this package`;
  const chipList = chips ?? packageCardChips(w);
  return (
    <PackageCard
      chips={chipList}
      panelTitle={title}
      panelAside={packagePanelAside(w)}
      panelChildren={<PhaseSteps w={w} columns={columns} />}
    />
  );
}

function StepsCard({
  account,
  w,
}: {
  account: ReturnType<typeof useConcept>["account"];
  w: Workstream;
}) {
  if (isClosed(w)) return null;
  if (w.owner === "done") return null;
  const columns =
    w.service === "delivery"
      ? deliverySteps(account, w)
      : w.service === "indicative"
        ? indicativeSteps(account, w)
        : w.service === "scope"
          ? scopeSteps(account, w)
          : w.service === "tender"
            ? tenderSteps(w)
            : w.service === "pricing"
              ? pricingSteps(w)
              : [];
  return <PackageOverviewSteps account={account} w={w} columns={columns} />;
}

const LEFT_GROUP_ORDER: MoveKind[] = [
  "split",
  "moved",
  "continued",
  "tendered_again",
  "not_chosen",
  "dropped",
];

function leftGroupIndex(kind: MoveKind): number {
  const i = LEFT_GROUP_ORDER.indexOf(kind);
  return i === -1 ? 99 : i;
}

type OverviewRow = {
  project: ProjectRow;
  index: number;
  building: ReturnType<typeof getBuilding>;
};

function overviewAssetRank(p: ProjectRow): 0 | 1 | 2 | 3 {
  if (p.joined) return 0;
  if (p.left) return 3;
  if (p.hold) return 2;
  return 1;
}

function compareOverviewRows(
  account: ReturnType<typeof useConcept>["account"],
  a: OverviewRow,
  b: OverviewRow,
): number {
  const ra = overviewAssetRank(a.project);
  const rb = overviewAssetRank(b.project);
  if (ra !== rb) return ra - rb;
  if (ra === 0) {
    return (
      parse(b.project.joined!.on) - parse(a.project.joined!.on)
    );
  }
  if (ra === 3) {
    const ga = leftGroupIndex(a.project.left!.kind);
    const gb = leftGroupIndex(b.project.left!.kind);
    if (ga !== gb) return ga - gb;
    return a.building.name.localeCompare(b.building.name);
  }
  const aCh = buildingChanged(account, a.building.id);
  const bCh = buildingChanged(account, b.building.id);
  if (aCh !== bCh) return aCh ? -1 : 1;
  return a.index - b.index;
}

function InheritedEstimatesIntro({
  fromWs,
  assetCount,
}: {
  fromWs: Workstream;
  assetCount: number;
}) {
  if (!fromWs.closedOn) return null;
  return (
    <div className="mb-6 rounded-md border border-border-light bg-bg-container-grey px-4 py-2.5">
      <p className="p6 text-text-secondary">
        From{" "}
        <Link
          href={hrefs.workstream(fromWs.id)}
          className="text-text-primary underline decoration-border-dark underline-offset-[3px]"
        >
          {fromWs.name}
        </Link>{" "}
        · closed {short(fromWs.closedOn)} · showing this package&apos;s{" "}
        {assetCount} assets
      </p>
    </div>
  );
}

function OverviewAssets({
  account,
  w,
}: {
  account: ReturnType<typeof useConcept>["account"];
  w: Workstream;
}) {
  const { lang, t, words } = useConceptI18n();
  const [open, setOpen] = useState(false);
  const labels = service(w.service).steps;
  const baseRows = w.projects.map((project, index) => ({
    project,
    index,
    building: getBuilding(account, project.buildingId),
  }));
  const rows = [...baseRows].sort((a, b) =>
    compareOverviewRows(account, a, b),
  );
  const shown = open ? rows : rows.slice(0, 8);
  const liveN = activeProjects(w).length;
  const leftN = w.projects.filter((p) => p.left).length;
  const closed = isClosed(w);
  // IN PACKAGE shows on every package, so the table reads the same everywhere.
  const showInPackageColumn = true;
  const titleRight = closed
    ? t("{0} at the start", w.projects.length)
    : leftN > 0
      ? t("{0} · {1} left", liveN, leftN)
      : String(liveN);
  const gridCols = showInPackageColumn
    ? "grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1.15fr)_16px]"
    : "grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_16px]";
  return (
    <Card
      title={words.Assets}
      right={<span className="p7 text-text-secondary">{titleRight}</span>}
      bodyClassName="p-0"
    >
      <div className="overflow-x-auto">
        <div className="min-w-[640px]">
          <div
            className={cn(
              "grid items-center gap-x-6 border-b border-border-light py-2.5 pl-8 pr-6",
              gridCols,
            )}
          >
            <span className="s3 text-text-tertiary">{words.Asset}</span>
            <span className="s3 text-text-tertiary">{t("Step")}</span>
            {showInPackageColumn && (
              <span className="s3 text-text-tertiary">{t("In package")}</span>
            )}
            <span />
          </div>
          {shown.map(({ project, building }) => {
            const href = hrefs.building(building.id, {
              from: "workstream",
              ws: w.id,
            });
            const muted = Boolean(project.left);
            const lines = inPackageColumnLines(account, w, project);
            const stepLabel = labels[project.step] ?? "—";
            return (
              <Link
                key={building.id}
                href={href}
                className={cn(
                  "grid items-center gap-x-6 border-t border-border-light py-3.5 pl-8 pr-6",
                  tableRowLinkClass,
                  gridCols,
                  muted && "text-text-tertiary",
                )}
              >
                <span className="min-w-0">
                  <ChangedDot on={buildingChanged(account, building.id)}>
                    <span
                      className={cn(
                        "block h8",
                        tableRowNameCellClass,
                        muted ? "text-text-tertiary" : "text-text-title",
                      )}
                    >
                      {building.name}
                    </span>
                  </ChangedDot>
                  <span className="mt-0.5 block p7 text-text-tertiary">
                    {building.city}
                  </span>
                </span>
                <span
                  className={cn(
                    "p6",
                    muted ? "text-text-tertiary" : "text-text-primary",
                  )}
                >
                  {stepLabel}
                </span>
                {showInPackageColumn && (
                  <div className="min-w-0">
                    <span className="block p6 text-text-primary">
                      {lines.line1}
                    </span>
                    {lines.line2 && (
                      <span className="mt-0.5 block p7 text-text-tertiary">
                        {lines.line2}
                      </span>
                    )}
                  </div>
                )}
                <Icon
                  name="chevron-right"
                  size={16}
                  className="justify-self-end text-text-tertiary"
                />
              </Link>
            );
          })}
        </div>
      </div>
      <ListMore
        total={rows.length}
        limit={8}
        open={open}
        noun={words.assets}
        onOpen={() => setOpen(true)}
      />
    </Card>
  );
}

export function PackageView({ w }: { w: Workstream }) {
  const { account } = useConcept();
  const { lang, t, words } = useConceptI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabs = tabsFor(w, account);
  const requested = searchParams.get("tab");
  const mapped = requested ? (OLD_TAB[requested] ?? requested) : null;
  const serviceId = searchParams.get("service");
  let tab: TabId = "overview";
  if (mapped && tabs.some((item) => item.id === mapped)) tab = mapped as TabId;
  else if (serviceId && serviceId in SERVICE_TABS) {
    const first = SERVICE_TABS[serviceId as ServiceId].find((id) =>
      tabs.some((item) => item.id === id),
    );
    if (first) tab = first;
  }
  const setTab = (next: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("service");
    if (next === "overview") params.delete("tab");
    else params.set("tab", next);
    const qs = params.toString();
    router.replace(`${hrefs.workstream(w.id)}${qs ? `?${qs}` : ""}`, {
      scroll: false,
    });
  };
  const activeTab = tabs.find((item) => item.id === tab);
  const inheritedEstimates =
    tab === "estimates" && Boolean(activeTab?.from);
  const fromWsForIntro =
    w.from && inheritedEstimates
      ? getWorkstream(account, w.from.workstreamId)
      : null;
  const estimates = viewFor(w, "indicative");
  const estimatesAssetCount =
    estimates?.projects.filter((p) => p.estimate).length ?? 0;
  const tender = viewFor(w, "tender");
  const delivery = viewFor(w, "delivery") ?? w;

  return (
    <Page>
      <WorkstreamFrame live={w}>
        <Tabs.Root value={tab} onValueChange={setTab}>
          <Tabs.List className={tabListClass} aria-label={words.Package}>
            {tabs.map((item) => (
              <Tabs.Trigger
                key={item.id}
                value={item.id}
                className={tabTriggerClass}
              >
                <span className="inline-flex items-center gap-2">
                  {t(item.label)}
                  {item.from && (
                    <Tag type="neutral" size="xsmall" dot={false}>
                      {t("from")}
                    </Tag>
                  )}
                </span>
                {item.dot && (
                  <TabDot
                    label={
                      item.id === packagePrimaryTab(w)
                        ? t("Current service")
                        : t("New")
                    }
                  />
                )}
              </Tabs.Trigger>
            ))}
          </Tabs.List>
        </Tabs.Root>
        {tab === "overview" && (
          <>
            <StepsCard account={account} w={w} />
            <OverviewAssets account={account} w={w} />
            <WorkstreamFacts
              activity={w.activity ?? []}
              documents={w.documents}
            />
          </>
        )}
        {tab === "estimates" && estimates && (
          <>
            {fromWsForIntro && (
              <InheritedEstimatesIntro
                fromWs={fromWsForIntro}
                assetCount={estimatesAssetCount}
              />
            )}
            <EstimatesPanel w={estimates} readOnly={inheritedEstimates} />
          </>
        )}
        {tab === "survey" && (
          <SurveysTab
            packageId={w.id}
            readOnly={phaseIsInheritedFrom(w, account, "scope")}
          />
        )}
        {tab === "brief" && tender && (
          <TenderPanel w={tender} tab="brief" />
        )}
        {tab === "supplier-matching" && tender && (
          <TenderPanel w={tender} tab="supplier-matching" />
        )}
        {tab === "tender-results" && tender && (
          <TenderPanel w={tender} tab="tender-results" />
        )}
        {tab === "pricing" && <PricingPanel />}
        {tab === "contract" && <ContractPanel />}
        {tab === "delivery" && <DeliveryPanel w={delivery} />}
      </WorkstreamFrame>
    </Page>
  );
}
