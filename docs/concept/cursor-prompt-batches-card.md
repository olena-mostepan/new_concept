# Cursor prompt, part 10: Batches card and the Responsibility wording

Paste everything below the line into Cursor, in the `new_concept` repo. The reference image is `docs/concept/wireframes/55-batches-card.png`. Attach it to the Cursor chat as well.

This is a small, closed task: two files of logic, one component and the labels. Don't touch anything else.

---

## Why

The Batches card on the dashboard (`components/concept/BatchesCard.tsx`) reads as a wall of alerts:

- orange rings on every workstream that needs the customer, an orange "With you" pill and orange text all repeat the same message;
- the labels "2 your action", "1 suppliers action" and "1 CQuel's action" are ungrammatical and stack two or three lines deep;
- the header falls apart, with the goal floating on the right and the pill and button stacked;
- "12 buildings" breaks the rule that counts are workstreams and batches.

The card's job is **progress across batches**. Actions live in "Right now" and on the service pages, so the card should be calm.

## 1. Responsibility wording (do this first)

**In `lib/concept/model.ts`**, `OWNER_LABEL` becomes:

```ts
export const OWNER_LABEL: Record<Owner, string> = {
  you: 'Your action',
  cquel: "CQuel's action",
  suppliers: "Suppliers' action",
  done: 'Done',
}
```

**In `lib/concept/derive.ts`**, delete `CELL_LABEL`. Every count now puts the label first, `"<Label>: <n>"` (e.g. "Your action: 2"). Never "2 your action".

Then search the repo (`app/`, `components/`, `lib/`) for these strings and replace each one with the matching `OWNER_LABEL` value, or with the label-first count form:

- "With you"
- "With CQuel"
- "With suppliers"
- "your action"
- "suppliers action"
- "Your Action"
- "Suppliers Action"

List each file you changed in your final message.

## 2. Batches card (`components/concept/BatchesCard.tsx`, `batchCells` / `batchSummary` in `derive.ts`)

Match `55-batches-card.png` exactly.

**Batch header**

| Part | Spec |
|---|---|
| Layout | One row: name and meta stacked on the left, a "View batch" link on the right, aligned to the top. |
| Name | Classes `h7` and `text-text-primary`, linking to the batch. |
| Meta, under the name | `p7`, `text-text-secondary`, 4px gap. Text: `<goal> · <N> workstreams · by <target>`. Add the target only when the batch has one. **Remove the building count.** |
| View batch | A quiet underlined link: `h8`, `text-text-primary`, `underline underline-offset-[3px] decoration-border-dark`. It's no longer a boxed button. |
| Pill | **Remove `StatusPill` from the card.** |

**Service cells**

There are five, in a grid: `grid-cols-5` on large screens, 3 on medium, 2 on small, with a 24px gap. The cells sit 16px below the header.

- **Label:** `l1` (13/18), `text-text-title`.
- **Bar:** 8px below the label. One segment per workstream in that service, in a flex row with a 3px gap. Each segment is `flex-1`, 4px tall, fully rounded. Segment colour:
  - done → `var(--black-6)`
  - everything else → `var(--black-2)` (#E5E7EB is fine if `--black-2` reads too light on white)

  **No orange in the bar.** Above 8 workstreams, keep the segments; don't switch to a number.
- **Line 1:** 6px below the bar, `p7`, `text-text-tertiary`: `<done> of <total> done`.
- **Line 2:** 2px below line 1, and only when at least one workstream in that service is at your action. It's `p7` in `text-text-secondary`: a 6px dot in `var(--brand-6)` (`rounded-full`, 6px gap to the text), then `Your action: <n>`. This dot is the only orange on the card.
- **CQuel's and suppliers' counts:** don't show them on this card.
- **Not required** (service not in the route): the label is in `text-text-tertiary`, with a single dashed 4px bar (`border border-dashed border-black-3`, no fill) and "Not required" in `p7` `text-text-tertiary`.
- **Planned** (in the route, no workstreams yet): one empty `black-2` bar and "Planned" in `p7` `text-text-tertiary`.

**Card**

- The card title is "Batches" (`h7`).
- Each batch row has padding 20px top and bottom and 24px left and right. Rows are divided by `border-light`.
- No shadow.

**Data:** change `BatchCell` for live cells to `{ kind: 'live', total, done, you }`. Remove `owners` and `lines`. Delete the `Dot` component.

## Done when

- The card matches `55-batches-card.png` for Flagship sites and Offices DE, FR and BE:
  - names, meta without buildings, the segments, "x of y done" and the "Your action" lines with their dots;
  - Flagship: Estimates and Planning show "Your action: 2";
  - Offices: Estimates 2, Planning 1, Tender 2, Pricing 2.
- The only orange on the card is those 6px dots.
- `grep -rn "With you\|your action\|suppliers action\|Your Action\|Suppliers Action" app components lib` returns nothing, except "Your action" in `OWNER_LABEL` and in the label-first count strings.
- `npm run build` passes.
- Write this checklist into your final message, with pass or fail for each item.
