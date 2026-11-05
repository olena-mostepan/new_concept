# Cursor prompt, part 2: Estimates (section, workstream, project)

Run this after part 1 (`docs/concept/cursor-prompt-dashboards.md`), in the same `new_concept` repo. Paste everything below the line into Cursor. The wireframes are in `docs/concept/wireframes/`:
`37-indicative-pricing-v2.svg`, `38-workstream-indicative-v2.svg`, `39-project-indicative-v2.svg`.

---

## Task

Build the Estimates part of the customer side under `/concept`:
- the section page (screen 37)
- the workstream page for an Estimates workstream (screen 38)
- the project page for a project inside one (screen 39)

Also add four workstreams to the Halvering data. Then make the part-1 screens use the new numbers and the "project" wording below.

Use the same design system, components and rules as part 1. **This written spec is the source of truth.** The wireframes are a layout reference. Screens 33, 35 and 36 were drawn before the four new workstreams existed, so their counts are out of date; use the numbers in this prompt.

Read `CLAUDE.md`, `docs/concept/taxonomy.md` and part 1 first. Every rule in part 1 still applies.

### Routes
| Route | Screen |
|---|---|
| `/concept/services/indicative` | Estimates section → screen 37. This replaces the part-1 behaviour, where service tabs reused the Workstreams list. Planning, Tender, Pricing and Delivery keep the part-1 behaviour until they're designed. |
| `/concept/workstreams/[id]` for an Estimates workstream | Workstream page → screen 38 |
| `/concept/projects/[workstreamId]/[buildingId]` | Project page → screen 39. Only Estimates projects for now. |

The nav highlights "Estimates" on all three screens.

---

## New rules (add these to the part-1 rules and check every screen against both sets)

**Vocabulary**
- Inside a workstream, call things **projects**, not buildings. A project is one building × one solution.
- Replace "X of Y buildings done" with "X of Y projects done" everywhere, including the dashboard Right now rows, the Workstreams list and the batch page.
- The batch page workstream rows get a "PROJECTS" label instead of "BUILDINGS". The step counts read "3 projects".
- "Building" stays only where it means the building itself: the project title, the batch meta line ("12 buildings") and "Based on".
- No building counts on lists. No building-level views.

**Route vs steps vs needs**
- A **route** lists services. It belongs to things that move through services: the batch (part 1) and the project (screen 39).
- **Steps** belong to the workstream, because one workstream is one service (screen 38).
- **Needs** hang off the batch route and the workstream steps. The project page has no needs panel; its decision sits with the estimate.

**Navigation**
- Every workstream page and project page shows its batch as a link and has a **View batch** button (`.btn-secondary`, small) next to the Responsibility pill.
- Workstream rows end with **View**.

**Decisions**
- Go ahead / Not now is a decision per project. It appears on the workstream page and the project page, never on a list.
- Clicking it changes that project in client state: its Decision column shows "Going ahead · 19 Oct" or "Not now · 19 Oct", and the counts update.
- A reload can reset it.

---

## Data changes (Halvering Estates)

Add four Estimates workstreams, and add project-level estimate data to the existing ones. The account now has **14 workstreams**. Keep working every count out from the data.

### Estimates workstreams (all seven)

| Workstream | Batch | Status | Projects | Estimate (presented) | Next line |
|---|---|---|---|---|---|
| LED | Flagship sites | With you | 9 | €85–102k | Go or no-go on 3 estimates — presented 6 Oct · waiting 13 days |
| Solar PV · Offices DE | Offices DE, FR and BE | With you | 6 | €420–480k | Go or no-go on 6 estimates — presented 9 Oct · waiting 10 days |
| EV charging · Offices | Offices DE, FR and BE | With you | 12 | €310–360k | Go or no-go on 12 estimates — presented 14 Oct · waiting 5 days |
| Heat pumps | Offices DE, FR and BE | With CQuel | 20 | — | Estimates as building data lands — 3 of 20 ready |
| Heat pumps · Flagship | Flagship sites | With you | 8 | — | Gas bills for 8 buildings — asked 1 Oct · waiting 18 days |
| Solar PV | Flagship sites | Done 28 Aug | 12 | €1.4–1.7m | You decided 28 Aug — 5 to Tender, 7 to Planning |
| EV charging | Flagship sites | Done 30 May | 6 | €140–170k | You decided 30 May — all 6 to Tender |

New: Solar PV · Offices DE, EV charging · Offices, Heat pumps · Flagship, and EV charging (Flagship, Estimates, done).

**Leads:**
- Rich Amos: LED, Heat pumps, Solar PV · Offices DE, Heat pumps · Flagship
- Tamsin Quarrell: EV charging · Offices, Solar PV, EV charging

