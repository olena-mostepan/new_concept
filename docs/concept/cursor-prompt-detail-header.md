# Cursor prompt, part 33: detail pages get Back instead of the nav, one PageHeader, one tab spacing, one facts rule

Paste everything below the line into Cursor, in the `new_concept` repo. Attach `docs/concept/wireframes/109-detail-focused-header.png` and `tab-spacing.png` (the 32 row).

**Before you start:** parts 31 and 32 must be in the code: `TypeLabel`, `FactsRow`, `ServiceIcon`, the package status card, and the asset page by package (the Package fact that switches, one package card, no asset tabs). If any is missing, stop and say so.

Part 32 asked for one shared header with fixed gaps. If it built one (`EntityHeader`, `DetailHeader` or similar), section 3 below merges it into `PageHeader`; use whatever name part 32 chose wherever this prompt says `EntityHeader`.

This prompt is closed. It changes four things:

- the bar above the batch, package, asset, project and ops batch pages;
- the header component;
- the spacing of every tab row;
- how facts are laid out (header, `DetailsGrid`, asset service cards).

It doesn't change the content or order of anything below the header (strips, cards, tables), the section pages' bar and nav (Overview, Assets, service lists, ops Portfolio and Workstreams), or the data.

The design system has the same rules (version 31): `PageHeader`, `TypeLabel` and `DetailBar` in `docs/design-system/`. If you have a fresh export of it, follow it; otherwise follow this prompt.

---

## Why

A detail page today carries the full app header and the section nav, then its own breadcrumb and its own tabs: two navigation systems at once. The section nav also highlights a section the page doesn't really belong to. Detail pages get a slim bar with Back instead, like the current product's project page.

The three headers also drift: each page wraps `PageHeader` (breadcrumb) and `EntityHeader` (the rest) with its own `mb-4` / `mb-6`, so the gaps differ. One component now owns the whole header and its spacing.

## 1. Which pages are detail pages (`ConceptChrome.tsx`)

Replace `isInside()` with `isDetail(pathname)`. It's true for:

- `/concept/batches/<id>`
- `/concept/packages/<id>`
- `/concept/assets/<buildingId>`
- `/concept/projects/…`
- `/concept/ops/batches/<id>` (it already uses the slim bar)

These are section pages and keep `AppHeader` with the nav: `/concept`, `/concept/assets`, `/concept/batches`, `/concept/services/<service>`, `/concept/ops` and the ops list pages.

On a detail page, render `DetailBar` (section 2) **instead of** both `AccountToggle` and `AppHeader`. Never both bars. The account switcher stays on the section pages.

## 2. `DetailBar` (replaces `InsideHeader`)

Rename `InsideHeader` to `DetailBar` and rebuild it:

- `header`: white, `border-b border-border-dark`, `h-16`, the same inner container as `AppHeader` (`mx-auto max-w-screen-2xl px-6 sm:px-8 lg:px-10`, flex, items-center, justify-between). It's inside the existing sticky wrapper.
- **Left: Back.** The `arrow-left` icon at 16, then "Back" in `h8 text-text-primary`, `gap-1.5`. Hover underlines the word (`hover:underline underline-offset-[3px]`). It uses `focusRing`.
- **Right:** the same tools as `AppHeader`, in the same order: the "Questions" link, `ViewToggle`, `Avatar`. Remove "Create projects", the globe and "EN".
- **No** customer logo, "Powered by CQuel", account name or nav row.

**Where Back goes:**

- To the page the person came from inside the concept. In `Shell`, keep the previous concept URL (path and query) in a `useRef`, updated whenever `pathname` or `search` changes. If there is one, Back calls `router.back()`.
- If there isn't one (they landed on the page from a link or a refresh), Back goes **up one level** with `router.push`:

| Page | Up one level |
|---|---|
| Batch | Overview (`hrefs.overview`) |
| Package | its batch |
| Asset opened from a package (`?project=`) | that package |
| Asset otherwise | Assets (`hrefs.buildings`) |
| Project | its package |
| Ops batch | ops Portfolio (`hrefs.ops`) |

