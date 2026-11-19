/**
 * Supplier portal: the Tenders list (C11, option B without the preview).
 * Rows mirror the old portal's tenders (comparison-pricing `/supplier/tenders`)
 * plus the Blackpool concept tender. Only Blackpool has a tender page.
 */

export type ListGroup = "you" | "progress" | "closed";
export type ListSolution = "solar" | "led" | "heat-pump" | "ev";

export type TenderRow = {
  id: string;
  solution: ListSolution;
  title: string;
  /** Customer, when the platform holds it. */
  customer?: string;
  sites: number;
  /** "main · detail" pair, the same words as the offer card. */
  next: { main: string; detail?: string };
  group: ListGroup;
  /** Plain status for rows that don't need the supplier. */
  status?: string;
  /** Invited and not opened yet. */
  unopened?: boolean;
  href?: string;
};

export const SOLUTION_ICON: Record<ListSolution, { src: string; label: string }> = {
  solar: { src: "/icons/services/solar-pv.png", label: "Solar PV" },
  led: { src: "/icons/services/led.png", label: "LED lighting" },
  "heat-pump": { src: "/icons/services/heat-pump.png", label: "Heat pump" },
  ev: { src: "/icons/services/ev-charging.png", label: "EV charging" },
};

export const SUPPLIER_NAME = "Des Renewables Ltd";
export const SUPPLIER_INITIALS = "DR";

export const TENDER_ROWS: TenderRow[] = [
  {
    id: "blackpool-pv",
    solution: "solar",
    title: "Solar PV on 3 roofs in Blackpool",
    customer: "Blackpool Pleasure Beach",
    sites: 3,
    next: { main: "Indicative offer due 9 May", detail: "New invitation" },
    group: "you",
    unopened: true,
    href: "/concept/supplier/tenders/blackpool-pv",
  },
  {
    id: "led-waldemarstrasse",
    solution: "led",
    title: "LED – Waldemarstraße",
    sites: 1,
    next: { main: "Indicative offer due 14 Dec", detail: "Not started" },
    group: "you",
  },
  {
    id: "yugo-gsa",
    solution: "solar",
    title: "Yugo/GSA – Student Housing Portfolio",
    sites: 1,
    next: { main: "Finish your offer", detail: "due 7 Jan" },
    group: "you",
  },
  {
    id: "solar-q2",
    solution: "solar",
    title: "Solar Q2 – Apartments",
    sites: 1,
    next: { main: "Offer sent", detail: "you can change it until 7 May" },
    group: "progress",
    status: "Offer sent",
  },
  {
    id: "ev-midsummer",
    solution: "ev",
    title: "EV Charging – Midsummer Place",
    sites: 1,
    next: { main: "Offer sent", detail: "deadline was 15 Mar" },
    group: "progress",
    status: "Offer sent",
  },
  {
    id: "ashp-bremerhaven",
    solution: "heat-pump",
    title: "Replace Boiler with ASHP – 25-210kW – Bremerhaven 27570",
    sites: 1,
    next: { main: "No offer sent", detail: "deadline was 20 Dec" },
    group: "closed",
    status: "Closed",
  },
];

export const GROUPS: Array<{ id: ListGroup; label: string }> = [
  { id: "you", label: "Needs you" },
  { id: "progress", label: "In progress" },
  { id: "closed", label: "Closed" },
];
