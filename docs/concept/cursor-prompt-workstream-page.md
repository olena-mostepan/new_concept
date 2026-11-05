# Cursor prompt, part 19: the workstream page

Paste everything below the line into Cursor, in the `new_concept` repo. Attach these images from `docs/concept/wireframes/` to the chat:

- `64-workstream-tender.png`
- `65-workstream-delivery.png`
- `66-workstream-indicative.png`
- `66b-workstream-info.png`
- `67-service-card-states.png`

**Before you start:** parts 16 (phases) and 17 (nav, Batches, breadcrumbs) must already be in the code. If `Workstream.phases` is missing, stop and say so.

This prompt is closed. It changes the customer workstream page `/concept/workstreams/[id]`:

- `IndicativeWorkstream.tsx`
- `ScopeWorkstream.tsx`
- `TenderWorkstream.tsx`
- `PricingWorkstream.tsx`
- `DeliveryWorkstream.tsx`
- `app/concept/workstreams/[id]/page.tsx`
- a few new shared pieces in `components/concept/`

Project pages, ops pages, service pages and the batch page stay as they are, apart from the `from` param on links to workstreams (section 1).

---

## Why

A workstream goes through its own services, as phases. The page shows them as cards across the top; they are the navigation within the workstream.

- **Below the cards:** the selected service's own tabs and content.
- **Overview is orientation only:** Steps (simplified), Projects, Recent activity and Documents.
- **No actions on this page except one header button:** no Go ahead / Not now, no Confirm date, no View buttons. Rows are links.

## 1. Header (shared `WorkstreamHeader`, used by all five)

### Breadcrumb

It follows where the user came from:

| `?from=` | Breadcrumb |
|---|---|
| `batch` (or no param) | Batches › <batch name> › <workstream name> |
| `service` | <service label> › <workstream name>. The service label links to `hrefs.service(w.service)`. |

- Add `from` to `hrefs.workstream(id, from?)`.
- Links from service pages pass `from=service`. Links from batch pages and the Batches list pass `from=batch`.
- Direct links fall back to the batch breadcrumb.

### Title and meta line

- **Title:** `w.name`.
- **Meta line:** a new `workstreamMeta(w)` in `derive.ts`, in `p6 text-text-secondary`. It starts with the batch name, then the facts below, joined by " · ". Only include facts that have data.

| Service | Meta line |
|---|---|
| Estimates | "<batch> · <n> buildings · <range> across <n> estimates · <n> waiting for your decision" |
| Tender | "<batch> · <n> buildings · <total size> · <in> of <invited> offers in · offers due <date>" |
| Delivery | "<batch> · <n> buildings · <complete> of <n> complete · est <date> · contract <value>" |
| Planning, Pricing | "<batch> · <n> buildings" plus the one fact the old details grid led with (surveys done, price) |

### Right side

- **Your action pill:** the `StatusPill` for `you`, only when `w.owner === 'you'`.
- **See info:** a secondary button (40px), with a 16px `Info` icon and the label "See info".
  - It opens a right-side panel (`InfoDrawer`): 400px wide, white, with an overlay of `rgba(30,40,50,.25)`. It closes on ×, Esc and overlay click.
  - The panel title is "<name> · info".
  - The panel holds label/value rows (`p7 text-text-tertiary` / `p6 text-text-primary`, `border-t border-border-light py-3`) for the facts the old `DetailsGrid` held:
    - Batch
    - Solution
    - Current service · since <date>
    - Next services
    - Projects (· <n> not proceeding)
    - The service's key figure (estimated cost / total size / contract value)
    - Done when
  - At the bottom of the panel is a quiet link, "View batch".

### Remove from the customer header

- `DetailsGrid`, `DetailTags`, `DetailsToggle`, the service and solution tags, and "View batch". Keep the components in the code; ops may use them.
- "Lead …" and every other staff name.
- The Tender criteria chips. They move into the Brief tab, above whatever it shows now.

## 2. Service cards (new `ServiceCards`)

### Which cards

- One card per entry in `w.phases`, in order: **only the workstream's own services**. Skipped services don't appear.
- They sit in a grid: `grid-cols-1 sm:grid-cols-<phases.length> gap-3`, 24px under the header.

### Each card

