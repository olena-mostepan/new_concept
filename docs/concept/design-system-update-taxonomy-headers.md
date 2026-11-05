# Design system update: one page header, type label, status, service icons (5 Nov 2026)

Paste everything below the line into the design-system chat. Attach:

- the three header screenshots (package, batch, asset) from the prototype;
- `105-package-top.png`, `106-batch-top.png` (frame A), `107-asset-options.png` and `109-asset-by-package.png` (Option 1) and `110-asset-package-switch.png` from `~/Documents/new_concept/docs/concept/wireframes/`;
- the five service icons from `~/Documents/new_concept/public/icons/services/`: `indicative.png`, `scope.png`, `tender.png`, `pricing.png`, `delivery.png`.

---

## Context

- **Artifact:** https://claude.ai/artifact/5TNiRyXkn3UDAK9GfsWRgZ (Design System type, namespace `CQuelDS`). Read it first, edit it, and republish to the same URL.
- **Source of truth for the product side:** prototype part 31 (`claude/cursor-prompt-taxonomy-headers.md` in the project). This update brings the design system in line with it.
- **The problem:** the batch, package and asset pages now share one header (breadcrumb, type label, title, facts), but each page spaces it differently (see the screenshots). The gaps between breadcrumb and label, label and title, and title and facts all differ. The design system has no single component that owns this spacing: `PageHeader` still has a meta line, and `AssetHeader` has its own rules. Fix it in the design system, so the pages can't drift.

## 1. PageHeader: one header for batch, package and asset

Rewrite `PageHeader`. It replaces `AssetHeader` (retire it, and point its README to `PageHeader`).

**Slots:** `crumbs`, `crumbAside` (the Pager), `kind` ('batch' | 'package' | 'asset'), `title`, `facts`, `aside` (a `StatusCard` or a photo).

**Order and spacing (fixed by the component, not by the page):**

| From | To | Gap |
|---|---|---|
| Breadcrumb row (20 high) | Type label | 24 |
| Type label row (20 high) | Title (`h4`) | 4 |
| Title | Facts row | 16 |
| Header | Whatever comes next (tabs, strips, service cards) | 24 |

- **Type label row height is 20.** The "i" button must not make the row taller: its visual is 16, its hit area 24, with negative margin so it overhangs. This is the most likely cause of the drift today.
- **Facts row:** each fact is a label in `p7` text-tertiary, 2 above a value in `p6`. 40 between facts, 16 between rows when they wrap. **Two lines only:** remove the source line and the `source` field everywhere. A fact with no value is left out; with no facts, the row is left out (no "Nothing on file yet", in the README or the bundle).
- **Aside:** on the right, top-aligned with the type label, 32 from the left block. The left block takes the remaining width.
  - Package: `StatusCard`.
  - Asset: the site photo, 260×164, `radius-lg`, cropped to fill, only when we hold one.
  - Batch: none.
- **Remove:** the meta line ("Flagship sites · 6 assets · …"). Its content is now the facts row. Remove the "city · batch" line from the asset header too.
- **Facts per page** (document these in the README):
  - Batch: Goal · Solution · Assets · Packages · Target (only when set, "Dec 2027", never shown as late).
  - Package: Batch · Solution · Assets · Supplier (once chosen).
  - Asset: Package · Batch · Solution · City (Package is a FactSelect, section 6).
- **Phone (360):** aside first at full width (photo or status card), then label, title, facts in 2 columns.
- **Preview:** show all three pages stacked with a spacing overlay (or measured lines) so the gaps can be checked by eye.

## 2. TypeLabel (new)

- "BATCH", "PACKAGE" or "ASSET" in `h9` text-tertiary, 0.06em tracking, then the `info` icon as `IconButton type="tertiary" size="small"`, 8 apart.
- Add `info.svg` to the Icons set if it isn't there.
- Hover or focus opens the definition (section 3). The button's accessible name: "What is a batch?" / "What is a package?" / "What is an asset?".
- **Definitions:**
  - Batch: "Assets grouped around one goal. A batch can hold several packages."
  - Package: "Assets that go through the services together. One service at a time."
  - Asset: "A building or site you own."

## 3. Tooltip: definition variant

Today the Tooltip README says "A few words, no full stop". The definitions are short sentences, so add a variant:

- `variant: 'definition'`: `p7`, max 300 wide, padding 8/12, sentences allowed, same colours and elevation.
- Only for TypeLabel. Everything else keeps the short label rule.

## 4. Service icons (new asset group and `ServiceIcon`)

- **Asset group "Services":** the five PNGs (3D glass renders, transparent, about 230 square). Ids match the service ids: `indicative` (Estimates), `scope` (Planning), `tender`, `pricing`, `delivery`.
- **`ServiceIcon({service, size})`:** an `<img>` with `alt=""` and `aria-hidden`, `object-fit: contain`, `filter: drop-shadow(0 10px 14px rgba(30,40,50,.12))`.
- **Two sizes only:** 116 (StatusCard) and 72 (PackageCard).
- **Usage rule:** only in `StatusCard` and `PackageCard`. Never in tabs, chips, tables, filters, nav or service-tab cards. They're illustrations, so they don't follow the 24-grid line-icon rules.

