# Cursor prompt, part 26: chips, steps, delivery phases and history

Paste everything below the line into Cursor, in the `new_concept` repo. Attach these from `docs/concept/wireframes/`: `chip-option-d.png`, `service-filter-cards.png`, `steps-options.png` (option A), `delivery-stages-unified.png`, `history-options.png` (option B) and `button-icons.png`.

**Before you start:** part 25 must be in the code: `Chip` in `ui.tsx`, `PackageView.tsx` with one tab row, the service filter cards on the batch page, and the asset page's Services chips. If any is missing, stop and say so.

This prompt is closed. It changes how chips, step progress, delivery phases and the asset History look, and finishes four leftovers from part 24, and adds button icons and IconButton. It doesn't change data, routes, tabs or page layout.

---

## Why

Delivery progress is drawn five ways today: outlined chips with a plain tick, numbered circles with grey ticks, numbered circles with no ticks, six mini circles per table row, and a dot timeline. One set of chips now marks a phase wherever it shows, so customers learn it once. The batch page's filter cards look disabled when they're grey, and the asset History has no marker for the one event that needs the customer.

## 1. Chip: two looks (`ui.tsx`)

Keep the one `Chip` component and its props (`children`, `lead`, `count`, `selected`, `onClick`). A chip with `onClick` is a **filter chip**; without it, a **display chip**. Add a third lead value, `lead: 'next'`, for a later step.

**Display chip** (not clickable; no hover, no focus ring):
- 24px high (`h-6`), `rounded-full`, `h9`, no border unless stated.
- `lead: 'done'`: `bg-black-2`, label `text-text-title`, padding `pl-[5px] pr-2.5`, gap 6. In front, a 14px **round tick**: a filled `black-7` circle with a white tick. Add it as `RoundTick` in `ui.tsx` (inline SVG: a circle `r=12` filled `var(--black-7)`, path `M7 12.5l3.2 3.2L17 9`, white stroke 2.6, round caps).
- `lead: 'now'`: `bg-bg-accent`, `border border-brand-3`, label `text-text-primary`, padding `px-[9px]`, gap 6, and the 6px `bg-brand-6` dot in front. Add `--brand-3: #f6bca5` and `--color-brand-3` to `app/globals.css` if they're missing.
- `lead: 'next'`: `bg-bg-container`, `border border-border-dark`, label `p7 text-text-tertiary` (regular weight), padding `px-[9px]`.

**Filter chip** (a button):
- 32px high (`h-8`), `rounded-full`, `px-3`, `p6`, `bg-bg-container`, `border border-border-dark`, `text-text-primary`. The count after the label in `text-text-tertiary`.
- Hover: `bg-bg-container-grey`.
- **Selected:** `bg-black-7 border-black-7`, label `h8 text-white`, count `text-white`. This replaces the outlined selected chip.
- Focus: the existing `focusRing`.

Everywhere that renders Chips keeps working: the asset page Services row becomes display chips, and FilterChips on Assets become filter chips with the black selected state.

## 2. Batch page: service filter cards (`BatchView.tsx`, around line 385)

- **Default:** `bg-bg-container border border-border-dark` (white). Remove `bg-bg-container-grey` and `border-black-2`.
- **Hover:** `hover:bg-bg-container-grey`, same border.
- **Selected:** white, `border border-border-dark`, and a 4px `brand-6` bar along the top, drawn inside the card and clipped by its radius: add `relative overflow-hidden` to the button and a child `<span aria-hidden className="absolute inset-x-0 top-0 h-1 bg-brand-6" />`. Remove the `shadow-[inset_0_3px_0_0_var(--brand-6)]`. The content doesn't move.
- No card's border ever turns dark. Focus keeps `focusRing`.
- Padding `px-4 py-3`. The count stays `h4 tabular-nums`; check it renders in Schibsted Grotesk (it looked monospaced in a screenshot) and fix the class if a mono font is applied.
- No card for a service with 0 projects.

## 3. Steps: chips on a track (`PackageView.tsx` `PhaseSteps`)

Replace the numbered circles. Use it for every service's steps card on the package Overview (Estimates, Planning, Tender, Pricing, Delivery).

- One equal column per step. Behind the chips, a 2px `bg-black-2` line from the centre of the first column to the centre of the last (`absolute`, `top-[11px]`, `left/right` at half a column).
- Each column, centred: a display Chip, then up to one `p7` line under it, 4 below.
- **Look per step** (from `looks()`):
  - `passed`: `lead: 'done'` with the label.
  - `now` **with work under way**: `lead: 'now'` with the count in the label: "Installation · 1". The line under it says when it started ("started 14 Oct", "asked 16 Oct") when the data has a date; otherwise no line.
  - `upcoming`: `lead: 'next'`.
