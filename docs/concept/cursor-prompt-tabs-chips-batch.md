# Cursor prompt, part 25: package tabs, asset search on services, service chips, batch page

Paste everything below the line into Cursor, in the `new_concept` repo. Attach these mocks from `docs/concept/wireframes/`:

- `90-package-tabs-chips.png` (package page and chips)
- `89-service-cards-separate.png` (batch page only: ignore its package-page half)
- `85-route-options.png` ("Asset page · B" only)

**Before you start:** parts 22, 23 and 24 (design review fixes) must be in the code: `lib/concept/words.ts`, the `/concept/assets` and `/concept/packages` routes, `Decisions.tsx`, `FilterChips` and the single `Button` in `ui.tsx`, and no `cq-*` tokens. If any are missing, stop and say so.

Use the design system's tokens and type classes only, as set up in part 24 (`text-primary`, `border-dark`, `bg-container-grey`, `black-1`…`black-7`, `brand-6`, `h4`…`h8`, `p6`, `p7`, `s3`). No pixel sizes.

This prompt is closed. It changes four things:

1. the package page;
2. search on the service pages;
3. the services on the asset page;
4. the batch page.

It also makes one shared `Chip`. Don't change `data.ts`, ops screens, the pilot Overview or the Assets list layout.

---

## Why

- **Package page:** service cards on top plus tabs under them is two navigation levels for one page. One tab row is enough.
- **Service pages:** customers find work by street and city, so search should match assets.
- **Asset page:** its services are a fact about the asset, so they belong in the header.
- **Batch page:** customers come to the batch for its assets. The route was a second, wordy summary.

Copy is labels and short facts. No notes or second lines unless they carry a fact.

## 1. Package page: one tab row

**Remove `ServiceCards`** from `WorkstreamFrame` and from the page.

**Header:**
- The breadcrumb, title and right side are unchanged.
- The meta line is "`<batch>` · `nAssets(n)` · `<current service>` now".
- When the package is completed, it reads "Completed `<date>`".

**Tabs:** one `Tabs` row under the header, with the orange underline on the active tab. The tabs are **Overview**, then the content tabs below, in this order, each **only when it has data**:

| Tab | Comes from | Shown when |
|---|---|---|
| Estimates | `IndicativeWorkstream` "estimates" tab | the package has estimates. Keep its new-content dot. |
| Survey | `SurveysTab` (Planning) | any project has a visit that isn't `skip` |
| Brief | `TenderWorkstream` "brief" tab | the Tender phase has started |
| Supplier matching | `TenderWorkstream` "supplier-matching" tab | invited > 0. Count in brackets, as today. |
| Tender results | `TenderWorkstream` "offers" tab | offers in > 0. Count in brackets: "Tender results (8)". |
| Pricing | `PricingWorkstream` "pricing" tab | the Pricing phase has started |
| Contract | `PricingWorkstream` or `DeliveryWorkstream` "contract" tab | the package has a contract (`contractOn`). One tab, even if both services have one. |
| Delivery | `DeliveryWorkstream` "delivery" tab | the Delivery phase has started |

- **No tab** for a planned ("Later") or not-needed service.
- **Tab labels:** only Supplier matching and Tender results carry a count. Estimates keeps its new dot.
- **Reuse** each existing tab body as it is. Move it; don't rewrite it.
- **No second tab row** inside a tab.

