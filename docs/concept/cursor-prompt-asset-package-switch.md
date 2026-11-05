# Cursor prompt, part 32: asset page switches by package

Paste everything below the line into Cursor, in the `new_concept` repo. Attach these from `docs/concept/wireframes/`:

- `110-asset-package-switch.png` (the first two frames; the "Earlier round" frame comes in a later prompt)
- `109-asset-by-package.png` (Option 1 only, for the chips that switch the panel)

**Before you start:** part 31 must be in the code: `TypeLabel`, `ServiceIcon`, the status inside `PackageStrip`, and the asset service tabs. If it's missing, stop and say so.

This prompt is closed. It changes the asset page (`components/concept/BuildingView.tsx` and what it uses in `ui.tsx`), fixes the package breadcrumb, and evens out the header spacing on the three pages. It doesn't touch:

- `data.ts`;
- the package page below its header, and the batch page below its header;
- History and Documents, other than where they sit.

---

## Why

An asset's data belongs to a project: this asset in one package. Two packages can both have Estimates for the same asset, with different figures. The service tabs from part 31 merged them behind one "Estimates" tab. The page now picks a package first, then shows that package's services for this asset.

## 1. Remove the asset service tabs

- Remove the tab row from part 31 section 6, the service-tab cards and the `?tab=` handling on the asset page. Old `?tab=` links still open the page; the param is ignored.
- The page reads: header, then the package card (section 3), then History and Documents (part 27 rules: hidden when empty, one takes the full width when the other is hidden).

## 2. Package is the first fact, and it switches

**Asset facts:** Package · Batch · Solution · City. Remove Buildings (an asset is always 1).

- **Batch and Solution** are the selected package's batch and solution, so they change with the package.
- **One package:** the label reads "Package" and the value is the package name as plain text, like any other fact.
- **Two or more packages:**
  - The label reads "Package · `<i>` of `<n>`".
  - The value is a button: the package name plus a 16px `chevron-down`, 6 apart. Hover: `bg-container-grey` behind it, `radius-sm`, padding 2/6 with matching negative margin so the text doesn't move. Focus: the 2px `black-7` outline. Open: the same grey stays.
  - `aria-haspopup="listbox"`, `aria-expanded`, and `aria-label="Package: <name>. <i> of <n>. Change package"`.
- **The menu:** a popover 8 under the value, left-aligned, 330 wide, white, `border-dark`, `radius-md`, the floating elevation, padding 6.
  - One row per package the asset is in: the package name in `p6` (selected: `h8` on `bg-container-grey`), with "`<batch>` · `<current service>`" under it in `p7` text-tertiary. A completed package reads "`<batch>` · Complete".
  - Order: the selected one first, then by most recent activity.
  - Keyboard: arrow keys move, Enter picks, Esc closes and returns focus to the value. A click outside closes it.
- **URL:** picking a package writes `?package=<workstream id>`.
  - **Default:** the `ws` from `from=workstream`, otherwise the package with the most recent activity for this asset.
  - The pager keeps `?package=`.

## 3. One package card under the header (replaces the stacked strips)

Show only the selected package. 24 under the header.

- **Card:** white, `border-dark`, `rounded-lg`, padding 16/20/20.
- **Head row:**
  - Left: the service chips (big display `Chip`s, 32px, 8 apart; done and now only). Remove the "Package" label and the package name from the card, because they're now in the header.
  - Right, vertically centred: `ServiceIcon` at 72, 12 gap, "This asset is in" in `p7` text-tertiary over the service in `h4`, then the strong large `Button` "Open package" with `chevron-right`, linking to the selected package (`from=building`), `aria-label="Open <package> package"`.
- **Completed package:** "This asset is complete", Delivery icon, all chips done. The button stays.

**The chips switch the panel (mock 109, Option 1):**

