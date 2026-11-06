# Cursor prompt, part 35: asset page tabs, service steps, moves in one place

Paste everything below the line into Cursor, in the `new_concept` repo. Attach `docs/concept/wireframes/118-asset-moves.png`.

**Before you start:** parts 32–34 must be in the code: the Package fact with its menu, the package card, `from`/`closedOn`/`left`/`joined`/`hold` in the model, and the IN PACKAGE column on the package page. If any is missing, stop and say so.

This prompt is closed. It changes the asset page (`components/concept/BuildingView.tsx` and what it uses), corrects the move wording from parts 33–34, and fixes one table heading. It doesn't touch the batch page's layout, the package page's tabs, or routes.

---

## Why

- **The chips aren't tabs.** On the package page the chips are display-only and the tab row does the switching. Part 32 made the asset page's chips switch a panel instead, which nobody reads as tabs. The asset page goes back to a tab row, now scoped to the selected package, so two packages' Estimates never merge.
- **Every service has steps.** `SERVICES[].steps` in `lib/concept/model.ts` already lists them, and each project stores its `step`. Delivery shows its phases on a track; the other services now do the same.
- **Move information was spread over the menu, the panel, the status and History, and used made-up reasons.** It now has one place on each page, in fixed words, with the package name and no reasons.

## 1. Header: four facts, one row

Asset facts: **Package · In package · Batch · City.** Remove Solution: the batch has one solution, and five facts don't fit beside the photo.

- **Package:** the existing menu. Its rows show the package name, with the package's current service under it, or "Closed". The "Earlier" group holds packages this asset has left, and closed ones.
- **In package:** how this asset stands in the selected package, in the same words as the package page's IN PACKAGE column (section 6): "Since 1 Sep", "Joined 4 Nov", "On hold since 2 Oct", "Left 28 Aug · dropped".

## 2. Tabs, scoped to the selected package

One `Tabs` row under the header, the same component as the package page.

- **Tabs:** "Overview", then each service of the selected package that this asset has a project row in, in service order. Use the service names (Estimates, Planning, Tender, Pricing, Delivery).
- **Dot:** the package's current service gets the current-service dot, as on the package page. A package the asset has left has no dot.
- **URL:** `?tab=<service id>`, alongside `?package=`. No `tab` means Overview. Changing the package resets the tab to Overview. The pager keeps `?package=` and `?tab=` when the next asset has that tab.
- **Chips are display-only again:** remove the selectable chips, the `tablist` and `?service=` from part 32. Old `?service=` links still open the page; the param is ignored.

## 3. Overview tab

- **The package card**, as now: display chips on the left; on the right the service icon, "This asset is in `<service>`" and Open package.
- **Its panel:** the current service's steps for this asset, titled "`<Service>` at this asset" (section 5).
- **A package the asset has left:** the card keeps its chips, its panel (the last service it was in) and Open package. It has no service icon and no "This asset is in": the asset isn't in it any more. Nothing replaces them.
- **Then History and Documents** side by side, as now (part 27 rules for empty cards).

## 4. A service tab

- A `Card` titled "`<Service>` at this asset". On the right, in `p7` text-tertiary, the date of the latest fact. For an inherited phase (part 34), write "From `<package>` · `<date>`" instead.
- **Body:** the service's steps (section 5), then 20 below a `DetailsGrid` with this asset's figures for that service, using only what `data.ts` has:

| Service | Figures |
|---|---|
| Estimates | Cost · Payback · Your decision |
| Planning | Open gap · Survey · Scope |
| Tender | Supplier (once chosen) · Price for this asset · Site check |
| Pricing | Price · Analysis · Your decision |
| Delivery | none: the phase track says it |

- Leave out a figure with no value, and the grid when none are left.
- **Never on these tabs:** offer counts, the brief, supplier matching, other assets.

## 5. Steps for every service

