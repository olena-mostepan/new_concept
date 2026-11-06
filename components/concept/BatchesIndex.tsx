"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  SERVICES,
  SOLUTIONS,
  service as serviceDef,
  type Batch,
  type ServiceId,
  type SolutionId,
} from "@/lib/concept/model";
import {
  activeProjects,
  customerBatches,
  isLive,
  wsIn,
} from "@/lib/concept/derive";
import { useConcept } from "./store";
import { cn } from "@/lib/utils";
import {
  Icon,
  ClearFilters,
  FilterBar,
  FilterField,
  FilterSearch,
  FilterSelect,
  PageHeader,
  YourActionOnly,
  tableRowLinkClass,
  tableRowNameCellClass,
} from "./ui";
import { hrefs } from "./hrefs";
import { nAssets, WORDS } from "@/lib/concept/words";

const SHADES = [0.16, 0.3, 0.44, 0.58, 0.74, 1];
function batchColumns(showTarget: boolean) {
  return showTarget
    ? "minmax(0,1.6fr) 80px 80px minmax(0,1.5fr) 120px 90px 16px"
    : "minmax(0,1.6fr) 80px 80px minmax(0,1.5fr) 120px 16px";
}

const fill = (shade: number) =>
  `color-mix(in srgb, var(--black-7) ${Math.round(SHADES[shade] * 100)}%, white)`;

function solutionLabel(id: SolutionId) {
  return id === "led" ? "LED" : SOLUTIONS[id];
}

function liveKeys(
  account: Parameters<typeof wsIn>[0],
  batch: Batch,
  service?: ServiceId,
) {
  const keys = new Set<string>();
  for (const w of wsIn(account, batch.id)) {
    if (!isLive(w) || (service && w.service !== service)) continue;
    for (const project of activeProjects(w))
      keys.add(`${project.buildingId}:${w.solution}`);
  }
  return keys;
}

function completedKeys(account: Parameters<typeof wsIn>[0], batch: Batch) {
  const keys = new Set<string>();
  for (const w of wsIn(account, batch.id)) {
    if (w.proposed || w.service !== "delivery" || w.owner !== "done") continue;
    for (const project of activeProjects(w))
      keys.add(`${project.buildingId}:${w.solution}`);
  }
  return keys;
}

function yourAction(account: Parameters<typeof wsIn>[0], batch: Batch) {
  return wsIn(account, batch.id).filter((w) => isLive(w) && w.owner === "you")
    .length;
}

