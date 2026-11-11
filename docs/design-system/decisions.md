# CQuel design system: handoff (4 Nov 2026, updated after version 47)

For the next task on the design system. Read the published artifact first; it is the full, current copy. Version 44 supersedes anything below that it contradicts.

## Where it lives

- **Artifact:** https://claude.ai/artifact/5TNiRyXkn3UDAK9GfsWRgZ (Design System type, namespace `CQuelDS`). Olena has also shared it as https://claude.ai/code/artifact/2413464b-3c94-467f-ae65-c89d2448737e.
  - Start with `project/README.md`.
  - Then read `project/design-system.json` and `project/components/`: `bundle.css`, `bundle.js` and `index.d.ts`, plus one folder per documented component with `README.md` and `preview.html`.
  - Publish `index.d.ts` with contentType `text/plain`. A `.ts` extension isn't served otherwise.
  - Icon assets can't be read back as files from a cloud session. The Icon component references them by blob id.
- **Publishing:** set `root` to the folder that contains `project/`, set `file_path` to `project/design-system.json`, and pass a `files` map of the changed files. Set `lastChange` each time.
- **Figma source:** "Cquel. V3" (figma.com/design/VI2azP5EiNCeF99ZCXra41), for variables, text styles and components.
- **Prototype code:** `~/Documents/new_concept` on Olena's Mac. Cursor prompts are in `docs/concept/` and in this project as `claude/cursor-prompt-*.md`. Wireframes are in `docs/concept/wireframes/`.
- **No local working copy survives a task.** Rebuild from the artifact: read it, edit, then republish to the same URL.

## What's in it

- **README rules:**
  - The one rule: orange means "this needs you, or this is where you are"; dark means go there.
  - Content fundamentals and words.
  - Colour tiers, type scale, and spacing, radius, borders and shadows.
  - Concept pieces and page furniture.
  - Iconography and the logo.
- **Components:**
  - Actions and display: Button (`primary | strong | secondary | tertiary | link | danger`, with `icon` and `iconPosition`), IconButton, Tag, ResponsibilityPill, Chip, Card (with `footer`), DetailsGrid, KeyFigure, Table, ChangedDot.
  - Forms: FormField, Input, Select, Textarea, Checkbox, Radio, CheckCard.
  - Progress: Steps, NeedsPanel, PhaseStepper (with `source` and `size="compact"`), Progress, PlanTrack.
  - Filters: FilterField, SearchField, FilterSelect, FilterBar, FilterChips, YourActionOnly.
  - Navigation: ServiceCards, Tabs, InfoDrawer, Pager, Breadcrumbs, PageHeader.
  - Concept blocks: AssetHeader, PackageStrip, NeedsDecision, ServicesBar.
  - Charts: TrendChart (Momentum).
  - Furniture: SummaryCard, ListFooter, EmptyState, Banner, ActivityList, DocumentList, Timeline, Modal, Tooltip, Icon.
- **Retired:** Route, ProjectServices and PhaseTrack.
- **Asset groups:** Logos and Icons.

## Version 13 (3 Nov): concept decisions 1–9

- Words: asset, package, project.
- Button `strong` replaces primary on orientation pages. Never use both on a page.
- FilterChips.
- InfoDrawer narrowed to secondary lookups.
- Kick-off became Start, with a date source line.
- AssetHeader, ProjectServices (since retired), Pager and NeedsDecision.

## Version 14 (3 Nov): review fixes

These came from the design review. The tracker is https://claude.ai/artifact/PaN9YctHUikEub2xXSWKX4, and the summary is `claude/design-review-2026-11-03.md`. The prototype fixes are in Cursor prompt part 24 (`claude/cursor-prompt-design-review-fixes.md`).

- **Focus:** superseded in v38 by the soft halo.
- **Table:** real table roles, plus empty and muted rows.
- **New components:** Icon, Breadcrumbs, PageHeader and the furniture set.
- **Tokens:** no 13px or 15px sizes. New tokens: `space-2`, `space-6`, `radius-image` and `bg-scrim`.
- **Prototype words:** Estimates, Planning, Tender, Pricing, Delivery. A skipped service is "Not required".

## Versions 15–38 (4 Nov): chips, steps, history, buttons, documents

