"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  checksFor,
  type AssetCheckBundle,
  type CheckDef,
  type CheckItemState,
} from "@/lib/concept/checks";
import {
  applyNotAvailable,
  applySaveValue,
  applyUndoNa,
  applyUseFound,
  setCheckEdit,
} from "@/lib/concept/opsMutations";
import {
  blockingCell,
  blockingItem,
  groupOf,
  recommendedMissing,
  stepLabel,
} from "@/lib/concept/opsAssetDerive";
import { opsItemSubline } from "@/lib/concept/opsDisplay";
import { short } from "@/lib/concept/derive";
import { getBuilding } from "@/lib/concept/derive";
import { fixAssetsAction } from "@/lib/concept/words";
import type { Account, Workstream } from "@/lib/concept/model";
import { service as serviceDef } from "@/lib/concept/model";
import { cn } from "@/lib/utils";
import { Button, Dropdown, Icon, IconButton, focusRing } from "../ui";
import { hrefs } from "../hrefs";
import {
  AssetFileList,
  FoundValue,
  OpsModal,
  RequirementGroup,
  StateMark,
  UploadRow,
} from "./opsUi";

type Mode = "fix" | "edit";

/** Text input in the DS look: 36 high, unit inside on the right. */
const inputClass =
  "h-10 w-full rounded-md border border-border-dark bg-white px-3 p6 font-sans text-text-primary outline-none placeholder:text-text-tertiary focus:border-black-7 focus:shadow-[inset_0_0_0_1px_var(--black-7)]";

function ValueInput({
  value,
  onChange,
  unit,
  placeholder,
  ariaLabel,
  width,
}: {
  value: string;
  onChange: (v: string) => void;
  unit?: string;
  placeholder?: string;
  ariaLabel: string;
  width: number;
}) {
  return (
    <span className="relative inline-block" style={{ width }}>
      <input
        className={cn(inputClass, unit && "pr-10")}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
      />
      {unit && (
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 p6 text-text-tertiary">
          {unit}
        </span>
      )}
    </span>
  );
}

const bare = (v?: string) => (v ?? "").replace(/\s*m²\s*$/i, "").trim();

/** An item being edited still counts as done until Save or Cancel. */
function isEditing(item: CheckItemState) {
  return item.state === "edit" && item.prev?.state === "done";
}

