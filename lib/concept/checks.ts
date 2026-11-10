import type { ServiceId, SolutionId } from "./model";

export type CheckKey = string;

export type ItemStateKind =
  | "done"
  | "confirm"
  | "disagree"
  | "nofile"
  | "missing"
  | "na"
  | "edit";

export interface FoundOption {
  value: string;
  file: string;
  page?: number | string;
  quote?: string;
}

export interface CheckItemState {
  state: ItemStateKind;
  value?: string;
  source?: string;
  found?: FoundOption;
  options?: FoundOption[];
  prev?: CheckItemState;
}

export interface AssetFile {
  name: string;
  type?: string;
  what?: string;
  state?: "reading" | "unknown";
}

export interface AssetHistoryEvent {
  date: string;
  title: string;
  detail?: string;
}

export interface AssetCheckBundle {
  items: Record<CheckKey, CheckItemState>;
  files: AssetFile[];
  history: AssetHistoryEvent[];
  /** Estimates step index on this package: 0 Data collected, 1 Estimate, … */
  projectStep: number;
  estimateStartedOn?: string;
  blockedSince?: string;
  /** Override line under Estimate step after roof change */
  stepLineOverride?: string;
  estimateNeedsCheck?: boolean;
}

export interface CheckDef {
  key: CheckKey;
  name: string;
  short: string;
  required: boolean;
  unit?: string;
  file?: boolean;
  uploadLabel?: string;
  hint?: string;
  placeholder?: string;
  icon?: string;
}

export const CHECKS: Record<
  ServiceId,
  Partial<Record<SolutionId, CheckDef[]>>
> = {
  indicative: {
    solar: [
      {
        key: "address",
        name: "Address",
        short: "Address",
        required: true,
        icon: "location",
      },
      {
        key: "roof",
        name: "Usable roof area",
        short: "Roof area",
        required: true,
        unit: "m²",
        uploadLabel: "Upload roof plan",
        hint: "A roof plan or drawing that gives the usable area",
        icon: "size",
      },
      {
        key: "bills",
        name: "Consumption data",
        short: "bills",
        required: false,
        file: true,
        hint: "Bills or half-hourly meter data",
        uploadLabel: "Upload bills or meter data",
        icon: "running-cost",
      },
      {
        key: "plans",
        name: "Site or floor plans",
        short: "plans",
        required: false,
        file: true,
        uploadLabel: "Upload plans",
        icon: "building",
      },
      {
        key: "drawings",
        name: "Roof drawings",
        short: "drawings",
        required: false,
        file: true,
        uploadLabel: "Upload roof drawings",
        icon: "solar",
      },
      {
        key: "covering",
        name: "Roof covering",
        short: "covering",
        required: false,
        placeholder: "e.g. bitumen membrane",
        icon: "home",
      },
    ],
  },
  scope: {
    solar: [
      { key: "survey", name: "Site survey", short: "Survey", required: true, icon: "building" },
      { key: "drawings", name: "Roof drawings", short: "drawings", required: true, file: true, uploadLabel: "Upload drawings", icon: "solar" },
    ],
    generic: [
      { key: "survey", name: "Site survey", short: "Survey", required: true, icon: "building" },
    ],
  },
  tender: {
    solar: [
      { key: "brief", name: "Brief signed off", short: "Brief", required: true, icon: "document" },
      { key: "photos", name: "Site photos", short: "photos", required: true, file: true, uploadLabel: "Upload photos", icon: "building" },
    ],
  },
  pricing: {
    solar: [
      { key: "supplier", name: "Supplier on the package", short: "Supplier", required: true, icon: "building" },
      { key: "spec", name: "Specification", short: "spec", required: true, icon: "document" },
    ],
  },
  delivery: {
    solar: [
      { key: "contract", name: "Contract signed", short: "Contract", required: true, icon: "document" },
      { key: "start", name: "Start date", short: "Start", required: true, icon: "time" },
    ],
  },
};

export function checksFor(
  service: ServiceId,
  solution: SolutionId,
): CheckDef[] {
  return (
    CHECKS[service]?.[solution] ??
    CHECKS[service]?.generic ??
    []
  );
}

export const OPS_ESTIMATES_PACKAGE_ID = "solar-est-live";

export const STATE_WORD: Record<ItemStateKind, string> = {
  done: "",
  confirm: "to confirm",
  disagree: "files disagree",
  nofile: "no file",
  missing: "missing",
  na: "not available",
  edit: "editing",
};

