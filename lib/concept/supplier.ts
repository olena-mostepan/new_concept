/**
 * Supplier concept: one tender as an invited supplier sees it.
 * Content mirrors the C2 boards (Supplier Tender Page design artifact).
 * Only facts the platform holds; estimates show a "~" before the value (estimate: true). No future dates beyond the tender's own deadline.
 */
import type { Doc } from "./model";
import { SOLUTION_ICON, rowDue, tenderRow } from "./supplierList";
import { hammTender } from "./supplierHamm";

export interface SupplierFact {
  label: string;
  value: string;
  note?: string;
  /** Shown with a "~" before the value. */
  estimate?: boolean;
}

export interface SpecRow {
  label: string;
  value: string;
  note?: string;
  estimate?: boolean;
}

export interface SupplierSite {
  n: number;
  name: string;
  address: string;
  system: string;
  systemNote?: string;
  files: Doc[];
  /** The site a building belongs to, when a site has several buildings (Hamm). The row itself is then a building. */
  group?: string;
  /** Map pin position, % of the map box. */
  pin: { left: number; top: number };
}

export interface FindEntry {
  text: string;
  source: string;
  action: "open" | "download";
  tab?: "overview" | "sites" | "questions";
}


/**
 * The example quote the prototype "reads" when files are picked (C4 + C5 boards).
 * Values are Des Renewables' real tender on this project, as read in David's v7 mock-up.
 */
export interface QuoteFile {
  kind: string;
  meta: string;
}
export interface QuoteQuestion {
  key: string;
  title: string;
  /** What the brief asks, one line. */
  asks: string;
  /** What we read in their files. */
  read: string;
  quote: string;
  source: string;
  question: string;
  kind: "text" | "yesno";
  /** yesno: what the Yes answer needs. */
  followUp?: string;
  /** "Whole tender: answer once", "This offer", "Building: …" (C13). */
  scope?: string;
  /** Asked of every bidder at once, not about this bid only. */
  everyBidder?: boolean;
  /** Answered by a file (C14): the button label, e.g. "Upload certificates". */
  upload?: string;
}
/** How a supplier offers (C12): one offer, one offer in lots, one per site, or several that overlap. */
export type OfferStructure = "one" | "lots" | "perSite" | "overlap";

export const STRUCTURES: Record<OfferStructure, { label: string; text: string; short: string }> = {
  one: { label: "One offer for all of them", text: "One contract, one set of terms, one total.", short: "One offer for all assets" },
  lots: { label: "One offer, in lots", text: "One contract delivered in lots; each asset is in one lot.", short: "One offer, in lots" },
  perSite: { label: "One offer per asset", text: "Each asset priced and awardable on its own.", short: "One offer per asset" },
  overlap: {
    label: "Several offers that overlap",
    text: "Different groupings, each on its own terms. An asset can be in more than one; the customer awards it under one.",
    short: "Several offers that overlap",
  },
};

export interface QuoteExample {
  /** What each picked file is read as, in order. */
  files: QuoteFile[];
  price: { value: string; source: string };
  sitesSource: string;
  start: { value: string; source: string };
  lead: string;
  installation: number;
  commissioning: number;
  durationSource: string;
  warranties: { panels: number; inverters: number; workmanship: number; source: string };
  /** Expected minimums the customer compares against (who sets them: to confirm). */
  expected: { panels: number; workmanship: number };
  kwp: number;
  piInsurance: string;
  alsoInOffer: string[];
  /** Red items only (amber and green stay with Ops). */
  questions: QuoteQuestion[];
  /** Read from the quote; shown as "You assumed" after sending. */
  assumed: string;
  /** Brief in short, under the search in the offer window. */
  briefAsks: string[];
  /** "About this in the brief": the brief's own words for each check row and question. */
  about: Record<string, { title: string; quote: string; source: string; note?: string }>;
  /** The structure read from the quote, and the prices that go with each structure. Split prices are examples. */
  structure: { read: OfferStructure; source: string };
  lots: Array<{ name: string; sites: number[]; price: string }>;
  perSite: Record<number, string>;
  offers: Array<{ key: string; sites: number[]; condition?: string; price: string }>;
  /** File names the prototype uses when a tender opens part-way (else a generic set). */
  fileNames?: string[];
  /** Terms read from the offer, shown as one check row (heat supply contracts). */
  terms?: SpecRow[];
  /** What the per-building figure is, e.g. "Base charge a year, net". */
  priceUnit?: string;
  /** Variants read from the offer (C13): brief = which brief variant it answers. */
  quoteVariants?: Array<{ key: string; label: string; brief: string; note?: string; wholeOnly?: boolean; prices: Record<number, string> }>;
}

