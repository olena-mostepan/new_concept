"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Account, Batch, Workstream } from "@/lib/concept/model";
import {
  activeProjects,
  doneCount,
  getBatch,
  isBatchDone,
  isClosed,
  nextLine,
  short,
  wsIn,
  yourNeeds,
} from "@/lib/concept/derive";
import {
  Bar,
  OwnerPill,
  ServiceTag,
  td,
  th,
  tableRowShellClass,
  tableRowNameCellClass,
} from "./ui";
import { hrefs } from "./hrefs";
import { nAssets, nPackages, WORDS } from "@/lib/concept/words";

/** Light table of workstreams — scales to 30+ rows */
export function WorkstreamTable({
  account,
  items,
  showBatch,
  hrefFor = hrefs.workstream,
}: {
  account: Account;
  items: Workstream[];
  showBatch?: boolean;
  hrefFor?: (id: string) => string;
}) {
  return (
    <table className="w-full table-fixed">
      <thead className="border-b border-border-light">
        <tr>
          <th className={cn(th, "w-[30%]")}>{WORDS.Package}</th>
          {showBatch && <th className={cn(th, "w-[16%]")}>Batch</th>}
          <th className={cn(th, "w-36")}>Progress</th>
          <th className={th}>Next</th>
          <th className={cn(th, "w-36")}>With</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-border-light">
        {items.map((w) => {
          const total = activeProjects(w).length;
          const done = doneCount(w);
          const mine = yourNeeds(w).length;
          return (
            <tr key={w.id} className={tableRowShellClass}>
              <td className={td}>
                <Link
                  href={hrefFor(w.id)}
                  className={cn(
                    "h8 text-text-title hover:text-text-title outline-none rounded-sm",
                    tableRowNameCellClass,
                  )}
                >
                  {w.name}
                </Link>
                <div className="mt-1">
                  <ServiceTag s={w.service} />
                </div>
              </td>
              {showBatch && (
                <td className={cn(td, "text-text-secondary")}>
                  <Link
                    href={hrefs.batch(w.batchId)}
                    className="hover:text-text-primary"
                  >
                    {getBatch(account, w.batchId)?.name}
                  </Link>
                </td>
              )}
              <td className={td}>
                {w.proposed ? (
                  <span className="text-text-secondary">{nAssets(total)}</span>
                ) : (
                  <>
                    <span className="tabular-nums">
                      {done} of {total} done
                    </span>
                    <Bar done={done} total={total} className="mt-1.5" />
                  </>
                )}
              </td>
              <td className={cn(td, "text-text-secondary")}>
                {w.owner === "done"
                  ? `Done ${short(w.completedOn)}`
                  : nextLine(w) || w.now}
                {mine > 0 && !w.proposed && (
                  <span className="ml-2 text-brand-7">{mine} from you</span>
                )}
              </td>
              <td className={td}>
                <OwnerPill owner={w.owner} />
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

/** Workstreams grouped under their batch; finished batches last */
export function GroupedByBatch({
  account,
  items,
  batches,
}: {
  account: Account;
  items: Workstream[];
  batches: Batch[];
}) {
  const groups = batches
    .map((b) => ({
      b,
      ws: items.filter((w) => w.batchId === b.id && !isClosed(w)),
    }))
    .filter((g) => g.ws.length > 0)
    .sort(
      (a, z) =>
        Number(isBatchDone(account, a.b)) - Number(isBatchDone(account, z.b)),
    );
  if (!groups.length)
    return (
      <p className="p6 text-text-secondary">No {WORDS.packages} here yet.</p>
    );
  return (
    <div className="space-y-6">
      {groups.map(({ b, ws }) => (
        <section
          key={b.id}
          className="overflow-hidden rounded-lg border border-border-dark bg-white "
        >
          <header className="flex flex-wrap items-baseline justify-between gap-3 border-b border-border-light py-4 pl-8 pr-5">
            <div>
              <Link
                href={hrefs.batch(b.id)}
                className="h8 text-text-primary hover:text-text-primary"
              >
                {b.name}
              </Link>
              <p className="mt-0.5 p6 text-text-secondary">{b.goal}</p>
            </div>
            <span className="p6 text-text-secondary">
              {nAssets(b.buildingIds.length)} ·{" "}
              {nPackages(wsIn(account, b.id).length)}
              {b.target && ` · target ${b.target}`}
            </span>
          </header>
          <WorkstreamTable account={account} items={ws} />
        </section>
      ))}
    </div>
  );
}