- **Delivery only:**
  - Assets that haven't started sit on Start as a `lead: 'next'` chip "Start", with "3 awaiting start" under it in `p7 text-text-secondary`. Orange only marks a phase where work is under way.
  - Complete with assets is `lead: 'done'` with the count: "Complete · 2", and "last 7 Oct" under it (the latest completion date).
- No numbers in circles, no descriptions, no needs panels, no buttons.

## 4. Asset page: "Delivery at this asset" (`BuildingView.tsx` `DeliveryCard`)

- Same track as section 3, five columns (Start to Handover). Remove the numbered circles and `StageMark`.
- `done` → `lead: 'done'`, `now` → `lead: 'now'`, later → `lead: 'next'`. When every phase is done, all five are done chips.
- Under each chip, two lines, centred: the date in `p7 text-text-primary` (`phaseWhen`, "12 Aug", "Est. 4 Nov") and its source in `p7 text-text-tertiary` (`phaseSource`, "Contract start date", "From invoice · date to confirm", "Estimate"). Keep the existing logic for both.
- Keep the card title, the right slot ("Voltreny · contract €26k") and the 5-column grid.

## 5. Delivery tab: one chip per asset (`components/customer/delivery/CustomerDeliveryView.tsx`)

- Replace `CustomerPhaseStepperCompact` in the rows with one display Chip in a column headed **PHASE** (rename "DELIVERY STAGES"):
  - the phase the asset is in now: `lead: 'now'` with the phase name ("Installation");
  - every phase done: `lead: 'done'` "Complete";
  - not started: `lead: 'next'` "Start".
- **STATUS** stays one state per row, right-aligned: "Date to confirm" in `h8` (only on rows that have a date to confirm), "Handed over <date>" for a completed row with no date to confirm, "Awaiting start", "Overdue" in `text-status-danger-text`, otherwise "On track".
- Start date column: "12 Aug" with no year; "—" when there's none.
- Leave `CustomerPhaseStepper.tsx` itself in place if the product views elsewhere still use it; only the concept's Delivery tab stops using the compact one.

## 6. Asset page: History, date first (`BuildingView.tsx` `History`)

Option B in `history-options.png`.

- **Grid per event:** `grid-cols-[52px_16px_minmax(0,1fr)] gap-x-2.5`, 14px between events.
  - **Date column:** the date in `h9 text-text-title`, right-aligned, on the event's first line ("14 Oct").
  - **Rail:** an 8px dot, `mt-1.5`, with a 1px `bg-black-3` line running down to the next event's dot. No line after the last event.
  - **Event:** the title in `h8 text-text-primary`, the detail under it in `p7 text-text-secondary`.
- **Dots:** `bg-black-4` for every event, except an event that waits on the customer (a date to confirm, a decision, something to send): `bg-brand-6` with a 3px `bg-accent` ring (`shadow-[0_0_0_3px_var(--bg-accent)]`). At most the open ones get orange; once confirmed, the dot goes grey.
  - In the data, "waits on the customer" is the history item whose event matches the row's `confirmPhase` while the phase is still `from_invoice`. Add a `you?: boolean` to the derived item rather than matching text in the component.
- **Year:** when the list spans more than one year, put the year in `s3 text-text-tertiary` above the first event of each year, aligned with the event column. With one year, show it once above the list.
- Newest first, as now. With two or more projects, the detail still starts with the solution ("EV charging · …"). Ranges keep their dash ("€23–28k").
- Empty: "Nothing on file yet" in `p6 text-text-tertiary`.
- Remove the date column on the right.

## 7. Leftovers from part 24

Part 24 (design review fixes) is mostly in. Finish these:

- **Card overrides:** remove `headerClassName="px-6 py-3"` and `bodyClassName="px-6"` from the three cards in `dashboard.tsx` (lines ~134, ~207, ~459), and `headerClassName="py-3 pl-8 pr-6"` from `Decisions.tsx`. Keep `bodyClassName="p-0"` where a table runs edge to edge. Every card title then sits 16px in, in `h7`.
- **Stale stylesheet:** delete `styles/globals.css` (nothing imports it).
- **Duplicate pill:** delete `StatusPill.tsx`; nothing renders it any more.
- **Icons:** replace the last `lucide-react` import in `ConceptChrome.tsx` with the `Icon` component. If it's `Globe` or another icon with no CQuel equivalent, leave it and say which.

## 8. Buttons with icons, IconButton, and the full icon set

Attach `button-icons.png`.

