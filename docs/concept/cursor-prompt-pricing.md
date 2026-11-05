# Cursor prompt, part 6: Pricing (section, workstream, project)

Run this after parts 1–5, in the same `new_concept` repo. Paste everything below the line into Cursor. The wireframes are in `docs/concept/wireframes/`:
`46-pricing-v2.svg`, `47-workstream-pricing-v2.svg`, `48-project-pricing-v2.svg`.

---

## Task

Build the Pricing part of the customer side under `/concept`:
- the section page (screen 46)
- the workstream page for a Pricing workstream (screen 47)
- the project page for a project inside one (screen 48)

Also add two Pricing workstreams to the Halvering data, and update the earlier screens to the new numbers below.

Every rule from parts 1–5 still applies, including the "changed in the last 7 days" dot. **This written spec is the source of truth.** The wireframes are a layout reference.

Reuse what's there:
- `ServiceSection`, `DetailsGrid`, `StepsWithNeeds`, `ProjectsTable`, `ProjectRoute` (with the dashed "Not required" state from part 4) and `DecisionButtons`
- the workstream tab bar from part 4 (`TenderWorkstream`)

Only the content, columns and labels below differ.

### Routes
| Route | Screen |
|---|---|
| `/concept/services/pricing` | Pricing section → screen 46 |
| `/concept/workstreams/[id]` for a Pricing workstream | Workstream page → screen 47 |
| `/concept/projects/[workstreamId]/[buildingId]` for a Pricing project | Project page → screen 48 |

The nav highlights "Pricing" on all three screens.

---

## New rules (add these to the parts 1–5 rules)

- **Pricing steps** (already in `model.ts`): Supplier set → Price requested → Price received → Analysed → Decision → Contracting. Contracting is part of Pricing. Done when "Price agreed, contract signed".
- **Section meta:** "Done when the price is agreed and the contract signed".
- **Group names:** **Needs your decision / In progress / Done.** Agreeing a price and signing a contract are both decisions.
- **Service-specific column: Price.** Two lines split at " — ": "€132k" / "4 projects", "€196k" / "Agreed 6 Oct", "Not received yet" / "4 projects".
- **Filters on this section:** Batch, Solution, **Supplier**, Responsibility. Pricing workstreams always have a supplier, so the Supplier filter earns its place here.
- **Customer actions in Pricing:**
  - **Agree price / Not now**, per project. Same `DecisionButtons` as Estimates, with the label changed to "Agree price".
  - **Sign the contract**, which comes later and isn't drawn in this part.
  - Neither appears on a list.
- **Workstream tabs for Pricing:** Overview · Pricing · Contract. They reuse the project page's Pricing and Contract tabs (`CustomerProjectPage.tsx`), as in part 4. Only tabs with content show: Contract appears once a contract exists (EV charging · Ladewerk). So Chargeo shows Overview · Pricing.
- **Analysis** compares each price with the customer's own contract rates. It is not a market benchmark. Copy is "Matches contract rates" or "<item> €Xk above contract rate".
- **Route when the incumbent prices the work:** Estimates, Planning and Tender can each be "Not required" (dashed), with the reason as a caption.

---

## Data changes (Halvering Estates)

Add two Pricing workstreams, both in Offices. They use the 10 Offices buildings that had no EV charging workstream yet. The account now has **23 workstreams**: Flagship 10, Offices 13.

| id | Name | Supplier (incumbent) | Owner | Projects | Step (index) | Started | Lead | Next line |
|---|---|---|---|---|---|---|---|---|
| `ev-ladewerk` | EV charging · Ladewerk | Ladewerk | you | o13–o18 (Friedrichstraße 200, Königsallee 60, Zeil 106, Leopoldstraße 33, Mönckebergstraße 11, Schildergasse 72) | Contracting (5) | 8 Sep 2026 | Rich Amos | Sign the contract — sent 15 Oct · waiting 4 days |
| `ev-chargeo` | EV charging · Chargeo | Chargeo | you | o19–o22 (Prager Straße 15, Breite Straße 2, Kaiserstraße 44, Domplatz 8) | Decision (4) | 22 Sep 2026 | Rich Amos | Agree the price — analysis sent 9 Oct · waiting 10 days |

**EV charging · Ladewerk**
- Price: €196k for 6 projects, agreed 6 Oct.
- Contract sent 15 Oct. Need: "Contract to sign", owner you, since 15 Oct 2026.
- Activity: 15 Oct "Contract sent to you" · 6 Oct "Price agreed — €196k for 6 projects" · 8 Sep "Workstream started — 6 projects allocated from Offices DE, FR and BE; Ladewerk runs the existing chargers".
- It gets the dot (changed 15 Oct).

**EV charging · Chargeo**, the workstream drawn in screen 47:
- Supplier set 22 Sep · price requested 24 Sep · price received 2 Oct · analysed 9 Oct.
- Need: "Agree the price for 4 projects", owner you, since 9 Oct 2026.