Replace `backHref()` with a function that returns these. It needs the account, so call it inside `DetailBar`.

## 3. One `PageHeader` (`ui.tsx`)

Merge `EntityHeader` into `PageHeader`, so one component draws breadcrumb, type label, title, facts and aside.

**New props:** `crumbs`, `crumbAside`, `kind?: "batch" | "package" | "asset"`, `title`, `facts?: {label, value}[]`, `aside?: ReactNode`. Keep `meta`, `actions` and `legend` only for the section pages that still pass them. Delete `className` from the props and from every caller, so pages can't change the spacing.

**Spacing, fixed inside the component:**

| From | To | Gap |
|---|---|---|
| Breadcrumb row | Type label | 24 (`mb-6` on the crumb row) |
| Type label row | Title | 4 (`mt-1` on the title) |
| Title | Facts row | 16 (`mt-4` on the facts) |
| Header | Whatever comes next | 24 (`mb-6` on the header) |

- **Breadcrumb row:** `min-h-5`, the crumbs on the left and `crumbAside` (the Pager) on the right, as now.
- **TypeLabel row is exactly 20 high:** give the row `h-5`, and the 24px info button `-my-0.5`, so it overhangs instead of making the row taller. Remove the `mb-1` from `TypeLabel`; the title's `mt-1` gives the gap. The label and button are 8 apart (`gap-2`).
- **Facts row:** as `FactsRow` now, but `gap-y-4` between wrapped rows and `mt-0.5` on each `dd`. Facts with no value are dropped before rendering. With none left, the row isn't rendered.
- **Package fact (asset page):** keep part 32's switch. `PageHeader` accepts a fact as `{label, select}` and renders the switch in place of the value, so it sits in the same facts row with the same spacing.
- **Aside:** on the right, top-aligned with the type label (`items-start`), `gap-8` from the left block. The left block is `min-w-0 flex-1`.
  - Package: the status card.
  - Asset: the photo, 260×164, `rounded-lg`, `object-cover`.
  - Batch: nothing.
- **Section pages** (no `kind`): crumbs (if any), then the title. The same 24 below.

**Callers:**

- `BuildingView.tsx`, the package page and the batch page: replace the `PageHeader` + `EntityHeader` pair with one `PageHeader` that takes `crumbs`, `crumbAside`, `kind`, `title`, `facts` and `aside`. Remove their `className="mb-4"` and `mb-6` overrides.
- Delete `EntityHeader`.
- Leave every other `PageHeader` caller as it is, apart from removing `className`. For `WorkstreamsByBatch`'s `mb-4`, the gap becomes 24; check that it still looks right and say so.

## 4. Breadcrumbs

These are already set by part 31; check them:

- Batch: "Overview › <batch>".
- Package: "Overview › <batch> › <package>", wherever it was opened from.
- Asset from a package: "Overview › <batch> › <package> › <asset>", with the Pager on the right.
- Asset from the Assets list: "Assets › <asset>".

## 5. Tabs: one component, one spacing

Today `tabTriggerClass` is defined twice (`PackageView.tsx` and `DeliveryWorkstream.tsx`), and each `Tabs.List` sets its own gaps. Move both into `ui.tsx` as `tabListClass` and `tabTriggerClass`, delete the copies, and use them for every Radix tab row in `components/concept`.

| Part | Value | Classes |
|---|---|---|
| Between tabs | 32 | list: `flex gap-8` |
| Row line | 1px `border-light`, full width | list: `border-b border-border-light` |
| Tab row to content | 16 | list: `mb-4` (remove other margins after the list) |
| Tab | 32 high, text at the top, 12 under the 20px label | trigger: `inline-flex items-start h-8 pt-0 pb-3 -mb-px` |
| Side padding | none, so the underline is exactly the label's width | trigger: `px-0` (remove `px-0.5`) |
| Underline | 2px `brand-6` on the active tab, over the row line | trigger: `border-b-2 border-transparent data-[state=active]:border-brand-6` |
| Label | `p6` text-secondary; hover text-primary; active `h8` text-primary | trigger: `p6 … data-[state=active]:h8` (or swap the class) |
| Dot | 6px, 6 after the label, centred on the text | `TabDot`: `ml-1.5 mt-[7px] self-start` |

