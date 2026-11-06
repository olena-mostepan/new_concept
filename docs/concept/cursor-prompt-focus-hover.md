# Cursor prompt: soft focus halo, accent hover, calm menus

Paste everything below the line into Cursor, in the `new_concept` repo. Attach `focus-halo-check.png` from `docs/concept/wireframes/`.

---

The black 2px focus outline is gone from the design system (version 38, `docs/design-system/README.md`, "Focus" and "Hover"). Replace it everywhere in the concept with the soft halo, make hover fills the light accent, and calm the menus.

## 1. One focus style

- **`app/globals.css`:** set `--focus-ring: 0 0 0 4px rgba(30, 40, 50, 0.14);`. Expose it as a Tailwind shadow utility (`shadow-focus`) if it isn't one already.
- **`ui.tsx`:** change `focusRing` to `"outline-none focus-visible:shadow-focus"`. Keyboard only: `:focus-visible`, never on a mouse click.
- **Replace every other black outline in `components/concept` and `app/concept`.** There are 24 today, in:
  - `Decisions.tsx`, `lists.tsx`, `PackageView.tsx`, `DeliverySection.tsx`;
  - `BuildingView.tsx`, `ConceptChrome.tsx`, `BatchView.tsx`;
  - `WorkstreamsByBatch.tsx`, `ServiceSection.tsx`, `ui.tsx`.

  Wherever a class has `focus-visible:outline-2 … outline-black-7` (or `ring-black-7`), use `focusRing` instead.
- **Fields** (inputs, `Dropdown` triggers, the search field): focus is `border-black-6` plus the halo. No double black ring.
- **Tabs:** the active tab keeps its 2px orange underline inside the halo. Give the trigger `rounded-sm` so the halo has soft corners.
- **Table rows that are links:** on keyboard focus, the row gets `bg-bg-accent` plus an inset halo (`shadow-[inset_0_0_0_4px_rgba(30,40,50,0.14)]`). No outline.

## 2. Hover is the light accent

Every hover **fill** becomes `hover:bg-bg-accent` instead of `hover:bg-bg-container-grey` (7 places today). That covers:

- secondary and tertiary buttons and icon buttons;
- table rows;
- menu rows;
- filter chips;
- service filter cards;
- the Package value in the asset header.

**Unchanged:**

- hover **borders** on fields and summary cards stay `border-black-4`;
- the selected filter chip stays black;
- link hovers (underline, text colour) stay as they are.

## 3. Menus (`Dropdown`, FactSelect's menu)

- **The row under the pointer or keyboard** (`data-[highlighted]`, `:hover`, `:focus-visible`): `bg-bg-accent`. No outline, no ring inside a menu.
- **The chosen row** (`data-[state=checked]` or `aria-selected`): `h8`, **no fill**.

So the fill always means "you are here", and bold always means "this is chosen".

## Check

- Tab through Assets, a package page and an asset page. Every focused element shows a soft grey halo, with no black box anywhere. Clicking with the mouse shows no halo.
- **Open a dropdown with the keyboard:** the highlighted row is light orange, the chosen row is bold with no fill, and there's no black border.
- **Hover a table row, a secondary button and a menu row:** each turns light orange.
- **The active tab under focus:** the halo plus the orange underline.
- `grep -rn "outline-black-7\|ring-black-7" components/concept app/concept` and `grep -rn "hover:bg-bg-container-grey" components/concept app/concept` return nothing.
- `npm run build` passes. Report pass or fail for each item and list the files you touched.
