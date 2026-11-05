"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { service, SERVICES } from "@/lib/concept/model";
import {
  buildingChanged,
  buildingList,
  currentPhase,
  customerBatches,
  foldText,
  isCompleted,
  short,
  solutionName,
  type BuildingListRow,
  type BuildingProject,
} from "@/lib/concept/derive";
import { Icon, ChangedDot, ChangedKey, ClearFilters, FilterBar, FilterChips, FilterField, FilterSearch, FilterSelect, ListMore, PageHeader } from "./ui";
import { hrefs, type BuildingFrom } from "./hrefs";
import { WORDS } from "@/lib/concept/words";
import { useConcept } from "./store";

const PREVIEW = 10;
const withBatch = {
  gridTemplateColumns:
    "minmax(0,1.3fr) minmax(0,1fr) minmax(0,1fr) minmax(0,1fr) 16px",
};
const withoutBatch = {
  gridTemplateColumns: "minmax(0,1.4fr) minmax(0,1fr) minmax(0,1fr) 16px",
};

export function Buildings() {
  const { account } = useConcept();
  const router = useRouter();
  const params = useSearchParams();
  const q = params.get("q") ?? "";
  const batchId = params.get("batch") ?? "";
  const serviceId = params.get("service") ?? "";
  const solution = params.get("solution") ?? "";

  const write = (next: Record<string, string>) => {
    const sp = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(next)) {
      if (value) sp.set(key, value);
      else sp.delete(key);
    }
    const query = sp.toString();
    router.replace(query ? `${hrefs.buildings}?${query}` : hrefs.buildings);
  };

  const batches = customerBatches(account);
  const needle = foldText(q.trim());
  const matchesRest = (row: BuildingListRow) => {
    if (batchId && row.batch.id !== batchId) return false;
    if (
      serviceId &&
      !row.projects.some((item) => item.workstream.service === serviceId)
    )
      return false;
    if (!needle) return true;
    return foldText(
      `${row.building.name} ${row.building.address ?? ""} ${row.building.city}`,
    ).includes(needle);
  };
  const base = buildingList(account).filter(matchesRest);
  const counts = new Map<string, number>();
  for (const row of buildingList(account)) {
    for (const id of new Set(
      row.projects.map((item) => item.workstream.solution),
    )) {
      if (!counts.has(id)) counts.set(id, 0);
    }
  }
  if (solution && !counts.has(solution)) counts.set(solution, 0);
  for (const row of base) {
    for (const id of new Set(
      row.projects.map((item) => item.workstream.solution),
    )) {
      counts.set(id, (counts.get(id) ?? 0) + 1);
    }
  }
  const chips = [...counts.entries()]
    .filter(([id, count]) => count > 0 || id === solution)
    .map(([id, count]) => ({ id, label: solutionName(id), count }))
    .sort(
      (a, b) =>
        b.count - a.count ||
        a.label.localeCompare(b.label, "en", { sensitivity: "base" }),
    );
  const rows = solution
    ? base.filter((row) =>
        row.projects.some((item) => item.workstream.solution === solution),
      )
    : base;
  const filtering = Boolean(q || batchId || serviceId || solution);

  return (
    <>
      <PageHeader
        title={WORDS.Assets}
        actions={<ChangedKey className="p7 text-text-secondary" />}
      />
      <FilterChips
        options={[{ id: "", label: "All", count: base.length }, ...chips]}
        value={solution}
        onChange={(id) => write({ solution: id })}
      />
      <FilterBar selects={2} className="mt-3">
        <FilterField label="Search">
          <FilterSearch
            value={q}
            onChange={(value) => write({ q: value })}
            placeholder="Address or city"
          />
        </FilterField>
        <FilterField label="Batch">
          <FilterSelect
            value={batchId}
            onChange={(value) => write({ batch: value })}
          >
            <option value="">All batches</option>
            {batches.map((batch) => (
              <option key={batch.id} value={batch.id}>
                {batch.name}
              </option>
            ))}
          </FilterSelect>
        </FilterField>
        <FilterField label="Service">
          <FilterSelect
            value={serviceId}
            onChange={(value) => write({ service: value })}
          >
            <option value="">All services</option>
            {SERVICES.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </FilterSelect>
        </FilterField>
        {filtering && (
          <ClearFilters
            onClick={() =>
              write({ q: "", batch: "", service: "", solution: "" })
            }
          />
        )}
      </FilterBar>
      <section className="overflow-hidden rounded-lg border border-border-dark bg-white">
        <header className="flex items-center justify-between gap-3 border-b border-border-light px-4 py-3">
          <h2 className="h7 text-text-primary">All {WORDS.assets}</h2>
        </header>
        <BuildingRows rows={rows} />
      </section>
    </>
  );
}

