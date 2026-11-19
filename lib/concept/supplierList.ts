/**
 * Supplier portal: the Tenders list (C11, option B without the preview).
 * Rows mirror the old portal's tenders (comparison-pricing `/supplier/tenders`)
 * plus the Blackpool concept tender. Every row opens a tender page in its state;
 * only Blackpool has its own brief, sites and documents (the others reuse them).
 */

export type ListGroup = "you" | "progress" | "closed";
export type ListSolution = "solar" | "led" | "heat-pump" | "ev" | "battery" | "cooling";

/** The tender's own stages, the same as the StageList on the tender page. */
export type ListStage = "Indicative offer" | "Shortlist" | "Site visit" | "Final offer";

/** Where the tender is for this supplier: drives the list row and the tender page. */
export type TenderState =
  | "new"
  | "notStarted"
  | "started"
  | "sent"
  | "shortlisted"
  | "visitDates"
  | "visitBooked"
  | "notShortlisted"
  | "declined"
  | "missed";

/** States after the indicative-offer deadline: the offer card is replaced by the outcome card. */
export const AFTER_DEADLINE: TenderState[] = [
  "shortlisted",
  "visitDates",
  "visitBooked",
  "notShortlisted",
  "declined",
  "missed",
];

export type TenderRow = {
  id: string;
  solution: ListSolution;
  title: string;
  /** Customer, when the platform holds it. */
  customer?: string;
  sites: number;
  /** Where the tender is for this supplier (for Closed: where it ended). */
  stage: ListStage;
  /** "main · detail" pair, the same words as the offer card. */
  next: { main: string; detail?: string };
  group: ListGroup;
  state: TenderState;
  /** Invited and not opened yet. */
  unopened?: boolean;
  href?: string;
};

export const SOLUTION_ICON: Record<ListSolution, { src: string; label: string }> = {
  solar: { src: "/icons/services/solar-pv.png", label: "Solar PV" },
  led: { src: "/icons/services/led.png", label: "LED lighting" },
  "heat-pump": { src: "/icons/services/heat-pump.png", label: "Heat pump" },
  ev: { src: "/icons/services/ev-charging.png", label: "EV charging" },
  battery: { src: "", label: "Battery storage" },
  cooling: { src: "", label: "Air conditioning" },
};

export const SUPPLIER_NAME = "Des Renewables Ltd";
export const SUPPLIER_INITIALS = "DR";

/**
 * One tender per state, so every state can be seen at once.
 * Names: David's v7 tenders (118, 1790, 1798, 1864) and the old portal list.
 * Real: Blackpool's 9 May, Sirius's 23 Oct (tender closes) and the old portal's
 * deadlines. Other dates are examples.
 */
export const TENDER_ROWS: TenderRow[] = [
  {
    id: "blackpool-pv",
    state: "new",
    href: "/concept/supplier/tenders/blackpool-pv",
    solution: "solar",
    title: "Solar PV on 3 roofs in Blackpool",
    customer: "Blackpool Pleasure Beach",
    sites: 3,
    stage: "Indicative offer",
    next: { main: "Indicative offer due 9 May", detail: "New invitation" },
    group: "you",
    unopened: true,
  },
  {
    id: "sirius-norderstedt",
    state: "notStarted",
    href: "/concept/supplier/tenders/sirius-norderstedt",
    solution: "led",
    title: "Lighting for Sirius Norderstedt (Innenbereich)",
    customer: "Sirius Renewable Energy",
    sites: 1,
    stage: "Indicative offer",
    next: { main: "Indicative offer due 23 Oct", detail: "Not started" },
    group: "you",
  },
  {
    id: "hines-hainichen",
    state: "started",
    href: "/concept/supplier/tenders/hines-hainichen",
    solution: "solar",
    title: "Solar PV for Hines Hainichen",
    customer: "Hines (HECF)",
    sites: 3,
    stage: "Indicative offer",
    next: { main: "Finish your offer", detail: "2 files uploaded · due 14 Nov" },
    group: "you",
  },
  {
    id: "yugo-gsa",
    state: "shortlisted",
    href: "/concept/supplier/tenders/yugo-gsa",
    solution: "solar",
    title: "Yugo/GSA – Student Housing Portfolio",
    sites: 1,
    stage: "Shortlist",
    next: { main: "Sign the Commission Form", detail: "on the shortlist since 30 Apr" },
    group: "you",
  },
  {
    id: "stayery-frankfurt",
    state: "visitDates",
    href: "/concept/supplier/tenders/stayery-frankfurt",
    solution: "cooling",
    title: "Design and specification for STAYERY Frankfurt serviced apartments",
    customer: "Stayery",
    sites: 1,
    stage: "Site visit",
    next: { main: "Add your visit date", detail: "form signed 12 May" },
    group: "you",
  },
  {
    id: "solar-q2",
    state: "sent",
    href: "/concept/supplier/tenders/solar-q2",
    solution: "solar",
    title: "Solar Q2 – Apartments",
    sites: 1,
    stage: "Indicative offer",
    next: { main: "Offer sent", detail: "you can change it until 7 May" },
    group: "progress",
  },
  {
    id: "led-waldemarstrasse",
    state: "visitBooked",
    href: "/concept/supplier/tenders/led-waldemarstrasse",
    solution: "led",
    title: "LED – Waldemarstraße",
    sites: 1,
    stage: "Site visit",
    next: { main: "Site visit 14 May", detail: "then your final offer" },
    group: "progress",
  },
  {
    id: "ev-midsummer",
    state: "notShortlisted",
    href: "/concept/supplier/tenders/ev-midsummer",
    solution: "ev",
    title: "EV Charging – Midsummer Place",
    sites: 1,
    stage: "Shortlist",
    next: { main: "Not shortlisted", detail: "feedback from CQuel" },
    group: "closed",
  },
  {
    id: "battery-industrial",
    state: "declined",
    href: "/concept/supplier/tenders/battery-industrial",
    solution: "battery",
    title: "Battery Storage – Industrial",
    sites: 3,
    stage: "Indicative offer",
    next: { main: "You declined", detail: "26 Apr" },
    group: "closed",
  },
  {
    id: "ashp-bremerhaven",
    state: "missed",
    href: "/concept/supplier/tenders/ashp-bremerhaven",
    solution: "heat-pump",
    title: "Replace Boiler with ASHP – 25-210kW – Bremerhaven 27570",
    sites: 1,
    stage: "Indicative offer",
    next: { main: "No offer sent", detail: "deadline was 20 Dec" },
    group: "closed",
  },
];

export const GROUPS: Array<{ id: ListGroup; label: string }> = [
  { id: "you", label: "Needs you" },
  { id: "progress", label: "In progress" },
  { id: "closed", label: "Closed" },
];

export const tenderRow = (id: string) => TENDER_ROWS.find((r) => r.id === id);

/** "9 May" from "Indicative offer due 9 May" / "due 14 Nov". */
export function rowDue(row: TenderRow) {
  const m = `${row.next.main} ${row.next.detail ?? ""}`.match(/due (\d{1,2} [A-Z][a-z]{2})/);
  return m?.[1];
}
