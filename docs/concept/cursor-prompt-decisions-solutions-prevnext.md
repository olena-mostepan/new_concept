# Cursor prompt, part 23: decisions on Overview, solution chips on Assets, previous / next between assets

Paste everything below the line into Cursor, in the `new_concept` repo. Attach `docs/concept/wireframes/82-overview-decisions.png`, `83-assets-solution.png` and `84-asset-prev-next.png`.

**Before you start:** part 22 (rename to Assets and Packages) must be in the code: `lib/concept/words.ts`, `nAssets`, `nPackages`, and the `/concept/assets` and `/concept/packages` routes. If they're missing, stop and say so.

This prompt is closed. It adds three things to customer screens:

1. a "Needs your decision" card on the mature Overview;
2. solution chips on the Assets list;
3. previous / next on the asset page when you came from a package.

Don't change `data.ts`, ops screens, the pilot Overview, service pages or the package page layout.

---

## Why

Research (`docs/concept/ia-fit-research.md`) found three things:

- Customers leave the Overview within seconds for the thing that waits on them.
- They work through one solution at a time.
- They go back and forth between a package and its assets.

These three changes shorten each path. All three are orientation: links and filters. There are no new buttons that do work.

Copy is labels and short facts. Don't name CQuel staff.

## 1. Overview: "Needs your decision" (mature only)

**Placement:** a flush `Card` directly under "Find an asset" (or under the title when search is hidden), and above the Services bar. Use the same 16px gap as the other cards.

**When to show it:** only when at least one live customer workstream has `owner === 'you'`. With none, there's no card and no empty state.

**Header:**
- Title "Needs your decision".
- Right slot: `nPackages(n)`, where n is every workstream with `owner === 'you'`.

**Columns** (the header row uses the existing table header class):

| Column | Content |
|---|---|
| PACKAGE | Workstream name in `h8 text-text-title`. Under it, `p7 text-text-tertiary`: "`<batch name>` · `nAssets(<distinct buildings in activeProjects(w)>)`". The ChangedDot from `changedRecently(w)` sits in the 32px left padding. |
| NEXT STEP | `nextParts(w).main` in `h8`, primary colour. `nextParts(w).detail` under it in `p7 text-text-secondary`. With no detail, leave the second line out. |
| (pill) | The existing "Your action" pill. |
| (chevron) | The whole row links to `hrefs.workstream(w.id)`. |

The grid is `minmax(0,1.4fr) minmax(0,1.4fr) 110px 16px` with a 24px column gap, matching the image.

**Rows:**
- **Sort:** `lastChangedOn(w)` newest first, then name A–Z.
- **Count:** show the first **3** only. No "Show all" expand inside the card.

**Footer:** shown only when n > 3.
- Left: "Showing 3 of `<n>` · newest first" in `p7 text-text-tertiary`.
- Right: a link "See all `<n>`" to the packages list filtered to your action: `/concept/packages?responsibility=you`. That page already reads `responsibility=you`.
- With 3 or fewer, there's no footer.

**Also on the Overview:** the Services bar footer "Your action: n packages" stays. Both point at the same list.

Put the card in its own component, `components/concept/Decisions.tsx`, and render it in `MatureDashboard`.

## 2. Assets list: solution chips

**Placement:** a row of chips between the page header and the `FilterBar`, 12px above the filters.

**Chips:**
- **First chip:** "All `<n>`". The rest are one per solution present in the account's asset rows: "`<solution label>` `<n>`".
- **Order:** "All" first, then by count high to low, then A–Z.
- **Counts:**
  - Each count is the number of asset rows that chip would show, with the **other** filters applied (search, batch, service). That keeps counts honest while filtering.
  - An asset with two solutions counts once in each.
  - "All" is the number of rows with the other filters applied.
