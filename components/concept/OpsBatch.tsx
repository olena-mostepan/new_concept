"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  OWNER_LABEL,
  service as serviceDef,
  type Batch,
  type Owner,
  type Workstream,
} from "@/lib/concept/model";
import { getBuilding, openNeeds, short, wsInAll } from "@/lib/concept/derive";
import { Tag } from "@/components/ds/tag";
import { cn } from "@/lib/utils";
import { Button, Icon, Page, PageHeader, ServiceIcon } from "./ui";
import { solutionLabel } from "./ops-shared";
import { CountPill, placeOf } from "./ops-workspace";
import { exclusionLine, OpsAddPackage } from "./OpsWorkstreamDrawer";
import { BatchView } from "./BatchView";
import { customerHrefs, hrefs } from "./hrefs";
import { useConcept } from "./store";

const WITH: Record<Exclude<Owner, "done">, string> = {
  you: "With customer",
  cquel: OWNER_LABEL.cquel,
  suppliers: OWNER_LABEL.suppliers,
};

/** Columns of the Packages list: name | next | status | chevron. */
const PKG_GRID = "minmax(0,1.4fr) minmax(0,1.2fr) 140px 32px";

export function OpsBatch({ id }: { id: string }) {
  const { account, setPlanState, agreePlan, removeWorkstream } = useConcept();
  const router = useRouter();
  const params = useSearchParams();
  const batch = account.batches.find((item) => item.id === id);
  const streams = batch ? wsInAll(account, batch.id) : [];
  const [openIds, setOpenIds] = useState<string[]>([]);

  if (!batch) {
    return (
      <Page>
        <PageHeader crumbs={[{ label: "Overview", href: hrefs.ops }]} title="Batch not found" />
      </Page>
    );
  }

  const editingId = params.get("edit");
  const adding = params.get("add") === "package";
  const editing = streams.find((item) => item.id === editingId);
  const setQuery = (next: Record<string, string | null>) => {
    const sp = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(next)) {
      if (value) sp.set(key, value);
      else sp.delete(key);
    }
    const qs = sp.toString();
    router.replace(`${hrefs.opsBatch(batch.id)}${qs ? `?${qs}` : ""}`);
  };
  const close = () => setQuery({ add: null, edit: null });
  const addPackage = () => setQuery({ add: "package", edit: null });
  const toggle = (sid: string) =>
    setOpenIds((cur) => (cur.includes(sid) ? cur.filter((x) => x !== sid) : [...cur, sid]));

  const solutions = [...new Set(streams.map((s) => solutionLabel(s.solution)))].join(", ");
  const facts = [
    { label: "Goal", value: batch.goal || "—" },
    ...(solutions ? [{ label: "Solution", value: solutions }] : []),
    { label: "Assets", value: String(batch.buildingIds.length) },
    { label: "Packages", value: String(streams.length) },
    ...(batch.target ? [{ label: "Target", value: batch.target }] : []),
  ];

  return (
    <Page>
      <PageHeader
        crumbs={[{ label: "Overview", href: hrefs.ops }, { label: batch.name }]}
        kind="batch"
        title={batch.name}
        facts={facts}
        actions={
          <Button type="secondary" size="small" href={customerHrefs.batch(batch.id)}>
            Customer view
          </Button>
        }
        aside={
          <PlanCard
            batch={batch}
            packages={streams.length}
            service={streams[0]?.service}
            onAction={(action) =>
              action === "share"
                ? setPlanState(batch.id, "proposed")
                : action === "agree"
                  ? setPlanState(batch.id, "agreed")
                  : agreePlan(batch.id)
            }
          />
        }
      />

      {batch.planState === "live" ? (
        // Live: the customer's batch page, with Ops actions on its tabs.
        <BatchView
          account={account}
          batch={batch}
          variant="page"
          actions={{
            assets: (
              <Button type="secondary" size="small" icon="edit" href={`${hrefs.newBatch}?batch=${batch.id}`}>
                Change assets
              </Button>
            ),
            packages: (
              <Button type="secondary" size="small" icon="plus" onClick={addPackage}>
                Add package
              </Button>
            ),
          }}
        />
      ) : (
      // Before the plan is live: build it. Packages added now are proposed, so the customer page doesn't list them yet.
      <div className="space-y-6">
        {/* Packages */}
        <section className="overflow-hidden rounded-lg border border-border-dark bg-white" aria-label="Packages">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-light px-5 py-4">
            <h2 className="flex items-center gap-2 h7 text-text-primary">
              Packages <CountPill>{streams.length}</CountPill>
            </h2>
            {streams.length > 0 && (
              <Button type="secondary" icon="plus" onClick={addPackage}>
                Add package
              </Button>
            )}
          </div>

          {streams.length === 0 ? (
            <div className="flex flex-col items-start gap-3 px-5 py-6">
              <div>
                <p className="h8 text-text-primary">No packages yet</p>
                <p className="mt-0.5 p6 text-text-secondary">
                  A package runs services for one solution on some of the batch&apos;s assets.
                </p>
              </div>
              <Button type="secondary" icon="plus" onClick={addPackage}>
                Add package
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-[720px]">
                <div className="grid items-center gap-4 border-b border-border-light px-5 py-2" style={{ gridTemplateColumns: PKG_GRID }}>
                  {["Package", "Next", "Status"].map((t) => (
                    <span key={t} className="s3 text-text-tertiary">
                      {t}
                    </span>
                  ))}
                  <span />
                </div>
                {streams.map((s) => (
                  <PackageRow
                    key={s.id}
                    s={s}
                    batch={batch}
                    open={openIds.includes(s.id)}
                    onToggle={() => toggle(s.id)}
                    onEdit={() => setQuery({ add: null, edit: s.id })}
                    onRemove={() => removeWorkstream(s.id)}
                    onOpen={() => router.push(hrefs.opsPackage(s.id))}
                    assetName={(bid) => getBuilding(account, bid).name}
                  />
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Assets */}
        <section className="overflow-hidden rounded-lg border border-border-dark bg-white" aria-label="Assets">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-light px-5 py-4">
            <h2 className="flex items-center gap-2 h7 text-text-primary">
              Assets <CountPill>{batch.buildingIds.length}</CountPill>
            </h2>
            <Button type="secondary" icon="edit" href={`${hrefs.opsNewBatch}?batch=${batch.id}`}>
              Change assets
            </Button>
          </div>
          <ul>
            {batch.buildingIds.map((bid) => {
              const b = getBuilding(account, bid);
              const mine = streams.filter((s) => s.projects.some((p) => p.buildingId === bid));
              const reason = streams.map((s) => exclusionLine(b.name, s.solution, s.exclusion)).find(Boolean);
              return (
                <li
                  key={bid}
                  className="grid min-h-14 items-center gap-x-4 gap-y-2 border-b border-border-light px-5 py-3 last:border-b-0 md:grid-cols-[minmax(0,1fr)_auto]"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <Icon name="building" size={16} className="mt-0.5 shrink-0 text-icon-default" />
                    <div className="min-w-0">
                      <p className="truncate h8 text-text-title">{b.name}</p>
                      <p className="truncate p7 text-text-secondary">
                        {[placeOf(b) || b.city, b.type].filter(Boolean).join(" · ")}
                      </p>
                      {reason && <p className="mt-0.5 p7 text-text-tertiary">{reason}</p>}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pl-7 md:justify-end md:pl-0">
                    {mine.map((s) => (
                      <Tag key={s.id} type="neutral" size="small">
                        {s.name} · {serviceDef(s.service).label}
                      </Tag>
                    ))}
                    {mine.length === 0 && !reason && <span className="p7 text-text-tertiary">No package yet</span>}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
      )}

      {(adding || editing) && (
        <OpsAddPackage
          key={editing?.id ?? "new"}
          batch={batch}
          editing={editing}
          onClose={close}
          onSaved={(ids) => {
            setOpenIds(ids);
            close();
          }}
        />
      )}
    </Page>
  );
}

function PackageRow({
  s,
  batch,
  open,
  onToggle,
  onEdit,
  onRemove,
  onOpen,
  assetName,
}: {
  s: Workstream;
  batch: Batch;
  open: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onRemove: () => void;
  onOpen: () => void;
  assetName: (id: string) => string;
}) {
  const need = openNeeds(s)[0];
  const inPlan = batch.planState === "draft" || batch.planState === "proposed";
  const status = inPlan ? "In plan" : s.owner === "done" ? "Done" : WITH[s.owner];
  const n = s.projects.length;
  return (
    <div className={cn("border-b border-border-light last:border-b-0", open && "bg-black-1")}>
      <div
        role="button"
        tabIndex={0}
        aria-expanded={open}
        onClick={onToggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggle();
          }
        }}
        className="grid min-h-16 cursor-pointer items-center gap-4 px-5 py-3 outline-none hover:bg-black-1 focus-visible:shadow-[inset_0_0_0_2px_var(--black-7)]"
        style={{ gridTemplateColumns: PKG_GRID }}
      >
        <div className="flex min-w-0 items-center gap-3">
          <ServiceIcon service={s.service} size={36} />
          <div className="min-w-0">
            <p className="truncate h8 text-text-title">{s.name}</p>
            <p className="truncate p7 text-text-secondary">
              {serviceDef(s.service).label} · {n} {n === 1 ? "asset" : "assets"} · lead {s.lead}
            </p>
          </div>
        </div>
        <div className="min-w-0">
          {need ? (
            <>
              <p className="truncate p6 text-text-primary">{need.label}</p>
              <p className="p7 text-text-secondary">{WITH[need.owner]}</p>
            </>
          ) : (
            <p className="p6 text-text-tertiary">—</p>
          )}
        </div>
        <span>
          <Tag type="neutral" size="small">
            {status}
          </Tag>
        </span>
        <span className={cn("flex justify-end text-icon-dark transition-transform motion-reduce:transition-none", open && "rotate-180")}>
          <Icon name="chevron-down" size={16} />
        </span>
      </div>
      {open && (
        <div className="px-5 pb-4">
          <div className="rounded-md border border-border-light bg-white p-4">
            <p className="mb-2 s3 text-text-tertiary">Assets · {n}</p>
            <ul className="grid gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
              {s.projects.map((p) => (
                <li key={p.buildingId} className="flex items-center gap-2 p6 text-text-primary">
                  <Icon name="building" size={16} className="shrink-0 text-icon-default" />
                  <span className="truncate">{assetName(p.buildingId)}</span>
                </li>
              ))}
            </ul>
            {/* Actions sit inside the box, bottom right. */}
            <div className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-border-light pt-3">
              {inPlan && (
                <Button type="tertiary" onClick={onRemove}>
                  Remove from plan
                </Button>
              )}
              <Button type="secondary" icon="edit" onClick={onEdit}>
                Edit package
              </Button>
              <Button type="tertiary" icon="chevron-right" iconPosition="right" onClick={onOpen}>
                Open package
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** The plan's status, next to the title: what state it's in and the one thing to do next. */
function PlanCard({
  batch,
  packages,
  service,
  onAction,
}: {
  batch: Batch;
  packages: number;
  /** First package's service: its illustration once the plan is shared. */
  service?: Workstream["service"];
  onAction: (action: "share" | "agree" | "start") => void;
}) {
  const p = planCopy(batch);
  const blocked = p.action === "share" && packages === 0;
  return (
    <div
      className="relative ml-[30px] shrink-0 rounded-2xl border border-border-dark bg-bg-container py-[18px] pl-[84px] pr-5"
      style={{ minWidth: "min(100%, 420px)" }}
    >
      {/* Draft: the plan illustration in light grey (not started). Full grey stays for closed packages. */}
      <ServiceIcon
        service={batch.planState === "draft" || !service ? "indicative" : service}
        size={116}
        grayscale={batch.planState === "draft" || !service}
        className={cn(
          "pointer-events-none absolute left-[-30px] top-1/2 -translate-y-1/2",
          (batch.planState === "draft" || !service) && "opacity-55",
        )}
      />
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="p7 text-text-tertiary">Plan</p>
          <p className="h4 text-text-primary">{p.state}</p>
          <p className="mt-1 p7 text-text-secondary">{blocked ? "Add a package before you share the plan" : p.line}</p>
        </div>
        {!blocked && p.action && (
          <Button type="strong" size="large" icon="chevron-right" iconPosition="right" onClick={() => onAction(p.action!)}>
            {p.label}
          </Button>
        )}
      </div>
    </div>
  );
}

function planCopy(batch: Batch): {
  state: string;
  line: string;
  label?: string;
  action?: "share" | "agree" | "start";
} {
  if (batch.planState === "draft")
    return { state: "Draft", line: "Only Ops sees it", label: "Share plan", action: "share" };
  if (batch.planState === "proposed")
    return {
      state: "Shared",
      line: `With the customer since ${short(batch.planProposed)} · waiting for them to agree`,
      label: "Mark agreed",
      action: "agree",
    };
  if (batch.planState === "agreed")
    return { state: "Agreed", line: `By the customer on ${short(batch.planAgreed)}`, label: "Start packages", action: "start" };
  return { state: "Live", line: `Since ${short(batch.planLive || batch.planAgreed)}` };
}

