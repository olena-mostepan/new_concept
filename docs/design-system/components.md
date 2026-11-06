<!-- Exported from the CQuel design system artifact (version 35, 06 Nov 2026).
Source of truth: https://claude.ai/artifact/5TNiRyXkn3UDAK9GfsWRgZ — re-export after design-system changes; don't edit by hand.
In this folder: README.md (rules), components.md (every component), tokens.json, types.md (props), decisions.md (decisions and settled preferences). -->

# CQuel design system: components

One section per component: its rules and what the consumer provides. The prototype's versions are in `components/concept/ui.tsx`; types are in `types.md`.

## Contents

- [ActivityList](#activitylist)
- [AssetHeader](#assetheader)
- [Banner](#banner)
- [Breadcrumbs](#breadcrumbs)
- [Button](#button)
- [Card](#card)
- [ChangedDot](#changeddot)
- [CheckCard](#checkcard)
- [Checkbox](#checkbox)
- [Chip](#chip)
- [DetailBar](#detailbar)
- [DetailsGrid](#detailsgrid)
- [DocumentList](#documentlist)
- [EmptyState](#emptystate)
- [FactSelect](#factselect)
- [FilterBar](#filterbar)
- [FilterChips](#filterchips)
- [FilterSelect](#filterselect)
- [FormField](#formfield)
- [Icon](#icon)
- [IconButton](#iconbutton)
- [InfoDrawer](#infodrawer)
- [Input](#input)
- [KeyFigure](#keyfigure)
- [ListFooter](#listfooter)
- [Modal](#modal)
- [NeedsDecision](#needsdecision)
- [NeedsPanel](#needspanel)
- [PackageCard](#packagecard)
- [PackageStrip](#packagestrip)
- [PageHeader](#pageheader)
- [Pager](#pager)
- [PhaseStepper](#phasestepper)
- [PlanTrack](#plantrack)
- [Progress](#progress)
- [Radio](#radio)
- [ResponsibilityPill](#responsibilitypill)
- [SearchField](#searchfield)
- [Select](#select)
- [ServiceCards](#servicecards)
- [ServiceIcon](#serviceicon)
- [ServicesBar](#servicesbar)
- [StatusCard](#statuscard)
- [Steps](#steps)
- [SummaryCard](#summarycard)
- [Table](#table)
- [Tabs](#tabs)
- [Tag](#tag)
- [Textarea](#textarea)
- [Timeline](#timeline)
- [Tooltip](#tooltip)
- [TrendChart](#trendchart)
- [TypeLabel](#typelabel)
- [YourActionOnly](#youractiononly)

## ActivityList

"Recent activity": what happened lately, newest first.

### Rules
- In a flush Card titled "Recent activity", with "See all" as a link on the right. Five items at most.
- Each item: what happened in `h8` text-title, the detail in `p7` text-secondary, and on the right the date in `p7` text-tertiary, with the batch under it when the list spans batches.
- Short facts, no full stops, " · " between parts. Dates as "15 Oct".
- Empty: "Nothing here yet".

### The consumer provides
`items`: `[{title, text, date, aside}]`, `empty`.

---

## AssetHeader (retired)

Retired on 5 Nov 2026. The asset page uses **PageHeader** with `kind: 'asset'`: breadcrumb, type label, title, the facts row (Batch · Solution · Buildings · City) and the site photo as the aside. The bundle keeps `AssetHeader` as a thin alias to PageHeader so old code still renders; don't use it in new work.

---

## Banner

A message about the whole page or card: something failed, something is out of date, something to know before acting.

### Rules
- `radius-md`, padding 12/16, a 6px mark, a title in `h8` and a line in `p6` text-secondary. One link or button on the right at most.
- Types are status: `info`, `success`, `warning`, `danger`, plus `neutral` (grey). The ground is the status bg, never a solid fill and never orange.
- Errors say what went wrong and what to do: "We couldn't load the offers. Reload the page; if it keeps happening, tell your CQuel contact."
- Not for "Your action": that's the pill and NeedsDecision.

### The consumer provides
`type`, `title`, `children`, `action`.

---

## Breadcrumbs

Where a page sits, above its title.

### Rules
- `p6` text-secondary, a 14px chevron between items in text-tertiary. The last item is the current page in text-primary and isn't a link.
- **Follow the levels:**
  - Batch: "Overview › <batch>".
  - Package: always "Overview › <batch> › <package>", wherever it was opened from.
  - Asset: from a package, "Overview › <batch> › <package> › <asset>", with the Pager on the right of the same row. From the Assets list, "Assets › <asset>".
- On detail pages the breadcrumb sits under the DetailBar. Back returns to where you came from; the breadcrumb shows where the page sits.

### The consumer provides
`items`: `[{label, href}]`.

---

## Button

Buttons for actions and for the one way on from a page. Orange `primary` means the customer acts; dark `strong` means they go somewhere.

### When to use
- `primary` — the one action that moves the work on (Agree price, Share plan with customer). Only on pages where the customer acts.
- `strong` — dark fill (`black-7`, white text): the one way on from an orientation page, such as "Open package" (with the chevron icon) on an asset page. On orientation pages (Overview, asset, package Overview) it takes the place of `primary`, which doesn't appear there.
- `secondary` — every other action.
- `tertiary` — Cancel, low-emphasis actions beside a primary.
- `link` — See all, Show; inline navigation. Ink with an underline, never blue.
- `danger` — Remove, Delete. Danger text on white, never a red fill.

### Sizes
`large` 40 (page and form actions, drawers, card footers) · `default` 32 (inside cards and tables) · `small` 24 (inline beside a value: Edit, Remove).

### Icons
- `icon` adds a 16px icon (14px on `small`), 8 from the label (6 on `small`). The padding on the icon side drops by 4 so the button stays balanced.
- **Left** (default): actions — Download, Upload, Add, Edit, Remove.
- **Right** (`iconPosition="right"`): only `chevron-right`, on a button that goes to another page ("Open package", "View batch", "See all"). Never type "›" in a label.
- One icon per button. Never on a `link` button. Never a chevron on an action.
- Icon-only buttons are IconButton.

### The consumer provides
`children` (the label, sentence case), `icon`, `iconPosition`, `onClick` or `href`, `disabled`, `ariaLabel` when the label needs more context ("Open EV charging · Voltreny package").

### Focus
Every button gets a 2px black-7 outline, 2px out, on keyboard focus. The same outline marks focus everywhere in the product.

### Don't
- Don't put two primary buttons, or two strong buttons, on one screen.
- Don't put a strong and a primary button on the same page.
- Don't put buttons in rows on customer screens; the whole row is the link.

---

## Card

The one container: white, border-dark, radius-lg, no shadow, with an optional header and footer.

### Anatomy
- Header 12/16 with an `h7` title, a border-light line and an optional right slot (a Link button, meta or a Small button).
- Body padding 16, or `flush` for tables that run edge to edge.
- Footer (optional): a `bg-container-grey` strip under a border-light line, 12/16, with a line on the left and at most one link or button on the right ("See all 5", "Open … package ›").

### States
- Empty: an EmptyState line ("Nothing here yet") in the body. A card that would only ever say that can be left out.
- Error: a Banner in the body, not a red card.

### The consumer provides
`title`, `action` (a node for the right slot), `flush`, `footer`, `children`.

### Don't
- No shadow, no coloured left border, no nested cards.

---

## ChangedDot

A 6px `brand-6` dot that marks something changed or new for the customer.

### Rules
- **On a row:** it means the package, asset or project changed in the last 7 days. It's centred on the first line, 16px to the left of the name, inside the row's 32px left padding. Nothing else on the row changes. Its accessible label is "Changed in the last 7 days".
- **On a navigation tab or page tab:** something inside changed or is new, 6px after the label (see Tabs). Its accessible label is "New".
- **The key** ("• Changed in the last 7 days", `p7` text-secondary, the dot 6 before the words) explains the dot once per page, only when the page has rows that can carry it. It sits in the **top right corner** of the page:
  - detail pages (batch, package): on the breadcrumb row, right-aligned (PageHeader's `crumbAside`); the asset page has the Pager there and no key;
  - section pages (Assets, service lists): on the title row, right-aligned.
  Never under the facts, above a table, or inside a card.
- It's derived from dates; there's no last-seen tracking.
- It's never used for "Your action". That's the ResponsibilityPill.

---

## CheckCard

A selectable card for picking services or properties (ops drawers).

### Rules
Padding 12, radius-md, border-dark; selected is a 1.5px black-7 border and a checked box. Title `h8`, line `p7` text-secondary. 240 wide, in a 2-column grid.

### The consumer provides
`title`, `line`, `selected`, `onClick`.

---

## Checkbox

A 16px box, radius-sm. Checked is black-7 with a white tick: ticking is a choice, not a call to action, so never orange.

### The consumer provides
`checked`, `onChange`, `label`, and `detail` for a two-line option (title `h8`, line `p7`).

---

## Chip

A small pill that marks where something is (display) or chooses what a list shows (filter).

### Display chip (no `onClick`)
- 24 high, `radius-full`, `h9`. Not clickable: no hover and no focus.
- **`lead: 'done'`**: white fill, a 1px `border-dark` border, label `text-title`, a 14px round tick in front (a filled `black-7` circle with a white tick).
- **`lead: 'now'`**: `bg-accent` fill, a 1px `border-accent-strong` border, label `text-primary`, the 6px `brand-6` dot in front. Only where work is under way.
- **`lead: 'next'`**: a 1px dashed `black-4` border, label `p7` text-tertiary. Its fill is the surface it sits on (`--cq-surface`: white by default, `bg-container-grey` inside a grey panel or a `cq-on-grey` wrapper), so a track line stops at its edge.
- One look on white and on grey: nothing changes with the background.
- **`size: 'big'`** (32 high, `h8`, `p6` for next, 16px tick, 12 side padding): a package's services (PackageCard, package Overview card), so they outrank the 24px steps and phases under them. Same height as the filter chip and the big Tag.
- `count` adds " · 3" after the label ("Installation · 1").
- Used for a package's services (PackageCard, the package Overview card), steps (Steps) and delivery phases (PhaseStepper).

### Filter chip (with `onClick`, a button)
- 32 high, `radius-full`, 12 side padding, `p6`, white with a 1px `border-dark` border, the count after the label in text-tertiary.
- Hover: `bg-container-grey`. Focus: the 2px `black-7` outline.
- **Selected:** `black-7` fill and border, label `h8` and count in white. This is the one black pill in the system.
- Used by FilterChips.

### Rules
- A chip with `onClick` is a filter; without it, a display chip. **A display chip is never clickable** and never switches anything: to move between services, use the page's tabs.
- Orange only on the `now` display chip.
- Not a Tag: Tag stays for categories and status inside rows; ResponsibilityPill stays "Your action".

### The consumer provides
`children`, `lead`, `size`, `count`; for a filter `selected` and `onClick`.

---

## DetailBar

The slim top bar on detail pages: Back on the left, the account tools on the right. It replaces the app header and section nav there.

### Where it goes
- **Detail pages:** batch, package and asset pages, and anything else you open from a list (ops batch pages too).
- **Section pages** (Overview, Assets, the five service lists, ops Portfolio and Workstreams) keep the app header with the customer logo and the section nav.

### Rules
- White, 64 high, `border-dark` line under it, page side padding (32). Sticky at the top.
- **Back:** the `arrow-left` icon (16) and "Back" in `h8` text-primary, 6 apart. Hover underlines it; focus is the 2px black-7 outline.
- **Where Back goes:** to the page the person came from (a list, a service page, the package). If they landed on the page directly (a link, a refresh), to the parent level in the breadcrumb.
- **Right:** the same tools as the app header, in the same order: Questions, the Customer/Ops switch (prototype only), the avatar. On ops, no "Create batch" here.
- **No** customer logo, account name, section nav or page actions in the bar. Page actions belong in the page.
- Under it, the page starts with PageHeader: the breadcrumb says where the page sits and lets you jump up any level. Back means "return"; the breadcrumb means "where am I". Keep both.

### The consumer provides
`backHref` or `onBack`, `backLabel` ("Back" by default), and the tools as `children`.

---

## DetailsGrid

Label-over-value facts inside a card: contract details, this asset's figures on a service tab, an ops record.

### Rules (the same as PageHeader's facts row)
- Each fact: the label in `p7` text-tertiary, 2 above the value in `p6` text-primary.
- Optional third line inside cards only: `detail`, in `p7` text-secondary, 2 below the value ("from the site check"). Never in page headers.
- Facts sit in a row: each at least 160 wide, 40 between facts (measured from the end of the wider line), 16 between rows when they wrap. Short facts therefore start on a 200 rhythm, so facts line up from card to card and with the page header.
- A fact with no value is left out; with none left, nothing renders.
- Links (batch, package) are underlined.
- In page headers, PageHeader draws the same row itself; don't put a DetailsGrid there.

### The consumer provides
`items`: `[{label, value, detail?, href?}]`.

---

## DocumentList

"Documents": the files on a package, batch or asset.

### Rules
- In a flush Card titled "Documents", with "See all" on the right. 5 rows at most.
- Each row: the document name in `h8` text-title. Under it, the file type as a neutral Tag, size `xsmall` ("PDF", "3 PDF", "23 files"), and then the date or detail in `p7` text-secondary ("signed 6 Aug", "Jan–Dec 2025").
- On the right, one tertiary IconButton: `download` for a file, `chevron-right` (View) for a set that opens a list. Its label names the file ("Download Contract · Voltreny").
- One list, newest first. No grouping by who sent it; a file the customer sent says so in its name or detail ("Site plans · you sent 14 May").
- Package files on an asset page carry "package" in the detail ("PDF · package · 2 Aug").
- Empty: hide the card on an asset page; elsewhere "Nothing here yet".

### The consumer provides
`items`: `[{name, type, meta, action: 'Download'|'View', href}]`, `empty`.

---

## EmptyState

What a card or list says when it has nothing to show.

### Rules
- One `p6` line in text-tertiary that says what's missing, in the product's words: "Nothing here yet", "No assets match “Kerv”", "No packages here yet".
- When a filter caused it, add the "Clear filters" link on the right.
- No illustrations, no icons, no exclamation marks. A card with nothing in it may also be left out, when the page reads fine without it (NeedsDecision).

### The consumer provides
`children` (the line), `action`, `inCard`.

---

## FactSelect

A fact whose value switches what the page shows. Today only the asset's Package: an asset's data belongs to a project (this asset in one package), so the page picks a package first.

### Rules
- It lives in PageHeader's facts row, as the first fact. Pass it as `{label: 'Package', select: {options, value, onChange}}`; PageHeader renders the label and the control.
- **One option:** a plain fact. No chevron, no count.
- **Several live options:** the label reads "Package · <i> of <n>". The value is a button: the name in `p6` plus a 16px `chevron-down`, 6 apart. Hover and open: `bg-container-grey` behind it, `radius-sm`, padding 2/6 with matching negative margin so the text doesn't move. Focus: the 2px `black-7` outline.
- **One live option plus earlier ones:** no count, but the chevron shows, because there's history.
- **Menu:** 8 under the value, left-aligned, 330 wide, white, `border-dark`, `radius-md`, `elevation-floating`, padding 6. Each row: the package name in `p6` (selected: `h8` on `bg-container-grey`) over a `p7` text-tertiary line with its current service ("Tender"), "Complete" or "Closed". Order: the selected one first, then most recent activity.
- **Earlier:** packages the asset has left, and closed packages, under an "Earlier" label (`p7` text-tertiary) and a `border-light` line, in text-secondary. Their line uses the move wording ("Left 28 Aug · dropped", "Closed"); never a reason. Picking one opens it read-only.
- **Keyboard:** listbox behaviour. Arrow keys move, Enter picks, Esc closes and returns focus to the value; a click outside closes it.
- Screen-reader name: "Package: <name>. <i> of <n>. Change package".
- Picking a package switches the facts that follow it (In package, Batch), the tab row and the PackageCard. History and Documents stay for the whole asset.

### The consumer provides
`options: [{id, name, line, earlier}]`, `value`, `onChange(id)`, `label`.

---

## FilterBar

The row of search and filters above a list.

### Anatomy
- Order, left to right: SearchField, then FilterSelects in a fixed order (Batch, Service, Solution, any service-specific filter).
- Responsibility: on customer screens a YourActionOnly checkbox after the selects; on ops screens a Responsibility FilterSelect, last.
- On Assets, solution is FilterChips above the bar instead of a select, so the bar is Search · Batch · Service.
- Then the "Clear filters" link, and on the far right the aside, e.g. the ChangedDot key "Changed in the last 7 days".
- One grid that spans the content width: search 1.5fr, each select 1fr, then an auto column for Your action only and one for Clear filters. 16 between fields, aligned to the bottom so the labels sit on one line. Every control is 40 tall.
- The key ("Changed in the last 7 days") sits on its own line, right-aligned, 12 under the row and 8 above the table.
- 24 below the summary cards.

### Behaviour
- Filters apply immediately and live in the URL, so a filtered view can be shared.
- "Clear filters" shows only when something is set, and resets every field, the search and any FilterChips.
- When no row matches, the list shows an EmptyState ("No packages match") with "Clear filters" again.
- On phones the search takes the full width and the selects wrap below it.

### The consumer provides
- `children`: the SearchField and FilterSelects.
- `onClear`: when any filter is set.
- `aside`: the right-hand key.

---

## FilterChips

A row of pill chips with counts that filters a list by one value at a time; on Assets it filters by solution.

### Rules
- **Placement:** between the page header and the FilterBar, 12 above the filters. The chips replace that filter's select, so the FilterBar on Assets is Search · Batch · Service.
- **Chips:** "All <n>" first, then one chip per value present, by count high to low, then A–Z. Hide a chip whose count is 0 unless it's selected.
- **Counts:** the rows that chip would show with the other filters applied, so counts stay honest while filtering. An asset with two solutions counts once in each.
- **Style:** 32 high, 12 side padding, `radius-full`, `p6`. Unselected: white, `border-dark`, count in text-tertiary. Selected: `black-7` fill, label `h8` and count in white. FilterChips renders filter Chips (see Chip).
- Ink, never orange: the selected chip says where you are in the list, not that something needs you.
- **Behaviour:** single-select. Choosing a chip writes the URL (`?solution=<id>`); "All" clears it, and so does "Clear filters".

### The consumer provides
- `options`: `[{id, label, count}]`, with `id: ''` for All.
- `value`, `onChange(id)`.
- `label`: the accessible name ("Solution").

---

## FilterSelect

A labelled dropdown that filters a list (Batch, Service, Solution, Responsibility).

### Anatomy
- Label above in `h9` text-title, 4 above the control.
- Control 40 tall: the standard field height, the same as form inputs and Large buttons. Radius-md, border-dark, white. Padding 0 32 0 12, with the chevron at right 10.
- In a FilterBar it fills its grid column, so the row spans the same width as the table below.

### Values
- The first option is the "all" value, named after the field ("All batches", "All services", "All solutions"; "All" for Responsibility).
- Options are sentence case and in a stable order. Responsibility reads Your action / CQuel's action / Suppliers' action / Done.

### States
- **Default value:** text in text-title, border border-dark.
- **Chosen value:** text in text-primary, border black-6. You can see at a glance which filters are on.
- **Hover:** border black-4. **Focus:** black-6 + focus-ring.

### When to use which
- **FilterSelect:** in filter bars, with up to about 10 options.
- **Select:** in forms, inside a FormField.
- **Combobox:** more than about 10 options, or the person will want to type.

### Rules
- Always a visible label. Never show the field name as the placeholder value inside the box.

---

## FormField

Label, field and hint as one unit.

### Rules
Label `h8` in text-title; hint `p7` text-secondary; error message `p7` text-error under the field. 4 between each part; stack fields 12 apart. Optional fields say "(optional)" in the label.

### The consumer provides
`label`, `hint`, `error`, `children` (an Input, Select or Textarea), `width`.

---

## Icon

An icon from the CQuel set, drawn in the current text colour.

### Rules
- Use these icons, never lucide or emoji. Names match the files under Icons (`chevron-right`, `search`, `ev-charging`).
- Sizes: `icon-16` in buttons, inputs and table rows; `icon-20` in card headers and menus; `icon-24` in empty states.
- Colour comes from the text around it, or from `role`: `strong` beside a title, `default` for muted icons, `disabled`, `white` on dark fills, `active` (orange) only for something that needs the customer.
- An icon beside a label is decorative and hidden from screen readers. An icon on its own gets a `label`, and an icon-only button also gets a Tooltip.

### The consumer provides
- `name`, `size`, `role`, `label`
- Outside this design system, copy the SVGs into one folder and set `CQuelDS.iconBase = '/icons/'`.

---

## IconButton

A square button with only an icon, for small repeated actions: Close, Download, More actions, Filters, Edit.

### Rules
- Sizes: `large` 40 (20px icon), `default` 32 (16px), `small` 24 (14px, `radius-sm`). Others use `radius-md`.
- `secondary`: white with the `border-dark` border. `tertiary` (default): no border, the icon in `icon-default`; hover fills `bg-container-grey` and darkens the icon to `icon-strong`.
- Never primary, strong or danger. An action that moves the work on gets a Button with a label.
- `label` is required: it shows as the Tooltip on hover and keyboard focus and is the screen-reader name.
- InfoDrawer and Modal use it for Close (tertiary, default).

### The consumer provides
`icon`, `label`, `type`, `size`, `onClick` or `href`, `disabled`.

---

## InfoDrawer

**Unused (5 Nov 2026).** No page opens it now: page headers carry their facts in PageHeader's facts row, and nothing says "See info". It stays in the design system for a future secondary lookup; check with Olena before using it.

A right-side panel with an item's details, for facts that don't belong on the page itself.

### Where it goes
- Customer package and asset pages don't use it. Their headers show what matters on the page: batch, package and asset pages use PageHeader's facts row, and nothing says "See info".
- Use it for secondary lookups: an ops record's details, or a row's details on a list where opening a page would lose the user's place.
- Open it from a secondary button or a row, never from the page title.

### Rules
- The panel is 400px wide, white, with `elevation-overlay` and the `bg-scrim`. It closes on the Close IconButton (tertiary, default), Esc and a click on the scrim.
- The title is "<name> · info" in `h6`.
- Rows are a label in `p7` text-tertiary over a value in `p6` text-primary, with `border-light` between rows. Only facts the platform holds; no staff names on customer screens.
- The footer holds one quiet link at most, such as "View batch".

### The consumer provides
- `title`
- `items`: `[{label, value}]`
- `footer`
- `open`
- `onClose`
- `inline` (for previews)

---

## Input

The field box. Default 40, the standard height for every field, including filter bars. `small` 32 only for a dense toolbar inside a card.

### States
Border border-dark; hover black-4; focus black-6 with a 3px black-2 ring (no orange); `error` danger mark border; `disabled` bg-container-grey with text-tertiary (no opacity fade). Placeholder text-tertiary. `search` adds the search icon in icon-default.

### The consumer provides
`value`/`defaultValue`, `placeholder`, `onChange`, `size`, `error`, `disabled`, `search`.

### Labels
Every field has a visible label: wrap it in a FormField (forms) or use SearchField / FilterSelect (filter bars). A placeholder is a hint, never the label.

---

## KeyFigure

A number that is the point of its block (an estimate, a total).

### Rules
`size="big"`: the number in `h3` 32/40 with tabular figures, the label `p7` text-secondary under it. `size="default"` is a label-over-value pair (the same as a Details item). Use Big only where the number is the point.

### The consumer provides
`value`, `label`, `size`.

---

## ListFooter

The last row of a long list: how many are showing, and a way to show the rest.

### Rules
- Lists show the first 10. The footer says "Showing 10 of 36" in `p7` text-tertiary, with a secondary "Show all 36" button on the right.
- Once open, the footer reads "36 assets" and the button goes.
- It sits inside the list's Card, under a `border-light` line, padded 12/16. With 10 or fewer rows there's no footer.

### The consumer provides
`total`, `limit`, `open`, `onOpen`, `noun`.

---

## Modal

A small task that needs focus, such as confirming or changing a date.

### Rules
- 480 wide, white, `radius-lg`, `elevation-overlay`, on the `bg-scrim`. Closes on the Close IconButton, Esc and a click on the scrim.
- Header 20/24: the title in `h5`, then one `p6` text-secondary line saying what it's about ("Installation · Kervelstraat 14"). Body 20/24 with fields 12 apart. Footer 16/24 with the buttons on the right: tertiary "Cancel", then one primary that names the action ("Confirm date").
- Use it only for one short task. Reading belongs on the page, and long forms on their own page.

### The consumer provides
`open`, `title`, `subtitle`, `children`, `footer`, `onClose`.

---

## NeedsDecision

The "Needs your decision" card on the customer Overview: the three newest packages waiting on the customer, and a way to the rest.

### Rules
- **When:** only when at least one package is with the customer. With none there's no card and no empty state.
- **Placement:** a flush Card under "Find an asset" (or under the title when search is hidden), above the Services bar.
- **Header:** "Needs your decision", with "<n> packages" in text-tertiary on the right.
- **Columns:** PACKAGE · NEXT STEP · pill · chevron.
  - Package: the name in `h8` text-title, then "<batch> · <n> assets" in `p7` text-tertiary. The ChangedDot sits in the 32 left padding.
  - Next step: the main part in `h8`, the detail under it in `p7` text-secondary ("Choose a supplier" / "results sent 13 Oct"). No detail, no second line.
  - The "Your action" pill, then the chevron. The whole row links to the package.
- **Rows:** newest change first, then A–Z. Three at most, and no expand in the card.
- **Footer:** only when there are more than three: "Showing 3 of <n> · newest first" in `p7` text-tertiary, and a "See all <n>" link to the packages list filtered to Your action.
- It's orientation: no buttons that do work.
- On service pages the Table groups still apply: Needs your decision / In progress / Passed through.

### The consumer provides
- `rows`: `[{package: {main, detail}, next: {main, detail}, href, changed}]`, sorted newest first.
- `total`, `countLabel` ("5 packages")
- `seeAllHref`

---

## NeedsPanel

What we still need, under a route service or a package step.

### Rules
- Your action: solid light border, white. CQuel's action or suppliers: dashed border-dark. Received: bg-container-grey.
- Each need: a 6px mark, a title and a second line saying who it's with, ending with a date. Your action gets the brand-6 mark and `h8`; others `p6` text-title; received text-tertiary.
- No caps heading: the lines say who it's with.

### The consumer provides
`needs`: `[{title, line, owner: 'you'|'cquel'|'suppliers'|'received'}]`.

---

## PackageCard

On the asset page's Overview tab: the selected package at this asset. Where this asset is, the way to the package, and this asset's steps in the current service. One card, for the package picked in the header's Package fact (FactSelect).

### Rules
- White, 1px `border-dark`, `radius-lg`, padding 16/20/20. 16 under the tab row.
- **Head row:** the package's services as big display Chips (32px, 8 apart): every service it went through, done ones as done chips and the current one as the now chip ("Estimates ✓ · • Tender"). Never only the current one. **Display only: chips never switch anything**; the tabs do.
- **Right, vertically centred:** ServiceIcon at 72 (inline), 12 gap, "This asset is in" in `p7` text-tertiary over the service in `h4`, then the large `strong` Button "Open package" with the chevron on the right. Its screen-reader name is "Open <package> package".
- No "Package" label and no package name in the card: the header names the package.
- **Panel:** a `bg-container-grey` box 16 under the chips, `radius-md`, padding 12/16/16, titled "<Service> at this asset" in `h8`, with an aside in `p7` text-tertiary (the date, or "Voltreny · contract €26k" on Delivery). It holds that service's **steps for this asset**:
  - Delivery: PhaseStepper (Start to Handover).
  - Every other service: Steps, with the service's step list (see Steps).
  - The asset's figures (cost, payback, price…) are on the service tabs, not here.
- **Variants (only these two):**
  - **Completed:** "This asset is" over "Complete", the Delivery icon, every chip done, no panel. The button stays: the package still holds the results.
  - **A package the asset has left** (no `service`): its chips, its panel and "Open package"; no ServiceIcon and no "This asset is in". Nothing replaces them: the header's In package fact already says "Left 28 Aug · dropped".
- Never: offer counts, the brief, supplier matching, other assets.
- Replaces PackageStrip (retired 5 Nov 2026).

### The consumer provides
`name` (for the button's screen-reader name), `service` (omit for a package the asset has left), `completed`, `services: [{id, label, lead}]`, `href`, `title`, `aside`, and the steps as `children`.

---

## PackageStrip (retired)

Retired on 5 Nov 2026. The asset page picks one package in the header (FactSelect on the Package fact) and shows it in a **PackageCard**: chips, "This asset is in <service>", "Open package ›" and this asset's panel. The bundle keeps `PackageStrip` as an alias to PackageCard so old code still renders; don't use it in new work.

---

## PageHeader

One header for the batch, package and asset pages: breadcrumb, type label, title, facts, and one thing on the right. The component owns the spacing, so the three pages can't drift.

### Order and spacing (fixed by the component)
| From | To | Gap |
|---|---|---|
| Breadcrumb row (20 high; the Pager on its right) | Type label | 24 |
| Type label row (20 high) | Title (`h4`) | 4 |
| Title | Facts row | 16 |
| Header | Whatever comes next (tabs, strips, service cards) | 24 |

### Rules
- **Type label:** TypeLabel for `kind` 'batch', 'package' or 'asset'. Its "i" never makes the row taller.
- **Facts row:** each fact is a label in `p7` text-tertiary, 2 above a value in `p6` text-primary. Each fact is at least 160 wide; 40 between facts (from the end of the wider line), 16 between rows when they wrap. The same rule as DetailsGrid, so facts line up on every page. Two lines only: no source line. A fact with no value is left out; with no facts, the row is left out.
- **Facts per page:**
  - Batch: Goal · Solution · Assets · Packages · Target (only when set, "Dec 2027", never shown as late).
  - Package: Batch · Solution · Assets · Supplier (once chosen).
  - Asset: Package · In package · Batch · City, on one row. Package is a FactSelect when the asset has more than one package (or earlier ones); the other facts follow the selected package. In package uses the move wording (see the README's Moves): "Since 1 Sep", "Joined 4 Nov", "On hold since 2 Oct", "Left 28 Aug · dropped". No Solution (the batch has one) and no Buildings (an asset is always 1).
- **Aside:** on the right, top-aligned with the type label, 32 from the left block, which takes the remaining width.
  - Package: StatusCard.
  - Asset: the site photo, 260×164, `radius-lg`, cropped to fill, only when we hold one. No placeholder.
  - Batch: none.
- No meta line, no "city · batch" line, no "See info", no details grid.
- Pages with the section nav (Overview, Assets, service lists) use the same component without `kind` and `facts`: breadcrumb (if any) and title.
- Detail pages (batch, package, asset) sit under a DetailBar, not the section nav.

### The consumer provides
`crumbs`, `crumbAside` (the Pager), `kind`, `title`, `facts: [{label, value} | {label, select: {options, value, onChange}}]`, `aside`.

---

## Pager

Previous and next between the assets of one package, on the breadcrumb row of an asset page.

### Rules
- **When:** only when the asset page was opened from a package. From the Assets list, search, a batch or a service there's no pager. With one asset in the package there's none either.
- **Order:** the order of the package page's Assets card. It doesn't wrap around.
- **Placement:** the breadcrumb row, aligned right, in `p6`: "‹ <previous asset>   2 of 6 in this package   <next asset> ›".
- Previous and next are links in text-primary that keep the package context, so the breadcrumb and the pager stay. Long names truncate at 200.
- The middle text is text-tertiary.
- **At the ends:** "Previous" or "Next" in `text-disabled`, not a link.
- **Keyboard:** `[` and `]` go to previous and next when focus isn't in a field. The links are labelled "Previous asset in this package" and "Next asset in this package".

### The consumer provides
- `index`, `total`
- `prev`, `next`: `{label, href}`, or nothing at an end
- `context` ("in this package") and `noun` ("asset")

---

## PhaseStepper

Delivery phases, Start → Complete, as display Chips on a track, each date with where it comes from.

### Phases
- A package's Delivery steps: Start → Design & survey → Installation → Commissioning → Handover → Complete (use Steps on the package Overview).
- On an asset page ("Delivery at this asset", inside a PackageStrip): the first five, Start to Handover.

### Rules
- Done phases: `lead: 'done'`. The phase in progress: `lead: 'now'`. Later phases: `lead: 'next'`. No numbered circles.
- Under each chip: the date in `p7` text-primary ("12 Aug"; estimates "Est. 4 Nov"), then its source in `p7` text-tertiary.
- **Start's source**, the strongest known: "Contract start date", "Contract signed", "LOI signed", or "From invoice · date to confirm". With none: "Estimate" for an estimated date, otherwise no line.
- **No date:** no line at all. Never a dash. The current phase with no date says "Date to confirm" in `p7` text-tertiary.
- **Other phases:** "Site check report", "From invoice · date to confirm", or "Estimate".
- A phase waiting on the customer (`needs-you`) shows "Confirm dates" with the orange dot under a plain chip.
- No buttons.
- The track line is 2px `border-dark`. Chips and line look the same on white and on a grey panel.

### Compact (table rows)
- `size="compact"` renders one Chip: the phase the asset is in (now), "Complete" (done) or "Start" (plain) when it hasn't started.
- The row's Status column says what needs doing ("Date to confirm", "Handed over 30 Sep", "Awaiting start"). No "confirm ›" in rows.

### The consumer provides
`phases`: `[{name, state: 'done'|'now'|'next'|'needs-you', date, source, action}]`, and `size`.

---

## PlanTrack

Ops plan state: draft → proposed → agreed → live, as four 6px dots.

### The consumer provides
`done`: 0–4. Pair it with a `p7` label ("Plan · proposed").

---

## Progress

A thin progress bar: 4 high, black-2 track, black-6 fill. Not orange: progress isn't a call to action.

### The consumer provides
`value`, `max`, `label` (`p7`, e.g. "3 of 5 projects").

---

## Radio

A 16px round choice; checked is a 5px black-7 ring.

### The consumer provides
`name`, `checked`, `onChange`, `label`.

---

## ResponsibilityPill

Marks a package or project that needs the customer: "Your action". On customer screens, that's the only responsibility shown.

### Rules
- **Customer screens (default `audience`):** only `you` renders. It's the accent pill: `bg-accent`, `border-accent`, `accent-hover` text, reading "Your action". Other owners render nothing, so a row that isn't with the customer is simply blank.
- **Ops screens (`audience="ops"`):** all four show. `cquel` and `suppliers` are Neutral, and `done` is grey.
- Never use status colours for responsibility, so it can't be confused with Overdue or To confirm.
- On customer screens the filter is a "Your action only" checkbox, not a Responsibility select.

### The consumer provides
- `owner`: `'you' | 'cquel' | 'suppliers' | 'done'`
- `audience`: `'customer' | 'ops'`

### Wording
- **Labels:** use them exactly as above.
- **Counts:** with a count, put the label first: "Your action: 2". Never "2 your action", "With you" or "Waiting on you".

---

## SearchField

A labelled search box for filter bars and lists.

### Anatomy
- Label "Search" above, `h9` text-title, 4 above the box.
- Box 40 tall: the standard field height, the same as form inputs and Large buttons. Radius-md, border-dark, white. In a FilterBar it fills its column (1.5× a select).
- 16 search icon in icon-default at left 12, 8 to the text.
- Placeholder names what you can search for ("Package or project name", "Address or city"), in text-tertiary.

### Behaviour
- Filters as you type (about 150ms after the last key). There's no submit button.
- Esc clears the box. The browser's clear "×" shows once there's text.
- No match: the list shows "No packages match “<text>”" with a "Clear search" link.

### States
Hover border black-4 · focus black-6 + focus-ring · disabled bg-container-grey.

### Rules
- Always a visible label. The placeholder is a hint, never the label.
- One search per list. It sits first in the FilterBar.

---

## Select

A native select in the field box, with the chevron at right 12.

### The consumer provides
`options` (strings or `{value,label}`), `value`/`defaultValue`, `placeholder`, `onChange`, `size`, `error`, `disabled`.

### Labels
Every field has a visible label: wrap it in a FormField (forms) or use SearchField / FilterSelect (filter bars). A placeholder is a hint, never the label.

---

## ServiceCards

Service filter cards on a batch page: they choose which assets the list below shows.

### Rules
- **Cards:** "All" first with the batch's asset count, then one card per service that has assets in the batch now, in service order. No card for a service with 0.
- **Content:** the service name in `h8`, the asset count in `h4` with tabular figures, and optionally "+<n> done" in `p7` text-tertiary when assets passed through that service. Nothing else.
- **Shape:** `radius-md`, 12/16 padding, equal columns 8 apart.
- **States:**
  - Default: white (`bg-container`) with the `border-dark` border.
  - Hover: `bg-container-grey`, same border.
  - Selected: white, same border, and a 4px `brand-6` bar along the top, inside the card and clipped by its radius. The content doesn't move.
  - Focus: the 2px `black-7` outline.
- Borders never turn dark. Never fill a card with orange or black.
- **Behaviour:** single select. Each card writes `?service=<id>`; "All" clears it. The Assets table below shows assets with a project in that service.

### On the batch page
- The batch page has two tabs under its header: "Assets (<n>)" and "Packages (<n>)". Recent activity sits under the tabs, on both.
- ServiceCards count **assets**, sit on the Assets tab only, and filter only that tab's table.
- "Dropped" and "Moved out" cards appear only when there are any, after the services, with label and count in text-tertiary.
- On the Packages tab, closed packages fold into one "<n> closed" row at the end.

### The consumer provides
- `options`: `[{id, label, count, done}]`, with `id: ''` for All
- `value`, `onChange(id)`

---

## ServiceIcon

The 3D illustration for a service. It shows where a package or asset is, nothing else.

### Rules
- Five icons, ids match the service ids: `indicative` (Estimates), `scope` (Planning), `tender`, `pricing`, `delivery`. 3D glass renders, transparent PNGs, about 230 square.
- An `<img>` with `alt=""` and `aria-hidden`: the service name always sits next to it in text.
- `object-fit: contain`, `filter: drop-shadow(0 10px 14px rgba(30,40,50,.12))`.
- **Two sizes only:** 116 (StatusCard) and 72 (PackageCard).
- **Only in StatusCard and PackageCard.** Never in tabs, chips, tables, filters, nav or service-tab cards.
- They're illustrations, not icons: the 24-grid line-icon rules don't apply, and the Icon component doesn't draw them.
- Outside the design system, set `CQuelDS.serviceIconBase` to a folder holding `<id>.png` (the prototype keeps them in `public/icons/services/`).

### The consumer provides
`service`, `size` (116 or 72).

---

## ServicesBar

The Overview's "Services" card: how many projects sit in each service, as one segmented bar.

### Rules
- Service names above in `h8`, the bar 40 tall with pill ends, the package count under each segment in `p7` text-tertiary. Each segment's width follows its project count, at least 120.
- Segments go from light to dark grey in service order (black-2 to black-6); Completed, when shown, is black-7. Counts are `h8` with tabular figures, white on the dark segments.
- Each segment links to its service. Hover and focus fill it black-7.
- Under the bar, in the card footer: "Your action: 3 packages" and a "See assets" link.
- Services with no projects are left out.

### The consumer provides
`services`: `[{id, label, count, line, href}]`, `completed`.

---

## StatusCard

On the package page, in PageHeader's aside: which service the package is in, and the one way into it.

### Rules
- White, 1px `border-dark`, 16 radius, padding 18/20 with 84 on the left, and a 30 left margin so the icon isn't clipped.
- ServiceIcon at 116: absolute, left −30, centred on the card's height, breaking out over the left border.
- Text: "This package is in" in `p7` text-tertiary over the service name in `h4`. No third line.
- On the right: the large `strong` Button with `chevron-right` on the right, named after the service. It opens that tab.

| Service | Button |
|---|---|
| Estimates | See estimates |
| Planning | See surveys |
| Tender | See offers |
| Pricing | See prices |
| Delivery | See delivery |

- **Completed:** "This package is" over "Complete", the Delivery icon, no button.
- **Closed** (Olena, 6 Nov): "This package is" over "Closed · <date>" in text-secondary, the icon of the service it closed in shown grey (grayscale, 70% opacity), no button. The only other variant.
- The tab of the current service carries the orange dot (see Tabs): it repeats where the package is.

### The consumer provides
`service`, `href`, `completed`, `closed`, `closedOn`.

---

## Steps

A package's or an asset's steps within one service, as display Chips on a track.

### Rules
- One equal column per step, a Chip in each, joined by a 2px `border-dark` line behind them.
- **Done step:** `lead: 'done'`.
- **Step with work under way:** `lead: 'now'` with the count in the label ("Info requested · 3"). Several steps can be "now" at once. Under it, one `p7` text-secondary line with when it started ("asked 16 Oct", "started 14 Oct") when we hold the date.
- **Later step:** `lead: 'next'`.
- **Delivery:** assets that haven't started sit on a plain Start chip with "3 awaiting start" under it; Complete with assets is a done chip with its count ("Complete · 2") and "last 7 Oct" under it.
- **On a package Overview:** no descriptions, no needs panels and no buttons.

### Step lists
The product uses one list per service (from `lib/concept/model.ts`):

| Service | Steps |
|---|---|
| Estimates | Data collected · Estimate · Presented · Decision |
| Planning | Gap found · Info requested · Survey booked · Survey done · Scope agreed |
| Tender | Brief ready · Shortlisted · Invited · Responses in · Results · Supplier chosen |
| Pricing | Supplier set · Price requested · Price received · Analysed · Decision · Contracting |
| Delivery | Start · Design & survey · Installation · Commissioning · Handover · Complete (PhaseStepper) |

### For one asset
- **States:** steps before the current one are done, the current one is now, the rest are next. When the asset has finished the service, every step is done.
- **The line under a step** comes only from data we hold: the estimate ("€80–95k"), the presented date, a decision ("No · 28 Aug"), the open gap, the survey date. Otherwise it's blank. Never write a line the data can't back.
- No counts for one asset.

### The consumer provides
`steps`: `[{label, state: 'done'|'now'|'next', count, line}]`

### On the package Overview
- One white Card (`border-dark`, `radius-lg`, padding 16/20/20), no title bar: the package's service chips first (big display chips, done and now), then 16 below a `bg-container-grey` panel (`radius-md`, padding 12/16/16) titled "<Service> for this package" in `h8`, with an aside in `p7` text-tertiary ("Voltreny · 6 assets"), and the Steps inside it.
- The same anatomy as PackageCard on the asset page ("Delivery at this asset"), minus the status on the right: the package page has the StatusCard in its header.
- No "Now" or other status word in the aside; the orange chip already says it. No card header bar and no second border inside the card.

---

## SummaryCard

A count at the top of a list page, such as "Your action 3 · of 7 in Tender". Up to three in a row.

### Rules
- White, `border-dark`, `radius-lg`, padding 16/20. Label `p7` text-secondary, number `h4` with tabular figures, line `p7` text-tertiary.
- The Your action card can be a filter toggle: pressed, it gets a 1.5px black-7 border, the same as the Your action only filter. Never orange.
- Three columns with 16 between them. A count of 0 still shows "0".

### The consumer provides
`label`, `value`, `line`, and for a toggle `onClick` and `pressed`.

---

## Table

Package, asset and project lists: a group header, column labels and light rows.

### Rules
- **Group header** (`h7` + count in text-tertiary): on service pages, Needs your decision / In progress / Passed through. On Delivery the last group is Completed. The Overview's "Needs your decision" is its own card (NeedsDecision).
- **Column labels:** `s3` capitals in text-tertiary, heavier but lighter.
- **Rows:**
  - Padding 12/16/12/32, at least 56 tall, `border-light` between rows, hover `bg-container-grey`.
  - Only the first column is SemiBold, in text-title. It can carry a meta line under the name in `p7` text-tertiary (`{main, detail}`).
  - Everything else is `p6`. Second columns and second lines are text-secondary.
  - Numbers are right-aligned in tabular figures.
- **ChangedDot:** sits in the 32 left padding. Rows with a dot sort first, then oldest change first.
- **Row action:** the whole row is clickable (`href`) and ends in a chevron column (`type: 'chevron'`). The link is the name in the first column, stretched over the row, so a screen reader reads a table of rows and cells, and the row reads as one link only once. Never put another link in a row (no linked batch names). On the batch Assets table, the PACKAGE column is plain text; the package is reached from the asset page. There are no View buttons and no action buttons in rows on customer screens; a pending step reads as text ("Waiting for your decision", "Date to confirm").
- **Next step:** a "main — detail" pair whose detail ends with a date ("Choose a supplier" / "results sent 13 Oct"). No "waiting N days".
- **Responsibility column:** the `owner` column shows only "Your action" on customer screens.
- **Card:** put the table in a `flush` Card.

### IN PACKAGE column (package page, Assets table)
- Columns: ASSET · STEP · IN PACKAGE · chevron.
- Shown only when some asset has joined, left or is on hold, or the package is closed. Otherwise the table has no such column.
- Values use the move wording (see the README's Moves): "Since 1 Sep", "Joined 4 Nov", "On hold since 2 Oct", "Left 28 Aug · dropped". A second line, only here, names the other package ("Solar PV DE"); never a reason.
- Rows that left are `muted`; their STEP is the step they left at.
- Order: joined first, then the rest, then on hold, then left.

### Heading alignment
- The heading row and the body rows share one grid template and the same padding (12/16/12/32), so each label sits exactly over its column. Never give the heading row its own widths or padding.

### States
- **Empty:** one line under the column labels, "Nothing here yet" or the list's own words (`empty`).
- **Filtered to nothing:** an EmptyState with "Clear filters".
- **Passed through or completed rows:** `muted`, all text in text-tertiary.
- **Long names:** wrap; never truncate a name in a table.
- **More than 10 rows:** a ListFooter.

### The consumer provides
- `title` and `count`.
- `columns`: `[{key, label, width, type}]`, where `type` is `title | text | twoLines | owner | chevron | number`. `action` is kept for ops. `emphasis: true` sets a twoLines main part in `h8`.
- `rows`: objects keyed by column.
  - `href` makes the row a link.
  - `changed: true` adds the dot.
  - `twoLines` cells are `{main, detail}`.

---

## Tabs

The sections inside one page, such as Overview · Estimates · Brief · Tender results.

### Rules
- **On the package page,** one tab row is the whole navigation: Overview, then content tabs in service order, each shown only when it has data: Estimates, Survey, Brief, Supplier matching, Tender results, Pricing, Contract, Delivery.
- No tab for a planned or not-required service. Only Supplier matching and Tender results carry a count ("Tender results (8)").
- Never two tab rows on one page.
- **The package Overview** holds the Steps of the current service, the Assets table, and Recent activity with Documents side by side, once for the whole package. Service tabs don't repeat them.
- Labels are `p6` text-secondary; hover text-primary. The active label is `h8` text-primary, with a 2px `brand-6` underline.
- **Spacing:**

| Part | Value |
|---|---|
| Header to the tab row | 24 (PageHeader's bottom gap) |
| Label (20 high) to the underline | 12: each tab is 32 high, text at the top |
| Between tabs | 32 |
| Underline | 2px `brand-6`, exactly the width of the label (and dot), no side padding; it sits over the row's line |
| Row line | 1px `border-light`, full width |
| Dot | 6px, 6 after the label, centred on the 20px line |
| Tab row to its content | 16 |

- A long row (six tabs) never wraps on desktop; if it ever needs more room, shorten labels rather than the gaps.
- A count goes in brackets after the label: "Offers (8)".
- **The dot** (6px `brand-6`, after the label) keeps both meanings of orange: where you are, or what's new. It's only a dot: no number, no text.
  - On the package and asset pages it marks **the current service** (`current`), the same service the StatusCard or PackageCard names. Accessible label "Current service".
  - Elsewhere it marks a tab holding something the customer hasn't seen yet (`isNew`). Accessible label "New".
  - Never both on one tab.
- **On the asset page,** tabs are scoped to the package picked in the header (FactSelect): Overview, then each service of that package the asset went through, in service order. The current service gets the current-service dot. Switching the package rebuilds the row.
  - **Overview:** the PackageCard (with the current service's steps), then History (Timeline) and Documents (DocumentList).
  - **A service tab:** one Card "<Service> at this asset" with the date on the right, or "From <package> · <date>" for a phase that came from an earlier package. Inside: Steps (PhaseStepper for Delivery), then 20 below a DetailsGrid of the asset's figures — Estimates: Cost · Payback · Your decision; Planning: Open gap · Survey · Scope; Tender: Supplier (once chosen) · Price for this asset · Site check; Pricing: Price · Analysis · Your decision; Delivery: none.
  - Never on the asset page: offer counts, the brief, supplier matching, other assets.
- Keyboard focus: a 2px black-7 outline.
- Each tab shows one section. Never put actions in a tab label.

### The consumer provides
- `tabs`: `[{id, label, current, isNew}]`
- `value`
- `onChange(id)`

---

## Tag

Pills for categories and status. Types are named by meaning, never by colour.

### Types
- `neutral` — facts and categories: solution, property type, service.
- `accent` — a CQuel highlight, and the "Your action" pill.
- `strong` — retired. Don't use black pills; use `neutral`.
- `info`, `success`, `warning`, `danger` — status, always with `dot`. Status is never a solid fill.

### Sizes
`xsmall` 20 (a detail inside a list row, such as a document's file type) · `small` 24 (lists, tables) · `big` 32 (page headers).

### The consumer provides
`children` (sentence case), `type`, `size`, `dot`.

---

## Textarea

Multi-line text. Same states as Input; at least 88 tall (4 lines), padding 8/12, no resize handle.

### The consumer provides
`value`/`defaultValue`, `placeholder`, `rows`, `onChange`, `error`, `disabled`.

---

## Timeline

"History" on an asset page: the asset's own events, newest first, date first.

### Rules
- Each event: the date in a 52px column (`h9` text-title, right-aligned), a 16px rail, then the event in `h8` with its detail under it in `p7` text-secondary. 16 between events.
- Rail: an 8px `black-4` dot per event, joined by a 1px `black-3` line; no line after the last.
- An event that still waits on the customer (`you`: a date to confirm, a decision) gets a `brand-6` dot with a 3px `bg-accent` ring. Once it's settled, the dot goes grey. No other orange.
- The year in `s3` text-tertiary above the first event of each year (once, when all share a year).
- Up to 5 events in the card, then "See all" in the card header.
- **Moves:** "Joined package", "Left package · <how>" or "On hold", with the package name as the detail line. Never a reason.
- With two or more projects, the detail starts with the solution ("EV charging · …"). Ranges keep their dash: "€23–28k".
- **Empty:** hide the card (the asset page doesn't show empty History).

### The consumer provides
`items`: `[{event, detail, date, year, you}]`, newest first.

---

## Tooltip

A short label for something that has no visible text, such as an icon-only button.

### Rules
- `p7` white on black-7, padded 4/8, `radius-md`, `elevation-floating`, 8 above the trigger. Shows on hover and keyboard focus.
- A few words, no full stop. Never the only place important information lives.
- **Definition variant** (`variant: 'definition'`): `p7`, up to 300 wide, padding 8/12, short sentences allowed, the term in `h9` on the first line. Same colours and elevation. Only for TypeLabel; everything else keeps the short-label rule.
- Every icon-only button has one.

### The consumer provides
`content`, `children` (the trigger), `variant`.

---

## TrendChart

Momentum: how many services have started and finished over time, as two cumulative lines.

### Rules
- In a Card titled "Momentum". The legend sits above the plot, in `p7` text-secondary.
- **One accent series:** the line that shows the work moving (Started), `brand-6`, 2.5px, with a soft fill under it (`brand-6` at 16% fading to 0). Its legend key is a 3px orange bar.
- **The other series** (Finished): `black-7`, 2px, dashed 4/3. No fill.
- **Grid:** horizontal `border-light` lines only; 5 even y ticks from 0. Axis labels `p7` text-tertiary, tabular figures. No axis lines or tick marks.
- **Focus** (hover, or `active` for a fixed month):
  - A dashed `black-3` guide at the month.
  - The month's x label turns text-primary.
  - The accent point is a 4.5px `brand-6` dot with a 2px white ring and an 8px `brand-1` halo. Other points are a 4px `black-7` dot with a white ring.
  - A tooltip with `elevation-floating`, no border, `radius-md`. The month in full (`h9` text-tertiary), then one row per series: its key, the name in `p7` text-secondary, and the value in `h8` text-primary, right-aligned. It sits on the side of the guide that has more room.
- Orange is for one line only. Never two accent series.

### The consumer provides
`labels` (short month labels), `longLabels` (for the tooltip, for example "September 2026"), `series: [{name, values, accent}]`, `height` (224 by default), `active`, `label` (for screen readers).

---

## TypeLabel

Says what kind of thing a page is, above its title, with a definition one hover away.

### Rules
- "BATCH", "PACKAGE" or "ASSET" in `h9` text-tertiary, 0.06em tracking, then an `info` icon button (tertiary, small, 14px icon), 8 apart.
- **The row is 20 high.** The 24px button overhangs by 2 above and below; it must never make the row taller.
- Hover or keyboard focus shows the definition in a Tooltip, `definition` variant.
- The button's accessible name: "What is a batch?" / "What is a package?" / "What is an asset?".
- **Definitions:**
  - Batch: "Assets grouped around one goal. A batch can hold several packages."
  - Package: "Assets that go through the services together. One service at a time."
  - Asset: "A building or site you own."
- Only in PageHeader.

### The consumer provides
`kind`: 'batch' | 'package' | 'asset'.

---

## YourActionOnly

The customer's one responsibility filter: a checkbox in the FilterBar, "Your action only".

### Rules
- Sits after the selects, before Clear filters, aligned to the 40px controls. Checked: a black-7 box with a white tick. Never orange.
- It's the same filter as pressing the Your action SummaryCard; the two stay in sync and live in the URL (`?responsibility=you`).
- Ops screens use a Responsibility FilterSelect instead.

### The consumer provides
`checked`, `onChange`.

---