export interface SupplierTender {
  id: string;
  icon3d?: string;
  process: Array<{ title: string; detail: string; now?: boolean }>;
  jobLead: string;
  seafront: string;
  map?: { image: string; credit: string; width: number; height: number };
  findSuggestions: string[];
  /** Every fact list on the page uses the same SpecRow shape. */
  jobFacts: SpecRow[];
  priceCells: SpecRow[];
  openCells: SpecRow[];
  contractLine: string;
  /** Offer structures this tender takes, set by Ops with the brief (at least one). */
  structures: OfferStructure[];
  /** "£" by default. */
  currency?: string;
  /** "site" by default; "building" when sites hold several buildings. */
  unitWord?: "site" | "building";
  /** Which check rows apply after price; all three by default. */
  checks?: Array<"start" | "duration" | "warranties">;
  /** Variants the brief defines (C13). Suppliers price only these. */
  variants?: Array<{ key: string; label: string; need: "required" | "optional"; note?: string }>;
  /** What the tender needs, by scope (C13). found = what we read it from. */
  expectedFiles?: Array<{ label: string; scope: "offer" | "tender" | "product" | "building"; need: string; found?: string }>;
  quote: QuoteExample;
  findIndex: FindEntry[];
  service: string;
  title: string;
  customer: string;
  supplier: { name: string; initials: string };
  whyInvited: string;
  facts: SpecRow[];
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
  /** Total files across sites and shared documents. */
  fileCount: number;
  sharedDocs: Doc[];
  questionTopics: string[];
}

