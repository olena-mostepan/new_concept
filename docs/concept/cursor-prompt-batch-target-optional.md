# Cursor prompt, part 30: batch target date is optional

Paste everything below the line into Cursor, in the `new_concept` repo. No images are needed.

This prompt is closed. It changes how a batch's target date shows. Nothing else changes.

---

## Why

A batch is the assets a customer wants to get one thing done on. Real goals rarely land on time, so the date is for reference only.

- It isn't part of the goal.
- It never reads as a deadline.
- It never marks a batch as late.

## Changes

1. **Wording:** where a target shows, it reads "target `<month year>`", never "by `<month year>`".
   - `lib/concept/derive.ts` `batchSummary`: both `by ${b.target}` → `target ${b.target}`.
   - `app/concept/batches/[id]/page.tsx`, line ~25: `by ${batch.target}` → `target ${batch.target}`.
   - `components/concept/lists.tsx`, line ~140: `` ` · by ${b.target}` `` → `` ` · target ${b.target}` ``.
2. **No date, no trace:**
   - When a batch has no `target`, nothing shows: no "—", no empty slot, no "No target".
   - `components/concept/BatchesIndex.tsx`, line ~298: render the target cell only when there is one, otherwise an empty cell.
   - **Target column:** label it "TARGET" (not "BY"). Show the column only when at least one batch in the list has a target.
   - The Overview Batches card (`dashboard.tsx` `Batches`) already filters empty values; check that it says "target Dec 2027".
3. **Never late:** no "overdue", "late" or "missed" for a batch anywhere. If any component compares a batch target with today, remove that comparison and list it.
4. **Ops "new batch":** the field label becomes "Target date (optional)". The hint under it reads "For reference only. Nothing is shown as late."
5. **Data:** in `lib/concept/data.ts`, remove `target` from the Offices batch (line ~94), so the prototype shows both cases. Flagship keeps "Dec 2027".

## Done when

- **Flagship sites:** its batch page meta reads "… · target Dec 2027", and its Batches card line says the same.
- **Offices:** its batch page and card show no date and no placeholder.
- **Batches list:** the TARGET column shows "Dec 2027" for Flagship and nothing for Offices. With no targets at all, the column is gone.
- **Wording:** `grep -rn "by \${" components/concept app/concept lib/concept` finds no batch target.
- **Never late:** nothing anywhere marks a batch as late.
- **Build:** `npm run build` passes.
- **Report:** write this checklist into your final message with pass or fail for each item, and list every file you touched.
