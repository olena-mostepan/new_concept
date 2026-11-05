# Cursor prompt, part 31: package, batch and asset pages: labels, one header, status, asset tabs

Paste everything below the line into Cursor, in the `new_concept` repo. Attach these from `docs/concept/wireframes/`:

- `105-package-top.png`
- `106-batch-top.png` (frame A only)
- `107-asset-options.png` (the "Asset page · top" and "Two packages" frames only)
- `108-asset-tabs.png`

**Before you start:** parts 25–30 must be in the code: `PackageStrip`, the package tab row, `Chip`, `Button` with `icon`, and the optional batch target. If they're missing, stop and say so.

This prompt is closed. It changes three pages (package, batch, asset): the top of each, the service icons, and tabs on the asset page. It doesn't touch:

- the package page below its tabs;
- the batch page's service cards and Assets table (part 25 stays as built);
- History and Documents, other than moving them into the asset's Overview tab;
- `data.ts`, other than the icon map.

---

## Why

Customers don't know what a batch, a package or an asset is. Each page now says what it is, where it sits, and (for package and asset) which service it's in, in the same place and the same words.

## 1. Service icons

- **Files:** `public/icons/services/indicative.png`, `scope.png`, `tender.png`, `pricing.png`, `delivery.png`. They're already in the repo: 3D glass renders, about 230px square, transparent.
- **Component:** add `ServiceIcon({ service, size = 44 })` in `ui.tsx`. It renders `<img src="/icons/services/<service>.png" alt="" aria-hidden>` at `size × size` with `object-contain`.
- **Where icons appear:** only in the package status card and the asset's package strips (sections 4 and 5). Never in tabs, chips, tables, cards on service tabs, filters or nav.

## 2. Type label with its definition

Above each page title, add `TypeLabel({ kind: 'batch' | 'package' | 'asset' })` in `ui.tsx`:

