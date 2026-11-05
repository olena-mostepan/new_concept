# Cursor prompt, part 7: Delivery (section, workstream, project)

Run this after parts 1–6, in the same `new_concept` repo. Paste everything below the line into Cursor. The wireframes are in `docs/concept/wireframes/`:
`49-delivery-v2.svg`, `50-workstream-delivery-v2.svg`, `51-project-delivery-v2.svg`.

Not in this part: the Contracts tab content (`49b`). Show the tab label only, with the existing "coming soon" placeholder.

---

## Task

Build the Delivery part of the customer side under `/concept`:
- the section page (screen 49)
- the workstream page for a Delivery workstream (screen 50)
- the project page for a project inside one (screen 51)

**Delivery must stay as close as possible to the product's existing customer delivery view:** `components/customer/delivery/` and `lib/customer/delivery/`, as seen at `/customer/delivery` and on `/customer/projects/[id]?tab=delivery`.
- **Reuse those components, don't redraw them:** `CustomerDeliveryCards`, `CustomerDeliveryPhasesStepper`, `CustomerChangeDateModal`, the key dates block from `CustomerProjectDeliveryView`, the "Dates to confirm" card and review mode from `CustomerDeliveryView`, and the per-project row (start date, delivery stage dots, status, Confirm date).
- **Wrap them in the concept's own parts:** the chrome, header (Responsibility pill + View batch), Details, Route, Steps, the changed-dot, Recent activity | Documents, and History.

Also add two Delivery workstreams to the Halvering data, and update the earlier screens to the new numbers below.

Every rule from parts 1–6 still applies. **This written spec is the source of truth.** The wireframes are a layout reference.

### Routes
| Route | Screen |
|---|---|
| `/concept/services/delivery` | Delivery section, Workstreams tab → screen 49 |
| `/concept/services/delivery?tab=contracts` | Contracts tab: placeholder only |
| `/concept/workstreams/[id]` for a Delivery workstream | Workstream page → screen 50 |
| `/concept/projects/[workstreamId]/[buildingId]` for a Delivery project | Project page → screen 51 |

The nav highlights "Delivery" on all of these.

---

## New rules (add these to the parts 1–6 rules)

- **Delivery steps = the product's phases.** In `model.ts`, replace the Delivery steps with: **Kick-off → Design & survey → Installation → Commissioning → Handover → Complete**. Done when "Installed".
  - Remap the existing projects: Payment plan → Kick-off (0), Installing → Installation (2), Completed → Complete (5).
  - Update `taxonomy.md` to match.
- **One adapter, not two models.** Add `lib/concept/delivery.ts` with `toCustomerProject(ws, row): CustomerProject`. It builds what the product components need from concept data:
  - `phases` with dates and status
  - `currentPhaseId`
  - `insight` (on_track / overdue / complete / awaiting_start)
  - `needsConfirm` and `confirmBanner`
  - `keyDates` with their states (confirmed / estimate / from_invoice / needs_confirm)

  Store the per-project phase dates and date states on `ProjectRow` (new optional `delivery` field). Confirm / Change date / Correct dates update the concept store.
- **Group names on this section page:** **Needs attention / In progress / Done.** This is Olena's name for Delivery.
  - "Needs attention" holds workstreams with an **overdue** project or **dates to confirm**, whoever they're with.
  - Responsibility doesn't change because of it: the row still says "With suppliers".
- **Dates to confirm** are a check on the supplier's dates, taken from invoices. They're not a blocker.
  - On the workstream steps their panel is headed **TO CONFIRM** (solid, with you), not NEEDS.
  - They don't count in "Who it's waiting on".
- **The "Dates to confirm" card** sits on the section page above the filters. It's the product's card: "N dates need confirming", "Voltreny sent them with its invoices. If a start date or stage is wrong, tracking will be off too.", and **Confirm from your data**, which starts the product's review mode.
  - This is the one action allowed on a list page. It's kept because the product has it.
- **Service-specific column: Delivery.** Two lines split at " — ": "2 of 6 complete" / "2 dates to confirm", "1 of 4 complete" / "1 overdue". The second line is semibold in Needs attention.
- **Estimates:** future phase dates show only as the product shows them, "est 18 Nov", tagged Estimate. They are never shown as plain dates.
- **Tabs:**
  - Workstream: Overview · Contract · Delivery.
    - Contract reuses the project page's Contract tab (placeholder for now).
    - Delivery shows `CustomerDeliveryView`, filtered to this workstream's projects.
  - Project page: Overview · Contract. Overview is the screen-51 content below. Contract is the existing placeholder.

