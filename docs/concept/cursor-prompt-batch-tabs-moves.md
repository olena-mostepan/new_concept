# Cursor prompt, part 33: moves in the data, batch page with Assets and Packages tabs

Paste everything below the line into Cursor, in the `new_concept` repo. Attach `docs/concept/wireframes/115-batch-tabs.png`.

**Before you start:** parts 31 and 32 must be in the code (the shared header, `TypeLabel`, the asset package switch). If they're missing, stop and say so.

This prompt is closed. It adds package and asset moves to the data, and rebuilds the batch page body as two tabs. It doesn't touch:

- the package page (part 34 does that);
- the asset page (part 35 does that), other than keeping closed packages out of it for now;
- the batch header.

---

## Why

Assets leave packages. A package splits in two, some assets go on, some are dropped, some are tendered again or move to another batch. Today the data has no way to say this, and the batch page mixes assets and packages in one view, so its counts don't add up. The batch page now has one tab per kind of thing, and the data records every move.

## 1. Data: record the moves

**In `lib/concept/model.ts`:**

```ts
export type MoveKind = 'split' | 'continued' | 'tendered_again' | 'dropped' | 'moved'

// on Workstream
/** Where this package came from. */
from?: { workstreamId: string; kind: Exclude<MoveKind, 'dropped'>; on: string; reason?: string }
/** Set when the package has ended because all its assets went elsewhere or were dropped. */
closedOn?: string

// on ProjectRow
/** Set on a closed package's rows: where this asset went. `to` is a workstream id, or a batch id for 'moved'. */
left?: { kind: MoveKind; to?: string; on: string; reason?: string }
```

- Keep `dropped?: boolean` and the existing `movedTo` working; set them from `left` where the code already reads them.
- Add `isClosed(w)` in `derive.ts` (`!!w.closedOn`).

**In `lib/concept/data.ts`** (Halvering, Flagship sites). Today Solar PV DE and Solar PV · Missing roof data both carry an Estimates phase for the same seven assets, because they came out of one Estimates run. Make that run a package of its own, now closed:

- **New workstream** `solar-est`, "Solar PV · Estimates", `batchId: 'flagship'`, `solution: 'solar'`, `service: 'indicative'`, one phase (`indicative`, done, 20 May–28 Aug 2026), `startedOn: '20 May 2026'`, `closedOn: '28 Aug 2026'`. `owner: 'done'`, `needs: []`, and the same `lead` as Solar PV DE.
- **Its 8 project rows:**
  - `f1`, `f5`, `f7`, `f12`: the existing estimates, and `left: { kind: 'split', to: 'solar-de', on: '1 Sep 2026', reason: 'Ready to tender' }`.
  - `f2`, `f8`, `f9`: the existing estimates, and `left: { kind: 'split', to: 'solar-roof', on: '1 Sep 2026', reason: 'Missing roof data' }`.
  - `f6` (Am Hafen 12): estimate €80–95k, `decision: 'no'`, `decidedOn: '28 Aug 2026'`, `dropped: true`, `left: { kind: 'dropped', on: '28 Aug 2026', reason: "Roof can't take panels" }`.
- **On `solar-de`:** `from: { workstreamId: 'solar-est', kind: 'split', on: '1 Sep 2026', reason: 'Ready to tender' }`.
- **On `solar-roof`:** `from: { workstreamId: 'solar-est', kind: 'split', on: '1 Sep 2026', reason: 'Missing roof data' }`.
- Keep the Estimates phases inside `solar-de` and `solar-roof` as they are. Part 34 will mark them as coming from `solar-est`.
- **Account activity:** add `{ date: '28 Aug', title: 'Solar PV · Estimates split in two', text: '4 ready to tender, 3 missing roof data. Am Hafen 12 dropped: roof can't take panels.', batchId: 'flagship' }` in date order.

