# Cursor prompt, part 20: Buildings, Overview and the building page

Paste everything below the line into Cursor, in the `new_concept` repo. Attach these images from `docs/concept/wireframes/`:

- `74-overview-search.png` (mature Overview)
- `80-pilot-overview.png` (pilot Overview)
- `76-buildings.png` (Buildings list)
- `77-building-page.png` (building page)
- `78-workstream.png` (workstream page)

Wireframes 70–73 and 75 are superseded. Ignore them if they're in the folder.

**Before you start:** parts 16 (phases), 17 (nav) and 19 (workstream page) must already be in the code. If `Workstream.phases` or `WorkstreamChrome.tsx` is missing, stop and say so.

This prompt is closed. It changes the customer side only:

- `components/concept/hrefs.ts`
- `ConceptChrome.tsx`
- `dashboard.tsx`
- `BatchView.tsx` (pilot dashboard variant only)
- `ProjectView.tsx`
- `ProjectsTable.tsx`
- `WorkstreamChrome.tsx`
- new `Buildings.tsx` and `BuildingView.tsx`
- `lib/concept/derive.ts`
- the routes listed below

Service pages and ops pages stay as they are. `data.ts` changes only for the start source in section 4b. The batch page is part 20b.

---

## Why

Customers think in buildings. Pal and Rich both asked for an easy way to find an address and see everything about it. More than 99% of projects are one building with one solution, so the building page and the project page become **one page**, titled with the address. Batches stop being a tab: they're a column on Buildings and a list at the end of Overview.

Copy is labels and short facts only. Don't name CQuel staff.

## 1. Nav and routes

### Nav (`CUSTOMER_NAV`)

| Position | Label | Route | Active when |
|---|---|---|---|
| 1 | **Overview** (was Portfolio) | `/concept` | path is `/concept` |
| 2 | **Buildings** (new, replaces Batches) | `/concept/buildings` | path starts with `/concept/buildings` |
| separator, SERVICES label, the five services | unchanged | | |

- Remove the Batches item. `OPS_NAV` is unchanged.
- **The active tab follows the first breadcrumb item**, not the URL. A building page opened from Delivery has Delivery active (see section 6). A workstream or batch page opened from Overview has Overview active.

### Routes

| Route | Screen |
|---|---|
| `/concept/buildings` | Buildings list (section 3) |
| `/concept/buildings/[buildingId]` | Building page (section 4). Optional `?project=<workstreamId>` picks the project when a building has more than one. |
| `/concept/batches` | Redirect to `/concept/buildings` |
| `/concept/projects/[workstreamId]/[buildingId]` | Redirect to `/concept/buildings/[buildingId]?project=<workstreamId>`, keeping `from` |
| `/concept/batches/[id]` | Stays. Reached from the Batches list on Overview and from breadcrumbs |

### `hrefs`

- Rename `portfolio` to `overview`. Keep `portfolio` as an alias so nothing breaks.
- Add `buildings` and `building(buildingId, opts?: { project?: string; from?: 'buildings' | 'workstream' | 'search'; ws?: string; via?: 'batch' | 'service' })`.
- `project()` now returns `building(buildingId, { project: workstreamId })`.

## 2. Overview (`/concept`)

### Mature account (`MatureDashboard`), see `74-overview-search.png`

Top to bottom, 16px apart:

1. **Title:** "Welcome back, <user>", unchanged.
2. **Find a building:** a white `Card` with no header, padding 20/24.
   - The label "Find a building" in `h8 text-text-title`, 8px above the field.
   - The field is **56px tall**, full width, border `black-4`, radius 10, with a 22px search icon at 16px from the left.
   - The placeholder is "Address, city or batch", and a small "/" key hint sits on the right.
   - Under the field: "<n> buildings across <batch names joined with ' and '>" in `p7 text-text-tertiary`.
   - Pressing `/` anywhere on Overview focuses the field.
   - **Results dropdown** while typing (2+ characters): white, `border-dark`, radius 12, `elevation-floating`.
     - Two groups, BUILDINGS and BATCHES (`s3` labels).
     - A building row shows the address in `h8`, plus "<city> · <batch> · <solution or n projects>". It links to the building page with `from=search`.
     - A batch row links to the batch page.
     - Empty group: "No buildings match “<q>”".
     - Match on building name, address, city and batch name, case-insensitive, accents ignored.
   - **Show this card only when the account has 10 or more buildings** in customer batches.