---

## Data changes (Halvering Estates)

### Existing Delivery workstreams: add the phase data

**EV charging · Voltreny** (`ev-voltreny`, Flagship):
- Contract value €152k, signed 6 Aug. Expected completion est 16 Dec.

| Project | City | Value | Kick-off | Design & survey | Installation | Commissioning | Handover | Complete | Status | To confirm |
|---|---|---|---|---|---|---|---|---|---|---|
| Kervelstraat 14 | Antwerp | €26k | 12 Aug ✓ | 20 Aug ✓ | **14 Oct (from invoice)** | est 4 Nov | est 18 Nov | — | On track | Installation start |
| Speicherallee 7 | Hamburg | €24k | 12 Aug | 20 Aug | 1 Sep | 22 Sep | 2 Oct | **7 Oct (from invoice)** | Complete | Completion |
| Halverkamp 19 | Hamburg | €25k | 12 Aug | 20 Aug | 1 Sep | 18 Sep | 25 Sep | 30 Sep | Complete | — |
| Am Hafen 12 | Bremen | €27k | — | — | — | — | — | — | Awaiting start | — |
| Havenweg 30 | Rotterdam | €25k | — | — | — | — | — | — | Awaiting start | — |
| Kanaalstraat 9 | Ghent | €25k | — | — | — | — | — | — | Awaiting start | — |

- Kervelstraat 14 key dates: Start 12 Aug (confirmed) · Expected completion est 18 Nov (estimate) · Last stage change 14 Oct (from invoice).
- Needs: "Start dates for 3 projects", owner suppliers ("Voltreny is planning them").
- Activity:
  - 14 Oct Installing started at Kervelstraat 14 — from Voltreny's invoice, confirm the date
  - 7 Oct Speicherallee 7 complete — from Voltreny's invoice, confirm the date
  - 30 Sep Halverkamp 19 complete — handed over
  - 20 Aug Site checks done — Halverkamp 19, Kervelstraat 14, Speicherallee 7
  - 6 Aug Workstream started — 6 projects from EV charging · Tender; Voltreny: best price and earliest start
- Documents:
  - Contract — Voltreny (PDF · signed 6 Aug)
  - Site checks (3 PDFs · 20 Aug)
  - Handover pack — Halverkamp 19 (PDF · 30 Sep)

**Solar PV FR/BE · Solvarek** (`solvarek`, Offices):
- Rue Belvaux 22: Complete 9 Oct (confirmed).
- Grand-Place 3: Installation started 22 Sep, expected done 10 Oct → **overdue**, 9 days late.
- Domplatz 8 and Rue Neuve 61: Awaiting start.
- Next line: "Grand-Place 3 overdue — installation due 10 Oct · 9 days late".

### Add two Delivery workstreams
The account now has **25 workstreams**: Flagship 11, Offices 14.

| id | Name | Batch | Supplier | Owner | Projects | Started | Value | State |
|---|---|---|---|---|---|---|---|---|
| `ev-be` | EV charging · BE offices | Offices | Voltreny | suppliers | o23 Grand-Place 3 (Namur), o24 Rue Neuve 61 (Charleroi) | 1 Oct 2026 | €54k (€27k each) | Both at Design & survey. Kick-off 1 Oct, site checks done 16 Oct. Next "Design for 2 sites — site checks done 16 Oct". |
| `led-lumora` | LED · Lumora | Flagship | Lumora | done | f10 Havenweg 30, f11 Kanaalstraat 9, f12 Parkring 16 | 2 Jun 2026 | €48k (€16k each) | All Complete 30 Sep. Outcome "All 3 handed over 30 Sep — installed". `completedOn: '30 Sep 2026'`. |

Routes for these projects:
- `ev-be`: Indicative, Scope and Tender "Not required", with the caption "Same Voltreny contract as Flagship"; Pricing "Not required".
- `led-lumora`: Indicative "Not required", "Like-for-like LED"; Scope, Tender and Pricing "Not required", with the caption "Lumora framework price".

### Knock-on numbers on the earlier screens (check these after the change)

**Dashboard (33)**
- Pipeline: "25 workstreams across 2 batches", and Estimates 5 · Planning 4 · Tender 4 · Pricing 3 · Delivery 3 · Done 6.
- Batches card:
  - Flagship meta: "12 buildings · 11 workstreams · by Dec 2027".
  - Offices meta: "24 buildings · 14 workstreams · by Jun 2028". Its Delivery cell gets a second dot.