- The box is `rounded-xl`, padding `14px 16px 14px 20px`.
- **No top bar.**
- The service label is 15/20, then one line in `p7 text-text-tertiary`.

| State | Box | Label | Line |
|---|---|---|---|
| `done` | white, `border-border-dark` | `font-semibold text-text-primary` | "Finished <short(completedOn)>", plus " · <outcome>" when there is one |
| `now` (current) | white, `border-border-dark`, plus a **4px `brand-6` left border** (`border-l-4 border-l-brand-6`) | `font-semibold text-text-primary` | "Now · since <short(startedOn)>" |
| `planned` | `bg-black-1`, `border-black-2` | normal weight, `text-text-tertiary` | "Later" |
| first `planned` in a `proposed` workstream | styled like `now` | as `now` | "Next" |

**Selected (active) card:** `bg-bg-accent` (brand-1) with `border-brand-2`. It goes on whichever card is open. The current card keeps its 4px left border even when another card is selected, so "where it is now" never moves. By default the current card is selected, so it has both. `67-service-card-states.png` shows the old version: follow this text.

### Selection

- The URL param `?service=<id>` picks the selected card. The default is the current phase.
- **Done cards:** a button. It sets `?service=` and clears `?tab=`.
- **Planned cards:** not clickable.
- **Rendering a done phase:** render that service's component with `asOfPhase(w, phase)`. Add `asOfPhase` to `derive.ts`; it returns a copy of `w` with:
  - `service: phase.service`
  - `owner: 'done'`
  - `startedOn` and `completedOn` from the phase
  - `projects: phase.projects ?? w.projects`
  - `tender`, `pricing` and `surveyNote` from the phase
  - `next: undefined`
- **Header:** the header and cards stay the same; only the content below changes.
- **Routing:** `page.tsx` picks the component from the selected phase's service.

## 3. Tabs

- **Keep:** each service's existing tabs and `?tab=` handling (Tender: Overview · Brief · Supplier matching (n) · Offers (n); Delivery: Overview · Contract · Delivery).
- **Estimates:** it gets tabs: **Overview · Estimates (n) · Your files**.
  - Estimates lists the estimated projects (project, estimate, decision) and the estimates PDF.
  - Your files lists what the customer sent, from `documents`.
- **New dot:** a tab whose content has something the customer hasn't seen gets a 6px `brand-6` dot, 6px after its label, with `aria-label="New"`.
  - In the prototype, an Estimates tab is new when any project has `decision === 'waiting'`.
  - An Offers tab is new when the offers summary changed in the last 7 days.

## 4. Overview: four cards, no actions

In order:

1. **"<Service> steps":** `SimpleSteps`, below.
2. **Projects:** the existing table, read-only.
3. **Recent activity** and **Documents:** side by side, with short-fact copy (no full stops, " · " instead of dashes).

### Projects table on Overview

- **No buttons.** Remove Go ahead / Not now, Confirm date and View.
- Each row is a `Link` to the project page, with `hover:bg-black-1` and a 16px `ChevronRight` in `text-text-tertiary` at the end.
- Where a button showed a pending decision or date, show the status as text:
  - "Waiting for your decision" in `h8`
  - "Date to confirm" in `h8`
  - "Going ahead · 8 Oct"
  - "Not proceeding · payback over 12 years" in `text-text-tertiary`
- Drop any column the data can't fill: Estimates has no Payback values, so remove that column.

### Moved cards

- The Tender Offers card moves to the Offers tab.
- Any other Overview card moves to the tab it belongs to, or is removed.
- List every move in your final message.

### `SimpleSteps` (replaces `StepsWithNeeds` on Overview)

- **Input:** the existing `StepColumn[]`.
- **Layout:** one equal column per step. A 2px `black-2` line runs behind the dots, from the first column's centre to the last. Each column is centred.

| Step state | Dot | Label (`l1`) | Line (`p7`) |
|---|---|---|---|
| `now` (projects on it) | 14px **`brand-6`**, with a 4px **`brand-1`** ring | `font-semibold text-text-primary` | "<n> project(s)" in `text-text-primary` |
| `passed` | 10px `black-6` | `text-text-title` | "Done <doneOn>", or "Done", in `text-text-tertiary` |
| `upcoming` | 10px white, with a 2px `border-dark` border | `text-text-tertiary` | "—" in `black-4` |