/** Seed bundles for Solar PV · Estimates (live), 6 assets. */
export function seedOpsEstimatesAssets(): Record<string, AssetCheckBundle> {
  return {
    f6: {
      projectStep: 0,
      blockedSince: "20 May 2026",
      items: {
        address: { state: "done", value: "Am Hafen 12", source: "Asset record" },
        roof: { state: "nofile", hint: "A roof plan or drawing that gives the usable area" },
        bills: { state: "nofile" },
        plans: { state: "nofile" },
        drawings: { state: "nofile" },
        covering: { state: "missing" },
      },
      files: [],
      history: [
        { date: "1 Sep", title: "Added to package", detail: "Solar PV · Estimates" },
      ],
    },
    f2: {
      projectStep: 0,
      blockedSince: "8 Jun 2026",
      items: {
        address: { state: "done", value: "Kelmsdorfer Straße 41", source: "Asset record" },
        roof: {
          state: "disagree",
          options: [
            { value: "610 m²", file: "Kelmsdorfer_roof_A.pdf", page: 1, quote: "Netto-Dachfläche 610 m²" },
            { value: "580 m²", file: "Kelmsdorfer_layout.pdf", page: 3, quote: "Bruttofläche 580 m²" },
          ],
        },
        bills: { state: "na" },
        plans: { state: "done", value: "1 file · Kelmsdorfer_plans.pdf", source: "Kelmsdorfer_plans.pdf" },
        drawings: { state: "done", value: "1 file · Kelmsdorfer_roof_A.pdf", source: "Kelmsdorfer_roof_A.pdf" },
        covering: { state: "done", value: "Gravel", source: "Typed" },
      },
      files: [
        { name: "Kelmsdorfer_roof_A.pdf", type: "PDF", what: "Roof area" },
        { name: "Kelmsdorfer_layout.pdf", type: "PDF", what: "Layout" },
      ],
      history: [
        { date: "1 Sep", title: "Added to package", detail: "Solar PV · Estimates" },
        { date: "12 Jun", title: "File added", detail: "Kelmsdorfer_roof_A.pdf" },
      ],
    },
    f8: {
      projectStep: 0,
      blockedSince: "6 Nov 2026",
      items: {
        address: { state: "done", value: "Brückenstraße 5", source: "Asset record" },
        roof: {
          state: "confirm",
          found: {
            value: "420 m²",
            file: "Dachplan_Halle_A.pdf",
            page: 2,
            quote: "Nutzfläche Dach 420 m²",
          },
        },
        bills: { state: "nofile" },
        plans: { state: "done", value: "1 file · Dachplan_Halle_A.pdf", source: "Dachplan_Halle_A.pdf" },
        drawings: { state: "nofile" },
        covering: { state: "missing" },
      },
      files: [{ name: "Dachplan_Halle_A.pdf", type: "PDF", what: "Roof plan" }],
      history: [
        { date: "1 Sep", title: "Added to package", detail: "Solar PV · Estimates" },
        { date: "28 Oct", title: "File added", detail: "Dachplan_Halle_A.pdf" },
      ],
    },
    f3: {
      projectStep: 1,
      estimateStartedOn: "30 Oct 2026",
      items: {
        address: { state: "done", value: "Kervelstraat 14", source: "Asset record" },
        roof: { state: "done", value: "860 m²", source: "Kervelstraat_plans.pdf, page 1" },
        bills: { state: "done", value: "12 months", source: "Bills_2025.zip" },
        plans: { state: "done", value: "1 file · Kervelstraat_plans.pdf", source: "Kervelstraat_plans.pdf" },
        drawings: { state: "done", value: "1 file · Kervelstraat_roof.pdf", source: "Kervelstraat_roof.pdf" },
        covering: { state: "done", value: "PVC membrane", source: "Typed" },
      },
      files: [
        { name: "Kervelstraat_plans.pdf", type: "PDF", what: "Plans" },
        { name: "Bills_2025.zip", type: "ZIP", what: "Bills" },
      ],
      history: [
        { date: "1 Sep", title: "Added to package", detail: "Solar PV · Estimates" },
        { date: "30 Oct", title: "Estimate started", detail: "Roof area 860 m²" },
        {
          date: "28 Oct",
          title: "Usable roof area added",
          detail: "860 m² · from Kervelstraat_plans.pdf, page 1",
        },
      ],
    },
    f1: {
      projectStep: 0,
      items: {
        address: { state: "done", value: "Halverkamp 19", source: "Asset record" },
        roof: { state: "done", value: "540 m²", source: "Roof_layout_HH.pdf, page 1" },
        bills: { state: "done", value: "1 file · Halverkamp_bills.pdf", source: "Halverkamp_bills.pdf" },
        plans: { state: "done", value: "1 file · Halverkamp_plans.pdf", source: "Halverkamp_plans.pdf" },
        drawings: { state: "done", value: "1 file · Roof_layout_HH.pdf", source: "Roof_layout_HH.pdf" },
        covering: { state: "missing" },
      },
      files: [
        { name: "Roof_layout_HH.pdf", type: "PDF", what: "Roof drawings" },
        { name: "Halverkamp_bills.pdf", type: "PDF", what: "Consumption data" },
        { name: "Halverkamp_plans.pdf", type: "PDF", what: "Site or floor plans" },
      ],
      history: [
        { date: "1 Sep", title: "Added to package", detail: "Solar PV · Estimates" },
        {
          date: "22 Oct",
          title: "Usable roof area added",
          detail: "540 m² · from Roof_layout_HH.pdf, page 1",
        },
        { date: "22 Oct", title: "File added", detail: "Halverkamp_bills.pdf" },
      ],
    },
    f5: {
      projectStep: 0,
      items: {
        address: { state: "done", value: "Lindenhof 3", source: "Asset record" },
        roof: { state: "done", value: "720 m²", source: "Lindenhof_roof.pdf" },
        bills: { state: "done", value: "1 file · Lindenhof_bills.pdf", source: "Lindenhof_bills.pdf" },
        plans: { state: "done", value: "1 file · Lindenhof_plans.pdf", source: "Lindenhof_plans.pdf" },
        drawings: { state: "done", value: "1 file · Lindenhof_roof.pdf", source: "Lindenhof_roof.pdf" },
        covering: { state: "done", value: "Bitumen", source: "Typed" },
      },
      files: [
        { name: "Lindenhof_bills.pdf", type: "PDF", what: "Consumption data" },
        { name: "Lindenhof_plans.pdf", type: "PDF", what: "Site or floor plans" },
        { name: "Lindenhof_roof.pdf", type: "PDF", what: "Roof drawings" },
      ],
      history: [
        { date: "1 Sep", title: "Added to package", detail: "Solar PV · Estimates" },
      ],
    },
  };
}
