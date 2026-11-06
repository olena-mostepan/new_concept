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
  isClosed,
} from "@/lib/concept/derive";
import { WORDS } from "@/lib/concept/words";
import {
  Button,
  Dropdown,
  FilterField,
  FilterSearch,
  FilterSelect,
  groupTitle,
  td,
  th,
} from "./ui";
import { hrefs } from "./hrefs";
import { useConcept } from "./store";

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

export function SurveysTab({
  packageId,
  readOnly,
}: { packageId?: string; readOnly?: boolean } = {}) {
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
    (w) =>
      !isClosed(w) &&
      visitBucket(w) &&
      (!packageId || w.id === packageId),
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
        <FilterField label="Search" className="w-full shrink-0 sm:w-72">
          <FilterSearch
            value={q}
            onChange={(value) => write({ q: value })}
            placeholder="Address or city"
          />
        </FilterField>
        <FilterField label="Batch" className="min-w-0 flex-1 sm:max-w-[240px]">
          <FilterSelect
            label="Batch"
            value={batch}
            onChange={(value) => write({ batch: value })}
          >
            <option value="">All batches</option>
            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </FilterSelect>
        </FilterField>
        <FilterField label="Service" className="min-w-0 flex-1 sm:max-w-[240px]">
          <FilterSelect
            label="Service"
            value={serviceId}
            onChange={(value) => write({ service: value })}
          >
            <option value="">All services</option>
            {SERVICES.filter((s) => services.includes(s.id)).map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </FilterSelect>
        </FilterField>
        <FilterField label="Status" className="min-w-0 flex-1 sm:max-w-[240px]">
          <Dropdown
            ariaLabel="Status"
            value={status === "" ? "__none" : status}
            onValueChange={(v) => write({ status: v === "__none" ? "" : v })}
            options={[
              { value: "__none", label: "All status" },
              ...BUCKETS.map((b) => ({ value: b.id, label: b.title })),
            ]}
            triggerClassName={status ? "border-black-6" : undefined}
            valueClassName={status ? "text-text-primary" : "text-text-title"}
          />
        </FilterField>
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
                                  {readOnly && packageId ? (
                                    <span className="p6 text-text-secondary">
                                      {w.surveyDocs
                                        ? "Survey documents"
                                        : "View"}
                                    </span>
                                  ) : w.surveyDocs ? (
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
