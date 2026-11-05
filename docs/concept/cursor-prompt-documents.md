# Cursor prompt, part 27: Documents

Paste everything below the line into Cursor, in the `new_concept` repo. Attach `docs/concept/wireframes/documents-options.png` (option B, but ignore its grouping).

**Before you start:** `IconButton` must be in `ui.tsx` (part 26), and `public/icons/download.svg` must exist. If either is missing, stop and say so.

This prompt is closed. It changes how document rows look and moves the file type out of the detail text. It doesn't change routes, page layout, card order or which documents show where.

---

## Why

Documents are drawn three ways today: on the asset page, on the batch page and on the package Overview. Every row reads the same: a name, "PDF · 8 Oct", and a "Download" text link. Nothing shows what kind of file it is at a glance, and a column of identical "Download" links is noise. One list now has a small file-type tag and one icon action per row. It has no grouping.

## 1. Data: a `type` field (`lib/concept/model.ts`, `lib/concept/data.ts`)

Add `type?: string` to `Doc`, for example "PDF", "3 PDF", "12 XLS" or "23 files". Leave it out when there's no single type.

In `data.ts`, move the type out of `meta` into `type`. The rest of `meta` stays:

| Line now | `type` | `meta` |
|---|---|---|
| `meta: 'PDF · agreed 10 Sep'` | `'PDF'` | `'agreed 10 Sep'` |
| `meta: 'PDF · 8 Oct'` (and every other `'PDF · <date>'`) | `'PDF'` | `'<date>'` |
| `meta: 'PDF · signed 6 Aug'` | `'PDF'` | `'signed 6 Aug'` |
| `meta: '3 PDFs · 20 Aug'` | `'3 PDF'` | `'20 Aug'` |
| Files you sent: `meta: 'Site photos, 12 months of bills'` | none | `'you sent · site photos, 12 months of bills'` |
| Files you sent: `meta: 'Site plans, 12 months of bills'` | none | `'you sent · site plans, 12 months of bills'` |
| Your files: `meta: '23 files · 9 Oct'` | `'23 files'` | `'you sent · 9 Oct'` |
| Muted rows (`'After all offers are in'`, `'After you agree the price'`, `'After Estimates'`) | none | unchanged |

Don't rename any document.

Within each `documents` array, order the rows newest first by their dates. Muted rows go last.

## 2. `DocumentList` (`components/concept/ui.tsx`)

Add one component and use it everywhere documents are listed:

```tsx
export function DocumentList({ docs }: { docs: Doc[] })
```

- `<ul>`, one `<li>` per doc. Each row is `flex items-center justify-between gap-4 py-3`. Every row after the first has `border-t border-border-light`.
- On the left (`min-w-0`):
  - The name in `h8 text-text-title`.
  - Under it, a meta line: `mt-0.5 flex items-center gap-1.5`.
    - The **file type**, when `type` is set, as the existing `Tag` with `type="neutral"` and a new size `"xsmall"`. Add `xsmall` to `Tag`: `h-5 px-1.5 gap-1 h9`, and keep the same pill shape, neutral fill and border as `small`. Don't make a separate file-type element.
    - Then `meta` in `p7 text-text-secondary`.
- On the right: one `IconButton`, tertiary, default size.
  - `action: 'Download'` uses `icon="download"` and `label={\`Download ${doc.name}\`}`.
  - `action: 'View'` uses `icon="chevron-right"` and `label={\`View ${doc.name}\`}`.
  - No `action` means nothing on the right.
  - The label shows as the tooltip; there's no visible text.
- **Muted rows** (`muted: true`): name and meta both `text-text-tertiary`, no tag, no action.
- Run names and meta through `shortFact` as the asset page does now.
- No grouping, sub-headings or counts by who sent a file. "you sent" in the meta is enough.

Export `Doc` from the model import if `ui.tsx` doesn't already have it.

## 3. Use it in the three places

Keep each Card exactly as it is (title "Documents", "See all" on the right, `h-full`). Replace only the `<ul>…</ul>` inside it with `<DocumentList docs={…} />`:

- `BuildingView.tsx`, the `Documents` component.
- `BatchView.tsx`, the Documents card. This also drops its tighter `py-1.5` rows and greyed names, so it matches the others.
- `WorkstreamChrome.tsx`, `WorkstreamFacts`. Type its `documents` prop as `Doc[]` instead of the inline type.

On the asset page, change `packageMeta` in `BuildingView.tsx` so it puts "package" first: `packageMeta('agreed 10 Sep')` → `'package · agreed 10 Sep'`. The type is no longer in `meta`, so it doesn't need splitting.

Don't touch `OpsWorkstreamDrawer.tsx` beyond what's needed to compile.

## Check

- `grep -rn 'btn-link' components/concept` shows no "Download" or "View" document links.
- `grep -rn "PDF ·\|PDFs ·" lib/concept/data.ts` returns nothing.
- `npm run build` passes.
- Open the asset page (Halverkamp 19), a batch page (Pilot) and a package Overview. All three Documents cards look the same. Each row has a small neutral "PDF" Tag (20px) before the date and a download icon on the right. Hovering the icon shows "Download <name>". "Files you sent" has a chevron and no tag. Muted rows are grey with no icon.
- Tab through a Documents card. Each icon gets the focus ring, and the tooltip shows on focus.

## Expected values

- Asset page, Halverkamp 19: own files first, then package files with "package · <date>" in the meta.
- Package with "Site checks": tag "3 PDF", meta "20 Aug".
- Pilot batch: "Pilot plan" tag "PDF" · "14 Oct"; "Your files" tag "23 files" · "you sent · 9 Oct", chevron; "Indicative estimates" muted.

## Done when

Every Documents list in the concept uses `DocumentList`. No document row shows text links, and no `meta` starts with a file type.