- Right now: Waiting on you · 11, In progress · 8, Done · 6.
- Who it's waiting on: 11 With you · 3 With CQuel · 5 With suppliers.
- Momentum (cumulative):

| | Mar | Apr | May | Jun | Jul | Aug | Sep | Oct |
|---|---|---|---|---|---|---|---|---|
| Started | 0 | 0 | 3 | 5 | 6 | 13 | 22 | 25 |
| Finished | 0 | 0 | 1 | 1 | 1 | 4 | 6 | 6 |

**Batch pages (35)**
- Flagship: 11 workstreams. The Done line adds "LED · Lumora — Delivery, handed over 30 Sep" (Done · 4).
- Offices: 14 workstreams. Add the EV charging · BE offices row. Header right "12 in progress · 2 done".

**Workstreams list (36)**
- Meta: "25 workstreams across 2 batches · 19 in progress · 6 done".
- Flagship: 7 live + Done · 4.
- Offices: 12 live + Done · 2. EV charging · BE offices gets the dot (changed 16 Oct).

**Planning, Surveys tab (40b)**
- Add EV charging · BE offices, Service Delivery, "2 site checks", Done 16 Oct.
- The tab becomes Surveys (28), and Done · 20.

---

## Screen 49: Delivery section (`/concept/services/delivery`)

- **Title** "Delivery". **Meta:** "Done when installed".
- **Key** top right: ● "Changed in the last 7 days".
- **Tabs:** Workstreams (4) | Contracts (21). Contracts is a placeholder in this part.
- **Dates to confirm card** (see rules): "2 dates need confirming" · **Confirm from your data**.
- **Filters:** search ("Search workstreams or projects"), then Batch, Solution, Supplier and Responsibility.
- **Three cards,** each titled with its count:
  1. **Needs attention · 2:**
     - EV charging · Voltreny (dot) — "2 of 6 complete" / "2 dates to confirm" — **Confirm 2 dates** / "From Voltreny's invoices, 7 and 14 Oct" — With suppliers
     - Solar PV FR/BE · Solvarek — "1 of 4 complete" / "1 overdue" — **Grand-Place 3 overdue** / "Installation due 10 Oct · 9 days late" — With suppliers
  2. **In progress · 1:** EV charging · BE offices (dot) — "0 of 2 complete" / "Design & survey" — "Design for 2 sites" / "Site checks done 16 Oct" — With suppliers.
  3. **Done · 1:** LED · Lumora — "3 of 3 complete" / "Handed over" — Outcome "All 3 handed over 30 Sep" / "Installed" — Done.
- **Columns:** Workstream · Batch · **Delivery** · Next (**Outcome** in Done) · Responsibility · View.
- **Order:** the part-5 rule inside each card.

## Screen 50: Workstream page (`/concept/workstreams/ev-voltreny`)

**Header**
- Breadcrumb: "Delivery › EV charging · Voltreny".
- Title: "EV charging · Voltreny".
- Right: "With suppliers" (outlined) and **View batch**.

**1. Details** (4 × 3 grid, 11 fields):

| Row 1 | Row 2 | Row 3 |
|---|---|---|
| Service: Delivery | Started: 6 Aug | Complete: 2 of 6 |
| Solution: EV charging | Projects: 6 | Expected completion: est 16 Dec |
| Batch: Flagship sites (link) | Supplier: Voltreny | Done when: Installed |
| Lead: Tamsin Quarrell | Contract value: €152k | |

**2. Tabs:** Overview (active) · Contract · Delivery.

**3. Delivery stages**, header right "Projects at each stage". Use `StepsWithNeeds` with the six phases:

| Phase | Count | What happens | Panel |
|---|---|---|---|
| Kick-off | 3 projects | Contract signed; the supplier plans the work. | NEEDS (dashed, suppliers): ○ Start dates for 3 projects — Voltreny is planning them |
| Design & survey | — (passed) | The supplier checks the site and designs the install. | SITE CHECKS (grey): ✓ 3 site checks done — 20 Aug |
| Installation | 1 project | The supplier installs the chargers. | TO CONFIRM (solid, you): ● Installation start at Kervelstraat 14 — From invoice · 14 Oct |
| Commissioning | — | The supplier tests and switches it on. | none |
| Handover | — | You get the documents and warranties. | none |
| Complete | 2 projects | Installed and handed over. | TO CONFIRM (solid, you): ● Completion at Speicherallee 7 — From invoice · 7 Oct |

