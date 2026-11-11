"use client";

import { type ReactNode } from "react";
import { checksFor, STATE_WORD, type AssetCheckBundle, type CheckDef, type CheckItemState } from "@/lib/concept/checks";
import { groupOf, type AssetGroup } from "@/lib/concept/opsAssetDerive";
import { short } from "@/lib/concept/derive";
import type { Workstream } from "@/lib/concept/model";
import { Tag } from "@/components/ds/tag";
import { cn } from "@/lib/utils";
import { Button, Icon, focusRing } from "../ui";
import { StateMark } from "./opsUi";

/** An item being edited still counts as what it was. */
const effective = (it?: CheckItemState): CheckItemState | undefined =>
  it?.state === "edit" ? it.prev ?? it : it;
const isIn = (it?: CheckItemState) => {
  const e = effective(it);
  return e?.state === "done" || e?.state === "na";
};

/** Only Blocked is coloured; Ready and In Estimate stay neutral so the blocked rows stand out. */
const STATUS: Record<AssetGroup, { label: string; tag: "danger" | "neutral" }> = {
  blocked: { label: "Blocked", tag: "danger" },
  ready: { label: "Ready", tag: "neutral" },
  started: { label: "In Estimate", tag: "neutral" },
};

function stateText(def: CheckDef, raw?: CheckItemState) {
  const it = effective(raw);
  if (!it) return "Not entered yet";
  if (it.state === "done") return [def.file ? "1 file" : it.value, it.source].filter(Boolean).join(" · ");
  if (it.state === "na") return "Not available";
  if (it.state === "confirm" && it.found) return `${it.found.value} to confirm · ${it.found.file}`;
  if (it.state === "disagree" && it.options) return `Files disagree · ${it.options.map((o) => o.value).join(" or ")}`;
  if (it.state === "nofile") return "No file yet";
  return "Not entered yet";
}

/** "n of total" on the first line, exactly what's missing on the second. */
function Tally({ defs, bundle, required }: { defs: CheckDef[]; bundle?: AssetCheckBundle; required: boolean }) {
  const missing = defs.filter((d) => !isIn(bundle?.items[d.key]));
  const have = defs.length - missing.length;
  return (
    <div className="min-w-0">
      <p className={cn("flex items-center gap-2", missing.length && required ? "h8 text-text-primary" : "p6 text-text-primary")}>
        <StateMark state={missing.length ? "open" : "done"} size={16} />
        {have} of {defs.length}
      </p>
      <p className="mt-0.5 p7 text-text-secondary">
        {missing.length
          ? missing
              .map((d) => {
                const st = effective(bundle?.items[d.key])?.state ?? "missing";
                return required ? `${d.short} · ${STATE_WORD[st] || st}` : d.short;
              })
              .join(", ")
          : "All in"}
      </p>
    </div>
  );
}

export type OpsAssetRow = {
  id: string;
  name: string;
  city?: string;
  bundle?: AssetCheckBundle;
  step: ReactNode;
};

const GRID = "16px minmax(0,1.2fr) 124px minmax(0,1.5fr) minmax(0,1.2fr) 108px 32px";

