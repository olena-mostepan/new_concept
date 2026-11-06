# Cursor prompt, part 35: the "Changed in the last 7 days" key sits top right

Paste everything below the line into Cursor, in the `new_concept` repo.

---

On the batch page, the key "• Changed in the last 7 days" sits under the Goal fact. It belongs in the **top right corner** of the page, as on the section pages. The design system says so (`docs/design-system/components.md`, ChangedDot, "The key").

**Cause:** in `PageHeader` (`components/concept/ui.tsx`), when `kind` is set, `actions` render at the bottom of the header (`mt-4` under the facts). The batch page passes `<ChangedKey />` as `actions`.

**Fix, in `PageHeader` only:**

- Add a `changedKey?: boolean` prop. When it's true, render `<ChangedKey />` (`p7 text-text-secondary`) right-aligned:
  - **Detail pages** (`kind` set): on the breadcrumb row, in the slot `crumbAside` uses (`justify-between`). If a page passes both `crumbAside` and `changedKey`, `crumbAside` wins; the asset page has the Pager there and no key.
  - **Section pages** (no `kind`): on the title row, right-aligned, where `actions` sit today.
- Remove the `{kind && actions && …}` block at the bottom of the header, so nothing renders under the facts.
- **Callers:**
  - `BatchView.tsx`: pass `changedKey` instead of `actions={<ChangedKey … />}`.
  - The package page: the same, if it shows the key.
  - `Buildings.tsx`, `ServiceSection.tsx` and `DeliverySection.tsx`: replace `actions={<ChangedKey className="p7 text-text-secondary" />}` with `changedKey`.

Don't add margins, don't move the key into a card or above a table, and don't build a new component; `ChangedKey` already exists.

**Check:**

- **Batch page (Offices DE, FR and BE):** the key is on the breadcrumb row, at the far right, level with "Overview › Offices DE, FR and BE". Nothing sits under the Goal fact.
- **Assets and a service list:** the key is on the title row, at the far right, as before.
- **Asset page:** the Pager is on the right, and there's no key.
- `grep -rn "actions={<ChangedKey" components/concept` returns nothing.
- `npm run build` passes. Report pass or fail for each item and list the files you touched.