- The label is "BATCH", "PACKAGE" or "ASSET", as `h9` text-tertiary with 0.06em tracking.
- **The "i":** after the label, the design system's `info` icon. Use `IconButton` with `icon="info"`, `type="tertiary"` and `size="small"`, not a drawn circle with a letter. If `public/icons/info.svg` is missing, add it from the design system's Icons (it isn't in the folder today) and say so. Hovering or focusing it opens the existing Tooltip, in `p7`, max 300px wide. The text:
  - **Batch:** "Assets grouped around one goal. A batch can hold several packages."
  - **Package:** "Assets that go through the services together. One service at a time."
  - **Asset:** "A building or site you own."
- **Accessibility:** the button's `aria-label` is "What is a batch?" (and so on for package and asset).

## 3. One header for all three pages

Every one of the three pages uses the same order: breadcrumb (with the pager on the asset page, as now), `TypeLabel`, title (`h4`), then a facts row.

**Facts row:** each fact is a label in `p7` text-tertiary over a value in `p6`, 40 apart. No third line. A fact is left out when there's no value.

| Page | Facts |
|---|---|
| Batch | Goal · Solution · Assets · Packages · Target (only when set) |
| Package | Batch · Solution · Assets · Supplier (once chosen) |
| Asset | Batch · Solution · Buildings · City |

- **Remove** each page's old meta line ("Flagship sites · 6 assets · …"). Its content is now the facts row.
- **Asset photo:** it stays on the right of the asset header, as now.

**Breadcrumbs follow the levels:**

- Package: "Overview › `<batch>` › `<package>`".
- Asset opened from a package: "Overview › `<batch>` › `<package>` › `<asset>`".
- Otherwise keep the existing `?from=` logic.

## 4. Status card (package page)

A white card on the right of the package header:

- **Card:** 1px `border-dark`, 16px radius, padding 18/20 with 84 on the left for the icon (about 12px between the icon and the text).
- **Icon:** `ServiceIcon` for the current service at 116px, `position: absolute; left: -30px; top: 50%; transform: translateY(-50%)`, with `drop-shadow(0 10px 14px rgba(30,40,50,.12))`. It's centred on the card's vertical middle and breaks out over the left border. Give the card a 30px left margin so nothing clips it.
- **Text:** "This package is in", in `p7` text-tertiary, then the service name in `h4`. **No third line.**
- **Button:** on the right, the strong large `Button` with the `chevron-right` icon on the right.

**Package button:** it's named after the current service and opens that tab (`?tab=`).

| Service | Button | Tab |
|---|---|---|
| Estimates | See estimates | `estimates` |
| Planning | See surveys | `survey` |
| Tender | See offers | `tender-results` (`brief` if there are no offers yet) |
| Pricing | See prices | `pricing` |
| Delivery | See delivery | `delivery` |

**Completed package:** the card reads "This package is complete", uses the Delivery icon and has no button.

**On the package page:**

- The current service's tab keeps its 6px `brand-6` dot, so the card and the dot say the same thing.
- **Keep** the package Overview's service chips (done and now) and the steps panel for the current service under the tabs ("Delivery for this package", with counts on the chips: "Installation · 4"). The card says where the package is; the panel shows how far each asset has got.

## 5. Asset page: status inside each package strip

The asset page has **no separate status card**. The status goes into the existing `PackageStrip`, one per project, as now.

- **Left:** "Package" in `p7` text-tertiary, the package name in `h7`, then the service chips (done and now) 12 below.
- **Right, vertically centred on the left block:** `ServiceIcon` for the package's current service at 72px (inline, with the same drop-shadow, no break-out), 12 gap, then "This asset is in" in `p7` text-tertiary over the service name in `h4`, then the strong large `Button` "Open package" with `chevron-right` on the right. It links to the package (`from=building`), `aria-label="Open <package> package"`.
- **Remove** the strip's `line` ("Tender results, contract and delivery for this asset and 5 others") and `packageLine()`. The status replaces it.
- **Panel:** unchanged. "Delivery at this asset" (or Planning, Estimate, Price) in the grey box under the chips. Tender and Completed have no panel.
- **Completed package:** "This asset is complete", Delivery icon, and the button stays ("Open package"), since the package still holds the results.
- **Two projects:** two strips, each with its own icon, status and button.

## 6. Asset page: tabs scoped to this asset (mock 108)

The asset page gets one tab row under the header, the same `Tabs` as the package page.

- **Tabs:** "Overview", then one tab per service this asset has been through in any of its packages, in service order: Estimates, Planning, Tender, Pricing, Delivery. Same names as the chips.
- **Only with data:** a service tab shows only when this asset has at least one fact for that service. No empty tabs.
- **Dot:** a service tab gets the 6px `brand-6` dot when it's the current service of any of the asset's packages. An asset in two packages can have two dots.
- **URL:** `?tab=<service id>`; no param means Overview. The pager keeps `?tab=` when the next asset has that tab, otherwise it opens Overview.

**Overview tab:**

- The package strips (section 5), one per project, 16 apart.
- Then History and Documents, with the rules from part 27 (hidden when empty; one takes the full width when the other is hidden).

**A service tab:**

- Under the tabs, "This asset only" in `p7` text-tertiary, 12 below.
- Then one card per package that went through this service, 16 apart. Active first, then newest.
  - **Title bar:** the package name in `h7`; on the right, in `p7` text-tertiary, "Now" or "Done · <date>".
  - **Body:** this asset's 2–3 facts for that service, as a 3-column row of `Fact`s (label `p7` over value `p6`, no third line). Reuse `ServiceFacts`.
  - **Delivery:** the body is the chip track from `DeliveryCard` (Start to Handover), the same as the strip's panel.
- **Facts per service** (use only what `data.ts` has; leave a fact out when there's no value, and drop the card when none is left):

| Tab | Facts |
|---|---|
| Estimates | Cost · Payback · Your decision |
| Planning | Open gap · Survey · Scope |
| Tender | Supplier (once chosen) · Price for this asset · Site check |
| Pricing | Price · Analysis · Your decision |
| Delivery | the chip track |

- **Never here:** offer counts, the brief, supplier matching, other assets. Those are package facts; they stay on the package page.
- **No buttons and no links** in the service-tab cards. The way to the package is "Open package" in the Overview strips.

## Done when

- **Package (`/concept/packages/ev-voltreny`):**
  - The page reads: breadcrumb "Overview › Flagship sites › EV charging · Voltreny", then "PACKAGE (i)", the title, and the facts Batch · Solution · Assets · Supplier.
  - The status card shows the Delivery icon centred vertically and breaking out over its left border, "This package is in Delivery" and "See delivery ›", with no third line. The button opens the Delivery tab.
  - Under the tabs, the Overview shows the service chips and "Delivery for this package" with the steps.
- **A package in Tender:** the card shows the Tender icon and "See offers".
- **Batch (`/concept/batches/flagship`):**
  - The page reads: "BATCH (i)", the title, then Goal · Solution · Assets · Packages · Target Dec 2027.
  - Under it, the service cards and Assets table from part 25, unchanged. No status card and no icon.
  - Offices has no Target fact.
- **Asset (Kervelstraat 14, opened from the package):**
  - The breadcrumb has four levels.
  - The page reads: "ASSET (i)", then Batch · Solution · Buildings · City.
  - No status card under the header. The EV charging · Voltreny strip shows its chips on the left and the Delivery icon, "This asset is in Delivery" and "Open package ›" on the right, with "Delivery at this asset" below.
- **Asset in two packages (Halverkamp 19):** two strips, Delivery and Tender, each with its own icon and button; the Tender strip has no panel.
- **Asset tabs:**
  - Kervelstraat 14 shows "Overview · Estimates · Tender · Delivery•"; no Planning or Pricing tab.
  - Overview holds the strip, then History and Documents.
  - Estimates shows "This asset only" and one card, "EV charging · Voltreny", with Cost, Payback and Your decision.
  - Halverkamp 19's Tender tab has two cards, one per package, and two tabs carry a dot.
  - No service-tab card shows offer counts or the brief.
  - `?tab=` survives the pager when the next asset has that tab.
- **The "i":** it shows the right definition on hover and on keyboard focus.
- **Icons:** they appear in the package status card and the asset's package strips, nowhere else.
- **Build:** `npm run build` passes.
- **Report:** write this checklist into your final message with pass or fail for each item, and list every file you touched.