**Before this section:** Olena copies every CQuel icon SVG into `public/icons/` (from the design system's Icons, or exported from Figma "Cquel. V3"), named as in the design system (`download.svg`, `upload.svg`, `edit.svg`, `trash.svg`, `more.svg`, `filter.svg` …). Today there are 8. If an icon this section needs is missing, use the nearest one and list it; never use lucide or a typed character.

**Button (`ui.tsx`):**
- Add `icon?: string` and `iconPosition?: 'left' | 'right'` (default `'left'`). Render `<Icon name={icon} size={size === 'small' ? 14 : 16} />` before or after the label, with `gap-2` (`gap-1.5` on small).
- Padding on the icon side: large `pl-3`/`pr-3`, default `pl-2`/`pr-2`, small `pl-1.5`/`pr-1.5`; the other side keeps its usual padding.
- **Right** is only for `chevron-right` on a button that goes to another page. Replace every typed "›" in a button label with `iconPosition="right" icon="chevron-right"`, starting with "Open <package> package" on the asset page.
- Never put an icon on a `link` button.

**IconButton (new, `ui.tsx`):**
- Props: `icon`, `label` (required), `type?: 'secondary' | 'tertiary'` (default `'tertiary'`), `size?: 'large' | 'default' | 'small'` (default `'default'`), `href`, `onClick`, `disabled`.
- Square: large `size-10` with a 20px icon, default `size-8` with 16px, small `size-6` with 14px and `rounded-sm`; others `rounded-md`.
- Secondary: `bg-bg-container border border-border-dark text-text-primary hover:bg-bg-container-grey`. Tertiary: no border, `text-icon-default hover:bg-bg-container-grey hover:text-icon-strong`.
- `aria-label={label}`, `focusRing`, and a tooltip with the label on hover and focus (`p7`, white on `black-7`, `px-2 py-1`, `rounded-md`, `shadow-floating`, 8 above).
- Use it for: Close on the ops drawer and the date modal (tertiary, default), and the icon buttons that exist today without a label. List each one you change.

**Check:** `grep -rn "›" components/concept --include=*.tsx` returns no button labels, and every icon-only button has an `aria-label`.

## Check

1. `grep -rn "CustomerPhaseStepperCompact" components/concept components/customer/delivery/CustomerDeliveryView.tsx` returns nothing.
2. `grep -rn "shadow-\[inset_0_3px" components/concept` returns nothing.
3. `grep -rn "StageMark" components/concept` returns nothing.
4. `grep -rn "border-\[1.5px\] border-black-7" components/concept/ui.tsx` returns nothing (the outlined selected chip is gone).
5. `grep -rn "px-6\|pl-8 pr-6" components/concept --include=*.tsx | grep -i "className=" | grep -i "header\|body"` returns nothing.
6. `ls styles/globals.css components/concept/StatusPill.tsx` finds neither.

## Expected values (Halvering)

- **Batch page, Flagship sites:** every service card is white; "All" has the 4px orange bar; hovering a card fills it pale grey and the border stays light.
- **Assets list:** "All 36" is a black chip with white text; the others are white with grey counts.
- **Package EV charging · Voltreny, Overview:** Delivery steps read: Start (plain, "3 awaiting start"), Design & survey (plain), Installation · 1 (orange dot, "started 14 Oct"), Commissioning (plain), Handover (plain), Complete · 2 (grey tick, "last 7 Oct").
- **Same package, Delivery tab:** Kervelstraat 14 shows an "Installation" now chip and "Date to confirm"; Speicherallee 7 a "Complete" done chip and "Date to confirm"; Halverkamp 19 "Complete" and "Handed over 30 Sep"; the three others a plain "Start" chip and "Awaiting start".
- **Asset Kervelstraat 14:**
  - Services: Estimates and Tender as grey tick chips, Delivery as the accent chip.
  - Delivery at this asset: Start and Design & survey done, Installation now with "14 Oct / From invoice · date to confirm", Commissioning and Handover plain with "Est. 4 Nov / Estimate" and "Est. 18 Nov / Estimate".
  - History: dates on the left; "Installing started · 14 Oct" has the orange dot; every other dot is grey; "2026" once above the list.

## Done when

- Chips, step cards, the asset Delivery card, the Delivery tab and History match the attached mocks in structure.
- Orange appears only on now chips, the selected service filter card's top bar, and the History dot for the open event.
- No dark borders on the service filter cards; the only black pill is the selected filter chip.
- **Unchanged:** data, routes, tabs, page layout, the ServicesBar on the Overview.
- **Build:** `npm run build` passes.
- **Report:** write this checklist into your final message with pass or fail for each item, and list every file you touched.