Kick-off, Installation and Complete all show the current-step marker, because projects sit there.

**4. Projects**, header right "6 · 2 to confirm". This is the product's delivery row:
- Columns: Project (+ city, with "Voltreny · €26k" under it) · Start date ("Awaiting start" when there is none) · Delivery stages (six small dots) · Status · action · View.
- Action: **Confirm date** (filled, small) on the rows with a date to confirm. It opens `CustomerChangeDateModal`.
- Order: rows to confirm first, then complete, then awaiting start.

**5. Recent activity | Documents:** the entries listed above.

**Other Delivery workstreams** use the same page with their own data. Solvarek's Installation panel reads NEEDS (dashed, suppliers): ○ Grand-Place 3 overdue — due 10 Oct · 9 days late. LED · Lumora has every phase done. Leave out any block or field that has no data.

## Screen 51: Project page (`/concept/projects/ev-voltreny/f3`, Kervelstraat 14 · EV charging)

**Header**
- Breadcrumb: "Delivery › EV charging · Voltreny › Kervelstraat 14".
- Title: "Kervelstraat 14 · EV charging", with "Antwerp" muted next to it.
- Right: "With suppliers" (outlined) and **View batch**.

**1. Details:** Batch (link) · Workstream (link) · Solution · Supplier.

**2. Route**, header right "Services for this project":

| Service | State | Caption |
|---|---|---|
| Estimates | Done | "Done 30 May" / "€23–28k" |
| Planning | Not required (dashed) | "Not required" / "Car park plans were enough" |
| Tender | Done | "Done 5 Aug" / "Voltreny chosen" |
| Pricing | Not required (dashed) | "Not required" / "The supplier comes from the tender" |
| Delivery | Now | "Now · Installation" / "In EV charging · Voltreny" |

**3. Tabs:** Overview (active) · Contract.

**4. Overview = the product's project delivery view,** fed by `toCustomerProject()`:
- `CustomerDeliveryCards`: **Confirm date** "Installation" / "Started 14 Oct · from invoice" (highlighted) · Contract value €26k / Voltreny · Expected completion "est 18 Nov" / Estimate.
- `CustomerDeliveryPhasesStepper`: Kick-off 12 Aug ✓ · Design & survey 20 Aug ✓ · **Installation 14 Oct** with "Is this right?" and **Confirm ▾** (Yes — looks right / Change date) · Commissioning est 4 Nov · Handover est 18 Nov · Complete —.
- **Key dates** with **Correct dates**: Start 12 Aug (Confirmed) · Expected completion est 18 Nov (Estimate) · Last stage change 14 Oct (From invoice).
- Use the product's own copy and controls. Only restyle where the concept tokens differ (black and white, `--cq-owner-you` for "with you").

**5. History:**
| Event | Detail | Date |
|---|---|---|
| Installing started | From Voltreny's invoice — waiting for you to confirm the date. | 14 Oct |
| Site check done | Car park can take 4 chargers. | 20 Aug |
| Kick-off | Contract signed; Voltreny planned the work. | 12 Aug |
| Moved to Delivery | Voltreny: best price and earliest start. | 6 Aug |
| Estimate presented | €23–28k. | 30 May |
| Joined EV charging | Allocated from Flagship sites. | 20 May |

Confirming "Yes — looks right" marks the date confirmed and adds a History entry "Installation start confirmed". It also clears the dot's "to confirm" count on screens 49 and 50, and the count on the section's Dates to confirm card.

---

## Done when
- Screens 49, 50 and 51 match the spec in structure and copy, and reuse the product delivery components (no copies of them).
- Delivery steps are the six product phases everywhere: model, steps block, dots, taxonomy.
- Confirm / Change date / Correct dates work and update every screen that shows the count.
- The earlier screens show the knock-on numbers above.
- Cross-checks:
  - 49 shows 2 / 1 / 1, and the tab says 4
  - the dashboard pipeline adds up to 25
  - Who it's waiting on 11 / 3 / 5 matches Right now (11 waiting on you)
  - Flagship = 11 and Offices = 14 on the dashboard, batch pages and Workstreams list
  - Surveys (28) with Done · 20
  - Voltreny project values sum to €152k
- No T1–T4 stages, no deposits, no £. Future dates appear only as "est …" with an Estimate tag.
- The rules in parts 1–7 pass, item by item. Write the checklist into your final message, with a pass or fail for each item.