export function OpsAssetsTable({
  w,
  rows,
  count,
  aside,
  toolbar,
  selected,
  onSelectRow,
  expanded,
  onToggle,
  onFix,
  onEdit,
  onOpen,
  empty,
}: {
  w: Workstream;
  rows: OpsAssetRow[];
  count: number;
  aside?: ReactNode;
  toolbar?: ReactNode;
  selected: string[];
  onSelectRow: (id: string, on: boolean) => void;
  expanded: string[];
  onToggle: (id: string) => void;
  onFix: (id: string) => void;
  onEdit: (id: string) => void;
  onOpen: (id: string) => void;
  empty: string;
}) {
  const defs = checksFor(w.service, w.solution);
  const req = defs.filter((d) => d.required);
  const rec = defs.filter((d) => !d.required);
  return (
    <section className="overflow-hidden rounded-lg border border-border-dark bg-white" aria-label="Assets">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-light px-5 py-4">
        <h2 className="h7 text-text-primary">
          Assets <span className="h7 text-text-tertiary">{count}</span>
        </h2>
        {aside}
      </div>
      {toolbar && <div className="border-b border-border-light px-5 py-2">{toolbar}</div>}
      <div className="overflow-x-auto">
        <div className="min-w-[860px]">
          <div
            className="grid items-center gap-4 border-b border-border-light py-2 pl-5 pr-4"
            style={{ gridTemplateColumns: GRID }}
          >
            <span />
            {["Asset", "Status", "Required", "Recommended", "Blocked since"].map((t) => (
              <span key={t} className="s3 text-text-tertiary">
                {t}
              </span>
            ))}
            <span />
          </div>
          {rows.length === 0 && <p className="px-5 py-4 p6 text-text-tertiary">{empty}</p>}
          {rows.map((r) => {
            const group: AssetGroup = r.bundle ? groupOf(r.bundle, w.service, w.solution) : "ready";
            const st = STATUS[group];
            const open = expanded.includes(r.id);
            const on = selected.includes(r.id);
            const selectable = group !== "started";
            return (
              <div key={r.id} className={cn("border-b border-border-light last:border-b-0", open && "bg-black-1")}>
                <div
                  role="button"
                  tabIndex={0}
                  aria-expanded={open}
                  onClick={() => onToggle(r.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onToggle(r.id);
                    }
                  }}
                  className={cn(
                    "grid min-h-14 cursor-pointer items-center gap-4 py-3 pl-5 pr-4 outline-none hover:bg-black-1 focus-visible:shadow-[inset_0_0_0_2px_var(--black-7)]",
                    on && "bg-black-1",
                  )}
                  style={{ gridTemplateColumns: GRID }}
                >
                  {selectable ? (
                    <label className="flex cursor-pointer items-center" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        className="peer sr-only"
                        checked={on}
                        aria-label={`Select ${r.name}`}
                        onChange={(e) => onSelectRow(r.id, e.target.checked)}
                      />
                      <span className="flex size-4 items-center justify-center rounded-sm border border-border-dark bg-white peer-focus-visible:shadow-focus peer-checked:border-black-7 peer-checked:bg-black-7">
                        {on && <Icon name="check" size={12} className="text-white" />}
                      </span>
                    </label>
                  ) : (
                    <span />
                  )}
                  <div className="min-w-0">
                    <p className="h8 text-text-title">{r.name}</p>
                    {r.city && <p className="p7 text-text-tertiary">{r.city}</p>}
                  </div>
                  <span>
                    <Tag type={st.tag} size="small">
                      {st.label}
                    </Tag>
                  </span>
                  <Tally defs={req} bundle={r.bundle} required />
                  <Tally defs={rec} bundle={r.bundle} required={false} />
                  <span className="p6 text-text-secondary">
                    {group === "blocked" && r.bundle?.blockedSince ? short(r.bundle.blockedSince) : "—"}
                  </span>
                  <span className={cn("flex justify-end text-icon-dark transition-transform motion-reduce:transition-none", open && "rotate-180")}>
                    <Icon name="chevron-down" size={16} />
                  </span>
                </div>
                {open && (
                  <div className="pb-4 pl-[60px] pr-4">
                    <div className="grid gap-6 rounded-md border border-border-light bg-white p-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)_minmax(0,0.9fr)]">
                      {(
                        [
                          ["Required", req],
                          ["Recommended", rec],
                        ] as const
                      ).map(([label, list]) => (
                        <div key={label}>
                          <p className="mb-2 s3 text-text-tertiary">{label}</p>
                          <ul className="grid gap-2.5">
                            {list.map((d) => {
                              const it = r.bundle?.items[d.key];
                              const e = effective(it);
                              const done = e?.state === "done";
                              const na = e?.state === "na";
                              return (
                                <li key={d.key} className="grid grid-cols-[16px_minmax(0,1fr)] gap-x-2">
                                  <span className="mt-0.5">
                                    <StateMark state={done ? "done" : na ? "na" : "open"} size={16} />
                                  </span>
                                  <span className="h8 text-text-primary">{d.name}</span>
                                  <span
                                    className={cn(
                                      "col-start-2 p7",
                                      !done && !na && d.required ? "text-[var(--text-accent)]" : "text-text-secondary",
                                    )}
                                  >
                                    {stateText(d, it)}
                                  </span>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      ))}
                      <div>
                        <p className="mb-2 s3 text-text-tertiary">Files · {r.bundle?.files.length ?? 0}</p>
                        {r.bundle?.files.length ? (
                          <ul className="grid gap-2">
                            {r.bundle.files.map((f) => (
                              <li key={f.name} className="truncate p7 text-text-secondary">
                                {f.name}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="p7 text-text-secondary">No files yet</p>
                        )}
                      </div>
                      {/* Actions sit inside the box, bottom right. */}
                      <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border-light pt-3 md:col-span-3">
                        <Button type="tertiary" size="default" icon="chevron-right" iconPosition="right" onClick={() => onOpen(r.id)}>
                          Open asset page
                        </Button>
                        {group === "blocked" ? (
                          <Button type="primary" size="default" onClick={() => onFix(r.id)}>
                            Fix this asset
                          </Button>
                        ) : (
                          <Button type="secondary" size="default" icon="edit" onClick={() => onEdit(r.id)}>
                            Edit data
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
