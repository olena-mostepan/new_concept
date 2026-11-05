# Cursor prompt, part 5: "Changed in the last 7 days" dot

Run this after parts 1–4, in the same `new_concept` repo. Paste everything below the line into Cursor. Wireframe: `docs/concept/wireframes/36d-workstreams-changed.svg`.

---

## Task

Help the customer see which workstreams moved recently and which have been sitting, without adding columns, groups or charts.

Every rule from parts 1–4 still applies. This is a small change: the lists stay exactly as they are.

## The rule

- A workstream **changed in the last 7 days** if its latest dated event is within 7 days of `TODAY` (`lib/concept/model.ts`), counting today. A dated event is any of:
  - an `activity` date
  - a need's `since` or `received`
  - a project step change or visit date
  - `startedOn` / `completedOn`
- Add one derived helper to `lib/concept/derive.ts`: `lastChangedOn(ws): string` and `changedRecently(ws): boolean`, using the existing `days()` helper. Don't store a flag on the data.
- Done workstreams never get the dot. Their line in the Done row already carries the date.

## How it looks

- **Dot:** a solid 7px black dot (`--cq-text`), 12px to the left of the workstream name, vertically centred on the name. Nothing else on the row changes.
- **Key:** top right of the page header, in line with the meta line: ● "Changed in the last 7 days", 13px, secondary text colour. Show it once per page.
- **Order inside each batch, or each group:** rows with a dot first, newest change first. Then the rest, oldest last change first, so the ones sitting longest are on top. Ties keep their current order.
  - Flagship: EV charging · Voltreny, Solar PV DE · then Heat pumps · Flagship, Heat pumps · Kelderby, Solar PV · Missing roof data, LED, EV charging · DE flagships.
  - Offices: Heat pumps, LED · Offices FR and BE, EV charging · Offices, LED · Offices DE · then Heat pumps · BE offices, Solar PV · Offices DE, Solar PV · BE offices, Solar PV FR/BE · Solvarek, Solar PV · FR offices.
  - On service pages this order applies inside each group. It replaces "waiting days, longest first".
- **Every Next detail line ends with a date** (e.g. "Started 14 Oct", "Rue Belvaux 22 completed 9 Oct"), and with "waiting N days" when the workstream is waiting on you or a supplier. Check the rows that currently have no date and fill them from the data.
- No colour, no "New" label, no last-seen tracking.

## Where

Use the same dot, key and order on:
- the Workstreams list (36)
- the dashboard "Right now" (33)
- the batch page "Workstreams in this batch" (35)
- the Estimates, Planning and Tender section pages (37, 40, 43)

## Data change

- EV charging · Voltreny (`ev-voltreny`): add the activity entry `{ date: '14 Oct', title: 'Installing started', text: 'Kervelstraat 14.' }`. Its Next line becomes "Installing at Kervelstraat 14 — started 14 Oct".

## Expected result on the Workstreams list (TODAY = 19 Oct 2026)

- **Flagship, 2 dots:** Solar PV DE (12 Oct), EV charging · Voltreny (14 Oct).
- **Offices, 4 dots:** Heat pumps (15 Oct), LED · Offices FR and BE (14 Oct), EV charging · Offices (14 Oct), LED · Offices DE (13 Oct).
- Every other live row has no dot.

## Done when

- The dot, key and order appear on all six surfaces above. They're the same everywhere, and all come from `changedRecently()`.
- The counts above match.
- No new columns, groups, badges or colours were added.
- The parts 1–5 rules pass, item by item. Write the checklist into your final message, with a pass or fail for each item.
