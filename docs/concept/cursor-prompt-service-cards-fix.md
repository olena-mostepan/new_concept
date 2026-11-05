# Cursor prompt, part 34: one service card on the asset and package pages

Paste everything below the line into Cursor, in the `new_concept` repo. Attach `docs/concept/wireframes/111-service-card-anatomy.png` (white card, chips, grey panel): the target anatomy. Ignore its "Package" label and name; the asset header names the package now.

**Before you start:** part 32 (asset page by package) must be in the code. If part 33 is in too, keep its `FactsRow` and `tabTriggerClass`.

This prompt is closed. It fixes the asset page's package card and the package Overview's steps card so they share one anatomy. It doesn't change data, routes, the headers, History, Documents or the Assets table.

The design system has the same rules (version 32): `PackageCard`, `Chip`, `Steps` and `PhaseStepper` in `docs/design-system/`.

---

## Why

After part 32 the two cards drifted. On the asset page:

- the card shows only the current service chip;
- that chip has a black outline although there's nothing to switch;
- phases without a date show "—".

On the package page:

- the service chip floats on the grey page outside the card;
- the card has a title bar, then a grey box glued to its divider;
- the header says "Now".

Both should be the same thing: a white card holding the chips and one grey panel.

## 1. One anatomy for both cards

| Part | Value |
|---|---|
| Card | white, `border border-border-dark rounded-lg`, padding `px-5 pt-4 pb-5` (16/20/20). **No title bar and no divider.** |
| Chips row | first thing in the card: big display chips (`size="big"`), `gap-2` |
| Panel | 16 below the chips (`mt-4`): `surface-grey rounded-md bg-bg-container-grey px-4 pt-3 pb-4`. **No border.** |
| Panel head | title in `h8 text-text-primary` on the left, aside in `p7 text-text-tertiary` on the right, `items-baseline`, 16 above the content (`mb-4`) |
| Panel content | the chip track (Steps or PhaseStepper) or a `FactsRow` |

## 2. Asset page: the package card (`BuildingView.tsx`)

- **Chips:** every service this package has been through, in order. Done ones are done chips, and the current one is the now chip: "✓ Estimates · ✓ Tender · • Delivery". Today only the current chip shows; restore the done ones. Planned and not-required services get no chip.
- **Right side:** unchanged (ServiceIcon 72, "This asset is in <service>", "Open package ›"), vertically centred on the chips row.
- **Switching:**
  - The chips switch the panel **only when two or more of them have data** for this asset.
  - With one, every chip is a plain display chip: no button, no `role="tab"`, no hover, no tablist.
  - **No outline on the selected chip.** Remove `outline-2 outline-offset-1 outline-black-7` (the selected style in `ui.tsx`, around line 1123). The panel title already names the selection; keep `aria-selected`.
  - Keyboard focus keeps the standard outline on `:focus-visible` only.
- **Panel:** title "<Service> at this asset", aside as now ("Voltreny · contract €27k").

## 3. Package page: the Overview steps card (`PackageView.tsx`, `StepsCard`)

- Move the service chips that sit above the card **into** the card, as its first row (section 1). Delete the separate chips row on the page.
- Replace `Card title=… right="Now"` with the anatomy from section 1:
  - no card title bar;
  - the panel title "<Service> for this package" in `h8`;
  - the aside "<supplier> · <n> assets" (for example "Voltreny · 6 assets"), or "<n> assets" before a supplier is chosen.
  - **Remove "Now".**
- Remove the panel's `border border-border-light`, and the card's `headerClassName` and `bodyClassName` overrides.
- No status on the right: the package page has the StatusCard in its header.

## 4. Phase dates: no dashes

In `BuildingView.tsx`, `phaseWhen()` returns "—" when a phase has no date. Change it:

- **No date, not the current phase:** no date line at all.
- **No date, the current phase:** "Date to confirm" in `p7 text-text-tertiary`.
- **Dates and sources otherwise:** unchanged ("12 Aug" / "Contract start date"; "Est. 4 Nov" / "Estimate").

Check `DeliverySection.tsx` (around line 397) for the same "—" under a phase, and apply the same rule there.

## Check

- **Kervelstraat 14:** one white card, then:
  - chips "✓ Estimates · ✓ Tender · • Delivery";
  - the status and "Open package ›" on the right;
  - the grey panel "Delivery at this asset" with the phases.
  - No black outline anywhere. Phases without a date show no line, except the current one with "Date to confirm".
- **An asset where only one chip has data:** no chip is clickable.
- **An asset where two have data:**
  - clicking switches the panel and its title;
  - no outline appears on the selected chip;
  - Tab still shows the focus outline.
- **EV charging · Voltreny, Overview:**
  - one white card with the service chips at the top, then the grey panel "Delivery for this package", "Voltreny · 6 assets", and the steps;
  - no chips floating above the card;
  - no title bar or divider;
  - no "Now".
- **Both cards** measure the same: card padding 16/20/20, chips to panel 16, panel padding 12/16/16, panel title to content 16.
- `grep -rn 'outline-offset-1' components/concept` and `grep -rn '"—"' components/concept/BuildingView.tsx` return nothing.
- `npm run build` passes.
- **Report:** this checklist with pass or fail for each item, and every file you touched.