function RequirementActions({
  def,
  item,
  bundle,
  w,
  buildingId,
  patch,
  onUpload,
  onView,
}: {
  def: CheckDef;
  item: CheckItemState;
  bundle: AssetCheckBundle;
  w: Workstream;
  buildingId: string;
  patch: (fn: (b: AssetCheckBundle) => void) => void;
  onUpload: (key: CheckDef["key"]) => void;
  onView: (doc: PreviewDoc) => void;
}) {
  const st = item.state;
  const [draft, setDraft] = useState(
    st === "edit" ? bare(item.prev?.value ?? item.value) : "",
  );
  const sources = useMemo(() => {
    const current = item.prev?.source ?? item.source;
    const list = [current, ...bundle.files.map((f) => f.name), "Typed"].filter(
      (x): x is string => Boolean(x),
    );
    return Array.from(new Set(list));
  }, [bundle.files, item.prev?.source, item.source]);
  const [source, setSource] = useState(sources[0] ?? "Typed");

  if (st === "confirm" && item.found) {
    const f = item.found;
    return (
      <FoundValue {...f} onView={() => onView({ file: f.file, page: Number(f.page ?? 1), quote: f.quote, value: f.value })}>
        <Button type="secondary" size="default" onClick={() => patch((b) => applyUseFound(b, def, f))}>
          Use {f.value}
        </Button>
        <Button type="secondary" size="default" onClick={() => patch((b) => setCheckEdit(b, def.key, true))}>
          Enter another
        </Button>
      </FoundValue>
    );
  }

  if (st === "disagree" && item.options) {
    return (
      <div className="space-y-2">
        {item.options.map((opt) => (
          <FoundValue
            key={opt.file}
            value={opt.value}
            file={opt.file}
            page={opt.page}
            quote={opt.quote}
            onView={() => onView({ file: opt.file, page: Number(opt.page ?? 1), quote: opt.quote, value: opt.value })}
          >
            <Button type="secondary" size="default" onClick={() => patch((b) => applyUseFound(b, def, opt))}>
              Use {opt.value}
            </Button>
          </FoundValue>
        ))}
        <Button type="secondary" size="default" onClick={() => patch((b) => setCheckEdit(b, def.key, true))}>
          Another value
        </Button>
      </div>
    );
  }

  if (st === "edit") {
    const editingDone = isEditing(item);
    const shown = draft.trim();
    const save = () => {
      if (!shown) return;
      patch((b) => {
        const prior = b.items[def.key].prev;
        // applySaveValue compares with the item it replaces: give it the old value.
        if (prior) b.items[def.key] = prior;
        applySaveValue(b, def, shown, source, w, buildingId);
      });
    };
    const cancel = () => patch((b) => setCheckEdit(b, def.key, false));
    return (
      <div className="space-y-3 rounded-md border border-border-dark bg-black-1 p-4">
        <div className="flex flex-wrap items-end gap-3">
          <label className="block">
            <span className="mb-1 block h9 text-text-secondary">Value</span>
            <ValueInput
              value={draft}
              onChange={setDraft}
              unit={def.unit}
              placeholder={def.placeholder}
              ariaLabel={def.name}
              width={def.unit ? 160 : 260}
            />
          </label>
          {editingDone && (
            <div className="min-w-[220px] flex-1">
              <span className="mb-1 block h9 text-text-secondary">Source</span>
              <Dropdown
                ariaLabel="Source"
                value={source}
                onValueChange={setSource}
                options={sources.map((x) => ({ value: x, label: x }))}
              />
            </div>
          )}
        </div>
        {editingDone && item.prev?.value && (
          <p className="p7 text-text-secondary">
            Was {item.prev.value}
            {item.prev.source ? ` · from ${item.prev.source}` : ""}
          </p>
        )}
        {editingDone && bundle.estimateStartedOn && def.key === "roof" && (
          <div className="flex gap-3 rounded-md border border-status-warning-border bg-status-warning-bg px-4 py-3">
            <Icon name="info" size={16} className="mt-0.5 shrink-0 text-status-warning-text" />
            <div>
              <p className="h8 text-text-primary">This asset&apos;s estimate has started</p>
              <p className="mt-0.5 p7 text-text-secondary">
                It used {item.prev?.value}. After saving, its Estimate step shows
                &ldquo;Roof area changed · check the estimate&rdquo;.
              </p>
            </div>
          </div>
        )}
        <div className="flex flex-wrap items-center gap-2">
          <Button type="secondary" size="large" onClick={cancel}>
            Cancel
          </Button>
          <Button type="primary" size="large" onClick={save} disabled={!shown}>
            {shown ? `Save ${shown}${def.unit ? ` ${def.unit}` : ""}` : "Save"}
          </Button>
        </div>
      </div>
    );
  }

  if (st === "nofile") {
    return (
      <>
        <Button type="secondary" size="default" icon="upload" onClick={() => onUpload(def.key)}>
          {def.uploadLabel ?? "Upload"}
        </Button>
        {!def.required && (
          <Button type="secondary" size="default" onClick={() => patch((b) => applyNotAvailable(b, def))}>
            Not available
          </Button>
        )}
      </>
    );
  }

  if (st === "missing") {
    return (
      <>
        <ValueInput
          value={draft}
          onChange={setDraft}
          unit={def.unit}
          placeholder={def.placeholder ?? "Value"}
          ariaLabel={def.name}
          width={260}
        />
        <Button
          type="secondary"
          size="default"
          disabled={!draft.trim()}
          onClick={() => patch((b) => applySaveValue(b, def, draft.trim(), "Typed", w, buildingId))}
        >
          Save
        </Button>
      </>
    );
  }

  if (st === "na") {
    return (
      <Button type="tertiary" size="default" onClick={() => patch((b) => applyUndoNa(b, def))}>
        Undo
      </Button>
    );
  }

  if (st === "done") {
    return (
      <Button type="tertiary" size="default" icon="edit" onClick={() => patch((b) => setCheckEdit(b, def.key, true))}>
        Edit
      </Button>
    );
  }

  return null;
}

