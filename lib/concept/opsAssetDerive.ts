import {
  checksFor,
  STATE_WORD,
  type AssetCheckBundle,
  type CheckDef,
  type CheckItemState,
  type CheckKey,
} from "./checks";
import type { Account, Workstream } from "./model";
import { parse, short, type StepColumn } from "./derive";

const ESTIMATE_STEP_LABELS = [
  "Data collected",
  "Estimate",
  "Presented",
  "Decision",
] as const;

export type AssetGroup = "blocked" | "started" | "ready";

function effectiveState(item: CheckItemState | undefined): CheckItemState["state"] {
  if (!item) return "missing";
  if (item.state === "edit") return item.prev?.state ?? "missing";
  return item.state;
}

function requiredOpen(
  defs: CheckDef[],
  items: Record<CheckKey, CheckItemState>,
): CheckDef | null {
  for (const def of defs) {
    if (!def.required) continue;
    const st = effectiveState(items[def.key]);
    if (st !== "done" && st !== "na") return def;
  }
  return null;
}

export function blockingItem(
  bundle: AssetCheckBundle,
  service: Parameters<typeof checksFor>[0],
  solution: Parameters<typeof checksFor>[1],
): CheckDef | null {
  return requiredOpen(checksFor(service, solution), bundle.items);
}

export function isBlocked(
  bundle: AssetCheckBundle,
  service: Parameters<typeof checksFor>[0],
  solution: Parameters<typeof checksFor>[1],
): boolean {
  return blockingItem(bundle, service, solution) !== null;
}

export function groupOf(
  bundle: AssetCheckBundle,
  service: Parameters<typeof checksFor>[0],
  solution: Parameters<typeof checksFor>[1],
): AssetGroup {
  if (isBlocked(bundle, service, solution)) return "blocked";
  if (bundle.projectStep >= 1 || bundle.estimateStartedOn) return "started";
  return "ready";
}

export function recommendedMissing(
  bundle: AssetCheckBundle,
  service: Parameters<typeof checksFor>[0],
  solution: Parameters<typeof checksFor>[1],
): CheckDef[] {
  const defs = checksFor(service, solution).filter((d) => !d.required);
  return defs.filter((d) => {
    const st = effectiveState(bundle.items[d.key]);
    return st !== "done" && st !== "na";
  });
}

export function blockingCell(
  bundle: AssetCheckBundle,
  service: Parameters<typeof checksFor>[0],
  solution: Parameters<typeof checksFor>[1],
): { item: string; state: string; detail: string } | null {
  const def = blockingItem(bundle, service, solution);
  if (!def) return null;
  const item = bundle.items[def.key];
  const st = effectiveState(item);
  const word =
    st === "confirm"
      ? STATE_WORD.confirm
      : st === "disagree"
        ? "files disagree"
        : st === "nofile"
          ? "no file"
          : st === "missing"
            ? "missing"
            : STATE_WORD[st] || "missing";
  let detail = "";
  if (st === "confirm" && item?.found) {
    detail = `${item.found.value} found in ${item.found.file}`;
    if (item.found.page) detail += `, page ${item.found.page}`;
  } else if (st === "disagree" && item?.options?.length) {
    detail = item.options.map((o) => o.value).join(" or ");
  } else if (st === "missing" && def.hint) detail = def.hint;
  return { item: def.short, state: word, detail };
}

export function recCell(
  bundle: AssetCheckBundle,
  service: Parameters<typeof checksFor>[0],
  solution: Parameters<typeof checksFor>[1],
): { count: number; names: string } | null {
  const missing = recommendedMissing(bundle, service, solution);
  if (!missing.length) return null;
  return {
    count: missing.length,
    names: missing.map((d) => d.short).join(", "),
  };
}

export function stepLabel(step: number): string {
  return ESTIMATE_STEP_LABELS[step] ?? "Data collected";
}

export function opsIndicativeSteps(
  account: Account,
  w: Workstream,
): StepColumn[] {
  const bundles = account.opsAssetData?.[w.id];
  const startedOn = w.projects
    .map((p) => bundles?.[p.buildingId]?.estimateStartedOn)
    .filter((d): d is string => Boolean(d));
  const estimateLine =
    startedOn.length > 0
      ? `started ${short([...startedOn].sort((a, b) => parse(a) - parse(b))[0])}`
      : "";

  return ESTIMATE_STEP_LABELS.map((label, i) => {
    let here = 0;
    let past = 0;
    for (const project of w.projects) {
      const step = bundles?.[project.buildingId]?.projectStep ?? 0;
      if (step === i) here++;
      else if (step > i) past++;
    }
    const state = here > 0 ? "now" : past > 0 ? "passed" : "upcoming";
    return {
      label,
      state,
      count: here,
      happens: i === 1 && here > 0 ? estimateLine : "",
    };
  });
}
