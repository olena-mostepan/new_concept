# Cursor prompt, part 13: the mature dashboard

Paste everything below the line into Cursor, in the `new_concept` repo. Attach `docs/concept/wireframes/58-mature-dashboard.png` and `docs/concept/wireframes/58b-services-hover.png` to the chat.

This prompt is closed. Only the mature dashboard changes: `/concept` for Halvering Estates, rendered by `MatureDashboard` in `components/concept/dashboard.tsx`. The pilot dashboard, the batch page, the Workstreams page and the service pages stay exactly as they are.

---

## Why

The dashboard is for orientation, not action. It should show where the work sits across the services and the batches, using projects to show scale. Action lives deeper, on the Workstreams page.

- The Pipeline and the service overview become one card: **Services**. It's still the segmented bar, now counting projects, and the details appear on hover.
- **Batches** shows projects per service, with no progress bars, "x of y done" or Your action marks.
- **"Who it's waiting on"** and **"Right now"** leave the dashboard. They're action lists, they depend on fields ops would keep up by hand (days waited, next steps), and they repeat the Workstreams page.

Copy on screen is labels and short facts only. Don't add sentences, and don't name CQuel staff.

## Layout

`MatureDashboard` renders, top to bottom, 16px apart (`space-y-4`):

1. **Services**
2. **Batches**
3. **Momentum** (unchanged, moved below Batches)
4. **Recent activity**, full width

Stop rendering `Waiting` and `RightNow` here. Delete the `Waiting`, `waitedDays` and `waitingLabel` functions in `dashboard.tsx` and the `RightNow` import. Leave `RightNow.tsx` and `rightNow()` in `derive.ts` in place.

**Card headers:** all four cards use `Card` with `titleClassName="h7 text-text-primary"` and `headerClassName="px-6 py-3"`. The caps `sectionTitle` is no longer used on this screen.

## Definitions (`lib/concept/derive.ts`)

| Term | Definition |
|---|---|
| Live workstream | `!w.proposed && w.owner !== 'done'`, in a batch from `customerBatches(a)` |
| Project | a distinct `` `${p.buildingId}:${w.solution}` `` over `activeProjects(w)` |
| Completed project | a project in a `delivery` workstream with `owner === 'done'` |

A project is never live in two services at once. Check: the five service totals add up to the live total.

Add `servicePipeline(a)`, which returns:

- **`services`:** for each service in `SERVICES` order:
  - `id` and `label`;
  - `projects`: live projects in that service;
  - `workstreams`: live workstreams in that service;
  - `you`: live workstreams with `owner === 'you'`;
  - `byBatch`: `[{ batchId, name, projects }]`, only batches with projects in that service.
- **`completed`:** `{ projects, solutions }`, where `solutions` holds the `SOLUTIONS` labels of the completed delivery workstreams.
- **Totals:**
  - `total`: all live projects;
  - `batches`: `customerBatches(a).length`;
  - `you`: all live workstreams with `owner === 'you'`.

Replace `pipeline()` with this. It's only used by the dashboard.

**Expected values for Halvering**

| Service | Projects | Workstreams | Your action (workstreams) | Flagship sites | Offices DE, FR and BE |
|---|---|---|---|---|---|
| Estimates | 54 | 5 | 4 | 16 | 38 |
| Planning | 22 | 4 | 3 | 11 | 11 |
| Tender | 35 | 4 | 2 | 5 | 30 |
| Pricing | 14 | 3 | 2 | 4 | 10 |
| Delivery | 12 | 3 | 0 | 6 | 6 |

- Completed: 3 projects, solutions = LED.
- Total: 137 live projects across 2 batches.
- Your action: 11 workstreams.

## 1. Services (replaces Pipeline)

**Header:** title "Services". The right slot shows "137 projects in progress across 2 batches" (`` `${total} projects in progress across ${batches} ${batches === 1 ? 'batch' : 'batches'}` ``).

