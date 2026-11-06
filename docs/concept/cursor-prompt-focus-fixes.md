# Cursor prompt: two fixes after the focus change

Paste everything below the line into Cursor, in the `new_concept` repo.

---

Two things look wrong since the focus and hover change. The design system rules are in `docs/design-system/components.md` (Tabs, SearchField).

## 1. Tab underline curves at its ends

`tabTriggerClass` in `ui.tsx` has `rounded-sm`, so the 2px `border-b` underline bends up at both ends.

- Remove `rounded-sm` from `tabTriggerClass`. The focus halo then has square corners, and the underline stays straight.
- Don't round the tab any other way.

## 2. Search field: blue × and the wrong font

In the search field (`ui.tsx`, the `<input type="search">` around line 770):

- **The browser draws its own blue clear "×".** Hide it. Add this to `app/globals.css`:

  ```css
  input[type="search"]::-webkit-search-cancel-button,
  input[type="search"]::-webkit-search-decoration { -webkit-appearance: none; appearance: none; display: none; }
  ```

- **Our clear button:** when the field has text, show `<IconButton icon="cross" size="small" type="tertiary" label="Clear search" />`, vertically centred, 6 from the right edge. It sets the value to `""` and puts focus back in the input. Give the input `pr-9` while the button shows. Esc in the field also clears it.
- **The typed text falls back to the browser's serif font** (the "g" in the screenshot). Add `font-sans` to `filterSearchClass` and to every other input or textarea class in `components/concept`. Also add a base rule to `app/globals.css`: `input, textarea, select, button { font-family: inherit; }`.

## 3. Fields, one size

The design system (version 40, README "Fields, one size") sets one size for every field:

| Part | Value |
|---|---|
| Field height | 40 (`h-10`); `small` 32 (`h-8`) |
| Typed or picked text, and the placeholder | `p6` (14/20), `font-sans` |
| Label | `h9` (12, SemiBold) `text-text-title`, 4 above the field |

- **`Dropdown` trigger** (`dropdownTriggerBaseClass`): add `p6 font-sans`, so the browser's button font and size never show through. Today "All batches" renders larger than the search text next to it.
- **Ops fields** (`fieldClass` in `ops-shared.tsx`): replace `py-2` with `h-10` for inputs, and keep `py-2` for textareas only, so inputs are 40 high like every other field.
- **Ops labels** (`labelClass` in `ops-shared.tsx`): change `p6 text-text-primary` to `h9 text-text-title`, and `mb-1.5` to `mb-1`.
- **Any other field label** in `components/concept` (FormField-style labels above inputs, selects or textareas): `h9 text-text-title mb-1`.
- **Exception:** the Overview hero search (`dashboard.tsx`, "Find an asset") keeps its larger size.

## Check

- **Field sizes:** on Assets, the search text, the placeholder and "All batches" are the same size (14px) and font. On the ops new-batch page and in the ops drawer, every input is 40 high and every label is 12px SemiBold.

- Tab to "Overview" on a package page. The halo has square corners, and the orange underline is straight from end to end.
- Type "g" in the Assets search. It shows in Schibsted Grotesk, like the placeholder. A grey × (our IconButton, not the blue browser one) appears on the right; clicking it clears the field and keeps focus in it. Esc clears it too.
- `grep -n "rounded-sm" components/concept/ui.tsx` doesn't match `tabTriggerClass`.
- `npm run build` passes. Report pass or fail for each item and list the files you touched.
