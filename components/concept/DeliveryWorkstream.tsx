"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import * as Tabs from "@radix-ui/react-tabs";
import {
  SOLUTIONS,
  service as serviceDef,
  type Building,
  type ProjectRow,
  type ServiceId,
  type Workstream,
} from "@/lib/concept/model";
import {
  getBatch,
  historyEventYear,
  parse,
  projectHistory,
  short,
} from "@/lib/concept/derive";
import {
  keepShownDate,
  splitDeliveryId,
  toCustomerProject,
  toDeliveryPayload,
} from "@/lib/concept/delivery";
import { CustomerDeliveryView } from "@/components/customer/delivery/CustomerDeliveryView";
import { CustomerProjectDeliveryView } from "@/components/customer/delivery/CustomerProjectDeliveryView";
import { cn } from "@/lib/utils";
import {
  Button,
  Card,
  Page,
  PageHeader,
  ResponsibilityPill,
  tabListClass,
  tabTriggerClass,
  Timeline,
} from "./ui";
import { DetailsGrid } from "./DetailsGrid";
import { ProjectRoute } from "./ProjectRoute";
import { hrefs, type BuildingVia } from "./hrefs";
import { WORDS } from "@/lib/concept/words";
import { useConcept } from "./store";
import { shortFact } from "./WorkstreamChrome";

function buildingHref(
  workstreamId: string,
  projectId: string,
  from: string | null,
) {
  const parts = splitDeliveryId(projectId);
  if (!parts) return hrefs.workstream(workstreamId);
  const via: BuildingVia | undefined =
    from === "service" ? "service" : from === "batch" ? "batch" : undefined;
  return hrefs.building(parts.buildingId, {
    project: parts.workstreamId,
    from: "workstream",
    ws: parts.workstreamId,
    via,
  });
}

function solutionLabel(id: Workstream["solution"]) {
  return id === "ev" ? "EV charging" : SOLUTIONS[id];
}

function Soon({ label }: { label: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border-dark bg-white px-5 py-10 text-center ">
      <p className="p6 text-text-primary">{label} — coming soon</p>
      <p className="mt-1 p6 text-text-secondary">
        Placeholder for the customer {label.toLowerCase()} view.
      </p>
    </div>
  );
}

export function DeliveryPanel({ w }: { w: Workstream }) {
  const { account, saveDelivery } = useConcept();
  const searchParams = useSearchParams();
  const payload = toDeliveryPayload(account, [w]);
  return (
    <CustomerDeliveryView
      payload={payload}
      onPayloadChange={saveDelivery}
      embedded
      showBanner={false}
      rowLinks
      previewLimit={10}
      projectHref={(project) =>
        buildingHref(w.id, project.id, searchParams.get("from"))
      }
    />
  );
}

function routeFor(w: Workstream, row: ProjectRow) {
  const now = {
    state: "now" as const,
    title: `Now · ${serviceDef("delivery").steps[row.step]}`,
    detail: `In ${w.name}`,
  };
  if (w.id === "ev-voltreny") {
    return {
      indicative: {
        state: "done" as const,
        title: "Done 30 May",
        detail: "€23–28k",
      },
      scope: {
        state: "skip" as const,
        title: "Not required",
        detail: "Car park plans were enough",
      },
      tender: {
        state: "done" as const,
        title: "Done 5 Aug",
        detail: "Voltreny chosen",
      },
      pricing: {
        state: "skip" as const,
        title: "Not required",
        detail: "The supplier comes from the tender",
      },
      delivery: now,
    };
  }
  if (w.id === "ev-be") {
    return {
      indicative: {
        state: "skip" as const,
        title: "Not required",
        detail: "Same Voltreny contract as Flagship",
      },
      scope: {
        state: "skip" as const,
        title: "Not required",
        detail: "Same Voltreny contract as Flagship",
      },
      tender: {
        state: "skip" as const,
        title: "Not required",
        detail: "Same Voltreny contract as Flagship",
      },
      pricing: { state: "skip" as const, title: "Not required" },
      delivery: now,
    };
  }
  return { delivery: now } satisfies Partial<
    Record<
      ServiceId,
      {
        state: "done" | "now" | "planned" | "skip";
        title: string;
        detail?: string;
      }
    >
  >;
}