**Body:** padding `px-6 py-5`. Use the same grid as the current Pipeline, `gridTemplateColumns` = `minmax(7.5rem, <projects>fr)` per segment, with six segments: the five services followed by **Completed**. Skip any segment that has 0 projects. Rows are 8px apart:

- **Row 1, names:** centred, `h8 text-text-primary`, `whitespace-nowrap`. The last name is "Completed".
- **Row 2, bar:**
  - Keep the current 40px segments, the `SHADES` scale and the white-on-dark text rule.
  - Round only the outer ends (`rounded-l-full` on the first segment, `rounded-r-full` on the last).
  - The number inside each segment is **projects**, in `text-sm font-semibold tabular-nums`.
  - Completed takes the last shade (1).
- **Row 3, sub-line:** centred, `p7 text-text-tertiary`. Services show "<n> workstreams" (use `noun`). Completed shows its solutions joined with " · " ("LED").

**Hover and focus**

Each service segment is a `Link` to `hrefs.service(id)` with `aria-label="<label>, <projects> projects"`. On hover or keyboard focus, it gets an inset 2px `black-7` ring (`shadow-[inset_0_0_0_2px_var(--black-7)]`) and opens a popover 8px below the bar, centred on the segment.

**Popover styling:** 280px wide, white, `border-border-dark`, `rounded-lg`, padding 12px 16px, shadow `0 8px 24px rgba(30,40,50,.12)`, `z-10`. Its contents (see `58b-services-hover.png`):

1. **Name:** the service label in `h8 text-text-primary`.
2. **Short label:** `SERVICE_LABEL[id]` in `p7 text-text-secondary`.
3. **Batch rows:** a `border-light` line, 8px gap, then one row per `byBatch` entry. The batch name is in `p7 text-text-secondary`, with "<n> projects" right-aligned in `p7 text-text-primary tabular-nums`.
4. **Your action:** only when `you > 0`, 6px below the batch rows. A 6px `brand-6` dot, then "Your action: <you> workstreams" in `p7 text-text-primary`.
5. **Link:** "View <label>", the quiet underlined link (`h8`), 8px below.

The Completed segment isn't a link and has no popover.

**Behaviour:**
- Use a small local component with `useState` for open (`onMouseEnter`/`onMouseLeave`/`onFocus`/`onBlur`) and keep the popover open while the pointer is over it.
- The card needs `className="overflow-visible"` so the popover isn't clipped.
- Remove the `overflow-x-auto`/`min-w-[720px]` wrapper. The `minmax` columns already keep each segment wide enough.

**Footer:** a `border-t border-border-light` row, `px-6 py-3`, `flex items-center justify-between`.
- **Left:** a 6px `brand-6` dot, 8px gap, then "Your action: 11 workstreams" in `p6 text-text-primary`. Use `OWNER_LABEL.you` for the words and the `noun` helper for the count.
- **Right:** a quiet underlined link "See workstreams" to `hrefs.workstreams()`.
- Hide the footer when `you === 0`.

**Fix in `model.ts`:** `SERVICE_LABEL.pricing` is currently 'No existing supplier'. That's the not-needed text, which already lives in `pricingNotNeeded`. Change it to **'Price from your existing supplier'**. Check that the pilot still shows "No existing supplier" under the not-needed Pricing step, from `pricingNotNeeded`.

## 2. Batches (`components/concept/BatchesCard.tsx`)

- **Header:** title "Batches", no right slot.
- **Rows:** keep the row layout. That's the name (`h7`, link to the batch) and "View batch" on the right, `px-6 py-5`, with `divide-border-light`.
- **Meta line** (`p7 text-text-secondary`, 4px below the name): `goal · <n> buildings · <live projects> projects · by <target>`.
  - "Cut energy use at the 12 flagship sites · 12 buildings · 42 projects · by Dec 2027"
  - "Replace gas heating in the office portfolio · 24 buildings · 95 projects · by Jun 2028"
  - Use `b.buildingIds.length` for buildings. Leave out "by …" when there's no `target`.
  - Update `batchSummary` to produce this. It's only used here, so check with grep first.
