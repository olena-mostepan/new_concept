# Cursor prompt — Workstreams concept: dashboards and batch page

Paste everything below the line into Cursor, in the `new_concept` repo. The four SVGs are in `docs/concept/wireframes/`:
`33-dashboard-mature-v3.svg`, `34-dashboard-pilot-v3.svg`, `35-batch-page.svg`, `36-workstreams-v2.svg`.

---

## Task

Rebuild the customer side of the Workstreams concept under `/concept`, using the four approved wireframes in `docs/concept/wireframes/` and the spec below. Use the existing design system in this repo: tokens in `app/globals.css` (`--cq-accent` for the brand orange, `cq-text`, `cq-text-secondary`, `cq-muted`, `cq-border`, `cq-border-light`, `cq-bg`), the button classes `.btn-primary`, `.btn-secondary` and `.btn-link`, the font Schibsted Grotesk, and cards styled `rounded-xl border border-cq-border bg-white shadow-sm`. The wireframes are black and white on purpose. Translate them into the design system; don't copy their greys.

**This written spec is the source of truth.** The wireframes are a layout reference. Where they disagree with the spec, follow the spec.

Read `CLAUDE.md`, `docs/concept/taxonomy.md` and `docs/concept/feedback-round1.md` before you start.

### What to replace and what to keep
- The current files in `app/concept/**`, `components/concept/**` and `lib/concept/**` are an earlier attempt that was rejected. You may reuse `lib/concept/model.ts` (types, services, steps) and `lib/concept/data.ts` (the two example accounts), but change the data so it matches the numbers below exactly. Rewrite the screens.
- Delete `components/concept/nav.tsx`, which nothing uses any more.
- Keep `/concept/ops/**` as it is for now. Ops screens will be designed next. Only the place the toggle sits changes (see Chrome).
- Don't touch anything outside `/concept`.

### Routes
| Route | Screen |
|---|---|
| `/concept` | Portfolio dashboard. Mature account → screen 33. Pilot account (only one batch, plan not yet agreed) → screen 34. |
| `/concept/batches/[id]` | Batch page → screen 35. Same layout as 34. |
| `/concept/workstreams` | Workstreams list → screen 36 |
| `/concept/services/[service]`, `/concept/workstreams/[id]` | Keep the existing pages working, restyled with the new chrome. They're not part of this task. |

There is no batches list page and no Batches nav item. You reach a batch through **View batch**, which appears on the dashboard Batches card and on each batch card in the Workstreams list, and from a workstream's batch link.

---

## Rules (every screen must pass all of these — check before you finish)

**Content**
- Each workstream's next line is one string in the format "main — detail", and every screen shows the same string. The Workstreams list splits it into two lines at the " — ".
- No future dates. Show only past dates, and estimates the platform already holds, labelled as estimates.
- Don't show data the platform doesn't have: no benchmarks, no "savings", no survey type.
- No filler copy. Every line says something specific. Use the copy below word for word.
- No block that repeats another block.
- Numbers must agree across every block and screen. Work them out from the data; don't type them in.
- No deposits anywhere.

**Model**
- The column and filter that show who a workstream is with are called **Responsibility**.
- The workstream is the main unit. Headlines and counts are in workstreams and batches, not projects.
- A workstream is always shown with its batch.
- The customer status of a workstream is one of four: **With you · With CQuel · With suppliers · Done**. Nothing else ("Proposed", "Starts when…" and so on are not statuses). Steps are detail inside a workstream.
- Only Tender has a brief. Contracting is part of Pricing.

**Customer role**
- Customers don't create projects or enter data. There's no "Create projects" button anywhere.
- The only customer actions are: **Agree plan**, **reply by email** (to send what we asked for), and a **decision** (e.g. "See estimates").
- When CQuel or a supplier is getting something, say so ("CQuel books them"). Don't show it as missing.

**Scale** (a mature batch ends up with about 10–15 workstreams over its life, but only a handful are live at once)
- Batch page: show live workstreams in full. Fold done ones into a single "Done · N" line with a Show link.
- Dashboard Batches card: show one dot per workstream in a service cell, up to 4. Above 4, show the number instead.
- Dashboard Right now: above 5 done workstreams, fold the Done group into "N workstreams done · See all".

---

## Chrome (all customer screens)

