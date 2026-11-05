# Cursor prompt, part 20b: the batch page with buildings

Paste everything below the line into Cursor, in the `new_concept` repo. Attach `docs/concept/wireframes/81-batch-page.png`.

**Before you start:** part 20 (Buildings, Overview, building page) must be in the code. `buildingChanged`, `hrefs.building` and the Buildings list row are used here. If they're missing, stop and say so.

This prompt is closed. It changes the customer batch page `/concept/batches/[id]` only: `app/concept/batches/[id]/page.tsx` and `BatchView.tsx` with `variant="page"`. The pilot dashboard variant, Overview, Buildings, the building page, the workstream page, service pages and ops pages stay as they are. Don't change `data.ts`.

---

## Why

A batch is a group of buildings with one goal, usually with one solution and never more than two. Its page answers three things:

- what the batch is for;
- where its projects are across the services;
- which buildings are in it.

Workstreams show how the work is run. Buildings show what the customer owns. Both belong on this page.

Copy is labels and short facts only. Don't name CQuel staff.

## Layout (top to bottom, 16px apart)

1. Header
2. Route
3. Workstreams
4. Buildings (new)
5. Recent activity

## 1. Header

- **Breadcrumb:** "Overview › <batch name>". Overview is the active tab. The batch page has no tab of its own; you reach it from the Batches list on Overview.
- **Title:** the batch name in `h4`.
- **Meta line** (`p6 text-text-secondary`): "<goal> · <n> buildings · <solutions> · by <target>".
  - `<solutions>` is the `SOLUTIONS` labels of the batch's customer workstreams, de-duplicated, in workstream order, joined with ", ". Use sentence case ("EV charging", "Solar PV").
  - Leave out "by …" when there's no target.
- **Right:** the ChangedDot key, "Changed in the last 7 days". **No buttons:** no View, no See buildings and no See info.

## 2. Route

- Keep the part 14 route and its popover, unchanged.
- **Counts stay in projects,** because a service holds projects: "<n> projects", "<n> passed through", "<n> completed".
- The right slot reads "<n> projects in progress".
- A service no workstream in the batch uses shows the dashed bar and "Not required".

## 3. Workstreams

- **Card:** the title changes from "Workstreams in this batch" to **"Workstreams"**. The right slot is the count, or "<n> in progress · <n> completed" when some are completed.
- **Rows:** the line under each workstream name reads **"<n> buildings"** ("1 building"). It counts the distinct buildings among `activeProjects(w)`.
- **Links:** rows link to the workstream with `from=batch`, so the workstream breadcrumb is "<batch> › <workstream>".
- **Unchanged:**
  - the columns: WORKSTREAM, SERVICE (tag), NEXT STEP, the Your action pill and the chevron;
  - the ChangedDot and the sort;
  - the Completed fold.

## 4. Buildings (new)

A flush `Card` titled "Buildings", with the batch's building count on the right. It uses the same row as the Buildings list from part 20, **without the Batch column**.

| Column | Content |
|---|---|
| BUILDING | Name in `h8 text-text-title`, city under it in `p7 text-text-tertiary`. The ChangedDot from `buildingChanged` sits in the 32px left padding. |
| SOLUTION | The solution label. With 2+ projects in this batch: the labels joined with ", " and "<n> projects" under them. |
| SERVICE | The current service label, with "since <date>" under it (the current phase's `startedOn`). Completed: "Completed" with the date. With 2+ projects: the labels joined with ", ", and no date. |
| (chevron) | The whole row links to the building page with `from=batch&batch=<id>` |

- **Which projects count:** only projects in this batch's customer workstreams. A building's projects in other batches don't show here.
- **Sort:** changed first, newest first; then A–Z by name.
- **Rows:** show 8, then a footer with "Showing 8 of <n>" and a secondary button "Show all <n>". With 8 or fewer buildings there's no footer.
- **Building page breadcrumb from here:** "<batch name> › <building>", with Overview active. Add this path to the breadcrumb logic from part 20 if it isn't there yet.

## 5. Recent activity

Unchanged: the batch's activity, 5 rows, with "See all".

## Expected values (current repo data, Halvering)

The current sample data still has several solutions per batch. Check that the page reads the data; don't edit the data to match the image.

- **`/concept/batches/flagship`:**
  - Breadcrumb "Overview › Flagship sites", with Overview active.
  - The meta line starts "Cut energy use at the 12 flagship sites · 12 buildings · " and lists the batch's solution labels, then "· by Dec 2027".
  - There are no buttons in the header.
  - The Workstreams rows read "<n> buildings": LED "8 buildings" (9 projects, 1 dropped), and EV charging · Voltreny "6 buildings".
  - The Buildings card shows 12 buildings, 8 rows, then "Show all 12".
  - Kervelstraat 14 is the first row and has the dot.
  - Buildings with several projects in Flagship show the joined solutions and "<n> projects".
- **Kervelstraat 14 → building page:** breadcrumb "Flagship sites › Kervelstraat 14", with Overview active.
- **`/concept/batches/offices`:** the Buildings card shows 24 buildings, 8 rows, then "Show all 24".

## Done when

- `/concept/batches/flagship` matches `81-batch-page.png` in structure: header with no buttons, Route, Workstreams, Buildings, Recent activity.
- **Meta line:** it lists the batch's solutions.
- **Workstream rows:** they count buildings, and link with `from=batch`.
- **Buildings card:** it lists only this batch's buildings and projects, is sorted changed first then A–Z, shows 8 rows then "Show all", and its rows open the building page with the batch breadcrumb.
- **Unchanged:** the route popover still works. The pilot dashboard, Overview, Buildings, the building page, service pages and `data.ts` are unchanged.
- **Build:** `npm run build` passes.
- **Report:** write this checklist into your final message, with pass or fail for each item.