- **Cells:** the grid is `grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4`, 16px below the meta. Six columns so the cells line up under the Services segments; the sixth stays empty. Each cell:
  - The service label in `l1 text-text-title`.
  - 6px below, by `kind`:

| Cell kind | Number line | Lines under it (`p7 text-text-tertiary`) |
|---|---|---|
| `live` | "<n> projects" in `h8 text-text-primary tabular-nums` (live projects for that service in that batch) | "<n> workstreams" (live workstreams, use `noun`). Delivery also shows "<n> completed" when the batch has completed projects. |
| `done`: workstreams exist but none are live | "Done" in `p7 text-text-tertiary` | none |
| `planned` | "Planned" in `p7 text-text-tertiary` | none |
| `skip` | "Not required" in `p7 text-text-tertiary` | none, and the label is in `text-text-tertiary` |

- **Remove:** the `Bar` component, the "x of y done" text and the Your action line in cells.
- **`batchCells`:** in `derive.ts`, return `projects`, `workstreams` and `completed` instead of `total`, `done` and `you`. Add the `done` kind.
- **Expected values:**

| Batch | Estimates | Planning | Tender | Pricing | Delivery |
|---|---|---|---|---|---|
| Flagship sites | 16 projects / 2 workstreams | 11 / 2 | 5 / 1 | 4 / 1 | 6 / 1, plus "3 completed" |
| Offices DE, FR and BE | 38 / 3 | 11 / 2 | 30 / 3 | 10 / 2 | 6 / 2 |

## 3. Momentum

No change, except that it now sits below Batches and uses the new header classes.

## 4. Recent activity

- **Width:** full width (no grid).
- **Rows:** show 5. Each row is `flex justify-between gap-4 py-3`, and rows after the first get `border-t border-border-light`. Body padding is `px-6 py-1`.
  - **Left:** the title in `h8 text-text-title`, then the text in `p7 text-text-secondary`.
  - **Right:** right-aligned `p7 text-text-tertiary`, `whitespace-nowrap`. The date, with the batch name on a second line from `item.batchId`. Leave the batch line out when the title already is the batch name.
- **Data (`data.ts`, Halvering activity):** drop trailing full stops and use " · " instead of dashes and colons:
  - "Estimates ready for 3 more buildings"
  - "Rue Belvaux 22 completed"
  - "Kelmsdorfer Straße 41 not proceeding · payback over 12 years"
  - "Halverkamp 19 · roof can take panels"
  - "6 buildings joined"
  - Shorten the rest of the list the same way.
- **Link:** keep "See all" in the header.

## Done when

- `/concept` as Halvering matches `58-mature-dashboard.png`, card by card. The popover in that image is the hover state on Tender.
- **Services bar:** reads 54 / 22 / 35 / 14 / 12 / 3, with "5 / 4 / 4 / 3 / 3 workstreams" and "LED" under it. The header reads "137 projects in progress across 2 batches".
- **Hover:**
  - Hovering or tabbing to Tender shows "Supplier bids from our network", Flagship sites 5 projects, Offices DE, FR and BE 30 projects, "Your action: 2 workstreams" and "View Tender".
  - Delivery's popover has no Your action line.
  - The popover isn't clipped by the card.
- **Orange:** the only orange on the page is the dot in the Services footer and the dots inside popovers.
- **Batches card:** has no bars, no "of … done" and no Your action lines. Its cells match the expected values table.
- **Removed cards:** "Who it's waiting on" and "Right now" are gone from `/concept`. `grep -n "Waiting\|RightNow\|waitedDays" components/concept/dashboard.tsx` returns nothing.
- **Pricing label:** `SERVICE_LABEL.pricing` is 'Price from your existing supplier', and the pilot dashboard still shows "No existing supplier" under Pricing.
- **Unchanged screens:** the pilot dashboard, `/concept/batches/*`, `/concept/workstreams` and the service pages.
- **Build:** `npm run build` passes.
- **Report:** write this checklist into your final message, with pass or fail for each item.