- The header above the tabs keeps its 24 gap (PageHeader's `mb-6`). Don't add margin on top of the tab row.
- `TabDot`'s accessible label: "Current service" where it marks the current service (the package page), "New" elsewhere. Give it a `label` prop.

## 6. Facts: one rule everywhere

Today there are three fact patterns: `FactsRow` (header), `DetailsGrid` (a grid of 4–5 columns, label in text-secondary, `mt-1`) and `Fact` in `BuildingView.tsx` (asset service cards). Make them one.

- **In `ui.tsx`:** give `FactsRow` the rule below, and use it from `PageHeader`.
- **`DetailsGrid`:** render `FactsRow` (keep `DetailTags` under it). Remove the `flow` prop and the grid classes.
- **`BuildingView.tsx`:** replace `Fact` and the `grid-cols-3` wrappers in the package card's panel (`ServiceFacts`) with `FactsRow`. `detail` becomes the fact's optional third line.

| Part | Value | Classes |
|---|---|---|
| Label | `p7` text-tertiary | `dt.p7.text-text-tertiary` |
| Label to value | 2 | `dd.mt-0.5` |
| Value | `p6` text-primary | `dd.p6.text-text-primary` |
| Detail (cards only, optional) | `p7` text-secondary, 2 below | `dd.mt-0.5.p7.text-text-secondary` |
| Fact width | at least 160 | each item `min-w-40` |
| Between facts | 40 | list `flex flex-wrap gap-x-10` |
| Between wrapped rows | 16 | list `gap-y-4` |
| Empty | a fact with no value is dropped; no facts, no row | filter before render |

- In `PageHeader`, never pass `detail`: header facts are two lines.
- Links in facts (batch, package) are underlined, `decoration-border-dark underline-offset-[3px]`.

## Check

- **Asset page from a package (`/concept/assets/<id>?project=…`):**
  - The top bar shows "← Back" on the left and Questions, Customer/Ops and the avatar on the right. There's no logo, no "Powered by CQuel" and no Overview / Assets / services row.
  - Back returns to the package.
  - Refresh the page, then press Back: it goes to the package (up one level).
- **Asset from the Assets list:** Back returns to Assets; the breadcrumb reads "Assets › <asset>".
- **Package and batch pages:** the same bar. Back from a package opened from the Tender list returns to the Tender list. After a refresh, Back on a package goes to its batch, and on a batch to Overview.
- **Section pages** (Overview, Assets, a service list): unchanged, with the logo row and the nav.
- **Gaps:** on batch, package and asset pages, measure crumb → type label 24, type label → title 4, title → facts 16, header → tabs or cards 24. They're identical on all three. The type label row is 20 high.
- **Facts:** on the asset page header and in the package card's "Estimate at this asset" panel, labels are light grey `p7`, values `p6`, and short facts start 200 apart (160 + 40) in both. `grep -rn "grid-cols-5\|function Fact(" components/concept` returns nothing.
- **Tabs:** on the package page, the tabs are 32 apart; the underline is exactly as wide as "Overview"; the active label is SemiBold; 16 below the row line the content starts. `grep -rn "tabTriggerClass = " components/concept` finds one definition, in `ui.tsx`.
- `grep -rn "EntityHeader\|InsideHeader\|Create projects" components/concept` returns nothing.
- `npm run build` passes.
- **Report:** write this checklist with pass or fail for each item, and list every file you touched.

## Done when

Every detail page has the Back bar and no section nav, and every batch, package and asset header comes from the one `PageHeader` with the fixed gaps.
