# Cursor prompt, part 11: summary cards and a labelled filter bar

Paste everything below the line into Cursor, in the `new_concept` repo, and attach `docs/concept/wireframes/56-workstreams-header.png` to the chat.

This is a small, closed task. Don't touch anything outside the files named here.

---

## Why

At the moment the Workstreams page and the service pages put their counts in one grey line at the far right: "25 workstreams across 2 batches · 19 in progress · 6 done". That line is easy to miss and hard to scan.

The filters have three problems:
- They have no labels. The placeholder text is doing the label's job.
- They stretch to fill the row, so each one is about 360px wide even though it only holds a short value.
- They aren't the design-system fields.

## 1. Summary cards (`components/concept/ui.tsx`)

Add a `SummaryCards` component. It takes the same list as `workstreamSummary` and renders **four** cards that fill the content width: `grid grid-cols-2 lg:grid-cols-4 gap-4`, 16px below the page title. Every card is the same width, so their edges line up with the filter bar and the table. The three action cards add up to the total.

| Card | Label | Number | Line |
|---|---|---|---|
| 1 | Workstreams | total | `across <n> batch(es)` |
| 2 | Your action | `owner === 'you'` | `<n>% of workstreams` |
| 3 | CQuel's or suppliers' action | `owner === 'cquel' \|\| owner === 'suppliers'` | `<n>% of workstreams` |
| 4 | Done | `owner === 'done'` | `<n>% of workstreams` |

**Card styling**
- **Box:** white, `border border-border-dark`, `rounded-[12px]`, padding 16px top and bottom and 20px left and right, no shadow.
- **Label:** `p7 text-text-secondary`.
- **Number:** `h4 tabular-nums text-text-primary`, 4px below the label.
- **Line:** `p7 text-text-tertiary`, 2px below the number.
- **Rounding:** percentages are whole numbers. Show the line only when the total is above 0.
- **Orange:** only the Your action card has orange: a 6px `--brand-6` dot before its label, with a 6px gap. Nothing else on the cards is orange.

**Behaviour**
- Cards 2–4 are buttons that set the Responsibility filter:
  - Your action → `you`
  - CQuel's or suppliers' action → both `cquel` and `suppliers`
  - Done → `done`
- Clicking the active card again clears the filter. The active card gets a 1.5px `border-black-7` and `aria-pressed`.
- When other filters are set, the cards count only the filtered list.

**Where:** under the title on `/concept/workstreams` (`WorkstreamsByBatch`) and on the service pages (`ServiceSection`). Remove the summary text wherever `ChapterAside` shows it.

## 2. Filter bar with labels (`WorkstreamsByBatch.tsx`, `ServiceSection.tsx`)

**Every control has a visible label above it.** The placeholder is never the label. Wrap each control in a `<label>` (or use `htmlFor`) so the label is the accessible name.

**Row:** 24px below the cards. It's a grid that fills the content width: `grid items-end gap-4` with `grid-template-columns: 1.5fr repeat(<number of selects>, minmax(0,1fr)) auto`. The last `auto` column holds Clear filters. On phones it becomes one column.

**Each field**
- A vertical stack with a 4px gap: label on top, control below.
- **Label:** `h9` (12/16, 600), `text-text-title`.
- **Control:** **40px tall**, the standard field height and the same as inputs in forms and Large buttons. Radius 8, `border-border-dark`, white, `p6`. Each control fills its grid column (`w-full`).

| Field | Label | Control |
|---|---|---|
| Search | "Search" | Fills its 1.5fr column, padding 0 12px. 16px search icon in `--icon-default` on the left, 8px from the text. Placeholder "Workstream or project name" in `text-text-tertiary`. |
| Batch | "Batch" | Default option "All batches" |
| Service | "Service" | Default option "All services" |
| Solution | "Solution" | Default option "All solutions" |
| Responsibility | "Responsibility" | Default option "All", then Your action / CQuel's action / Suppliers' action / Done |

**Selects**
- Padding 0 32px 0 12px, with a 16px chevron at right 10px.
- With a default value the text is `text-text-title`. With a chosen value it's `text-text-primary` and the border becomes `border-black-6`.

**Clear filters:** a quiet underlined link (`h8`, `whitespace-nowrap`), shown only when any filter or the search is set. It sits right after the last field, aligned to the controls.

**ChangedKey:** on its own line, right-aligned, 12px under the filter row and 8px above the table, in `p7 text-text-secondary`. It moves here from under the summary.

Delete the local `fieldClass`, `selectClass` and `selectStyle` in both files. Use one shared set from `ui.tsx`: `FilterField` (label + control), `filterSearchClass` and `filterSelectClass`.

## Done when

- `/concept/workstreams` matches `56-workstreams-header.png`: four equal-width cards reading 25 / across 2 batches, 11 / 44%, 8 / 32% and 6 / 24%, filling the content width. Below them, the labelled 40px filter row, also full width, with Clear filters at its right end. Under that, the changed key on the right.
- Clicking Your action shows only the 11, and clicking it again shows all 25.
- Every filter has a visible label above it, and the defaults read All batches / All services / All solutions / All.
- The service pages show the same cards for their own list.
- Every filter control is 40px tall. The cards and the filter row both span the same width as the table.
- `grep -n "fieldClass\|selectStyle" components/concept/WorkstreamsByBatch.tsx components/concept/ServiceSection.tsx` returns nothing.
- `npm run build` passes.
- Write this checklist into your final message, with pass or fail for each item.
