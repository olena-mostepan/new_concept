/**
 * About the customer (C15, 24 Nov): what a supplier sees about who they'd work for, in the tender rail.
 * Mostly the company itself: who they are and public facts that show size and stability, for Ops to
 * check and keep dated in the admin. Then a smaller "With CQuel" group from CQuel's own data, and one
 * line on what could follow (only what Ops choose to share). No "None yet" / "New customer" rows.
 *
 * Sources (24 Nov 2026): Wikipedia (Aroundtown SA; Hines; Blackpool Pleasure Beach), hines.com/hecf.
 * With CQuel figures: CQuel prod, read only, 24 Nov 2026 (non-archived, non-test projects).
 */
export interface CustomerInfo {
  name: string;
  who: string;
  company: Array<{ label: string; value: string }>;
  withCquel?: Array<{ label: string; value: string }>;
  follow?: string;
}

const CUSTOMERS: Record<string, CustomerInfo> = {
  Aroundtown: {
    name: "Aroundtown",
    who: "Listed real estate company investing in offices, hotels and homes in European cities.",
    company: [
      { label: "Founded", value: "2004" },
      { label: "Company", value: "Listed" },
      { label: "Main markets", value: "Germany · Netherlands" },
      { label: "Portfolio", value: "Offices · hotels · residential" },
    ],
    withCquel: [
      { label: "Assets on CQuel", value: "31" },
      { label: "Tenders with CQuel", value: "28" },
    ],
    follow: "11 more heat pump tenders for Aroundtown are open now.",
  },
  "Hines (HECF)": {
    name: "Hines European Core Fund",
    who: "Hines' core real estate fund for Europe, run by Hines, a private real estate investor and developer.",
    company: [
      { label: "Fund size", value: "€2.9bn" },
      { label: "Fund assets", value: "69 in 10 countries" },
      { label: "Hines", value: "Founded 1957 · private" },
      { label: "Hines manages", value: "$93.2bn in 30 countries" },
    ],
    withCquel: [
      { label: "Assets on CQuel", value: "6" },
      { label: "Tenders with CQuel", value: "7" },
    ],
    follow: "Solar PV tenders for Essen and Raunheim are open now, alongside this one.",
  },
  "Blackpool Pleasure Beach": {
    name: "Blackpool Pleasure Beach",
    who: "Amusement park on Blackpool's seafront, run by the same family for generations.",
    company: [
      { label: "Founded", value: "1896" },
      { label: "Company", value: "Family-owned" },
      { label: "Site", value: "42 acres" },
      { label: "Attractions", value: "31 · 10 roller coasters" },
    ],
  },
};

export const customerInfo = (customer: string): CustomerInfo | undefined => CUSTOMERS[customer];
