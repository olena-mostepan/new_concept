"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import * as Tabs from "@radix-ui/react-tabs";
import {
  service,
  SERVICES,
  type ServiceId,
  type Workstream,
} from "@/lib/concept/model";
import { DELIVERY_PHASES } from "@/lib/concept/delivery";
import {
  buildingChanged,
  days,
  deliverySteps,
  getBuilding,
  indicativeSteps,
  pricingSteps,
  scopeSteps,
  short,
  tenderSteps,
  workstreamView,
  type StepColumn,
} from "@/lib/concept/derive";
import { WORDS } from "@/lib/concept/words";
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
  tabListClass,
  tabTriggerClass,
} from "./ui";
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
  const since = w.next?.since;
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
          note = startedLine(w, index);
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

function packageCardChips(w: Workstream): PackageCardChip[] {
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

function StepsCard({
  account,
  w,
}: {
  account: ReturnType<typeof useConcept>["account"];
  w: Workstream;
}) {
  if (w.owner === "done") return null;
  const title = `${service(w.service).label} for this package`;
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
  return (
    <PackageCard
      chips={packageCardChips(w)}
      panelTitle={title}
      panelAside={packagePanelAside(w)}
      panelChildren={<PhaseSteps w={w} columns={columns} />}
    />
  );
}

function OverviewAssets({
  account,
  w,
}: {
  account: ReturnType<typeof useConcept>["account"];
  w: Workstream;
}) {
  const [open, setOpen] = useState(false);
  const labels = service(w.service).steps;
  const rows = w.projects
    .map((project, index) => ({
      project,
      index,
      building: getBuilding(account, project.buildingId),
    }))
    .sort((a, b) => {
      const aChanged = buildingChanged(account, a.building.id);
      const bChanged = buildingChanged(account, b.building.id);
      if (aChanged !== bChanged) return aChanged ? -1 : 1;
      return a.index - b.index;
    });
  const shown = open ? rows : rows.slice(0, 8);
  return (
    <Card
      title={WORDS.Assets}
      right={<span className="p7 text-text-secondary">{rows.length}</span>}
      bodyClassName="p-0"
    >
      <div className="overflow-x-auto">
        <div className="min-w-[640px]">
          <div className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_16px] items-center gap-x-6 border-b border-border-light py-2.5 pl-8 pr-6">
            <span className="s3 text-text-tertiary">{WORDS.Asset}</span>
            <span className="s3 text-text-tertiary">Step</span>
            <span />
          </div>
          {shown.map(({ project, building }) => {
            const href = hrefs.building(building.id, {
              from: "workstream",
              ws: w.id,
            });
            return (
              <Link
                key={building.id}
                href={href}
                className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_16px] items-center gap-x-6 border-t border-border-light py-3.5 pl-8 pr-6 hover:bg-black-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black-7"
              >
                <span className="min-w-0">
                  <ChangedDot on={buildingChanged(account, building.id)}>
                    <span className="block h8 text-text-title">
                      {building.name}
                    </span>
                  </ChangedDot>
                  <span className="mt-0.5 block p7 text-text-tertiary">
                    {building.city}
                  </span>
                </span>
                <span className="p6 text-text-primary">
                  {labels[project.step] ?? "—"}
                </span>
                <Icon
                  name="chevron-right"
                  size={16}
                  className="text-text-tertiary"
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
        noun={WORDS.assets}
        onOpen={() => setOpen(true)}
      />
    </Card>
  );
}

export function PackageView({ w }: { w: Workstream }) {
  const { account } = useConcept();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabs = tabsFor(w);
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
  const estimates = viewFor(w, "indicative");
  const tender = viewFor(w, "tender");
  const delivery = viewFor(w, "delivery") ?? w;

  return (
    <Page>
      <WorkstreamFrame live={w}>
        <Tabs.Root value={tab} onValueChange={setTab}>
          <Tabs.List className={tabListClass} aria-label={WORDS.Package}>
            {tabs.map((item) => (
              <Tabs.Trigger
                key={item.id}
                value={item.id}
                className={tabTriggerClass}
              >
                {item.label}
                {item.dot && (
                  <TabDot
                    label={
                      item.id === packagePrimaryTab(w)
                        ? "Current service"
                        : "New"
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
        {tab === "estimates" && estimates && <EstimatesPanel w={estimates} />}
        {tab === "survey" && <SurveysTab packageId={w.id} />}
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
