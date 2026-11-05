# Cursor prompt, part 14: the batch page

Paste everything below the line into Cursor, in the `new_concept` repo, and attach `docs/concept/wireframes/59-batch-page.png` and `docs/concept/wireframes/59b-route-popover.png` to the chat.

This prompt is closed: only the batch page changes. That's `/concept/batches/[id]`, rendered by `BatchView` with `variant="page"`. The pilot dashboard (`variant="dashboard"`), the mature dashboard and the Workstreams page stay exactly as they are.

---

## Why

The batch page is orientation. It shows which workstreams are in the batch and where each one sits among the services. Rich's words: "I wouldn't break down the work stream to the work stream level here"; signpost where it sits, with "just a sentence to the right… currently in installation". Responsibility and next steps are noise at this level, so they move into the workstream page.

Keep the structure as it is: **Route**, **Workstreams in this batch**, **Recent activity**. Make each card lighter:

- **Route:** captions count projects, and the popover is calmer (no pills).
- **Workstream rows:** one line each: name and projects, the service tag, and one short note on where it is. The step trackers, the building lists, the pills and the changed dots all go.

Copy is labels and short facts only. Don't name CQuel staff.

## 1. Page header (`app/concept/batches/[id]/page.tsx`)

- Replace `ChapterAside` with a plain `p7 text-text-secondary` line, right-aligned, showing `batchSummary(account, b).line`. There's no `ChangedKey` on this page.
- The line must read `goal · <n> buildings · <live projects> projects · by <target>`. For example: "Cut energy use at the 12 flagship sites · 12 buildings · 42 projects · by Dec 2027".
  - Part 13 already makes this change in `batchSummary`. If it isn't there yet, add it.
  - Live projects means the distinct `buildingId:solution` pairs over `activeProjects(w)` of workstreams with `!w.proposed && owner !== 'done'`.

## 2. Route (`routeStages` in `derive.ts`, `Caption` in `RouteWithNeeds.tsx`)

**Card header:** keep the card and its title. Its right slot (`routeAside` for `variant === 'page'`) becomes "<live projects> projects in progress" ("42 projects in progress"). Remove the "Your action: 4 · Suppliers' action: 3" text.

**`routeStages`:** for a stage in state `'now'`, change the data:
- **`caption`:** "<n> projects", counting live projects in that service in this batch.
- **`sub` (new, optional on `RouteStage`):** "<n> workstream(s) done" when the service has done workstreams, using `noun`.
- **Unchanged:** the `'done'` state ("Done 28 Aug"), `'next'`, `'planned'`, `'skip'` and Getting started.

**Rendering (non-pilot only):**
- Under the caption, show `sub` in `p7 text-text-tertiary`.
- The chevron trigger now sits on the caption whenever the stage is `'now'` or `'done'` and has workstreams. The rule is no longer "caption includes 'workstream'".
- Keep the chevron-down icon at 12px.
- The pilot path (`pilot` prop) is unchanged.

**Popover:** rework `PopoverContent` to match `59b-route-popover.png`.

- **Box:**
  - `w-[300px]`
  - `border-border-dark`
  - `rounded-lg`
  - `p-0`
  - shadow `0 8px 24px rgba(30,40,50,.12)`
  - inner padding `px-4 py-3`
- **Contents, top to bottom:**
  1. The service label in `h8 text-text-primary`, then `SERVICE_LABEL[id]` in `p7 text-text-secondary`.
  2. A `border-light` line, then the live workstreams. Each row is a `Link` to the workstream (`flex justify-between gap-3 py-1.5 p7`): the name in `text-text-primary` on the left, "<n> projects" in `text-text-primary tabular-nums` on the right.
  3. Only if there are done workstreams: another `border-light` line, then the done ones. Each row shows the name in `text-text-tertiary` and, on the right, a 14px `Check` in `text-text-tertiary` plus "Done <short date>". Use the same `Link`.
  4. Only when some live workstream has `owner === 'you'`: 8px gap, a 6px `brand-6` dot, then "Your action: <n> workstreams" in `p7 text-text-primary`. Use `OWNER_LABEL.you` and `noun`.
  5. 10px gap, then the quiet underlined link "View <service label>" to `hrefs.service(id)`.
- **Remove:** `StatusPill` from the popover. There are no tinted pills in it.

## 3. Workstreams in this batch (`BatchView.tsx`, `variant="page"` only)

**Card header:** keep the card, its title and its right slot (`workstreamBlockMeta`, "7 in progress · 4 done").

**Order:** sort the live workstreams by service in `SERVICES` order, then by `byRecentChange` within a service. The list reads like the route.

