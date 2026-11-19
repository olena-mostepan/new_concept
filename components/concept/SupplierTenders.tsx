"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  GROUPS,
  SOLUTION_ICON,
  SUPPLIER_INITIALS,
  SUPPLIER_NAME,
  TENDER_ROWS,
  type ListSolution,
  type TenderRow,
} from "@/lib/concept/supplierList";
import {
  ChangedDot,
  ClearFilters,
  FilterBar,
  FilterField,
  FilterSearch,
  FilterSelect,
  Icon,
  PageHeader,
  ResponsibilityPill,
  YourActionOnly,
  groupTitle,
  tableRowLinkClass,
  tableRowNameCellClass,
} from "./ui";

/**
 * Supplier portal: Tenders list (C11, option B without the preview).
 * Same look as the customer/ops service lists (ServiceSection): header,
 * PageHeader with the changed key, FilterBar, one card per group.
 */

const rowGrid = {
  gridTemplateColumns:
    "minmax(0,1.4fr) minmax(0,0.8fr) 80px minmax(0,1.2fr) 120px 16px",
};

/** Opened in this session: the "new" dot goes away. */
const opened = new Set<string>();

function SupplierHeader() {
  return (
    <header className="border-b border-border-dark bg-white">
      <div className="mx-auto flex w-full max-w-screen-2xl items-center justify-between gap-3 px-6 py-3.5 sm:px-8 lg:px-10">
        <span className="flex min-w-0 items-center gap-3">
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-black-7 h8 text-white"
            aria-hidden
          >
            {SUPPLIER_NAME[0]}
          </span>
          <span className="shrink-0 rounded-full border border-border-dark bg-bg-container-grey px-2.5 py-1 p7 text-text-secondary">
            Powered by CQuel
          </span>
          <span className="truncate text-text-primary h5">{SUPPLIER_NAME}</span>
        </span>
        <span
          aria-label="Account"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-border-dark bg-bg-container-grey h9 text-text-primary"
        >
          {SUPPLIER_INITIALS[0]}
        </span>
      </div>
      <nav className="border-t border-border-dark bg-white" aria-label="Sections">
        <div className="mx-auto flex max-w-screen-2xl items-center gap-8 px-6 sm:px-8 lg:px-10">
          <Link
            href="/concept/supplier/tenders"
            aria-current="page"
            className="relative inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-none border-b-2 border-brand-6 py-3 h8 text-text-primary outline-none focus-visible:shadow-focus"
          >
            Tenders
          </Link>
        </div>
      </nav>
    </header>
  );
}

function Row({ row }: { row: TenderRow }) {
  const closed = row.group === "closed";
  const yours = row.group === "you";
  const isNew = row.unopened && !opened.has(row.id);
  const muted = closed ? "text-text-tertiary" : "text-text-primary";
  const cells = (
    <>
      <span className="min-w-0">
        <ChangedDot on={Boolean(isNew)}>
          <span
            className={cn(
              "block h8",
              closed ? "text-text-tertiary" : "text-text-title",
              row.href && tableRowNameCellClass,
            )}
          >
            {row.title}
          </span>
        </ChangedDot>
        {row.customer && (
          <span className="mt-0.5 block truncate p7 text-text-tertiary">
            {row.customer}
          </span>
        )}
      </span>
      <span className={`min-w-0 p6 ${muted}`}>{SOLUTION_ICON[row.solution].label}</span>
      <span className={`p6 tabular-nums ${muted}`}>{row.sites}</span>
      <span className="min-w-0">
        <span className={cn("block", yours ? "h8 text-text-primary" : `p6 ${muted}`)}>
          {row.next.main}
        </span>
        {row.next.detail && (
          <span className="mt-0.5 block p7 text-text-tertiary">{row.next.detail}</span>
        )}
      </span>
      <span className="flex justify-end">
        {yours && <ResponsibilityPill owner="you" label="Your action" />}
      </span>
      <span className="text-text-tertiary">
        {row.href && <Icon name="chevron-right" size={16} />}
      </span>
    </>
  );
  const cls = "relative grid items-center gap-x-6 border-t border-border-light py-3.5 pl-8 pr-6";
  if (!row.href)
    return (
      <div className={cls} style={rowGrid} title="Example: no tender page in the prototype">
        {cells}
      </div>
    );
  return (
    <Link
      href={row.href}
      onClick={() => opened.add(row.id)}
      className={cn(cls, tableRowLinkClass)}
      style={rowGrid}
    >
      {cells}
    </Link>
  );
}

