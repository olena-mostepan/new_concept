/**
 * Supplier concept · a second tender with real multi-building data (C13, 24 Nov):
 * David's v9 "Hamm heat pumps: heat-as-a-service tender" for Aroundtown, Batch 1 Hamm.
 * 4 sites with 10 buildings. The quote read is LAVA's portfolio offer (one contract in
 * 3 clusters, 4 variants). Every figure is from David's v9 data (briefs, LAVA's files).
 */
import type { SpecRow, SupplierTender } from "./supplier";

const B = [
  { n: 1, site: "Sachsenschleife", name: "Sachsenschleife 10", homes: 8, kw: 46, existing: "Viessmann Atola-RN, 53.1 kW, 1998" },
  { n: 2, site: "Sachsenschleife", name: "Sachsenschleife 12-14", homes: 16, kw: 97, existing: "Viessmann Vitogas 200-F, 78.3 kW, 2009" },
  { n: 3, site: "Sachsenschleife", name: "Sachsenschleife 16-18", homes: 16, kw: 84, existing: "Viessmann Atola-RN, 70.7 kW, 1998" },
  { n: 4, site: "Sachsenschleife", name: "Sachsenschleife 20-22", homes: 12, kw: 75, existing: "Wolf CGB-2-75, 75.0 kW, 2021, condensing" },
  { n: 5, site: "Sachsenschleife", name: "Sachsenschleife 24-26", homes: 12, kw: 75, existing: "Viessmann Atola-RN, 70.7 kW, 2001" },
  { n: 6, site: "Beukenbergstraße", name: "Beukenbergstraße 2", homes: 4, kw: 36, existing: "Vaillant VKK 476/4, 45.0 kW, 2007 (plant room in no. 4)" },
  { n: 7, site: "Beukenbergstraße", name: "Beukenbergstraße 6", homes: 6, kw: 31, existing: "Viessmann Vitogas 100, 29.0 kW, 2005" },
  { n: 8, site: "Beukenbergstraße", name: "Beukenbergstraße 16", homes: 6, kw: 34, existing: "Viessmann Atola AHA, 40.0 kW, 1995" },
  { n: 9, site: "Pottkamp", name: "Pottkamp 5-7", homes: 12, kw: 68, existing: "Viessmann Vitogas 100, 66.2 kW, 2003" },
  { n: 10, site: "Grünstraße and Richard-Wagner-Straße", name: "Grünstraße 78b-78c + Richard-Wagner-Straße 11", homes: 19, kw: 86, existing: "Brötje, 170.0 kW, 2007, condensing" },
];

/** Pin positions (% of the map box), from OpenStreetMap geocoding of each address; buildings on one street are spread along it. */
const PINS = [
  { left: 26.5, top: 45.5 },
  { left: 25, top: 45.5 },
  { left: 23.5, top: 45.4 },
  { left: 22, top: 45.2 },
  { left: 20.5, top: 45 },
  { left: 47.5, top: 37 },
  { left: 45.9, top: 37.2 },
  { left: 43.8, top: 37.7 },
  { left: 40, top: 30 },
  { left: 77.6, top: 65.5 },
];

const eur = (n: number) => `€${n.toLocaleString("en-GB")}`;
const row = (xs: number[]) => Object.fromEntries(xs.map((x, i) => [i + 1, eur(x)]));

const main15 = [15654, 25560, 23546, 21042, 21042, 12999, 11900, 12363, 19018, 24620];
const main10 = [20054, 32317, 29838, 26709, 26709, 16687, 15281, 15849, 24077, 31189];
const b15 = [10991, 18482, 16941, 15103, 15103, 8947, 8287, 8648, 13687, 17716];
const b10 = [13626, 22567, 20737, 18526, 18526, 11129, 10298, 10730, 16733, 21670];

const terms: SpecRow[] = [
  { label: "Working price", value: "6.56 ct/kWh energy + 0.25 ct/kWh CO₂, net, the same for every building" },
  { label: "Metering and billing", value: "In the base charge; one MID heat meter per building" },
  { label: "Indexation", value: "Base year 2025, Destatis indices" },
  { label: "Funding", value: "BEG funding included in the prices; LAVA applies" },
  { label: "District heating", value: "Plant taken over at residual book value if Stadtwerke Hamm connects later" },
];

