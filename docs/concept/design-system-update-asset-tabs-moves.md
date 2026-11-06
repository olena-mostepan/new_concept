# Design system update: asset tabs, service steps, move wording (6 Nov 2026)

Paste everything below the line into the design-system chat. Attach `118-asset-moves.png`, `117-assets-in-package-column.png` and `115-batch-tabs.png` from `~/Documents/new_concept/docs/concept/wireframes/`.

---

## Context

- **Artifact:** https://claude.ai/artifact/5TNiRyXkn3UDAK9GfsWRgZ (Design System type, namespace `CQuelDS`). Read it first, edit it, and republish to the same URL.
- **Product side:** prototype parts 33–35 (`claude/cursor-prompt-batch-tabs-moves.md`, `claude/cursor-prompt-package-moves.md`, `claude/cursor-prompt-asset-tabs-moves.md` in the project). This update brings the design system in line with them.
- **The decisions behind it:**
  - **The asset page works like the package page:** one tab row and display-only chips. Display chips never switch anything.
  - **Every service shows its steps for an asset,** the way Delivery shows its phases.
  - **Moves (an asset joining or leaving a package) have one wording and one place on each page,** with the package name and no reasons.

## 1. Chip: retire the selectable display chip

- Remove `onSelect` and the selectable display chip from the Chip README, the bundle, the preview and `index.d.ts`.
- Restore the rule: a display chip is never clickable.
- The filter chip is unchanged.

## 2. PackageCard

- **Remove** `services[].selectable`, `selected`, `onSelect` and the `tablist`.
- **The panel** is titled "`<Service>` at this asset" and holds that service's steps for this asset:
  - **Delivery:** `PhaseStepper`.
  - **Every other service:** `Steps`.
  - Replace the panel table, which uses DetailsGrid facts, with this rule. The figures move to the service tabs (section 4).
- **A package the asset has left:** no `service`. The card then shows its chips, its panel and Open package, with no ServiceIcon and no "This asset is in". Nothing replaces them. Document this as the only variant besides Completed.
- **Completed:** unchanged.

## 3. Steps: one list per service, lines only from data

Add to the Steps README the step lists the product uses (from `lib/concept/model.ts`):

| Service | Steps |
|---|---|
| Estimates | Data collected · Estimate · Presented · Decision |
| Planning | Gap found · Info requested · Survey booked · Survey done · Scope agreed |
| Tender | Brief ready · Shortlisted · Invited · Responses in · Results · Supplier chosen |
| Pricing | Supplier set · Price requested · Price received · Analysed · Decision · Contracting |
| Delivery | Start · Design & survey · Installation · Commissioning · Handover · Complete (PhaseStepper) |

- **States:** steps before the current one are done, the current one is now, the rest are next. When the asset has finished the service, every step is done.
- **The line under a step** only comes from data we hold (the estimate, the presented date, "No · 28 Aug" for a decision, the open gap, the survey date). It's blank otherwise. Never write a line the data can't back.

## 4. Asset page pattern

Write this into the PageHeader, Tabs and PackageCard READMEs, and into the README's page patterns.

- **Header facts:** Package (FactSelect) · In package · Batch · City, on one row. Remove Solution from the asset's facts (the batch has one solution, and five facts don't fit beside the photo).
- **FactSelect rows:** the package name, with its current service, or "Closed", under it. The "Earlier" group holds packages the asset has left, and closed ones.
- **Tabs, scoped to the selected package:** Overview, then each service of that package the asset went through, in service order. The current service gets the current-service dot.
  - Replace the Tabs README line "The asset page has no tabs" with this.
  - "Never two tab rows on one page" stays.
- **Overview:** the PackageCard (with the current service's steps), then History (Timeline) and Documents (DocumentList).
- **A service tab:** a Card "`<Service>` at this asset", with the date on the right (or "From `<package>` · `<date>`" for a phase that came from an earlier package). Inside: Steps, then 20 below a DetailsGrid with the asset's figures:

| Service | Figures |
|---|---|
| Estimates | Cost · Payback · Your decision |
| Planning | Open gap · Survey · Scope |
| Tender | Supplier (once chosen) · Price for this asset · Site check |
| Pricing | Price · Analysis · Your decision |
| Delivery | none |

- **Never on the asset page:** offer counts, the brief, supplier matching, other assets.
- Update the preview to show the asset header, the tabs and the Overview card from mock 118.

## 5. Move wording (new README section "Moves")

One wording on every page. Write it as a table.

| Where | Wording |
|---|---|
| IN PACKAGE (package Assets table) and In package (asset fact) | Since `<date>` · Joined `<date>` · On hold since `<date>` · Left `<date>` · `<how>` |
| `<how>` | split · moved · continued · tendered again · not chosen · dropped |
| Second line (package table only) | the other package's name. Never a reason |
| History (Timeline) events | "Joined package", "Left package · `<how>`", "On hold"; detail line: the package name |
| Batch Packages tab, HOW IT CAME | "From `<package>` · `<how>`", or "Started `<date>`"; a closed package: "Closed · `<n>` at the start" |

- **No reasons on screen.** A reason only appears if someone has recorded one, and the demo data has none.
- **Never** "migrated", "transferred", "reallocated" or "removed".

## 6. Table: IN PACKAGE column and heading alignment

- **IN PACKAGE column** on the package page's Assets table (ASSET · STEP · IN PACKAGE · chevron):
  - Shown only when some asset has joined, left or is on hold, or the package is closed.
  - Rows that left are muted; their STEP is the step they left at.
  - Order: joined first, then the rest, then on hold, then left.
- **Heading alignment:** the heading row and the body rows share one grid template and the same padding, so each heading sits on its column. Add it to the Table rules. The prototype has the STEP heading out of line today.

## 7. Batch page: Assets and Packages tabs

- Document the two tabs, "Assets (`<n>`)" and "Packages (`<n>`)" (mock 115).
- **ServiceCards** count assets and only filter the Assets tab. "Dropped" and "Moved out" cards appear only when there are any, with label and count in text-tertiary.
- Closed packages fold into one "`<n>` closed" row on the Packages tab.
- Recent activity sits under the tabs, on both.

## 8. To confirm with Olena before changing

**StatusCard on a closed package.** The prototype (part 34) shows "This package is / Closed · `<date>`" with a grey icon. That is a second version of the StatusCard, and on the asset page the same kind of variant was rejected.

Recommended: a closed package has no StatusCard. "Closed `<date>`" goes in the header facts. Ask first; don't change it until she answers.

## Done when

- No display chip anywhere is clickable; `onSelect` is gone from Chip and PackageCard.
- PackageCard's panel holds Steps (or PhaseStepper), and the left-package variant is documented.
- The Steps README lists the five step lists and the "lines only from data" rule.
- The asset page pattern (header, tabs, Overview, service tab) is in the READMEs and the preview.
- The "Moves" section exists with the table above.
- The Table rules have the IN PACKAGE column and the heading alignment.
- `index.d.ts` and `design-system.json` match.
- Every component in the preview list renders.
- Republished to the same URL. Report what changed, file by file, and Olena's answer on section 8.