The full write-up is `claude/design-system-update-tabs-chips.md`. The prototype prompts are part 26 (`claude/cursor-prompt-chips-steps-history.md`), part 27 (`claude/cursor-prompt-documents.md`) and part 28 (`claude/cursor-prompt-chips-on-grey.md`).

- **Chip:** one component with two looks.
  - **Display chip** (24px, not clickable) has the same look on white and on grey:
    - done: white fill, `border-dark` border, a 14px round black tick in front;
    - now: `bg-accent` fill, `border-accent-strong` border (brand-3), orange dot;
    - next: dashed `black-4` border, filled with the surface colour (`--cq-surface`; grey inside `.cq-pstrip__here` or `.cq-on-grey`), so the 2px `border-dark` track line stops at its edge.
  - **Sizes:** 24px for steps and phases; `size: 'big'` (32px, h8, 16px tick) for an asset's services in the PackageStrip, so they outrank the phases.
  - **Filter chip** (32px button): white with a grey count. Selected is a `black-7` fill with white text; this is the one black pill.
- **Steps and PhaseStepper:** chips on a track, which replaces the numbered circles. Under each chip go the date and its source. Compact mode is one chip.
- **ServiceCards:** a batch filter. Cards are white with a 4px `brand-6` top bar on the selected card. Borders never turn dark.
- **PackageStrip** (asset page): replaces ProjectServices. It holds the package name, one line on what's there, display chips (done and now only) and the strong "Open package" button. This asset's own data sits in a grey panel under it.
- **AssetHeader:** with no facts, the facts row is hidden. Never "Nothing on file yet" in the header.
- **Timeline:** date first, with a 52px date column and a rail. `you: true` gives the dot an accent ring.
- **Button icons:** Button takes `icon`. IconButton is square, secondary or tertiary, with the label shown as a tooltip. Modal and drawer close buttons use IconButton.
- **TrendChart (Momentum):** Started is the one orange line (2.5px, soft brand-6 fill); Finished is ink, dashed. Hover: dashed black-3 guide, ringed orange dot with a brand-1 halo, month label in ink, floating tooltip (no border) with keys and right-aligned values. Prototype prompt: part 29 (`claude/cursor-prompt-momentum.md`).
- **PageHeader (v28):** one header for batch, package and asset: breadcrumb, TypeLabel (with an "i" definition tooltip), title, facts row (label over value, two lines), aside (package StatusCard, asset photo). Fixed gaps 24 · 4 · 16, 24 below. AssetHeader retired.
- **ServiceIcon / StatusCard (v28):** five 3D service illustrations (asset group "Services"), only in StatusCard (116) and PackageStrip (72). PackageStrip now shows "This asset is in <service>" on the right; its `line` is gone.
- **DetailBar (v28):** detail pages (batch, package, asset, project, ops batch) have a slim bar with Back and the account tools, instead of the app header and section nav. Back = where you came from, else up one level. Breadcrumbs follow the levels. Prompt: part 33 (`claude/cursor-prompt-detail-header.md`).
- **Asset page by package (v31):** the Package fact is a FactSelect (menu of the asset's packages, "Earlier" group for closed ones); one PackageCard (replaces PackageStrip) shows the selected package: big chips, selectable when the asset has data, "This asset is in <service>", Open package, and a panel for the selected chip. The asset page has no tabs. Asset facts: Package · Batch · Solution · City. Prototype: part 32 (`claude/cursor-prompt-asset-package-switch.md`), then part 33 (`claude/cursor-prompt-detail-header.md`).
- **Tabs (v29) and facts (v30):** 32 between tabs, 32-high tabs, 16 to content; facts min 160 wide, 40 apart, label 2 above value, one rule for header and DetailsGrid.
- **Asset tabs and moves (v35):** the asset page works like the package page: tabs scoped to the selected package (Overview, then each service the asset went through), display chips never clickable, PackageCard panel holds the current service's steps for this asset (Steps, PhaseStepper for Delivery), service tabs hold steps + figures. Steps README lists the five step lists; lines under steps only from data. "Moves" section in the README: one wording (Since/Joined/On hold since/Left · how), no reasons, never "migrated/transferred". IN PACKAGE column and heading alignment in Table. Batch page Assets/Packages tabs. StatusCard keeps a Closed variant (Olena, 6 Nov). Changed-key sits top right (v33). Prompts: parts 33–35 from the other chat; my detail-header prompt; part 34 service cards; part 35 changed key.
- **Dropdowns (v37):** one CQuel menu for Select, FilterSelect and FactSelect; the field arrow is the chevron-down icon, centred; Progress and PlanTrack unused.
- **Focus and hover (v41, Olena 6 Nov; replaces the v38 halo):** keyboard focus is a black ring for accessibility: 2px black-7 with a 2px white gap (`focus-ring` 0 0 0 2px #fff, 0 0 0 4px black-7), `:focus-visible` only, on every button colour. Fields: a 2px black-7 border whenever focused. Table rows and menu rows never get a ring or border: a focused link row is black-2 with its name underlined; the menu's highlighted row is black-2. Hover and pressed stay in each element's own colour: primary brand-7 / brand-8; secondary, tertiary, icon buttons, chips, service cards black-2 / black-3; danger danger-1 / danger-2; table rows black-1. Never the light accent for hover. Menus: chosen row SemiBold plus a 16px check. The search clear × is a plain grey icon, no fill, no tooltip.
- **Ops asset setup (v43, 10 Nov):** Ops package, asset and data screens say package and asset. New: AssetWindow (Fix assets / Edit asset data, ~1000 Modal, 260 side list, Done only), RequirementRow + RequirementGroup (done, to confirm, files disagree, no file, missing value, not available, edit), FoundValue (grey AI mark), UploadRow, SelectionBar (grey bar, primary bulk action), AssistantPanel + AssistantButton + UpdatedHighlight (rough). StatusCard `fix` ("3 assets need fixing first", "Fix 3 assets"); Table selection, BlockingCell, RecommendedCell, chips in the header; read-only Data card; no drop zone in Documents; data changes in History with the old value. Saving: every change by its own button, nothing autosaves, closing with an unsaved edit asks. "Use <value>" stays secondary. Orange on Ops data screens: only the dot on blocked assets. **Look (v46, Olena 10 Nov): direction A, a checklist from the previous app** — square checkbox marks, section titles with a pill and a rule, grey found-value boxes with the info icon, soft (grey) per-item buttons, primary Done. An icon-tile / green-tick / blue-panel pass (v45) was rejected. **After the UI review (v47):** StateMark round (status, not a control); s3 group labels with the pill on the right, accent while Blocking has open items; actions at the right end; FoundValue light yellow with secondary buttons; `soft` never on grey or tinted surfaces; drop row on black-2 with an icon box; files listed with DocumentList (reading / unknown states); building icon in the side list; SelectionBar on the light accent with no names; blocked and ready rows both selectable (Fix n assets / Start estimates for n); assistant button in the DetailBar, no blue; `.cq-on-grey` and the AssetWindow height bugs fixed. Brief: `claude/design-system-update-ops-setup.md`; spec: `claude/spec-ops-asset-setup.md`.
- **Fields, one size (v40):** every field 40 high (small 32), typed text and placeholder p6 in the product font, labels h9 text-title 4 above; the Overview hero search is the only exception.
- **Tab dot:** keeps both meanings: the current service on the package and asset pages, "new" elsewhere. InfoDrawer is unused but kept.
- **DocumentList:** one list with no grouping. Each row has the file type as a neutral Tag at the new `xsmall` size (20px) before the detail, and a tertiary IconButton (download, or chevron-right for a set to view).

## Open points

- ServicesBar hover is black-7 in the design system, but the prototype fills the hovered segment orange. Not decided.
- The ops delivery form's "Start date from" select isn't in the design system.
- The prototype has only 8 icons in `public/icons`. Parts 26–27 need more, including `download.svg`.

## Settled preferences (apply without asking)

- **Brand orange:** `brand-6` #D93F0B. It is a mark, never a strong fill, and the UI shouldn't read as many alerts.
- **Weight:** SemiBold for emphasis, never Bold. Keep visual weight light overall. The only black pill is the selected filter chip.
- **One system:** never two variants of a component for different backgrounds. A component must hold its look on white and on grey.
- **Padding:** tight in cards and tables.
- **ChangedDot:** brand orange, never black.
- **Responsibility wording:** "Your action", plus CQuel's and suppliers' action on ops screens. Never "With you".
- **Labels:** every dropdown and search field has a visible label.
- **Decisions:** when the prototype and the design system disagree and Olena says "fix in the design system", the prototype is right.
- **Scope:** desktop only for now.
