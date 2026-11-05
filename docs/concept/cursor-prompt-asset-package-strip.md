# Cursor prompt, part 27: asset page with package strips

Paste everything below the line into Cursor, in the `new_concept` repo. Attach `docs/concept/wireframes/103-asset-page-ds-v2.png`.

**Before you start:** parts 25 and 26 must be in the code: `Chip` with `lead: 'done' | 'now' | 'next'`, `ChipTrack`, the chip-based `DeliveryCard`, the date-first `History`, and `Button` with `icon` / `iconPosition`. If any is missing, stop and say so.

This prompt is closed. It restructures the asset page (`components/concept/BuildingView.tsx`) only. Don't change `data.ts`, routes, the pager, the package page or other pages.

---

## Why

The page told the package story three times: the chips and the button in the header, a service card full of package facts (offer counts, the brief), and the package documents. The button had nothing next to it saying why. The new page reads in one order:

1. Which asset (header).
2. What it's part of and where to go for results (one package strip per project).
3. Its record (History, Documents).

The page is orientation only: nothing to act on except "Open package".

## 1. Header

- Keep the breadcrumb row with the pager, the `h4` address, the "city · batch" line, the facts grid and the optional photo, as they are.
- **Remove "Nothing on file yet".** With no facts, the facts row is left out.
- **Move out of the header:** the "Services" label, the chip rows and the "Open … package" buttons. They go into the strips below.

## 2. Package strip, one per project (new `PackageStrip` in `ui.tsx`)

Replaces the project selector cards (`projects.length > 1`) and `CurrentCard`. Render one strip per project in `projects`, in the order `projectsAtBuilding` returns, 16 apart.

**Props:** `name`, `line`, `services: { label; lead: 'done' | 'now' }[]`, `href`, `ariaLabel`, `title?`, `aside?`, `children?`.

**Layout:** a `Card` with no title bar (white, `border-border-dark`, `rounded-lg`, padding 16/20).

- **Head row:**
  - Left: "Package" in `p7 text-text-tertiary`, the package name in `h7`, and `line` in `p7 text-text-secondary`.
  - Right, vertically centred: `Button type="strong" size="large" icon="chevron-right" iconPosition="right"` labelled **"Open package"**, with `aria-label="Open <package name> package"`, linking to `hrefs.workstream(w.id, "building", building.id)`.
- **Services:** 12 under the head, display `Chip`s 8 apart, from `serviceChips(w)`. Only done and now; no chip for planned or not-required services.
- **At this asset panel** (only when `children`): 16 under the chips.
  - `bg-bg-container-grey`, `border border-border-light`, `rounded-md`, padding 12/16/16.
  - Title row: `title` in `h8` on the left, `aside` in `p7 text-text-tertiary` on the right.
  - Then `children`, 12 below.

## 3. What goes in `line`

One short line saying what the package page holds, plus how many assets share it. Add `packageLine(w, otherAssets)` in `BuildingView.tsx`:

| Current service | Line |
|---|---|
| Estimates | "Estimates and next steps for this asset and `<n>` others" |
| Planning | "Scope, surveys and next steps for this asset and `<n>` others" |
| Tender | "Offers, brief and next steps for this asset and `<n>` others" |
| Pricing | "Prices, contract and next steps for this asset and `<n>` others" |
| Delivery | "Tender results, contract and delivery for this asset and `<n>` others". Leave out "Tender results" if the package skipped Tender, and "contract" if there's no `contractOn`. |
| Completed | "Completed `<date>`" |

- `<n>` is the package's distinct assets minus this one.
- With `n = 0`: "… for this asset".
- With `n = 1`: "… and 1 other".

## 4. What goes in the panel: only this asset's data

| Current service | Panel title | Content |
|---|---|---|
| Delivery (row has `delivery`) | "Delivery at this asset" | The existing `DeliveryCard` body: the chip track Start to Handover, each with date and source. The aside is the existing right slot ("Voltreny · contract €26k"). |
| Planning | "Planning at this asset" | The scope facts (open gap, survey, scope), as a 3-column row of `Fact`s |
| Estimates | "Estimate for this asset" | Cost, payback, decision, as a 3-column row |
| Pricing | "Price for this asset" | Price, analysis, decision, as a 3-column row |
| Tender | none | No panel. Offers are priced for the whole package; the line already says where they are. |
| Completed | none | Every chip is done. |

- Reuse `ServiceFacts` for Planning, Estimates and Pricing, laid out as `grid grid-cols-1 gap-4 sm:grid-cols-3` instead of a stack.
- **Remove the Tender branch** (offers, site check, brief). Those are package facts.
- "Waiting for your decision" stays as plain text. No buttons and no pills in the panel.

## 5. History and Documents

- Keep both cards.
- **Empty:** hide History when it has no events, and Documents when it has no files. No "Nothing on file yet" anywhere on the page.
- **Width:** when both show, two columns. When one shows, it takes the full width. When neither shows, nothing.
- **Documents order:** this asset's files first, then its packages' files, with "package" in the meta line ("PDF · package · 2 Aug"). See all stays.

## 6. Remove

- The project selector cards and the `choose()` / `?project=` switching.
- Old `?project=` links still open the page; the param is just ignored.
- `CurrentCard` and `cardTitle`.
- Every "Nothing on file yet" in `BuildingView.tsx`.

## Expected values (Halvering)

- **Kervelstraat 14:**
  - Header: three facts and the photo.
  - One strip: "Package · EV charging · Voltreny · Tender results, contract and delivery for this asset and 5 others", with "Open package" on the right.
  - Chips: Estimates (done), Tender (done), Delivery (now).
  - Panel: "Delivery at this asset" with the chip track.
  - Then History and Documents side by side.
- **Wiesenstraße 88:**
  - Header: no facts row.
  - One strip: "Solar PV DE · Offers, brief and next steps for this asset and 3 others", with chips Estimates (done) and Tender (now). No panel.
  - Documents at full width; no History card.
- **Halverkamp 19:** two strips (EV charging and Solar PV), each with its own chips, button and panel.

## Done when

- The asset page matches `103-asset-page-ds-v2.png` in structure: header, then strips, then the record.
- **Header:** it has no services, chips or buttons.
- **Strips:** one per project, each with one "Open package" button. The strip is the only link to the package.
- **Panels:** they show only the asset's own data, and Tender has none.
- **Empty states:** no "Nothing on file yet"; empty cards and rows are left out.
- **Unchanged:** `data.ts`, routes, the pager, the History and Delivery chip styles from part 26.
- **Build:** `npm run build` passes.
- **Report:** write this checklist into your final message with pass or fail for each item, and list every file you touched.
