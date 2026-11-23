# Design system update, part 36: ended and continued packages

Apply these to the CQuel design system artifact, then re-export into `docs/design-system/`. The source is the canvas "Ended and continued packages" (https://claude.ai/artifact/5c7949uvSqhJXdFSpyVHVK) and Cursor prompt part 36.

## Chip
- New lead, **`ended`**: a service or step that stopped without finishing.
- White fill, 1px `border-dark` border, label in `text-secondary`.
- In front of the label: a `black-muted` circle with a white cross, 14px (24px chip) or 16px (`big`).
- Ink-grey only, never a status colour or orange. It's a display chip: not clickable.
- In a track it is always last.

## Steps
- **An ended service:** done chips up to the last step reached, then the `ended` chip "Not going ahead · `<date>`". Later steps aren't drawn and no chip shows a count.
- **Supplier chosen outside CQuel:** every step is done. The line under Supplier chosen reads "outside CQuel · `<date>`".
- **Closed and ended packages keep their steps** as a record. This replaces "Closed: no chips, no steps".

## StatusCard
- **Ended packages** (supplier outside CQuel, not going ahead) use the closed variant, "This package is / Closed · `<date>`", with the grey icon and no button.
- **New variant `continued`:** "This package continued in" over the next package's service in `h4`, with the grey icon of the service it ended in. The large `strong` Button "Open `<service>`" goes to the next package.

## Banner
- **New use, the ending Banner:** a `warning` Banner (yellow ground) with the `info` icon, on an ended package's page and on the asset page (when that package is selected). The title is the ending and its date ("Supplier chosen outside CQuel · 14 Oct"). The line under it is the reason Ops recorded, which the customer sees. The Banner always shows on an ended package, with or without a reason.
- **Decided** (Olena, 23 Nov): yellow, because a stopped package is a state. Neutral grey disappeared on the grey page background.

## Moves
- **Reasons:** one exception to "No reasons on screen": the "Why it ended" Banner.
- **Words:** add the endings "continued in `<service>`", "supplier outside CQuel" and "not going ahead". IN PACKAGE and In package read "Ended `<date>` · `<ending>`". History adds "Continued in `<service>`" and "Package ended · `<ending>`".
- **Never:** "terminated" or "lost" (alongside the existing never-list).

## Batch page
- **Packages tab:** one row per line of work. A package that continued into another has no row; its successor's NOW has "After `<service>` · `<date>`" under it.
  - Ended packages sit in an "Ended · `<n>`" group at the end, muted, with their ending. This replaces the "`<n>` closed" fold.
  - The HOW IT CAME column is dropped.
  - The Packages fact and the tab count the rows shown.
- **ServiceCards:** count live packages only. An "Ended" card in text-tertiary follows the services, as Dropped and Moved out do.

## FactSelect
- **Earlier:** ended packages sit under Earlier, with the line "Ended `<date>` · `<ending>`".
- **One option per line of work:** a continued package is carried by its successor.

## PackageCard
- **An ended package selected:** the "left" variant, with the steps as a record. A service that ended unfinished uses the `ended` big chip.
- **A continued line:** shows both services as big chips.

## Ops
- **"End package…":** a `secondary` Button on the Ops package page while the package is live. It opens a Modal (480) with:
  - What happened: two radio cards;
  - Supplier (optional);
  - Ended on;
  - Why it ended, which the customer sees;
  - Cancel and the primary "End package".