export function BuildingRows({
  rows,
  showBatch = true,
  from = "buildings",
  limit = PREVIEW,
}: {
  rows: BuildingListRow[];
  showBatch?: boolean;
  from?: BuildingFrom;
  limit?: number;
}) {
  const signature = rows
    .map((row) => `${row.batch.id}:${row.building.id}`)
    .join("|");
  const [state, setState] = useState({ signature, showAll: false });
  if (state.signature !== signature) setState({ signature, showAll: false });
  const showAll = state.showAll;
  const shown = showAll ? rows : rows.slice(0, limit);
  const grid = showBatch ? withBatch : withoutBatch;
  return (
    <>
      <div className="overflow-x-auto">
        <div className={showBatch ? "min-w-[760px]" : "min-w-[640px]"}>
          <div
            className="grid items-center gap-x-6 border-b border-border-light py-2.5 pl-8 pr-6"
            style={grid}
          >
            <span className="s3 text-text-tertiary">{WORDS.Asset}</span>
            {showBatch && <span className="s3 text-text-tertiary">Batch</span>}
            <span className="s3 text-text-tertiary">Solution</span>
            <span className="s3 text-text-tertiary">Service</span>
            <span />
          </div>
          {shown.map((row) => (
            <BuildingRow
              key={`${row.batch.id}-${row.building.id}`}
              row={row}
              showBatch={showBatch}
              from={from}
              grid={grid}
            />
          ))}
        </div>
      </div>
      <ListMore
        total={rows.length}
        limit={limit}
        open={showAll}
        noun={WORDS.assets}
        onOpen={() => setState({ signature, showAll: true })}
      />
    </>
  );
}

function BuildingRow({
  row,
  showBatch,
  from,
  grid,
}: {
  row: BuildingListRow;
  showBatch: boolean;
  from: BuildingFrom;
  grid: { gridTemplateColumns: string };
}) {
  const { account } = useConcept();
  const { building, batch, projects } = row;
  const several = projects.length > 1;
  const services = [...new Set(projects.map((item) => serviceLabel(item)))];
  const buildingHref = hrefs.building(
    building.id,
    from === "batch" ? { from, batch: batch.id } : { from },
  );
  return (
    <div
      className="relative grid items-center gap-x-6 border-t border-border-light py-3.5 pl-8 pr-6 hover:bg-black-1"
      style={grid}
    >
      <Link
        href={buildingHref}
        className="absolute inset-0"
        tabIndex={-1}
        aria-hidden="true"
      />
      <Link href={buildingHref} className="relative z-10 min-w-0">
        <ChangedDot on={buildingChanged(account, building.id)}>
          <span className="block h8 text-text-title">{building.name}</span>
        </ChangedDot>
        <span className="mt-0.5 block p7 text-text-tertiary">
          {building.city}
        </span>
      </Link>
      {showBatch && (
        <span className="pointer-events-none min-w-0 truncate p6 text-text-secondary">
          {batch.name}
        </span>
      )}
      <span className="pointer-events-none min-w-0">
        <span className="block p6 text-text-primary">
          {projects
            .map((item) => solutionName(item.workstream.solution))
            .join(", ") || "—"}
        </span>
        {several && (
          <span className="mt-0.5 block p7 text-text-tertiary">
            {projects.length} projects
          </span>
        )}
      </span>
      <span className="pointer-events-none min-w-0">
        <span className="block p6 text-text-primary">
          {several ? services.join(", ") : (services[0] ?? "—")}
        </span>
        {!several && projects[0] && (
          <span className="mt-0.5 block p7 text-text-tertiary">
            {serviceSince(projects[0])}
          </span>
        )}
      </span>
      <Icon name="chevron-right" size={16} className="pointer-events-none text-text-tertiary" />
    </div>
  );
}

function serviceLabel(item: BuildingProject) {
  if (isCompleted(item.workstream)) return "Completed";
  return service(currentPhase(item.workstream).service).label;
}

function serviceSince(item: BuildingProject) {
  if (isCompleted(item.workstream))
    return short(
      item.workstream.completedOn ?? currentPhase(item.workstream).completedOn,
    );
  const when = short(currentPhase(item.workstream).startedOn);
  return when ? `since ${when}` : "";
}
