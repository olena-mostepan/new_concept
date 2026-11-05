# Asset page: wireframe spec (4 Nov 2026)

Wireframe: `docs/concept/wireframes/92-asset-page-wireframe.png`. This replaces the asset-page sections of part 25 (chips in the header) and mocks 85, 89 and 91.

## Why

The current page has four problems:

- **It tells the package story three times.** The chips, the "Tender" card (offers, brief, site check) and the package documents all describe the package.
- **The button has no context.** It sits under the facts with nothing to say why it's there.
- **Empty states take whole rows and cards.** "Nothing on file yet" appears twice.
- **The width is wasted.** The facts are spread wide, and the right side of the page is empty.

## The order on the page

1. Where am I.
2. What this asset is.
3. What it's part of, and where to act.
4. Its own progress.
5. Its record.

| # | Block | Content | Rules |
|---|---|---|---|
| 1 | Location row | Breadcrumb on the left. Pager on the right: "‹ name · i of n in this package · name ›" | The breadcrumb comes from `?from=` (at most 3 items). The pager shows only when the asset was opened from a package. The end that has no neighbour is greyed out. `[` and `]` move between assets. |
| 2 | Asset header | H1 with the street address (about 40 characters or fewer). Then "city · batch" in p6. Then one row of facts (up to 6), each a label, a value and a source, 40 apart. | **No facts:** the row is left out. No "Nothing on file yet". |
| 3 | Photo (optional) | 220×138 (16:10), `radius-lg`, to the right of the title block | Only a site photo we hold. **No photo:** nothing, and the title block takes the full width. |
| 4 | Package strip, one per project | "Package" (p7), the package name (h7), and one line on what's there with how many assets share it ("Tender results, contract and delivery for this asset and 5 others"). Display chips: done ✓ and now ●, no planned, no not-needed. Strong button "Open package ›". | This is the only link to the package on the page. aria-label: "Open `<package>` package". **Two projects:** two strips. |
| 5 | At this asset (conditional) | Only this asset's data for the current service: Delivery stages, the Planning site check, the asset's own figure in Estimates or Pricing | **Tender** is priced for the whole package, so there's no card; the strip already says where the offers are. Never repeat package facts here (offer counts, the brief). |
| 6 | History | This asset's own events, newest first, 5 rows, then See all | **Empty:** the card is hidden. |
| 7 | Documents | This asset's files first, then its package's files labelled with the package name. 5 rows, then See all. | **Empty:** hidden. When History or Documents is hidden, the other takes the full width. |

## States

- **Populated:** Delivery, with facts and a photo (the first frame).
- **Sparse:** Tender, with no facts, no photo and no history. The page collapses to the header, the strip and Documents. There are no empty boxes.
- **Two projects:** two package strips, and an "At this asset" card under each strip that has one.
- **Completed package:** the strip line reads "Completed `<date>`". The chips are all ticks. There's no "At this asset" card.

## Phone (360)

- The photo comes first, at full width.
- The facts go into 2 columns.
- The strip stacks: name and line, then chips (wrapping), then the button at full width.
- Delivery stages shrink to the current stage plus "Step 4 of 6".
- The pager moves into the top bar as "1 of 6 ›".

## Removed from the current page

- The "Tender" card: offers, "Priced for the whole package", site check and "Workstream brief". These are package facts, and they live on the package page.
- "Nothing on file yet", in the header and in History.
- The chips and button stacked under the facts. They move into the strip.
