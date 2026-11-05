# Cursor prompt, part 15: the Workstreams list

Paste everything below the line into Cursor, in the `new_concept` repo, and attach `docs/concept/wireframes/60-workstreams-list.png` to the chat.

This prompt is closed. It changes:

- the Workstreams page (`/concept/workstreams`, `WorkstreamsByBatch.tsx`)
- the shared `SummaryCards` component in `ui.tsx`
- the Responsibility filter on the service pages (`ServiceSection.tsx`), so the cards and the filter match there

The service page tables, the dashboards, the batch page and the single workstream page stay as they are.

---

## Why

The Workstreams list is a listing view, so it leans to orientation: which workstreams there are, which service each is in, and where it is.

Responsibility keeps only the customer's own side:

- **Your action, or nothing.** "CQuel's action" and "Suppliers' action" leave this page; that detail lives on the workstream page.
- **No hand-maintained "Next" lines or "waiting N days".** Ops can't keep those true.
- **No progress bars** (mostly "0 of n done"), **no Supplier column** (the supplier is already in the name), and **no changed dots**.

Copy is labels and short facts only.

## 1. Summary cards (`SummaryCards` in `ui.tsx`)

Three cards instead of four, in `grid grid-cols-1 sm:grid-cols-3 gap-4`:

| Card | Label | Number | Line | Behaviour |
|---|---|---|---|---|
| 1 | Workstreams | total | `across <n> batch(es)` | not clickable |
| 2 | Your action (6px `brand-6` dot before the label) | `owner === 'you'` | `of <in progress> in progress`, where in progress = `owner !== 'done'` | toggles `responsibility=you`, as now |
| 3 | Done | `owner === 'done'` | `<n>% of workstreams` | not clickable |

- **Remove** the "CQuel's or suppliers' action" card and `BOTH_ACTIONS`. Remove `BOTH_ACTIONS` from `matchesResponsibility` too.
- **Card styling:** keep the current card styling and the pressed state.

Expected: 25 / across 2 batches · 11 / of 19 in progress · 6 / 24% of workstreams.

## 2. Filter bar (`WorkstreamsByBatch.tsx` and `ServiceSection.tsx`)

- **Responsibility select:** replace it with a checkbox, **"Your action only"**. It's the last item in the grid (an `auto` column), aligned to the bottom of the 40px controls.
  - **Box:** 16px, radius 4, 1.5px border in `black-6`. When checked, it fills `black-7` with a white tick. No orange.
  - **Label:** the text in `p6 text-text-primary`, wrapped in a `<label>`.
  - **Sync:** it reads and writes the same `responsibility` URL param (`you` or empty). The Your action card and the checkbox stay in sync.
  - **Old URLs:** treat any other value in an old URL (`cquel`, `suppliers`, `done`, both) as empty.
- **Clear filters:** still appears after the checkbox when anything is set.
- **Grid:** `grid-template-columns: 1.5fr repeat(<selects>, minmax(0,1fr)) auto auto`. The last two columns are the checkbox and Clear filters.
- **ChangedKey:** remove it from the page header actions on `/concept/workstreams`.

## 3. Batch blocks (`WorkstreamsByBatch.tsx`)

**Header:** keep the name and meta line. The meta line uses `batchSummary(account, b).line` (goal · buildings · projects · by date, from part 13 or 14). On the right, `flex items-center gap-5`:

- "Your action: <n>" in `p7 text-text-primary`, with a 6px `brand-6` dot and 6px gap. Show it only when n > 0, where n is live `you` workstreams in this batch after filters.
- "View batch" as the quiet underlined link (`h8`). It's no longer a bordered button.
- Remove the `StatusPill` from the header.

**Table:** replace the current seven columns. Use a CSS grid (or keep `<table>`) with `grid-template-columns: minmax(0,1.3fr) 170px minmax(0,1.5fr) 110px 16px` and `column-gap: 24px`.

- **Header row:** `bg-black-1`, `px-6 py-2`, `h9 text-text-title`. The headings are Workstream / Service / Current step, then two empty headings.
- **Rows:** each row is a `Link` to `hrefs.workstream(w.id)`, `px-6 py-3`, with `border-t border-border-light` and `hover:bg-black-1`.
  1. The name in `h8 text-text-title`, then "<n> projects" (active projects) in `p7 text-text-tertiary`.
  2. `ServiceTag`.
  3. `stepNote(w)` in `p6 text-text-secondary`. If part 14 hasn't added `stepNote` to `derive.ts` yet, add it:
     - Count `activeProjects(w)` by `p.step`, using `service(w.service).steps` for the labels.
     - If they're all at one step, return that label.
     - Otherwise return `"<n> <label lowercased>"` for each step that has projects, in step order, joined with " · ".
  4. Only when `w.owner === 'you'`: a 6px `brand-6` dot, 6px gap, then "Your action" in `p6 text-text-primary`. Otherwise the cell is empty.
  5. A 16px `ChevronRight` in `text-text-tertiary`.