- **Dates:** add `doneOn?: string` to `StepColumn`. Fill it from `tender.briefAgreedOn`, `tender.matchedOn` and similar dates where they exist.
- **Leave out:** `happens` text, panels and buttons.
- **Right slot:** "Offers due <date>" on Tender when it exists; otherwise "Projects at each step".

## Expected values (Halvering)

### `/concept/workstreams/led-ind` (Estimates, now)

- **Breadcrumb:** Batches › Flagship sites › LED. With `?from=service`, it's Estimates › LED.
- **Meta line:** "Flagship sites · 9 buildings · €85–102k across 6 estimates · 3 waiting for your decision".
- **Right side:** the Your action pill, then See info.
- **Cards:** **Estimates** (Now · since 20 May, left border and accent) · Tender (Later) · Delivery (Later).
- **Tabs:** Overview · Estimates (6) **with dot** · Your files.
- **Steps:**

  | Step | State | Line |
  |---|---|---|
  | Data collected | passed | Done |
  | Estimate | now | 3 projects |
  | Presented | now | 3 projects |
  | Decision | now | 2 projects |

- **Projects:**
  - "Waiting for your decision" on Halverkamp 19, Kervelstraat 14 and Speicherallee 7.
  - "Going ahead · 8 Oct" on Lindenhof 3 and Wiesenstraße 88.
  - Kelmsdorfer Straße 41 greyed: "Not proceeding · payback over 12 years".
  - No buttons.
- **See info panel:**

  | Label | Value |
  |---|---|
  | Batch | Flagship sites |
  | Solution | LED |
  | Current service | Estimates · since 20 May |
  | Next services | Tender, then Delivery |
  | Projects | 9 · 1 not proceeding |
  | Estimated cost | €85–102k · 6 estimated |
  | Done when | You have decided on every project |

### `/concept/workstreams/solar-de` (Tender, now)

- **Meta line:** "Flagship sites · 5 buildings · 1.1 MWp · 8 of 11 offers in · offers due 24 Oct". There's no pill.
- **Cards:** Estimates (Finished 28 Aug) · **Tender** (Now · since 1 Sep) · Delivery (Later).
- **Steps:**

  | Step | State | Line |
  |---|---|---|
  | Brief ready | passed | Done 10 Sep |
  | Shortlisted | passed | Done 12 Sep |
  | Invited | now | 5 projects |
  | Responses in | upcoming | — |
  | Results | upcoming | — |
  | Supplier chosen | upcoming | — |

  The right slot reads "Offers due 24 Oct".

### `/concept/workstreams/ev-voltreny` (Delivery, now)

- **Meta line:** "Flagship sites · 6 buildings · 2 of 6 complete · est 16 Dec · contract €152k".
- **Cards:** Estimates (Finished 30 May) · Tender (Finished 5 Aug · Voltreny chosen) · **Delivery** (Now · since 6 Aug).
- **Steps:** Kick-off 3 · Installation 1 · Complete 2. The rest read "—".
- **Projects:** "Date to confirm" on Kervelstraat 14 and Speicherallee 7. No buttons.
- **Clicking Tender:**
  - The tender view of the 6 projects shows, as finished.
  - Tender gets the accent; Delivery keeps its left border.
  - The URL has `?service=tender`.

## Done when

- **Wireframes:** the three pages and the info panel match the attached images.
- **No staff names and no details grid** in the customer header.
- **No action buttons** on Overview: `grep -n "Go ahead\|Not now\|Confirm date" components/concept/*Workstream.tsx` shows nothing in the Overview path.
- **Breadcrumb:** it follows `?from=`.
- **Service cards:**
  - Only the workstream's own services appear.
  - The current card has the 4px left border; the selected card has the accent.
  - Done cards open that service as finished, and back returns to the current one.
- **Steps:** active dots are `brand-6` with a `brand-1` ring.
- **Tab dot:** Estimates on `led-ind` shows the dot.
- **All services:** all five service types and pilot workstreams render.
- **Build:** `npm run build` passes.
- **Report:** write this checklist into your final message, with pass or fail for each item, plus the moved cards.