**Overview:**
1. **Steps of the current service:** the card is titled with the service name, with "Now" on the right. Use the existing steps component for that service (`WorkstreamSteps` / `SimpleSteps`), styled as the design system's Steps: done `black-4` dots, steps with assets a `brand-6` dot with the `bg-accent` ring and "<n> assets", next an outline dot. Delivery uses the compact PhaseStepper from part 24 instead. A completed package shows no steps card.
2. **Assets:** columns ASSET (name, city, ChangedDot) and STEP (the asset's step in the current service), plus a chevron.
   - Rows link to the asset page with `from=workstream&ws=<id>`.
   - Sort: changed first, then the package's existing order.
   - Show 8 rows, then "Show all".
3. **Recent activity:** 5 rows, as now.
4. **Documents:** the files that were under "Your files" and the package documents, as one list. Show it only when there are files.

**URL:**
- The page reads `?tab=<id>` (`overview`, `estimates`, `survey`, `brief`, `supplier-matching`, `tender-results`, `pricing`, `contract`, `delivery`).
- The default is `overview`.
- **Old `?service=<id>` links:** open the first tab of that service, or Overview if it has none.
- **Links from other pages** that pointed at a service tab now point at the matching `?tab=`. Grep for `service=` in `hrefs` calls and in `Decisions.tsx`.

Remove components or props that only served the service cards (`caption`, `COLS`, `selectedPhase` usage on this page) once nothing uses them. List what you removed.

## 2. Service pages: search by asset

On `/concept/services/[id]` (`ServiceSection.tsx`) and the Planning surveys list (`SurveysTab.tsx`):

- **Search label:** "Search". The placeholder is **"Address or city"**, the same as on Assets.
- **What it matches:** a package's assets: building name, address and city. It no longer matches package or project names.
- **A matching package** stays in the list. Under its name, the second line lists the matching assets ("Kervelstraat 14, Am Hafen 12"; more than 2 become "Kervelstraat 14 and 3 more") in place of the usual detail.
- **Past rows** and the Completed fold use the same match.
- **Delete** the "Search workstreams or projects" and "Workstream or project name" strings.

## 3. Asset page: services as chips (mock 85, "Asset page · B")

**Remove** the "Services for this project" card.

**Header:** add a **Services** line under the fact grid.
- It has the label "Services" in `p7 text-text-tertiary`, then a row of `Chip`s, 8px apart.
- **Only relevant services:** those the asset's project has `done` or `now`. No chip for planned or not-needed.
- **Order:** service order.
- **Done** gets a leading tick. **Now** gets the leading orange `ChangedDot`, with the label in SemiBold.
- **Not clickable:** chips are display only.
- **Two projects on the asset:** one chip row per project, each starting with the solution label ("EV charging", in `p7 text-text-secondary`).

**Under the chips:** the existing strong button "Open `<package>` package ›". It's one button per project, with no footer text.

The current-service card ("Delivery at this asset") and History are unchanged.

## 4. Chip: one style across the product

Add `Chip` to `ui.tsx`:

```ts
type ChipProps = {
  children: ReactNode
  lead?: 'done' | 'now'          // display chips
  count?: number                 // filter chips
  selected?: boolean             // filter chips
  onClick?: () => void           // present = filter chip (a button)
}
```

- **Every chip:** 32px high, `rounded-full`, 12px side padding (8px on the left with a lead), `p6`, `bg-container`, a 1px `border-dark` border, `text-primary`. These are the design system's FilterChips measures.
- **Lead:** done is the 16px `check` Icon in `black-7`. Now is the 6px `brand-6` dot (ChangedDot size), and the label goes `h8`.
- **Count:** after the label, 6px gap, in `text-tertiary`; `text-primary` when selected.
- **Selected:** a 1.5px `black-7` border, label `h8`. No fill, as part 24 set it.
- **Hover:** clickable chips only, `bg-container-grey`.
- **Focus:** the 2px `black-7` outline, 2px out.
- **Rebuild `FilterChips`** (part 23) on `Chip`, and use `Chip` for the asset page services.
- **Leave alone:** Tag, ResponsibilityPill and the batch service cards are not chips.

## 5. Batch page (mock 89, batch half)

**Remove:** the Route card and the Packages/Workstreams card.

**Service cards** go under the header, in a grid of equal columns, 8px apart.

**Which cards:**
- First, **"All"** with the batch's project count.
- Then one card per service that has projects in this batch now, in service order. No card for a service with 0.

**Card content:**
- The service name in `h8`, then the project count in `h4` with tabular figures. `radius-md`, 12/16 padding.
- Under the count, "+`<n>` done" in `p7 text-text-tertiary`, only when some projects passed through that service. Nothing else on the card.

**States:**

| State | Look |
|---|---|
| Default | `bg-container-grey`, `black-2` border |
| Hover | `border-dark` border, pointer |
| Selected | `bg-container`, `border-dark` border, 3px `brand-6` top edge |
| Focus | the 2px `black-7` outline, 2px out |

- **Behaviour:** each card is a button that writes `?service=<id>`. "All" clears it.

**Assets card** under the cards, titled "Assets", with the count on the right.

| Column | Content |
|---|---|
| ASSET | Name and city, with the ChangedDot in the left padding |
| PACKAGE | The package name in `p6 text-secondary`, as text. Two packages: one per line. |
| SERVICE | That package's current service, one per line, matching PACKAGE |
| (chevron) | |

- **Links:** the whole row links to the asset page with `from=batch&batch=<id>`. The package is reached from the asset page's "Open … package ›". The design system allows one link per row, so the package name is not a link.
- **Filtering:** with `?service=` set, list only assets with a project in that service, and only those packages in the PACKAGE column.
- **Sort:** changed first, then the newest batch first, then A–Z.
- **Rows:** show 8, then "Show all".

**The batch meta line** keeps goal, assets, solutions and target. If the account has an agreed date for the batch (the old "Getting started · Agreed …"), add "agreed `<date>`" at the end. Recent activity is unchanged.

## Expected values (current repo data)

- **`/concept/packages/ev-voltreny`:**
  - No service cards.
  - The tabs are Overview plus only the tabs with data for this package.
  - Overview shows the Delivery steps, then Assets (6), Recent activity and Documents if there are files.
- **`?service=tender`** on the same package opens the Brief tab, or Overview if it has none.
- **`/concept/services/tender` with "Utrecht":** lists only packages with a Utrecht asset, and the second line names the matching assets.
- **Asset page for Kervelstraat 14:** no Services card. The header shows the chips for its done and current services, then "Open EV charging · Voltreny package ›".
- **`/concept/batches/flagship`:**
  - No Route and no Packages card.
  - The cards read All, then only services with projects.
  - Choosing a card filters Assets, and the URL has `?service=`.
  - Rows open the asset; the PACKAGE column is plain text.

## Done when

- **Package page:** it matches `90-package-tabs-chips.png`. There's one tab row with only tabs that have data, Overview has steps, assets, activity and documents, and old `?service=` links still land.
- **Service pages:** they search by address or city, and matching assets are named in the row.
- **Asset page:** it shows service chips in the header, with only done and now, and the strong button under them.
- **`Chip`:** it's one component, used by the asset page and the Assets list filter.
- **Batch page:** it matches the batch half of `89-service-cards-separate.png`, except that the package names are plain text. The cards filter Assets, and there's no route or packages card.
- **Unchanged:** `data.ts`, ops screens and the pilot Overview.
- **Build:** `npm run build` passes.
- **Report:** write this checklist into your final message with pass or fail for each item. List every file you touched, and every component or prop you removed.
