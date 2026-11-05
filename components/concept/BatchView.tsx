"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  activeProjects,
  batchActivity,
  buildingChanged,
  getBuilding,
  isCompleted,
  noun,
  phasesIn,
  placeNoun,
  projectsAtBuilding,
  routeStages,
  solutionName,
  wsIn,
} from "@/lib/concept/derive";
import { WORDS } from "@/lib/concept/words";
import {
  pricingNotNeeded,
  SERVICES,
  SERVICE_LABEL,
  SOLUTIONS,
  type Account,
  type Batch,
  type Workstream,
} from "@/lib/concept/model";
import { Icon, Card, CardLink, ChangedDot, DocumentList, ListMore, focusRing } from "./ui";
import { RouteWithNeeds } from "./RouteWithNeeds";
import { hrefs } from "./hrefs";
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

function PilotDashboard({
  account,
  batch,
}: {
  account: Account;
  batch: Batch;
}) {
  const { agreePlan } = useConcept();
  const all = wsIn(account, batch.id);
  const activity = batchActivity(account, batch);
  const docs = account.documents.filter((d) => d.batchId === batch.id);
  const projects = all.reduce(
    (n, w) => n + w.projects.filter((p) => !p.dropped).length,
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
        right={aside(all.map((w) => SOLUTIONS[w.solution]).join(" · "))}
      >
        <p className="mb-5 p6 text-text-secondary">Goal: {batch.goal}</p>
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
          title="What we have"
          right={aside(`${batch.filesCount ?? 0} files`)}
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
          title="What we still need"
          right={aside("After you agree the plan")}
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
        title="Solutions"
        right={aside(
          `${projects} projects · ${batch.buildingIds.length} ${placeNoun(batch).many}`,
        )}
      >
        <ul>
          {all.map((w, index) => {
            const sites = w.projects
              .filter((p) => !p.dropped)
              .map((p) => getBuilding(account, p.buildingId));
            const place = placeNoun(batch);
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
                      {solutionName(w.solution)}
                    </p>
                    <p className="p7 text-text-secondary">
                      {noun(sites.length, place.one, place.many)}
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
                    <p className="p7 text-text-tertiary">Result</p>
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
          title="Recent activity"
          right={<CardLink href={hrefs.batches}>See all</CardLink>}
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
          title="Documents"
          right={<CardLink href={hrefs.batches}>See all</CardLink>}
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
          (project) => !project.dropped,
        ).length,
      0,
    );
}

function BatchPage({
  account,
  batch,
}: {
  account: Account;
  batch: Batch;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [showActivity, setShowActivity] = useState(false);
  const activity = batchActivity(account, batch);
  const serviceId = params.get("service") ?? "";
  const cards = [
    {
      id: "",
      label: "All",
      count: SERVICES.reduce(
        (n, item) => n + nowProjects(account, batch, item.id),
        0,
      ),
      done: 0,
    },
    ...SERVICES.map((item) => ({
      id: item.id,
      label: item.label,
      count: nowProjects(account, batch, item.id),
      done: passedProjects(account, batch, item.id),
    })).filter((card) => card.count > 0),
  ];
  const selected = cards.some((card) => card.id === serviceId) ? serviceId : "";
  const select = (id: string) => {
    const next = new URLSearchParams(params.toString());
    if (id) next.set("service", id);
    else next.delete("service");
    const qs = next.toString();
    router.replace(qs ? `${hrefs.batch(batch.id)}?${qs}` : hrefs.batch(batch.id), {
      scroll: false,
    });
  };
  const rows = batch.buildingIds.flatMap((id) => {
    const building = account.buildings.find((item) => item.id === id);
    if (!building) return [];
    const items = projectsAtBuilding(account, id).filter(
      (item) =>
        item.workstream.batchId === batch.id &&
        !item.workstream.proposed &&
        (!selected || item.workstream.service === selected),
    );
    return items.length ? [{ building, items }] : [];
  });
  rows.sort((a, b) => {
    const aChanged = buildingChanged(account, a.building.id);
    const bChanged = buildingChanged(account, b.building.id);
    if (aChanged !== bChanged) return aChanged ? -1 : 1;
    return a.building.name.localeCompare(b.building.name);
  });
  const signature = `${selected}:${rows.map((row) => row.building.id).join("|")}`;
  const [list, setList] = useState({ signature, open: false });
  if (list.signature !== signature) setList({ signature, open: false });
  const shown = list.open ? rows : rows.slice(0, 8);

  return (
    <div className="space-y-4">
      <div
        className="grid gap-2"
        style={{
          gridTemplateColumns: `repeat(${cards.length}, minmax(0, 1fr))`,
        }}
      >
        {cards.map((card) => {
          const on = card.id === selected;
          return (
            <button
              key={card.id || "all"}
              type="button"
              onClick={() => select(card.id)}
              className={cn(
                "relative overflow-hidden rounded-md border border-border-dark bg-bg-container px-4 py-3 text-left",
                focusRing,
                !on && "cursor-pointer hover:bg-bg-container-grey",
              )}
            >
              {on && (
                <span
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-1 bg-brand-6"
                />
              )}
              <p className="h8 text-text-primary">{card.label}</p>
              <p className="h4 tabular-nums text-text-primary">{card.count}</p>
              {card.done > 0 && (
                <p className="p7 text-text-tertiary">+{card.done} done</p>
              )}
            </button>
          );
        })}
      </div>

      <Card
        title={WORDS.Assets}
        right={
          <span className="p7 text-text-secondary">{rows.length}</span>
        }
        bodyClassName="p-0"
      >
        <div className="overflow-x-auto">
          <div className="min-w-[720px]">
            <div className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,1.2fr)_minmax(0,0.8fr)_16px] items-center gap-x-6 border-b border-border-light py-2.5 pl-8 pr-6">
              <span className="s3 text-text-tertiary">{WORDS.Asset}</span>
              <span className="s3 text-text-tertiary">{WORDS.Package}</span>
              <span className="s3 text-text-tertiary">Service</span>
              <span />
            </div>
            {shown.map(({ building, items }) => (
              <Link
                key={building.id}
                href={hrefs.building(building.id, {
                  from: "batch",
                  batch: batch.id,
                })}
                className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,1.2fr)_minmax(0,0.8fr)_16px] items-center gap-x-6 border-t border-border-light py-3.5 pl-8 pr-6 hover:bg-black-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black-7"
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
                <span className="min-w-0">
                  {items.map((item) => (
                    <span
                      key={item.workstream.id}
                      className="block p6 text-text-secondary"
                    >
                      {item.workstream.name}
                    </span>
                  ))}
                </span>
                <span className="min-w-0">
                  {items.map((item) => (
                    <span
                      key={item.workstream.id}
                      className="block p6 text-text-primary"
                    >
                      {SERVICES.find((entry) => entry.id === item.workstream.service)
                        ?.label ?? "—"}
                    </span>
                  ))}
                </span>
                <Icon
                  name="chevron-right"
                  size={16}
                  className="text-text-tertiary"
                />
              </Link>
            ))}
          </div>
        </div>
        <ListMore
          total={rows.length}
          limit={8}
          open={list.open}
          noun={WORDS.assets}
          onOpen={() => setList({ signature, open: true })}
        />
      </Card>

      <Card
        title="Recent activity"
        right={
          !showActivity && (
            <button
              type="button"
              className="p6 text-text-primary underline underline-offset-4 hover:text-text-primary"
              onClick={() => setShowActivity(true)}
            >
              See all
            </button>
          )
        }
      >
        <ActivityList items={showActivity ? activity : activity.slice(0, 5)} />
      </Card>
    </div>
  );
}

export function BatchView({
  account,
  batch,
  variant,
}: {
  account: Account;
  batch: Batch;
  variant: "dashboard" | "page";
}) {
  if (variant === "dashboard")
    return <PilotDashboard account={account} batch={batch} />;
  return <BatchPage account={account} batch={batch} />;
}
