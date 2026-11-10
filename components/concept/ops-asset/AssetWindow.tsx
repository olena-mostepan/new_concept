"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
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
}: {
  def: CheckDef;
  item: CheckItemState;
  bundle: AssetCheckBundle;
  w: Workstream;
  buildingId: string;
  patch: (fn: (b: AssetCheckBundle) => void) => void;
  onUpload: (key: CheckDef["key"]) => void;
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
      <FoundValue {...f}>
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
          <FoundValue key={opt.file} value={opt.value} file={opt.file} page={opt.page} quote={opt.quote}>
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
}: {
  def: CheckDef;
  bundle: AssetCheckBundle;
  w: Workstream;
  buildingId: string;
  patch: (fn: (b: AssetCheckBundle) => void) => void;
  onUpload: (key: CheckDef["key"]) => void;
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

  const tryClose = () => {
    if (dirty && !onCloseAttempt()) return;
    onClose();
  };

  const footer = dirty ? (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="p7 text-status-danger-text">
        You have an unsaved change. Close without saving it?
      </p>
      <div className="flex gap-2">
        <Button type="tertiary" size="default" onClick={() => onCloseAttempt()}>
          Keep editing
        </Button>
        <Button type="secondary" size="default" onClick={onClose}>
          Close without saving
        </Button>
      </div>
    </div>
  ) : (
    <div className="flex justify-end">
      <Button type="primary" size="large" onClick={onDone}>
        Done
      </Button>
    </div>
  );

  return (
    <OpsModal
      open={open}
      title={title}
      subtitle={subtitle}
      onClose={tryClose}
      footer={footer}
      width={1000}
    >
      <div className="flex max-h-[calc(100dvh-200px)] min-h-[480px]">
        <aside className="flex w-[260px] shrink-0 flex-col gap-0.5 overflow-y-auto border-r border-border-light bg-black-1 px-3 py-4">
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
        <div className="min-w-0 flex-1 overflow-y-auto p-6">
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
              type="secondary"
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
          <UploadRow onUpload={() => upload()} />
          <div className="mt-4 space-y-4">
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
                />
              ))}
            </RequirementGroup>
            <RequirementGroup
              label="FILES"
              count={bundle.files.length}
              countLabel={`${bundle.files.length} ${bundle.files.length === 1 ? "file" : "files"}`}
            >
              <AssetFileList files={bundle.files} />
            </RequirementGroup>
          </div>
        </div>
      </div>
    </OpsModal>
  );
}
