# Cursor prompt: black keyboard focus, neutral hover

Paste everything below the line into Cursor, in the `new_concept` repo. Attach `focus-hover-v41.png` from `docs/concept/wireframes/`.

---

The soft grey focus halo and the light-orange hover are replaced. The design system is now version 41 (`docs/design-system/README.md`, "Keyboard focus" and "Hover and pressed"; `components.md`: Button, Input, SearchField, Select, FilterSelect, FactSelect, Table, Tabs, Chip, ServiceCards). In short:

- **Keyboard focus is a black ring**, for accessibility.
- **Hover and pressed stay in each element's own colour.** Orange never means "the pointer is here".
- **Table rows and menu rows never get a ring or border.**

## 1. The focus ring (`app/globals.css`, `ui.tsx`)

- Set `--focus-ring: 0 0 0 2px #fff, 0 0 0 4px var(--black-7);`.
- **Delete** `--focus-ring-inset`, `--shadow-focus-inset` and `.shadow-focus-inset`. Nothing uses an inset ring any more.
- Keep `focusRing = "outline-none focus-visible:shadow-focus"` in `ui.tsx`. It applies on keyboard focus only, never on a mouse click, and the same on every button colour.
- **Tabs:** the active tab keeps its 2px orange underline inside the ring. Square corners, as now.

## 2. Fields: a 2px black border, no halo

Inputs, textareas, the search field, `Dropdown` triggers and the ops `fieldClass` all get the same focus:

- `border-black-7` plus `shadow-[inset_0_0_0_1px_var(--black-7)]`, so the border reads as 2px without the field moving.
- **No** `shadow-focus` on fields.
- It shows on mouse focus too (`focus:` / `focus-within:`), because a field is always focused while you type.
- **Places to change:**
  - `filterSearchClass` (~line 401);
  - `dropdownTriggerBaseClass` (~line 411);
  - `fieldClass` in `ops-shared.tsx`;
  - any other `focus:border-black-6 focus:shadow-focus` or `focus-visible:border-black-6 focus-visible:shadow-focus` in `components/concept` and `app/concept`.
- **Leave alone:** the Overview hero search (`dashboard.tsx`, "Find an asset").
- **The open `Dropdown` trigger** (`data-[state=open]`) stays `border-black-6`.

## 3. Hover and pressed

| Element | Hover | Pressed (`active:`) |
|---|---|---|
| Primary button (orange) | `bg-brand-7` (as now) | `bg-brand-8` (as now) |
| Secondary and tertiary buttons, icon buttons | `bg-black-2` | `bg-black-3` |
| Danger button | `bg-status-danger-bg` | `bg-status-danger-border` |
| Filter chips (unselected) | `bg-black-2` | — |
| Service filter cards (`BatchView.tsx` ~640) | `bg-black-2` | — |
| FactSelect value, hover and open (`ui.tsx` ~1220) | `bg-black-2` | — |
| Table rows | `bg-black-1` | — |
| Menu rows: `Dropdown` (~408) and the Overview search results (`dashboard.tsx` ~548, 584, 629) | `bg-black-2` | — |

- **Where `hover:bg-bg-accent` is today**, replace it with the value above:
  - `globals.css` ~244 and ~250 (secondary buttons);
  - `ui.tsx` ~128, 228, 232, 604, 1067, 1068, 1220–1221, 1519, 1520.
- **Keep `bg-bg-accent`** only on:
  - the "now" display chip (~616);
  - the "Your action" pill (~1691).
- **Unchanged:**
  - hover borders on fields and summary cards (`border-black-4`);
  - the selected filter chip stays black;
  - link hovers (underline or darker text, no fill).
- **Inactive tabs:** on hover, also show a 2px `black-3` underline (`hover:shadow-[inset_0_-2px_0_var(--black-3)]` on the non-active trigger).

## 4. Table rows: fills only, no borders

`ui.tsx` ~228 and ~232 (the link-row classes):

- **Hover:** `bg-black-1`.
- **Keyboard focus** (`focus-visible` / `focus-within`): `bg-black-2`, and the row's name (the first column's link text) underlined (`underline underline-offset-[3px]`).
- **No** ring, shadow, outline or border on a row, inset or not.

## 5. Menus (`Dropdown`, FactSelect's menu, the Overview search results)

- **Highlighted row** (`data-[highlighted]`, `:hover`, `:focus`): `bg-black-2`. No ring.
- **Chosen row** (`data-[state=checked]` / `aria-selected`): `h8`, no fill, plus `<Icon name="check" size={16} />` at the right of the row (`ml-auto`, `text-icon-strong`). In Radix use `Select.ItemIndicator`.
- **A row with a second line** keeps it under the label in `p7 text-text-secondary`.

## 6. The search clear ×

Replace the `IconButton` in the search field (`ui.tsx` ~1596) with a plain button:

```tsx
<button type="button" aria-label="Clear search" onClick={clear}
  className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex size-5 items-center justify-center rounded-sm text-black-4 outline-none hover:text-black-7 focus-visible:text-black-7 focus-visible:shadow-[0_0_0_2px_var(--black-7)]">
  <Icon name="cross" size={16} />
</button>
```

- No fill, no hover square, no tooltip.
- It still clears the field and puts focus back in it, and Esc still clears.
- Keep `pr-9` on the input while it shows.

## Check

- **Keyboard:** Tab through Assets, a package page and an asset page.
  - Every button, tab, chip and link shows the black ring with a white gap, including the orange primary.
  - Fields show a 2px black border with no halo.
  - Clicking a button with the mouse shows no ring.
- **Hover:**
  - a secondary button, an icon button, a filter chip and a menu row turn light grey;
  - the primary button turns darker orange;
  - nothing turns light orange.
- **Table row:** hover is a faint grey. With Tab, the focused row is a slightly darker grey with its name underlined, with no border or ring.
- **Dropdown:** open it with the keyboard. The highlighted row is grey and the chosen row is SemiBold with a tick.
- **Search:** type "fil". A grey × appears with no square behind it and no tooltip; hovering darkens it.
- **Greps:**
  - `grep -rn "hover:bg-bg-accent\|focus-visible:bg-bg-accent\|focus-within:bg-bg-accent\|shadow-focus-inset" components/concept app/concept app/globals.css` returns nothing;
  - `grep -rn "bg-bg-accent" components/concept` finds only the now chip and the "Your action" pill.
- `npm run build` passes. Report pass or fail for each item and list the files you touched.