3. **Services:** unchanged, except the footer link now reads **"See buildings"** and goes to `/concept/buildings`.
4. **Momentum** and **Recent activity:** side by side, unchanged.
5. **Batches** (new, at the end):
   - A flush `Card` titled "Batches", with the count on the right.
   - Columns: BATCH (name in `h8 text-text-title` with the goal under it in `p7 text-text-tertiary`), BUILDINGS (tabular), SOLUTIONS (the batch's solution labels joined with ", ", e.g. "EV charging, Solar PV"), BY (target), then a chevron. **No projects column:** a building is usually one project, so the count would repeat Buildings. Project counts stay in the Services bar above.
   - Each row links to `/concept/batches/[id]`.
   - **Show this card only when there are 2 or more customer batches.**

### Pilot account (`BatchView` dashboard variant), see `80-pilot-overview.png`

Keep everything as it is. Make only these changes:

- **Solutions card:**
  - The header right slot reads "<projects> projects · <buildings> cinemas". Use the account's building noun if one exists; otherwise "buildings".
  - Each site name in the list is a link to its building page (`from=buildings`), styled as a quiet underline (`text-text-primary`, underline `border-dark`, offset 3px).
  - "8 sites" under the solution becomes "8 cinemas". Use the same building noun.
  - The solution names are sentence case ("EV charging").
- **No** Find a building card and **no** Batches card. The visibility rules above already hide them, so check that they do.

## 3. Buildings list (`/concept/buildings`), see `76-buildings.png`

### Header

- Title "Buildings".
- Top right: the ChangedDot key, "Changed in the last 7 days".

### Filters

`FilterBar` with Search ("Address or city"), Batch ("All batches"), Service ("All services") and Solution ("All solutions"). **There's no Your action filter on this page.**

### Table

A flush `Card` titled "All buildings", with "<n> · <b> batches" on the right.

| Column | Content |
|---|---|
| BUILDING | Name in `h8 text-text-title`, city under it in `p7 text-text-tertiary`. The ChangedDot sits in the 32px left padding. |
| BATCH | Batch name, `p6 text-text-secondary` |
| SOLUTION | The solution label. With 2+ projects: the labels joined with ", " and "<n> projects" under them. |
| SERVICE | The current service label, with "since <date>" under it (the current phase's `startedOn`). Completed: "Completed" with the date. With 2+ projects: the labels joined with ", ", and no date. |
| (chevron) | The whole row is a link to the building page, `from=buildings` |

- **No** supplier line, **no** Your action pill, **no** project counts for one-project buildings.
- **Rows:** show 10, then a footer with "Showing 10 of <n>" and a secondary button "Show all <n>".

### Sort

1. Buildings with the dot first, newest change first.
2. Then by batch, **newest batch first**: the reverse of `account.batches` order.
3. Within a batch, A–Z by name.

### Changed dot

Add `buildingLastChangedOn(a, buildingId)` and `buildingChanged(a, buildingId)` to `derive.ts`.

- Use **only this building's own events**:
  - its `projectHistory` items;
  - its delivery phase dates whose state is `confirmed` or `from_invoice`;
  - a visit `on` date.
- Events across the whole workstream don't count.
- Within 7 days of `TODAY` means it changed. With the current data, Kervelstraat 14 (installing started 14 Oct) is the one dot.

## 4. Building page (`/concept/buildings/[buildingId]`), see `77-building-page.png`

Rebuild `ProjectView` as `BuildingView`. A building has one or more projects, one per workstream it's in (`activeProjects`). The selected project is `?project=`, or else the most advanced one (the furthest service, completed last).

### Building card (top)

The page opens with the building, then its projects. Customers should land on something that looks like their building.

- **Card:** a white `Card` with no header, padding 20, and a flex row with a 28px gap.
- **Photo (left):** 300×190, radius 10.
  - Use the building's most recent **site photo** from the files we hold: customer uploads tagged as site photos, or photos from a site visit.
  - Caption it in a small white label at the bottom left: "Site photo · <date>".
  - **No photo yet:** a `bg-container-grey` box with the 24px `building` icon and "No photo yet" in `p7 text-text-tertiary`.
  - Don't fetch street-view or map images.
- **Right:**
  - The building name (the street address) in `h4`.
  - Under it: "<city> · <batch>" in `p6 text-text-secondary`. When the building record has a `postcode`, show it before the city.
  - Below, 20px down: a 3-column grid of **What we know** facts. Each fact is a label (`p7 text-text-tertiary`), a value (`p6 text-text-primary`) and a source (`p7 text-text-tertiary`). The facts are the rows from section 4's What we know, and they move here.
  - Show at most 6 facts. With none: one line, "Nothing on file yet".
- **Nothing else in the header:** no See info, View batch, pill or details grid. Keep the breadcrumb above the card (section 6).

### Two or more projects only

- A row of project cards above the Route card, using `ServiceCards` styling: the solution as the name, and the current service as the line.
- The selected card has the light accent (`bg-accent`, `border-accent`).
- Clicking a card sets `?project=`.
- One-project buildings show no cards.

### Project card (route)

- **Title:** the project's solution label ("EV charging").
- **Right slot:** "Workstream: <workstream name>" in `p7 text-text-secondary`, then a secondary button (32px) **"Go to workstream ›"** linking to the workstream with `from=building`.
- **The button is the only way to the workstream from this page.** Estimates, tender results and actions live there.
- **Body:** the existing `ProjectRoute` grid of the five services, but **state only**:
  - Done: a `black-4` bar, the label in `text-text-primary`, the line "Done".
  - Now: a `black-7` bar, the label in `h8`, the line "Now" in `h8`.
  - Not needed: a dashed bar, the label and line in `text-text-tertiary`.
  - Planned: a `black-2` bar, the line "Planned".
- **No dates, outcomes, values or links** in the route.

### Current service card

One card for the selected project's current service. It replaces Price / Tender / Scope / Estimate on the old page.

- **Delivery:** title "Delivery at this building", right slot "<supplier> · contract €<value>k".
  - Five stages, **Start** → Design & survey → Installation → Commissioning → Handover, from `row.delivery.phases` (`start`, `phase1`–`phase4`). "Kick-off" becomes "Start" (section 4b).
  - Each stage shows a check (done), a numbered circle (the current one has a dark ring), or an outline circle (next).
  - Under each: the label, the date (estimates as "Est. 4 Nov"), and **where the date comes from**. "Confirmed" is gone. The source line is one of:
    - for Start, the start source (section 4b);
    - "Site check report" for a phase dated from a done visit;
    - "From invoice · date to confirm";
    - "Estimate".
  - No buttons.
- **Tender, Pricing, Scope definition, Indicative pricing:** keep the existing card for that service from `ProjectView`, restyled with the same header. Remove any action buttons. Pending things show as text ("Waiting for your decision").

### Bottom, two columns

- **History** (left): every `projectHistory` item for all projects on this building, newest first, as a timeline.
  - A 56px date column on the right, an 8px dot (the latest `black-7`, the rest `black-4`) with a 1px line, the event in `h8`, and the detail in `p7 text-text-secondary`.
  - With 2+ projects, the detail starts with the solution ("EV charging · …").
  - Drop full stops.
- **What we know:** moved into the building card at the top. Use these rules for which facts it shows:
  - Rows from `basedOn` across this building's projects where the value isn't "—", de-duplicated by label, with the source on the right.
  - Add a done visit's recorded outcome as a row ("Car park · Can take 4 chargers · Site check · 20 Aug").
  - Empty: one line, "Nothing on file yet" in `text-text-tertiary`.
- **Documents** (right): the documents of this building's workstreams, minus any that name a different building, plus "Files you sent". Keep the existing Download / View quiet links and "See all".

### 4b. Start date and its source

"Kick-off" isn't a fact anyone records. Rename the first delivery stage to **Start** everywhere on the customer side: `DELIVERY_PHASES` labels, the workstream Delivery steps, the building page, and history events. Give its date a source.

- **Model:** add `source?: StartSource` to the `start` delivery phase, where `type StartSource = 'contract_start' | 'contract_signed' | 'loi_signed' | 'first_invoice'`.
- **Which date to use:** when several are known, the strongest wins, in this order:
  1. contract start date (fixed start written in the contract, e.g. JCT);
  2. contract signed;
  3. LOI signed;
  4. first invoice.
- **Source line under the date:**

  | Source | Line |
  |---|---|
  | `contract_start` | "Contract start date" |
  | `contract_signed` | "Contract signed" |
  | `loi_signed` | "LOI signed" |
  | `first_invoice` | "From invoice · date to confirm" |
  | missing | "Estimate" if the state is `estimate`, otherwise leave the line out |

- **Data (`data.ts`):** set `source: 'contract_start'` on the `start` phase of every `ev-voltreny` project, which keeps its 12 Aug date. That's the only data change in this prompt.
- **History:** the "Kick-off" event on the building page becomes two events. "12 Aug · Start · Contract start date", and "6 Aug · Contract signed · Voltreny · €26k" (from the signed contract document). Drop "Voltreny planned the work".
- **Ops:** the ops delivery form gets a "Start date from" select with the four options next to the start date. If the form isn't in this prompt's files, list it as a follow-up and leave it.

## 5. Workstream page, see `78-workstream.png`

- **Projects → Buildings:** the Overview table is now titled "Buildings", with "<n> · <k> dates to confirm" on the right (or the service's existing aside).
  - The first column is the building name with its city under it, and the ChangedDot from `buildingChanged`.
  - Rows link to the building page with `from=workstream&ws=<id>`, keeping the workstream's own `from` as `via`.
- **Steps:** the lines under the steps say "<n> buildings" ("1 building") instead of projects, and the right slot reads "Buildings at each step".
- **Header:** remove See info and the `InfoDrawer` from the customer header. The meta line already holds those facts. Keep the components for ops.
- **Breadcrumb:** see section 6. "Batches ›" goes away.

## 5b. Batch page

The batch page is covered by its own prompt, part 20b (`cursor-prompt-batch-buildings.md`). Here, only make the batch page breadcrumb "Overview › <batch>" (section 6).

## 6. Breadcrumbs

The breadcrumb follows the path the person came by. It shows **at most three items**; when the path is longer, drop the first. The active nav tab is the tab the first item belongs to.

| Path | Building page breadcrumb | Active tab |
|---|---|---|
| Buildings → building | Buildings › Kervelstraat 14 | Buildings |
| Overview search → building | Buildings › Kervelstraat 14 | Buildings |
| Service → workstream → building | Delivery › EV charging · Voltreny › Kervelstraat 14 | Delivery |
| Overview → batch → workstream → building | Flagship sites › EV charging · Voltreny › Kervelstraat 14 | Overview |
| Batch → building | Flagship sites › Kervelstraat 14 | Overview |
| Pilot Overview → building | Buildings › Bluewater (Dartford) | Buildings |
| Direct link | Buildings › Kervelstraat 14 | Buildings |

| Path | Workstream page breadcrumb | Active tab |
|---|---|---|
| Service → workstream | Delivery › EV charging · Voltreny | Delivery |
| Overview → batch → workstream | Flagship sites › EV charging · Voltreny | Overview |
| Building → workstream (`from=building`) | Kervelstraat 14 › EV charging · Voltreny | Buildings |
| Direct link | Flagship sites › EV charging · Voltreny | Overview |

- **Batch page breadcrumb:** Overview › Flagship sites, with Overview active.
- Every item except the last is a link. The batch name links to `/concept/batches/[id]`.

## Expected values (Halvering, TODAY 19 Oct)

- **Nav:** Overview · Buildings | SERVICES · five services.
- **Overview:**
  - Find a building shows "36 buildings across Flagship sites and Offices DE, FR and BE".
  - Typing "Kerv" shows Kervelstraat 14 under BUILDINGS and "No batches match “Kerv”".
  - The Batches card has 2 rows (Flagship sites · 12 · Dec 2027 and Offices DE, FR and BE · 24 · Jun 2028), with a Solutions column and no Projects column.
- **Buildings:**
  - 36 rows. Kervelstraat 14 has the dot and sits first.
  - Then the Offices DE, FR and BE buildings A–Z, then Flagship sites A–Z.
  - Buildings with several projects show the joined solutions and services. In the current sample data most do; that's expected until the data is trimmed.
- **`/concept/buildings/f3?project=ev-voltreny`:**
  - The building card shows a site photo (or the no-photo state), "Kervelstraat 14", "Antwerp · Flagship sites", and three facts: car park, electricity use, roof.
  - The project card is titled "EV charging".
  - Route: Done, Not needed, Done, Not needed, Now, with "Flagship sites · EV charging · Voltreny" and Go to workstream.
  - Delivery at this building: Start 12 Aug Contract start date · Design & survey 20 Aug Site check report · Installation 14 Oct From invoice · date to confirm · Commissioning Est. 4 Nov · Handover Est. 18 Nov.
  - The workstream Delivery steps read Start · Design & survey · Installation · Commissioning · Handover · Complete.
  - History starts with "14 Oct · Installing started".
- **Pilot (Showcase):**
  - No Find a building card and no Batches card.
  - The Solutions header reads "13 projects · 8 cinemas".
  - "Bluewater (Dartford)" links to its building page.

## Done when

- **Screens:** `/concept`, `/concept/buildings` and `/concept/buildings/[id]` match 74, 76 and 77; the pilot `/concept` matches 80; the workstream Overview matches 78.
- **Nav:** there's no Batches tab. `/concept/batches` and `/concept/projects/*` redirect.
- **Building page:**
  - Nothing in the Route but state.
  - Go to workstream is the only link out.
  - There's no See info, View batch or pill.
- **Buildings list:** has no Your action filter or pill, and no supplier line.
- **Dot:** Kervelstraat 14 is the only building with it.
- **Breadcrumbs and active tab:** they match the tables in section 6 for every path listed.
- **Visibility:** search shows only with 10+ buildings, and the Batches card only with 2+ batches.
- **Unchanged:** `grep -rn "Tamsin\|Lead " components/concept/BuildingView.tsx` returns nothing. Service pages and ops pages are unchanged, and `data.ts` changes only for the start source. `grep -rn "Kick-off" components app` finds nothing on the customer side.
- **Build:** `npm run build` passes.
- **Report:** write this checklist into your final message, with pass or fail for each item.