- **Left:** logo mark, the "Powered by CQuel" chip, then the account name as the title (e.g. "Halvering Estates").
- **Right, in this order:** Questions (a text link), then a **Customer / Ops** segmented toggle, then the avatar. The toggle switches between the customer view and `/concept/ops` for the same place (batch ↔ ops batch, anything else ↔ ops home). Remove the old prototype strip above the header.
- No Create projects button. No language switch.
- **Nav:** Portfolio · Workstreams · Estimates · Planning · Tender · Pricing · Delivery. The active item has an orange underline in `--cq-accent`.
- Keep a way to switch between the two example accounts for the prototype, but make it a small text link in the footer ("Example account: Halvering Estates · switch"). Don't put it in the header.

---

## Data

### Halvering Estates (mature): 2 batches, 10 workstreams

**Batches**
| Batch | Goal | Buildings | Target |
|---|---|---|---|
| Flagship sites | Cut energy use at the 12 flagship sites | 12 | by Dec 2027 |
| Offices DE, FR and BE | Replace gas heating in the office portfolio | 24 | by Jun 2028 |

**Workstreams**
| Workstream | Batch | Service | Status | Buildings (done / active) | Next line |
|---|---|---|---|---|---|
| Solar PV · Missing roof data | Flagship | Planning | With you | 0 / 7 | Roof drawings for 7 buildings — asked 2 Oct · waiting 17 days |
| LED | Flagship | Estimates | With you | 2 / 8 (1 dropped) | Go or no-go on 3 estimates — presented 6 Oct · waiting 13 days |
| Solar PV DE | Flagship | Tender | With suppliers | 0 / 5 | 8 of 11 offers in — last 3 chased 12 Oct |
| Heat pumps · Kelderby | Flagship | Pricing | With suppliers | 0 / 4 | Price from Kelderby — requested 1 Oct · waiting 18 days |
| EV charging · Voltreny | Flagship | Delivery | With suppliers | 2 / 6 | Installing at Kervelstraat 14 |
| Heat pumps | Offices | Estimates | With CQuel | 0 / 20 | Estimates as building data lands |
| Solar PV FR/BE · Solvarek | Offices | Delivery | With suppliers | 1 / 4 | Installing at Grand-Place 3 |
| Solar PV | Flagship | Estimates | Done 28 Aug | — | — |
| EV charging | Flagship | Tender | Done 5 Aug | — | Voltreny chosen |
| Solar PV FR/BE · Solvarek quote | Offices | Pricing | Done 15 Sep | — | — |

**Steps per project** (for the batch page). Use the step names in `lib/concept/model.ts`.
- LED: 3 buildings at Estimate, 3 at Presented, 3 at Decision (2 go, 1 no). Kelmsdorfer Straße 41 is not proceeding because the payback is over 12 years.
- Solar PV · Missing roof data: 7 buildings at Info requested.
- Solar PV DE: 5 buildings at Invited.
- Heat pumps · Kelderby: 4 buildings at Price requested.
- EV charging · Voltreny: 3 buildings at Payment plan, 1 Installing, 2 Completed.

**Recent activity** (newest first)
| Date | Workstream | Text |
|---|---|---|
| 15 Oct | Heat pumps | Estimates ready for 3 more buildings. |
| 9 Oct | Solar PV FR/BE · Solvarek | Rue Belvaux 22 completed. |
| 8 Oct | LED | Kelmsdorfer Straße 41 not proceeding — payback over 12 years. |
| 8 Oct | Solar PV DE | Halverkamp 19: survey confirmed the roof can take panels. |
| 6 Oct | LED | 3 estimates presented. |
| 3 Oct | Offices DE, FR and BE | 6 buildings joined the batch. |
| 2 Oct | Solar PV · Missing roof data | Roof drawings requested for 7 buildings. |

**Momentum** (cumulative workstreams per month)

| | Mar 26 | Apr 26 | May 26 | Jun 26 | Jul 26 | Aug 26 | Sep 26 | Oct 26 |
|---|---|---|---|---|---|---|---|---|
| Started | 0 | 0 | 2 | 3 | 3 | 6 | 10 | 10 |
| Finished | 0 | 0 | 0 | 0 | 0 | 2 | 3 | 3 |

### Showcase Cinemas (pilot): 1 batch, 2 proposed workstreams

