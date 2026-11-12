"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import * as Tabs from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";
import { Tag } from "@/components/ds/tag";
import type { Building } from "@/lib/concept/model";
import {
  Banner,
  Button,
  FilterSearch,
  Icon,
  IconButton,
  UploadRow,
  tabListClass,
  tabTriggerClass,
} from "./ui";
import { hrefs } from "./hrefs";
import { useConcept } from "./store";
import { fieldClass, fieldInputClass, labelClass } from "./ops-shared";

/**
 * New batch as a full-screen workspace (same frame as Fix assets):
 * find assets on the left, the batch itself on the right, Create batch in the top bar.
 * With ?batch=<id> it edits that batch's assets instead.
 */

type Source = "search" | "files" | "manual";

type BatchFile = {
  id: string;
  label: string;
  fromCustomer: boolean;
  fileCount?: number;
  state: "reading" | "ready";
  buildingIds: string[];
};

const COUNTRIES = [
  { code: "GB", label: "United Kingdom" },
  { code: "DE", label: "Germany" },
  { code: "FR", label: "France" },
  { code: "NL", label: "Netherlands" },
  { code: "BE", label: "Belgium" },
  { code: "IE", label: "Ireland" },
] as const;

function matches(b: Building, query: string) {
  const hay = `${b.name} ${b.city} ${b.address ?? ""} ${b.postcode ?? ""} ${b.type ?? ""}`.toLowerCase();
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 1)
    .every((w) => hay.includes(w));
}

const placeOf = (b: Building) => [b.address, [b.postcode, b.city].filter(Boolean).join(" ")].filter(Boolean).join(", ");

function Check({ on }: { on: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-4 shrink-0 items-center justify-center rounded-sm border bg-white",
        on ? "border-black-7 bg-black-7" : "border-border-dark",
      )}
    >
      {on && <Icon name="check" size={12} className="text-white" />}
    </span>
  );
}

