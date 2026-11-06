import { service, type ServiceId, type Workstream } from "@/lib/concept/model";
import { isClosed, isCompleted, short } from "@/lib/concept/derive";
import { offersIn } from "./TenderWorkstream";

export type PackageTabId =
  | "estimates"
  | "survey"
  | "brief"
  | "tender-results"
  | "pricing"
  | "contract"
  | "delivery";

export function packageStatusService(w: Workstream): ServiceId {
  if (isClosed(w)) {
    const last = w.phases[w.phases.length - 1];
    return last?.service ?? w.service;
  }
  if (isCompleted(w)) return "delivery";
  return w.service;
}

export function packagePrimaryTab(w: Workstream): PackageTabId {
  if (isCompleted(w)) return "delivery";
  switch (w.service) {
    case "indicative":
      return "estimates";
    case "scope":
      return "survey";
    case "tender": {
      const received = offersIn(w.tender?.offers);
      return received > 0 ? "tender-results" : "brief";
    }
    case "pricing":
      return "pricing";
    case "delivery":
      return "delivery";
  }
}

const CTA: Record<
  ServiceId,
  { label: string; tab: PackageTabId }
> = {
  indicative: { label: "See estimates", tab: "estimates" },
  scope: { label: "See surveys", tab: "survey" },
  tender: { label: "See offers", tab: "tender-results" },
  pricing: { label: "See prices", tab: "pricing" },
  delivery: { label: "See delivery", tab: "delivery" },
};

export function packageStatusCta(w: Workstream) {
  const sid = packageStatusService(w);
  const base = CTA[sid];
  if (sid === "tender") {
    const tab = packagePrimaryTab(w);
    return { label: base.label, tab };
  }
  return base;
}

export function packageStatusHeadline(w: Workstream) {
  if (isClosed(w) && w.closedOn) {
    return {
      lead: "This package is",
      name: `Closed · ${short(w.closedOn)}`,
    };
  }
  if (isCompleted(w)) {
    return { lead: "This package is complete", name: null as string | null };
  }
  return {
    lead: "This package is in",
    name: service(w.service).label,
  };
}

export function assetStatusHeadline(w: Workstream) {
  if (isCompleted(w)) {
    return { lead: "This asset is complete", name: null as string | null };
  }
  return {
    lead: "This asset is in",
    name: service(w.service).label,
  };
}