**Closed packages stay out of live lists.** Anything that counts or lists live packages skips `isClosed(w)`: the packages index, dashboards, Decisions, service pages, `nowProjects`, and `projectsAtBuilding` (so the asset page and its package switch don't show `solar-est` yet; part 35 adds it under "Earlier"). List every place you changed in the report.

## 2. Batch page: two tabs (mock 115)

Under the header, one `Tabs` row: **"Assets (`<n>`)"** and **"Packages (`<n>`)"**.

- `<n>` for Assets is the batch's assets (`buildingIds.length`). `<n>` for Packages is every package in the batch, closed ones included.
- `?view=packages` opens the Packages tab. No param means Assets.
- The tabs don't share filters: switching tab keeps `?service=`, but only the Assets tab reads it.
- **Recent activity** stays as it is, under the tab content, on both tabs.

### Assets tab (the default)

Everything on this tab is about assets.

- **Service cards:** as today, with one change. They count **assets**, not projects: "All" is every asset in the batch, counted once. A service card counts the assets with a live project in that service; an asset in two packages counts in each.
- **Two new cards**, after the service cards, only when the count is above 0:
  - "Dropped": assets with a project here whose `left.kind` is `dropped`.
  - "Moved out": assets with a project here whose `left.kind` is `moved`.
  - Both have their label and count in text-tertiary. They filter the table like the others (`?service=dropped`, `?service=moved`).
- **The table:** remove the "Assets" card title and the count next to it (the tab says it). Keep the columns ASSET · PACKAGE · SERVICE and one line per project, as now.
  - Live projects first, as today.
  - A dropped or moved project is a muted line (`text-text-tertiary`) under the asset's live lines: the package name, then "Dropped · `<reason>`" or "Moved to `<batch>` · `<date>`" in the SERVICE column.
  - Assets whose only projects are dropped or moved go at the bottom, folded into one row: "`<n>` dropped" (and/or "`<n>` moved out"), with a `chevron-down`. Clicking it opens them. With `?service=dropped` or `moved`, they show open.
  - The whole row still links to the asset page, one link per row.
- **Check:** Am Hafen 12 shows its live EV charging · Voltreny line, then a muted "Solar PV · Estimates · Dropped · Roof can't take panels" line. The Dropped card reads 1.

### Packages tab

Everything on this tab is about packages. No cards.

- **The table** (a `Card` with no title bar), columns PACKAGE · NOW · ASSETS · HOW IT CAME:
  - **PACKAGE:** the name.
  - **NOW:** the current service; for a completed package "Complete · `<date>`"; for a closed one "Closed · `<closedOn>`".
  - **ASSETS:** live packages show their live asset count. A closed package shows "`<n>` at the start", so it doesn't read as more assets.
  - **HOW IT CAME:** from `from`: "Split from `<package>` · `<reason>`", "Continued from `<package>`", "Tendered again from `<package>`", "Moved from `<batch>`". Without `from`: "Started `<startedOn>`". For a closed package, what became of its assets: "Split in two · 1 dropped". Plain text, no links inside the row.
- **Order:** live packages first, newest `startedOn` first. Completed and closed packages after them, folded into one row "`<n>` closed ⌄" (completed counts as closed here), open on click.
- **Links:** live and completed rows link to the package page, the whole row. Closed rows aren't links yet; part 34 gives closed packages their page.
- **Proposed packages** (not started) keep their current treatment.

### Words

Use only these on any screen for a move: **Split, Continued, Tendered again, Dropped, Moved**. Never "migrated", "transferred" or "reallocated".

## Done when

- **`/concept/batches/flagship`:**
  - Tabs read "Assets (12)" and "Packages (4)". Assets is open.
  - The cards count assets. There's a "Dropped 1" card in text-tertiary, and no "Moved out" card.
  - Am Hafen 12 shows its EV line and a muted Solar PV · Estimates "Dropped · Roof can't take panels" line. `?service=dropped` lists only it.
  - The table has no "Assets" title bar.
  - Recent activity shows "Solar PV · Estimates split in two" (28 Aug) on both tabs.
- **`?view=packages`:**
  - Live rows: Solar PV DE ("Split from Solar PV · Estimates · Ready to tender"), Solar PV · Missing roof data ("Split from Solar PV · Estimates · Missing roof data"), EV charging · Voltreny ("Started …").
  - One folded row "1 closed". Opened: Solar PV · Estimates, "Closed · 28 Aug 2026", "8 at the start", "Split in two · 1 dropped", muted and not a link.
- **Offices:** "Packages (`<n>`)" with every row "Started …", and no Dropped or Moved out card.
- **Closed packages** appear nowhere else: not in the packages index, dashboards, Decisions, service pages, or the asset package switch.
- **Words:** `grep -rni "migrat\|transferred\|reallocat" components/concept app/concept` finds nothing on customer screens.
- **Build:** `npm run build` passes.
- **Report:** write this checklist into your final message with pass or fail for each item, and list every file you touched.
