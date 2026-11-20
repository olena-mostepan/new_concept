<!-- Exported from the CQuel design system artifact (version 63, 19 Nov 2026).
Source of truth: https://claude.ai/artifact/5TNiRyXkn3UDAK9GfsWRgZ — re-export after design-system changes; don't edit by hand.
In this folder: README.md (rules), components.md (every component), tokens.json, types.md (props), decisions.md (decisions and settled preferences). -->

# CQuel design system: components

One section per component: its rules and what the consumer provides. The prototype's versions are in `components/concept/ui.tsx`; types are in `types.md`.

## Contents

- [AboutCard](#aboutcard)
- [ActivityList](#activitylist)
- [AssetHeader](#assetheader)
- [AssetPicker](#assetpicker)
- [AssetWindow](#assetwindow)
- [AssistantPanel](#assistantpanel)
- [Banner](#banner)
- [Breadcrumbs](#breadcrumbs)
- [Button](#button)
- [Card](#card)
- [ChangedDot](#changeddot)
- [Chapter](#chapter)
- [CheckCard](#checkcard)
- [Checkbox](#checkbox)
- [Chip](#chip)
- [ChosenList](#chosenlist)
- [CriteriaTile](#criteriatile)
- [DetailBar](#detailbar)
- [DetailsGrid](#detailsgrid)
- [DocPreview](#docpreview)
- [DocumentList](#documentlist)
- [EmptyState](#emptystate)
- [FactSelect](#factselect)
- [FilterBar](#filterbar)
- [FilterChips](#filterchips)
- [FilterSelect](#filterselect)
- [FindField](#findfield)
- [FormField](#formfield)
- [FoundValue](#foundvalue)
- [Icon](#icon)
- [IconButton](#iconbutton)
- [InfoCard](#infocard)
- [InfoCell](#infocell)
- [InfoDrawer](#infodrawer)
- [InlineForm](#inlineform)
- [Input](#input)
- [KeyFigure](#keyfigure)
- [LinkRow](#linkrow)
- [ListFooter](#listfooter)
- [Modal](#modal)
- [NeedsDecision](#needsdecision)
- [NeedsPanel](#needspanel)
- [OfferCard](#offercard)
- [OfferWindow](#offerwindow)
- [OpsAssetsTable](#opsassetstable)
- [PackageCard](#packagecard)
- [PackageStrip](#packagestrip)
- [PageHeader](#pageheader)
- [Pager](#pager)
- [PhaseStepper](#phasestepper)
- [PlanTrack](#plantrack)
- [Progress](#progress)
- [QuestionRow](#questionrow)
- [QuoteFiles](#quotefiles)
- [Radio](#radio)
- [RequirementRow](#requirementrow)
- [ResponsibilityPill](#responsibilitypill)
- [SearchField](#searchfield)
- [SegmentedChoice](#segmentedchoice)
- [Select](#select)
- [SelectionBar](#selectionbar)
- [ServiceCards](#servicecards)
- [ServiceIcon](#serviceicon)
- [ServicesBar](#servicesbar)
- [SiteMap](#sitemap)
- [SolutionIcon3D](#solutionicon3d)
- [SpecList](#speclist)
- [StageList](#stagelist)
- [StatusCard](#statuscard)
- [Steps](#steps)
- [StickyActionBar](#stickyactionbar)
- [SummaryCard](#summarycard)
- [Table](#table)
- [Tabs](#tabs)
- [Tag](#tag)
- [TenderRail](#tenderrail)
- [Textarea](#textarea)
- [Timeline](#timeline)
- [Tooltip](#tooltip)
- [TrendChart](#trendchart)
- [TypeLabel](#typelabel)
- [UploadRow](#uploadrow)
- [Workspace](#workspace)
- [YourActionOnly](#youractiononly)

## AboutCard

"About <item> in the brief": the brief's own words for the check row or question the supplier is on. Top of the OfferWindow's right column. (19 Nov 2026.)

### Anatomy
- On the info blue, like the `own` InfoCell (You said): `status-info-bg`, a 1px `status-info-border`, `radius-md`, padding 12/16. `aria-live="polite"`, so it's read out when it changes.
- `p7` text-tertiary "About warranties in the brief"; the brief's own words in quotes in `p6`; the source in `p7` text-secondary ("Tender brief · How the customer chooses"); an optional `p7` text-secondary note ("Expected: panels at least 25 years, workmanship at least 5").

### Rules
- Shown only when a row or question is selected; one at a time.
- One per check row and red question. It never makes up words: if the brief says nothing about the item, there's no card.
- The blue means "from the brief, about the thing you're on", the same family as the tender header band and You said. No dot, no status.

### The consumer provides
`title` (the item: "Warranties"), `quote`, `source`, `note`.

---

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

## AssetPicker

A list for choosing assets from many, in the create workspace (New batch: Search and From files).

### Anatomy
- **Box:** white, `border-dark`, `radius-md`. The list scrolls inside it, at most about 56vh (520).
- **Header row:** the count in `s3` text-tertiary ("36 assets · 2 in the batch"), and the link Button at the right end: "Add all 36", or "Remove all" when every row is in. A `border-light` rule under it.
- **Row:** at least 56 high, a `border-light` rule between rows. Columns `16px | 1fr | auto`, gap 12, padding 10/16:
  - the square checkbox: 16, `border-dark`, `radius-sm`; checked `black-7` with a white 12px `check`;
  - the name in `h8` text-title, with the place under it in `p7` text-secondary (address, postcode and city);
  - the type in `p7` text-tertiary ("Hotel", "Office").

### Interaction
- The whole row toggles (`role="checkbox"`, `aria-checked`).
- Hover and checked rows are `black-1`. Keyboard focus is the inset 2px `black-7` ring.
- What's checked also shows in the ChosenList in the side column; removing it there unchecks the row.

### Empty
A `p6` text-secondary line in the box that says what to do next: "No assets match “Leeds”. Add it manually if it isn't in CQuel yet."

### The consumer provides
`items: [{id, name, place, type}]`, `selected` (ids), `onToggle(id)`, `onAll(on)`, `empty`; optional `noun` (['asset', 'assets']) and `inLabel` ("in the batch").

---

## AssetWindow

The fix / edit layout of the full-screen Workspace (see Workspace for the frame rules both layouts share: the top bar, the missing hint, the close check).

The Fix assets and Edit asset data workspace on Ops screens: a full-screen view where Ops fix an asset's data item by item, with the asset's documents beside the checklist.

### Where it opens
- **Fix assets:** from the StatusCard's "Fix 3 assets" button, or from "Fix this asset" in an open row of the OpsAssetsTable (it opens at that asset).
- **Edit asset data:** from "Edit data" on the asset page's Data card, or in an open row of a ready or In Estimate asset. Same workspace, `mode: 'edit'`.

### Frame
- Full screen: `role=dialog`, `aria-modal`, `inset: 0`, white. **No scrim, no radius.** It locks the page's scroll while open; Esc closes (with the unsaved-change check below).
- **Top bar:** at least 64 high, padding 8/16, a `border-dark` rule under it.
  - left: Close (IconButton `cross`), then the title in `h6` ("Fix 3 assets", "Edit asset data") over the subtitle in `p7` text-secondary ("Solar PV · Estimates");
  - right end: Done, `primary`, size large.
- **Unsaved change:** closing with an edit open (Close, Esc) turns the top bar's right side into "You have an unsaved change. Close without saving it?" (`p6`) and two `secondary` buttons, "Keep editing" and "Close without saving". Pass `dirty` while an edit is open.

### Body: three columns, each scrolling on its own
1. **Side list,** 280 wide (240 in edit mode), `black-1`, a `border-light` rule on its right.
   - group labels in `s3` capitals with a count: "TO FIX · 3", "DONE · 1". Edit mode has one group, "ASSET · 1".
   - rows: the 16px `building` icon, the asset name in `h8` and its line in `p7`: the first blocking item after the 6px orange dot ("● Roof area · to confirm"), "Nothing blocking", or "Ready for Estimate".
   - hover `black-2`; the selected row is white with a `border-dark` border. "Show all 6" as a link at the bottom. Clicking a row switches asset.
2. **Checklist,** fluid; its content is at most 880 wide and centred.
   - the asset name in `h5` over city and step in `p6`, with "Open asset page" (tertiary, `chevron-right`) on the right;
   - the RequirementGroups: "BLOCKING THE NEXT STEP" and "RECOMMENDED, MISSING" (Fix), "REQUIRED" and "RECOMMENDED" (Edit). Files and the drop zone are no longer in the checklist; they live in the Documents column.
3. **Documents,** 340 wide, `black-1`, a `border-dark` rule on its left.
   - **Header:** "Documents" in `h7`, the files pill at the right end ("3 files", "1 file"; the same pill as RequirementGroup).
   - **Drop zone, stacked and centred:** a 36px white box with the 20px `upload` icon, "Drop documents here" (`h8`), "We read them and fill what we can" (`p7`), and "Upload documents" (`secondary`). White, 1.5px dashed `black-3`, `radius-md`, padding 20/16.
   - **Files:** a DocumentList in a white box (`border-light`, `radius-md`, padding 0 12). Each row has View (`eye`) before Download. View opens the DocPreview in this column.
   - **Empty:** "No documents for this asset yet." in `p7` text-secondary, centred.
   - **DocPreview** replaces the list while a file is open (View in the list, or View on a FoundValue, which opens at the value's page with the highlight).

### Narrower screens
The layout follows the workspace's own width.
- **Below 1180:** two columns, side list 260 + checklist. Documents becomes a panel that slides in from the right (at most 400 wide, shadow `-8px 0 24px rgba(30,40,50,.12)`), opened by "Documents · n" (`secondary`, `document` icon) before Done. The panel has its own Close.
- **Below 760:** one column. The side list hides and an asset picker (Select, label "Asset") sits at the top of the checklist.
- **Below 640:** the unsaved-change question wraps to its own row under the title, with its two buttons (Workspace rule, 12 Nov).

### Saving
- Nothing saves by itself. Each item saves with its own button (Use, Save, Not available, an upload); Done only closes.

### Retired
- The Modal version (1000 wide on a scrim, Done in a footer, the `.cq-awin` max-height and the modal flex-column rules of v46–47).

### The consumer provides
`title`, `subtitle`, `mode: 'fix' | 'edit'`, `groups: [{label, count?, items: [{id, name, line, toFix}]}]`, `value`, `onSelect(id)`, `showAll: {count, onClick | href}`, `asset: {name, meta, link: {label, href | onClick}}`, `documents: {items (DocumentList items, with onView), onUpload, preview? (DocPreview props)}`, `dirty`, `onDone`, `onClose`, the RequirementGroups as children. For previews: `inline` and `height` (draws it in place instead of full screen), `confirming`, `docsOpen`.

---

## AssistantPanel

The Ops assistant, first release: rough, to show the opportunity. It works on the current package only. Prompts, limits and errors come later.

### AssistantPanel
- A 400 wide side panel next to the page (the page narrows; nothing is covered), white, `border-dark` on the left.
- **Header,** 56 high: the assistant mark (a 28px `black-7` circle with the white `idea` icon), "Assistant" in `h8`, and Close on the right.
- **Messages,** 16 apart:
  - the person's message on the right, on `black-2`, `radius-lg`, max 300 wide; an attached file sits above the text as a white chip (`document` icon, name in `h9`).
  - the assistant's reply on the left after the small mark: the text, each change with a small done mark ("Usable roof area: 540 m² (page 3)"), a `p7` note ("Nothing is blocking it now. Both changes are in its History."), and a small soft "Undo".
- **Input** at the bottom: a 40px secondary IconButton "Attach files" (`plus`), then an Input "Add or change something…". A `p7` hint above it ("Try: “Set Kelmsdorfer Straße 41 roof area to 610”").
- Same rules as everywhere: it never chooses between values that disagree, and every change it makes goes to the asset's History.

### UpdatedHighlight
- Wraps a changed table cell: a 2px `black-6` outline, `radius-sm`, a `black-1` ground, and a small "UPDATED" tag (`black-6`, white, 10px capitals). Ink and grey, never orange. It stays until the page reloads or the change is undone.

### AssistantButton
- **On Ops package and asset pages** it sits in the DetailBar, before Questions: `inline`, 36 high, no shadow, padding-right 16, the white-circle mark on the left and "Ask the assistant" in `h8` white on `black-7`. Hover `black-6`. It opens the panel.
- **Floating** (the default, for other uses): a pill at the bottom right, 32 from the edges, 48 high, with the floating shadow.
- The assistant keeps the ink colours. A blue seen in a concept build isn't part of the system.

### The consumer provides
AssistantPanel: `messages: [{from: 'me' | 'assistant', text, file?, changes?, note?, onUndo?}]`, `hint`, `placeholder`, `onClose`, `onAttach`. UpdatedHighlight: children. AssistantButton: `onClick`, `label`.

---

## Banner

A message about the whole page or card: something failed, something is out of date, something to know before acting.

### Rules
- `radius-md`, padding 12/16, a 6px mark, a title in `h8` and a line in `p6` text-secondary. One link or button on the right at most.
- Types are status: `info`, `success`, `warning`, `danger`, plus `neutral` (grey). The ground is the status bg, never a solid fill and never orange.
- Errors say what went wrong and what to do: "We couldn't load the offers. Reload the page; if it keeps happening, tell your CQuel contact."
- Not for "Your action": that's the pill and NeedsDecision.

### Icon (v53)
- `icon` (an icon name): a 16px icon replaces the 6px dot, top-aligned with the title (2 from the top).
- The icon takes the status text tone (`status-info-text`, …; `icon-default` for `neutral`), so it reads at 4.5:1.
- `neutral` with an icon is allowed: a grey ground (`bg-container-grey`, 1px `border-dark`) with the icon in `icon-default`, for something that explains rather than flags a state. Use: "Why you were invited" on the supplier page (`neutral`, `info` icon, C3 18 Nov). The dot stays the default.
- A Banner's line may end in a link button ("Read the form") when the card is too narrow for an action on the right.
- Plain information goes on `neutral` ("How CQuel is paid"), never on `info` or `warning` grounds.

### The consumer provides
`type`, `title`, `children`, `action`, `icon`.

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
- `soft` — grey fill (`black-2`, hover `black-3`, pressed `black-4`), no border. Per-item actions on white rows in Ops checklists ("Upload bills or meter data", "Not available", Save), where many sit on one screen. **Never on a grey or tinted surface** (found values, the edit box, the upload row, grey panels): use `secondary` there.
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
Every button gets the black focus ring on keyboard focus (`focus-ring`: 2px `black-7` with a 2px white gap), the same on every colour. Hover and pressed stay in the button's own colour: primary `brand-7` / `brand-8`; secondary and tertiary `black-2` / `black-3`; danger `danger-1` / `danger-2`. Never the light accent.

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

### Additions (v53)
- `count`: a number after the title in text-tertiary, regular weight ("Sites 3").
- `subtitle`: a `p7` text-secondary line under the title ("Price on what you know. Say what you assumed.").
- **The one card that needs you** (`accent`): a 4px `brand-6` top bar, together with the Your action pill and the page's `primary` Button. At most one per page. Supplier Overview: "Send an indicative offer". (The selected service filter card keeps its own 4px bar; both uses stand.)
- Plain information goes in a plain Card or a `neutral` Banner, never on a status ground.

- **C3 (18 Nov):** on the supplier Overview the one card that needs you is the OfferCard; story cards are Chapters.

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

## Chapter

A story card on the supplier Overview. (C3, 18 Nov 2026.)

### Anatomy
- A Card whose title is "<n> <title>" in `h7`, the number in text-tertiary. Padding 16/20/20, 12 between parts: the same 20 inner padding as the FindField, so the cards' left edges line up.
- Each chapter is a lead line and 2–4 InfoCells, nothing longer. Details live in the Sites & documents tab or behind a link.

### Supplier Overview chapters, in order
1. **The job** ("The job: seafront roofs"): a lead line (16/24); the SiteMap and four InfoCells side by side, 3fr map to 2fr cells, the cells in a 2 × 2 grid (the two hotels · expected generation · roof space · safety rules; wrap them in `cq-jobgrid`); then the seafront note (`p7`) and "Sites & documents · 3 sites, 7 files ›" (`tertiary`).
2. **What you price:** three InfoCells (Included · Not included · Send us).
3. **What nobody knows yet:** "Price on what you know and say what you assumed. These are settled later:" and two InfoCells (CQuel is asking the customer · Checked at the site visit).
4. **How the customer chooses:** three InfoCells with icons (Price · Timing · Quality), then a `p7` line on the contract with a link to the Commission Form.

### The consumer provides
`n`, `title`, `children`.

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
- Hover: `black-2`. Focus: the black focus ring.
- **Selected:** `black-7` fill and border, label `h8` and count in white. This is the one black pill in the system.
- Used by FilterChips.

### Rules
- A chip with `onClick` is a filter; without it, a display chip. **A display chip is never clickable** and never switches anything: to move between services, use the page's tabs.
- Orange only on the `now` display chip.
- Not a Tag: Tag stays for categories and status inside rows; ResponsibilityPill stays "Your action".

### The consumer provides
`children`, `lead`, `size`, `count`; for a filter `selected` and `onClick`.

---

## ChosenList

What's in the thing being made, in the create workspace's side column ("Assets" in New batch).

### Anatomy
- **Title row:** the title in `h7` with the white count pill at the right end: the same pill as RequirementGroup (`border-dark`, `h9`, 24 high), "3 assets", "1 asset".
- **Empty:** a 1.5px dashed `black-3` box on white, `radius-md`, padding 20/16, centred `p7` text-secondary text ("No assets yet. Pick them on the left.").
- **Items:** a white box (`border-light`, `radius-md`, padding 0 12), a `border-light` rule between rows. Each row:
  - the 16px `building` icon in `icon-default`, top-aligned;
  - the name in `h8`, the place in `p7` text-secondary under it;
  - an IconButton `cross`, small, labelled "Remove <name>", at the right end.
- **New items:** an item created here (Add manually) carries a `neutral` xsmall Tag "New" after its name.

### The consumer provides
`title`, `items: [{id, name, place, isNew}]`, `onRemove(id)`, `empty`; optional `countLabel` (['asset', 'assets']) and `icon`.

---

## CriteriaTile

How the supplier is chosen, as three tiles in a row.

### Anatomy
- Three in a row, 12 apart (pass `items` for the row). Each: white, `border-dark`, `radius-md`, padding 14/16.
- A 24px icon in `icon-default` (`money`, `time`, `best`), 6 below it the title in `h8`, then a `p7` text-secondary line.
- On narrow screens the tiles stack.

### Rules
- No weightings or scores unless the platform holds them.

### The consumer provides
`icon`, `title`, `text`; or `items: [{icon, title, text}]` for the row.

- **C3 (18 Nov):** on the supplier Overview the criteria are InfoCells with a 20px icon inside the "How the customer chooses" Chapter. CriteriaTile stays for a standalone row of criteria.

---

## DetailBar

The slim top bar on detail pages: Back on the left, the account tools on the right. It replaces the app header and section nav there.

### Where it goes
- **Detail pages:** batch, package and asset pages, and anything else you open from a list (ops batch pages too).
- **Section pages** (Overview, Assets, the five service lists, ops Portfolio and Workstreams) keep the app header with the customer logo and the section nav.

### Rules
- White, 64 high, `border-dark` line under it, page side padding (32). Sticky at the top.
- **Ops package and asset pages:** the AssistantButton (`inline`: 36 high, no shadow) sits first in the tools, before Questions.
- **Back:** the `arrow-left` icon (16) and "Back" in `h8` text-primary, 6 apart. Hover underlines it; focus is the black focus ring.
- **Where Back goes:** to the page the person came from (a list, a service page, the package). If they landed on the page directly (a link, a refresh), to the parent level in the breadcrumb.
- **Right:** the same tools as the app header, in the same order: Questions, the Customer/Ops switch (prototype only), the avatar. On ops, no "Create batch" here.
- **No** customer logo, account name, section nav or page actions in the bar. Page actions belong in the page.
- Under it, the page starts with PageHeader: the breadcrumb says where the page sits and lets you jump up any level. Back means "return"; the breadcrumb means "where am I". Keep both.

### The consumer provides
`backHref` or `onBack`, `backLabel` ("Back" by default), and the tools as `children`.

### Supplier variant (v53)
- Back reads "Tenders" (`arrow-left`, `h8`) and goes to the supplier's tender list.
- Right: the avatar only, initials on `black-7` (`avatar`). No account or company name, no Questions link: questions live in the tender's own tab.

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

### In the grey panel (v53)
- `panel` with `label`: the DetailsGrid sits in the grey panel (`bg-container-grey`, `radius-md`, padding 12/16/16) under an `s3` label.
- Supplier "The contract": Customer decides · Contract with · Payment terms · CQuel commission, each with a `p7` detail.
- For values that are sentences, use SpecList instead.

---

## DocPreview

A document opened inside the AssetWindow's Documents column, so Ops can read the file next to the checklist. It replaces the file list until Ops go back.

### Anatomy
- **Header:** white, a `border-light` rule under it, padding 12/12/12/8.
  - `arrow-left` IconButton "All documents" (back to the list);
  - the file name in `h8` (truncates) over "Roof plan · page 2 of 3" in `p7` text-secondary;
  - `chevron-left` / `chevron-right` IconButtons, "Previous page" / "Next page", disabled at the ends.
- **Highlight strip,** only when the file was opened from a found value (FoundValue's View):
  - on the value's page: "Highlighted: what we read (420 m²)" on `status-warning-bg`, a `status-warning-border` rule under it;
  - on another page: "The value is on page 2." and an underlined "Go to page 2", on white with a `border-light` rule.
- **Page:** a white A4 sheet (1 : 1.414, at most 520 wide), `border-dark`, a small shadow, centred on `black-1`. The quoted words get a `status-warning-bg` fill and a 2px `status-warning-mark` outline.

### Rules
- Opened from a FoundValue, it starts at the value's page with the highlight. Opened from the list, it starts at page 1 with no strip.
- The highlight marks only the file's own words that we read, never a guess.

### The consumer provides
`file`, `label` (the document type, "Roof plan"), `page`, `pages`, `onBack`, `onPrev`, `onNext`, `highlight: {page, value, quote, before?, after?}`, `onGoTo(page)`. Pass the rendered page as `children`; without it a placeholder sheet is drawn.

---

## DocumentList

"Documents": the files on a package, batch or asset.

### Rules
- In a flush Card titled "Documents", with "See all" on the right. 5 rows at most.
- Each row: the document name in `h8` text-title. Under it, the file type as a neutral Tag, size `xsmall` ("PDF", "3 PDF", "23 files"), and then the date or detail in `p7` text-secondary ("signed 6 Aug", "Jan–Dec 2025").
- On the right, tertiary IconButtons whose labels name the file:
  - **View** (`eye`, "View Dachplan_Halle_A.pdf") opens the preview; it sits before Download. Give an item `onView` or `viewHref`.
  - **Download** (`download`, "Download Contract · Voltreny").
  - `action: 'View'` alone (a set that opens elsewhere) shows only the View button.
- One list, newest first. No grouping by who sent it; a file the customer sent says so in its name or detail ("Site plans · you sent 14 May").
- Package files on an asset page carry "package" in the detail ("PDF · package · 2 Aug").
- Empty: hide the card on an asset page; elsewhere "Nothing here yet".
- **No drop zone** in the list, on the asset page either. Files come in through the Data card's "Upload documents", the drop zone in the AssetWindow's Documents column, or the assistant.

- **Files being read** (Ops, the AssetWindow's Documents column, in a white box: `border-light`, `radius-md`, padding 0 12): `state: 'reading'` shows "Reading…" and a spinner on the right; `state: 'unknown'` shows "Couldn't tell what this is" and a small secondary "Choose a type". Neither has a type Tag yet. No StateMark on files.

### The consumer provides
`items`: `[{name, type, meta, action: 'Download'|'View', href, onView?, viewHref?, state?: 'reading' | 'unknown', onChooseType}]`, `empty`.

- **Build check (17 Nov):** the prototype renders View (`eye`) before Download when an item has a preview (`view: true` there; `onView` / `viewHref` here). No change.

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
- **Several live options:** the label reads "Package · <i> of <n>". The value is a button: the name in `p6` plus a 16px `chevron-down`, 6 apart. Hover and open: `black-2` behind it, `radius-sm`, padding 2/6 with matching negative margin so the text doesn't move. Focus: the black focus ring.
- **One live option plus earlier ones:** no count, but the chevron shows, because there's history.
- **Menu:** the one CQuel menu (shared with Select and FilterSelect), 8 under the value, left-aligned, 330 wide, white, `border-dark`, `radius-md`, `elevation-floating`, padding 6. Each row: the package name in `p6` (chosen: `h8` with a 16px `check` at the right, no fill; under the pointer or keyboard: `black-2`) over a `p7` text-tertiary line with its current service ("Tender"), "Complete" or "Closed". Order: the selected one first, then most recent activity.
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
- Control 40 tall: the standard field height, the same as form inputs and Large buttons. Radius-md, border-dark, white. Padding 0 12; the value on the left and the 16px `chevron-down` icon (icon-dark) on the right, both vertically centred, 8 apart. The value never wraps; it ends in an ellipsis if the field is too narrow.
- In a FilterBar it fills its grid column, so the row spans the same width as the table below.

### Values
- The first option is the "all" value, named after the field ("All batches", "All services", "All solutions"; "All" for Responsibility).
- Options are sentence case and in a stable order. Responsibility reads Your action / CQuel's action / Suppliers' action / Done.

### States
- **Default value:** text in text-title, border border-dark.
- **Chosen value:** text in text-primary, border black-6. You can see at a glance which filters are on.
- **Hover:** border black-4. **Focus:** a 2px black-7 border, no halo.

### The menu
- Never the browser's menu. It opens the CQuel menu (the same as FactSelect's): 4 under the field, left-aligned, at least the field's width (up to 360), white, `border-dark`, `radius-md`, `elevation-floating`, padding 6, up to 320 tall then it scrolls.
- Rows: the option in `p6`, padding 8/12, `radius-sm`. The row under the pointer or keyboard: `black-2`. The chosen row: `h8` with a 16px `check` at the right, no fill. No blue, no orange, no ring inside the menu.
- Keyboard: Enter, Space or the arrow keys open it on the selected row; arrows, Home and End move; Enter picks; Esc or Tab closes and returns focus to the field. A click outside closes it.

### When to use which
- **FilterSelect:** in filter bars, with up to about 10 options.
- **Select:** in forms, inside a FormField.
- **Combobox:** more than about 10 options, or the person will want to type.

### Rules
- Always a visible label. Never show the field name as the placeholder value inside the box.

---

## FindField

Find it in this tender, and ask when nothing is found: finding and asking are one field. (C3, 18 Nov 2026; canvas board "C3 · Find it in this tender: states".)

### Anatomy
- A Card, padding 16/20/20, 12 between parts. Its title "Find it in this tender" (`h7`) is the field's label.
- The field: 44 high, `search` icon (20, `icon-default`), placeholder "Search the brief, files and answered questions", a Clear IconButton once something is typed. Focus: 2px `black-7` border.

### States
1. **Default:** the field and up to four suggestion pills (32 high, white, `border-dark`, `p6`; hover `black-2`): Export limit · Not in my price · Roof space · Warranties.
2. **Results:** a bordered list (`radius-md`), one row per hit: a 16px icon (`document` to open, `download` for a file), the passage in `p6` with the matched word on `status-warning-bg`, the source in `p7` text-secondary ("The job · Overview", "ZIP · Boulevard Hotel…"), and "Open" or "Download" in `p7` text-tertiary. Under the list: "<n> results in this tender". A row opens its tab.
3. **Nothing found:** a grey box (`bg-container-grey`, `border-dark`): "Nothing about “<query>” in this tender" in `h8`, "Ask CQuel. The answer comes back to Questions and by email." in `p6`, and `secondary` "Ask CQuel".
4. **Asking:** the search becomes the question in a Textarea ("Your question"), with "CQuel replies in Questions and by email." and Cancel (`tertiary`) + "Send question" (`secondary`, disabled while empty).
5. **Sent:** back to the default field, with a row "Question sent to CQuel" (black tick mark), the question quoted in `p7`, and `tertiary` "Questions ›". The Questions tab shows a count: "Questions (1)".

### Rules
- Search covers only what the tender holds: the brief, files and answered questions. No answers are made up; anything not found becomes a question.
- Accessibility: the title is the label; results are buttons; the Sent row is a `status` region.

### The consumer provides
`index: [{text, source, action: 'open' | 'download', onClick}]`, `suggestions` (max 4), `onAsk(text)`, `onOpenQuestions`, `title`, `placeholder`. For previews: `defaultQuery`, `defaultAsking`, `defaultSent`.

### `compact` (the OfferWindow's right column, 19 Nov)
- No card around it. The label is `s3` text-tertiary "Find it in this tender". No suggestion pills.
- Results sit on white in the grey column. "Nothing found" stacks the text over "Ask CQuel", on white.
- A result that opens a tab closes the window first. Asking CQuel keeps the window open.
- The Overview keeps the full FindField.

---

## FormField

Label, field and hint as one unit.

### Rules
Label `h9` (12, SemiBold) in text-title, the same as every field label in the product (filter bars too); hint `p7` text-secondary; error message `p7` text-error under the field. 4 between each part; stack fields 12 apart. Optional fields say "(optional)" in the label.

### The consumer provides
`label`, `hint`, `error`, `children` (an Input, Select or Textarea), `width`.

---

## FoundValue

A value we read from a file and haven't used yet. Ops confirm it before it counts.

### Anatomy
- A light yellow box, to say "waiting for Ops": `bg-warning` with a 1px `status-warning-border` border, `radius-md`, 12/16 padding.
- On the left, two lines:
  - `h8`: the `info` icon (16, `status-warning-text`) and "Found 420 m² in Dachplan_Halle_A.pdf, page 2";
  - lined up with the text after the icon: the file's own words in `p7` text-secondary, in quotes and in the file's language, then the View IconButton (`eye`, small, "View <file name>"): it opens the DocPreview in the Documents column at that page, with the words highlighted.
- On the right, centred over both lines: the actions as `secondary` buttons ("Use 420 m²", "Enter another"). Never `soft` on the yellow. On narrow screens they drop under the quote.

### Rules
- Never pre-select or pre-fill a found value: it isn't the asset's value until Ops press Use.
- Two files that disagree show two boxes, one per file, each with its own Use.
- No "AI" badge: "Found … in <file>" already says where it came from.
- The edit box (Value / Source / Was) is grey, not yellow: it isn't a value waiting to be confirmed.

### The consumer provides
`value`, `file`, `page`, `quote`, `viewHref` or `onView`, and the actions as children.

---

## Icon

An icon from the CQuel set, drawn in the current text colour.

### Rules
- Use these icons, never lucide or emoji. Names match the files under Icons (`chevron-right`, `search`, `ev-charging`).
- Sizes: `icon-16` in buttons, inputs and table rows; `icon-20` in card headers and menus; `icon-24` in empty states.
- Colour comes from the text around it, or from `role`: `strong` beside a title, `default` for muted icons, `disabled`, `white` on dark fills, `active` (orange) only for something that needs the customer.
- **`eye`** (new 11 Nov 2026): View. Used on the View IconButton in DocumentList rows (before Download) and on FoundValue. Same 24 grid and 2px stroke as the rest of the set.
- An icon beside a label is decorative and hidden from screen readers. An icon on its own gets a `label`, and an icon-only button also gets a Tooltip.

### The consumer provides
- `name`, `size`, `role`, `label`
- Outside this design system, copy the SVGs into one folder and set `CQuelDS.iconBase = '/icons/'`.

- **The full set ships with the prototype** (`public/icons`, all 93, 17 Nov). The supplier page uses `money`, `time`, `best` and `message`.

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

## InfoCard

A short block of plain information with at most one action. (C3, 18 Nov 2026.)

### Anatomy
- `radius-lg`, padding 16/20, 8 between parts. The title in `h7`, the text in `p6` text-secondary, then one `secondary` button.
- **`warm`:** `status-warning-bg` ground with a `border-accent` line. Use: "How CQuel is paid" in the TenderRail, with "Read the Commission Form".

### Rules
- One per page. It is information, not "Your action": no pill, no `primary` button.
- For a message about the page (something failed, out of date), use Banner.

### The consumer provides
`tone` ('warm'), `title`, `children`, `action: {label, href | onClick}`.

---

## InfoCell

A small grey box inside a Chapter. (C3, 18 Nov 2026.)

### Anatomy
- `bg-container-grey`, 1px `border-dark` (Olena, 18 Nov: grey boxes need borders), `radius-md`, padding 12/14.
- Label `p7` text-tertiary, value `h8` (or `p6` for a sentence, `sentence`), optional `p7` text-secondary note.
- With `icon`: a 20px icon in `icon-default` on the left (money, time, best for the criteria).

### `own`: what the supplier said (YouSaid, C4 18 Nov)
- After the offer is sent, each Overview chapter gets one `own` cell, full width under its InfoCells:
  - The job: "You said · 3 of 3 sites · start 6 weeks after the contract · 10 weeks on site";
  - What you price: "You said · £318,400 excl. VAT · <warranties>";
  - What nobody knows yet: "You assumed · Export limit 200 kW · no asbestos · roofs take the load", note "Read from your quote. When CQuel gets the answers, this says whether your assumption holds."
- Look (Olena: "should be highlighted, maybe blue", "we need an icon there", "only 1 icon not 2 types", "isn't it too big"): `status-info-bg` with a 1px `status-info-border`, `radius-md`, padding 12/14. One icon for every `own` cell: `cite`, 16, in `status-info-text`, 8 from the text, top-aligned on the label's line. Then label `p7` text-tertiary ("You said" by default), value `h8`, optional `p7` note.
- The blue ties it to the TenderRail's header band and sets the supplier's own answers apart from the grey brief cells. No dot, no status meaning: it's "yours", not "info needed". The icon is part of the variant, not a prop.
- Never shown before the offer is sent.

### States (C5)
- **Flagged** (`flag`): `status-warning-bg` with a `status-warning-border` border, and the flag line under the value (14px `alert`, `status-warning-text`: "Expected at least 25"). A state of InfoCell, not a new component.
- **Changed** (`was`): when an answer changed a value, the old one shows under it in `p7` text-tertiary, struck through: Start "Nov" with "1 Sep" struck through.

### Layout
Equal columns, 12 apart (pass `items` and `cols`); one column on narrow screens.
- The job: beside the map (3fr map, 2fr cells), the cells in a 2 × 2 grid: the two hotels · expected generation · roof space · safety rules.
- Three for price (Included · Not included · Send us) and criteria (Price · Timing · Quality, with icons).
- Two for open items (CQuel is asking the customer · Checked at the site visit).

### The consumer provides
`label`, `value`, `note`, `sentence`, `icon`, `own`, `flag`, `was`; or `items` and `cols` for the row.

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

## InlineForm

A small form that adds an item to a list, inside a page or workspace (New batch: Add manually).

### Anatomy
- The form sits in a white box: `border-dark`, `radius-md`, padding 16, 16 between parts.
- An optional `p6` text-secondary line first ("For an asset that isn't in CQuel yet.").
- Fields in two columns (one on narrow screens); wrap a field in `cq-iform__wide` to span both (Name).
- **Footer:** a `border-light` rule above it, the action at the right end (`secondary`, `plus` icon: "Add asset"). Left of the action:
  - while the action is disabled, what's needed: "Name and city are needed" (`p7` text-tertiary);
  - after adding, the confirmation with a 16px `check` icon: "Hotel Bull Ring is in the batch" (`p7` text-secondary, `role="status"`). It clears as soon as Ops type again.
- Enter in a field submits.

### The consumer provides
`intro`, `action: {label, icon, onClick, disabled}`, `needed`, `done`, and the fields as children.

---

## Input

The field box. Default 40, the standard height for every field, including filter bars. `small` 32 only for a dense toolbar inside a card.

### States
Border border-dark; hover black-4; focus a 2px black-7 border, no halo (no orange; on mouse click too); `error` danger mark border; `disabled` bg-container-grey with text-tertiary (no opacity fade). Placeholder text-tertiary. `search` adds the search icon in icon-default.

### The consumer provides
`value`/`defaultValue`, `placeholder`, `onChange`, `size`, `error`, `disabled`, `search`, `unit` (shown inside the box on the right in `p6` text-tertiary: "m²"), `ariaLabel` (only when no visible label is possible).

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

## LinkRow

A "go to another tab" row: a plain white card row that sends the person to another tab of the same page.

### Anatomy
- `border-dark`, `radius-lg`, padding 12/16, white. The title in `h8`, one `p7` text-secondary line, `chevron-right` (16, `icon-default`) on the right.
- Hover `black-1`; keyboard focus is the black focus ring.

### Rules
- Never a tinted ground.
- Supplier Overview: "Sites & documents", "3 sites on a map, their sizes and files, plus the design document, price template and commission form".

### The consumer provides
`title`, `text`, `onClick` or `href`.

- **C3 (18 Nov):** the supplier Overview now links to Sites & documents with a `tertiary` "Sites & documents · 3 sites, 7 files ›" under the map, not a LinkRow. LinkRow stays for "go to another tab" rows elsewhere.

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
- **The one exception** is the AssetWindow (Fix assets, Edit asset data): about 1000 wide (`width`), with a flush body (`flush`) holding its side list.
- **Never taller than the screen:** on the scrim the Modal is a flex column at most `100dvh − 32` high; the header and footer stay put and the body scrolls (a flush body hands scrolling to its own panes).

### The consumer provides
`open`, `title`, `subtitle`, `children`, `footer`, `onClose`, `width`, `flush`.

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

## OfferCard

The one card that needs you on the supplier Overview, and the whole indicative offer flow: upload, check, send, and after. The brief, the FindField and the chapters stay on the same page. (C3 18 Nov; states C4 18 Nov.)

### Frame
- White, `border-dark`, `radius-lg`, padding 20/24, 16 between parts.
- While it needs you (start, reading, check): the 4px `brand-6` top bar, the ResponsibilityPill "Your action" and `s3` "Due 9 May".
- Steps (Chip track): Upload your quote · Check what we read · Send it. These are the supplier's own steps only; the tender's stages are the StageList in the rail. Step notes show only at the start.

### States (the card on the Overview; the flow itself is in the OfferWindow since 19 Nov)
1. **Start:** the title "Send an indicative offer" in `h6`, the `p6` line "Upload your quote with one total for every site. It isn't binding: you update it after the site visit."; on the right `primary` large "Upload your quote" (`upload` icon), which opens the OfferWindow and the file picker together; under it the `p6` sentence "Not bidding? Decline this tender" (link `h8`, 14px). Steps: Upload `now`, with notes.
2. **In progress** (`progress`: the window was closed before sending): the pill and "Due 9 May", the title "Finish your indicative offer", the `p6` line "3 files · <status line>"; on the right `primary` large "Continue your offer" with Decline under it. Steps: Check what we read `now`.
3. **Sent:** the card no longer needs you: no orange bar, no pill, no primary.
   - `s3` "Sent · due 9 May", the title "Your indicative offer is in", the `p6` line "You can edit it until 9 May; CQuel is told when you change it. After the deadline, CQuel tells you if you're on the shortlist."; right: "View your files" (`tertiary`) and "Edit your offer" (`secondary`). All three steps `done`.
   - **What the customer compares** (C5; replaces "How your offer reads"): `h7`, with "Your figures after your answers. Flags show what's outside the range the customer expects." Three groups, each an `s3` label over a 4-column InfoCell grid: **Price** (Total price, note "excl. VAT" · Price per kWp, worked out) · **Speed** (Start · Lead time · Installation · Commissioning) · **Quality** (Panel warranty · Workmanship warranty · Inverter warranty · PI insurance). Out-of-range values are flagged InfoCells; a value an answer changed shows the old one struck through.
   - **Your answers:** a RequirementGroup with a neutral pill "1 of 2", one row per question: done with the answer, or open with "Not answered: the customer sees what we read" and "Answer now" (`tertiary`), which reopens the OfferWindow.
- "Edit your offer" and "Answer now" reopen the OfferWindow ("Edit your offer", Cancel, "Send changes").
- `reading` and `check` still render in the card for older screens, but new screens use the OfferWindow.

### Decided (Olena, 18 Nov)
- Every change after sending notifies CQuel.
- "How your offer reads" is shown to suppliers and written automatically from the quote and the brief; Ops don't check the lines first.
- It never compares with other suppliers. No scores, no ranks.

### Words
The stage is "indicative offer", the file is "your quote". Never "first price".

### Still open
Variants (not in round 1); prices per site (round 1 asks for one total; per-site prices would make "Total price" one row per site); the Commission Form is signed at the site visit.

### The consumer provides
`state`: 'start' | 'progress' | 'sent' (also 'reading' | 'check'); `editing` (after sending); `id`, `cardRef`; `due`, `title`, `text`; start: `action`, `onDecline` / `declineHref`; reading: `file: {name, meta}`, `progress` (0–1, else animated), `onCancel`; check: `file`, `onReplace`, the check rows as `children`, `openCount`, `onSend`, `onCancelEdit`; progress: `progressText`, `onContinue`; sent: `compare: [{label, items}]` (InfoCell items), `answers: [{title, done, line, onAnswer}]`, `onView` / `viewHref`, `viewLabel`, `onEdit`, `sentText` (C4's `summary` and `reads` still work); `steps` to override the labels.

---

## OfferWindow

The supplier's indicative offer in its own full window over the tender page, with the brief to hand. Everything from C4 and C5 (files, check rows, "Also in your offer", questions) lives here; the Overview keeps only the OfferCard. Like the Ops AssetWindow. (19 Nov 2026; canvas C6–C9, option B3.)

Olena, 19 Nov: putting the whole flow on one screen isn't good UI.

### Frame
- Fixed, full screen, white, `role="dialog"`, `aria-modal`. Escape and Close both close it, and nothing is lost. The page behind doesn't scroll.
- **Header** (64, `border-dark` line under, padding 0 24): Close (IconButton `cross`); the title in `h7` ("Your indicative offer", or "Edit your offer" after sending) over "<tender title> · due 9 May" in `p7` text-secondary; on the right "Save and close" (`secondary`).
- **Footer** (72, `border-dark` line on top, padding 0 24, right-aligned): the `p7` status line; Cancel (`secondary`, only when editing after sending); `primary` large "Send your offer" / "Send changes", disabled until the files are read and every check row is done. Sending closes the window and shows the sent card on the Overview.

### Left (main)
Scrolls. Content at most 860, centred, padding 24/32/48, 20 between parts:
1. The supplier's Steps (ChipTrack); step notes only before upload.
2. "This is what the customer sees. Edit anything we got wrong." (`p6`, once files are read).
3. "Your files" (OfferSection + QuoteFiles).
4. "What we read": the check rows (RequirementRow, with flags).
5. "Also in your offer" (`h8`, "· not asked for in the brief" in `p7` text-tertiary, a `p6` text-secondary bullet list): what the supplier sent that the brief didn't ask for, so nothing is lost.
6. "Questions on your quote" (RequirementGroup + QuestionRow).

### Right column
400 wide, `bg-container-grey`, a `border-dark` line on the left, scrolls on its own, padding 20/24/32, 20 between parts:
1. AboutCard for the selected row, only when one is selected.
2. FindField `compact` ("Find it in this tender").
3. **The brief, in short:** key facts as SpecList `facts` rows (Sites · Size · Installation · Budget, with the `~` estimate mark); "The brief asks for" as a `p7` bullet list; "Not known yet" as one `p7` line; "Full brief" (link), which closes the window and scrolls the Overview to "1 The job".

### The selected row
Clicking or tabbing into a check row or question selects it: a `black-1` ground, `radius-md`, the row widened by 12 each side so the text doesn't move, and the right column shows its AboutCard. One at a time.

### Status line
"Upload your files to start" · "Reading your files" · "1 to fill in before you send" · "1 question not answered: we use what we read" · "Ready to send" (or "CQuel is told when you send changes" when editing).

### Narrow screens
Below 1000 the right column moves under the main column and the body scrolls as one.

### Not in this update
A per-site view (per-site systems) belongs with the final offer. Linking every check row to its brief item depends on the brief being split into items; the build has links for the five check rows and two questions only.

### The consumer provides
`phase`: 'start' | 'reading' | 'check'; `editing`; `tenderTitle`, `due`; `openCount`, `unanswered` (or `status`); `about` (AboutCard props); `find` (FindField props); `brief: {facts, asks, notKnown, onFullBrief}`; `onClose`, `onSaveClose`, `onSend`, `onCancelEdit`; the main content as children (OfferSection: `title`, `also`, children). `inline` and `height` for previews.

---

## OpsAssetsTable

The Assets table on the Ops package page: one row per asset with its status and how much of the required and recommended data is in. Rows open in place. Replaces the Ops variant of Table (BlockingCell, RecommendedCell) on that page.

### Header
- "Assets" in `h7` with the count in text-tertiary ("Assets 6").
- FilterChips at the right end: Blocked · n, Ready · n, All · n. **The filter opens on All.**
- While rows are selected, the SelectionBar sits under the header (accent, "n selected", Clear, one action).

### Grid
- Columns `16px | 1.2fr | 124px | 1.5fr | 1.2fr | 108px | 32px`, gap 16, padding-left 20. At least 860 wide; narrower, the table scrolls sideways.
- Labels in `s3` capitals, text-tertiary: (checkbox) · ASSET · STATUS · REQUIRED · RECOMMENDED · BLOCKED SINCE · (chevron).
- **Checkbox:** square, 16, `border-dark`, `radius-sm`; checked `black-7`. Blocked and ready rows only; In Estimate rows keep the space empty. Clicking it never opens the row.
- **Asset:** the name in `h8` over the city in `p7` text-tertiary.
- **Status:** Tag, size small: Blocked `danger`, Ready `neutral`, In Estimate `neutral`.
- **Required, Recommended:** the Tally.
- **Blocked since:** the date in `p6` text-secondary, or "—".
- **Chevron:** `chevron-down`, 16, `icon-dark`; turns 180° while the row is open.

### Tally
- Line 1: a 16px StateMark (open while anything is missing, done when all is in) and "n of total": `h8` while required items are missing, otherwise `p6`.
- Line 2, `p7` text-secondary:
  - Required: the missing items with their state, comma separated ("Roof area · to confirm, Consumption data · no file");
  - Recommended: short names only ("Roof covering, Plans");
  - "All in" when nothing is missing.
- Not available counts as in. An item being edited counts as it was before the edit.
- State words: "no file", "to confirm", "files disagree", "not entered".

### Rows
- At least 56 high, 12 padding top and bottom, a `border-light` rule between rows (none under the last).
- The whole row is a button (`role=button`, `aria-expanded`, Enter and Space toggle it).
- Hover, selected and open rows are `black-1`. Keyboard focus is the inset 2px `black-7` ring.
- **Order:** blocked rows first.
- No progress bar and no summary line.

### Open row
- A white box (`border-light`, `radius-md`, padding 16), inset with padding-left 60.
- Three columns, 1 : 1.3 : 0.9, stacking on narrow screens:
  - **Required** and **Recommended:** an `s3` label, then each item with a 16px StateMark (done, na, open), the name in `h8` and its value or state in `p7`. A missing required item's state is text-accent; the rest text-secondary.
  - **Files:** "Files · n", then the file names in `p7` text-secondary (truncated), or "No files yet".
- Actions at the bottom right, after a `border-light` rule:
  - "Open asset page" (`tertiary`, `chevron-right` on the right);
  - blocked rows: "Fix this asset" (`primary`), opening the AssetWindow in fix mode at this asset;
  - ready and In Estimate rows: "Edit data" (`secondary`, `edit` icon), opening it in edit mode.

### The consumer provides
`rows: [{id, name, city, status: 'blocked'|'ready'|'started', statusLabel?, blockedSince, required: {total, missing: [{name, state}]}, recommended: {total, missing: [name]}, items: {required: [{name, line, state}], recommended: [...]}, files: [name], href?}]`, `selected`, `onSelect(ids)`, `selectionAction(ids) → {label, type?, onClick}`, `filter` / `defaultFilter` / `onFilter`, `defaultOpen`, `onFix(id)`, `onEdit(id)`, `onOpenAsset(id)`, `title`, `empty`.

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

## PlanTrack (unused)

**Unused (6 Nov 2026).** No page uses it. It stays for a later ops need; check with Olena before using it.

Ops plan state: draft → proposed → agreed → live, as four 6px dots.

### The consumer provides
`done`: 0–4. Pair it with a `p7` label ("Plan · proposed").

---

## Progress (unused)

**Unused (6 Nov 2026).** No page uses it: the prototype counts progress in words ("3 of 5"). It stays for a later need; check with Olena before using it.

A thin progress bar: 4 high, black-2 track, black-6 fill. Not orange: progress isn't a call to action.

### The consumer provides
`value`, `max`, `label` (`p7`, e.g. "3 of 5 projects").

---

## QuestionRow

A question on the supplier's quote: where the quote looks wrong or misses something the brief asks for. David's Clarifications, red items only; amber and green stay with Ops (agreed 17 Nov). (C5, 18 Nov 2026.)

### Where
In the OfferWindow, under "What we read" and "Also in your offer", inside a RequirementGroup "Questions on your quote" with the urgent pill "n to answer" (at 0: "All answered", neutral).

### Open question (StateMark open)
- The title in `h8`, what the brief asks in `p7` text-secondary.
- A grey box (`bg-container-grey`, `border-dark`, `radius-md`, padding 10/14): "What we read" (`p7` text-tertiary), the reading in `p6`, then the file's own words in quotes with a link to the source (`p7`, "Tender form ↗").
- CQuel's question in `h8`.
- The answer form, by kind:
  - **text:** a Textarea ("Your answer"), with "Attach a file" (`tertiary`, `upload` icon);
  - **yesno:** SegmentedChoice Yes / No / Not sure yet. Yes shows only what Yes needs ("Which months?" with an input); "Not sure yet" shows "The customer sees that this is settled at the site visit."
- "Save answer" (`secondary`); right-aligned, "Something in our reading is wrong?" (link, `p7`), which opens a Textarea "What did we get wrong?" saved with the answer.

### Answered question
Collapses to one row (StateMark done): the title, "Answered: Yes, Nov to Feb" in `p7`, and Edit (`tertiary`, `edit` icon).

### Rules
- Sending with questions open is allowed (Olena, 18 Nov: "yes, for now"; to check with Ops). The status line reads "1 question not answered: we use what we read".
- In the OfferWindow it can be the selected row: `black-1` ground, and the right column shows its AboutCard.

### The consumer provides
`question: {key, title, asks, read, quote, source, sourceHref, question, kind: 'text' | 'yesno', followUp, followUpPlaceholder}`, `answer: {text, choice, wrong}` (saved), `answerLine`, `onSave(answer)`, `onAttach`, `selected`, `onSelect`.

---

## QuoteFiles

The supplier's offer files: the drop row and the list of what was uploaded. Several files per offer. (C5, 18 Nov 2026; lives in the OfferWindow under "Your files".)

### Anatomy
- **UploadRow** with the offer wording: "Drop your quote and anything that goes with it", "Quote, price breakdown, drawings, datasheets. PDF, Word or Excel.", "Upload files" (`secondary`, `upload` icon).
- **File rows** under it: a 36px document icon box, the name in `h8` with an `xsmall` neutral Tag for what we read it as (Quote · Drawing · Policy), a `p7` line saying what's in it ("1 page · one total for the sites, net and gross, no breakdown"), and Remove (`tertiary`). A file with nothing for this tender: "Read · nothing for this tender found in it".
- **While reading:** every row says "Reading…" with the 4px bar (240, `black-2` track, `black-7` fill); no Tag, no Remove.

### Rules
- Adding files later reads them again and keeps what was already checked.

### The consumer provides
`files: [{name, kind, meta}]`, `reading`, `onUpload`, `onRemove(name)`.

---

## Radio

A 16px round choice; checked is a 5px black-7 ring.

### The consumer provides
`name`, `checked`, `onChange`, `label`.

---

## RequirementRow

One check on one asset, as a checklist row: "Usable roof area", "Consumption data". Used in the AssetWindow under RequirementGroup sections.

### Checks
Each service has a list of checks per solution. A **Required** check blocks the asset's next step; a **Recommended** one helps but never blocks. Estimates · Solar PV: Required are address and usable roof area; Recommended are consumption data, site or floor plans, roof drawings and roof covering. An asset is blocked while any required item isn't Done.

### Anatomy
- A grid: the 20px mark, 16 gap, the text, and the actions at the right end. 16 above and below, a `border-light` rule under each row.
- **Mark** (StateMark): a 20px circle. Done: `black-7` with a white tick. Open: an empty ring, 1.5px dashed `black-4`, no fill. Not available: `black-2` with a grey dash. It's a status mark, never a control, so it's round; only clickable checkboxes are square. Never orange.
- **Text:** the name in `h8` text-primary, one `p7` text-secondary line under it when there's something to say (the value and source, what's wanted).
- **Actions** sit at the right end, 8 apart, centred against the name and its line. Buttons on the white row are `soft`; on a tinted box they're `secondary`. On narrow screens they drop under the name.
- A found value or the edit box opens under the name, 12 below, starting at the text column.

### States
| State | Line | Right | Under the name |
|---|---|---|---|
| `done` | value · source | Edit (tertiary, `edit` icon on the left) | — |
| `confirm` | — | — | a FoundValue with "Use 420 m²" and "Enter another" |
| `disagree` | "The files disagree. Choose one, or enter another value." | — | one FoundValue per file, each with "Use <value>"; then "Another value" (soft) |
| `nofile` | what's wanted ("Bills or half-hourly meter data") | the item's upload (soft, `upload` icon: "Upload bills or meter data") and "Not available" (recommended only) | — |
| `missing` | optional hint | a small Input (240) and Save (soft) | — |
| `na` | "Not available" (name muted) | Undo (tertiary) | — |
| `edit` (a value item) | — | — | the edit box |
| `editfile` (a file item) | value · source | the item's upload and Cancel (soft) | — |

- **Edit box:** grey (`black-1`, `border-dark`, `radius-md`), not the yellow found-value box: nothing is waiting. Value (with its unit) and Source (a file and page, or "Typed") side by side; "Was 860 m² · from Kervelstraat_plans.pdf, page 1"; if the asset has moved on, a warning Banner: title "This asset's estimate has started", text "It used 860 m². After saving, its Estimate step shows “Roof area changed · check the estimate”."; then "Save 820 m²" (primary, the label follows what is typed) and Cancel (secondary) in one group.
- **While an item is being edited it still counts as Done:** the mark stays ticked, and the asset, side list and table don't change until Save or Cancel.
- Values that disagree are never chosen for Ops. A value read from a file is never used until Ops press Use.

### RequirementGroup
- A section, not a card. Its label is `s3` capitals in text-tertiary ("BLOCKING THE NEXT STEP", "RECOMMENDED, MISSING", "FILES"), the same style as the AssetWindow side list labels; the pill sits at the right end of the row; a `border-light` rule under it.
- **Pill:** `h9`, 24 high, `radius-full`, white with `border-dark`. It always carries its word: "1 open", "3 missing", "3 files", "1 file".
- **Urgent pill** (`urgent`): while the Blocking group has open items, the pill is the light accent (`bg-accent`, `border-accent`, `accent-hover` text). At 0 it goes back to white. The Recommended pill stays neutral.
- **Edit asset data:** the groups are titled "Required" and "Recommended".

### Supplier offer: check what we read (C4, 18 Nov)
No new components: each thing round 1 needs (total price, sites covered, start, duration, warranties) is a RequirementRow with the 20px StateMark.
- `done`: the line is "<value> · page <n>" (or "· Typed"); Edit (`tertiary`, `edit` icon) opens the grey edit box. For a single value use `edit: {kind: 'value'}`: the value input (420), Save (`primary`), Cancel (`secondary`). No Source select.
- `missing` with `inputBelow`: the line "Not in your quote", and under it the input (420, an example placeholder) and Save.
- `disagree` with `line`: "Your quote has 2 totals. Choose one, or enter another." One FoundValue per total with "Use £318,400" (`secondary`), then "Another value". We never choose for the supplier.
- Sites covered: `edit: {kind: 'list', items, selected}`: `s3` "Sites in your price · n of N" with "Select all" (link), a search field above 10 sites, a scrolling list (max 232) of "n · site name" checkboxes, "Save n sites" (`primary`) and Cancel. The row then reads "18 of 20 · not covered: …".
- `open` (display only, with `action`): a gap in "How your offer reads to the customer", e.g. "Seafront protection isn't in your quote" with "See in the brief" (`tertiary`). `readonly` on a `done` row hides Edit.
- **Buttons stay as in the rest of the system:** `soft` on the white row (Save next to the input, "Another value"), `secondary` on tinted boxes (FoundValue's Use). The concept build has no `soft` yet; it should add one rather than use `secondary` here.

### The consumer provides
`name`, `state`, `required`, `value`, `source`, `unit`, `hint`, `found` (FoundValue props), `options` (two FoundValues), `uploadLabel`, `placeholder`, `edit: {kind?: 'value' | 'list', value, placeholder, items, selected, noun, title, sources, source, was, warning: {title, text}}`, `line` (overrides the line), `inputBelow`, `readonly`, `action`, and `onUse`, `onEnterAnother`, `onUpload`, `onNotAvailable`, `onSave(value)`, `onUndo`, `onEdit`, `onCancel`. RequirementGroup takes `label`, `count`, `countLabel` ("open", or `['file', 'files']` for singular and plural), `pill` (any text), `urgent`, children.

### Supplier offer: flags, choices and selection (C5 18 Nov, window 19 Nov)
- **Flag** (`flags`): a `p7` line in `status-warning-text` with the 14px `alert` icon, under the value line. It says what the customer will see: "Panels: expected at least 25 years · Workmanship: expected at least 5 years". A flag never blocks sending.
- **No unit:** a value without a unit is an `open` row with a flag ("No unit given for installation and commissioning: days or weeks?"); under it (as `children`) a SegmentedChoice Days / Weeks and Save. This is the only kind of check row that blocks sending.
- **Warranties** edit as three number inputs with "years" inside (`edit: {kind: 'fields', fields: [{key, label, unit, value}]}`): Panels · Inverters · Workmanship. The flags update on save.
- **Selected row** (`selected`, `onSelect`): in the OfferWindow, clicking or tabbing into a row selects it: `black-1` ground, `radius-md`, widened 12 each side so the text doesn't move. The right column shows its AboutCard.

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
- Esc clears the box. Once there's text, a plain 16px `cross` icon button (aria-label "Clear search", no fill, no tooltip) sits at the right: `black-4`, `black-7` on hover, the black ring on keyboard focus. It clears and returns focus to the box. Never the browser's own clear button (it draws a blue ×): hide it.
- The typed text uses the product font (`p6`, Schibsted Grotesk). Inputs never fall back to the browser's default font.
- No match: the list shows "No packages match “<text>”" with a "Clear search" link.

### States
Hover border black-4 · focus 2px black-7 border · disabled bg-container-grey.

### Rules
- Always a visible label. The placeholder is a hint, never the label.
- One search per list. It sits first in the FilterBar.

---

## SegmentedChoice

A small radiogroup of 2–4 options side by side: Days / Weeks, Yes / No / Not sure yet. (C5, 18 Nov 2026.)

### Anatomy
- 36 high, `border-dark`, `radius-md`, the options split by 1px `border-dark` lines.
- The chosen option is `black-7` with white `h8`; the others are white `p6`, hover `black-2`.
- `role="radiogroup"` with a label; each option is a `radio`. Keyboard focus: the inset black ring.

### Rules
- For a short, closed choice inside a form or a check row. More than four options, or long labels: Radio or Select.
- Not a filter (that's FilterChips) and not navigation (that's Tabs).

### The consumer provides
`label`, `options` (strings, or `{value, label}`), `value`, `onChange(value)`.

---

## Select

A dropdown field in a form, inside a FormField.

### Rules
- The field box: 40 tall (`small` 32), radius-md, border-dark, white, padding 0 12. The value (`p6`) on the left, the placeholder in text-tertiary, and the 16px `chevron-down` icon (icon-dark) on the right, both vertically centred. Never a drawn chevron.
- States as Input: hover border black-4; open border black-6; focus a 2px black-7 border, no halo; `error` danger border; `disabled` grey with text-tertiary.
- **The menu** is the one CQuel menu, the same as FilterSelect and FactSelect: white, `border-dark`, `radius-md`, `elevation-floating`, padding 6; rows `p6`; the row under the pointer or keyboard `black-2`; the chosen one `h8` with a 16px `check` at the right, no fill. Never the browser's menu.
- Keyboard: listbox behaviour (see FilterSelect).

### The consumer provides
`options` (strings or `{value, label}`), `value`/`defaultValue`, `placeholder`, `onChange` (receives `{target: {value}}`) or `onValueChange(value)`, `size`, `error`, `disabled`.

### Labels
Every field has a visible label: wrap it in a FormField (forms) or use SearchField / FilterSelect (filter bars). A placeholder is a hint, never the label.

---

## SelectionBar

Above a Table while rows are selected: the count, Clear and one bulk action.

### Anatomy
- `bg-accent` (the light accent), `radius-md`, padding 8/8/8/16, inside the table card between its header and the column labels (Table's `toolbar`).
- "2 selected" in `h8` `accent-hover`: the only orange text. Then on the right a tertiary "Clear" and one button that names the action and count. Their labels keep their own colours.
- No asset names: the ticked rows already show which assets are selected.

### Rules
- It shows only while something is selected; Clear empties the selection and the bar goes.
- **Row actions pause while it shows:** rows stop being links, so a click can't open a page and lose the selection. The checkboxes keep working.
- **The action follows the selection** (Ops Assets table): only ready assets → "Start estimates for 2" (`primary`); any blocked asset → "Fix 3 assets" (`strong`), which opens the Fix assets window at the first selected asset.

### The consumer provides
`count`, `action: {label, type?: 'primary' | 'strong', onClick}`, `onClear`.

---

## ServiceCards

Service filter cards on a batch page: they choose which assets the list below shows.

### Rules
- **Cards:** "All" first with the batch's asset count, then one card per service that has assets in the batch now, in service order. No card for a service with 0.
- **Content:** the service name in `h8`, the asset count in `h4` with tabular figures, and optionally "+<n> done" in `p7` text-tertiary when assets passed through that service. Nothing else.
- **Shape:** `radius-md`, 12/16 padding, equal columns 8 apart.
- **States:**
  - Default: white (`bg-container`) with the `border-dark` border.
  - Hover: `black-2`, same border.
  - Selected: white, same border, and a 4px `brand-6` bar along the top, inside the card and clipped by its radius. The content doesn't move.
  - Focus: the black focus ring.
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

## SiteMap

The tender's sites on a real, interactive map. (C3, 18 Nov 2026; replaces the 17 Nov drawn map.)

### Anatomy
- A real map image (OpenStreetMap) keeping its aspect ratio, `radius-md`, `border-light`. It sits beside the job's InfoCells (3fr map, 2fr cells), not full width, so it isn't too tall. "© OpenStreetMap contributors" bottom left on 85% white. In the build it should become a live map with real coordinates.
- **Pins** are buttons named "Site <n>, <name>": 24px `black-7` circles with a white `h9` number and a 2px white border. The selected pin is 28px with a 3px ink ring. Never orange: a selected pin is "selected", not "needs you".
- **SitePopover** (a pin's click; nothing is open by default): white, `border-dark`, `radius-md`, `elevation-floating`, 240 wide: "<n> · <name>" (`h8`) with a small Close IconButton, the address (`p7`), the size (`p6`), and "<n> files ›" which opens Sites & documents. It opens beside the pin and never covers another pin: it tries right, left, below and above inside the map, and when none fits it reaches up to 64 past the map's edge instead.
- **Distance tag** top right: white pill, `border-dark`, `p7` text-secondary ("41 miles from you").

### Rules
- No list of sites under the map: the list lives in the Sites & documents tab. Under the map, in the Chapter: the seafront note (`p7`) and "Sites & documents · 3 sites, 7 files ›" (`tertiary`), which is also the text alternative to the map.
- Accessibility: pins are real buttons with names; the popover's Close is reachable by keyboard.

### The consumer provides
`image`, `width`, `height` (the image's size, for the aspect ratio), `credit`, `sites: [{n, name, address, size, files, left, top}]` (positions in %), `distance`, `onFiles(n)`, `defaultOpen`. Without `image`, a plain grey ground (with optional `water`) is drawn.

---

## SolutionIcon3D

One 3D illustration per solution (solar PV, heat pump, EV charging, LED, …), the same family as ServiceIcon.

### Rules
- Used only in the TenderRail header: 112px inside a 150px white circle at 55% opacity. Never in tabs, tables, chips or nav.
- Files: asset group "Solutions" here; `public/icons/services/` in the prototype: `solar-pv.png`, `heat-pump.png`, `ev-charging.png`, `led.png` (delivered 18 Nov).
- Decorative: empty alt, hidden from screen readers. The solution's name is in the text next to it.

### The consumer provides
`solution`: `'solar-pv' | 'heat-pump' | 'ev-charging' | 'led'` (`'solar'` still works; or `src`), `size` (112 by default). Outside this design system, set `CQuelDS.solutionIconBase` to the folder with `<solution>.png`.

---

## SpecList

Label | value rows for values that are sentences: "The job", "What to price and send", "Checked at the site visit", "Not known yet".

### Anatomy
- Two columns: the label in `h8` text-title (200 wide; 140 in a half-width card with `narrow`), the value in `p6`, an optional `p7` text-secondary note under the value ("CQuel is asking the customer").
- Rows 12 top and bottom, a `border-light` rule between rows, 16 side padding. Flush in a Card (`flush`).

### Rules
- DetailsGrid stays for short facts (label over value). Use SpecList when a value is a sentence.
- Two half-width SpecList cards in a row sit 16 apart and keep the same height.

### The consumer provides
`rows: [{label, value, note}]`, `narrow` or `labelWidth`.

- **C3 (18 Nov):** the supplier Overview no longer uses SpecList; its chapters use InfoCells (Chapter). SpecList stays for label | sentence rows elsewhere.

### `facts` rows (key facts)
- One fact per row: the label in `p6` text-secondary on the left, the value in `h8` on the right; a `border-light` line above the first row and under each.
- An estimate gets the `~` mark in text-tertiary before the value (`estimate`), read out as "Estimate:".
- Use: the brief in short in the OfferWindow (Sites · Size · Installation · Budget).

---

## StageList

How the tender runs, for everyone: the tender's stages, the same for every invited supplier. Lives only in the TenderRail. (C3, 18 Nov 2026.)

### Anatomy
- Stages: Indicative offer · Shortlist · Site visit · Final offer · Customer chooses, each with a `p7` text-secondary line ("All invited suppliers · now", "CQuel tells everyone either way").
- 12px dots joined by a 2px `border-dark` line, 14 between rows in the rail.
- **Current:** the stage in `h8`, `brand-6` dot with a 3px `bg-accent` ring.
- **Later:** `p6`, a white dot with a 2px `black-4` border.
- **Done:** the done chip's look, black with a white tick.

### Rules
- It must not look like the supplier's own steps. Those are Steps chips on a horizontal track in the OfferCard.
- No dates unless we hold them. The deadline is said once, on the OfferCard.
- Timeline stays for dated history.

### The consumer provides
`stages: [{title, detail, state: 'done' | 'now' | 'next'}]`, `label` (defaults to "How this tender runs").

---

## StatusCard

On the package page, in PageHeader's aside: which service the package is in, and the one way into it.

### Rules
- White, 1px `border-dark`, 16 radius, padding 18/20 with 84 on the left, and a 30 left margin so the icon isn't clipped.
- ServiceIcon at 116: absolute, left −30, centred on the card's height, breaking out over the left border.
- Text: "This package is in" in `p7` text-tertiary over the service name in `h4`. No third line, except on Ops (below).
- On the right: the large `strong` Button with `chevron-right` on the right, named after the service. It opens that tab.

| Service | Button |
|---|---|
| Estimates | See estimates |
| Planning | See surveys |
| Tender | See offers |
| Pricing | See prices |
| Delivery | See delivery |

- **Ops, assets to fix** (`fix`): a third line in `p7` text-secondary, "3 assets need fixing first", and the button becomes "Fix 3 assets" (large `strong`, `chevron-right`). It opens the AssetWindow at the first blocked asset. With no blocked assets, the card is the customer one.
- **Completed:** "This package is" over "Complete", the Delivery icon, no button.
- **Closed** (Olena, 6 Nov): "This package is" over "Closed · <date>" in text-secondary, the icon of the service it closed in shown grey (grayscale, 70% opacity), no button. The only other variant.
- The tab of the current service carries the orange dot (see Tabs): it repeats where the package is.

### The consumer provides
`service`, `href`, `completed`, `closed`, `closedOn`, and on Ops `fix: {count, onClick | href}`.

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

## StickyActionBar

The offer's action while the OfferCard is out of view: a full-width bar fixed to the bottom of the window. (C3, 18 Nov 2026; replaces the floating card version, which Olena found too small and odd.)

### Anatomy
- Fixed to the bottom of the window, full width: white, a 1px `border-dark` line on top, a soft upward shadow (`0 -8px 24px rgba(30,40,50,.08)`), 72 high.
- Its content sits in the same 1536 page column as the top bar, with 32 padding:
  - Left: ResponsibilityPill "Your action", then the stage title in `h8` ("Send an indicative offer") over a `p7` text-secondary line ("Due 9 May · not binding, you update it after the site visit").
  - Right: the `link` "Decline this tender", then the `primary` large "Upload your quote" (`upload` icon).

### Offer states (C4)
- **Before upload:** "Send an indicative offer", the due line, Decline and "Upload your quote".
- **In progress** (the OfferWindow was closed before sending): "Finish your indicative offer" with the status line, and "Continue your offer".
- **Hidden** while the OfferWindow is open and after sending. (C4's "Fill in" / "Send your offer" from the bar moved into the window's footer.)

### Behaviour
- Slides up (200ms) when the OfferCard scrolls out of view (IntersectionObserver, the top bar's 64 as the margin) and slides back down when the card returns. No slide with reduced motion.
- It never shows at the same time as the OfferCard, so there is still one primary in view.
- While hidden it's `aria-hidden`, can't be clicked and its buttons are disabled.
- The main column keeps 112 bottom padding so the bar never covers the last card.

### The consumer provides
`targetId` (the OfferCard's id; the bar watches it) or `show`, `title`, `line`, `onDecline` or `declineHref`, `action: {label, onClick | href, icon?}` (`icon: null` for none). `inline` draws it in place for previews.

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
  - Padding 12/16/12/32, at least 56 tall, `border-light` between rows, hover `black-1`. A focused link row: `black-2` and its name underlined; never a ring or border on a row.
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

### Ops: the package's Assets table
- **Replaced by OpsAssetsTable (11 Nov 2026).** The rules below stay for reference until the prototype has moved over; don't use BlockingCell or RecommendedCell on new screens.
- Columns: ASSET · STEP · BLOCKING THE NEXT STEP · RECOMMENDED, MISSING · BLOCKED SINCE · chevron.
- **BlockingCell** (`type: 'blocking'`): "<item> · <state>" in `h8` after the 6px `brand-6` dot ("Roof area · to confirm"), the detail under it in `p7` ("420 m² found in Dachplan_Halle_A.pdf"). "—" when nothing blocks.
- **RecommendedCell** (`type: 'recommended'`): the count and the names ("3 · bills, plans, covering"), or "—".
- **FilterChips** in the group header, on the right (`aside`): Blocked · n (the default), Ready · n, All · n.
- **Order:** blocked assets first, oldest Blocked since first; started assets next; ready assets last.
- **Rows:** a blocked row opens the AssetWindow at that asset; any other row opens the asset page.
- **Selection** (`selectable`): a 16px square checkbox column first (square because it's clickable). Every row that can take a bulk action gets a box (`selectable: true`): blocked and ready assets. Started assets get none and keep the space empty. Selecting shows the SelectionBar in the `toolbar` slot; while it shows, rows stop being links. A selected row is `black-1`.
- **The action follows the selection:** only ready assets → "Start estimates for n" (`primary`); any blocked asset → "Fix n assets" (`strong`), opening the Fix assets window at the first selected asset.
- No "Your action" or customer labels on Ops rows: a row says what is there and what is missing.

### Ops: the Data card on the asset page
- A flush Card titled "Data for <service>", with two secondary buttons on the right: "Upload documents" (`upload` icon) and "Edit data" (opens the AssetWindow in edit mode).
- A read-only Table: a `check` column (StateMark: a round status mark, ink with a tick when Done, a dashed empty ring when missing, grey with a dash when Not available), then ITEM (title) · REQUIREMENT (Required / Recommended) · VALUE · SOURCE ("Roof_layout_HH.pdf · page 1", "Asset record", "—").
- Read-only. Every change goes through Edit data.

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
  - `blocking` cells are `{item, state, detail}` or empty; `recommended` cells `{count, names}`; `check` cells `true`/`false`.
- Ops: `aside` (right of the title, the FilterChips), `toolbar` (the SelectionBar), `selectable`, `selected` (ids), `onSelect(ids)`; rows take `selectable: true` and `label` (the checkbox's name).

### Supplier: the Sites table (v53)
- Columns SITE · SYSTEM · DOCUMENTS · action. SITE is "<n> · <name>" with the address under it (`title` with detail); the number matches the SiteMap pin.
- DOCUMENTS (`type: 'files'`): "2 files" in `p6`, the names under it in `p7` text-tertiary, and a download IconButton ("Download files for <site>").
- Last column (`type: 'button'`): tertiary "View site" with `chevron-right` on the right.
- The card header carries "Price all three. If you can't do one, say which in your quote." in `p7`.
- **Row actions:** supplier tables may carry actions in rows (download, "View site"): suppliers come to take files away, and the per-site download is the job. Customer tables keep "no action buttons in rows".

### Supplier: the Tenders list (19 Nov)
- One flush Card per group (Needs you · In progress · Closed), each a Table with `title` and `count`; empty groups are hidden.
- Columns TENDER (`title` with the customer as detail) · SOLUTION · SITES (left-aligned under its label, tabular figures) · NEXT STEP (`twoLines`; OUTCOME in Closed) · pill (`owner`, 120) · chevron (16); grid `1.4fr 0.8fr 80px 1.2fr 120px 16px`.
- NEXT STEP's main line is `h8` in Needs you (`emphasis`), `p6` elsewhere. Only Needs you rows carry the "Your action" pill. Closed rows are `muted`. A new invitation not opened yet has `changed` (the ChangedDot in the 32 left padding).
- No solution icons in rows.

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
- Hover (inactive tab): text to `text-primary` and a `black-3` underline.
- Keyboard focus: the black focus ring, with square corners: never round the tab itself, or the underline curves at its ends. The active tab keeps its straight orange underline inside the ring.
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

## TenderRail

The left column of the supplier tender page. The tender is the parent: the rail is white next to the grey story, and holds what the tender is, why this supplier was invited and how the tender runs. (C3, 18 Nov 2026; replaces the 17 Nov rail.)

### Anatomy
- 400 wide, white (`bg-container`), a `border-dark` line on the right.
- **Header band:** `status-info-bg` with a `status-info-border` line under it, padding 24/32/20.
  - Top right, a SolutionIcon3D (112) in a 150px white circle at 55% opacity, bleeding off the top-right corner and clipped by the band. The band stops at the rail's edge; it never runs into the page margin.
  - Under it, 56 from the top: `s3` "Tender · <solution>" in text-tertiary, the title in `h6`, "For <customer>" in `p7` text-secondary.
- **Body,** padding 20/32/56, 16 between blocks:
  1. "Why you were invited": Banner `neutral` with the `info` icon (`bg-container-grey`, 1px `border-dark`; not the blue info ground). It explains, it doesn't flag a state.
  2. Facts: a 2-column grid, label `p7` text-tertiary over value `h8`, optional `p7` note; 24 × 16 gaps. At most four. A fact said elsewhere on the page is left out.
  3. "How this tender runs": StageList under an `s3` label and a `border-light` line.
  4. "How CQuel is paid": InfoCard `warm` with "Read the Commission Form".
- **No status block and no action** in the rail. Status and actions live on the right (OfferCard, StickyActionBar).

### The consumer provides
`solution` (SolutionIcon3D key, e.g. 'solar-pv') or `iconSrc`, `service` (the solution's name), `title`, `customer`, `why`, `facts: [{label, value, note}]` (max 4), `stages` (StageList), `paid`, `formLink: {label?, href | onClick}`.

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
- **Data changes (Ops):** every saved change is an event with the old value: "Usable roof area added" / "1,150 m² · from Roof_layout_HH.pdf"; "Usable roof area changed" / "860 → 820 m²"; "Roof covering · Not available". Changes the assistant makes are events too.
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

## UploadRow

The drop row: where documents come in.

### Anatomy
- `black-2` background, 1.5px dashed `black-3` border (`black-4` on hover and while dragging), `radius-md`, padding 12 / 12 / 12 / 16.
- **Icon:** the 20px `upload` icon (icon-strong) in a 36px white box, `border-dark`, `radius-md`.
- **Text,** two lines: "Drop documents here" in `h8`, then "We read them and fill what we can" in `p7` text-secondary. No "·" joining them.
- **Button:** "Upload documents" as `secondary` on the right (never `soft` on the grey).

### Rules
- Dropping anywhere on the row uploads. Files can also come in through an item's own upload, Upload documents on the asset page, or the assistant.
- **The file list** isn't part of UploadRow any more: list files with DocumentList (it takes `state: 'reading' | 'unknown'`). UploadRow's `files` is retired.

### Wording variant: New batch (12 Nov 2026)
- In the New batch workspace (From files) the row reads "Drop a site list or plans here" / "We find the assets in them. You check before they're added." The button is "Upload files" (`secondary`, `upload` icon).
- The layout doesn't change: grey `black-2` surface, dashed `black-3` border, the 36px white icon box.

### The consumer provides
`onUpload`, `label`, and for a wording variant `title`, `hint`, `icon` (the button's icon).

- **In the AssetWindow** (11 Nov 2026) the drop zone is the stacked version at the top of the Documents column (white, 1.5px dashed `black-3`, centred icon box, two lines, the button under them), built into the workspace. UploadRow stays for other places that need a drop row inline.

---

## Workspace

The full-screen workspace: one pattern, two layouts. Use it for a job that needs the whole screen and ends in one action (fix assets, create a batch), never for a short task (that's a Modal).

### Frame (both layouts)
- `role=dialog`, `aria-modal`, `inset: 0`, white. No scrim, no radius. It locks the page's scroll while open; Esc closes, with the close check below.
- **Top bar:** at least 64 high, padding 8/16, a `border-dark` rule under it. In this order:
  - Close (IconButton `cross`);
  - the title in `h6`, the subtitle in `p7` text-secondary under it;
  - the main action at the right end, `primary`, size large ("Done", "Create batch", "Save assets").
- **Missing hint:** while the action is disabled, a hint sits just before it: the 16px `info` icon and a `p7` text-secondary line saying what's missing, one thing at a time ("Add at least one asset", then "Give the batch a name").
- **Close check:** closing with unsaved input turns the right side into a question (`p6`) with two `secondary` buttons: "Keep editing", then the close action ("Close without saving", "Close without creating").
- **Below 640:** the close check wraps to its own row under the title (question, then the buttons at the right end), and the missing hint hides.

### Layout 1: fix / edit
Side list | content | Documents. This is the AssetWindow; see its README.

### Layout 2: create
For creating something from a set of items: New batch now, later a package.
- **Content:** fluid, at most 880 wide, aligned to the left edge of the column (not centred), padding 24/32. It holds the ways to find items (Tabs: Search, From files, Add manually) with the AssetPicker, the UploadRow and the InlineForm.
- **Side column:** 380 wide, `black-1`, a `border-dark` rule on its left, padding 20, 20 between blocks. It holds the thing being made: first its fields (Name, Goal), then what's in it (ChosenList), then a `p7` line on what comes next.
- Content and side column scroll on their own.
- **Below 1024:** one column. The side column moves under the content (a `border-dark` rule above it) and the body scrolls as one.

### New batch
- Title "New batch", subtitle "<customer> · only Ops sees it until you share the plan". Action "Create batch"; hint "Add at least one asset", then "Give the batch a name".
- Content: "Find assets" (`h7`) and a `p6` line, then Tabs Search · From files · Add manually.
- Side column: "This batch" (`h7`), Name, Goal (optional, "In the customer's words. It shows at the top of the batch."), the ChosenList "Assets", then "Next, on the batch page: add packages. Each runs services for one solution on some of these assets."
- Close check: "Close without creating the batch?" / "Keep editing" / "Close without creating".
- Editing a batch's assets uses the same workspace without the fields: title "Assets in <batch>", action "Save assets", close "Close without saving".

### Retired
- The two-step Stepper for creating a batch (Assets → Goal). Creating happens on one screen. Use a stepper only where the order matters and earlier choices change later steps.
- The page footer bar with Continue / Back on creation flows. The action lives in the top bar.

### The consumer provides
`title`, `subtitle`, `action: {label, onClick, disabled}`, `hint` (what's missing), `dirty`, `question`, `closeLabel`, `onClose`, `side` (the side column's content), `sideLabel`, the content as children. For previews: `inline`, `height`, `confirming`.

---

## YourActionOnly

The customer's one responsibility filter: a checkbox in the FilterBar, "Your action only".

### Rules
- Sits after the selects, before Clear filters, aligned to the 40px controls. Checked: a black-7 box with a white tick. Never orange.
- It's the same filter as pressing the Your action SummaryCard; the two stay in sync and live in the URL (`?responsibility=you`).
- Ops screens use a Responsibility FilterSelect instead.
- **`label`** (19 Nov): the checkbox's words. Supplier screens pass "Your action only" so the label doesn't follow the prototype's customer/ops wording switch. Without it the default is "Your action only"; existing screens are unchanged.

### The consumer provides
`checked`, `onChange`, `label`.
