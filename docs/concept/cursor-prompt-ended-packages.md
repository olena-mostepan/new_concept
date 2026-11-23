# Cursor prompt, part 36: packages that ended or continued

Paste everything below the line into Cursor, in the `new_concept` repo. Its reference is the canvas "Ended and continued packages" (https://claude.ai/artifact/5c7949uvSqhJXdFSpyVHVK). Attach screenshots of artboards A, B, C1, C2, D1, D2, E, E2, F and G1–G4 if you can.

**Before you start:** part 34 (`from`, `closedOn`, `left`, `isClosed()`, the IN PACKAGE column) and the Ops / customer split (`useConceptMode()`, `OpsPackageView`, `OpsBatch`) must already be in the code. If either is missing, stop and say so.

This prompt is closed. It changes:
- the model;
- the example data in Offices DE, FR and BE;
- the package page, batch page and asset page (both versions);
- the Ops package page's actions.

It doesn't touch:
- the service lists;
- Overview;
- the supplier screens;
- `docs/design-system/`.

---

## Why

Most packages end without delivery. Today the prototype has one way to end a package: Closed, used when all its assets moved on. It has no way to say that:
- the customer chose a supplier outside CQuel;
- the work isn't going ahead;
- a package carried on in a follow-on package.

Ended packages also fold away on the batch page, and the service counts include dead work. This part gives each ending its own words. Ended packages stay visible as a record, and Ops can end a package themselves.

The concept already models a package going through several services as phases (Tender done → Pricing now in one package). That stays the normal way. "Continued" below is for when Ops made the follow-on a separate package.

## 1. Model (`lib/concept/model.ts`)

Add to `Workstream`:

```ts
/** Set when the package has ended. */
ending?: {
  kind: 'continued' | 'outside' | 'not_going_ahead'
  on: string
  /** continued: the package the work carried on in */
  to?: string
  /** outside: who the customer went with, when Ops know */
  supplier?: string
  /** What Ops wrote in "Why it ended". The customer sees it. */
  reason?: string
}
```

In `derive.ts`:
- `isEnded(w)` is true when `w.ending` is set.
- `isClosed(w)` becomes `!!w.closedOn || isEnded(w)`. Every existing closed behaviour then applies to ended packages too.
- `closedOnDate(w)` returns `w.ending?.on ?? w.closedOn`. Use it wherever `closedOn` is read today.
- `isLivePackage(w)` returns `!isClosed(w) && !isCompleted(w)`.
- `continuedFrom(account, w)` returns the package whose `ending` is `{ kind: 'continued', to: w.id }`, if any.

Words, in `moves.ts`, through `t()`:

| `ending.kind` | Ending (lowercase in lines, e.g. "Ended 18 Nov · supplier outside CQuel") | Asset row outcome |
|---|---|---|
| `continued` | continued in `<service>` | Continued · in `<service>` |
| `outside` | supplier outside CQuel | Supplier outside CQuel |
| `not_going_ahead` | not going ahead | Not going ahead |

Never "terminated", "lost", "cancelled", "migrated", "transferred" or "removed" on any screen.

## 2. Example data (`lib/concept/data.ts`, Halvering · Offices DE, FR and BE)

Use existing Offices assets (`o…`). Dates are past, and the supplier names are examples.

1. **`led-offices`**, "LED · Offices DE", a Tender package for 3 assets.
   - Every tender step is done. Results shows 3 offers, and Supplier chosen is Lumatec.
   - It has `ending: { kind: 'continued', to: 'led-offices-pricing', on: '13 Nov 2026' }`.
   - Its rows have `left: { kind: 'continued', to: 'led-offices-pricing', on: '13 Nov 2026' }`.
2. **`led-offices-pricing`**, "LED · Offices DE" (the same name), a Pricing package for the same 3 assets.
   - It has `from: { workstreamId: 'led-offices', kind: 'continued', on: '13 Nov 2026' }` and supplier Lumatec.
   - Steps: Supplier set, Price requested, then Price received · 3, received 20 Nov.
3. **`hp-fr`**, "Heat pumps · FR offices", a Tender package for 2 assets, every step done.
   - It has `ending: { kind: 'outside', on: '18 Nov 2026', supplier: 'Own facilities contractor', reason: 'The customer kept its facilities contractor for the heat pumps. The offers from this tender stay under Tender results.' }`.
4. **`ev-nord`**, "EV charging · Ladepunkt Nord", a Pricing package for 3 assets.
   - Steps: Supplier set, then Price requested on 12 Nov.
   - It has `ending: { kind: 'not_going_ahead', on: '14 Nov 2026', reason: 'The customer decided not to work with Ladepunkt Nord after reviewing their earlier installations. No prices were received.' }`.
   - Give one of its assets `left: { kind: 'moved', to: 'ev-chargeo', on: '12 Nov 2026' }`, and add that asset to `ev-chargeo` with `joined`.

For each package, add activity: "Package started", the step events, and "Package ended · <ending>" or "Continued in Pricing". Then add the matching History events on the assets.

## 3. Package page (`PackageView`, `OpsPackageView`, `packageStatus.ts`)

**Header facts:**
- Ended packages add "Ended `<date>`" as the last fact.
- `outside` with a `supplier`: the Supplier fact reads "`<supplier>` · outside CQuel".
- The Assets fact reads "`<n>` at the start" on any closed package, as today.

**StatusCard:**
- **`outside` and `not_going_ahead`:** the existing closed card, "This package is" over "Closed · `<date>`", with the grey icon and no button. Don't add new words to this card.
- **`continued`** (new variant): "This package continued in" over the service of the `to` package in `h4`, with the grey icon of the service this package ended in. The large `strong` Button "Open `<service>`" with `chevron-right` links to the `to` package.

**"Why it ended":** when `ending.reason` is set, show a `neutral` Banner with the `info` icon between the tab row and the first card. Its title is "Why it ended" and its text is the reason. This is the only place a reason shows on a package page. There's no Banner for `continued`.

**Steps** on the Overview card and the service tab:
- **`outside`:** every step up to and including Supplier chosen is done. Under Supplier chosen: "outside CQuel · `<date>`".
- **`not_going_ahead`:** done chips up to the last step reached, then the ended chip (section 6) "Not going ahead · `<date>`". Draw no later steps, and no chip has a count. No "awaiting start" line.
- **`continued`:** every step done, as a finished service.
- Ended packages keep their Overview card and steps, unlike the current "Closed: no chips, no steps". The steps are the record of what was done.

**Assets table:**
- The STEP column shows the step reached.
- The IN PACKAGE column (already there) gets the ending as its first line, "Ended `<date>`", with the outcome in the second line: "supplier outside CQuel" or "not going ahead".
- For `continued`: "Continued `<date>`" over the `to` package's name.
- Rows are muted, as rows that left already are.

**Tabs:** a package with `from.kind === 'continued'` shows its source's services as tabs marked "from". This uses the existing part 34 rule: here, the Tender results tab with the "from" Tag.

## 4. Batch page (`BatchView`, `OpsBatch`)

**Packages tab:**
- **One row per line of work.** A package with `ending.kind === 'continued'` gets no row. Its `to` package's row shows, under NOW, a second line in `p7` text-tertiary: "After `<from service>` · `<date>`".
- **Live packages first,** as today.
- **Then an "Ended · `<n>`" group header row** (`bg-container-grey`, `h9` text-secondary) and every ended package, muted:
  - NOW reads the ending ("Supplier chosen outside CQuel", "Not going ahead"), with "`<service>` · `<date>`" under it;
  - ASSETS reads "`<n>` at the start".
  - A package closed by a split (`closedOn` and no `ending`) sits here too, with "Split · `<date>`".
- **Remove the "`<n>` closed" fold.** Every ended row is visible and links to its package.
- **Drop the HOW IT CAME column.** Its information is now the NOW second line.
- **The batch header's Packages fact and the tab label** count the rows shown.

**Assets tab:**
- **ServiceCards count live packages only.** A service with no live assets has no card.
- **After the services comes an "Ended" card** (label and count in text-tertiary, like Dropped and Moved out), counting assets that have at least one ended package. Selecting it lists those assets.
- **Each asset row** shows one line per line of work, in PACKAGE and SERVICE:
  - live lines first;
  - ended lines muted, with the service and its ending ("Tender · supplier outside CQuel", "Pricing · not going ahead").
  - A continued package has no line of its own: its `to` package's line reads "Pricing · after Tender".
- **Rows whose lines have all ended** sort after live rows.

## 5. Asset page (`BuildingView`, both versions)

**Package fact (FactSelect / `PackagePicker`):**
- One option per line of work. A continued package is not an option of its own: its `to` package carries it.
- Live options as today.
- Ended packages go under "Earlier", with the line "Ended `<date>` · `<ending>`".

**In package fact:**
- An ended package selected: "Ended `<date>` · `<ending>`".
- A live package that came from a continued one: "Since `<from date>`".

**Tabs:** the selected package's services. A continued line includes the earlier service as a tab with the "from" Tag.

**PackageCard:**
- **A continued line:** both services as big chips (Tender done, Pricing now), with the current service's steps in the panel.
- **An ended package selected:** the existing "package the asset has left" variant. That means its chips, the panel with the steps as a record (as in section 3), and "Open package", with no ServiceIcon and no "This asset is in".
  - A service that ended without finishing (`not_going_ahead`) gets the ended chip (section 6) in the big size.
  - Show the "Why it ended" Banner above the card when there's a reason.

**History (Timeline):** "Continued in `<service>`" and "Package ended · `<ending>`", with the package name as the detail. Keep the solution prefix when the asset has two or more projects.

## 6. New chip look: ended (`ui.tsx`, `Chip` and `ChipTrack`)

Add `lead: 'ended'` to `Chip`, for a service or step that stopped without finishing.
- White fill, 1px `border-dark` border, label `h9` (`h8` when `big`) in `text-secondary`.
- In front of the label: a round circle in `black-muted` with a white cross. The circle is 14px in the 24px chip and 16px in the big chip, the same sizes as the done tick.
- It is ink-grey, never red or orange. No hover, no focus: it's a display chip.
- In `ChipTrack`, an `ended` chip is always last: nothing is drawn after it, and the track line stops at it.

## 7. Ops: End package (`OpsPackageView`, `store.tsx`)

- On a live package, add a `secondary` Button "End package…" beside the StatusCard. It isn't shown on closed or completed packages, or on the customer version.
- It opens a `Modal` (480):
  - **Title:** "End package". **Subtitle:** "`<package>` · `<service>` · `<n>` assets".
  - **What happened:** two radio cards, "Supplier chosen outside CQuel" / "The customer went with a supplier we didn't bring", and "Not going ahead" / "The customer stopped this work, or dropped the supplier".
  - **Supplier (optional):** an input, shown only for the first choice.
  - **Ended on:** a date, today by default.
  - **Why it ended · the customer sees this:** a Textarea.
  - **Footer:** tertiary "Cancel" and primary "End package". The primary is disabled until a choice is made.
- On save, the store sets `ending` on the package and adds an activity "Package ended · `<ending>`". Rows aren't given `left`. Counts and the Ended card read `isClosed(w)`, so an ended package's assets never count as Dropped or Moved out. A reload resets this, like the other Ops writes.
- Continuing in another service isn't in this window. Ops use Add package with these assets, then set `ending: { kind: 'continued', to }` on the old package; wire that into the existing Add package flow when it is started from a live package.

## 8. Words and German

- Every new string goes through `t()`, with a German entry in the concept DE dictionary. Use the house terms from `de-ui-terms-decisions` and leave anything unsure marked for review.
- New strings:
  - Why it ended
  - This package continued in
  - Open {0}
  - Ended {0}
  - Ended · {0}
  - After {0} · {1}
  - Supplier chosen outside CQuel
  - supplier outside CQuel
  - Supplier outside CQuel
  - Not going ahead
  - not going ahead
  - Continued in {0}
  - Package ended · {0}
  - {0} · outside CQuel
  - End package
  - End package…
  - What happened
  - The customer went with a supplier we didn't bring
  - The customer stopped this work, or dropped the supplier
  - Supplier
  - Ended on
  - Why it ended · the customer sees this
  - Split · {0}

## Done when

- **LED · Offices DE:**
  - The batch Packages tab shows one LED row, at "Pricing · Price received" with "After Tender · 13 Nov" under it.
  - The tender package isn't a row. It opens from the From fact, and its StatusCard reads "This package continued in / Pricing" with "Open Pricing ›".
- **Heat pumps · FR offices:**
  - It is in the Ended group as "Supplier chosen outside CQuel / Tender · 18 Nov".
  - Its page shows the closed card "Closed · 18 Nov" and the "Why it ended" Banner.
  - Every step is done, with "outside CQuel · 18 Nov" under Supplier chosen.
  - The Supplier fact reads "Own facilities contractor · outside CQuel".
- **EV charging · Ladepunkt Nord:**
  - Its steps end with the ended chip "Not going ahead · 14 Nov", with no later steps.
  - One asset reads "Left 12 Nov · moved / EV charging · Chargeo".
- **The Offices batch:**
  - The Packages tab has no "closed" fold.
  - The Assets tab has an "Ended" card, and the service cards count live assets only.
- **The asset page of an `hp-fr` asset:**
  - The Package menu lists it under Earlier with "Ended 18 Nov · supplier outside CQuel".
  - Selected, its PackageCard has no "This asset is in", plus the Banner.
  - History has "Package ended · supplier outside CQuel".
- **The asset page of an `ev-nord` asset:** the Pricing big chip uses the ended look.
- **Ops:**
  - "End package…" on EV charging · Chargeo ends it.
  - The batch then moves it to the Ended group, the Pricing card count drops, and its page shows the Banner with the text typed.
  - The customer version has no "End package…".
- **German:** with DE selected, every string above is in German.
- **Checks:**
  - `grep -rni "terminat\|migrat\|transferred\|reallocat" components/concept app/concept` finds nothing on screen.
  - The `@/components/ui/` grep from CLAUDE.md prints nothing.
  - `npm run build` passes.
- **Report:** write this checklist into your final message with pass or fail for each item, and list every file you touched.