export function hammTender(base: SupplierTender): SupplierTender {
  return {
    ...base,
    id: "hamm-heat-pumps",
    icon3d: "/icons/services/heat-pump.png",
    currency: "€",
    unitWord: "building",
    checks: [],
    process: [
      { title: "Indicative offer", detail: "10 and 15 years · now", now: true },
      { title: "Shortlist", detail: "The customer evaluates and shortlists" },
      { title: "Site visit", detail: "Shortlisted suppliers" },
      { title: "Final offer", detail: "Confirmed firm offer" },
      { title: "Customer chooses", detail: "Contract and award" },
    ],
    service: "Air source heat pump",
    title: "Hamm heat pumps: heat-as-a-service tender",
    customer: "Aroundtown",
    whyInvited: "You offer heat-as-a-service with heat pumps.",
    facts: [
      { label: "Contract model", value: "Heat-as-a-service" },
      { label: "Terms", value: "10 and 15 years" },
      { label: "Buildings", value: "10 at 4 assets" },
    ],
    status: { label: "Not started", detail: "Indicative offer due 31 Oct" },
    round: { label: "Round 1 of 2", due: "due 31 Oct" },
    offer: {
      title: "Send an indicative offer",
      text: "Upload your offer and your pricing per building, for 10 and 15 years. Offers may cover any set of buildings.",
      footer: "Commission only on work you win",
    },
    jobLead: "Hybrid heat pumps in 10 residential buildings at 4 assets in Hamm, financed, built and operated by you.",
    jobFacts: [
      { label: "Assets", value: "4 · 10 buildings" },
      { label: "Homes", value: "111" },
      { label: "Heat load", value: "632 kW, all buildings" },
      { label: "Concept", value: "Hybrid to GEG §71h" },
    ],
    seafront: "Mark missing data as on-site checks; don't invent figures (R10).",
    map: { image: "/concept/supplier/map-hamm.jpg", credit: "© OpenStreetMap contributors", width: 1200, height: 521 },
    priceCells: [
      { label: "Contract", value: "Heat-as-a-service: you finance, build and operate the plant" },
      { label: "Variants", value: "15 years and 10 years, both required. Purchase only as a separate, itemised alternative." },
      { label: "Price structure", value: "Working price, base charge, CO₂ part, metering, contribution, indexation, billing terms" },
      { label: "Offers this tender takes", value: "One offer for all buildings, in lots, or per building. You can leave buildings out." },
    ],
    structures: ["one", "lots", "perSite"],
    openCells: [
      { label: "Checked at the site visit", value: "Plant rooms · outdoor unit positions · grid connection" },
      { label: "Not in the brief", value: "Beukenbergstraße 4, which holds the plant room for no. 2" },
    ],
    variants: [
      { key: "15", label: "15 years", need: "required", note: "R2" },
      { key: "10", label: "10 years", need: "required", note: "R2" },
      { key: "buy", label: "Purchase", need: "optional", note: "Separate alternative with itemised cost (R4)" },
    ],
    expectedFiles: [
      { label: "Offer document", scope: "offer", need: "Required", found: "Tender form, portfolio approach" },
      { label: "Pricing per building", scope: "offer", need: "Required", found: "Your 10 building sheets" },
      { label: "Price indexation formula", scope: "offer", need: "Required (R3)", found: "Building sheet for Pottkamp 5-7" },
      { label: "Signed Commission Form", scope: "tender", need: "Required" },
      { label: "Insurance certificates", scope: "tender", need: "Required (R9) · also in your questions below" },
      { label: "COP table at 55 °C", scope: "product", need: "Required (R6) · one for each heat pump model · also in your questions below" },
      { label: "Building sheet", scope: "building", need: "Recommended", found: "10 of 10 buildings" },
    ],
    quote: {
      ...base.quote,
      fileNames: [
        "Tender form, portfolio approach",
        ...B.map((b) => `59063_Objektblatt_${String(b.n).padStart(2, "0")}_${b.name.replace(/ /g, "_")}.pdf`),
      ],
      files: [
        { kind: "Offer", meta: "portfolio approach · covers all 10 buildings" },
        ...B.map((b) => ({ kind: "Building sheet", meta: `pricing for 4 variants · ${b.name}` })),
      ],
      price: { value: eur(main15.reduce((a, b) => a + b, 0)), source: "Building sheets" },
      sitesSource: "Tender form",
      structure: { read: "lots", source: "Tender form" },
      lots: [
        { name: "Cluster A", sites: [1, 2, 3, 4, 5], price: eur(main15.slice(0, 5).reduce((a, b) => a + b, 0)) },
        { name: "Cluster B", sites: [6, 7, 8, 9], price: eur(main15.slice(5, 9).reduce((a, b) => a + b, 0)) },
        { name: "Cluster C", sites: [10], price: eur(main15[9]) },
      ],
      perSite: row(main15),
      offers: [],
      kwp: 0,
      terms,
      priceUnit: "Base charge a year, net",
      quoteVariants: [
        { key: "main15", label: "Main offer, 15 years", brief: "15", note: "No contribution", prices: row(main15) },
        { key: "main10", label: "Main offer, 10 years", brief: "10", note: "No contribution", prices: row(main10) },
        { key: "b15", label: "Option B, 15 years", brief: "15", note: "€500,000 contribution for the whole portfolio", wholeOnly: true, prices: row(b15) },
        { key: "b10", label: "Option B, 10 years", brief: "10", note: "€500,000 contribution for the whole portfolio", wholeOnly: true, prices: row(b10) },
      ],
      questions: [
        {
          key: "beuk4",
          title: "Beukenbergstraße 2 and 4",
          asks: "The brief covers Beukenbergstraße 2 (4 homes, 204.15 m²)",
          read: "Your sheet prices nos. 2 and 4 together on 408.30 m², because the plant room is in no. 4.",
          quote: "Wohneinheiten 4 (Nr. 2; Nr. 4 offen)",
          source: "59063_Objektblatt_04_Beukenbergstr_2-4.pdf",
          question: "Is the price for Beukenbergstraße 2 for no. 2 alone, or for nos. 2 and 4 together?",
          kind: "text",
          scope: "Building",
        },
        {
          key: "insurance",
          title: "Insurance certificates",
          asks: "R9 asks for liability and professional indemnity cover.",
          read: "The insurance fields on your tender forms are 0.",
          quote: "",
          source: "Tender forms",
          question: "Upload your liability and professional indemnity certificates.",
          kind: "text",
          scope: "Once for the tender",
          upload: "Upload certificates",
        },
        {
          key: "cop",
          title: "COP table at 55 °C",
          asks: "R6 asks for COP at 55 °C flow for −7, +2 and +7 °C.",
          read: "None of your files gives it. One file per model covers every building that uses it.",
          quote: "",
          source: "All bids",
          question: "Upload the COP table for each heat pump model you offer. One file per model covers every building that uses it.",
          kind: "text",
          scope: "Per heat pump model",
          upload: "Upload COP table",
          everyBidder: true,
        },
      ],
      alsoInOffer: [
        "Every house gets its own hybrid plant",
        "Survey, build and commissioning in three clusters",
        "One contact person for all ten buildings",
      ],
      assumed: "Heat quantity from your own figures per building",
      briefAsks: [
        "15 and 10 years, both required",
        "Hybrid to GEG §71h",
        "COP at 55 °C for −7, +2 and +7 °C",
        "Noise to TA Lärm",
        "F-gas certified installers",
      ],
      about: {
        sites: {
          title: "Buildings covered",
          quote: "Offers may cover any set of buildings. Say whether your prices hold if only some buildings are awarded.",
          source: "Brief · How you can offer",
        },
        variants: {
          title: "Variants",
          quote: "Offers for both a 10-year and a 15-year term are mandatory.",
          source: "Brief · R2",
          note: "Purchase only as a separate, clearly labelled alternative with itemised cost (R4). Changed 3 Sep (R3): the main offer has no construction cost contribution; a variant with one may be sent separately.",
        },
        price: {
          title: "Price",
          quote: "A full price structure: working price (ct/kWh), base price, CO₂ part under the BEHG, metering and billing, construction cost contribution, indexation formula with base years and weightings, billing terms.",
          source: "Brief · R3, changed 3 Sep",
        },
        beuk4: {
          title: "Beukenbergstraße 2",
          quote: "The plant room is in no. 4, which no brief covers.",
          source: "Brief · Buildings",
        },
        insurance: { title: "Insurance", quote: "Evidence of liability and professional indemnity insurance (minimum cover to be confirmed).", source: "Brief · R9" },
        cop: { title: "COP evidence", quote: "COP evidence at 55 °C flow for source temperatures of −7, +2 and +7 °C.", source: "Brief · R6" },
      },
    },
    findSuggestions: ["Heat load", "Hot water", "Contribution", "Insurance"],
    findIndex: [
      { text: "Heat load: 632 kW, all buildings", source: "The job · Overview", action: "open", tab: "overview" },
      { text: "Offers for both a 10-year and a 15-year term are mandatory (R2)", source: "Brief", action: "open", tab: "overview" },
      { text: "Main offer without a construction cost contribution; a variant with one may be sent separately (changed 3 Sep)", source: "Brief · R3", action: "open", tab: "overview" },
      { text: "Insurance: liability and professional indemnity (R9)", source: "Brief", action: "open", tab: "overview" },
      { text: "Beukenbergstraße 2: plant room in no. 4, not in the brief", source: "Assets & documents", action: "open", tab: "sites" },
    ],
    criteria: [
      { icon: "money", title: "Price", text: "Base charge and working price per building, 10 and 15 years" },
      { icon: "time", title: "Timing", text: "When each building can switch over" },
      { icon: "best", title: "Quality", text: "Hybrid concept, COP at 55 °C, noise, F-gas" },
    ],
    atVisit: [
      { label: "Plant rooms", value: "Space and height (Pottkamp 5-7: 2.14 m)" },
      { label: "Outdoor units", value: "Position and noise to TA Lärm" },
      { label: "Grid connection", value: "Capacity per building" },
    ],
    distance: "",
    sitesHint: "Offer for any set of buildings. Say whether prices hold if only some are awarded.",
    fileCount: 2,
    sites: B.map((b) => ({
      n: b.n,
      name: b.name,
      group: b.site,
      address: `${b.site}, 59063 Hamm`,
      system: `${b.homes} homes · ${b.kw} kW`,
      systemNote: `Existing: ${b.existing}`,
      files: [],
      pin: PINS[b.n - 1],
    })),
    sharedDocs: [
      { name: "Project Commission Form", type: "PDF", meta: "one for the whole tender", action: "Download", view: true },
      { name: "Brief", type: "PDF", meta: "10 buildings, last updated 28 Aug", action: "Download", view: true },
    ],
    questionTopics: ["The whole tender", "Sachsenschleife", "Beukenbergstraße", "Pottkamp", "Grünstraße", "Commission and contract"],
  };
}
