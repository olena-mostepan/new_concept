import { TODAY } from "./model";
import type { Account, Workstream } from "./model";
import {
  checksFor,
  type AssetCheckBundle,
  type CheckDef,
  type CheckItemState,
  type CheckKey,
} from "./checks";
import { isBlocked } from "./opsAssetDerive";
import { service as serviceDef } from "./model";

function historyToday() {
  return TODAY.split(" ").slice(0, 2).join(" ");
}

export function ensureOpsData(account: Account, packageId: string) {
  if (!account.opsAssetData) account.opsAssetData = {};
  if (!account.opsAssetData[packageId])
    account.opsAssetData[packageId] = {};
}

export function getBundle(
  account: Account,
  packageId: string,
  buildingId: string,
): AssetCheckBundle | undefined {
  return account.opsAssetData?.[packageId]?.[buildingId];
}

export function pushHistory(
  bundle: AssetCheckBundle,
  title: string,
  detail?: string,
) {
  bundle.history.unshift({ date: historyToday(), title, detail });
}

export function applyUseFound(
  bundle: AssetCheckBundle,
  def: CheckDef,
  found: NonNullable<CheckItemState["found"]>,
) {
  const prev = bundle.items[def.key];
  bundle.items[def.key] = {
    state: "done",
    value: found.value.replace(/\s*m²\s*$/i, "").trim() + (def.unit ? ` ${def.unit}` : ""),
    source: `${found.file}${found.page != null ? `, page ${found.page}` : ""}`,
    prev,
  };
  pushHistory(
    bundle,
    `${def.name} added`,
    `${bundle.items[def.key].value} · from ${found.file}${found.page != null ? `, page ${found.page}` : ""}`,
  );
}

export function applySaveValue(
  bundle: AssetCheckBundle,
  def: CheckDef,
  raw: string,
  source: string,
  w: Workstream,
  buildingId: string,
) {
  const key = def.key;
  const prev = bundle.items[key];
  const was = prev?.state === "done" ? prev.value : undefined;
  const value = def.unit && !raw.includes("m²") ? `${raw} ${def.unit}` : raw;
  bundle.items[key] = { state: "done", value, source, prev };
  const detail = was
    ? `${value} · from ${source} · was ${was}`
    : `${value} · from ${source}`;
  pushHistory(bundle, `${def.name} ${was ? "changed" : "added"}`, detail);
  if (
    key === "roof" &&
    bundle.estimateStartedOn &&
    was &&
    was !== value
  ) {
    bundle.stepLineOverride = "Roof area changed · check the estimate";
    bundle.estimateNeedsCheck = true;
    pushHistory(bundle, "Estimate needs a check");
  }
}

export function applyNotAvailable(bundle: AssetCheckBundle, def: CheckDef) {
  bundle.items[def.key] = { state: "na", prev: bundle.items[def.key] };
  pushHistory(bundle, `${def.name} marked not available`);
}

export function applyUndoNa(bundle: AssetCheckBundle, def: CheckDef) {
  bundle.items[def.key] = { state: def.file ? "nofile" : "missing", prev: undefined };
}

export function startEstimates(
  account: Account,
  w: Workstream,
  buildingIds: string[],
) {
  ensureOpsData(account, w.id);
  const pkg = account.opsAssetData![w.id]!;
  for (const buildingId of buildingIds) {
    const bundle = pkg[buildingId];
    if (!bundle) continue;
    bundle.projectStep = 1;
    bundle.estimateStartedOn = TODAY;
    const row = w.projects.find((p) => p.buildingId === buildingId);
    if (row) {
      row.step = 1;
      row.note = "Estimate";
    }
    pushHistory(bundle, "Estimate started");
  }
}

export function syncProjectStepsFromOps(w: Workstream, account: Account) {
  const pkg = account.opsAssetData?.[w.id];
  if (!pkg) return;
  for (const row of w.projects) {
    const bundle = pkg[row.buildingId];
    if (bundle) row.step = bundle.projectStep;
  }
}

export function blockedCount(
  account: Account,
  w: Workstream,
): number {
  const pkg = account.opsAssetData?.[w.id];
  if (!pkg) return 0;
  let n = 0;
  for (const row of w.projects) {
    const bundle = pkg[row.buildingId];
    if (bundle && isBlocked(bundle, w.service, w.solution)) n += 1;
  }
  return n;
}

export function setCheckEdit(
  bundle: AssetCheckBundle,
  key: CheckKey,
  on: boolean,
) {
  const cur = bundle.items[key];
  if (!cur) return;
  if (on) {
    bundle.items[key] = { ...cur, state: "edit", prev: { ...cur, prev: undefined } };
  } else if (cur.state === "edit" && cur.prev) {
    bundle.items[key] = cur.prev;
  }
}

export function parseAssistantRoof(
  text: string,
): { assetQuery: string; value: string } | null {
  const m = text.match(
    /set\s+(.+?)\s+roof\s+area\s+to\s+(\d+)/i,
  );
  if (!m) return null;
  return { assetQuery: m[1].trim(), value: m[2].trim() };
}