**Started dates:**
| Workstream | Started |
|---|---|
| LED | 20 May |
| Solar PV | 20 May |
| EV charging | 20 May |
| Heat pumps | 4 Aug |
| Solar PV · Offices DE | 4 Aug |
| EV charging · Offices | 4 Aug |
| Heat pumps · Flagship | 1 Oct |

### Projects with estimates (EUR; payback in years)

**LED** (Flagship):
| Project | City | Step | Estimate | Payback | Decision |
|---|---|---|---|---|---|
| Halverkamp 19 | Hamburg | Presented | €12–15k | 4 | waiting |
| Kervelstraat 14 | Antwerp | Presented | €10–12k | 5 | waiting |
| Speicherallee 7 | Hamburg | Presented | €16–19k | 6 | waiting |
| Lindenhof 3 | Munich | Decision | €14–17k | 5 | Going ahead · 8 Oct |
| Wiesenstraße 88 | Frankfurt | Decision | €12–14k | 4 | Going ahead · 8 Oct |
| Kelmsdorfer Straße 41 | Berlin | Decision | €21–25k | Over 12 | Not proceeding — payback over 12 years |
| Am Hafen 12 | Bremen | Estimate | — | — | — |
| Brückenstraße 5 | Cologne | Estimate | — | — | — |
| Marktplatz 2 | Düsseldorf | Estimate | — | — | — |

The presented estimates add up to €85–102k.

**LED project details** (for the project page "Based on" card), for Halverkamp 19:
- Floor area 8,400 m² (from floor plans)
- Current lighting T8 fluorescent (from site photos)
- Electricity use 412 MWh a year (from 12 months of bills)
- Operating hours Mon–Sat, 7:00–23:00 (from your schedule)

For the other LED projects, show the same four fields with "—", and keep the source labels.

**Solar PV · Offices DE** (Offices): all 6 at Presented, all waiting, payback 7–9 years. They add up to €420–480k.
| Project | Estimate |
|---|---|
| Friedrichstraße 200 | €80–92k |
| Königsallee 60 | €65–74k |
| Zeil 106 | €72–82k |
| Leopoldstraße 33 | €58–66k |
| Mönckebergstraße 11 | €77–88k |
| Schildergasse 72 | €68–78k |

**EV charging · Offices** (Offices): all 12 at Presented, all waiting, payback 6 years. They add up to €310–360k.
- Rue Belvaux 22 to Place Kléber 4 (Offices buildings 1–10): €26–30k each
- Rue du Faubourg 18 and Cours Mirabeau 26: €25–30k each

**Heat pumps** (Offices): 20 projects, Avenue Louise 140 to Kaiserstraße 44 (Offices buildings 2–21). None presented.
- Avenue Louise 140, Rue de la Loi 81 and Meir 48 are at Estimate and ready.
- 9 more are at Estimate.
- 8 are at Data collected.

**Heat pumps · Flagship**: 8 projects, all at Data collected, waiting on gas bills: Halverkamp 19, Kelmsdorfer Straße 41, Kervelstraat 14, Speicherallee 7, Am Hafen 12, Marktplatz 2, Havenweg 30, Kanaalstraat 9.

**Solar PV** (Flagship, done): 12 projects, all at Decision.
- Going ahead to Tender: Halverkamp 19, Speicherallee 7, Lindenhof 3, Wiesenstraße 88, Parkring 16
- To Planning: the other 7
- Estimates: €115–140k for 8 of them and €120–145k for 4, adding up to €1.4–1.7m.

**EV charging** (Flagship, done): 6 projects, all going ahead to Tender: Halverkamp 19, Kervelstraat 14, Speicherallee 7, Am Hafen 12, Havenweg 30, Kanaalstraat 9.
- Estimates: €23–28k for 4 of them and €24–29k for 2, adding up to €140–170k.

### Knock-on numbers on the part-1 screens (check these after the change)

**Dashboard (33)**
- Pipeline: "14 workstreams across 2 batches", and Estimates 5 · Planning 1 · Tender 1 · Pricing 1 · Delivery 2 · Done 4.
- Batches card:
  - Flagship: Estimates [done, done, with you, with you] → "2 done", "2 with you". Meta: "12 buildings · 9 workstreams · by Dec 2027".
  - Offices: Estimates [with CQuel, with you, with you]. Meta: "24 buildings · 5 workstreams · by Jun 2028".
- Right now: Waiting on you · 5, In progress · 5, Done · 4.
- Who it's waiting on: 5 With you · 1 With CQuel · 4 With suppliers.
- Momentum (cumulative):

