# CQuel design system: handoff (4 Nov 2026, updated after version 63)

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
- **Ops workspace and Assets table (v49, 11 Nov):** AssetWindow is a full-screen workspace, not a modal: top bar (Close, title h6 + subtitle, Done primary large; unsaved change shows the question with Keep editing / Close without saving, both secondary), three independently scrolling columns: side list 280 (240 in edit) · checklist (max 880, centred) · Documents 340. Below 1180 Documents slides in from the right via "Documents · n"; below 760 one column with an asset picker. Documents column: header + files pill, stacked drop zone, DocumentList in a white box with View (new `eye` icon) before Download; DocPreview (new) opens files there, with a highlight strip when opened from a FoundValue. OpsAssetsTable (new) replaces the Ops Data table on the package page: status Tag, Required/Recommended tallies, Blocked since, rows open in place with Fix this asset / Edit data; filter opens on All; blocked rows first. The v46–47 modal rules for AssetWindow are retired.
- **New batch workspace (v51–52, 12 Nov):** the full-screen Workspace is one pattern with two layouts: fix/edit (AssetWindow: side list | content | Documents) and create (content max 880, aligned left in its column (v52; not centred) | side column 380 on `black-1`, one column below 1024). Top bar: Close, title, subtitle, the primary action at the right end; a missing hint (`info` + `p7`) before a disabled action, one thing at a time; the close check turns the right side into a question with Keep editing and the close action, wrapping under the title below 640 (the hint hides). New: AssetPicker (whole row toggles, Add all / Remove all), ChosenList (count pill, dashed empty box, Remove, "New" tag), InlineForm (needed / confirmation left of a secondary action), UploadRow wording variant ("Drop a site list or plans here", "Upload files"). Retired: the two-step batch Stepper and the Continue / Back footer on creation flows.
- **Supplier tender page (v54, 17 Nov):** new surface "Supplier screens" (one tender at a time; tender, site, indicative/final offer, site visit, commission; British English, £; only "Your action"). New: TenderRail, StageList (dots: now orange with bg-accent ring, later white with black-4 border, done = done chip), SpecList (label | sentence rows), CriteriaTile, LinkRow ("go to another tab", plain white), SiteMap. Banner `icon`; DetailBar supplier variant ("Tenders", avatar only); Card `accent`, `count`, `subtitle`; DetailsGrid `panel`; Table `files` and `button` cells. Decided (Olena): the one card that needs you gets a 4px brand-6 top bar with the Your action pill and the page's primary (max one per page); status colours only for state, plain information on neutral Banner or plain Card; supplier tables may carry row actions, customer tables still don't. Full icon set (93) copied to `public/icons`.
- **Supplier Tenders list (v63, 19 Nov):** the supplier's home; same layout as the customer and ops service lists (C11 option B without the preview pane, Olena). Customer-style header (first letter, Powered by CQuel, supplier name, avatar; no Questions, no primary); nav shows only sections with content (Tenders today). Groups Needs you · In progress · Closed (muted); TENDER · SOLUTION · SITES · NEXT STEP / OUTCOME · pill · chevron; no solution icons in rows; only Needs you rows carry the pill; ChangedDot for unopened invitations. YourActionOnly `label` ("Your action only" on supplier screens). Open: does "Not for us" ask why; do invitations expire; final offer and winning states.
- **Supplier offer C5 + offer window (v62, 19 Nov):** C5 (never applied before) and the window together. The flow moves from the Overview card into the **OfferWindow** (full window like AssetWindow; Olena: one screen isn't good UI): left = steps, Your files (QuoteFiles, several files, Tag for what we read it as), What we read (RequirementRow `flags`; only a missing unit blocks), Also in your offer, Questions on your quote (QuestionRow, red items only; sending with questions open allowed for now); right (400, grey) = AboutCard for the selected row (info blue, brief's own words, never made up), FindField `compact`, the brief in short (SpecList `facts` with `~`); footer = status line + Send. New SegmentedChoice. InfoCell `flag` and `was`. OfferCard: start · in progress ("Finish your indicative offer", "Continue your offer") · sent ("What the customer compares": Price · Speed · Quality; "Your answers" with Answer now). StickyActionBar: Upload / Continue; hidden while the window is open and after sending. Open: expected ranges (David, Ops), per-site view and brief-item links.
- **Supplier indicative offer C4 (v60, 18 Nov):** the whole offer flow is inside the OfferCard: start → reading (file row, 240 progress bar, Cancel, no time estimate) → check what we read (RequirementRows: value-only edit box, input under the name, two totals as FoundValues, sites checklist; Send disabled while any row is open) → sent (no orange bar, pill or primary; five InfoCells; "How your offer reads to the customer", never against other suppliers). Editing after sending: "Edit your offer", Cancel, "Send changes"; every change notifies CQuel (Olena). "How your offer reads" is shown to suppliers, written automatically, not checked by Ops (Olena). YouSaid = InfoCell `own`: blue (`status-info-bg/border`), one `cite` icon (16, `status-info-text`), full width under each chapter's cells, only after sending. StickyActionBar follows the card: Upload → Fill in / Send your offer; hidden while reading and once sent. `soft` stays on white rows; the concept build should add it. Open: variants, per-site prices, Commission Form at the site visit.
- **Supplier tender C3, revised (v58, 18 Nov):** page layout: full-width sticky top bar (64), 1536 page column, 400 rail on the left, main column `bg-container-grey` with 24/32/112 padding; white left margin, grey right margin; the rail band stops at the rail. "Why you were invited" is a `neutral` Banner with the `info` icon. Kept (Olena): the rail's info band and InfoCard warm as exceptions to the status-colour rule; OfferCard as a component. Solution icons `solar-pv.png`, `heat-pump.png`, `ev-charging.png`, `led.png`. Decline link `h8` inside a `p6` sentence. StickyActionBar is a full-width bar fixed to the window bottom (72, slides up 200ms, never with the OfferCard). The job: map beside 2 × 2 InfoCells (3fr : 2fr); no popover open by default; the popover may reach past the map's edge rather than cover a pin.
- **Supplier tender C3 (v57, 18 Nov):** the tender is the parent: TenderRail 400, white, `status-info-bg` header band with a SolutionIcon3D, facts, "How this tender runs" (StageList), "How CQuel is paid" (InfoCard `warm`); no status or action in the rail. The tender's stages (StageList, vertical, rail only) never look like the supplier's own steps (Steps chips in the OfferCard). New: SolutionIcon3D, InfoCard, OfferCard ("Send an indicative offer", "Upload your quote", Decline under it at 14px), StickyActionBar (only while the OfferCard is out of view), FindField (find, then ask CQuel; 5 states), Chapter (1 The job · 2 What you price · 3 What nobody knows yet · 4 How the customer chooses), InfoCell (grey boxes need borders, Olena 18 Nov). SiteMap is a real OpenStreetMap image with pin buttons (never orange) and a SitePopover that never covers another pin. Words: indicative offer / your quote / Commission Form; each fact once; "every site". Exceptions to the status-colour rule: the rail's info band and InfoCard warm. Parked: continuity after the offer; question reply time and brief-changing answers (Ops).
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
