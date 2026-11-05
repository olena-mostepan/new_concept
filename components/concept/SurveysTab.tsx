"use client";

import { Fragment } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { SERVICES, service, type Workstream } from "@/lib/concept/model";
import {
  assetMatchLine,
  assetMatchNames,
  customerBatches,
  days,
  getBuilding,
  recordedVisits,
  visitBucket,
  visitCountLabel,
  visitStateLabel,
} from "@/lib/concept/derive";
import { WORDS } from "@/lib/concept/words";
import { Button, groupTitle, td, th } from "./ui";
import { hrefs } from "./hrefs";
import { useConcept } from "./store";

const fieldClass =
  "h-10 rounded-md border border-border-dark bg-white p6 text-text-primary";
const selectClass = `${fieldClass} min-w-0 flex-1 appearance-none bg-[length:16px] bg-[right_0.75rem_center] bg-no-repeat pl-3 pr-10`;
const selectStyle = {
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%234d5761' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
};

const BUCKETS = [
  { id: "unbooked", title: "To be booked" },
  { id: "booked", title: "Booked" },
  { id: "done", title: "Done" },
] as const;

function recency(w: Workstream) {
  const ons = w.projects
    .map((p) => p.visit?.on)
    .filter((d): d is string => Boolean(d));
  if (ons.length) return Math.min(...ons.map(days));
  if (w.surveyNote?.includes("3 Oct")) return days("3 Oct 2026");
  if (w.surveyNote === "July") return days("1 Jul 2026");
  return 9999;
}