- **Zero counts:** hide a solution chip whose count is 0, unless it is the selected one.
- **Style:**
  - The selected chip is filled dark: `bg-surface-strong text-text-inverse`, the same tokens as `Button variant="strong"`.
  - The others are outlined: `border-border-default bg-surface-primary text-text-primary`.
  - All chips use `p6` and are 32px high with 12px horizontal padding and a pill radius.
  - The count sits after the label in the same weight, `text-text-tertiary` on unselected chips.
- **Behaviour:**
  - Clicking a chip writes `?solution=<id>`; "All" clears it.
  - It uses the same `write()` the filters use, so the URL, the list, "Showing 10 of n" and Clear filters all follow.

**Remove the Solution select** from the `FilterBar`. The chips replace it, so the bar becomes Search · Batch · Service, and `selects={2}`.

**Clear filters:** also clears the solution.

Make the chip a small reusable `FilterChips` in `ui.tsx`, taking `options: { id: string; label: string; count: number }[]`, `value` and `onChange`. Section 1 doesn't use it, but service pages may later.

## 3. Asset page: previous / next inside a package

**When to show it:** only when the URL has `from=workstream&ws=<id>` and that workstream exists. From the Assets list, search, a batch or a service, there's no previous / next.

**The sequence** is the asset order the package page's Assets card shows: `activeProjects(w)` in that card's sort. Reuse the same sort function; don't write a second one. If the card has no named sort function yet, pull it out into `derive.ts` and use it in both places.

**Placement:** on the breadcrumb row, aligned right, in `p6`:

```
‹ <previous asset name>    <i> of <n> in this package    <next asset name> ›
```

- **Previous and next are links** to the neighbouring asset page with the same `from=workstream&ws=<id>`, so the breadcrumb and the control stay.
- **At the ends:**
  - On the first asset, previous reads "Previous", greyed out (`text-text-disabled`, not a link).
  - On the last asset, next reads "Next", greyed out.
  - Don't wrap around.
- **The middle text** is `text-text-tertiary`.
- **One asset in the package:** no control.
- **Keyboard:** `[` and `]` go to previous and next when focus isn't in an input. Add `aria-label` "Previous asset in this package" / "Next asset in this package" to the links.

## Expected values (current repo data, Halvering; ignore exact numbers if part 21 was run)

- **Overview (`/concept`):**
  - "Needs your decision" sits under search.
  - The right slot reads `nPackages` of every `owner === 'you'` workstream, the same number as "Your action: n packages" in the Services bar.
  - It shows 3 rows, newest first. Rows changed in the last 7 days have the dot.
  - The footer reads "Showing 3 of n · newest first · See all n", and the link opens `/concept/packages?responsibility=you`.
- **Assets list (`/concept/assets`):**
  - The chips read "All 36", then each solution with its count. The counts for EV charging, LED, Solar PV and Heat pumps add up to 36 or more, because an asset with two solutions counts in each.
  - Choosing "Solar PV" lists only Solar PV assets, and the URL has `?solution=solar`.
  - With Batch = Flagship sites, the chip counts drop to that batch.
  - The filter bar has no Solution select.
- **Asset page from a package:**
  - Open EV charging · Voltreny, then its first asset. The breadcrumb row shows a greyed "Previous", "1 of 6 in this package", and the second asset's name with ›.
  - On the sixth asset, "Next" is greyed.
  - Opening the same asset from the Assets list shows no control.

## Done when

- **Overview:** it matches `82-overview-decisions.png` in structure, with the card under search, 3 rows and the footer only when there are more. There's no card when nothing waits on the customer.
- **Assets list:** it matches `83-assets-solution.png`, with chips above the filters, honest counts, no Solution select, and URL-driven state. Clear filters resets the chips.
- **Asset page:** it matches `84-asset-prev-next.png`. Previous / next appears only from a package, follows the package's asset order, greys out at the ends, and keeps `from=workstream&ws`.
- **Unchanged:** the pilot Overview, ops screens, service pages, the package page layout and `data.ts`.
- **Build:** `npm run build` passes.
- **Report:** write this checklist into your final message with pass or fail for each item, and list every file you touched.