- **Delivery:** the existing `PhaseStepper` (Start to Handover, with dates and sources).
- **Every other service:** `Steps` from `components/concept/ui.tsx` (chips on a track), built from `SERVICES[service].steps` and the project's `step`:
  - Steps before `step` are `done`.
  - `step` itself is `now`. If the project has finished the service (a later service has its row), every step is `done`.
  - Steps after `step` are `next`.
- **The line under a step,** only from data we hold. Leave it blank otherwise. Never invent a line.

| Step | Line |
|---|---|
| Estimate | the estimate ("€120–145k") |
| Presented | `presentedOn` |
| Decision | the decision and `decidedOn` ("No · 28 Aug", "Go ahead · 28 Aug", "Planning first · 28 Aug") |
| Gap found | `gap` |
| Survey done | the visit date |

## 6. Move wording, everywhere

Replace the wording from parts 33 and 34 with these fixed forms.

**IN PACKAGE (the package page column) and In package (the asset fact):**

- "Since `<date>`"
- "Joined `<date>`"
- "On hold since `<date>`"
- "Left `<date>` · `<how>`", where `<how>` is one of: split, moved, continued, tendered again, not chosen, dropped.
- The second line, on the package page only, is the other package's name: "Solar PV · Missing roof data" for a join, "Solar PV DE" for a move. Never a reason.

**History events for moves:** build them from `joined`, `left` and `hold`, and merge them with the existing history by date.

| Event | Detail line |
|---|---|
| Joined package | the package name |
| Left package · `<how>` | the package name |
| On hold | the package name |

- Every other history row from these packages gets the package name as its detail line too.
- **Batch Packages tab, HOW IT CAME:** "From `<package>` · `<how>`", or "Started `<date>`". A closed package reads "Closed · `<n>` at the start".
- **No reasons on screen.** Remove the `reason` values from the demo data ("Ready to tender", "Missing roof data", "Roof can't take panels", "Roof drawings in", "Waiting for the tenant"). Keep the field in the model, unused.
- **The moves in activity texts:** rewrite the demo entries in the same words. For example "Marktplatz 2 joined", with "From Solar PV · Missing roof data" as the text.

## 7. Data fixes

- **Marktplatz 2 in `solar-de`:** same `step` as the other four (Invited), not the brief step.
- **Remove "Brief addition — Marktplatz 2"** from documents, if part 34 added it.

## 8. Table heading alignment

On the package page Assets table, the STEP heading sits left of its values. Use one grid template for the heading row and the body rows, with the same padding, so every heading sits on its column. Check that IN PACKAGE lines up the same way.

## Done when

- **Marktplatz 2:**
  - The header reads Package "Solar PV DE" · In package "Joined 4 Nov" · Batch · City, on one row.
  - The tabs read Overview · Estimates · Tender (with the dot).
  - Overview shows the card with "Tender at this asset": Brief ready ✓, Shortlisted ✓, Invited (now), then three next steps.
  - History reads "Joined package / Solar PV DE", "Left package · moved / Solar PV · Missing roof data", "Joined package / Solar PV · Missing roof data", "Left package · split / Solar PV · Estimates".
- **Am Hafen 12, with Solar PV · Estimates picked from "Earlier":**
  - In package reads "Left 28 Aug · dropped".
  - The card has no icon and no "This asset is in". Its panel shows all four Estimates steps done, with "No · 28 Aug" under Decision.
  - The tabs read Overview · Estimates, with no dot.
- **Brückenstraße 5:**
  - In package reads "On hold since 2 Oct".
  - The Estimates tab shows the steps, with "From Solar PV · Estimates · 28 Aug" on the right, then Cost, Payback and Your decision.
- **Kervelstraat 14:** the Delivery tab and the Overview panel show the existing phase track.
- **No chip on the asset page is clickable.**
- **No reason text** appears in any IN PACKAGE value, History event or HOW IT CAME cell.
- **Package page:** STEP and IN PACKAGE headings line up with their values.
- **Build:** `npm run build` passes.
- **Report:** write this checklist into your final message with pass or fail for each item, and list every file you touched.