| Project | City | Price | Analysis | Decision |
|---|---|---|---|---|
| Prager Straße 15 | Dresden | €38k | Matches contract rates | waiting |
| Breite Straße 2 | Hanover | €31k | Matches contract rates | waiting |
| Kaiserstraße 44 | Karlsruhe | €34k | Groundworks €4k above contract rate | waiting |
| Domplatz 8 | Münster | €29k | Matches contract rates | waiting |

Total €132k. Add a new `price` field to `ProjectRow` (€ thousands) and an `analysis` string.

Prager Straße 15 "Based on":
- Chargers: 6 × 22 kW — Site plan
- Car park: Owned, 40 spaces — Your files
- Contract rates: Chargeo, 2024 rates — Existing contract

**Existing workstreams**
- Solar PV FR/BE · Solvarek quote (done): add price €214k for 4 projects. Outcome "Contract signed 15 Sep — 4 projects to Delivery".
- Heat pumps · Kelderby: no change. It stays at Price requested, with "Price from Kelderby — requested 1 Oct · waiting 18 days".

### Knock-on numbers on the earlier screens (check these after the change)

**Dashboard (33)**
- Pipeline: "23 workstreams across 2 batches", and Estimates 5 · Planning 4 · Tender 4 · Pricing 3 · Delivery 2 · Done 5.
- Batches card, Offices: Pricing cell [with you, with you] plus the done one. Meta: "24 buildings · 13 workstreams · by Jun 2028".
- Right now: Waiting on you · 11, In progress · 7, Done · 5.
- Who it's waiting on: 11 With you · 3 With CQuel · 4 With suppliers.
- Momentum (cumulative):

| | Mar | Apr | May | Jun | Jul | Aug | Sep | Oct |
|---|---|---|---|---|---|---|---|---|
| Started | 0 | 0 | 3 | 4 | 5 | 12 | 21 | 23 |
| Finished | 0 | 0 | 1 | 1 | 1 | 4 | 5 | 5 |

**Batch page (35), Offices**
- Header: 13 workstreams.
- The Pricing NEEDS panel: ● Sign the contract — EV charging · Ladewerk (Sent 15 Oct) · ● Agree the price — EV charging · Chargeo (Sent 9 Oct).
- Workstreams in this batch: add the two rows. Header right: "11 in progress · 2 done".

**Workstreams list (36)**
- Meta: "23 workstreams across 2 batches · 18 in progress · 5 done".
- Offices: 11 live + Done · 2. Dots: 5 (Heat pumps, EV charging · Ladewerk, LED · Offices FR and BE, EV charging · Offices, LED · Offices DE).

---

## Screen 46: Pricing section (`/concept/services/pricing`)

- **Title** "Pricing", with the meta line above.
- **Key** top right: ● "Changed in the last 7 days".
- **Filters:** search ("Search workstreams or projects"), then Batch, Solution, Supplier and Responsibility.
- **Three cards,** each titled with its count:
  1. **Needs your decision · 2:**
     - EV charging · Ladewerk (dot) — €196k / Agreed 6 Oct — Sign the contract / Sent 15 Oct · waiting 4 days
     - EV charging · Chargeo — €132k / 4 projects — Agree the price / Analysis sent 9 Oct · waiting 10 days
  2. **In progress · 1:** Heat pumps · Kelderby — Not received yet / 4 projects — Price from Kelderby / Requested 1 Oct · waiting 18 days — With suppliers.
  3. **Done · 1:** Solar PV FR/BE · Solvarek quote — €214k / 4 projects — Outcome: Contract signed 15 Sep / 4 projects to Delivery.
- **Columns:** Workstream · Batch · **Price** · Next (**Outcome** in the Done card) · Responsibility · View.
- **Order:** the part-5 rule (dot rows first, newest change first; then oldest last change first).

## Screen 47: Workstream page (`/concept/workstreams/ev-chargeo`)

**Header**
- Breadcrumb: "Pricing › EV charging · Chargeo".
- Title: "EV charging · Chargeo".
- Right: "With you" (filled) and **View batch**.

**1. Details** (4 × 3 grid, no criteria chips):

| Row 1 | Row 2 | Row 3 |
|---|---|---|
| Service: Pricing | Started: 22 Sep | Priced: Per project |
| Solution: EV charging | Projects: 4 | Price: €132k |
| Batch: Offices DE, FR and BE (link) | Supplier: Chargeo | Price received: 2 Oct |
| Lead: Rich Amos | Supplier source: Incumbent | Done when: Price agreed, contract signed |

**2. Tabs:** Overview (active) · Pricing.

**3. Steps**, header right "Projects at each step":