function ItemRow({
  def,
  bundle,
  w,
  buildingId,
  patch,
  onUpload,
  onView,
}: {
  def: CheckDef;
  bundle: AssetCheckBundle;
  w: Workstream;
  buildingId: string;
  patch: (fn: (b: AssetCheckBundle) => void) => void;
  onUpload: (key: CheckDef["key"]) => void;
  onView: (doc: PreviewDoc) => void;
}) {
  const item = bundle.items[def.key] ?? { state: "missing" as const };
  const st = item.state;
  const mark =
    st === "done" || isEditing(item) ? "done" : st === "na" ? "na" : "open";
  const below = st === "confirm" || st === "disagree" || st === "edit";
  const line =
    st === "done"
      ? [def.file ? "1 file" : item.value, item.source].filter(Boolean).join(" · ")
      : st === "na"
        ? "Not available"
        : st === "disagree"
          ? "The files disagree. Choose one, or enter another value."
          : st === "nofile" || st === "missing"
            ? def.hint
            : undefined;
  const actions = (
    <RequirementActions
      key={`${def.key}-${st}`}
      def={def}
      item={item}
      bundle={bundle}
      w={w}
      buildingId={buildingId}
      patch={patch}
      onUpload={onUpload}
      onView={onView}
    />
  );
  return (
    <div className="grid grid-cols-[20px_minmax(0,1fr)_auto] items-start gap-x-4 py-4">
      <span className="pt-px">
        <StateMark state={mark} size={20} />
      </span>
      <div className="min-w-0">
        <p className={cn("h8", st === "na" ? "text-text-tertiary" : "text-text-primary")}>{def.name}</p>
        {line && <p className="mt-0.5 p7 text-text-secondary">{line}</p>}
      </div>
      <div className="flex flex-wrap items-center justify-end gap-2">
        {!below && actions}
      </div>
      {below && <div className="col-start-2 col-end-4 mt-3">{actions}</div>}
    </div>
  );
}

type PreviewDoc = { file: string; page: number; quote?: string; value?: string };

const DOC_KIND: Array<[RegExp, string, number]> = [
  [/dach|roof|aufmass/i, "Roof plan", 3],
  [/lageplan|plans|site|grundriss/i, "Site plan", 2],
  [/strom|bill|rechnung/i, "Electricity bill", 2],
  [/img|jpg|photo/i, "Site photo", 1],
];
const kindOf = (name: string): [string, number] => {
  const k = DOC_KIND.find(([re]) => re.test(name));
  return k ? [k[1], k[2]] : ["Document", 1];
};