## 5. StatusCard (new, package page)

- White, 1px `border-dark`, 16 radius, padding 18/20 with 84 on the left, and a 30 left margin so the icon isn't clipped.
- `ServiceIcon` at 116: `position: absolute; left: -30px; top: 50%; transform: translateY(-50%)`, so it's centred on the card's height and breaks out over the left border.
- Text: "This package is in" in `p7` text-tertiary over the service name in `h4`. No third line.
- On the right: the large `strong` Button with `chevron-right` on the right, named after the service:

| Service | Button |
|---|---|
| Estimates | See estimates |
| Planning | See surveys |
| Tender | See offers |
| Pricing | See prices |
| Delivery | See delivery |

- **Completed:** "This package is complete", Delivery icon, no button.
- **The consumer provides:** `service`, `href`, `completed`.

## 6. Asset page: package switch and one package card (replaces the stacked PackageStrips)

The asset page picks a package first, because an asset's data belongs to a project (this asset in one package). See mock 110 and Option 1 in mock 109, and prototype part 32 (`claude/cursor-prompt-asset-package-switch.md`).

**Asset facts:** Package · Batch · Solution · City. Buildings goes (an asset is always 1). Batch and Solution follow the selected package.

**FactSelect (new):** a fact whose value switches what the page shows.

- **One option:** it renders as a plain fact.
- **Several options:** the label reads "Package · `<i>` of `<n>`"; the value plus a 16px `chevron-down`. Hover and open: `bg-container-grey` behind the value, `radius-sm`, with negative margin so the text doesn't move. Focus: the 2px `black-7` outline.
- **Menu:** 330 wide, white, `border-dark`, `radius-md`, floating elevation, padding 6. Each row is a name in `p6` (selected: `h8` on grey) over a `p7` text-tertiary line ("Flagship solar · Tender"). An optional "Earlier" group under a `border-light` line, with muted rows, for closed packages (the migration work).
- Keyboard: listbox behaviour.

**PackageCard (rename and slim `PackageStrip`):**

- **Head row:** chips on the left. On the right, `ServiceIcon` at 72 (inline), "This asset is in" (`p7` text-tertiary) over the service (`h4`), and the large `strong` Button "Open package ›".
- Remove the "Package" label, the package name and `line`, because the header names the package now.
- **Panel:** the grey box under the chips, titled after the selected chip ("Estimate at this asset", "Delivery at this asset"), holding only this asset's facts or the delivery track. Never offer counts or the brief.
- **Completed:** "This asset is complete", Delivery icon, button stays.

**Chip: selectable state (new):** for display chips that switch a panel.

- Only chips with data are selectable; the rest stay display-only.
- Hover: `border-dark`. Selected: 2px `black-7` outline, 1 out.
- `role="tab"` inside a tablist.

## 7. Tabs: the dot

- **Conflict to settle first:** the Tabs README uses the 6px `brand-6` dot for "new, not seen yet". The prototype uses the same dot for "the package's current service", next to the StatusCard. One dot can't mean both. Recommended: the dot marks the current service (orange = where you are), and "new" moves into the content (ChangedDot on rows). Confirm with Olena before changing it.
- The asset page has no tabs. Write that into the README, and keep "Never two tab rows on one page".

## 8. Breadcrumbs: follow the levels

Replace the start-from-the-nav-item rule with:

- **Batch:** "Overview › <batch>".
- **Package:** always "Overview › <batch> › <package>", wherever it was opened from. (The prototype currently shows "Kervelstraat 14 › EV charging · Voltreny" when opened from an asset; that's the bug this rule fixes.)
- **Asset:** from a package, "Overview › <batch> › <package> › <asset>" with the Pager on the right. From the Assets list, "Assets › <asset>".

## 9. Clean-up

- `DetailsGrid` README: its "Not in customer page headers" line should point to PageHeader's facts row.
- `InfoDrawer`: no page uses "See info" now. Mark it unused, or remove it after asking Olena.
- `index.d.ts` and `design-system.json`: update the types and the component list for every change above.

## Done when

- The three pages rendered with `PageHeader` show identical gaps: 24, 4, 16, 24 (check the preview overlay).
- The type label row is 20 high with the "i" in it.
- No fact anywhere has a third line, and no "Nothing on file yet" is left in the README or the bundle.
- `TypeLabel`, `ServiceIcon`, `StatusCard` and the Tooltip definition variant exist, with README and preview.
- `FactSelect`, `PackageCard` and the selectable Chip state exist; `PackageStrip` is retired.
- The tab-dot meaning is settled with Olena and written down.
- Every component in the artifact's preview list renders.
- Republished to the same URL. Report what changed, file by file.
