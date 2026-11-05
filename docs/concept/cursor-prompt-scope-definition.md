# Cursor prompt, part 3: Planning (section + Surveys tab, workstream, project)

Run this after part 1 (`cursor-prompt-dashboards.md`) and part 2 (`cursor-prompt-indicative-pricing.md`), in the same `new_concept` repo. Paste everything below the line into Cursor. The wireframes are in `docs/concept/wireframes/`:
`40-scope-definition-v2.svg`, `40b-scope-surveys-v2.svg`, `41-workstream-scope-v2.svg`, `42-project-scope-v2.svg`.

---

## Task

Build the Planning part of the customer side under `/concept`:
- the section page, which has two tabs: Workstreams (screen 40) and Surveys (screen 40b)
- the workstream page for a Planning workstream (screen 41)
- the project page for a project inside one (screen 42)

Also add four workstreams to the Halvering data, and update the earlier screens to the new numbers below.

Every rule from parts 1 and 2 still applies. **This written spec is the source of truth.** The wireframes are a layout reference. Earlier wireframes (33, 35, 36) were drawn with fewer workstreams, so their counts are out of date; use the numbers in this prompt.

Reuse the part-2 components (`DetailsGrid`, `StepsWithNeeds`, `ProjectsTable`, `ProjectRoute`, `ServiceSection`) wherever a block is the same. Only the content, columns and group names below differ.

### Routes
| Route | Screen |
|---|---|
| `/concept/services/scope` | Planning section, Workstreams tab → screen 40 |
| `/concept/services/scope?tab=surveys` | Same page, Surveys tab → screen 40b |
| `/concept/workstreams/[id]` for a Planning workstream | Workstream page → screen 41 |
| `/concept/projects/[workstreamId]/[buildingId]` for a Planning project | Project page → screen 42 |

The nav highlights "Planning" on all four screens.

---

## New rules (add these to the parts 1 and 2 rules)

- **Surveys live on the Planning page, in a second tab: Workstreams (N) | Surveys (N).**
  - A survey is a visit to a building. It belongs to a project and is grouped per workstream.
  - The Surveys tab lists every visit across all workstreams. That includes scope surveys and the supplier site checks from Tender and Delivery.
  - Surveys are not a service, so there's no Surveys item in the main nav.
- **Visit dates:**
  - Show only dates the platform holds.
  - A visit with no date yet is "To be booked" or "Booked — date to confirm".
  - Never show a guessed future date.
- **Don't record or show a survey type.** The platform doesn't have one. "Survey" and "Site check" come from the service the visit belongs to: Planning gives "survey"; Tender or Delivery gives "site check".
- **Group names on this section page:** **Needs your input / In progress / Done.**
  - Here the customer either sends something or agrees a scope, so "input" covers both.
  - Estimates keeps "Needs your decision".
- **Customer actions in Planning:**
  - **Reply by email**, to send what we asked for. It appears on the open gap, on the workstream page and on the project page.
  - **Agree scope**, which is a decision.
  - Neither action ever appears on a list.

---

## Data changes (Halvering Estates)

Add four Planning workstreams. The account now has **18 workstreams**: Flagship 10, Offices 8. Keep working every count out from the data.

### Planning workstreams (all five)

| Workstream | Batch | Status | Projects | Surveys | Next line | Lead | Started |
|---|---|---|---|---|---|---|---|
| Solar PV · Missing roof data | Flagship sites | With you | 7 | To be booked — 7, once drawings are in | Roof drawings for 7 buildings — asked 2 Oct · waiting 17 days | Tamsin Quarrell | 1 Sep |
| EV charging · DE flagships | Flagship sites | With you | 4 | Not required — car park plans are enough | Car park ownership for 4 buildings — asked 9 Oct · waiting 10 days | Tamsin Quarrell | 1 Oct |
| Solar PV · FR offices | Offices DE, FR and BE | With you | 8 | 8 done — last on 3 Oct | Agree scope for 8 projects — sent 10 Oct · waiting 9 days | Rich Amos | 4 Aug |
| Heat pumps · BE offices | Offices DE, FR and BE | With CQuel | 3 | 2 of 3 done — 1 booked, date to confirm | Scope written after the last survey — 2 of 3 surveys done | Rich Amos | 4 Aug |
| Solar PV FR/BE · scope | Offices DE, FR and BE | Done 2 Aug | 4 | 4 done — July | Scope agreed 2 Aug — 4 projects to Pricing | Rich Amos | 1 Jul |