| | Mar | Apr | May | Jun | Jul | Aug | Sep | Oct |
|---|---|---|---|---|---|---|---|---|
| Started | 0 | 0 | 3 | 4 | 4 | 9 | 13 | 14 |
| Finished | 0 | 0 | 1 | 1 | 1 | 3 | 4 | 4 |

**Batch page (35), Flagship**
- Header: 9 workstreams.
- Route: Estimates caption "4 workstreams · 2 done". The Estimates NEEDS panel adds ● Gas bills for 8 buildings (Asked 1 Oct).
- Route header right: "3 with you · 3 with suppliers".
- Workstreams in this batch: add a Heat pumps · Flagship row. Header right: "6 in progress · 3 done".
- Done line: "DONE · 3 Solar PV — Estimates, 28 Aug | EV charging — Estimates, 30 May | EV charging — Tender, Voltreny chosen 5 Aug".

**Workstreams list (36)**
- Meta: "14 workstreams across 2 batches · 10 in progress · 4 done".
- Flagship: 6 live + Done · 3.
- Offices: 4 live (Solar PV · Offices DE and EV charging · Offices first, because they're with you) + Done · 1.

---

## Screen 37: Estimates section (`/concept/services/indicative`)

This page is about the service's workstreams. Don't reuse the Workstreams list layout.

- **Title** "Estimates". **Meta:** "Done when you've decided · 7 workstreams across 2 batches".
- **Filters:** search ("Search workstreams or buildings"), then Batch, Solution and Responsibility. No Service filter, because the page already is one service.
- **Three separate cards, one per group,** each titled with its count:
  1. **Needs your decision · 3** (LED, Solar PV · Offices DE, EV charging · Offices). This is With you plus estimates presented.
  2. **In progress · 2** (Heat pumps, Heat pumps · Flagship). Everything else that's live, including With you items that aren't decisions.
  3. **Done · 2** (Solar PV, EV charging).
- **Columns in every card:** Workstream · Batch · Estimate · Next · Responsibility · View.
  - Batch is plain text in its own column.
  - Estimate is the presented total in bold, or "—".
  - Next uses the two-line split at " — ". In the Done card this column is headed **Outcome**.
  - Responsibility is the pill, filled for With you.
  - **View** is a button on every row.
- **Sort order:**
  - Needs your decision and In progress: by waiting days, longest first.
  - Done: newest first.
- **Scale:** above 5 rows, the Done card folds to "N done · Show".
- **Not on this page:** progress bars, building counts, a decisions bar and legend, the payback range, any customer action buttons. These were all tried and removed.

## Screen 38: Workstream page (`/concept/workstreams/led-ind`)

**Header**
- Breadcrumb: "Estimates › LED".
- Title: "LED".
- Right: the Responsibility pill ("With you", filled) and **View batch**.
- No subtitle.

**1. Details** card, 8 fields in a 4 × 2 grid:

| Row 1 | Row 2 |
|---|---|
| Service: Estimates | Started: 20 May |
| Solution: Lighting | Projects: 9 |
| Batch: Flagship sites (link to the batch page) | Estimated cost: €85–102k · 6 presented |
| Lead: Rich Amos | Done when: You've decided |

**2. Steps** card, header right "Projects at each step". There are four equal columns, one per step. Each column has:
- a dot on the track (filled = passed; ring with a centre dot = projects are there now; hollow = upcoming)
- the step name
- the project count ("3 projects")
- one line saying what happens at that step
- a needs panel hanging off the step, with a short line and dot from the step text down to the panel

| Step | Count | What happens | Panel |
|---|---|---|---|
| Data collected | 9 projects | We gather floor plans, current lighting and energy use for each project. | RECEIVED (grey): ✓ Floor plans, site photos, 12 months of bills — From you |
| Estimate | 3 projects | We work out cost and payback for each project. | NEEDS (dashed line, plain border): ○ Estimates for Am Hafen 12, Brückenstraße 5, Marktplatz 2 — CQuel is preparing them |
| Presented | 3 projects | We share the estimates with you, project by project. | NEEDS (solid black border and line): ● Your go or no-go on 3 estimates — Presented 6 Oct · waiting 13 days |
| Decision | 3 projects | You decide which projects go ahead. | DECIDED (grey): ✓ 2 going ahead, 1 not proceeding — Decided 8 Oct |

**3. Projects** card, header right "9 · 3 waiting for your decision".
- Columns: Project (name + city, muted) · Step · Estimate · Payback · Your decision · View.
- Rows waiting for a decision are outlined, and their decision cell holds **Go ahead** (primary, small) and **Not now** (secondary, small).
- Other rows show their decision as text ("Going ahead · 8 Oct", "Not proceeding — payback over 12 years"), or "—".
- **View** opens the project page.

**4. Two columns:** Recent activity and Documents.

Recent activity:
| Date | Title | Text |
|---|---|---|
| 8 Oct | Kelmsdorfer Straße 41 | Not proceeding — payback over 12 years. |
| 8 Oct | Lindenhof 3, Wiesenstraße 88 | You decided to go ahead. |
| 6 Oct | 3 estimates presented | Halverkamp 19, Kervelstraat 14, Speicherallee 7. |
| 24 Sep | 3 estimates presented | Lindenhof 3, Wiesenstraße 88, Kelmsdorfer Straße 41. |
| 20 May | Workstream started | 9 projects allocated from Flagship sites. |

Documents:
| Document | Detail | Action |
|---|---|---|
| Estimates — LED, 6 projects | PDF · 6 Oct | Download |
| Files you sent | Floor plans, site photos, 12 months of bills | View |

**Not on this page:** the batch route (it belongs to the batch page), building counts, or a separate estimates card. The Projects list is the estimates.

The other six Estimates workstreams use the same page, with their own data. For workstreams with nothing presented, the Projects list shows "—" for estimate, payback and decision, and the Steps panels say what's being collected.

## Screen 39: Project page (`/concept/projects/led-ind/f1`, Halverkamp 19 · LED)

This page is "debug mode": reachable, and kept slim.

**Header**
- Breadcrumb: "Estimates › LED › Halverkamp 19".
- Title: "Halverkamp 19 · LED", with "Hamburg" muted next to it.
- Right: the Responsibility pill and **View batch**.

**1. Details**, one row of 4 fields:
- Batch: Flagship sites (link)
- Workstream: LED (link)
- Solution: Lighting
- Lead: Rich Amos

**2. Route** card, header right "Services for this project".
- Five columns: Estimates · Planning · Tender · Pricing · Delivery. Use the batch's route; there's no Getting started column.
- The current service gets an outlined bar with a fill and the caption "Now · in LED", with "Estimate presented 6 Oct" under it. The others say "Planned".
- No needs panel.

**3. Two columns:**
- **Estimate:** Cost €12–15k · Payback 4 years · Your decision **[Go ahead] [Not now]**.
- **Based on:** each row shows the value, then its source on the right, muted:

| Field | Value | Source |
|---|---|---|
| Floor area | 8,400 m² | Floor plans |
| Current lighting | T8 fluorescent | Site photos |
| Electricity use | 412 MWh a year | 12 months of bills |
| Operating hours | Mon–Sat, 7:00–23:00 | Your schedule |

**4. History** (the project's transitions, with their reasons):

| Event | Detail | Date |
|---|---|---|
| Estimate presented | Cost €12–15k, payback 4 years. | 6 Oct |
| Joined LED | Allocated from Flagship sites. | 20 May |

**Not on this page:** steps, a needs panel, other projects at the same building, or any date or fact shown twice.

---

## Implementation notes
- Add estimate, payback and decision fields per project to the model:
  - `estimate?: [number, number]` in € thousands
  - `paybackYears?: number | 'over12'`
  - `decision?: 'waiting' | 'go' | 'no' | ...`
  - `decidedOn?`
- Add `basedOn?` for the project page, and a per-project `history` derived from transitions.
- Put the step "what happens" lines for Estimates in `model.ts`, next to the step names. Other services get theirs when they're designed.
- New shared components in `components/concept/`:
  - `DetailsGrid`
  - `StepsWithNeeds` (the workstream steps block)
  - `ProjectsTable`
  - `ProjectRoute` (the route without Getting started, without needs)
  - `DecisionButtons`
  - `ServiceSection` (screen 37: grouped cards, where the service supplies its column, e.g. Estimate)
- Run `npm run build` and fix every error in `/concept`.

## Done when
- Screens 37, 38 and 39 match the spec, structure and copy.
- The part-1 screens show the new knock-on numbers above, and say "projects done" instead of "buildings done".
- Cross-checks:
  - 37 shows 3 / 2 / 2
  - LED steps 9 / 3 / 3 / 3
  - LED estimates add up to €85–102k
  - Solar PV · Offices DE adds up to €420–480k
  - EV charging · Offices adds up to €310–360k
  - the dashboard pipeline adds up to 14
  - Who it's waiting on 5 / 1 / 4 matches Right now
- Go ahead / Not now updates the project, the Steps counts and the Projects header.
- The rules in part 1 and part 2 pass, item by item. Write the checklist into your final message, with a pass or fail for each item.
