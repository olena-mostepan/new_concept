<!-- Exported from the CQuel design system artifact (version 28, 05 Nov 2026).
Source of truth: https://claude.ai/artifact/5TNiRyXkn3UDAK9GfsWRgZ — re-export after design-system changes; don't edit by hand.
In this folder: README.md (rules), components.md (every component), tokens.json, types.md (props), decisions.md (decisions and settled preferences). -->

CQuel helps property portfolios buy and deliver energy projects: solar, heat pumps, EV charging, LED. The product is calm and black-and-white, and has one loud colour. Orange means **this needs you, or this is where you are**. Use these rules for every customer and ops screen. The Figma file "Cquel. V3" is the source: its variables, text styles and components match the tokens and components here.

## The one rule: orange means "this needs you, or this is where you are"

- `brand-6` (#D93F0B) and its light accent (`bg-accent`, `border-accent`) appear only for two things.
- **What needs the customer:**
  - the `primary` Button (only on pages where the customer acts);
  - the `accent` "Your action" pill;
  - a need that is with the customer;
  - a delivery phase waiting on them ("Confirm dates").
- **Where the customer is, or what's new:**
  - the ChangedDot (changed in 7 days);
  - the tab dot: the current service on package and asset pages, or something new in a tab elsewhere;
  - the active tab underline;
  - the selected service filter card on a batch page (4px top bar);
  - the `now` display Chip: the step, phase or service where work is under way (light accent, darker border, orange dot);
  - the History dot of an event that still waits on the customer.
- Everything else is ink and greys: done and later chips, the pipeline bar, checkboxes, progress, focus rings.
- **The one black pill** is the selected filter Chip. Tag `strong` stays retired.
- **Dark means go there; orange means do this.** The `strong` Button (`black-7` fill) is the one way on from a page; the `primary` Button is the one action that moves the work on.
- At most one `primary` Button per screen or panel.
- **Orientation pages** (Overview, assets, batches, services, an asset page, a package Overview) carry no action buttons in rows; rows are links that end in a chevron. They have no `primary` Button: at most one `strong` Button takes its place ("Open EV charging · Voltreny package ›").
- Status colours (`status-*`) are for state, never for who something is with, and never a solid fill.

## Content fundamentals

- **Sentence case** everywhere: buttons, pills, headings ("View batch", "Suppliers' action", "Needs your decision"). Capitals only for `s3` column labels.
- **British English**, € or £ in the account's currency, dates as "13 Oct", no weekdays.
- **Services are the customer's language.** Headlines count projects in services and batches ("137 projects in progress across 2 batches"). A package goes through its own services, as phases; a service it finished is "passed through", and only a package with every service done is "completed".
- **Words on customer screens:**
  - **asset**: a building or site in the portfolio ("Find an asset", "Assets › Kervelstraat 14", "36 assets"). Never "building" in the UI.
  - **package**: a group of projects bought and delivered together, what the code calls a workstream ("Open EV charging · Voltreny package", "Your action: 3 packages"). Never "workstream" in the UI.
  - **project**: one asset × one solution.
  - **batch**: unchanged for now. "Programme" may replace it later.
  - **Services**, in route order: Estimates, Planning, Tender, Pricing, Delivery. A service a project skips is "Not required".
- **Ops screens** use the ops words: the nav is Portfolio · Workstreams · the five services, and ops tools say **property** and **workstream** ("Choose properties", "Add workstream", "Properties (12)"). Cards that ops shares with the customer Overview keep the customer words (asset, package, Your action).
- **Responsibility** on customer screens is only "Your action". Nothing marks CQuel's or suppliers' action; ops screens keep all four labels ("Your action", "CQuel's action", "Suppliers' action", "Done"). With a count, the label comes first: "Your action: 2", never "2 your action".
- **Every line says something specific.** A next step is one "main — detail" pair that ends with a date: "Choose a supplier" / "results sent 13 Oct". No "waiting N days" counts.
- **No invented future dates or data.** Estimates are labelled ("Est. Nov"). Things not booked yet say so ("Booked — date to confirm"). Nothing the platform doesn't hold: no benchmarks, no "savings".
- **Missing information is taken care of, not broken.** Say who is getting it ("CQuel's action · asked 16 Oct"), not "Missing".
- No emoji and no exclamation marks.
- **Search finds assets:** the placeholder is "Address or city" on Assets and on every service page.
- **Every control has a visible label.** Search fields, dropdowns and inputs carry a label above them (FormField, SearchField, FilterSelect). A placeholder is a hint, never the label. A filter's default value names what it covers: "All batches", "All services".
- **Orange is a mark, never a strong fill.** On progress bars and summaries it's a 6px dot or the Your action pill, never a bar, a band or a block of orange text. The only orange grounds are the light accent (`bg-accent`) on the Your action pill and the `now` chip, and the 4px bar on the selected service filter card.

## Colour

- Text on `bg-container` and `bg-container-grey` uses four tiers:
  - `text-primary`: body and headings.
  - `text-title`: SemiBold row titles and form labels. It reads heavy but sits a step off black.
  - `text-secondary`: meta and second lines.
  - `text-tertiary`: column labels, counts, placeholders and upcoming steps. It is the lightest grey allowed for text, at 4.8:1.
- Never use `black-4` or lighter for text.
- `border-dark` is the border for every card, input, table and secondary button. `border-light` divides inside a card.
- `bg-container-grey` is the page background. Cards are `bg-container` (white).
- Status is three tones per state. `status-*-bg` is the ground, `status-*-mark` is for dots, icons and borders (3:1), and `status-*-text` is for words (4.5:1).
- Legacy primitives (`green-*`, `dark-green-*`, `blue-6`, `amber-6`) belong to old marketplace screens. Don't use them in new work.

## Type

- Schibsted Grotesk in two weights: 400 for reading and 600 (SemiBold) for emphasis. Never Bold, Medium or ExtraBold.
- Product screens use this subset:

| Style | Size / line height | Use |
| --- | --- | --- |
| `h4` | 24/32 | Page title |
| `h5` | 20/28 | Section |
| `h6` | 18/26 | Batch or group name |
| `h7` | 16/20 | Card title, table group header |
| `h8` | 14/20 | Row titles, values, labels, buttons |
| `p6` | 14/20 | Body and cells; stepper labels (the current one in `h8`) |
| `h9` | 12/16 | Pills, small buttons |
| `p7` | 12/16 | Meta, hints, dates |
| `s3` | 12/16, capitals, +4% tracking | Column labels |
| `h3` | 32/40 | Key figures only |

- `h1`, `h2` and `p1`–`p5` are for the landing page, PDFs and email only.
- Numbers in tables and key figures use tabular figures.
- **Heavier but lighter.** When something must read as structure without shouting, it goes SemiBold in a lighter grey. That covers column labels (`s3` in `text-tertiary`), row titles (`h8` in `text-title`) and form labels.

## Spacing, radius, borders and shadows

- Spacing comes only from `space-*` (4, 8, 12, 16, 20, 24, 32, 40, 48, 56…). Round off-scale values to the nearest step.
- Standard measures:
  - Page side padding is `space-32` (16 on phones), and cards sit `space-16` apart.
  - Card padding is 16, with a 12/16 header.
  - Table cells are padded 12/16, with 32 on the left of the first column for the changed dot.
  - Labels sit 4 from their content, and fields stack 12 apart.
- Radius:
  - `radius-sm` (4): checkboxes and Small buttons.
  - `radius-md` (8): buttons, inputs, check cards and needs panels.
  - `radius-lg` (12): cards and drawers.
  - `radius-image` (10): photos and the Overview hero search.
  - `radius-full`: pills, dots and circles.
- Cards sit flat with a `border-dark` line and no shadow. Only floating things cast one: `elevation-floating` for menus, popovers and tooltips, `elevation-overlay` for drawers and modals, on the `bg-scrim`.
- **Focus** is one style everywhere and never orange: a 2px `black-7` outline 2px out on buttons, links, tabs, chips, cards you can click and table rows. Fields, checkboxes and radios get the `focus-ring` (a white gap and a black-7 ring), and fields also turn their border `black-6`.
- Off-scale gaps use `space-2` and `space-6`; nothing else sits between the steps.

## The concept pieces

- **Chips** (Chip). One component, two looks.
  - **Display** (24px, not clickable) marks where something is: done (white, grey border, round black tick), now (light accent, darker border, orange dot) and later (dashed outline). One look on white and on grey: a later chip's fill is the surface it sits on (`--cq-surface`), so the track line stops at its edge. Two sizes: 24px for steps and delivery phases, `big` 32px (`h8`) for an asset's services in the PackageStrip, so the services read as the level above the phases.
  - **Filter** (32px, a button): white with a grey count; black with white text when selected. Used for Assets by solution (FilterChips).
- **Package tabs** (Tabs): one row is the package page's whole navigation: Overview, then the content tabs that have data, in service order. Never two tab rows on a page.
- **Service filter cards** (ServiceCards, batch page): All, then each service with projects, with its count. They filter the Assets table below. White; the selected card has a 4px orange top bar; borders never turn dark.
- **Steps** (one service of a package): chips on a track. Done steps are done chips, steps with work under way are now chips with the count ("Installation · 1") and when it started under them, later steps are dashed. A 2px `border-dark` line joins them. Assets that haven't started sit on a plain chip with "3 awaiting start". On a package Overview there are no descriptions, needs panels or buttons.
- **Page headers** (PageHeader) are one component for batch, package and asset pages: breadcrumb, TypeLabel ("BATCH", "PACKAGE", "ASSET" with an "i" that shows the definition), the title in `h4`, then a facts row (label over value, two lines only). The gaps are fixed: 24 · 4 · 16, and 24 below. No meta line, no "See info", no details grid, no staff names on customer screens.
  - Facts: Batch: Goal · Solution · Assets · Packages · Target. Package: Batch · Solution · Assets · Supplier. Asset: Batch · Solution · Buildings · City. A fact with no value is left out.
  - Aside: the package page's StatusCard ("This package is in Delivery" with the 3D service icon and "See delivery ›"); the asset's site photo (260×164, only when we hold one); nothing on a batch.
  - On the breadcrumb row, a Pager steps through the package's assets ("‹ name · 1 of 6 in this package · name ›") when the asset page was opened from a package.
  - InfoDrawer is unused for now.
- **Service icons** (ServiceIcon): five 3D illustrations, one per service. Only in StatusCard (116) and PackageStrip (72); never in tabs, chips, tables, filters or nav.
- **Momentum** (TrendChart, dashboards): Started is the one orange line (2.5px, soft orange fill under it); Finished is ink, dashed. Hover shows a dashed guide, the orange point with a white ring and accent halo, the month label in ink, and a floating tooltip with each series' key and value.
- **Package strip** (PackageStrip, asset page): one per project. Left: "Package", the package name, and the services as big display chips (32px; done and now only). Right: the service icon (72), "This asset is in <service>", and the strong "Open package ›" Button, the only link to the package on the page. Under it, in a grey panel, only this asset's own data for the current service ("Delivery at this asset").
- **Asset page tabs:** Overview (package strips, History, Documents), then one tab per service the asset has data for, each starting with "This asset only" and one card per package with this asset's facts.
- **Delivery phases** follow the product's delivery view: Start → Design & survey → Installation → Commissioning → Handover → Complete. Every date says where it comes from: Start's is "Contract start date", "Contract signed", "LOI signed" or "From invoice · date to confirm"; others "Site check report", "From invoice · date to confirm" or "Estimate". PhaseStepper draws them as chips on a track with the date and its source under each; in table rows, one chip for the phase the asset is in. A phase waiting on the customer shows "Confirm dates" with the orange dot.
- **Overview: Needs your decision** (NeedsDecision): its own card, three packages newest first, with "See all n" when there are more. Only when something is with the customer.
- **Lists filtered by one value** (Assets by solution) use FilterChips above the FilterBar instead of a select.
- **Tables** on service pages: groups Needs your decision / In progress / Passed through (Delivery: Completed). Only the first column is SemiBold. The whole row is a link with a chevron at the end; no View or action buttons on customer screens. Rows changed in the last 7 days show the ChangedDot and sort first.

## Page furniture

- **Two kinds of page, two tops.**
  - **Section pages** (Overview, Assets, the five service lists; ops Portfolio and Workstreams): the app header and the section nav.
    - **Header:** the customer's own logo when we hold it, otherwise their initial on a black-7 square with white text, never orange. Then "Powered by CQuel" and the account name. On the right: Questions, the avatar.
    - **Nav:** Overview · Assets | SERVICES · the five services. The active item has the 2px `brand-6` underline; a dot after a service shows something in it changed.
  - **Detail pages** (batch, package, asset, ops batch: anything opened from a list): the **DetailBar** instead. Back on the left, the same tools on the right, no logo and no section nav. Back returns to where you came from (or up one level if you landed there directly); the breadcrumb under it shows where the page sits. Never both bars on one page.
- **Breadcrumbs follow the levels:** "Overview › <batch>", "Overview › <batch> › <package>" (wherever it was opened from), "Overview › <batch> › <package> › <asset>" from a package or "Assets › <asset>" from the Assets list.
- **PageHeader** with **Breadcrumbs**, then the page's cards 16 apart. (The header's 24 bottom gap sits above the first tab row or card.) Lists of more than 10 end in a **ListFooter**.
- **SummaryCard** for counts at the top of a list; **ServicesBar** for the Overview's Services card.
- **ActivityList**, **DocumentList** and, on asset pages, **Timeline** ("History"): date first, newest first, an orange dot only on an event that still waits on the customer.
- **Buttons with icons:** a 16px icon on the left for actions; on the right only the chevron, on a button that goes to another page. **IconButton** for icon-only actions (Close, Download, More), always with a label that becomes its tooltip.
- **EmptyState** for anything with nothing to show, and **Banner** for errors and page-level messages.
- **Modal** for one short task (confirm a date). **Tooltip** on every icon-only button.
- **Theme:** light only, for now. There are no dark tokens; don't add half of one.

## Iconography

- Use the CQuel icon set under Icons through the Icon component, not lucide or emoji.
- The icons are drawn on a 24 grid with about a 2px line, rounded caps and a single colour. Every shape uses `icon-dark` (#4D5761) in Figma, and the SVG files carry that ink.
- Sizes are `icon-16` (buttons, inputs, table rows), `icon-20` (card headers, menus) and `icon-24` (empty states).
- Recolour with the icon roles: `icon-strong` beside a title, `icon-default` for muted icons, `icon-disabled`, `icon-white` on dark fills, and `icon-active` (orange) only for something that needs the customer.
- Icon-only buttons are square (40, 32 or 24) and always have a tooltip.

## Logo

- Use `cquel-logo.svg` from Logos, the CQuel wordmark. Use it as provided: never redraw it, recolour it or put it on a coloured ground. Keep at least the height of the "l" clear around it, and keep it 80px wide or larger.
- Its oranges (#FF4700 and #E9571F) belong to the logo only. Product UI orange is always `brand-6`.
- `cquel-compact.svg` is the old green compact mark. Don't use it.