export function BatchesIndex() {
  const router = useRouter();
  const params = useSearchParams();
  const { account } = useConcept();
  const q = params.get("q") ?? "";
  const service = (params.get("service") as ServiceId | null) || "";
  const solution = (params.get("solution") as SolutionId | null) || "";
  const youOnly = params.get("you") === "1";

  const batches = customerBatches(account);
  const buildings = batches.reduce((n, b) => n + b.buildingIds.length, 0);
  const projects = batches.reduce((n, b) => n + liveKeys(account, b).size, 0);

  const write = (patch: {
    q?: string;
    service?: string;
    solution?: string;
    you?: string;
  }) => {
    const next = { q, service, solution, you: youOnly ? "1" : "", ...patch };
    const rest = new URLSearchParams();
    for (const [key, value] of Object.entries(next))
      if (value) rest.set(key, value);
    const qs = rest.toString();
    router.replace(qs ? `${hrefs.batches}?${qs}` : hrefs.batches);
  };

  const shown = batches
    .filter((b) => {
      if (q) {
        const hay = `${b.name} ${b.goal}`.toLowerCase();
        if (!hay.includes(q.trim().toLowerCase())) return false;
      }
      if (service && liveKeys(account, b, service).size === 0) return false;
      if (solution && !wsIn(account, b.id).some((w) => w.solution === solution))
        return false;
      if (youOnly && yourAction(account, b) === 0) return false;
      return true;
    })
    .sort(
      (a, b) =>
        yourAction(account, b) - yourAction(account, a) ||
        a.name.localeCompare(b.name),
    );

  const solutions = (Object.keys(SOLUTIONS) as SolutionId[]).filter(
    (id) =>
      id !== "generic" &&
      batches.some((b) => wsIn(account, b.id).some((w) => w.solution === id)),
  );
  const filtering = Boolean(q || service || solution || youOnly);
  const showTarget = shown.some((batch) => Boolean(batch.target));
  const columns = batchColumns(showTarget);

  return (
    <div>
      <PageHeader
        title="Batches"
        actions={
          <p className="p7 text-text-secondary">
            {batches.length} batches · {nAssets(buildings)} · {projects}{" "}
            projects in progress
          </p>
        }
      />
      <FilterBar selects={2}>
        <FilterField label="Search">
          <FilterSearch
            value={q}
            placeholder="Batch name"
            onChange={(value) => write({ q: value })}
          />
        </FilterField>
        <FilterField label="Service">
          <FilterSelect
            label="Service"
            value={service}
            onChange={(value) => write({ service: value })}
          >
            <option value="">All services</option>
            {SERVICES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </FilterSelect>
        </FilterField>
        <FilterField label="Solution">
          <FilterSelect
            label="Solution"
            value={solution}
            onChange={(value) => write({ solution: value })}
          >
            <option value="">All solutions</option>
            {solutions.map((id) => (
              <option key={id} value={id}>
                {solutionLabel(id)}
              </option>
            ))}
          </FilterSelect>
        </FilterField>
        <YourActionOnly
          checked={youOnly}
          onChange={(checked) => write({ you: checked ? "1" : "" })}
        />
        {filtering && (
          <ClearFilters
            onClick={() => write({ q: "", service: "", solution: "", you: "" })}
          />
        )}
      </FilterBar>

      <section className="overflow-visible rounded-lg border border-border-dark bg-white">
        <div
          className="grid items-center gap-x-6 border-b border-border-light px-6 py-2 s3 text-text-tertiary"
          style={{ gridTemplateColumns: columns }}
        >
          <span>Batch</span>
          <span>{WORDS.Assets}</span>
          <span>Projects</span>
          <span>Where projects are</span>
          <span />
          {showTarget && <span>Target</span>}
          <span />
        </div>
        {shown.length === 0 ? (
          <p className="px-6 py-8 p6 text-text-secondary">
            No batches match.{" "}
            <button
              type="button"
              className="btn-link"
              onClick={() =>
                write({ q: "", service: "", solution: "", you: "" })
              }
            >
              Clear filters
            </button>
          </p>
        ) : (
          shown.map((b) => (
            <BatchRow key={b.id} batch={b} showTarget={showTarget} />
          ))
        )}
      </section>
    </div>
  );
}

function BatchRow({
  batch,
  showTarget,
}: {
  batch: Batch;
  showTarget: boolean;
}) {
  const { account } = useConcept();
  const [open, setOpen] = useState(false);
  const segments = [
    ...SERVICES.map((s, i) => ({
      id: s.id,
      label: serviceDef(s.id).label,
      projects: liveKeys(account, batch, s.id).size,
      shade: i,
    })),
    {
      id: "completed",
      label: "Completed",
      projects: completedKeys(account, batch).size,
      shade: 5,
    },
  ];
  const bar = segments.filter((segment) => segment.projects > 0);
  const yours = yourAction(account, batch);
  const projects = liveKeys(account, batch).size;
  return (
    <Link
      href={hrefs.batch(batch.id)}
      className={cn(
        "grid items-center gap-x-6 border-t border-border-light px-6 py-3.5",
        tableRowLinkClass,
      )}
      style={{ gridTemplateColumns: batchColumns(showTarget) }}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      <span className="min-w-0">
        <span
          className={cn("block h8 text-text-title", tableRowNameCellClass)}
        >
          {batch.name}
        </span>
        <span className="block truncate p7 text-text-tertiary">
          {batch.goal}
        </span>
      </span>
      <span className="p6 tabular-nums text-text-primary">
        {batch.buildingIds.length}
      </span>
      <span className="p6 tabular-nums text-text-primary">{projects}</span>
      <span
        className="relative min-w-0"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <span className="flex h-2 gap-0.5">
          {bar.map((segment, index) => (
            <span
              key={segment.id}
              className={`h-2 ${index === 0 ? "rounded-l-full" : ""} ${index === bar.length - 1 ? "rounded-r-full" : ""}`}
              style={{
                flex: segment.projects,
                backgroundColor: fill(segment.shade),
              }}
            />
          ))}
        </span>
        {open && (
          <span className="absolute left-0 top-full z-20 block w-[240px] pt-2">
            <span className="block rounded-md border border-border-dark bg-white px-4 py-3 shadow-floating">
              <span className="block h8 text-text-primary">{batch.name}</span>
              <span className="mt-2 block">
                {segments.map((segment) => (
                  <span
                    key={segment.id}
                    className="flex items-center gap-2 py-0.5"
                  >
                    <span
                      className="h-2 w-2 shrink-0 rounded-[2px]"
                      style={{ backgroundColor: fill(segment.shade) }}
                      aria-hidden
                    />
                    <span className="min-w-0 flex-1 p7 text-text-secondary">
                      {segment.label}
                    </span>
                    <span className="p7 tabular-nums text-text-primary">
                      {segment.projects}
                    </span>
                  </span>
                ))}
              </span>
            </span>
          </span>
        )}
      </span>
      <span
        className={yours > 0 ? "h8 text-text-primary" : "p6 text-text-tertiary"}
      >
        {yours > 0 ? yours : "—"}
      </span>
      {showTarget && (
        <span className="p6 text-text-secondary">{batch.target ?? ""}</span>
      )}
      <Icon name="chevron-right" size={16} className="text-text-tertiary" />
    </Link>
  );
}
