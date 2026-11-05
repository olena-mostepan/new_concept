# Cursor prompt, part 28: one display-chip look on any background

Paste everything below the line into Cursor, in the `new_concept` repo. Attach `docs/concept/wireframes/delivery-chips-on-grey.png`: the same track on white (top) and on the grey panel (below). The two look the same.

**Before you start:** `Chip` and `ChipTrack` must be in `components/concept/ui.tsx` (part 26). If either is missing, stop and say so.

This prompt is closed. It changes how display chips and the chip track look everywhere. Filter chips, data and layout don't change.

---

## Why

Today a done chip is filled `black-2`, and so is the track line. On the grey "Delivery at this asset" panel both disappear, while the white upcoming chips stand out more than the finished ones. Rather than a second set of rules for grey, the display chip gets one look that holds on white and on grey.

## 1. `Chip` display looks (`ui.tsx`)

These apply only to chips without `onClick`:

- **`lead: 'done'`:** `bg-bg-container border border-border-dark pl-1 pr-[9px] h9 text-text-title`, with `RoundTick` in front. This replaces the `bg-black-2` fill. The padding is 1px less, so the border doesn't make the chip wider.
- **`lead: 'next'`:** `bg-(--chip-surface) border border-dashed border-black-4 px-[9px] p7 text-text-tertiary`. This replaces white with a solid border.
- **`lead: 'now'` and plain chips:** unchanged.

## 2. The surface variable (`app/globals.css`)

The dashed chip must have a solid fill in the colour of whatever it sits on, so the track line stops at its edge.

- Add `--chip-surface: var(--color-bg-container);` to `:root`.
- Add a class `.surface-grey { --chip-surface: var(--color-bg-container-grey); }`.

This is the only thing that differs between backgrounds. The chips look the same; nothing is passed as a prop.

## 3. Track line

In `ChipTrack`, change the line from `bg-black-2` to `bg-border-dark`.

## 4. Grey surfaces

- In `PackageStrip`, add `surface-grey` to the grey panel (`rounded-md border border-border-light bg-bg-container-grey …`).
- Find any other `bg-bg-container-grey` element that holds a `ChipTrack` or display `Chip`. Add `surface-grey` to it too, and list each one in your reply.

## 5. Big display chips for an asset's services

The service chips in `PackageStrip` (Estimates, Tender, Delivery) sit above the delivery phases. Today they're the same size as the phase chips, so they don't read as the level above.

- **Add `size?: "default" | "big"` to `Chip`.** It applies to display chips only.
- **`big` is 32px high (`h-8`)**, the same height as the filter chip and the big Tag. Its parts:
  - Label `h8`; `p6` for `next`.
  - Gap 8 (`gap-2`).
  - `RoundTick` at 16px. Give it a `size` prop.
  - Padding `px-[13px]`; `pl-[7px]` for `done`.
  - The same fills and borders as the default size.
- **In `PackageStrip`, render the service chips with `size="big"`.** Steps and phases stay at the default 24px.

## 6. The "Package" label in `PackageStrip`

The small "Package" above the package name is a card label, so it uses the `s3` style: 12px, SemiBold, capitals, +4% tracking, `text-text-tertiary`.

- Change its class from `p7 text-text-tertiary` to `s3 text-text-tertiary`.
- Keep the text "Package" in the code; the style does the capitals.
- Add `mt-0.5` to the package name under it.

## Check

- **Asset page, Halverkamp 19, "Delivery at this asset":**
  - Done chips are white with a thin grey border and the round black tick.
  - Installation is the light orange chip with the dot.
  - Commissioning and Handover have dashed outlines.
  - The line is visible between chips and doesn't show through any chip.
- **Package Overview steps (on white) and the package strip's service chips:** the same three looks.
- **The package strip's service chips are 32px with 14px labels,** clearly bigger than the 24px phase chips under them.
- `grep -rn "bg-black-2" components/concept/ui.tsx` doesn't match the Chip.
- The package strip label reads "PACKAGE" in small grey capitals above the name.
- `npm run build` passes.

## Done when

Display chips look identical on white and on grey, and the only per-surface difference is the `--chip-surface` fill behind dashed chips.
