<!-- Exported from the CQuel design system artifact (version 25, 04 Nov 2026).
Source of truth: https://claude.ai/artifact/5TNiRyXkn3UDAK9GfsWRgZ — re-export after design-system changes; don't edit by hand. -->

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
- [DetailsGrid](#detailsgrid)
- [DocumentList](#documentlist)
- [EmptyState](#emptystate)
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
- [ServicesBar](#servicesbar)
- [Steps](#steps)
- [SummaryCard](#summarycard)
- [Table](#table)
- [Tabs](#tabs)
- [Tag](#tag)
- [Textarea](#textarea)
- [Timeline](#timeline)
- [Tooltip](#tooltip)
- [TrendChart](#trendchart)
- [YourActionOnly](#youractiononly)

## ActivityList

"Recent activity": what happened lately, newest first.

### Rules
- In a flush Card titled "Recent activity", with "See all" as a link on the right. Five items at most.
- Each item: what happened in `h8` text-title, the detail in `p7` text-secondary, and on the right the date in `p7` text-tertiary, with the batch under it when the list spans batches.
- Short facts, no full stops, " · " between parts. Dates as "15 Oct".
- Empty: "Nothing on file yet".

### The consumer provides
`items`: `[{title, text, date, aside}]`, `empty`.

---

## AssetHeader

The top of an asset page: the address, where it sits, what we know about it, and a site photo when we have one.

### Rules
- **No container.** It sits on the page background, under the breadcrumb row. Content on the left, photo on the right, 32 apart.
- **Title:** the street address in `h4`. Under it, "<postcode> <city> · <batch>" in `p6` text-secondary (postcode only when we hold it).
- **What we know:** 20 below, a three-column grid of facts (two on phones), at most 6. Each fact is a label (`p7` text-tertiary), a value (`p6`) and where it comes from (`p7` text-tertiary): "Car park · Can take 4 chargers · Site check · 20 Aug". With no facts, the row is left out: no "Nothing on file yet".
- **Photo (optional):** 260×164, `radius-lg`, cropped to fill. Only a site photo we hold (a customer upload or a site visit). No caption, no date, no frame. With no photo there's no placeholder: the facts take the full width. Never street-view or map images.
- **Nothing else in the header:** no "See info", no View batch, no pill, no DetailsGrid, no buttons. The package, its services and "Open package" sit in a PackageStrip under the header, one per project.

### The consumer provides
- `title`, `meta`
- `facts`: `[{label, value, source}]`
- `photo`: `{src, alt}`, or nothing

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
- Start from the nav item the page belongs to: "Assets › Kervelstraat 14", "Flagship sites › EV charging · Voltreny".
- When an asset page is opened from a package, the package sits in the middle, and a Pager goes on the right of the same row.

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
- Empty: an EmptyState line ("Nothing on file yet") in the body. A card that would only ever say that can be left out.
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
- **`lead: 'next'`**: a 1px dashed `black-4` border, label `p7` text-tertiary. Its fill is the surface it sits on (`--cq-surface`: white by default, `bg-container-grey` inside the PackageStrip panel or a `cq-on-grey` wrapper), so a track line stops at its edge.
- One look on white and on grey: nothing changes with the background.
- **`size: 'big'`** (32 high, `h8`, `p6` for next, 16px tick, 12 side padding): an asset's services in the PackageStrip, so they outrank the 24px steps and phases under them. Same height as the filter chip and the big Tag.
- `count` adds " · 3" after the label ("Installation · 1").
- Used for an asset's services (PackageStrip), steps (Steps) and delivery phases (PhaseStepper).

### Filter chip (with `onClick`, a button)
- 32 high, `radius-full`, 12 side padding, `p6`, white with a 1px `border-dark` border, the count after the label in text-tertiary.
- Hover: `bg-container-grey`. Focus: the 2px `black-7` outline.
- **Selected:** `black-7` fill and border, label `h8` and count in white. This is the one black pill in the system.
- Used by FilterChips.

### Rules
- A chip with `onClick` is a filter; without it, a display chip. Never make a display chip clickable.
- Orange only on the `now` display chip.
- Not a Tag: Tag stays for categories and status inside rows; ResponsibilityPill stays "Your action".

### The consumer provides
`children`, `lead`, `count`, and for a filter `selected` and `onClick`.

---

## DetailsGrid

Label-over-value facts inside a card, such as contract details or an ops record.

### Rules
Label `p7` text-secondary, value `h8` text-primary, 4 apart. Four columns (two on phones), 12 between rows, 24 between columns. Links (batch, package) are underlined.

Not in customer page headers: the asset page uses AssetHeader's "What we know", and package pages have no details grid.

### The consumer provides
`items`: `[{label, value, href?}]`.

---

## DocumentList

"Documents": the files on a package, batch or asset.

### Rules
- In a flush Card titled "Documents", with "See all" on the right. 5 rows at most.
- Each row: the document name in `h8` text-title. Under it, the file type as a neutral Tag, size `xsmall` ("PDF", "3 PDF", "23 files"), and then the date or detail in `p7` text-secondary ("signed 6 Aug", "Jan–Dec 2025").
- On the right, one tertiary IconButton: `download` for a file, `chevron-right` (View) for a set that opens a list. Its label names the file ("Download Contract · Voltreny").
- One list, newest first. No grouping by who sent it; a file the customer sent says so in its name or detail ("Site plans · you sent 14 May").
- Package files on an asset page carry "package" in the detail ("PDF · package · 2 Aug").
- Empty: hide the card on an asset page; elsewhere "Nothing on file yet".

### The consumer provides
`items`: `[{name, type, meta, action: 'Download'|'View', href}]`, `empty`.

---

## EmptyState

What a card or list says when it has nothing to show.

### Rules
- One `p6` line in text-tertiary that says what's missing, in the product's words: "Nothing on file yet", "No assets match “Kerv”", "No packages here yet".
- When a filter caused it, add the "Clear filters" link on the right.
- No illustrations, no icons, no exclamation marks. A card with nothing in it may also be left out, when the page reads fine without it (NeedsDecision).

### The consumer provides
`children` (the line), `action`, `inCard`.

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

A right-side panel with an item's details, for facts that don't belong on the page itself.

### Where it goes
- Customer package and asset pages don't use it. Their headers show what matters on the page: the asset page's AssetHeader holds "What we know", and the package page has no "See info".
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

## PackageStrip

On an asset page, one card per project: the package it belongs to, how far its services have got, the way to the package, and this asset's own progress.

### Rules
- **Head:** "Package" as a card label (`s3`: capitals, SemiBold, +4% tracking, text-tertiary; write it in sentence case, the style capitalises it), 2 above the package name in `h7`, and one `p7` text-secondary line on what's on the package page and how many assets share it ("Tender results, contract and delivery for this asset and 5 others"). On the right, the large `strong` Button "Open package" with the chevron icon on the right. It's the only link to the package on the page; its screen-reader name is "Open <package> package".
- **Services:** big display Chips (`size: 'big'`, 32px) 12 under the head, 8 apart: done and now only. No chip for planned or not-required services.
- **At this asset** (optional): a `bg-container-grey` panel 16 under the chips, `radius-md`, with a title in `h8` ("Delivery at this asset") and an aside in `p7` text-tertiary ("Voltreny · contract €26k"). Only this asset's own data for the current service: delivery phases, the Planning site check, this asset's figure in Estimates or Pricing. Never package facts (offer counts, the brief). Tender has no panel: it's priced for the whole package.
- **Two projects on the asset:** two strips.
- **Completed package:** the line reads "Completed <date>", every chip is done, and there's no panel.

### The consumer provides
`name`, `line`, `services: [{label, lead}]`, `href`, `title`, `aside`, and the panel content as `children`.

---

## PageHeader

The top of every page: breadcrumbs, the title, one meta line, and at most one thing on the right.

### Rules
- Breadcrumbs (optional) with an aside on the same row, such as the Pager. 8 below them, the title in `h4`.
- Meta: one `p6` text-secondary line of facts joined with " · " ("Flagship sites · 6 assets · 2 of 6 complete · contract €152k").
- Aside, on the right: the Your action pill, a ChangedDot key, or on ops one `primary` Button. Nothing else.
- 24 below the header. No details grid and no "See info" (see InfoDrawer). The asset page uses AssetHeader instead.

### The consumer provides
`crumbs`, `crumbAside`, `title`, `meta`, `aside`.

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
- **Other phases:** "Site check report", "From invoice · date to confirm", or "Estimate".
- A phase waiting on the customer (`needs-you`) shows "Confirm dates" with the orange dot under a plain chip.
- No buttons.
- The track line is 2px `border-dark`. Chips and line look the same on white and on the grey PackageStrip panel.

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
- **Cards:** "All" first with the batch's project count, then one card per service that has projects in the batch now, in service order. No card for a service with 0.
- **Content:** the service name in `h8`, the project count in `h4` with tabular figures, and optionally "+<n> done" in `p7` text-tertiary when projects passed through that service. Nothing else.
- **Shape:** `radius-md`, 12/16 padding, equal columns 8 apart.
- **States:**
  - Default: white (`bg-container`) with the `border-dark` border.
  - Hover: `bg-container-grey`, same border.
  - Selected: white, same border, and a 4px `brand-6` bar along the top, inside the card and clipped by its radius. The content doesn't move.
  - Focus: the 2px `black-7` outline.
- Borders never turn dark. Never fill a card with orange or black.
- **Behaviour:** single select. Each card writes `?service=<id>`; "All" clears it. The Assets table below shows assets with a project in that service.

### The consumer provides
- `options`: `[{id, label, count, done}]`, with `id: ''` for All
- `value`, `onChange(id)`

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

## Steps

A package's steps within one service, as display Chips on a track.

### Rules
- One equal column per step, a Chip in each, joined by a 2px `border-dark` line behind them.
- **Done step:** `lead: 'done'`.
- **Step with work under way:** `lead: 'now'` with the count in the label ("Info requested · 3"). Several steps can be "now" at once. Under it, one `p7` text-secondary line with when it started ("asked 16 Oct", "started 14 Oct") when we hold the date.
- **Later step:** `lead: 'next'`.
- **Delivery:** assets that haven't started sit on a plain Start chip with "3 awaiting start" under it; Complete with assets is a done chip with its count ("Complete · 2") and "last 7 Oct" under it.
- **On a package Overview:** no descriptions, no needs panels and no buttons.

### The consumer provides
`steps`: `[{label, state: 'done'|'now'|'next', count, line}]`

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
- Labels are `p6` text-secondary. The active label is `h8` text-primary, with a 2px `brand-6` underline.
- A row of tabs sits on a `border-light` line, with 24px gaps.
- A count goes in brackets after the label: "Offers (8)".
- **New dot:** a 6px `brand-6` dot after the label when the tab holds something the customer hasn't seen yet. It's only a dot: no number, no "new" text. Its accessible label is "New".
- Keyboard focus: a 2px black-7 outline.
- Each tab shows one section. Never put actions in a tab label.

### The consumer provides
- `tabs`: `[{id, label, isNew}]`
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
- Every icon-only button has one.

### The consumer provides
`content`, `children` (the trigger).

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

## YourActionOnly

The customer's one responsibility filter: a checkbox in the FilterBar, "Your action only".

### Rules
- Sits after the selects, before Clear filters, aligned to the 40px controls. Checked: a black-7 box with a white tick. Never orange.
- It's the same filter as pressing the Your action SummaryCard; the two stay in sync and live in the URL (`?responsibility=you`).
- Ops screens use a Responsibility FilterSelect instead.

### The consumer provides
`checked`, `onChange`.

---