**Batch:** "Pilot · 8 cinemas".
- **Goal:** find out what EV charging and solar would cost across 8 cinemas.
- **Lead:** Tamsin Quarrell.
- **History:** files received 9 Oct (23 files), plan proposed 14 Oct, plan not yet agreed.
- **Buildings (8):** Bluewater (Dartford), Leeds, Derby, Nottingham, Coventry, Avonmeads (Bristol), Reading, Peterborough.
- **Route:** Getting started → Estimates → Planning → Tender → Delivery. Pricing is not required, because there's no existing supplier to price with.

**Workstreams** (both Estimates, both "With you" until the plan is agreed)
| Workstream | Buildings | What it gives you |
|---|---|---|
| EV Charging | All 8 cinemas | Cost and payback per site |
| Solar PV | Bluewater, Derby, Coventry, Avonmeads, Peterborough. Leeds, Nottingham and Reading are left out because of pitched or shared roofs. | System size, cost and payback per roof |

**Needs for Estimates**
| Need | Workstream | Why | State |
|---|---|---|---|
| Half-hourly electricity data, 12 months — all 8 sites | EV Charging | Sizes chargers to spare capacity | With you |
| Car park ownership — Leeds, Reading | EV Charging | Leased car parks need landlord consent | With you |
| Roof age or last re-roof — 5 sites | Solar PV | A roof due for replacement changes the payback | With you |
| Site plans and 12 months of electricity bills | — | — | Received 9 Oct |

**Recent activity**
| Date | Title | Text |
|---|---|---|
| 14 Oct | Plan proposed | 2 workstreams: EV Charging on 8 sites, Solar PV on 5. |
| 9 Oct | Files received | 23 files — site plans, drawings, electricity bills. |
| 8 Oct | Pilot set up | 8 cinemas added by Tamsin Quarrell. |

**Documents**
| Document | Detail | Action |
|---|---|---|
| Plan — pilot, 8 cinemas | PDF · 14 Oct | Download |
| Files you sent | 23 files · site plans, drawings, 12 months of bills · 9 Oct | View |
| Indicative estimates | After Estimates | Greyed out, no action |

---

## Screen 33: Mature dashboard (`/concept`, Halvering)

Title: "Welcome back, Olena Mostepan".

1. **Pipeline** (full width).
   - Header right: "10 workstreams across 2 batches".
   - One segmented bar showing **live workstreams per service**, plus Done: Estimates 2 · Planning 1 · Tender 1 · Pricing 1 · Delivery 2 · Done 3.
   - Each segment has a minimum width so the labels never overlap. Shades go from light (Indicative) to dark (Done).
   - No captions under the bar.
2. **Batches** (full width). One row per batch:
   - **Left:** the batch name, linking to `/concept/batches/[id]`. Under it, the goal, then a meta line ("12 buildings · 7 workstreams · by Dec 2027").
   - **Middle:** 5 service cells. Each cell shows the service label, then one dot per workstream in that service, then a text line per state ("1 done", "1 with you", "1 with suppliers").
     - Dots: done = filled; with you = thick ring; others = thin grey ring.
     - A service the batch doesn't use = greyed label, dashed dot, "Not required".
     - A service in the route with no workstream yet = "Planned".
   - **Right:** the batch's status pill, with a **View batch** button (`.btn-secondary`, small) under it, the same as on the Workstreams list. Batch status = "With you" if any workstream in it is with you, otherwise With CQuel, then With suppliers, then Done.
   - Flagship: Indicative [done, with you] · Scope [with you] · Tender [done, with suppliers] · Pricing [with suppliers] · Delivery [with suppliers] → With you.
   - Offices: Indicative [with CQuel] · Scope Planned · Tender Not required · Pricing [done] · Delivery [with suppliers] → With CQuel.
3. **Two columns.**
   - **Left, "Right now":** header link "All workstreams". Three groups with a grey group header each:
     - "Waiting on you · 2"
     - "In progress · 5"
     - "Done · 3"
     - In the first two groups, each row shows: workstream name, service tag (small caps), batch name (muted), "X of Y buildings done" on the right, a thin progress bar, the next line, and the status pill. In "Waiting on you" the next line is bold and the pill is the filled "With you".
     - Done rows show: name, service tag, and "Done 15 Sep" on the right.
   - **Right, "Who it's waiting on":** the counts only. 2 With you · 1 With CQuel · 4 With suppliers, with "Workstreams" as the header right. No list underneath; how long each item has waited is on its Right now row.
   - **Right, below it, "Recent activity":** the 7 entries, with a "See all" link. Height matches the left column.