export function DeliveryProject({
  w,
  building,
  row,
}: {
  w: Workstream;
  building: Building;
  row: ProjectRow;
}) {
  const { account, saveDelivery } = useConcept();
  const router = useRouter();
  const searchParams = useSearchParams();
  const batch = getBatch(account, w.batchId)!;
  const project = toCustomerProject(account, w, row);
  const historyRaw = projectHistory(account, w, row);
  const historySorted = [...historyRaw].sort(
    (a, b) => parse(b.date) - parse(a.date),
  );
  const tab = searchParams.get("tab") === "contract" ? "contract" : "overview";
  const setTab = (next: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "overview") params.delete("tab");
    else params.set("tab", next);
    const qs = params.toString();
    router.replace(`${hrefs.project(w.id, building.id)}${qs ? `?${qs}` : ""}`, {
      scroll: false,
    });
  };

  return (
    <Page>
      <PageHeader
        crumbs={[
          { label: "Delivery", href: hrefs.service("delivery") },
          { label: w.name, href: hrefs.workstream(w.id) },
          { label: building.name },
        ]}
        title={
          <>
            {building.name} · {solutionLabel(w.solution)}{" "}
            <span className=" text-text-secondary">{building.city}</span>
          </>
        }
        actions={
          <>
            <ResponsibilityPill owner={w.owner} />
            <Button
              href={hrefs.batch(batch.id)}
              type="secondary"
              size="small"
              icon="chevron-right"
              iconPosition="right"
            >
              View batch
            </Button>
          </>
        }
      />
      <div className="space-y-6 pb-12">
        <Card title="Details">
          <DetailsGrid
            items={[
              {
                label: "Batch",
                value: (
                  <Link
                    href={hrefs.batch(batch.id)}
                    className="hover:text-text-primary"
                  >
                    {batch.name}
                  </Link>
                ),
              },
              {
                label: WORDS.Package,
                value: (
                  <Link
                    href={hrefs.workstream(w.id)}
                    className="hover:text-text-primary"
                  >
                    {w.name}
                  </Link>
                ),
              },
              { label: "Solution", value: solutionLabel(w.solution) },
              { label: "Supplier", value: w.supplier ?? "—" },
            ]}
          />
        </Card>
        <Card title="Route" right="Services for this project">
          <ProjectRoute
            batch={batch}
            serviceId="delivery"
            workstreamName={w.name}
            captions={routeFor(w, row)}
          />
        </Card>
        <Tabs.Root value={tab} onValueChange={setTab}>
          <Tabs.List className={tabListClass} aria-label="Project">
            <Tabs.Trigger value="overview" className={tabTriggerClass}>
              Overview
            </Tabs.Trigger>
            <Tabs.Trigger value="contract" className={tabTriggerClass}>
              Contract
            </Tabs.Trigger>
          </Tabs.List>
        </Tabs.Root>
        {tab === "contract" ? (
          <Soon label="Contract" />
        ) : (
          <>
            <CustomerProjectDeliveryView
              project={project}
              onProjectChange={(next) =>
                saveDelivery(keepShownDate(project, next))
              }
            />
            {historySorted.length > 0 && (
              <Card title="History">
                <Timeline
                  items={historySorted.map((item) => ({
                    event: shortFact(item.event),
                    detail: item.detail,
                    date: short(item.date),
                    year: historyEventYear(item.date),
                    you: item.you,
                  }))}
                />
              </Card>
            )}
          </>
        )}
      </div>
    </Page>
  );
}
