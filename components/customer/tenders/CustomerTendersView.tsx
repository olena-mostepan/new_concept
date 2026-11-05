"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Building2, RefreshCw, Search } from "lucide-react";
import { toast } from "sonner";
import { OWNER_LABEL } from "@/lib/concept/model";
import { PORTFOLIO_USER } from "@/lib/customer/portfolio/mock-data";
import {
  CUSTOMER_TENDERS,
  WORKSPACE_STATS,
  type CustomerTenderRow,
} from "@/lib/customer/workspace/mock-data";
import {
  FilterSelect,
  ProjectName,
  ResponsibilityPill,
  WorkspaceStat,
} from "@/components/customer/workspace/WorkspaceBits";

const RESPONSIBILITY_LABEL = {
  your_action: OWNER_LABEL.you,
  supplier_action: "Supplier's Action",
} as const;

function matches(
  row: CustomerTenderRow,
  query: string,
  solution: string,
  status: string,
) {
  if (solution !== "all" && row.solution !== solution) return false;
  if (status !== "all" && row.stage !== status) return false;
  if (!query) return true;
  const haystack = `${row.name} ${row.address}`.toLowerCase();
  return haystack.includes(query);
}

function TenderIcon({ icon }: { icon: CustomerTenderRow["icon"] }) {
  if (icon === "solar") {
    return (
      <Image
        src="/site elements/solar.svg"
        alt=""
        width={36}
        height={36}
        className="h-9 w-9 rounded-md object-contain"
      />
    );
  }
  return (
    <span className="flex h-9 w-9 items-center justify-center rounded-md border border-border-dark bg-bg-container-grey text-text-secondary">
      <Building2 className="h-4 w-4" aria-hidden />
    </span>
  );
}

function TenderRow({ row }: { row: CustomerTenderRow }) {
  return (
    <li className="flex flex-col gap-3 border-b border-border-dark px-5 py-4 last:border-b-0 sm:flex-row sm:items-center sm:gap-6 sm:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <TenderIcon icon={row.icon} />
        <div className="min-w-0">
          <ProjectName name={row.name} href={row.href} />
          <p className="mt-0.5 p7 text-text-secondary">{row.address}</p>
        </div>
      </div>
      <div className="sm:w-36">
        <ResponsibilityPill
          responsibility={row.responsibility}
          label={RESPONSIBILITY_LABEL[row.responsibility]}
        />
      </div>
      <p className="p6 text-text-primary sm:w-40">{row.stage}</p>
      {row.href ? (
        <Link href={row.href} className="btn-secondary-sm">
          View tender results
        </Link>
      ) : (
        <button
          type="button"
          className="btn-secondary-sm"
          onClick={() => toast.message("Status opens here in production")}
        >
          View status
        </button>
      )}
    </li>
  );
}

export function CustomerTendersView() {
  const [search, setSearch] = React.useState("");
  const [solution, setSolution] = React.useState("all");
  const [status, setStatus] = React.useState("all");

  const query = search.trim().toLowerCase();
  const rows = CUSTOMER_TENDERS.filter((row) =>
    matches(row, query, solution, status),
  );
  const needsAttention = rows.filter((row) => row.group === "needs_attention");
  const done = rows.filter((row) => row.group === "done");

  const solutions = [...new Set(CUSTOMER_TENDERS.map((row) => row.solution))];
  const stages = [...new Set(CUSTOMER_TENDERS.map((row) => row.stage))];

  return (
    <div className="mx-auto w-full max-w-screen-2xl space-y-5 px-6 py-8 sm:px-8 lg:px-10">
      <h1 className="text-2xl font-semibold tracking-tight text-text-primary md:text-3xl">
        Welcome back, {PORTFOLIO_USER}
      </h1>

      <div className="grid gap-4 sm:grid-cols-2">
        <WorkspaceStat
          icon={<RefreshCw className="h-4 w-4" aria-hidden />}
          value={WORKSPACE_STATS.activeTenders}
          label="active tenders"
        />
        <WorkspaceStat
          icon={null}
          value={WORKSPACE_STATS.completedTenders}
          label="completed tenders"
          iconTone="success"
        />
      </div>

      <section className="overflow-hidden rounded-lg border border-border-dark bg-white ">
        <div className="flex flex-col gap-4 border-b border-border-dark px-5 py-4 sm:flex-row sm:items-end sm:justify-between sm:px-6">
          <div className="relative w-full sm:max-w-xs">
            <label htmlFor="tender-search" className="sr-only">
              Search tenders
            </label>
            <input
              id="tender-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search..."
              className="w-full rounded-md border border-border-dark bg-white py-2 pl-3 pr-10 p6 text-text-primary placeholder:text-text-tertiary focus:border-[var(--brand-6)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-6)]"
            />
            <Search
              className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary"
              aria-hidden
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <FilterSelect
              id="tender-solution"
              label="Solution Category"
              value={solution}
              onChange={setSolution}
              options={solutions}
            />
            <FilterSelect
              id="tender-status"
              label="Status"
              value={status}
              onChange={setStatus}
              options={stages}
            />
          </div>
        </div>

        {rows.length === 0 ? (
          <p className="px-5 py-10 text-center p6 text-text-secondary sm:px-6">
            No tenders match this search.
          </p>
        ) : (
          <>
            {needsAttention.length > 0 ? (
              <div>
                <h2 className="px-5 pb-1 pt-4 h8 text-text-primary sm:px-6">
                  Needs Attention
                </h2>
                <ul>
                  {needsAttention.map((row) => (
                    <TenderRow key={row.id} row={row} />
                  ))}
                </ul>
              </div>
            ) : null}
            {done.length > 0 ? (
              <div>
                <h2 className="px-5 pb-1 pt-4 h8 text-text-primary sm:px-6">
                  Done
                </h2>
                <ul>
                  {done.map((row) => (
                    <TenderRow key={row.id} row={row} />
                  ))}
                </ul>
              </div>
            ) : null}
          </>
        )}
      </section>
    </div>
  );
}
