# Cursor prompt, part 12: the pilot dashboard

Paste everything below the line into Cursor, in the `new_concept` repo. Attach `docs/concept/wireframes/57-pilot-dashboard.png` to the chat.

This prompt is closed: only the pilot dashboard changes. That's `/concept` for Showcase Cinemas, rendered by `BatchView` with `variant="dashboard"`. The batch page (`variant="page"`) and the mature dashboard stay exactly as they are.

---

## Why

The pilot dashboard shows too much detail and asks for too much action. The new direction is orientation first.

- Each service in the route gets a short explanation.
- The long needs lists under the route are replaced by two cards: what we have, and what we still need.
- The workstream step trackers go.

Copy on screen is interface labels and short facts only. Don't add explanatory sentences or "we'll…" phrasing, and don't name CQuel staff.

## Layout (top to bottom)

Under the page title "Welcome back, Olena Mostepan" (keep `PageHeader`), the cards are 16px apart:

1. **Pilot card**, full width
2. **What we have** and **What we still need**, side by side (`grid grid-cols-1 lg:grid-cols-2 gap-4 items-start`)
3. **Solutions**, full width
4. **Recent activity** and **Documents**, side by side, as they are now

Use the existing `Card` component (header 12/24 padding, `h7` title, right slot in `p7 text-text-secondary`).

## 1. Pilot card

- **Header:** the title is the batch name ("Pilot · 8 cinemas"). The right slot shows the solutions, joined with " · " ("EV charging · Solar PV").
  - Remove "8 buildings · 2 workstreams · Lead Tamsin Quarrell".
  - In `derive.ts` (around line 433), stop adding `Lead ${b.lead}` to any customer-facing meta.
- **Goal line:** `p6 text-text-secondary`, 20px above the route: `Goal: <goal>`. Shorten the pilot goal in `data.ts` to "cost of EV charging and solar across 8 cinemas".
- **Route:** six columns in the same order as now: Getting started, Estimates, Planning, Tender, Pricing, Delivery. Gap 16px. Each column is:
  - a bar, 6px tall and fully rounded:
    - Now: `black-7`
    - Next and Planned: `black-2`
    - Not required: a 1px dashed `border-dark` outline with no fill
  - the service name, 10px below the bar: `l1-strong text-text-primary` for Now, `l1 text-text-title` otherwise, and `text-text-tertiary` for Not required;
  - the status in `p7 text-text-tertiary`: "Now · plan ready" / "Next" / "Planned" / "Not required";
  - a short label, 6px below the status, in `p7 text-text-secondary`:

| Service | Label |
|---|---|
| Getting started | Pilot plan |
| Estimates | Cost and payback from your data |
| Planning | Surveys and site checks |
| Tender | Supplier bids from our network |
| Pricing | No existing supplier (in `text-text-tertiary`) |
| Delivery | Installation to handover |

  Put these labels in a `SERVICE_LABEL` map in `model.ts`, plus `pricingNotNeeded: 'No existing supplier'`. They replace the long `routeNotes` sentences on this screen only.
- **Agree plan:** a Primary button, default size (32), 12px under the Getting started label. It does what the current button does. Remove "You agree the plan", the ticked "Files received" and "Plan proposed" lines, and "Reply to Tamsin".
- **No needs lists inside the route.** On this variant, `RouteWithNeeds` renders without needs panels. Add a prop for that, or render a plain route here.

## 2. What we have

- **Header:** "What we have", with the right slot showing "<filesCount> files" ("23 files").
- **Rows:** each row is a 16px `check` icon in `icon-dark` with 8px to the text, then the label in `p6 text-text-primary` and a second line in `p7 text-text-tertiary`. Rows have 6px top and bottom padding.
  - Site plans · 9 Oct
  - Drawings · 9 Oct
  - Electricity bills, 12 months · 9 Oct
- **Data:** add `received: [{ label, date }]` to the pilot batch in `data.ts` with these three items, and render that list. Don't invent counts.

## 3. What we still need

- **Header:** "What we still need", with the right slot showing "After you agree the plan".
- **Rows:** each row is a 6px `brand-6` dot (the only orange besides the button), the label in `p6 text-text-primary`, and a second line in `p7 text-text-tertiary` made of scope · reason:

| Label | Second line |
|---|---|
| Half-hourly electricity data, 12 months | 8 sites · to size chargers |
| Car park ownership | Leeds, Reading · landlord consent |
| Roof age or last re-roof | 5 sites · affects payback |

- **Data:** use the existing needs data (the indicative-pricing needs of the pilot workstreams). Shorten each `why` in `data.ts` to the reason shown here.
- **Don't show CQuel's own later items here** (roof surveys, grid connection capacity, the "Later" group).

## 4. Solutions (replaces "Workstreams in this batch" on this variant)

- **Header:** "Solutions", with the right slot showing "Estimates · <total projects> projects" ("13 projects").
- **Rows:** one row per pilot workstream, a grid of `180px minmax(0,1fr) 260px` with a 24px gap and 14px top and bottom padding. Rows after the first get a `border-light` line on top.
  - **Column 1:** the solution in `h8 text-text-title`, then "<n> sites" in `p7 text-text-secondary`.
  - **Column 2:** every site name, comma-separated, in `p6 text-text-primary`. Don't use "+4". If the workstream has an `exclusion`, show "Excluded: Leeds, Nottingham, Reading · pitched or shared roofs" under the names in `p7 text-text-tertiary`.
  - **Column 3:** "Result" in `p7 text-text-tertiary`, then the output in `p6 text-text-primary`: "Cost and payback per site" for EV, and "System size, cost and payback per roof" for solar.
- **Remove on this variant:** the step trackers (Data collected → Decision), the "Estimates" service tags, the "Your action" pills and the changed dots.

## 5. Recent activity and Documents

Keep the cards and the "See all" links. Make the copy short facts:

| Card | Row | Line | Right |
|---|---|---|---|
| Activity | Plan proposed | EV charging · 8 sites, Solar PV · 5 sites | 14 Oct |
| Activity | Files received | 23 files | 9 Oct |
| Activity | Pilot set up | 8 cinemas (no "added by Tamsin Quarrell") | 8 Oct |
| Documents | Pilot plan | PDF · 14 Oct | Download |
| Documents | Your files | 23 files · 9 Oct | View |
| Documents | Indicative estimates (title in `text-text-tertiary`) | After Estimates | no action |

**Styling:** row titles are `h8 text-text-title`, lines are `p7 text-text-secondary`, and dates are `p7 text-text-tertiary`. Actions are the quiet underlined link.

**Data:** update the pilot activity and document text in `data.ts` to match.

## Done when

- `/concept` as Showcase Cinemas matches `57-pilot-dashboard.png`, card by card.
- The only orange on the page is the Agree plan button and the three dots in What we still need.
- `grep -rn "Tamsin" components app` returns nothing. Tamsin may stay as data in `lib/`, but no customer screen renders it.
- No step trackers, Your action pills or "+N" site lists on this screen.
- `/concept/batches/pilot` (the batch page) is unchanged.
- `npm run build` passes.
- Write this checklist into your final message, with pass or fail for each item.