New: EV charging · DE flagships, Solar PV · FR offices, Heat pumps · BE offices, and Solar PV FR/BE · scope.

Solar PV FR/BE · scope is the scope that came before the existing "Solar PV FR/BE · Solvarek quote" (Pricing, started 4 Aug). Add a transition from one to the other with the reason "Scope agreed".

### Projects

**Solar PV · Missing roof data:**
- Projects: Kelmsdorfer Straße 41 (Berlin), Kervelstraat 14 (Antwerp), Am Hafen 12 (Bremen), Brückenstraße 5 (Cologne), Marktplatz 2 (Düsseldorf), Havenweg 30 (Rotterdam), Kanaalstraat 9 (Ghent).
- All 7 are at **Info requested**. Open gap: Roof drawings. Survey: Not booked yet.

**EV charging · DE flagships:**
- Projects: Lindenhof 3, Wiesenstraße 88, Brückenstraße 5, Parkring 16.
- All 4 are at Info requested. Open gap: Car park ownership. Survey: Not required.

**Solar PV · FR offices:**
- Projects: Rue Nationale 9, Quai Perrache 30, Rue de Rivoli 112, Boulevard Haussmann 55, Rue Sainte-Catherine 7, Place Kléber 4, Rue du Faubourg 18, Cours Mirabeau 26.
- All 8 are at **Survey done**. Surveys were done between 24 Sep and 3 Oct, and the scope was sent 10 Oct. It's waiting on you to agree.

**Heat pumps · BE offices:**
- Rue Belvaux 22 and Grand-Place 3: Survey done, 7 Oct.
- Rue Neuve 61: Survey booked, "date to confirm".

**Solar PV FR/BE · scope:**
- Projects: Rue Belvaux 22, Domplatz 8, Grand-Place 3, Rue Neuve 61.
- All at Scope agreed on 2 Aug, with surveys done in July.

**Kervelstraat 14 · Solar PV** (for the project page). Based on:

| Field | Value | Source |
|---|---|---|
| Roof | Flat, age unknown | Site photos |
| Electricity use | 286 MWh a year | 12 months of bills |
| Indicative estimate | €115–140k · 7–9 yr payback | Estimates, 28 Aug |

History:

| Event | Detail | Date |
|---|---|---|
| Roof drawings requested | By email to you. | 2 Oct |
| Moved to Planning | No roof drawings; survey needed before tender. | 1 Sep |
| Estimate presented | €115–140k, 7–9 year payback. | 28 Aug |
| Joined Solar PV | Allocated from Flagship sites. | 20 May |

### Surveys (26 visits)

| Workstream | Service | Visits | State |
|---|---|---|---|
| Solar PV · Missing roof data | Planning | 7 surveys | To be booked — CQuel books them once roof drawings are in |
| Heat pumps · BE offices | Planning | 3 surveys | Rue Belvaux 22 done 7 Oct · Grand-Place 3 done 7 Oct · Rue Neuve 61 booked, date to confirm |
| Solar PV · FR offices | Planning | 8 surveys | Done, last on 3 Oct · survey documents |
| Solar PV DE | Tender | 1 site check | Done 8 Oct at Halverkamp 19 — roof can take panels · survey documents |
| EV charging · Voltreny | Delivery | 3 site checks | Done 20 Aug · no documents shared |
| Solar PV FR/BE · scope | Planning | 4 surveys | Done in July · survey documents |

