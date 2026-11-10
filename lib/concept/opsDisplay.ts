import type { CheckDef, CheckItemState } from "./checks";
import { STATE_WORD } from "./checks";

export function opsItemStateWord(item: CheckItemState | undefined): string {
  if (!item) return "missing";
  const st = item.state;
  if (st === "confirm") return STATE_WORD.confirm;
  if (st === "disagree") return "files disagree";
  if (st === "nofile") return "no file";
  if (st === "missing") return "missing";
  if (st === "na") return "not available";
  return "";
}

export function opsFileValueDisplay(item: CheckItemState | undefined): string | null {
  if (!item || item.state !== "done" || !item.source) return null;
  if (item.source === "Typed" || item.source === "Asset record") return item.value ?? null;
  const file = item.source.split(",")[0]?.trim();
  if (!file) return item.value ?? null;
  return `1 file · ${file}`;
}

export function opsItemSubline(
  def: CheckDef,
  item: CheckItemState | undefined,
): string {
  if (!item) return def.hint ?? "";
  if (item.state === "na") return "Not available";
  if (item.state === "missing" && def.hint) return def.hint;
  if (item.state === "done") {
    const fileLine = def.file ? opsFileValueDisplay(item) : null;
    if (fileLine) return fileLine;
    if (item.value)
      return item.source ? `${item.value} · ${item.source}` : item.value;
  }
  return "";
}
