import {
  checksFor,
  STATE_WORD,
  type AssetCheckBundle,
  type CheckDef,
  type CheckItemState,
  type CheckKey,
} from "./checks";

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
  const labels = ["Data collected", "Estimate", "Presented", "Decision"];
  return labels[step] ?? "Data collected";
}