export function SupplierTenders() {
  const [q, setQ] = useState("");
  const [solution, setSolution] = useState<"" | ListSolution>("");
  const [youOnly, setYouOnly] = useState(false);
  const needle = q.trim().toLowerCase();
  const rows = TENDER_ROWS.filter(
    (r) =>
      (!needle || `${r.title} ${r.customer ?? ""}`.toLowerCase().includes(needle)) &&
      (!solution || r.solution === solution) &&
      (!youOnly || r.group === "you"),
  );
  const solutions = (Object.keys(SOLUTION_ICON) as ListSolution[]).filter((id) =>
    TENDER_ROWS.some((r) => r.solution === id),
  );
  const filtering = Boolean(q || solution || youOnly);
  const clear = () => {
    setQ("");
    setSolution("");
    setYouOnly(false);
  };

  return (
    <div className="min-h-screen bg-bg-container-grey">
      <SupplierHeader />
      <main className="mx-auto w-full max-w-screen-2xl px-6 pb-28 pt-8 sm:px-8 lg:px-10">
        <PageHeader title="Tenders" changedKey />
        <FilterBar selects={1}>
          <FilterField label="Search">
            <FilterSearch value={q} onChange={setQ} placeholder="Tender or customer" />
          </FilterField>
          <FilterField label="Solution">
            <FilterSelect
              label="Solution"
              value={solution}
              onChange={(v) => setSolution(v as "" | ListSolution)}
            >
              <option value="">All solutions</option>
              {solutions.map((id) => (
                <option key={id} value={id}>
                  {SOLUTION_ICON[id].label}
                </option>
              ))}
            </FilterSelect>
          </FilterField>
          <YourActionOnly checked={youOnly} onChange={setYouOnly} label="Your action only" />
          {filtering && <ClearFilters onClick={clear} />}
        </FilterBar>

        <div className="space-y-6">
          {rows.length === 0 && (
            <p className="rounded-lg border border-border-dark bg-white px-8 py-8 p6 text-text-secondary">
              No tenders match.{" "}
              <button type="button" className="btn-link" onClick={clear}>
                Clear filters
              </button>
            </p>
          )}
          {GROUPS.map((g) => {
            const list = rows.filter((r) => r.group === g.id);
            if (list.length === 0) return null;
            return (
              <section
                key={g.id}
                className="overflow-hidden rounded-lg border border-border-dark bg-white"
              >
                <header className="border-b border-border-light py-4 pl-8 pr-6">
                  <h2 className={groupTitle}>
                    {g.label} <span className="p6 text-text-tertiary">{list.length}</span>
                  </h2>
                </header>
                <div
                  className="grid items-center gap-x-6 py-2.5 pl-8 pr-6"
                  style={rowGrid}
                >
                  <span className="s3 text-text-tertiary">Tender</span>
                  <span className="s3 text-text-tertiary">Solution</span>
                  <span className="s3 text-text-tertiary">Sites</span>
                  <span className="s3 text-text-tertiary">
                    {g.id === "closed" ? "Outcome" : "Next step"}
                  </span>
                  <span />
                  <span />
                </div>
                {list.map((r) => (
                  <Row key={r.id} row={r} />
                ))}
              </section>
            );
          })}
        </div>
      </main>
    </div>
  );
}