**Row (replaces `WorkstreamRow` on this variant):** each row is a `Link` to `hrefs.workstream(w.id)`.
- **Layout:** `grid items-center gap-x-6 px-6 py-3.5`, with `grid-template-columns: minmax(0,1.2fr) 170px minmax(0,1.4fr) 16px`. Rows after the first get `border-t border-border-light`. On hover, the background is `bg-black-1`.
- **Column 1:** the name in `h8 text-text-title`, then "<n> projects" (active projects) in `p7 text-text-tertiary`.
- **Column 2:** the existing `ServiceTag` for `w.service`.
- **Column 3:** the step note in `p6 text-text-secondary`, from a new `stepNote(w)` in `derive.ts`:
  - Count `activeProjects(w)` by `p.step`, using `service(w.service).steps` for the labels.
  - If every project is at one step, return that label as it is ("Info requested", "Invited", "Data collected").
  - Otherwise return `"<n> <label lowercased>"` for each step that has projects, in step order, joined with " · ". For example "3 kick-off · 1 installation · 2 complete", or "3 estimate · 3 presented · 2 decision".
  - When the batch hasn't started (`notStarted`), return "Not started".
- **Column 4:** a 16px `ChevronRight` in `text-text-tertiary`.

**Remove from this variant:**
- `WorkstreamSteps`
- the "Projects" label and building names with "+N"
- `exclusion` and `gives`
- `StatusPill`
- `ChangedMark`

Leave `WorkstreamRow` and `WorkstreamSteps` in the code if anything else uses them; check with grep.

**Done workstreams**
- **Fold row:** keep it, collapsed by default. It's `flex justify-between px-6 py-3 border-t border-border-light bg-black-1`. On the left, "Done · <n>" in `h9 text-text-secondary`; on the right, the quiet link "Show"/"Hide".
- **Remove** the long `doneFold` sentence from the fold row on this variant. `WorkstreamsByBatch` still uses `doneFold`, so leave the function.
- **Expanded rows:** the same grid and link.
  - **Column 1:** the name in `p6 text-text-tertiary`, then " · <n> projects" in `p7 text-text-tertiary`, on one line.
  - **Column 2:** `ServiceTag` with a new `muted` prop, which makes its text `text-text-tertiary`.
  - **Column 3:** a 14px `Check` in `text-text-tertiary`, then "Done <short(completedOn)>" in `p6 text-text-tertiary`.
  - **Column 4:** the chevron.
  - **Order:** newest first.

## 4. Recent activity

Keep the card as it is, and use the same row style as the dashboards:
- **Rows:** `flex justify-between gap-4 py-3`, with `border-t border-border-light` between rows. Body padding is `px-6 py-1`.
- **Left:** the title in `h8 text-text-title`, then the text in `p7 text-text-secondary`.
- **Right:** the date in `p7 text-text-tertiary`.

If part 13 hasn't shortened the activity text in `data.ts` yet, drop the full stops and use " · " instead of dashes and colons.

## Expected values (`/concept/batches/flagship`)

**Route**

| Stage | Caption | Sub-line |
|---|---|---|
| Getting started | Agreed 20 May | |
| Estimates | 16 projects | 2 workstreams done |
| Planning | 11 projects | |
| Tender | 5 projects | 1 workstream done |
| Pricing | 4 projects | |
| Delivery | 6 projects | 1 workstream done |

Right slot: "42 projects in progress".

**Estimates popover:**
- Live: LED · 8 projects, Heat pumps · Flagship · 8 projects.
- Done: Solar PV · Done 28 Aug, EV charging · Done 30 May.
- "Your action: 2 workstreams".
- "View Estimates".

**Workstream rows**

| Workstream | Projects | Service | Note |
|---|---|---|---|
| LED | 8 | Estimates | 3 estimate · 3 presented · 2 decision |
| Heat pumps · Flagship | 8 | Estimates | Data collected |
| Solar PV · Missing roof data | 7 | Planning | Info requested |
| EV charging · DE flagships | 4 | Planning | Info requested |
| Solar PV DE | 5 | Tender | Invited |
| Heat pumps · Kelderby | 4 | Pricing | Price requested |
| EV charging · Voltreny | 6 | Delivery | 3 kick-off · 1 installation · 2 complete |

Within a service, the order follows `byRecentChange`, so the two rows in the same service may swap.

**Done · 4** (expanded, newest first):

| Workstream | Projects | Service | Done |
|---|---|---|---|
| LED · Lumora | 3 | Delivery | 30 Sep |
| Solar PV | 12 | Estimates | 28 Aug |
| EV charging | 6 | Tender | 5 Aug |
| EV charging | 6 | Estimates | 30 May |

## Done when

- **Matches the wireframes:** `/concept/batches/flagship` matches `59-batch-page.png`. The open Estimates popover matches `59b-route-popover.png`. In the full-page image the done rows are expanded; by default they're collapsed.
- **Values:** every value in the expected tables above is right.
- **Batch page clean-up:** the batch page has none of these:
  - step trackers
  - Your action, Suppliers' action or Done pills
  - changed dots
  - the "Changed in the last 7 days" key
  - "+N" building lists
- **Orange:** the only orange is the dot in the route popover's Your action line.
- **Pilot unchanged:** `/concept/batches/pilot` still renders: route captions "Next" and "Planned", rows with the note "Not started". The pilot dashboard (`/concept` as Showcase) is unchanged.
- **Build:** `grep -n "WorkstreamSteps\|StatusPill\|ChangedMark" components/concept/BatchView.tsx` shows no use in the `variant="page"` path, and `npm run build` passes.
- **Report:** write this checklist into your final message, with pass or fail for each item.
