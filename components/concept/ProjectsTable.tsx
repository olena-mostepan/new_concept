"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  buildingChanged,
  getBuilding,
  money,
  moneyOne,
  scopeDecisionLabel,
  short,
  visitStateLabel,
} from "@/lib/concept/derive";
import { service, type ProjectRow, type Workstream } from "@/lib/concept/model";
import { hrefs, type BuildingVia } from "./hrefs";
import { WORDS } from "@/lib/concept/words";
import {
  Icon,
  ChangedDot,
  ListMore,
  tableRowLinkClass,
  tableRowNameCellClass,
} from "./ui";
import { useConcept } from "./store";
import { cn } from "@/lib/utils";

type Column =
  | "step"
  | "estimate"
  | "decision"
  | "size"
  | "brief"
  | "check"
  | "gap"
  | "survey"
  | "price"
  | "analysis";

const LABEL: Record<Column, string> = {
  step: "Step",
  estimate: "Estimate",
  decision: "Your decision",
  size: "Size",
  brief: "Brief",
  check: "Site check",
  gap: "Open gap",
  survey: "Survey",
  price: "Price",
  analysis: "Analysis",
};

function decisionText(row: ProjectRow): {
  text: string;
  emphasis: boolean;
  muted: boolean;
} {
  if (row.decision === "waiting")
    return { text: "Waiting for your decision", emphasis: true, muted: false };
  if (row.decision === "no" && row.paybackYears === "over12")
    return {
      text: "Not proceeding · payback over 12 years",
      emphasis: false,
      muted: true,
    };
  if (row.decision === "no")
    return {
      text: `Not now · ${short(row.decidedOn)}`,
      emphasis: false,
      muted: true,
    };
  if (row.decision === "scope")
    return {
      text: `To Planning · ${short(row.decidedOn)}`,
      emphasis: false,
      muted: false,
    };
  if (row.decision === "go")
    return {
      text: row.price
        ? `Agreed · ${short(row.decidedOn)}`
        : `Going ahead · ${short(row.decidedOn)}`,
      emphasis: false,
      muted: false,
    };
  return { text: "—", emphasis: false, muted: true };
}

function columnsFor(w: Workstream): Column[] {
  if (w.service === "tender") return ["step", "size", "brief", "check"];
  if (w.service === "scope") return ["step", "gap", "survey"];
  if (w.service === "pricing") {
    const columns: Column[] = ["step"];
    if (w.projects.some((row) => row.price)) columns.push("price");
    if (w.projects.some((row) => row.analysis)) columns.push("analysis");
    if (w.projects.some((row) => row.decision)) columns.push("decision");
    return columns;
  }
  return ["step", "estimate", "decision"];
}

const PREVIEW = 10;

export function ProjectsTable({
  w,
  rows,
  columns,
  readOnly,
}: {
  w: Workstream;
  rows?: ProjectRow[];
  columns?: Column[];
  /** Inherited tab: no emphasized “your decision” prompts. */
  readOnly?: boolean;
}) {
  const { account } = useConcept();
  const params = useSearchParams();
  const [showAll, setShowAll] = useState(false);
  const from = params.get("from");
  const via: BuildingVia | undefined =
    from === "service" ? "service" : from === "batch" ? "batch" : undefined;
  const steps = service(w.service).steps;
  const list = rows ?? w.projects;
  const shown = showAll ? list : list.slice(0, PREVIEW);
  const cols = columns ?? columnsFor(w);
  const template = `minmax(0,1.5fr) ${cols.map(() => "minmax(0,1fr)").join(" ")} 16px`;

  const cell = (row: ProjectRow, column: Column): ReactNode => {
    if (column === "step") return w.owner === "done" ? "Done" : steps[row.step];
    if (column === "estimate") return row.estimate ? money(row.estimate) : "—";
    if (column === "size") return row.sizeKwp ? `${row.sizeKwp} kWp` : "—";
    if (column === "brief") return row.briefLabel ?? "—";
    if (column === "check") {
      if (row.visit?.state === "done" && row.visit.on)
        return `Done ${short(row.visit.on)}`;
      if (row.visit?.state === "skip") return "Not required";
      return "—";
    }
    if (column === "survey")
      return row.visit ? visitStateLabel(row.visit) : "—";
    if (column === "gap") {
      if (row.decision === "go") return scopeDecisionLabel(row);
      if (row.decision === "waiting")
        return (
          <span className="h8 text-text-primary">
            Waiting for your decision
          </span>
        );
      return row.gap ?? "—";
    }
    if (column === "price") return row.price ? moneyOne(row.price) : "—";
    if (column === "analysis") return row.analysis ?? "—";
    const decision = decisionText(row);
    return (
      <span
        className={cn(
          !readOnly && decision.emphasis && "h8 text-text-primary",
          decision.muted && "text-text-tertiary",
          !decision.muted && readOnly && "text-text-primary",
        )}
      >
        {decision.text}
      </span>
    );
  };

  return (
    <>
      <div className="overflow-x-auto">
        <div className="min-w-[720px]">
          <div
            className="grid items-center gap-x-4 border-b border-border-light py-2 pl-8 pr-6 s3 text-text-tertiary"
            style={{ gridTemplateColumns: template }}
          >
            <span>{WORDS.Asset}</span>
            {cols.map((column) => (
              <span key={column}>{LABEL[column]}</span>
            ))}
            <span />
          </div>
          {shown.map((row) => {
            const building = getBuilding(account, row.buildingId);
            const muted = Boolean(row.dropped);
            return (
              <Link
                key={row.buildingId}
                href={hrefs.building(row.buildingId, {
                  project: w.id,
                  from: "workstream",
                  ws: w.id,
                  via,
                })}
                className={cn(
                  "grid items-center gap-x-4 border-t border-border-light py-3 pl-8 pr-6",
                  tableRowLinkClass,
                  muted && "text-text-tertiary",
                )}
                style={{ gridTemplateColumns: template }}
              >
                <span className="min-w-0">
                  <ChangedDot
                    on={!muted && buildingChanged(account, row.buildingId)}
                  >
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
                {cols.map((column) => (
                  <span
                    key={column}
                    className={cn(
                      "min-w-0 p6",
                      muted ? "text-text-tertiary" : "text-text-primary",
                      column === "brief" &&
                        row.briefStrong &&
                        !muted &&
                        "font-semibold",
                    )}
                  >
                    {cell(row, column)}
                  </span>
                ))}
                <Icon name="chevron-right" size={16} className="justify-self-end text-text-tertiary" />
              </Link>
            );
          })}
        </div>
      </div>
      <ListMore
        total={list.length}
        limit={PREVIEW}
        open={showAll}
        noun={WORDS.assets}
        onOpen={() => setShowAll(true)}
      />
    </>
  );
}