export const SUPPLIER_TENDERS: SupplierTender[] = [
  {
    id: "blackpool-pv",
    icon3d: "/concept/supplier/solar-3d.png",
    process: [
      { title: "Indicative offer", detail: "All invited suppliers · now", now: true },
      { title: "Shortlist", detail: "CQuel tells everyone either way" },
      { title: "Site visit", detail: "Shortlisted suppliers see the roofs" },
      { title: "Final offer", detail: "Updated after the visit" },
      { title: "Customer chooses", detail: "After the final offers" },
    ],
    jobLead: "Roof-mounted PV on 3 seafront assets: 2 hotels and 1 restaurant.",
    jobFacts: [
      { label: "Assets", value: "3" },
      { label: "Size", value: "240 kWp", estimate: true },
      { label: "Expected generation", value: "380,000 kWh/yr", estimate: true },
      { label: "Roof space", value: "2,475 m²" },
      { label: "Installation", value: "Off-peak season" },
      { label: "Safety rules", value: "Building Safety Act 2022 · CDM 2015" },
    ],
    seafront: "Seafront: say how you protect panels, frames and fixings from salt air.",
    map: { image: "/concept/supplier/map-blackpool.jpg", credit: "© OpenStreetMap contributors", width: 800, height: 347 },
    priceCells: [
      { label: "Included", value: "Design to handover, grid connection, maintenance" },
      { label: "Not included", value: "PPA financing, arranged separately" },
      { label: "Send us", value: "Your quote. We read the price, start, duration and warranties from it." },
      { label: "Offers this tender takes", value: "One offer for all assets, one offer in lots, or one offer per asset. You can leave assets out." },
    ],
    structures: ["one", "lots", "perSite"],
    openCells: [
      { label: "CQuel is asking the customer", value: "Export limit and DNO position · roof type, age, asbestos, ownership" },
      { label: "Checked at the site visit", value: "Roof strength · Burger King size · access hours · finish date" },
    ],
    contractLine: "Contract with the customer, or the PPA provider if it finances the work. Payment terms are agreed after the site visit.",
    quote: {
      files: [
        { kind: "Quote", meta: "1 page · total price, no breakdown" },
        { kind: "Drawing", meta: "32 pages · design report, 279.84 kWp, 5 inverters" },
        { kind: "Policy", meta: "4 pages · health and safety policy" },
      ],
      price: { value: "£293,478", source: "Quote, page 1" },
      sitesSource: "Quote, page 1",
      structure: { read: "lots", source: "Quote, page 1" },
      lots: [
        { name: "Lot 1", sites: [1, 2], price: "£221,900" },
        { name: "Lot 2", sites: [3], price: "£71,578" },
      ],
      perSite: { 1: "£128,400", 2: "£93,500", 3: "£71,578" },
      offers: [
        { key: "A", sites: [1, 2, 3], condition: "Only if all 3 are awarded", price: "£279,000" },
        { key: "B", sites: [1, 2], price: "£214,000" },
        { key: "C", sites: [1], condition: "Lease instead of purchase", price: "£1,950 a month" },
      ],
      start: { value: "1 Sep", source: "Quote" },
      lead: "6 weeks",
      installation: 28,
      commissioning: 4,
      durationSource: "Quote",
      warranties: { panels: 15, inverters: 10, workmanship: 2, source: "Quote" },
      expected: { panels: 25, workmanship: 5 },
      kwp: 279.84,
      piInsurance: "£10,000,000",
      alsoInOffer: [
        "Own scaffolding company (Three County Scaffolding Ltd)",
        "Robotic panel cleaning",
        "Big Blue Restaurant, which the brief doesn't name",
      ],
      questions: [
        {
          key: "seafront",
          title: "Seafront protection",
          asks: "The brief asks how panels, frames and fixings are protected from salt air and seagulls",
          read: "LONGi modules and Solis inverters are named. Nothing about salt air, corrosion or seagulls.",
          quote: "5 x Solis Inverters which will be sourced from our UK Wholesaler",
          source: "Tender form",
          question: "Which salt-air and seagull protection is in your price?",
          kind: "text",
        },
        {
          key: "offpeak",
          title: "Off-peak installation",
          asks: "The brief asks for installation in the park's off-peak season (typically winter)",
          read: "Preferred start 1 Sep. Off-peak isn't mentioned.",
          quote: "preferred_start_date: 2025-09-01",
          source: "Tender form",
          question: "Can you install in the off-peak (winter) season?",
          kind: "yesno",
          followUp: "Which months?",
        },
      ],
      assumed: "Export limit 200 kW · no asbestos · roofs take the load",
      briefAsks: [
        "Salt-air and seagull protection",
        "Building Safety Act 2022 · CDM 2015",
        "Installation in the off-peak season",
        "Seaside or theme park case studies",
      ],
      about: {
        price: {
          title: "Total price",
          quote: "Bidders are asked to price surveys, design, permits, connections, installation, access and making good, testing, commissioning and handover, operation and maintenance.",
          source: "Tender brief · What you price",
          note: "Not included: PPA financing, tendered separately. One total for every asset; it isn't binding.",
        },
        sites: {
          title: "Assets covered",
          quote: "Solar PV of approx. 125 kWp at the Boulevard Hotel. Solar PV of approx. 115 kWp at the Big Blue Hotel.",
          source: "Tender brief · The job",
          note: "Burger King is sized at the site visit. If you can't do an asset, say which.",
        },
        start: {
          title: "Start",
          quote: "Schedule installation in the off-peak season (typically winter, when the park has reduced operations).",
          source: "Tender brief · The job",
          note: "Contract start ~Sep (estimate).",
        },
        duration: {
          title: "Duration",
          quote: "Schedule installation in the off-peak season (typically winter, when the park has reduced operations).",
          source: "Tender brief · The job",
          note: "The customer compares lead, installation and commissioning time under Speed.",
        },
        warranties: {
          title: "Warranties",
          quote: "Standards and warranties: adhere to the UK Building Safety Act 2022; comply with all relevant UK Building Regulations.",
          source: "Tender brief · How the customer chooses",
          note: "Expected: panels at least 25 years, workmanship at least 5. The customer compares warranties under Quality.",
        },
        seafront: {
          title: "Seafront protection",
          quote: "System design must suit salt air exposure at the seaside site.",
          source: "Tender brief · The job",
          note: "Say how you protect panels, frames and fixings from salt air.",
        },
        offpeak: {
          title: "Off-peak installation",
          quote: "Schedule installation in the off-peak season (typically winter, when the park has reduced operations).",
          source: "Tender brief · The job",
        },
      },
    },
    findSuggestions: ["Export limit", "Not in my price", "Roof space", "Warranties"],
    findIndex: [
      { text: "Roof space: 2,475 m² in total, 3 assets", source: "The job · Overview", action: "open", tab: "overview" },
      { text: "Drawings and roof layouts", source: "ZIP · Boulevard Hotel, Big Blue Hotel, Burger King", action: "download", tab: "sites" },
      { text: "Roof type, age, asbestos and ownership: not known yet, CQuel is asking the customer", source: "What nobody knows yet · Overview", action: "open", tab: "overview" },
      { text: "Roof strength is checked at the site visit", source: "What nobody knows yet · Overview", action: "open", tab: "overview" },
      { text: "Export limit and DNO position: not known yet, CQuel is asking the customer", source: "What nobody knows yet · Overview", action: "open", tab: "overview" },
      { text: "Not in your price: PPA financing, arranged separately", source: "What you price · Overview", action: "open", tab: "overview" },
      { text: "Included: design to handover, grid connection, maintenance", source: "What you price · Overview", action: "open", tab: "overview" },
      { text: "Warranties: we read them from your quote", source: "What you price · Overview", action: "open", tab: "overview" },
      { text: "Expected generation: 380,000 kWh a year (estimate)", source: "The job · Overview", action: "open", tab: "overview" },
      { text: "Half-hourly data (electricity use)", source: "XLSX · Boulevard Hotel", action: "download", tab: "sites" },
      { text: "Project Commission Form: CQuel's commission on work you win", source: "PDF · Documents for all assets", action: "download", tab: "sites" },
      { text: "Safety rules: Building Safety Act 2022, CDM 2015", source: "The job · Overview", action: "open", tab: "overview" },
      { text: "System design must suit salt air exposure at the seaside site", source: "Tender brief · The job", action: "open", tab: "overview" },
      { text: "Schedule installation in the off-peak season (typically winter, when the park has reduced operations)", source: "Tender brief · The job", action: "open", tab: "overview" },
    ],
    service: "Solar PV",
    title: "Solar PV on 3 roofs in Blackpool",
    customer: "Blackpool Pleasure Beach",
    supplier: { name: "Des Renewables Ltd", initials: "DR" },
    whyInvited: "You install commercial solar PV, and you're 41 miles from the assets.",
    facts: [
      { label: "Budget", value: "£350,000", estimate: true },
      { label: "Budget approved", value: "No" },
      { label: "Contract start", value: "Sep", estimate: true },
    ],
    status: { label: "Not started", detail: "Indicative offer due 9 May" },
    round: { label: "Round 1 of 2", due: "due 9 May" },
    offer: {
      title: "Send an indicative offer",
      text: "Upload your quote with one total for every asset. It isn't binding: you update it after the site visit.",
      footer: "Commission only on work you win",
    },
    offerSteps: [
      { key: "upload", label: "Upload your quote", text: "PDF or Excel" },
      { key: "check", label: "Check what we read", text: "Price, start, duration, warranties" },
      { key: "send", label: "Send it", text: "You can edit it until the deadline" },
    ],
    next: [
      { title: "Indicative offer", detail: "Now · due 9 May", now: true },
      { title: "Shortlist", detail: "We tell you either way" },
      { title: "Site visit", detail: "You see the roofs and sign the commission form" },
      { title: "Final offer", detail: "Your quote, updated" },
      { title: "Customer chooses" },
    ],
    paid: "A commission only on work you win, set out in the Project Commission Form. You sign it before the site visit.",
    priceAndSend: [
      { label: "Your price covers", value: "Surveys, design, permits and grid connection, supply and installation, access and making good, testing and handover, maintenance" },
      { label: "Not in your price", value: "PPA financing. The customer buys the power through a PPA, arranged separately." },
      { label: "Assets", value: "All 3. If you can't do one, say which in your quote." },
      { label: "We need", value: "Your quote with a total price. We read the start date, duration and warranties from it." },
      { label: "Also helps", value: "A price breakdown (our template is in Assets & documents) and seaside or theme park case studies" },
    ],
    job: [
      { label: "Assets", value: "3: 2 seafront hotels and 1 restaurant, Blackpool" },
      { label: "System", value: "Roof-mounted PV. Boulevard Hotel 125 kWp, Big Blue Hotel 115 kWp, Burger King sized at the site visit" },
      { label: "Roof space", value: "2,475 m² in total, 3 assets" },
      { label: "Expected generation", value: "380,000 kWh a year · Estimate" },
      { label: "Seafront", value: "Salt air. Say how you protect panels, frames and fixings." },
      { label: "Timing", value: "Contract from Sep (estimate). Installation in the off-peak season, while the park has reduced operations." },
      { label: "Safety rules", value: "Building Safety Act 2022, CDM 2015" },
    ],
    atVisit: [
      { label: "Roof strength", value: "A structural check is part of the visit" },
      { label: "Burger King size", value: "Sized at the site visit" },
      { label: "Access", value: "Working hours and access while the hotels stay open" },
      { label: "Finish date", value: "The customer confirms it" },
    ],
    notKnown: [
      { label: "Grid connection", value: "Export limit and DNO position", note: "CQuel is asking the customer" },
      { label: "Roofs", value: "Type, age, asbestos and building ownership", note: "CQuel is asking the customer" },
    ],
    criteria: [
      { icon: "money", title: "Price", text: "Your total for every asset" },
      { icon: "time", title: "Timing", text: "Start and how long it takes" },
      { icon: "best", title: "Quality", text: "Warranties, kit, seafront protection" },
    ],
    contract: [
      { label: "Customer decides", value: "After the final offers" },
      { label: "Contract with", value: "The customer", note: "Or the PPA provider if it finances the work" },
      { label: "Payment terms", value: "Agreed in the contract", note: "After the site visit" },
      { label: "CQuel commission", value: "Only on work you win", note: "A percentage of contract value" },
    ],
    fileCount: 7,
    sitesHint: "Price all 3. If you can't do one, say which in your quote.",
    distance: "41 miles from you",
    sites: [
      {
        n: 1,
        name: "Boulevard Hotel",
        address: "Ocean Boulevard, Blackpool FY4 1PL",
        system: "125 kWp",
        systemNote: "Estimate",
        files: [
          { name: "Half-hourly data", type: "XLSX", meta: "electricity use", action: "Download" },
          { name: "Drawings", type: "ZIP", meta: "roof layouts and photos", action: "Download" },
        ],
        pin: { left: 51, top: 12 },
      },
      {
        n: 2,
        name: "Big Blue Hotel",
        address: "Clifton Drive, Blackpool FY4 1PL",
        system: "115 kWp",
        systemNote: "Estimate",
        files: [{ name: "Drawings", type: "ZIP", meta: "roof layouts and photos", action: "Download" }],
        pin: { left: 52, top: 86 },
      },
      {
        n: 3,
        name: "Burger King",
        address: "525 Promenade, Blackpool FY4 1EZ",
        system: "Sized at the site visit",
        files: [{ name: "Drawings", type: "ZIP", meta: "roof layouts and photos", action: "Download" }],
        pin: { left: 40, top: 16 },
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

SUPPLIER_TENDERS.push(hammTender(SUPPLIER_TENDERS[0]));

/** Prototype: tenders that show the other structure cases. */
const STRUCTURE_OVERRIDES: Record<string, Partial<SupplierTender>> = {
  // Ops enabled one structure only: no choice row.
  "sirius-norderstedt": {
    structures: ["one"],
    priceCells: [
      ...SUPPLIER_TENDERS[0].priceCells.slice(0, 3),
      { label: "Offers this tender takes", value: "One offer for all assets. You can leave assets out." },
    ],
    quote: { ...SUPPLIER_TENDERS[0].quote, structure: { read: "one", source: "Quote, page 1" } },
  },
  // All four enabled; the quote has overlapping offers.
  "hines-hainichen": {
    structures: ["one", "lots", "perSite", "overlap"],
    priceCells: [
      ...SUPPLIER_TENDERS[0].priceCells.slice(0, 3),
      { label: "Offers this tender takes", value: "Any: one offer, in lots, per asset, or several that overlap. You can leave assets out." },
    ],
    quote: { ...SUPPLIER_TENDERS[0].quote, structure: { read: "overlap", source: "Quote, pages 1–2" } },
  },
};

/** "Heat pump" → "heat pump", but "EV charging" and "LED lighting" stay. */
const lowerFirst = (s: string) => (/^[A-Z]{2}/.test(s) ? s : s[0].toLowerCase() + s.slice(1));

/**
 * A tender by id. Only Blackpool has its own content; the other list rows reuse
 * Blackpool's brief, sites and documents with their own name, customer, solution
 * and due date, so every state can be opened.
 */
export const supplierTender = (id: string): SupplierTender | undefined => {
  const own = SUPPLIER_TENDERS.find((t) => t.id === id);
  if (own) return own;
  const row = tenderRow(id);
  if (!row) return undefined;
  const base = SUPPLIER_TENDERS[0];
  const due = rowDue(row);
  return {
    ...base,
    id: row.id,
    title: row.title,
    customer: row.customer ?? "",
    service: SOLUTION_ICON[row.solution].label,
    icon3d: row.solution === "solar" ? base.icon3d : SOLUTION_ICON[row.solution].src || undefined,
    whyInvited:
      row.solution === "solar"
        ? base.whyInvited
        : `You install ${lowerFirst(SOLUTION_ICON[row.solution].label)} and work in this area.`,
    round: due ? { ...base.round, due: `due ${due}` } : base.round,
    ...STRUCTURE_OVERRIDES[row.id],
  };
};