/** Selectable list of assets: whole row toggles, "Select all" in the header. */
function AssetPicker({
  hits,
  picked,
  onToggle,
  onAll,
  empty,
}: {
  hits: Building[];
  picked: Record<string, Source>;
  onToggle: (id: string) => void;
  onAll: (on: boolean) => void;
  empty: string;
}) {
  const inCount = hits.filter((b) => picked[b.id]).length;
  const all = hits.length > 0 && inCount === hits.length;
  return (
    <div className="overflow-hidden rounded-md border border-border-dark bg-white">
      <div className="flex items-center justify-between gap-3 border-b border-border-light px-4 py-2">
        <span className="s3 text-text-tertiary">
          {hits.length} {hits.length === 1 ? "asset" : "assets"}
          {inCount > 0 && ` · ${inCount} in the batch`}
        </span>
        {hits.length > 0 && (
          <Button type="link" onClick={() => onAll(!all)}>
            {all ? "Remove all" : `Add all ${hits.length}`}
          </Button>
        )}
      </div>
      {hits.length === 0 ? (
        <p className="px-4 py-4 p6 text-text-secondary">{empty}</p>
      ) : (
        <ul className="max-h-[min(56vh,520px)] overflow-y-auto">
          {hits.map((b) => {
            const on = Boolean(picked[b.id]);
            return (
              <li key={b.id} className="border-b border-border-light last:border-b-0">
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={on}
                  onClick={() => onToggle(b.id)}
                  className={cn(
                    "grid min-h-14 w-full grid-cols-[16px_minmax(0,1fr)_auto] items-center gap-3 px-4 py-2.5 text-left outline-none hover:bg-black-1 focus-visible:shadow-[inset_0_0_0_2px_var(--black-7)]",
                    on && "bg-black-1",
                  )}
                >
                  <Check on={on} />
                  <span className="min-w-0">
                    <span className="block truncate h8 text-text-title">{b.name}</span>
                    <span className="block truncate p7 text-text-secondary">{placeOf(b) || b.city}</span>
                  </span>
                  <span className="p7 text-text-tertiary">{b.type}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function OpsNewBatch() {
  const { account, createBatch, addBuilding, updateBatch } = useConcept();
  const router = useRouter();
  const params = useSearchParams();
  const existing = account.batches.find((b) => b.id === params.get("batch"));

  const [tab, setTab] = useState<Source>("search");
  const [query, setQuery] = useState("");
  const [fileId, setFileId] = useState("");
  const [picked, setPicked] = useState<Record<string, Source>>(() =>
    Object.fromEntries((existing?.buildingIds ?? []).map((id) => [id, "search" as Source])),
  );
  const [name, setName] = useState(existing?.name ?? "");
  const [goal, setGoal] = useState(existing?.goal ?? "");
  const [manual, setManual] = useState({
    name: "",
    address: "",
    city: "",
    postcode: "",
    country: "GB",
    type: "",
  });
  const [added, setAdded] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploaded, setUploaded] = useState<BatchFile[]>([]);

  const customerFiles: BatchFile[] = account.batches
    .filter((b) => b.filesSummary)
    .map((b) => ({
      id: b.id,
      label: b.filesSummary!,
      fromCustomer: true,
      fileCount: b.filesCount,
      state: "ready" as const,
      buildingIds: b.buildingIds,
    }));
  const files = [...customerFiles, ...uploaded];
  const chosen = account.buildings.filter((b) => picked[b.id]);
  const searchHits = useMemo(() => {
    const q = query.trim();
    return q ? account.buildings.filter((b) => matches(b, q)) : account.buildings;
  }, [account.buildings, query]);
  const file = files.find((f) => f.id === fileId);
  const fileHits = file ? account.buildings.filter((b) => file.buildingIds.includes(b.id)) : [];

  const startIds = existing?.buildingIds ?? [];
  const dirty = existing
    ? chosen.length !== startIds.length || chosen.some((b) => !startIds.includes(b.id))
    : chosen.length > 0 || Boolean(name.trim() || goal.trim());

  const toggle = (id: string, source: Source) =>
    setPicked((cur) => {
      const next = { ...cur };
      if (next[id]) delete next[id];
      else next[id] = source;
      return next;
    });
  const setMany = (ids: string[], source: Source, on: boolean) =>
    setPicked((cur) => {
      const next = { ...cur };
      for (const id of ids) {
        if (on) next[id] = next[id] ?? source;
        else delete next[id];
      }
      return next;
    });

  const missing = !chosen.length ? "Add at least one asset" : !existing && !name.trim() ? "Give the batch a name" : "";

  const leave = () => router.push(existing ? hrefs.opsBatch(existing.id) : hrefs.ops);
  const tryClose = () => {
    if (dirty) setConfirming(true);
    else leave();
  };
  const closeRef = useRef(tryClose);
  closeRef.current = tryClose;
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeRef.current();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  const submit = () => {
    if (missing) return;
    setError(null);
    const ids = chosen.map((b) => b.id);
    try {
      if (existing) {
        updateBatch(existing.id, { buildingIds: ids });
        router.push(hrefs.opsBatch(existing.id));
        return;
      }
      const id = createBatch({
        name: name.trim(),
        goal: goal.trim(),
        buildingIds: ids,
        route: [],
      });
      if (!id) throw new Error("Could not create the batch");
      router.push(hrefs.opsBatch(id));
    } catch {
      setError("We couldn't save the batch. Try again.");
    }
  };

  const mockUpload = () => {
    const id = `upload-${Date.now()}`;
    const sample = account.buildings.slice(0, 6).map((b) => b.id);
    setUploaded((cur) => [
      ...cur,
      {
        id,
        label: "Site_list.xlsx",
        fromCustomer: false,
        state: "reading",
        buildingIds: [],
      },
    ]);
    setFileId(id);
    window.setTimeout(() => {
      setUploaded((cur) =>
        cur.map((f) =>
          f.id === id
            ? { ...f, state: "ready", buildingIds: sample }
            : f,
        ),
      );
    }, 1400);
  };

  const addManual = () => {
    if (!manual.name.trim() || !manual.city.trim()) return;
    const n = manual.name.trim();
    const id = addBuilding({
      name: n,
      city: manual.city.trim(),
      address: manual.address.trim() || undefined,
      postcode: manual.postcode.trim() || undefined,
      country: manual.country || undefined,
      type: manual.type.trim() || undefined,
    });
    setPicked((cur) => ({ ...cur, [id]: "manual" }));
    setManual({
      name: "",
      address: "",
      city: "",
      postcode: "",
      country: "GB",
      type: "",
    });
    setAdded(n);
  };

  const title = existing ? `Assets in ${existing.name}` : "New batch";
  const subtitle = existing
    ? `${chosen.length} ${chosen.length === 1 ? "asset" : "assets"}`
    : `${account.customer} · only Ops sees it until you share the plan`;

  return (
    <div
      role="dialog"
      aria-modal
      aria-label={title}
      className="fixed inset-0 z-50 grid grid-rows-[auto_minmax(0,1fr)] bg-white"
    >
      <header className="flex flex-col gap-2 border-b border-border-dark px-4 py-2 sm:min-h-16 sm:flex-row sm:items-center sm:gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <IconButton icon="cross" label="Close" onClick={tryClose} />
          <div className="min-w-0">
            <h2 className="h6 text-text-primary">{title}</h2>
            <p className="truncate p7 text-text-secondary">{subtitle}</p>
          </div>
        </div>
        {confirming ? (
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
            <p className="p6 text-text-primary max-sm:order-first">
              {existing ? "Close without saving the assets?" : "Close without creating the batch?"}
            </p>
            <Button type="secondary" onClick={() => setConfirming(false)}>
              Keep editing
            </Button>
            <Button type="secondary" onClick={leave}>
              {existing ? "Close without saving" : "Close without creating"}
            </Button>
          </div>
        ) : (
          <div className="flex w-full items-center justify-end gap-3 sm:w-auto">
            {missing && (
              <p className="hidden items-center gap-1.5 p7 text-text-secondary md:flex">
                <Icon name="info" size={16} className="text-icon-default" />
                {missing}
              </p>
            )}
            <Button type="primary" size="large" disabled={Boolean(missing)} onClick={submit}>
              {existing ? "Save assets" : "Create batch"}
            </Button>
          </div>
        )}
      </header>

      {error && (
        <div className="border-b border-border-light px-4 py-2">
          <Banner type="danger" title={error}>
            Check the name and assets, then try again.
          </Banner>
        </div>
      )}

      <div className="grid min-h-0 min-[1024px]:grid-cols-[minmax(0,1fr)_380px]">
        <main className="min-h-0 overflow-y-auto px-4 py-6 sm:px-8">
          <div className="max-w-[880px]">
            <h3 className="h7 text-text-primary">Find assets</h3>
            <p className="mt-1 p6 text-text-secondary">
              Search the customer&apos;s assets, find them in the files they sent, or add one that isn&apos;t in CQuel yet.
            </p>
            <Tabs.Root value={tab} onValueChange={(v) => setTab(v as Source)} className="mt-5">
              <Tabs.List className={tabListClass} aria-label="Ways to find assets">
                {(
                  [
                    ["search", "Search"],
                    ["files", "From files"],
                    ["manual", "Add manually"],
                  ] as const
                ).map(([id, label]) => (
                  <Tabs.Trigger key={id} value={id} className={tabTriggerClass}>
                    {label}
                  </Tabs.Trigger>
                ))}
              </Tabs.List>

              <Tabs.Content value="search" className="space-y-3 outline-none">
                <FilterSearch value={query} onChange={setQuery} placeholder="Name, address or postcode" />
                <AssetPicker
                  hits={searchHits}
                  picked={picked}
                  onToggle={(id) => toggle(id, "search")}
                  onAll={(on) => setMany(searchHits.map((b) => b.id), "search", on)}
                  empty={`No assets match “${query.trim()}”. Add it manually if it isn't in CQuel yet.`}
                />
              </Tabs.Content>

              <Tabs.Content value="files" className="space-y-3 outline-none">
                <UploadRow
                  title="Drop a site list or plans here"
                  detail="We find the assets in them. You check before they're added."
                  buttonLabel="Upload files"
                  onUpload={mockUpload}
                />
                {files.length === 0 ? (
                  <p className="p6 text-text-secondary">No files from the customer yet.</p>
                ) : (
                  <ul className="overflow-hidden rounded-md border border-border-dark bg-white">
                    {files.map((f) => {
                      const on = f.id === fileId;
                      const meta = f.fromCustomer
                        ? `${f.fileCount ?? 0} files from the customer · ${f.buildingIds.length} assets found`
                        : f.state === "reading"
                          ? "Reading…"
                          : `Uploaded now · ${f.buildingIds.length} assets found`;
                      return (
                        <li key={f.id} className="border-b border-border-light last:border-b-0">
                          <button
                            type="button"
                            aria-expanded={on}
                            disabled={f.state === "reading"}
                            onClick={() => setFileId(on ? "" : f.id)}
                            className={cn(
                              "flex min-h-14 w-full items-center gap-3 px-4 py-2.5 text-left outline-none hover:bg-black-1 focus-visible:shadow-[inset_0_0_0_2px_var(--black-7)] disabled:opacity-70",
                              on && "bg-black-1",
                            )}
                          >
                            <Icon name="document" size={20} className="shrink-0 text-icon-default" />
                            <span className="min-w-0 flex-1">
                              <span className="block h8 text-text-title">{f.label}</span>
                              <span className="block p7 text-text-secondary">{meta}</span>
                            </span>
                            {f.state === "reading" ? (
                              <span className="p7 text-text-tertiary" aria-live="polite">
                                Reading…
                              </span>
                            ) : (
                              <Icon
                                name={on ? "chevron-up" : "chevron-down"}
                                size={16}
                                className="text-icon-dark"
                              />
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
                {file && file.state === "ready" && (
                  <>
                    <p className="p7 text-text-secondary">
                      Found in {file.label}. Check them before adding.
                    </p>
                    <AssetPicker
                      hits={fileHits}
                      picked={picked}
                      onToggle={(id) => toggle(id, "files")}
                      onAll={(on) => setMany(fileHits.map((b) => b.id), "files", on)}
                      empty="No assets found in this file."
                    />
                  </>
                )}
              </Tabs.Content>

              <Tabs.Content value="manual" className="outline-none">
                <form
                  className="grid gap-4 rounded-md border border-border-dark bg-white p-4 sm:grid-cols-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    addManual();
                  }}
                >
                  <p className="p6 text-text-secondary sm:col-span-2">For an asset that isn&apos;t in CQuel yet.</p>
                  <label className="block sm:col-span-2">
                    <span className={labelClass}>Name</span>
                    <input
                      className={cn(fieldClass, fieldInputClass)}
                      value={manual.name}
                      onChange={(e) => {
                        setManual((cur) => ({ ...cur, name: e.target.value }));
                        setAdded("");
                      }}
                    />
                  </label>
                  <label className="block">
                    <span className={labelClass}>Address</span>
                    <input
                      className={cn(fieldClass, fieldInputClass)}
                      value={manual.address}
                      onChange={(e) => {
                        setManual((cur) => ({ ...cur, address: e.target.value }));
                        setAdded("");
                      }}
                    />
                  </label>
                  <label className="block">
                    <span className={labelClass}>Postcode</span>
                    <input
                      className={cn(fieldClass, fieldInputClass)}
                      value={manual.postcode}
                      onChange={(e) => {
                        setManual((cur) => ({ ...cur, postcode: e.target.value }));
                        setAdded("");
                      }}
                    />
                  </label>
                  <label className="block">
                    <span className={labelClass}>City</span>
                    <input
                      className={cn(fieldClass, fieldInputClass)}
                      value={manual.city}
                      onChange={(e) => {
                        setManual((cur) => ({ ...cur, city: e.target.value }));
                        setAdded("");
                      }}
                    />
                  </label>
                  <label className="block">
                    <span className={labelClass}>Country</span>
                    <select
                      className={cn(fieldClass, fieldInputClass)}
                      value={manual.country}
                      onChange={(e) => {
                        setManual((cur) => ({ ...cur, country: e.target.value }));
                        setAdded("");
                      }}
                    >
                      {COUNTRIES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block sm:col-span-2 sm:col-start-1">
                    <span className={labelClass}>Asset type (optional)</span>
                    <input
                      className={cn(fieldClass, fieldInputClass)}
                      value={manual.type}
                      placeholder="E.g. Hotel, Office, Warehouse"
                      onChange={(e) => {
                        setManual((cur) => ({ ...cur, type: e.target.value }));
                        setAdded("");
                      }}
                    />
                  </label>
                  <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border-light pt-4 sm:col-span-2">
                    {added && (
                      <p className="mr-auto flex items-center gap-1.5 p7 text-text-secondary" role="status">
                        <Icon name="check" size={16} className="text-icon-dark" />
                        {added} is in the batch
                      </p>
                    )}
                    {!added && (!manual.name.trim() || !manual.city.trim()) && (
                      <p className="mr-auto p7 text-text-tertiary">Name and city are needed</p>
                    )}
                    <Button type="secondary" icon="plus" disabled={!manual.name.trim() || !manual.city.trim()} onClick={addManual}>
                      Add asset
                    </Button>
                  </div>
                </form>
              </Tabs.Content>
            </Tabs.Root>
          </div>
        </main>

        <aside
          aria-label="This batch"
          className="flex min-h-0 flex-col border-t border-border-dark bg-black-1 min-[1024px]:border-l min-[1024px]:border-t-0"
        >
          <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto p-5">
            {!existing && (
              <div className="space-y-4">
                <p className="h7 text-text-primary">This batch</p>
                <label className="block">
                  <span className={labelClass}>Name</span>
                  <input
                    className={cn(fieldClass, fieldInputClass)}
                    value={name}
                    placeholder="E.g. Birmingham hotels"
                    onChange={(e) => setName(e.target.value)}
                  />
                </label>
                <label className="block">
                  <span className={labelClass}>Goal (optional)</span>
                  <textarea
                    className={fieldClass}
                    rows={3}
                    value={goal}
                    placeholder="E.g. Cut carbon by 60% by 2030, starting with the shortest payback"
                    onChange={(e) => setGoal(e.target.value)}
                  />
                  <span className="mt-1 block p7 text-text-secondary">In the customer&apos;s words. It shows at the top of the batch.</span>
                </label>
              </div>
            )}

            <div className="flex min-h-0 flex-col">
              <div className="mb-2 flex items-center gap-2">
                <p className="flex-1 h7 text-text-primary">Assets</p>
                <span className="inline-flex h-6 items-center rounded-full border border-border-dark bg-white px-2 h9 text-text-title">
                  {chosen.length} {chosen.length === 1 ? "asset" : "assets"}
                </span>
              </div>
              {chosen.length === 0 ? (
                <p className="rounded-md border-[1.5px] border-dashed border-black-3 bg-white px-4 py-5 text-center p7 text-text-secondary">
                  No assets yet. Pick them on the left.
                </p>
              ) : (
                <ul className="rounded-md border border-border-light bg-white px-3">
                  {chosen.map((b, i) => (
                    <li
                      key={b.id}
                      className={cn("flex items-center gap-2 py-2.5", i > 0 && "border-t border-border-light")}
                    >
                      <Icon name="building" size={16} className="shrink-0 self-start mt-0.5 text-icon-default" />
                      <div className="min-w-0 flex-1">
                        <p className="flex items-center gap-1.5">
                          <span className="truncate h8 text-text-title">{b.name}</span>
                          {picked[b.id] === "manual" && (
                            <Tag type="neutral" size="xsmall">
                              New
                            </Tag>
                          )}
                        </p>
                        <p className="truncate p7 text-text-secondary">{placeOf(b) || b.city}</p>
                      </div>
                      <IconButton icon="cross" size="small" label={`Remove ${b.name}`} onClick={() => toggle(b.id, "search")} />
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {!existing && (
              <p className="p7 text-text-secondary">
                Next, on the batch page: add packages. Each runs services for one solution on some of these assets.
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