Counts by state: To be booked 7, Booked 1, Done 18.

### Knock-on numbers on the earlier screens (check these after the change)

**Dashboard (33)**
- Pipeline: "18 workstreams across 2 batches", and Estimates 5 · Planning 4 · Tender 1 · Pricing 1 · Delivery 2 · Done 5.
- Batches card:
  - Flagship: Planning [with you, with you]. Meta: "12 buildings · 10 workstreams · by Dec 2027".
  - Offices: Planning [done, with you, with CQuel], replacing "Planned". Meta: "24 buildings · 8 workstreams · by Jun 2028".
- Right now: Waiting on you · 7, In progress · 6, Done · 5.
- Who it's waiting on: 7 With you · 2 With CQuel · 4 With suppliers.
- Momentum (cumulative):

| | Mar | Apr | May | Jun | Jul | Aug | Sep | Oct |
|---|---|---|---|---|---|---|---|---|
| Started | 0 | 0 | 3 | 4 | 5 | 12 | 16 | 18 |
| Finished | 0 | 0 | 1 | 1 | 1 | 4 | 5 | 5 |

**Batch page (35), Flagship**
- Header: 10 workstreams.
- Route header right: "4 with you · 3 with suppliers". Planning caption: "2 workstreams".
- The Planning NEEDS panel adds ● Car park ownership — 4 buildings (Asked 9 Oct).
- Workstreams in this batch: add an EV charging · DE flagships row. Header right: "7 in progress · 3 done".

**Workstreams list (36)**
- Meta: "18 workstreams across 2 batches · 13 in progress · 5 done".
- Flagship: 7 live + Done · 3.
- Offices: 6 live + Done · 2 (Solar PV FR/BE · Solvarek quote and Solar PV FR/BE · scope).

---

## Screen 40: Planning, Workstreams tab (`/concept/services/scope`)

- **Title** "Planning". **Meta:** "Done when the scope is agreed".
- **Tabs** under the meta line: **Workstreams (5) | Surveys (26)**. The active tab is underlined.
- **Filters:** search, then Batch, Solution and Responsibility.
- **Three cards,** each titled with its count:
  1. **Needs your input · 3:** Solar PV · Missing roof data, EV charging · DE flagships, Solar PV · FR offices.
  2. **In progress · 1:** Heat pumps · BE offices.
  3. **Done · 1:** Solar PV FR/BE · scope.
- **Columns:** Workstream · Batch · **Surveys** · Next (**Outcome** in the Done card) · Responsibility · View.
  - Surveys is two lines, split at " — ", e.g. "8 done" / "last on 3 Oct".
  - Next uses the usual two-line split.
- **Sort:** waiting days, longest first. Done: newest first.

## Screen 40b: Planning, Surveys tab (`/concept/services/scope?tab=surveys`)

- Same title, meta and tabs as 40, with **Surveys (26)** active.
- **Filters:** search, then Batch, **Service** and **Status**. On this tab Service is needed, because visits come from several services.
- **Three cards,** each titled with the number of visits in that state:
  1. **To be booked · 7**
  2. **Booked · 1**
  3. **Done · 18**
- **One row per workstream.** Columns: Workstream · Batch · Service · Visits ("7 surveys", "1 site check") · Status.
  - The last column holds **Survey documents** (secondary, small) when documents exist, otherwise **View**.
  - A workstream sits in the card for its open state. Heat pumps · BE offices is under Booked, even though 2 of its 3 visits are done; those 2 done visits still count in Done · 18.
- **Expanded rows:** a workstream whose visits are in mixed states lists its projects underneath, indented, each with its own state ("Done 7 Oct", or **Booked** "date to confirm").

## Screen 41: Workstream page (`/concept/workstreams/solar-roof`)

**Header**
- Breadcrumb: "Planning › Solar PV · Missing roof data".
- Title: "Solar PV · Missing roof data".
- Right: "With you" (filled) and **View batch**.