4. **Momentum** (full width). Header right: "Workstreams started and finished". Two lines: Started (solid) and Finished (dashed), Mar 26 to Oct 26. Use recharts, which is already a dependency.

## Screens 34 and 35: Batch view (one component, `BatchView`)

Both screens are the same component. Screen 34 renders it on `/concept` for a pilot account, under "Welcome back, Olena Mostepan", with the batch name as the first card's title. Screen 35 renders it on `/concept/batches/[id]`:
- Breadcrumb: Portfolio › Flagship sites.
- Page title: the batch name.
- Meta line: "Cut energy use at the 12 flagship sites · 12 buildings · 7 workstreams · by Dec 2027".
- The first card is titled "Route".

### Block 1: Route, with what each stage needs hanging off it
- **Card header right:**
  - pilot: "8 buildings · 2 workstreams · Lead Tamsin Quarrell"
  - batch page: "2 with you · 3 with suppliers"
- **Pilot only:** a goal line above the route: "Goal: find out what EV charging and solar would cost across 8 cinemas".
- **Six equal columns:** Getting started, Estimates, Planning, Tender, Pricing, Delivery. Each has the stage name, a bar and a caption.
  - Done stage: dark bar, caption with the date ("Agreed 20 May").
  - Now stage: outlined bar with a half fill, bold caption ("Now · plan ready", "2 workstreams · 1 done", "1 workstream").
  - Planned stage: light bar, "Next" for the first one, "Planned" for the rest.
  - Not used: dashed bar and "Not required". Prefix the label with "or" only when Tender or Pricing is the one not used.
- **Needs panels:** under the route, one panel per stage that has needs, aligned under its column. A short vertical line with a dot runs from that stage's bar down to the panel, so it's clear which stage the needs belong to.
  - Panel for the stage happening now: solid border.
  - Panel for the next stage: dashed border and lighter text. It can span several columns.
  - Panel items:
    - With you: filled dot and bold text.
    - With CQuel or suppliers: hollow dot.
    - Received: tick and muted text, with a sub-line saying who or when.
- **Pilot panels:**
  - Under Getting started, solid, "TO START": ✓ Files received 9 Oct · ✓ Plan proposed 14 Oct · ● You agree the plan · **[Agree plan]** button (`.btn-primary`).
  - Under Estimates, dashed, spanning 3 columns, "ESTIMATES WILL NEED": the 4 needs above, then the link "Send any time — reply to Tamsin's email".
- **Batch page panels**, all solid, one column each, headed "NEEDS":
  - Estimates: ● Go or no-go on 3 LED estimates (Presented 6 Oct) · **[See estimates]**
  - Planning: ● Roof drawings — 7 buildings (Asked 2 Oct) · ○ Roof surveys (CQuel books them) · "Reply by email" link
  - Tender: ○ Offers from 3 suppliers (8 of 11 in)
  - Pricing: ○ Price from Kelderby (Asked 1 Oct)
  - Delivery: ✓ Nothing from you (Installing at Kervelstraat 14)
- **Agree plan behaviour:** when clicked, the batch goes live. Getting started becomes done ("Agreed 19 Oct"), Estimates becomes now, and the "Estimates will need" panel turns solid. Keep this in client state; a reload can reset it.

### Block 2: Workstreams in this batch
This block shows what's inside each workstream. Don't list the services again.
- **Card header right:** pilot "Proposed 14 Oct"; batch page "5 in progress · 2 done".
- **One row per live workstream:**
  - **Top line:** name, service tag, and the status pill on the right.
  - **Left:** the service's steps as a horizontal track. Passed steps are filled dots. Steps where projects sit now are a ring with a centre dot and a bold label, with the building count under the label (e.g. "Estimate · 3 buildings"). Upcoming steps are hollow and muted. Pilot (not started): every step is hollow, with the building count under the first step.
  - **Right:** "BUILDINGS" label, then the building names. After 4 names show "+N". Also add any exclusion note, e.g. "Leeds, Nottingham and Reading left out — pitched or shared roofs".
  - **Under the buildings:** what the workstream gives the customer, in one line, from the table above ("You get: cost and payback per site").
