# Cursor prompt, part 17: navigation and the Batches page

Paste everything below the line into Cursor, in the `new_concept` repo. Attach `docs/concept/wireframes/61-batches.png` to the chat.

**Before you start:** part 16 (workstreams with phases) must already be in the code. Check that `Workstream.phases` exists in `lib/concept/model.ts`. If it doesn't, stop and say so.

This prompt is closed. It changes:

- the customer navigation (`hrefs.ts`, `ConceptChrome.tsx`)
- the new Batches page (`app/concept/batches/page.tsx`)
- the redirect from the old Workstreams list
- the workstream breadcrumb

The batch page, the service pages and the dashboards stay as they are. Part 18 covers the batch page and the service pages.

---

## Why

Rich, 28 Oct: "This is structure. This is services." The two shouldn't blend in one nav.

- **Batches replace Workstreams at the top.** Workstreams live inside batches.
- **The nav stays one bar.** Individual batches never go into it, so it works with 2 batches or 34.
- **The Batches page is a compact list** that scales to many batches.

## 1. Navigation

**Items (`CUSTOMER_NAV` in `hrefs.ts`), in this order:**

| Item | Link | Active when |
|---|---|---|
| Portfolio | `hrefs.portfolio` | the path is exactly `/concept` |
| **Batches** | `hrefs.batches` | the path starts with `/concept/batches` or `/concept/workstreams`. Workstream pages live inside batches. |
| The five services | as now | as now |

- **Remove** the Workstreams item.
- **Add** `group: 'structure' | 'services'` to `NavItem`. Portfolio and Batches are `structure`; the services are `services`.

**Rendering (`Nav` in `ConceptChrome.tsx`):**

- **Between the groups:** a 1px × 20px `border-dark` divider, then the label **"Services"** in `s3 text-text-tertiary` (12px caps), 32px gaps. The service tabs follow.
- **Tab style:** unchanged, including the active underline.
- **Changed dot:** a service tab gets a 6px `brand-6` dot, 6px after its label, when any live workstream whose current service is that one has `changedRecently(w)`. Give it `aria-label="Changed in the last 7 days"`. Compute it in `AppHeader` from `account` and pass it as `changed` on each item.
  - **Expected for Halvering:** dots on Estimates, Tender, Pricing and Delivery; none on Planning.
- **Ops view:** the nav is unchanged. Only the customer nav changes.

## 2. Batches page (`/concept/batches`)

Replace the redirect with a page. Put the content in a new `components/concept/BatchesIndex.tsx`, inside the usual `Page`.

**Header:**
- `PageHeader` with the title "Batches".
- On the right, in `p7 text-text-secondary`: "<n> batches · <buildings> buildings · <live projects> projects in progress".
- Count only customer batches (`customerBatches`).

**Filters (40px, labelled, as in part 11):**
- **Search:** "Batch name". It matches the batch name or goal.
- **Service:** "All services". Shows batches with live projects in that service.
- **Solution:** "All solutions". Shows batches with a workstream of that solution.
- **"Your action only":** a checkbox. Shows batches with at least one live `you` workstream.
- Keep the filters in URL params, as on the other pages.

**Table:** one card. The columns are a CSS grid: `minmax(0,1.6fr) 80px 80px minmax(0,1.5fr) 120px 90px 16px`, `column-gap: 24px`.

- **Header row:** `bg-black-1`, `px-6 py-2.5`, `h9 text-text-title`. The headings are Batch / Buildings / Projects / Where projects are / Your action / Target, then an empty one.
  - Under "Where projects are", add a legend: six 8px squares with labels in 11px `text-text-tertiary`: Indicative, Scope, Tender, Pricing, Delivery, Completed.
- **Each row** is a `Link` to `hrefs.batch(b.id)`, `px-6 py-3.5`, with `border-t border-border-light` and `hover:bg-black-1`:
  1. **Batch:** the name in `h8 text-text-title`, with the goal under it in `p7 text-text-tertiary`, truncated to one line.
  2. **Buildings:** `b.buildingIds.length`, in `p6 tabular-nums`.
  3. **Projects:** live projects in the batch, in `p6 tabular-nums`.
  4. **Where projects are:** see the bar spec below.
  5. **Your action:** the live `you` workstreams in the batch, in `h8 text-text-primary`, or "—" in `text-text-tertiary`. No dot and no pill.
  6. **Target:** `b.target` in `p6 text-text-secondary`, or "—".
  7. **Chevron:** `ChevronRight`, 16px, `text-text-tertiary`.

**The bar in "Where projects are":**
- An 8px bar, fully rounded, with 2px gaps between segments.
- One segment per service, plus Completed, each with `flex: <projects>`. Skip any that are 0.
- Each segment is filled with the dashboard `SHADES` scale: `color-mix(in srgb, var(--cq-text) <shade>%, white)`, from 16% for Indicative up to 100% for Completed. No orange.
- **Hover or focus** shows a popover: the batch name in `h8`, then one row per service and Completed, each with a swatch, the label and the count right-aligned (`p7`). See `61-batches.png`.

**Order and empty state:**
- Rows sort by Your action (highest first), then by name.
- With filters and no matches, show "No batches match" and a "Clear filters" link.

## 3. The old Workstreams list

- `/concept/workstreams` (the list page only) redirects to `/concept/batches`. Keep `/concept/workstreams/[id]` as it is.
- Every link that pointed at `hrefs.workstreams()` (the dashboard "See workstreams" and similar) now points at `hrefs.batches`. If a link carried `?responsibility=you`, point it at `hrefs.batches + '?you=1'`.
- If part 15 (the Workstreams list) hasn't been applied, don't apply it. It's replaced by this page.

## 4. Workstream page breadcrumb

On `/concept/workstreams/[id]`, the breadcrumb becomes **Batches › <batch name> › <workstream name>**:
- "Batches" links to `hrefs.batches`.
- The batch name links to `hrefs.batch(w.batchId)`.

Nothing else on that page changes in this task.

## Expected values (Halvering)

**Header:** "2 batches · 36 buildings · 137 projects in progress".

| Batch | Buildings | Projects | Bar (Indicative / Scope / Tender / Pricing / Delivery / Completed) | Your action | Target |
|---|---|---|---|---|---|
| Offices DE, FR and BE | 24 | 95 | 38 / 11 / 30 / 10 / 6 / 0 | 7 | Jun 2028 |
| Flagship sites | 12 | 42 | 16 / 11 / 5 / 4 / 6 / 3 | 4 | Dec 2027 |

Offices comes first because it has more Your action.

**Filters:** "Your action only" keeps both rows. Service = Delivery keeps both. Solution = LED keeps both.

## Done when

- **Nav:** the customer nav reads Portfolio · Batches | SERVICES · Estimates · Planning · Tender · Pricing · Delivery, with the changed dots as expected.
- **Active tab:** Batches is active on `/concept/batches`, on `/concept/batches/flagship` and on `/concept/workstreams/ev-voltreny`.
- **Batches page:** `/concept/batches` matches `61-batches.png`, and the hover popover shows the per-service counts.
- **Redirect:** `/concept/workstreams` redirects to `/concept/batches`.
- **Grep:** `grep -rn "hrefs.workstreams()" components app` returns nothing.
- **Unchanged:** the ops nav and every page not named here are unchanged.
- **Build:** `npm run build` passes.
- **Report:** write this checklist into your final message, with pass or fail for each item.
