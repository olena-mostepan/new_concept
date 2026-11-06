# Cursor prompt: one CQuel dropdown everywhere

Paste everything below the line into Cursor, in the `new_concept` repo. Attach `dropdown-menu.png` and `filterbar-menu.png` from `docs/concept/wireframes/`.

---

Every dropdown in the concept opens the browser's own menu: the macOS list with a blue highlight. They also draw their arrow three different ways. The design system (version 37, `docs/design-system/components.md`: Select, FilterSelect, FactSelect) now has one CQuel menu for every dropdown. Build it once in `ui.tsx` and use it everywhere.

## 1. `Dropdown` in `components/concept/ui.tsx`

Build it on `@radix-ui/react-select` (already installed). Only `ui.tsx` imports Radix Select; pages use `Dropdown`.

**Props:**

- `value`
- `onValueChange(value)`
- `options: {value, label}[]`
- `placeholder?`
- `ariaLabel` (when there's no visible label)
- `size?: "default" | "small"`
- `disabled?`
- `error?`

**Trigger (the field):**

- `h-10` (small: `h-8`), full width, `rounded-md border border-border-dark bg-white px-3`, `flex items-center justify-between gap-2`.
- **Value:** `p6 text-text-primary`, truncated with an ellipsis, never wrapping. The placeholder is `text-text-tertiary`.
- **Arrow:** `<Icon name="chevron-down" size={16} />` in `text-icon-dark`, vertically centred by the flex row, 12 from the right edge. **Delete `SELECT_CHEVRON`** and every background-image or drawn chevron.
- **States:**
  - hover `border-black-4`;
  - open (`data-[state=open]`) and `focus-visible`: `border-black-6` plus the focus ring;
  - error: `border-status-danger-mark`;
  - disabled: `bg-bg-container-grey text-text-tertiary`.
- Reserve the arrow's space once only. No `pr-8` on top of a padded inner select.

**Menu (`Select.Content`, `position="popper"`, `sideOffset={4}`, `align="start"`):**

- **Box:** `bg-white border border-border-dark rounded-md shadow-floating p-1.5`.
- **Size:** at least the trigger's width (`min-w-[var(--radix-select-trigger-width)]`), up to 360 wide and 320 tall, then it scrolls.
- **Rows (`Select.Item`):**
  - `p6 text-text-primary px-3 py-2 rounded-sm`, `cursor-pointer`, `outline-none`;
  - highlighted (`data-[highlighted]`): `bg-bg-container-grey`;
  - selected (`data-[state=checked]`): `h8` on `bg-bg-container-grey`.
  - No tick and no blue.
- **Keyboard:** Radix's default (arrows, Home/End, Enter, Esc, type-ahead). Don't override it.

## 2. Use it everywhere

- **`FilterSelect`** (`ui.tsx`): render `Dropdown`.
  - Keep its visible label above the field and its "All …" first option.
  - Keep its "chosen" state: a non-empty value gives `border-black-6` and `text-text-primary`; the default value is `text-text-title`.
  - Radix Select doesn't allow `""` as an item value, so map the "All …" option to a sentinel such as `"__all"`, inside `FilterSelect` only.
- **`SurveysTab.tsx`:** replace the two native `<select>`s (Batch, Service) with `FilterSelect`, with visible labels "Batch" and "Service" and options "All batches" and "All services". Delete `selectClass` and `selectStyle`.
- **`OpsWorkstreamDrawer.tsx`:** replace the native `<select>`s (Solution, and the one around line 247) with `Dropdown`, keeping their `<label>` text above.
- **`FactSelect`** (the asset's Package menu): if it has its own menu styles, make its menu box and rows use the same classes as `Dropdown`'s menu, so the two look identical.

## 3. Search field icon

In the search field (`ui.tsx`, around line 660), the `search` icon must be vertically centred like the arrow: `top-1/2 -translate-y-1/2` on a block-level icon, 12 from the left. Check it lines up with the text baseline in the browser.

## Check

- Assets, the Batches list and Surveys: every dropdown opens a white CQuel menu, with the selected row SemiBold on grey. No blue and no macOS menu anywhere in `/concept`.
- **The arrow:** in every dropdown, its centre is level with the field's centre (measure it in the browser) and it sits 12 from the right. The search icon is centred the same way.
- A narrow field (Responsibility) shows "All" in full, not "Al".
- Keyboard: Tab to a dropdown, press Down, move with the arrows, Enter picks, Esc closes and focus returns to the field.
- `grep -rn "<select" components/concept app/concept` and `grep -rn "SELECT_CHEVRON" components/concept` return nothing. `grep -rn "react-select" components/concept` finds only `ui.tsx`.
- `npm run build` passes. Report pass or fail for each item and list the files you touched.