- **Batch page:** after the live rows, one grey line: "DONE · 2 Solar PV — Estimates, 28 Aug | EV charging — Tender, Voltreny chosen 5 Aug", with **Show** on the right. Show expands the done rows in the same format.

### Block 3: Activity (and documents)
- **Pilot:** two columns, Recent activity (3 entries) and Documents (3 entries), both with "See all".
- **Batch page:** Recent activity only, full width. Show only that batch's entries: 8 Oct LED · 8 Oct Solar PV DE · 6 Oct LED · 2 Oct Solar PV · Missing roof data.

There is no "What we know" block and no buildings list. They were removed on purpose because they repeated other blocks.

---

## Screen 36: Workstreams list (`/concept/workstreams`)

- **Title** "Workstreams". **Meta** line: "10 workstreams across 2 batches · 7 in progress · 3 done".
- **Filter row:** a search box ("Search workstreams or buildings"), then four dropdowns: Batch, Service, Solution, Responsibility. Responsibility has the four values. There's no Deposit filter. Filters also take `?service=` and `?batch=` from the URL.
- **No summary cards above the list.** The service cards in the old 07 repeated the nav and the dashboard pipeline.
- **One card per batch:**
  - **Header:** batch name (no chevron here, since View batch does that job); then the goal · buildings · target. On the right: the batch status pill (same rule as the dashboard), then a **View batch** button (`.btn-secondary`, small) that opens `/concept/batches/[id]`.
  - **Table**, with these columns: Workstream · Service · Supplier · Progress · Next · Responsibility.
    - Supplier: shown only where there is one (Kelderby, Voltreny, Solvarek); otherwise "—".
    - Progress: a thin bar plus "X of Y buildings done".
    - Next: two lines. The main text first (bold when it's with you), e.g. "Roof drawings for 7 buildings"; then the detail muted underneath, e.g. "Asked 2 Oct · waiting 17 days".
    - Responsibility: the status pill (filled when it's with you).
    - Last column: a **View** button (`.btn-secondary`, small) on every workstream row, opening `/concept/workstreams/[id]`.
    - No Solution column and no Deposit column.
  - **Row order** in each batch: With you first, then the other live workstreams.
  - **Done workstreams** fold into a grey "DONE · N" line at the bottom of the card, with Show.
    - Flagship: "Solar PV — Estimates, 28 Aug | EV charging — Tender, Voltreny chosen 5 Aug".
    - Offices: "Solar PV FR/BE · Solvarek quote — Pricing, 15 Sep".
- **Filters:** when a filter leaves a batch with no rows, hide that batch card. The Service nav tabs (`/concept/services/[service]`) render this same list with the Service filter preset.

## Implementation notes
- Put the data in `lib/concept/data.ts` and work every count out in `lib/concept/derive.ts`: pipeline, batch cells, batch status, waiting-on counts, "X of Y done", step counts and "days waiting". Days waiting = days from the asked date to 19 Oct 2026; keep `TODAY` in `model.ts`.
- Shared components go in `components/concept/`:
  - `StatusPill`, with the four statuses only
  - `ServiceTag`
  - `RouteWithNeeds`
  - `WorkstreamSteps`
  - `BatchView`
  - `RightNow`
  - `BatchesCard`
  - `WorkstreamsByBatch` (screen 36; also used by the service pages)
- Read the "Who it's with" colours from tokens: with you = `--cq-owner-you` (orange), CQuel = `--cq-owner-cquel`, suppliers = `--cq-owner-suppliers`, done = neutral. A filled pill is only for "With you" on the dashboard.
- Run `npm run build` and fix every error in `/concept`.

## Done when
- `/concept` (Halvering), `/concept` (Showcase), `/concept/batches/flagship` and `/concept/workstreams` match screens 33, 34, 35 and 36 in structure and copy.
- The Rules section passes, item by item. Write the checklist into your final message, with a pass or fail for each item.
- Counts cross-check:
  - pipeline total = 10
  - Flagship = 7 workstreams on the dashboard and the batch page
  - Who it's waiting on 2/1/4 matches the Right now groups
  - LED steps 3+3+3 = 9 buildings
  - Voltreny 3+1+2 = 6
  - screen 36 shows 7 live and 3 done
- Agree plan works on the pilot.
- No "Create projects" button, no Batches nav item, no deposits, no benchmarks and no future dates anywhere under `/concept`.