/** Mock preview of a file: a drawn page with the words we read highlighted. */
function DocPreview({ doc, onBack, onClose }: { doc: PreviewDoc; onBack: () => void; onClose: () => void }) {
  const [kind, pages] = kindOf(doc.file);
  const [page, setPage] = useState(Math.min(doc.page, pages));
  const hit = Boolean(doc.quote) && page === doc.page;
  const bars = [92, 78, 85, 60, 88, 70, 95, 54];
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center gap-1 border-b border-border-light bg-white py-3 pl-2 pr-3">
        <IconButton icon="arrow-left" label="All documents" onClick={onBack} />
        <div className="min-w-0 flex-1">
          <p className="truncate h8 text-text-primary">{doc.file}</p>
          <p className="p7 text-text-secondary">
            {kind} · page {page} of {pages}
          </p>
        </div>
        <IconButton icon="chevron-left" label="Previous page" disabled={page <= 1} onClick={() => setPage(page - 1)} />
        <IconButton icon="chevron-right" label="Next page" disabled={page >= pages} onClick={() => setPage(page + 1)} />
        <span className="ws-only-narrow">
          <IconButton icon="cross" label="Close documents" onClick={onClose} />
        </span>
      </div>
      {doc.quote && (
        <div
          className={cn(
            "flex flex-wrap items-center gap-2 border-b px-4 py-2 p7",
            hit
              ? "border-status-warning-border bg-status-warning-bg text-text-primary"
              : "border-border-light bg-white text-text-secondary",
          )}
        >
          {hit ? (
            <>Highlighted: what we read{doc.value ? ` (${doc.value})` : ""}</>
          ) : (
            <>
              The value is on page {doc.page}.
              <button type="button" className={cn("underline underline-offset-[3px]", focusRing)} onClick={() => setPage(doc.page)}>
                Go to page {doc.page}
              </button>
            </>
          )}
        </div>
      )}
      <div className="min-h-0 flex-1 overflow-auto p-4">
        <div className="mx-auto flex aspect-[1/1.414] max-w-[520px] flex-col gap-2.5 overflow-hidden rounded border border-border-dark bg-white px-[9%] py-[8%] shadow-sm">
          <p className="text-[13px] font-semibold text-text-title">{doc.file.replace(/\.[a-z]+$/i, "").replace(/_/g, " ")}</p>
          <p className="-mt-1.5 mb-1.5 text-[10px] text-text-tertiary">
            Page {page} / {pages}
          </p>
          {kind === "Roof plan" && (
            <svg viewBox="0 0 300 170" className="mb-2 h-auto w-full text-black-5" aria-hidden>
              <rect x="30" y="20" width="220" height="120" fill="none" stroke="currentColor" strokeWidth="1.5" />
              <rect x="50" y="38" width="180" height="84" fill="none" stroke="currentColor" strokeDasharray="4 3" />
              <line x1="30" y1="155" x2="250" y2="155" stroke="currentColor" />
              <text x="140" y="166" fontSize="9" textAnchor="middle" fill="currentColor">
                {page === 1 ? "32,0 m" : "28,5 m"}
              </text>
              <text x="140" y="84" fontSize="9" textAnchor="middle" fill="currentColor">
                Dachfläche
              </text>
            </svg>
          )}
          {bars.slice(0, 3).map((wd, i) => (
            <div key={`a${i}`} className="h-1.5 rounded bg-black-2" style={{ width: `${wd}%` }} />
          ))}
          {hit ? (
            <p className="my-1 rounded-sm bg-status-warning-bg px-1.5 py-1 text-[12px] text-text-primary outline outline-2 outline-status-warning-mark">
              {doc.quote}
            </p>
          ) : (
            <div className="h-1.5 w-[80%] rounded bg-black-2" />
          )}
          {bars.slice(3).map((wd, i) => (
            <div key={`b${i}`} className="h-1.5 rounded bg-black-2" style={{ width: `${wd}%` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function AssetWindow({
  open,
  mode,
  w,
  account,
  assetId,
  assetIds,
  onSelectAsset,
  onClose,
  onDone,
  dirty,
  onCloseAttempt,
  showAll,
  onPatch,
}: {
  open: boolean;
  mode: Mode;
  w: Workstream;
  account: Account;
  assetId: string;
  assetIds: string[];
  onSelectAsset: (id: string) => void;
  onClose: () => void;
  onDone: () => void;
  dirty: boolean;
  onCloseAttempt: () => boolean;
  showAll?: () => void;
  onPatch: (fn: (b: AssetCheckBundle) => void) => void;
}) {
  const bundle = account.opsAssetData?.[w.id]?.[assetId];
  const building = getBuilding(account, assetId);
  const defs = checksFor(w.service, w.solution);
  const patch = onPatch;
  const [doc, setDoc] = useState<PreviewDoc | null>(null);
  const [docsOpen, setDocsOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const showDoc = (d: PreviewDoc) => {
    setDoc(d);
    setDocsOpen(true);
  };
  useEffect(() => {
    setDoc(null);
    setDocsOpen(false);
  }, [assetId]);

  const blocking = defs.filter((d) => d.required);
  const recommended = defs.filter((d) => !d.required);
  const openBlocking = blocking.filter((d) => {
    const it = bundle?.items[d.key];
    if (!it) return true;
    if (it.state === "edit") return it.prev?.state !== "done";
    return it.state !== "done" && it.state !== "na";
  });
  const openRec = bundle
    ? recommendedMissing(bundle, w.service, w.solution)
    : [];

  // The window works on the assets that were blocked when it opened.
  // Fixed ones move to Done; assets that were already ready never show here.
  const [opened, setOpened] = useState<string[]>([]);
  useEffect(() => {
    if (!open) return;
    setOpened(
      assetIds.filter((id) => {
        const b = account.opsAssetData?.[w.id]?.[id];
        return b && groupOf(b, w.service, w.solution) === "blocked";
      }),
    );
    // only when the window opens
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  const groups = useMemo(() => {
    const todo: typeof assetIds = [];
    const done: typeof assetIds = [];
    for (const id of mode === "fix" ? opened : assetIds) {
      const b = account.opsAssetData?.[w.id]?.[id];
      if (!b) continue;
      if (groupOf(b, w.service, w.solution) === "blocked") todo.push(id);
      else if (mode === "fix") done.push(id);
    }
    return { todo, done };
  }, [account, assetIds, opened, mode, w]);

  // Mock upload: the file shows "Reading…", then fills what it can.
  // A value read from a file waits for Ops to press Use.
  const upload = (key?: CheckDef["key"]) => {
    if (!bundle || !building) return;
    const target =
      defs.find((d) => d.key === key) ??
      defs.find((d) => bundle.items[d.key]?.state === "nofile" && d.file) ??
      defs.find((d) => d.key === "roof");
    if (!target) return;
    const stem = building.name.replace(/[^A-Za-zÄÖÜäöüß]/g, "").replace(/(strasse|straße)$/i, "");
    const name =
      target.key === "roof" ? `Dachplan_${stem}.pdf` : `${stem}_${target.short.replace(/\s+/g, "_")}.pdf`;
    patch((b) => {
      b.files = [...b.files, { name, state: "reading" }];
    });
    window.setTimeout(() => {
      patch((b) => {
        b.files = b.files.map((f) =>
          f.name === name ? { name, type: "PDF", what: target.key === "roof" ? "Roof drawings" : target.name } : f,
        );
        if (target.key === "roof") {
          const cur = b.items.roof;
          if (cur && cur.state !== "done") {
            b.items.roof = {
              state: "confirm",
              found: { value: "380 m²", file: name, page: 1, quote: "Nutzbare Dachfläche 380 m²" },
              prev: cur,
            };
          }
          const dr = b.items.drawings;
          if (dr && dr.state !== "done") b.items.drawings = { state: "done", value: "1 file", source: name, prev: dr };
        } else {
          const cur = b.items[target.key];
          if (cur && cur.state !== "done") b.items[target.key] = { state: "done", value: "1 file", source: name, prev: cur };
        }
        b.history = [{ date: "10 Nov", title: "File added", detail: name }, ...b.history];
      });
    }, 1400);
  };

  if (!bundle || !building) return null;

  const title =
    mode === "fix"
      ? fixAssetsAction(opened.length || groups.todo.length)
      : "Edit asset data";
  const subtitle = w.name;

  const editing = defs.some((d) => bundle.items[d.key]?.state === "edit");
  const tryClose = () => {
    if (editing && !confirming) {
      setConfirming(true);
      return;
    }
    setConfirming(false);
    onClose();
  };
  const closeRef = useRef(tryClose);
  closeRef.current = tryClose;
  // Esc closes (asking first when an edit is open); the page underneath doesn't scroll.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeRef.current();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  const listIds = mode === "fix" ? [...groups.todo, ...groups.done] : [assetId];

  return (
    <div
      role="dialog"
      aria-modal
      aria-label={title}
      className="fixed inset-0 z-50 grid grid-rows-[auto_minmax(0,1fr)] bg-white"
    >
      {/* Top bar */}
      <header className="flex min-h-16 items-center gap-3 border-b border-border-dark px-4 py-2">
        <IconButton icon="cross" label="Close" onClick={tryClose} />
        <div className="min-w-0 flex-1">
          <h2 className="h6 text-text-primary">{title}</h2>
          <p className="p7 text-text-secondary">{subtitle}</p>
        </div>
        {confirming ? (
          <div className="flex flex-wrap items-center justify-end gap-2">
            <p className="ws-hide-xs mr-2 p6 text-text-primary">You have an unsaved change. Close without saving it?</p>
            <Button type="secondary" size="default" onClick={() => setConfirming(false)}>
              Keep editing
            </Button>
            <Button type="secondary" size="default" onClick={() => { setConfirming(false); onClose(); }}>
              Close without saving
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="ws-only-narrow">
              <Button type="secondary" size="default" icon="document" onClick={() => setDocsOpen(!docsOpen)}>
                {`Documents · ${bundle.files.length}`}
              </Button>
            </span>
            <Button type="primary" size="large" onClick={tryClose}>
              Done
            </Button>
          </div>
        )}
      </header>

      {/* Assets · checklist · documents */}
      <div className={cn("ws-body grid min-h-0", mode === "edit" && "ws-body--single")}>
        <aside className="ws-side flex min-h-0 flex-col gap-0.5 overflow-y-auto border-r border-border-light bg-black-1 px-3 py-4">
          {(mode === "fix"
            ? [
                { label: "To fix", ids: groups.todo },
                { label: "Done", ids: groups.done },
              ]
            : [{ label: "Asset", ids: [assetId] }]
          ).map((g, gi) => (
            <div key={g.label} className={cn(gi > 0 && "mt-4")}>
              <p className="px-3 pb-2 s3 text-text-tertiary">
                {g.label} · {g.ids.length}
              </p>
              {g.ids.map((id) => {
                const b = getBuilding(account, id);
                const bb = account.opsAssetData![w.id]![id];
                const cell = blockingCell(bb, w.service, w.solution);
                const toFix = groupOf(bb, w.service, w.solution) === "blocked";
                const line = cell
                  ? `${cell.item} · ${cell.state}`
                  : bb.estimateStartedOn
                    ? "Nothing blocking"
                    : "Ready for Estimate";
                const on = id === assetId;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => onSelectAsset(id)}
                    aria-current={on ? "true" : undefined}
                    className={cn(
                      "grid w-full grid-cols-[16px_minmax(0,1fr)] gap-x-2 rounded-md border px-3 py-2 text-left",
                      on
                        ? "border-border-dark bg-bg-container"
                        : "border-transparent hover:bg-black-2",
                      focusRing,
                    )}
                  >
                    <Icon name="building" size={16} className="mt-0.5 text-icon-dark" />
                    <span className="block h8 text-text-primary">{b?.name}</span>
                    <span className="col-start-2 flex items-center gap-1.5 p7 text-text-secondary">
                      {toFix && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-6" aria-hidden />}
                      {line}
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
          {mode === "fix" && showAll && (
            <button
              type="button"
              className={cn("mt-auto self-start px-3 pt-4 p7 text-text-primary underline underline-offset-[3px]", focusRing)}
              onClick={showAll}
            >
              Show all {assetIds.length}
            </button>
          )}
        </aside>
        <main className="min-h-0 min-w-0 overflow-y-auto">
          <div className="mx-auto max-w-[880px] px-4 pb-12 pt-6 sm:px-8">
            <div className="ws-picker mb-4">
              <Dropdown
                ariaLabel="Asset"
                value={assetId}
                onValueChange={onSelectAsset}
                options={listIds.map((id) => ({ value: id, label: getBuilding(account, id)?.name ?? id }))}
              />
            </div>
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="h5 text-text-primary">{building.name}</h3>
                <p className="p6 text-text-secondary">
                  {mode === "edit" && bundle.estimateStartedOn
                    ? `${building.city} · In Estimate since ${short(bundle.estimateStartedOn)}`
                    : `${building.city} · ${stepLabel(bundle.projectStep)}${
                        bundle.blockedSince
                          ? ` · blocked since ${short(bundle.blockedSince)}`
                          : ""
                      }`}
                </p>
              </div>
              <Button
                type="tertiary"
                size="default"
                icon="chevron-right"
                iconPosition="right"
                href={
                  mode === "edit"
                    ? hrefs.opsPackage(w.id)
                    : hrefs.opsAsset(assetId, { package: w.id })
                }
              >
                {mode === "edit" ? "Open package" : "Open asset page"}
              </Button>
            </div>
            <div className="space-y-4">
            <RequirementGroup
              label={mode === "edit" ? "REQUIRED" : "BLOCKING THE NEXT STEP"}
              count={openBlocking.length}
              countLabel={openBlocking.length ? `${openBlocking.length} open` : "0 open"}
              accentPill={openBlocking.length > 0}
            >
              {blocking.map((def) => (
                <ItemRow
                  key={def.key}
                  def={def}
                  bundle={bundle}
                  w={w}
                  buildingId={assetId}
                  patch={patch}
                  onUpload={upload}
                  onView={showDoc}
                />
              ))}
            </RequirementGroup>
            <RequirementGroup
              label={mode === "edit" ? "RECOMMENDED" : "RECOMMENDED, MISSING"}
              count={openRec.length}
              countLabel={`${openRec.length} missing`}
            >
              {recommended.map((def) => (
                <ItemRow
                  key={def.key}
                  def={def}
                  bundle={bundle}
                  w={w}
                  buildingId={assetId}
                  patch={patch}
                  onUpload={upload}
                  onView={showDoc}
                />
              ))}
            </RequirementGroup>
            </div>
          </div>
        </main>

        <aside
          aria-label="Documents"
          className={cn("ws-docs min-h-0 min-w-0 border-l border-border-dark bg-black-1", docsOpen && "ws-docs--open")}
        >
          {doc ? (
            <DocPreview key={`${doc.file}-${doc.page}`} doc={doc} onBack={() => setDoc(null)} onClose={() => setDocsOpen(false)} />
          ) : (
            <div className="flex h-full min-h-0 flex-col gap-4 overflow-y-auto p-4">
              <div className="flex items-center gap-2">
                <p className="flex-1 h7 text-text-primary">Documents</p>
                <span className="inline-flex h-6 items-center rounded-full border border-border-dark bg-white px-2 h9 text-text-title">
                  {bundle.files.length} {bundle.files.length === 1 ? "file" : "files"}
                </span>
                <span className="ws-only-narrow">
                  <IconButton icon="cross" label="Close documents" onClick={() => setDocsOpen(false)} />
                </span>
              </div>
              <div className="flex flex-col items-center gap-1 rounded-md border-[1.5px] border-dashed border-black-3 bg-white px-4 py-5 text-center">
                <span className="mb-1.5 flex size-9 items-center justify-center rounded-md border border-border-dark bg-white">
                  <Icon name="upload" size={20} className="text-icon-dark" />
                </span>
                <p className="h8 text-text-primary">Drop documents here</p>
                <p className="p7 text-text-secondary">We read them and fill what we can</p>
                <span className="mt-2.5">
                  <Button type="secondary" size="default" onClick={() => upload()}>
                    Upload documents
                  </Button>
                </span>
              </div>
              {bundle.files.length ? (
                <div className="rounded-md border border-border-light bg-white px-3">
                  <AssetFileList files={bundle.files} onView={(name) => showDoc({ file: name, page: 1 })} />
                </div>
              ) : (
                <p className="text-center p7 text-text-secondary">No documents for this asset yet.</p>
              )}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