- **Order:** live rows are sorted by service in `SERVICES` order, then by `byRecentChange` within a service.
- **Remove:** the Supplier, Progress (`buildingProgress` bar), Next (`nextParts`) and Responsibility (`StatusPill`) columns, the "View" buttons and `ChangedMark`. Leave the functions in `derive.ts` if other files use them; check with grep.

**Done fold:**
- Keep the fold row, collapsed by default: `flex justify-between px-6 py-3 border-t border-border-light bg-black-1`. On the left, "Done · <n>" in `h9 text-text-secondary`; on the right, the quiet link "Show"/"Hide". Remove the `doneFold` sentence.
- Expanded rows use the same grid and `Link`:
  1. The name in `p6 text-text-tertiary`, then " · <n> projects" in `p7 text-text-tertiary`.
  2. `ServiceTag` with `muted` (part 14 adds this prop; add it if it's missing).
  3. A 14px `Check` in `text-text-tertiary`, then "Done <short(completedOn)>".
  4. Empty.
  5. The chevron.
- Done rows are ordered newest first.

**When "Your action only" is on:**
- Batches with no matching rows disappear.
- The Done fold is hidden.

## 4. Service pages (`ServiceSection.tsx`)

- Only the summary cards (now three) and the filter change (the checkbox replaces the Responsibility select).
- Don't change its table in this task.

## Expected values (`/concept/workstreams`, Halvering, no filters)

**Flagship sites** (Your action: 4)

| Workstream | Projects | Service | Current step | Mark |
|---|---|---|---|---|
| LED | 8 | Estimates | 3 estimate · 3 presented · 2 decision | Your action |
| Heat pumps · Flagship | 8 | Estimates | Data collected | Your action |
| Solar PV · Missing roof data | 7 | Planning | Info requested | Your action |
| EV charging · DE flagships | 4 | Planning | Info requested | Your action |
| Solar PV DE | 5 | Tender | Invited | |
| Heat pumps · Kelderby | 4 | Pricing | Price requested | |
| EV charging · Voltreny | 6 | Delivery | 3 kick-off · 1 installation · 2 complete | |

Then "Done · 4".

**Offices DE, FR and BE** (Your action: 7)

| Workstream | Projects | Service | Current step | Mark |
|---|---|---|---|---|
| Heat pumps | 20 | Estimates | 8 data collected · 12 estimate | |
| Solar PV · Offices DE | 6 | Estimates | Presented | Your action |
| EV charging · Offices | 12 | Estimates | Presented | Your action |
| Solar PV · FR offices | 8 | Planning | Survey done | Your action |
| Heat pumps · BE offices | 3 | Planning | 1 survey booked · 2 survey done | |
| LED · Offices DE | 6 | Tender | Results | Your action |
| LED · Offices FR and BE | 18 | Tender | Brief ready | Your action |
| Solar PV · BE offices | 6 | Tender | Shortlisted | |
| EV charging · Ladewerk | 6 | Pricing | Contracting | Your action |
| EV charging · Chargeo | 4 | Pricing | Decision | Your action |
| EV charging · BE offices | 2 | Delivery | Design & survey | |
| Solar PV FR/BE · Solvarek | 4 | Delivery | 2 kick-off · 1 installation · 1 complete | |

Then "Done · 2".

Within a service, the row order follows `byRecentChange`, so rows in the same service may swap.

## Done when

- **Matches the wireframe:** `/concept/workstreams` matches `60-workstreams-list.png`.
- **Cards:** three cards read 25 / 11 / 6. Clicking Your action, or ticking "Your action only", shows only the 11 rows, with both batches showing no Done fold. Doing it again shows all rows.
- **Wording gone:** the strings "CQuel's action", "Suppliers' action" and "CQuel's or suppliers' action" don't appear on `/concept/workstreams` or the service pages' cards and filters.
- **Columns gone:** no Supplier, Progress, Next or Responsibility columns, no View buttons, no changed dots and no ChangedKey on this page.
- **Orange:** the only orange is the Your action dots (card, batch headers, rows).
- **Expected values:** every row matches the tables above.
- **Grep:** `grep -n "BOTH_ACTIONS\|nextParts\|buildingProgress\|StatusPill\|ChangedMark" components/concept/WorkstreamsByBatch.tsx` returns nothing.
- **Pilot:** the pilot account's Workstreams page still renders.
- **Build:** `npm run build` passes.
- **Report:** write this checklist into your final message, with pass or fail for each item.