| Step | Count | What happens | Panel |
|---|---|---|---|
| Supplier set | — (passed) | Your incumbent prices the work, so no tender is needed. | SET (grey): ✓ Chargeo — runs your existing chargers — 22 Sep |
| Price requested | — (passed) | We ask the supplier to price each project. | none |
| Price received | — (passed) | The supplier sends a price per project. | RECEIVED (grey): ✓ €132k for 4 projects — 2 Oct |
| Analysed | — (passed) | We check each price against your contract rates. | CHECKED (grey): ✓ 3 match, 1 above on groundworks — 9 Oct |
| Decision | 4 projects | You agree the price, project by project. | NEEDS (solid, with you): ● Agree the price for 4 projects — Sent 9 Oct · waiting 10 days |
| Contracting | — | We draw up the contract; you sign it. | none |

**4. Projects**, header right "4 · €132k in total".
- Columns: Project (+ city) · Step · Price · Analysis · Decision · View.
- The Decision column holds **Agree price** (filled) and **Not now** (outlined).
- "Groundworks €4k above contract rate" in semibold; "Matches contract rates" muted.

**5. Recent activity | Documents**

Recent activity:
| Date | Title | Text |
|---|---|---|
| 9 Oct | Analysis sent to you | 3 prices match your contract rates; Kaiserstraße 44 is €4k above on groundworks. |
| 2 Oct | Price received from Chargeo | €132k for 4 projects. |
| 24 Sep | Price requested | From Chargeo, for 4 projects. |
| 22 Sep | Workstream started | 4 projects allocated from Offices DE, FR and BE — Chargeo runs the existing chargers. |

Documents:
| Document | Detail | Action |
|---|---|---|
| Price analysis — EV charging · Chargeo | PDF · 9 Oct | Download |
| Chargeo price | PDF · 2 Oct | Download |
| Contract | After you agree the price | Greyed out, no action |

**Other Pricing workstreams** use the same page with their own data:
- **EV charging · Ladewerk:** Contracting is current, with NEEDS (solid, with you) ● Contract to sign — Sent 15 Oct · waiting 4 days. The Projects list shows agreed prices and no decision buttons. Its tabs are Overview · Pricing · Contract.
- **Heat pumps · Kelderby:** Price requested is current, with NEEDS (dashed, suppliers) ○ Price from Kelderby — Requested 1 Oct · waiting 18 days. The Price and Analysis columns stay out until a price arrives.
- **Solar PV FR/BE · Solvarek quote** (done): all steps done.
- Leave out a block, field or column that has no data. Don't show it empty.

## Screen 48: Project page (`/concept/projects/ev-chargeo/o19`, Prager Straße 15 · EV charging)

**Header**
- Breadcrumb: "Pricing › EV charging · Chargeo › Prager Straße 15".
- Title: "Prager Straße 15 · EV charging", with "Dresden" muted next to it.
- Right: "With you" (filled) and **View batch**.

**1. Details:** Batch (link) · Workstream (link) · Solution · Lead.

**2. Route**, header right "Services for this project":

| Service | State | Caption |
|---|---|---|
| Estimates | Not required (dashed) | "Not required" / "Priced by your incumbent" |
| Planning | Not required (dashed) | "Not required" / "Like-for-like with the existing chargers" |
| Tender | Not required (dashed) | "Not required" / "Incumbent: Chargeo" |
| Pricing | Now | "Now · Decision" / "In EV charging · Chargeo" |
| Delivery | Planned | "Planned" |

No needs panel.

**3. Two columns:**
- **Price:**
  - Price: **€38k**, "From Chargeo, received 2 Oct", with **Price analysis** on the right (opens the PDF).
  - Analysis: **Matches contract rates**, "Checked 9 Oct".
  - Decision: **Agree price** (filled) and **Not now** (outlined). This is the project's decision, sitting with its output.
- **Based on:** the three rows above, each with its source on the right.

**4. History:**
| Event | Detail | Date |
|---|---|---|
| Analysis sent | Matches contract rates. | 9 Oct |
| Price received | €38k from Chargeo. | 2 Oct |
| Price requested | From Chargeo. | 24 Sep |
| Joined EV charging · Chargeo | Allocated from Offices DE, FR and BE — Chargeo runs the existing chargers. | 22 Sep |

No tabs on the project page.

---

## Done when
- Screens 46, 47 and 48 match the spec in structure and copy.
- Agree price / Not now work on the workstream and project pages, updating the store the same way as Estimates's Go ahead / Not now.
- The earlier screens show the knock-on numbers above.
- Cross-checks:
  - 46 shows 2 / 1 / 1
  - the dashboard pipeline adds up to 23
  - Who it's waiting on 11 / 3 / 4 matches Right now (11 waiting on you)
  - Offices = 13 workstreams on the dashboard, batch page and Workstreams list
  - Chargeo prices sum to €132k
- No deposits, no "buildings" inside workstreams, no £. The analysis refers only to the customer's own contract rates.
- The rules in parts 1–6 pass, item by item. Write the checklist into your final message, with a pass or fail for each item.
