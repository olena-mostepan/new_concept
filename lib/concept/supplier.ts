/**
 * Supplier concept: one tender as an invited supplier sees it.
 * Content mirrors the C2 boards (Supplier Tender Page design artifact).
 * Only facts the platform holds; estimates say "Estimate". No future dates beyond the tender's own deadline.
 */
import type { Doc } from "./model";

export interface SupplierFact {
  label: string;
  value: string;
  note?: string;
}

export interface SpecRow {
  label: string;
  value: string;
  note?: string;
}

export interface SupplierSite {
  n: number;
  name: string;
  address: string;
  system: string;
  systemNote?: string;
  files: Doc[];
  /** Map pin position, % of the map box. */
  pin: { left: number; top: number };
}

export interface SupplierTender {
  id: string;
  service: string;
  title: string;
  customer: string;
  supplier: { name: string; initials: string };
  whyInvited: string;
  facts: SupplierFact[];
  status: { label: string; detail: string };
  round: { label: string; due: string };
  offer: { title: string; text: string; footer: string };
  offerSteps: Array<{ key: string; label: string; text: string }>;
  next: Array<{ title: string; detail?: string; now?: boolean }>;
  paid: string;
  priceAndSend: SpecRow[];
  job: SpecRow[];
  atVisit: SpecRow[];
  notKnown: SpecRow[];
  criteria: Array<{ icon: string; title: string; text: string }>;
  contract: SpecRow[];
  sitesHint: string;
  distance: string;
  sites: SupplierSite[];
  sharedDocs: Doc[];
  questionTopics: string[];
}

export const SUPPLIER_TENDERS: SupplierTender[] = [
  {
    id: "blackpool-pv",
    service: "Solar PV",
    title: "Solar PV on 3 roofs in Blackpool",
    customer: "Blackpool Pleasure Beach",
    supplier: { name: "Des Renewables Ltd", initials: "DR" },
    whyInvited: "You install commercial solar PV, and you're 41 miles from the sites.",
    facts: [
      { label: "Size", value: "About 240 kWp", note: "Two hotels, plus Burger King" },
      { label: "Budget", value: "About £350,000", note: "Not approved yet" },
      { label: "Contract start", value: "Sep", note: "Estimate" },
      { label: "Installation", value: "Off-peak season" },
    ],
    status: { label: "Not started", detail: "Indicative offer due 9 May" },
    round: { label: "Round 1 of 2", due: "due 9 May" },
    offer: {
      title: "Send an indicative offer",
      text: "A first price from the information here. It isn't binding: you update it after the site visit.",
      footer: "About 10 minutes to upload · Commission only on work you win",
    },
    offerSteps: [
      { key: "upload", label: "Upload your quote", text: "PDF or Excel. One total price for the three sites is enough." },
      { key: "check", label: "Check what we read", text: "Price, start date, how long the work takes, warranties." },
      { key: "send", label: "Send it", text: "Edit it until 9 May. Update it after the site visit." },
    ],
    next: [
      { title: "Indicative offer", detail: "Now · due 9 May", now: true },
      { title: "Shortlist", detail: "We tell you either way" },
      { title: "Site visit", detail: "You see the roofs and sign the commission form" },
      { title: "Final offer", detail: "Your quote, updated" },
      { title: "Customer chooses" },
    ],
    paid: "You pay CQuel a commission only on work you win. It's set out in the Project Commission Form, which you sign before the site visit.",
    priceAndSend: [
      { label: "Your price covers", value: "Surveys, design, permits and grid connection, supply and installation, access and making good, testing and handover, maintenance" },
      { label: "Not in your price", value: "PPA financing. The customer buys the power through a PPA, arranged separately." },
      { label: "Sites", value: "All three. If you can't do one, say which in your quote." },
      { label: "We need", value: "Your quote with a total price. We read the start date, duration and warranties from it." },
      { label: "Also helps", value: "A price breakdown (our template is in Sites & documents) and seaside or theme park case studies" },
    ],
    job: [
      { label: "Sites", value: "Two seafront hotels and a restaurant, Blackpool" },
      { label: "System", value: "Roof-mounted PV. Boulevard Hotel about 125 kWp, Big Blue Hotel about 115 kWp, Burger King sized at the site visit" },
      { label: "Roof space", value: "2,475 m² across the three sites" },
      { label: "Expected generation", value: "About 380,000 kWh a year · Estimate" },
      { label: "Seafront", value: "Salt air. Say how you protect panels, frames and fixings." },
      { label: "Timing", value: "Contract from Sep (estimate). Installation in the off-peak season, while the park has reduced operations." },
      { label: "Safety rules", value: "Building Safety Act 2022, CDM 2015" },
    ],
    atVisit: [
      { label: "Roof strength", value: "A structural check is part of the visit" },
      { label: "Burger King size", value: "Sized on site" },
      { label: "Access", value: "Working hours and access while the hotels stay open" },
      { label: "Finish date", value: "The customer confirms it" },
    ],
    notKnown: [
      { label: "Grid connection", value: "Export limit and DNO position", note: "CQuel is asking the customer" },
      { label: "Roofs", value: "Type, age, asbestos and building ownership", note: "CQuel is asking the customer" },
    ],
    criteria: [
      { icon: "money", title: "Price", text: "Your total for the three sites" },
      { icon: "time", title: "Timing", text: "When you can start and how long it takes" },
      { icon: "best", title: "Quality of your offer", text: "Warranties, kit, seafront protection, case studies" },
    ],
    contract: [
      { label: "Customer decides", value: "After the final offers" },
      { label: "Contract with", value: "The customer", note: "Or the PPA provider if it finances the work" },
      { label: "Payment terms", value: "Agreed in the contract", note: "After the site visit" },
      { label: "CQuel commission", value: "Only on work you win", note: "A percentage of contract value" },
    ],
    sitesHint: "Price all three. If you can't do one, say which in your quote.",
    distance: "41 miles from you",
    sites: [
      {
        n: 1,
        name: "Boulevard Hotel",
        address: "Ocean Boulevard, Blackpool FY4 1PL",
        system: "About 125 kWp",
        systemNote: "Estimate",
        files: [
          { name: "Half-hourly data", type: "XLSX", meta: "electricity use", action: "Download" },
          { name: "Drawings", type: "ZIP", meta: "roof layouts and photos", action: "Download" },
        ],
        pin: { left: 46, top: 26 },
      },
      {
        n: 2,
        name: "Big Blue Hotel",
        address: "Clifton Drive, Blackpool FY4 1PL",
        system: "About 115 kWp",
        systemNote: "Estimate",
        files: [{ name: "Drawings", type: "ZIP", meta: "roof layouts and photos", action: "Download" }],
        pin: { left: 52, top: 48 },
      },
      {
        n: 3,
        name: "Burger King",
        address: "525 Promenade, Blackpool FY4 1EZ",
        system: "Sized at the site visit",
        files: [{ name: "Drawings", type: "ZIP", meta: "roof layouts and photos", action: "Download" }],
        pin: { left: 44, top: 68 },
      },
    ],
    sharedDocs: [
      { name: "Project design document", type: "PDF", meta: "from the customer", action: "Download", view: true },
      { name: "Project Commission Form", type: "PDF", meta: "to sign before the site visit", action: "Download", view: true },
      { name: "Price breakdown template", type: "XLSX", meta: "optional", action: "Download" },
    ],
    questionTopics: ["The whole tender", "Boulevard Hotel", "Big Blue Hotel", "Burger King", "Commission and contract"],
  },
];

export const supplierTender = (id: string) => SUPPLIER_TENDERS.find((t) => t.id === id);
