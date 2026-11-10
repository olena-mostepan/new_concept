"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
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
  blockingItem,
  groupOf,
  recommendedMissing,
  stepLabel,
} from "@/lib/concept/opsAssetDerive";
import { getBuilding } from "@/lib/concept/derive";
import { fixAssetsAction } from "@/lib/concept/words";
import type { Account, Workstream } from "@/lib/concept/model";
import { service as serviceDef } from "@/lib/concept/model";
import { cn } from "@/lib/utils";
import { Button, Icon, filterSearchClass, focusRing } from "../ui";
import { hrefs } from "../hrefs";
import {
  FoundValue,
  OpsModal,
  RequirementGroup,
  UploadRow,
} from "./opsUi";

type Mode = "fix" | "edit";

function RequirementActions({
  def,
  item,
  bundle,
  w,
  buildingId,
  patch,
  mode,
}: {
  def: CheckDef;
  item: CheckItemState;
  bundle: AssetCheckBundle;
  w: Workstream;
  buildingId: string;
  patch: (fn: (b: AssetCheckBundle) => void) => void;
  mode: Mode;
}) {
  const [draft, setDraft] = useState("");
  const st = item.state;

  if (st === "confirm" && item.found) {
    return (
      <div className="col-span-2 mt-3 space-y-2">
        <FoundValue {...item.found}>
          <Button
            type="secondary"
            size="default"
            onClick={() =>
              patch((b) => applyUseFound(b, def, item.found!))
            }
          >
            Use {item.found.value}
          </Button>
          <Button
            type="tertiary"
            size="default"
            onClick={() => patch((b) => setCheckEdit(b, def.key, true))}
          >
            Enter another
          </Button>
        </FoundValue>
      </div>
    );
  }

  if (st === "disagree" && item.options) {
    return (
      <div className="col-span-2 mt-3 space-y-2">
        <p className="p7 text-text-secondary">
          The files disagree. Choose one, or enter another value.
        </p>
        {item.options.map((opt) => (
          <FoundValue key={opt.file} value={opt.value} file={opt.file} page={opt.page} quote={opt.quote}>
            <Button
              type="secondary"
              size="default"
              onClick={() => patch((b) => applyUseFound(b, def, opt))}
            >
              Use {opt.value}
            </Button>
          </FoundValue>
        ))}
        <Button
          type="tertiary"
          size="default"
          onClick={() => patch((b) => setCheckEdit(b, def.key, true))}
        >
          Another value
        </Button>
      </div>
    );
  }

  if (st === "edit") {
    return (
      <div className="col-span-2 mt-3 rounded-md border border-border-light bg-black-1 p-4">
        <div className="flex flex-wrap gap-4">
          <input
            className={cn(filterSearchClass, "max-w-[220px]")}
            value={draft || item.value?.replace(/\s*m²/, "") || ""}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={def.placeholder ?? "Value"}
          />
        </div>
        {item.prev?.value && (
          <p className="mt-2 p7 text-text-secondary">
            Was {item.prev.value}
            {item.prev.source ? ` · from ${item.prev.source}` : ""}
          </p>
        )}
        {bundle.estimateStartedOn && def.key === "roof" && (
          <p className="mt-2 p7 text-status-warning-text">
            This asset&apos;s estimate has started. It used {item.prev?.value ?? item.value}. After
            saving, its Estimate step shows &ldquo;Roof area changed · check the estimate&rdquo;.
          </p>
        )}
        <div className="mt-3 flex justify-end gap-2">
          <Button
            type="tertiary"
            size="default"
            onClick={() => patch((b) => setCheckEdit(b, def.key, false))}
          >
            Cancel
          </Button>
          <Button
            type="primary"
            size="default"
            onClick={() =>
              patch((b) => {
                applySaveValue(
                  b,
                  def,
                  draft || item.value || "",
                  item.source ?? "Typed",
                  w,
                  buildingId,
                );
                setCheckEdit(b, def.key, false);
              })
            }
          >
            Save {draft ? `${draft}${def.unit ? ` ${def.unit}` : ""}` : "value"}
          </Button>
        </div>
      </div>
    );
  }

  if (st === "nofile") {
    return (
      <>
        {!def.required && (
          <Button
            type="tertiary"
            size="default"
            onClick={() => patch((b) => applyNotAvailable(b, def))}
          >
            Not available
          </Button>
        )}
        <Button type="secondary" size="default" icon="plus">
          {def.uploadLabel ?? "Upload"}
        </Button>
      </>
    );
  }

  if (st === "missing") {
    return (
      <>
        <input
          className={cn(filterSearchClass, "max-w-[220px]")}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={def.placeholder ?? "Value"}
        />
        <Button
          type="secondary"
          size="default"
          onClick={() =>
            patch((b) =>
              applySaveValue(b, def, draft, "Typed", w, buildingId),
            )
          }
        >
          Save
        </Button>
      </>
    );
  }

  if (st === "na") {
    return (
      <Button
        type="tertiary"
        size="default"
        onClick={() => patch((b) => applyUndoNa(b, def))}
      >
        Undo
      </Button>
    );
  }

  if (st === "done") {
    return (
      <Button
        type="tertiary"
        size="default"
        icon="plus"
        onClick={() => patch((b) => setCheckEdit(b, def.key, true))}
      >
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
  mode,
}: {
  def: CheckDef;
  bundle: AssetCheckBundle;
  w: Workstream;
  buildingId: string;
  patch: (fn: (b: AssetCheckBundle) => void) => void;
  mode: Mode;
}) {
  const item = bundle.items[def.key] ?? { state: "missing" as const };
  const blocked = def.required && item.state !== "done" && item.state !== "na" && item.state !== "edit";
  return (
    <div className="grid grid-cols-[36px_1fr_auto] items-start gap-3 px-4 py-4">
      <span
        className={cn(
          "relative flex size-9 items-center justify-center rounded-md border border-border-light bg-black-1",
          item.state === "done" && "border-status-success-border bg-status-success-bg",
        )}
      >
        <Icon name="info" size={16} className="text-icon-dark" />
        {blocked && (
          <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-brand-6" aria-hidden />
        )}
      </span>
      <div className="min-w-0">
        <p className="h8 text-text-title">{def.name}</p>
        <p className="p7 text-text-tertiary">
          {def.required ? "Required" : "Recommended"}
        </p>
        {item.state === "done" && item.value && (
          <p className="p7 text-text-secondary">
            {item.value}
            {item.source ? ` · ${item.source}` : ""}
          </p>
        )}
        <RequirementActions
          def={def}
          item={item}
          bundle={bundle}
          w={w}
          buildingId={buildingId}
          patch={patch}
          mode={mode}
        />
      </div>
      <div className="flex flex-wrap items-center justify-end gap-2">
        {st !== "confirm" && st !== "disagree" && st !== "edit" && (
          <RequirementActions
            def={def}
            item={item}
            bundle={bundle}
            w={w}
            buildingId={buildingId}
            patch={patch}
            mode={mode}
          />
        )}
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

  const blocking = defs.filter((d) => d.required);
  const recommended = defs.filter((d) => !d.required);
  const openBlocking = blocking.filter((d) => {
    const st = bundle?.items[d.key]?.state;
    return st !== "done" && st !== "na" && st !== "edit";
  });
  const openRec = bundle
    ? recommendedMissing(bundle, w.service, w.solution)
    : [];

  const groups = useMemo(() => {
    const todo: typeof assetIds = [];
    const done: typeof assetIds = [];
    for (const id of assetIds) {
      const b = account.opsAssetData?.[w.id]?.[id];
      if (!b) continue;
      if (groupOf(b, w.service, w.solution) === "blocked") todo.push(id);
      else if (mode === "fix" && groupOf(b, w.service, w.solution) === "ready")
        done.push(id);
    }
    return { todo, done };
  }, [account, assetIds, mode, w]);

  if (!bundle || !building) return null;

  const title =
    mode === "fix"
      ? fixAssetsAction(groups.todo.length)
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
        <aside className="w-[260px] shrink-0 overflow-y-auto border-r border-border-light bg-black-1">
          {mode === "fix" && (
            <>
              <p className="px-4 pb-2 pt-4 s3 text-text-tertiary">
                TO FIX · {groups.todo.length}
              </p>
              {groups.todo.map((id) => {
                const b = getBuilding(account, id);
                const bl = blockingItem(
                  account.opsAssetData![w.id]![id],
                  w.service,
                  w.solution,
                );
                const cell = bl
                  ? `${bl.short} · ${account.opsAssetData![w.id]![id].items[bl.key]?.state === "confirm" ? "to confirm" : "missing"}`
                  : "";
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => onSelectAsset(id)}
                    className={cn(
                      "flex w-full gap-2 border-b border-border-light px-4 py-3 text-left hover:bg-black-2",
                      id === assetId && "border border-border-accent bg-bg-accent",
                      focusRing,
                    )}
                  >
                    <Icon name="info" size={16} className="mt-0.5 shrink-0" />
                    <div>
                      <p className="h8 text-text-primary">{b?.name}</p>
                      {cell && (
                        <p className="p7 text-text-secondary">
                          <span className="mr-1 text-brand-6">●</span>
                          {cell}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
              <p className="px-4 pb-2 pt-4 s3 text-text-tertiary">
                DONE · {groups.done.length}
              </p>
              {groups.done.map((id) => {
                const b = getBuilding(account, id);
                return (
                  <div key={id} className="px-4 py-2 p7 text-text-secondary">
                    {b?.name} · Ready for Estimate
                  </div>
                );
              })}
              {showAll && (
                <button
                  type="button"
                  className={cn("mx-4 mb-4 mt-2 h8 text-text-primary underline", focusRing)}
                  onClick={showAll}
                >
                  Show all {assetIds.length}
                </button>
              )}
            </>
          )}
          {mode === "edit" && (
            <>
              <p className="px-4 py-4 s3 text-text-tertiary">ASSET · 1</p>
              <div className="border border-border-accent bg-bg-accent px-4 py-3">
                <p className="h8 text-text-primary">{building.name}</p>
                <p className="p7 text-text-secondary">
                  {blockingItem(bundle, w.service, w.solution)
                    ? "Needs data"
                    : "Nothing blocking"}
                </p>
              </div>
            </>
          )}
        </aside>
        <div className="min-w-0 flex-1 overflow-y-auto p-6">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="h5 text-text-primary">{building.name}</h3>
              <p className="p6 text-text-secondary">
                {building.city} · {stepLabel(bundle.projectStep)}
                {bundle.blockedSince ? ` · blocked since ${bundle.blockedSince.split(" ").slice(0, 2).join(" ")}` : ""}
              </p>
            </div>
            <Button
              type="secondary"
              size="default"
              icon="chevron-right"
              iconPosition="right"
              href={hrefs.opsAsset(assetId, { package: w.id })}
            >
              Open asset page
            </Button>
          </div>
          <UploadRow onUpload={() => {}} />
          <div className="mt-4 space-y-4">
            <RequirementGroup
              label="BLOCKING THE NEXT STEP"
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
                  mode={mode}
                />
              ))}
            </RequirementGroup>
            <RequirementGroup
              label="RECOMMENDED, MISSING"
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
                  mode={mode}
                />
              ))}
            </RequirementGroup>
            <RequirementGroup
              label="FILES"
              count={bundle.files.length}
              countLabel={`${bundle.files.length} files`}
            >
              {bundle.files.map((file) => (
                <div
                  key={file.name}
                  className="flex items-center justify-between gap-3 px-4 py-3"
                >
                  <div>
                    <p className="h8 text-text-primary">{file.name}</p>
                    <p className="p7 text-text-secondary">
                      {file.type ?? (file.state === "reading" ? "Reading…" : "—")}
                      {file.what ? ` · ${file.what}` : ""}
                    </p>
                  </div>
                  <Button type="tertiary" size="default" icon="download">
                    Download
                  </Button>
                </div>
              ))}
            </RequirementGroup>
          </div>
        </div>
      </div>
    </OpsModal>
  );
}
