# Cursor prompt, part 34: package page shows where it came from and where its assets went

Paste everything below the line into Cursor, in the `new_concept` repo. Attach these from `docs/concept/wireframes/`:

- `116-package-moves.png` (frames 1–3 and 5; the Assets table there is superseded by 117)
- `117-assets-in-package-column.png`

**Before you start:** part 33 must be in the code: `from`, `closedOn` and `left` in the model, `isClosed()`, the closed `solar-est` package, and the batch tabs. If it's missing, stop and say so.

This prompt is closed. It changes the package page (`components/concept/PackageView.tsx` and what it uses) and adds a little demo data. It doesn't touch:

- the asset page (part 35);
- the batch page, other than making closed package rows links;
- the package page's tabs for its own services, other than the "from" marking.

---

## Why

A package can come from another one, assets can join it, and assets can leave it. Today the package page shows none of this, so a customer can't tell where its estimates came from, or what happened to an asset that's no longer listed. The page now says so in the header, the tabs and the Assets table, using the words below.

## 1. Data

**In `lib/concept/model.ts`:**

- Add `'not_chosen'` to `MoveKind`.
- Let `left.to` name a workstream or a batch. Resolve it by looking in both.
- Add to `ProjectRow`:

```ts
/** Set when the asset came into this package after it started. */
joined?: { on: string; from?: string /* workstream id */; reason?: string }
/** Still in the package, but waiting. */
hold?: { since: string; reason: string }
```

**In `lib/concept/data.ts`** (Flagship sites), add one join and one hold:

- **Marktplatz 2 (`f9`) moves** from Solar PV · Missing roof data to Solar PV DE:
  - In `solar-roof`, its row gets `left: { kind: 'moved', to: 'solar-de', on: '4 Nov 2026', reason: 'Roof drawings in' }`.
  - In `solar-de`, add its row with `step` at the brief step ("Brief addition" if that label exists; otherwise the earliest tender step), and `joined: { on: '4 Nov 2026', from: 'solar-roof', reason: 'Roof drawings in' }`.
  - Activity on both packages: `{ date: '4 Nov', title: 'Marktplatz 2 joined', text: 'From Solar PV · Missing roof data, roof drawings in.' }` on `solar-de`, and `{ date: '4 Nov', title: 'Marktplatz 2 moved to Solar PV DE', text: 'Roof drawings in.' }` on `solar-roof`.
- **Brückenstraße 5 (`f8`)** in `solar-roof` gets `hold: { since: '2 Oct 2026', reason: 'Waiting for the tenant' }`.
- **`solar-de` documents:** the "Indicative estimates — Solar PV" row's meta becomes "PDF · from Solar PV · Estimates · 28 Aug". Do the same on `solar-roof`.

Anything that counts a package's assets counts only live rows: no `left`. `hold` rows count; they're still in the package.

## 2. Header

- **"From" fact,** when the package has `from`: label "From", value the source package's name, linked to its page. Order: Batch · From · Solution · Assets · Supplier.
- **Assets fact:** the live count. A closed package reads "`<n>` at the start".
- **Closed package:** add a "Closed" fact with `closedOn`.

## 3. Closed package

When `isClosed(w)`:

- **Status card:** "This package is" in `p7` text-tertiary over "Closed · `<closedOn>`" in `h4`. The last service's icon with `filter: grayscale(1)` added to the drop-shadow. No button.
- **Overview:** no service chips and no steps panel (nothing is happening). Then the Assets table (section 5), Recent activity and Documents, as on any package.
- **Tabs:** its own service tabs stay, read-only, as they are.
- **Links in:** the batch's Packages tab now links closed rows to this page (part 33 left them unlinked). The "From" fact links here too.

## 4. Inherited tabs: "from"

A package with `from` shows the earlier service it carries from that package as a tab, as now (Solar PV DE and Solar PV · Missing roof data already have an Estimates phase). Mark it:

- **A phase is inherited** when its service is a service of the `from` package and it was completed on or before `from.on`.
- **The tab label** gets a small `Tag` "from" after it (`p7`, `border-dark`, pill). Use the existing Tag; no colour.
- **At the top of the tab,** one line in a `bg-container-grey` box, `border-light`, `radius-md`, padding 10/16, `p6` text-secondary: "From `<package>` · closed `<closedOn>` · showing this package's `<n>` assets". The package name is a link.
- **The content** is read-only: hide any action button on inherited tabs. It already shows only this package's assets, because the phase holds only them.
- The status card and the current-service dot are unchanged; an inherited tab is never the current one.

## 5. Assets table: one extra column, IN PACKAGE (mock 117)

Keep the table as it is (ASSET with the city under it, STEP, chevron, one link per row, 8 rows then Show all). Add a third column, **IN PACKAGE**, between STEP and the chevron.

**Show the column only when** at least one row has `joined`, `hold` or `left`, or the package is closed. Otherwise the table stays as today.

**Values:** the first line in `p6`, an optional second line in `p7` text-tertiary.

| Row | First line | Second line |
|---|---|---|
| In from the start | Since `<package startedOn>` | |
| `joined` | Joined `<on>` | from `<package>`, or the reason |
| `hold` | On hold since `<since>` | `<reason>` |
| `left` · split | Split out `<on>` | to `<package>` |
| `left` · moved | Moved out `<on>` | to `<package or batch>` |
| `left` · continued | Continued `<on>` | in `<package>` |
| `left` · tendered again | Tendered again `<on>` | in `<package>` |
| `left` · not chosen | Not chosen `<on>` | `<reason>` |
| `left` · dropped | Dropped `<on>` | `<reason>` |

- **Dates** are short ("4 Nov"), with the year only when it isn't this year.
- **Rows that left:** the whole row is muted (`text-text-tertiary`). STEP shows the step the asset was at when it left.
- **Order:** joined first (newest first), then the others as today, then on hold, then the rows that left (grouped by what happened, then A–Z). The changed dot stays as it is.
- **Count on the right of the title:** the live count, plus "· `<n>` left" when any left. A closed package shows "`<n>` at the start".
- **Plain text only** in IN PACKAGE. The row is the one link, to the asset page.
- **Phone:** IN PACKAGE moves under STEP inside the row.

## 6. Words

The only words for a move on any screen: **Split, Continued, Tendered again, Moved, Joined, On hold, Not chosen, Dropped.** Never "migrated", "transferred", "reallocated" or "removed".

## Done when

- **Solar PV DE:**
  - The facts read Batch · From "Solar PV · Estimates" (linked) · Solution · Assets 5.
  - The Estimates tab has a "from" tag and opens with "From Solar PV · Estimates · closed 28 Aug · showing this package's 4 assets". It has no action buttons.
  - The Assets table has IN PACKAGE. Marktplatz 2 is first ("Joined 4 Nov" / "from Solar PV · Missing roof data"), and the other four read "Since 1 Sep".
  - Recent activity shows "Marktplatz 2 joined".
- **Solar PV · Missing roof data:**
  - Brückenstraße 5 reads "On hold since 2 Oct" / "Waiting for the tenant".
  - Marktplatz 2 is last, muted, "Moved out 4 Nov" / "to Solar PV DE". The count reads "2 · 1 left".
- **Solar PV · Estimates (closed),** opened from the batch's Packages tab or from the "From" fact:
  - The status card reads "Closed · 28 Aug" with a grey icon and no button. There are no chips or steps.
  - Assets lists all 8, muted: seven "Split out 1 Sep" with where they went, and Am Hafen 12 "Dropped 28 Aug" / "Roof can't take panels". The count reads "8 at the start".
- **EV charging · Voltreny:** no IN PACKAGE column, because nothing joined or left.
- **Words:** `grep -rni "migrat\|transferred\|reallocat" components/concept app/concept` finds nothing on customer screens.
- **Build:** `npm run build` passes.
- **Report:** write this checklist into your final message with pass or fail for each item, and list every file you touched.