**1. Details** (4 × 2 grid):

| Row 1 | Row 2 |
|---|---|
| Service: Planning | Started: 1 Sep |
| Solution: Solar PV | Projects: 7 |
| Batch: Flagship sites (link) | Open gaps: Roof drawings · 7 projects |
| Lead: Tamsin Quarrell | Done when: Scope agreed |

**2. Steps**, header right "Projects at each step". Five columns, with the same component and panel styles as part 2:

| Step | Count | What happens | Panel |
|---|---|---|---|
| Gap found | — (passed) | We check what's missing before anything can be tendered. | FOUND (grey): ✓ No roof drawings for 7 projects — Found in Estimates, 28 Aug |
| Info requested | 7 projects | We ask you for what's missing. | NEEDS (solid, with you): ● Roof drawings — 7 buildings — Asked 2 Oct · waiting 17 days |
| Survey booked | — | We book a roof survey where drawings can't answer it. | NEEDS (dashed, CQuel): ○ Roof surveys — CQuel books them once drawings are in |
| Survey done | — | The surveyor checks each roof can take panels. | none |
| Scope agreed | — | You agree the scope; it's ready to tender. | none |

**3. Projects**, header right "7 · all waiting on roof drawings".
- Columns: Project (+ city) · Step · Open gap · Survey · View.
- No empty Scope column.

**4. Recent activity | Documents**

Recent activity:
| Date | Title | Text |
|---|---|---|
| 2 Oct | Roof drawings requested | For 7 buildings, by email to you. |
| 1 Sep | Workstream started | 7 projects moved from Estimates — no roof drawings; survey needed before tender. |

Documents:
| Document | Detail | Action |
|---|---|---|
| Indicative estimates — Solar PV | PDF · 28 Aug | Download |
| Files you sent | Site photos, 12 months of bills | View |

**Other Planning workstreams** use the same page with their own data. For example, Solar PV · FR offices has **Agree scope** in place of the open-gap need on its Survey done step, and the decision in its Projects list.

## Screen 42: Project page (`/concept/projects/solar-roof/f3`, Kervelstraat 14 · Solar PV)

**Header**
- Breadcrumb: "Planning › Solar PV · Missing roof data › Kervelstraat 14".
- Title: "Kervelstraat 14 · Solar PV", with "Antwerp" muted next to it.
- Right: "With you" (filled) and **View batch**.

**1. Details**: Batch (link) · Workstream (link) · Solution · Lead.

**2. Route**, header right "Services for this project":

| Service | State | Caption |
|---|---|---|
| Estimates | Done | "Done 28 Aug" / "€115–140k · 7–9 yr payback" |
| Planning | Now | "Now · Info requested" / "In Solar PV · Missing roof data" |
| Tender | Planned | "Planned" |
| Pricing | Planned | "Planned" |
| Delivery | Planned | "Planned" |

No needs panel.

**3. Two columns:**
- **Scope:**
  - Open gap: **Roof drawings**, "Asked 2 Oct · waiting 17 days", with **Reply by email** on the right of that row.
  - Survey: "Not booked yet", with "CQuel books it once drawings are in" under it.
  - Scope: "Written once the survey is done".
- **Based on:** the three rows above, each with its source on the right.

**4. History:** the four entries above.

---

## Done when
- Screens 40, 40b, 41 and 42 match the spec in structure and copy.
- The earlier screens show the knock-on numbers above.
- Cross-checks:
  - 40 shows 3 / 1 / 1, and the tab says 5
  - 40b shows 7 / 1 / 18, and the tab says 26
  - the dashboard pipeline adds up to 18
  - Who it's waiting on 7 / 2 / 4 matches Right now
  - Flagship = 10 workstreams on the dashboard, batch page and Workstreams list
- No future visit dates anywhere. No survey type field.
- The rules in parts 1, 2 and 3 pass, item by item. Write the checklist into your final message, with a pass or fail for each item.