export function SurveysTab({ packageId }: { packageId?: string } = {}) {
  const { account } = useConcept();
  const router = useRouter();
  const params = useSearchParams();
  const q = packageId ? "" : (params.get("q") ?? "");
  const batch = params.get("batch") ?? "";
  const serviceId = params.get("service") ?? "";
  const status = params.get("status") ?? "";

  const write = (next: Record<string, string>) => {
    const sp = new URLSearchParams(params.toString());
    sp.set("tab", "surveys");
    for (const [key, value] of Object.entries(next)) {
      if (value) sp.set(key, value);
      else sp.delete(key);
    }
    router.replace(`${hrefs.service("scope")}?${sp.toString()}`);
  };

  const needle = q.trim().toLowerCase();
  const withVisits = account.workstreams.filter(
    (w) => visitBucket(w) && (!packageId || w.id === packageId),
  );
  const filtered = withVisits.filter((w) => {
    if (batch && w.batchId !== batch) return false;
    if (serviceId && w.service !== serviceId) return false;
    const hits = assetMatchNames(account, w.projects, needle);
    return hits === null || hits.length > 0;
  });

  const services = [...new Set(withVisits.map((w) => w.service))];
  const batches = customerBatches(account).filter((b) =>
    withVisits.some((w) => w.batchId === b.id),
  );

  return (
    <>
      {!packageId && (
      <div className="mb-6 flex flex-wrap items-end gap-3">
        <label className="flex w-full shrink-0 flex-col gap-1 sm:w-72">
          <span className="p7 text-text-tertiary">Search</span>
          <input
            type="search"
            value={q}
            placeholder="Address or city"
            aria-label="Search"
            onChange={(e) => write({ q: e.target.value })}
            className={`${fieldClass} w-full px-3`}
          />
        </label>
        <select
          aria-label="Batch"
          value={batch}
          onChange={(e) => write({ batch: e.target.value })}
          className={selectClass}
          style={selectStyle}
        >
          <option value="">Batch</option>
          {batches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
        <select
          aria-label="Service"
          value={serviceId}
          onChange={(e) => write({ service: e.target.value })}
          className={selectClass}
          style={selectStyle}
        >
          <option value="">Service</option>
          {SERVICES.filter((s) => services.includes(s.id)).map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
        <select
          aria-label="Status"
          value={status}
          onChange={(e) => write({ status: e.target.value })}
          className={selectClass}
          style={selectStyle}
        >
          <option value="">Status</option>
          {BUCKETS.map((b) => (
            <option key={b.id} value={b.id}>
              {b.title}
            </option>
          ))}
        </select>
      </div>
      )}
      <div className="space-y-6">
        {BUCKETS.filter((bucket) => !status || status === bucket.id).map(
          (bucket) => {
            const rows = filtered
              .filter((w) => visitBucket(w) === bucket.id)
              .sort((a, b) => recency(a) - recency(b));
            const visits = filtered.reduce(
              (n, w) =>
                n +
                recordedVisits(w).filter((v) => v.state === bucket.id).length,
              0,
            );
            if (!rows.length && !visits) return null;
            return (
              <section
                key={bucket.id}
                className="overflow-hidden rounded-lg border border-border-dark bg-white "
              >
                <header className="border-b border-border-light py-4 pl-8 pr-5">
                  <h2 className={groupTitle}>
                    {bucket.title}{" "}
                    <span className="p6 text-text-tertiary">{visits}</span>
                  </h2>
                </header>
                {rows.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[760px]">
                      <thead className="border-b border-border-light">
                        <tr>
                          <th className={th}>{WORDS.Package}</th>
                          <th className={th}>Batch</th>
                          <th className={th}>Service</th>
                          <th className={th}>Visits</th>
                          <th className={th}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((w) => {
                          const b = account.batches.find(
                            (x) => x.id === w.batchId,
                          );
                          const states = new Set(
                            recordedVisits(w).map((v) => v.state),
                          );
                          const mixed = states.size > 1;
                          return (
                            <Fragment key={w.id}>
                              <tr className="border-t border-border-light">
                                <td className={td}>
                                  <Link
                                    href={hrefs.workstream(w.id, "service")}
                                    className="hover:text-text-primary"
                                  >
                                    {w.name}
                                  </Link>
                                  {needle && (
                                    <p className="p7 text-text-secondary">
                                      {assetMatchLine(
                                        assetMatchNames(
                                          account,
                                          w.projects,
                                          needle,
                                        ) ?? [],
                                      )}
                                    </p>
                                  )}
                                </td>
                                <td className={td}>
                                  {b ? (
                                    <Link
                                      href={hrefs.batch(b.id)}
                                      className="underline underline-offset-[3px] decoration-border-dark"
                                    >
                                      {b.name}
                                    </Link>
                                  ) : (
                                    "—"
                                  )}
                                </td>
                                <td className={td}>
                                  {service(w.service).label}
                                </td>
                                <td className={td}>{visitCountLabel(w)}</td>
                                <td className={td}>
                                  {w.surveyDocs ? (
                                    <Button type="secondary" size="small">
                                      Survey documents
                                    </Button>
                                  ) : (
                                    <Button
                                      href={hrefs.workstream(w.id, "service")}
                                      type="secondary"
                                      size="small"
                                    >
                                      View
                                    </Button>
                                  )}
                                </td>
                              </tr>
                              {mixed &&
                                w.projects
                                  .filter(
                                    (p) => p.visit && p.visit.state !== "skip",
                                  )
                                  .map((p) => (
                                    <tr
                                      key={`${w.id}-${p.buildingId}`}
                                      className="border-t border-border-light bg-bg-container-grey"
                                    >
                                      <td
                                        className={`${td} pl-10 text-text-secondary`}
                                      >
                                        {
                                          getBuilding(account, p.buildingId)
                                            .name
                                        }
                                      </td>
                                      <td className={td} />
                                      <td className={td} />
                                      <td className={td} />
                                      <td
                                        className={`${td} text-text-secondary`}
                                      >
                                        {visitStateLabel(p.visit!)}
                                      </td>
                                    </tr>
                                  ))}
                            </Fragment>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            );
          },
        )}
      </div>
    </>
  );
}