- The panel opens on the current service by default.
- A chip is clickable only when this asset has data for that service in this package. The other chips stay display-only, with no hover.
- **Clickable chip:** `role="tab"`, inside a `role="tablist"` labelled "Services for this asset". Hover: `border-dark`. Selected: a 2px `black-7` outline, 1 out, `aria-selected="true"`. Focus: the usual outline.
- Clicking a chip writes `?service=<id>`, together with `?package=`. Switching the package resets it to that package's current service.
- **The panel:** the grey box from part 27, 16 under the chips, titled after the chip:

| Chip | Panel title | Content |
|---|---|---|
| Estimates | "Estimate at this asset" | Cost · Payback · Your decision |
| Planning | "Planning at this asset" | Open gap · Survey · Scope |
| Tender | "Tender at this asset" | Supplier (once chosen) · Price for this asset · Site check |
| Pricing | "Price at this asset" | Price · Analysis · Your decision |
| Delivery | "Delivery at this asset" | The existing chip track, Start to Handover |

- **Facts:** a 3-column row of `Fact`s (label `p7` over value `p6`, no third line), using only what `data.ts` has. Leave a fact out when it has no value; when none is left, the chip isn't clickable.
- **Aside:** in `p7` text-tertiary on the right of the title, keep the existing asides ("Voltreny · contract €26k"); otherwise the date of that service's facts.
- **Never in the panel:** offer counts, the brief, supplier matching, other assets.
- **Tender with no asset facts** (Wiesenstraße 88): no panel and no clickable Tender chip, as now.

## 4. Breadcrumbs

- **Package page:** always "Overview › `<batch>` › `<package>`", whichever page it was opened from. Today it shows "Kervelstraat 14 › EV charging · Voltreny" when opened from an asset. Fix that.
- **Asset page:** from a package, "Overview › `<batch>` › `<package>` › `<asset>`", with the pager. From the Assets list, "Assets › `<asset>`". From a batch, "Overview › `<batch>` › `<asset>`".

## 5. Header spacing, the same on all three pages

The three headers are spaced differently today. Put the spacing in one place: a shared `DetailHeader` in `ui.tsx`, or the existing header component if there is one. The batch, package and asset pages all use it.

| From | To | Gap |
|---|---|---|
| Breadcrumb row (20 high) | Type label | 24 |
| Type label row (20 high) | Title (`h4`) | 4 |
| Title | Facts row | 16 |
| Header | What comes next (tabs, package card, service cards) | 24 |

- **Type label row is 20 high.** The "i" `IconButton` must not make it taller: keep its hit area at 24 with a −2px vertical margin.
- **Facts:** 40 between facts, 16 between rows when they wrap; label 2 above value.
- **Aside** (the package status card, or the asset photo): on the right, top-aligned with the type label, 32 from the left block.
- Remove any page-level margins that now double up with these.

## Done when

- **Kervelstraat 14** (from EV charging · Voltreny):
  - The breadcrumb has four levels.
  - The facts read Package "EV charging · Voltreny" (plain, no chevron) · Batch · Solution · City. No Buildings.
  - There's no tab row. One card shows the chips, the Delivery icon, "This asset is in Delivery" and "Open package ›", then "Delivery at this asset". Then History and Documents.
  - Clicking the Estimates chip shows "Estimate at this asset" with Cost, Payback and Your decision, and writes `?service=indicative`.
- **Halverkamp 19** (from Assets):
  - The facts read "Package · 1 of 2" with a chevron. The menu lists Solar PV DE and EV charging · Voltreny, each with its batch and service.
  - Picking the other package switches the facts, status, icon, chips, panel and button, and writes `?package=`.
  - The menu works with the keyboard.
- **Wiesenstraße 88:** one package, Tender, no panel, and no clickable chips other than any with facts.
- **Package page opened from an asset:** the breadcrumb reads "Overview › Flagship sites › EV charging · Voltreny".
- **Spacing:** the batch, package and asset headers have the same gaps (24, 4, 16, 24). Measure them in the browser and list the values.
- **Icons:** they appear only in the package status card and the asset's package card.
- **Build:** `npm run build` passes.
- **Report:** write this checklist into your final message with pass or fail for each item, and list every file you touched.
