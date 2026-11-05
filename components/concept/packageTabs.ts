import type { ServiceId, Workstream } from "@/lib/concept/model";
import { presentedTotal, workstreamView } from "@/lib/concept/derive";
import { offersIn } from "./TenderWorkstream";
import { packagePrimaryTab } from "./packageStatus";

export type PackageTabId =
  | "overview"
  | "estimates"
  | "survey"
  | "brief"
  | "supplier-matching"
  | "tender-results"
  | "pricing"
  | "contract"
  | "delivery";

function started(w: Workstream, id: ServiceId) {
  const phase = w.phases.find((item) => item.service === id);
  return Boolean(phase && phase.state !== "planned");
}

function viewFor(w: Workstream, id: ServiceId) {
  const phase = w.phases.find((item) => item.service === id);
  if (!phase || phase.state === "planned") return null;
  return workstreamView(w, phase);
}

function hasOpenVisit(w: Workstream) {
  const lists = [
    w.projects,
    ...w.phases.flatMap((phase) => (phase.projects ? [phase.projects] : [])),
  ];
  return lists.some((list) =>
    list.some((project) => project.visit && project.visit.state !== "skip"),
  );
}

function hasContract(w: Workstream) {
  if (w.service === "pricing" && w.pricing?.contractOn) return true;
  return w.phases.some(
    (phase) =>
      phase.state !== "planned" &&
      phase.service === "pricing" &&
      Boolean(phase.pricing?.contractOn),
  );
}

export function tabsFor(w: Workstream) {
  const current = packagePrimaryTab(w);
  const tabs: Array<{ id: PackageTabId; label: string; dot?: boolean }> = [
    { id: "overview", label: "Overview" },
  ];
  const estimates = viewFor(w, "indicative");
  if (
    estimates &&
    (presentedTotal(estimates).count > 0 ||
      estimates.projects.some((project) => project.estimate))
  ) {
    tabs.push({
      id: "estimates",
      label: "Estimates",
      dot:
        current === "estimates" ||
        estimates.projects.some((project) => project.decision === "waiting"),
    });
  }
  if (started(w, "scope") && hasOpenVisit(w)) {
    tabs.push({
      id: "survey",
      label: "Survey",
      dot: current === "survey",
    });
  }
  const tender = viewFor(w, "tender");
  if (tender) {
    tabs.push({
      id: "brief",
      label: "Brief",
      dot: current === "brief",
    });
    const invited = tender.tender?.invited ?? 0;
    const received = offersIn(tender.tender?.offers);
    if (invited > 0) {
      tabs.push({
        id: "supplier-matching",
        label: `Supplier matching (${invited})`,
      });
    }
    if (received > 0) {
      tabs.push({
        id: "tender-results",
        label: `Tender results (${received})`,
        dot: current === "tender-results",
      });
    }
  }
  if (started(w, "pricing"))
    tabs.push({
      id: "pricing",
      label: "Pricing",
      dot: current === "pricing",
    });
  if (hasContract(w)) tabs.push({ id: "contract", label: "Contract" });
  if (started(w, "delivery"))
    tabs.push({
      id: "delivery",
      label: "Delivery",
      dot: current === "delivery",
    });
  return tabs;
}

function scopeLabel(label: string) {
  const base = label.replace(/\s*\(\d+\)\s*$/, "");
  if (base === "Tender results") return base;
  return base.toLowerCase();
}

function englishList(items: string[]) {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

const SCOPE_SKIP = new Set<PackageTabId>([
  "overview",
  "brief",
  "supplier-matching",
  "estimates",
]);

const SCOPE_ORDER: PackageTabId[] = [
  "survey",
  "tender-results",
  "pricing",
  "contract",
  "delivery",
];

/** Package tabs this asset shares with others, for the asset page card. */
export function assetPackageScopeLine(w: Workstream) {
  const byId = new Map(
    tabsFor(w)
      .filter((tab) => !SCOPE_SKIP.has(tab.id))
      .map((tab) => [tab.id, scopeLabel(tab.label)] as const),
  );
  if (
    started(w, "delivery") &&
    w.supplier &&
    !byId.has("contract")
  ) {
    byId.set("contract", "contract");
  }
  const labels = SCOPE_ORDER.flatMap((id) => {
    const label = byId.get(id);
    return label ? [label] : [];
  });
  const listed = englishList(labels);
  const others = w.projects.length - 1;
  const tail =
    others > 0
      ? `for this asset and ${others} other${others === 1 ? "" : "s"}`
      : "for this asset";
  return listed ? `${listed} ${tail}` : tail;
}
