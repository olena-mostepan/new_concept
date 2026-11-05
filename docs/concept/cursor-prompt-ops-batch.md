# Cursor prompt, part 8: Ops — create a batch, batch page, add workstream

Run this after parts 1–7, in the same `new_concept` repo. Paste everything below the line into Cursor. The wireframes are in `docs/concept/wireframes/`:
`52a-ops-new-batch-properties.svg`, `52b-ops-new-batch-goal.svg`, `53-ops-batch.svg`, `54-ops-add-workstream.svg`.

---

## Task

Rework the ops side under `/concept/ops` so that it matches the ops prototype screens (Portfolio batches · New portfolio batch · Add workstream) and the four wireframes above. This is the ops set-up flow from the round-1 calls:

1. Reconcile properties.
2. Create a batch (properties, then name and goal).
3. Add workstreams.
4. Share the plan, which the customer agrees.

Build on what's there, don't start again:
- `app/concept/ops/page.tsx`
- `app/concept/ops/batches/[id]/page.tsx`
- `components/concept/ops-dialogs.tsx` (`CreateBatchDialog`, `AddWorkstreamDialog`)
- `components/concept/ops-bits.tsx` (`PlanSteps`, `PlanPill`)
- the store's `setPlanState`

Keep the plan states as they are (draft → proposed → agreed → live).

**This written spec is the source of truth. Use the repo's data, not the wireframe's sample text.** Where the two differ, the data wins. For example, the pilot's goal is the one in `data.ts`, the cinema names are "Bluewater (Dartford)" and so on, and there's no target date.

### Routes
| Route | Screen |
|---|---|
| `/concept/ops` | Ops portfolio (keep it; restyle only, see below) |
| `/concept/ops/batches/new` | New batch, step 1 Properties → 52a; step 2 Name and goal → 52b (`?step=2`) |
| `/concept/ops/batches/[id]` | Ops batch page → 53 |
| `/concept/ops/batches/[id]?add=workstream` | Same page with the Add workstream drawer open → 54 |

**Create batch** on the ops portfolio now goes to `/concept/ops/batches/new` instead of opening a dialog. Retire `CreateBatchDialog`.

---

## Rules for the ops side

These are added to the parts 1–7 rules. Where a rule below conflicts with a customer rule, the ops rule applies on ops screens only.

- **Ops enter data.** The customer rules "no data entry" and "no actions on lists" don't apply here. Ops screens have Add, Edit, Remove and form fields.
- **Same chrome as the customer side,** with the toggle on **Ops** and the account name as the title. Ops nav stays `OPS_NAV`.
  - The toggle and the **Customer view** button go to the same place on the customer side (`counterpart()`).
- **Vocabulary:** ops screens say **properties**, the platform's term. Customer screens keep buildings and projects. Use **Solution**, not "Measure".
- **The customer sees a batch only once its plan is shared** (planState `proposed` or later). In `draft`, the customer side doesn't show the batch at all.
- **One service = one workstream.** When ops tick several services, each one becomes its own workstream for the selected properties. No sequence is implied.
- **Missing information is a state, not a gap.** A property with no workstream says why when the data has a reason, e.g. "No solar — pitched or shared roof" from the workstream's `exclusion`. Otherwise it says "No workstream yet".
- Black and white, same tokens and components as the customer concept (`Card`, `OwnerPill`, buttons, the step circles). There are no orange fills on the ops side.

---

## Screen 52a: New batch · Properties (`/concept/ops/batches/new`)

**Header**
- Breadcrumb: "<Account> › New batch". Title: "New batch".

**Stepper card:** two steps.
1. **Properties** — "Choose the buildings in the batch"
2. **Name and goal** — "Name the batch and set its goal"

The current step is outlined. A done step is filled black with a tick, and the line between the steps fills in.

**"Choose properties"** (h2), with the line under it: "Search the customer's properties, describe the ones you want, or find them in the files they sent. You can combine all four."

**Four mode cards in a row.** The selected one is outlined in ink.

| Mode | Sub-line | Behaviour in the prototype |
|---|---|---|
| Search | By name, address or postcode | A search box over `account.buildings`. Results are shown with checkboxes and the property type on the right, plus a "Select all" link. |
| Describe | "All cinemas with a car park" | A text box. On submit it shows a mock matched list, the same as Search results, with the line "Matched from your description — check before adding". |
| From files | Find them in plans or site lists | Lists the account's received files (`filesSummary`, `filesCount`). Picking one shows a mock list of the properties found. |
| Add manually | A property not in CQuel yet | Name, Address, City, Postcode, Property type, then **Add property**. It's added to the account's buildings. |

**"In this batch · N properties"** card:
- Two-column chips (name, address in grey, **Remove**).
- Header right: where they came from, e.g. "6 from search · 2 from the site list you sent".
- Empty state: "No properties added yet."

**Footer:** **Cancel** (outlined) and **Next: name and goal** (filled). Next is disabled at 0 properties.

## Screen 52b: New batch · Name and goal (`?step=2`)

The same header and stepper, with step 1 done.

- **"Name and goal"** (h2), with the line: "In the customer's words. The goal is what they'll see at the top of the batch page."
- **Left card, "Batch"** (about 62% of the width):
  - **Name** (input)
  - **Goal** (textarea; placeholder "E.g. Cut carbon emissions by 60% by 2030, starting with the sites with the shortest payback")
  - **Target (optional)** (month picker; hint "Only if the customer gave one.")
- **Right card, "Next":** three short items.
  1. "**N properties** — <names, comma-separated>"
  2. "**Then add workstreams** — Each one runs one service for one solution on some of these properties."
  3. "**The customer sees nothing yet** — The batch appears for them once you share the plan."
- **Footer:** **Back** (outlined) and **Create batch** (filled, disabled until Name and Goal are filled).
  - Create batch makes a batch with `planState: 'draft'` and `createdOn: TODAY`, adds an activity entry "Batch created — N properties", and goes to the new batch page.

## Screen 53: Ops batch page (`/concept/ops/batches/[id]`)

Shown with the Showcase pilot (`/concept/ops/batches/pilot`).

**Header**
- Breadcrumb: "<Account> › <Batch>". Title: the batch name.
- Under the title: the goal, plus " · by <target>" only when there is a target.
- Right: **Customer view** (outlined), which goes to the customer batch page.

**1. Plan bar** (a full-width card with an ink border while it needs ops):
- Label "PLAN", then one line by state:
  - **draft:** "Draft — not shared with the customer". Button **Share plan with customer** (disabled with 0 workstreams).
  - **proposed:** "Proposed to the customer <planProposed> — waiting for them to agree". Button **Mark plan agreed**.
  - **agreed:** "Agreed <planAgreed>". Button **Start workstreams** (sets `live`).
  - **live:** "Live since <date>". No button; the border goes back to normal.
- Middle, muted: "<N> workstreams · <N> properties · files received <date>" (leave out the parts with no data).
- Keep `PlanSteps` as a small 4-dot track under the line.

**2. Workstreams (N)** card. Header right: **+ Add workstream** (outlined), which opens the drawer.
- **One row per workstream:**
  - chevron
  - **name** (bold), with "<Solution> · <N> properties · lead <Lead>" under it
  - the first open need: label on line 1, "With customer / With CQuel / With suppliers" on line 2
  - the `OwnerPill` ("With customer" filled when `owner === 'you'`; "In plan" while the plan isn't agreed)
  - **Edit** (opens the drawer filled in)
  - **Remove** (muted)
- **Expanded row:** a grey band with "PROPERTIES" and a 4-column grid of property chips (name + city). The first row starts expanded.
- **Empty state:** "No workstreams yet. Add one to run a service for a solution on some of the batch's properties." with **+ Add workstream**.

**3. Properties (N)** card. Header right: **+ Add properties** (goes to step 1 with this batch pre-filled).
- Rows: **name**, with "<city> · <postcode> · <type>" under it (show what the data has).
- On the right: one outlined tag per workstream the property is in ("Solar PV · Estimates", using `<name> · <service>`).
- A property in no workstream shows the reason in the middle, in muted text. For the pilot: "No solar — pitched or shared roof" on Leeds, Nottingham and Reading, from `pilot-solar.exclusion`. Without a reason it says "No workstream yet" on the right.

Remove the old "Projects by step" table. That's what the customer workstream page shows. Ops keeps it on the workstream itself.

## Screen 54: Add workstream drawer (`?add=workstream`)

A right-hand drawer, 640px wide, over a dimmed page. Close it with ✕ top right. This replaces `AddWorkstreamDialog`; keep its store call.

1. **Title** "Add workstream", with the line: "Choose a solution, the services CQuel runs for it, and the properties it covers."
2. **Solution** (select: Solar PV, EV charging, Air source heat pump, LED, Generic).
3. **SERVICES:** "Choose one or more. Each service becomes its own workstream."
   - A 2-column grid of check cards. Each has the name and a short line:
     - Estimates — From CQuel data
     - Planning — Surveys and checks
     - Tender — Find and compare suppliers
     - Pricing — Network or incumbent supplier
     - Delivery — Kick-off to handover
   - A selected card has an ink border.
   - A service not in the batch route gets the hint "(not in the route yet — adding it adds it to the route)", and adding it updates `batch.route`.
4. **PROPERTIES · N OF M SELECTED**, with **Select all / Clear**. A 2-column grid of check cards (name + postcode). Defaults to all properties in the batch.
5. **Lead** (select, default the batch lead).
6. **WHAT WE NEED FROM THE CUSTOMER (OPTIONAL):** "Shown on their batch page under this service. They reply by email."
   - One text input per need, plus **+ Add another**.
   - Each need is saved as `{ label, why: '', owner: 'you', since: TODAY }` on each created workstream.
7. **DOCUMENTS (OPTIONAL):** "Drawings, specs or an incumbent quote. With several services, each workstream gets a copy."
   - A dashed drop zone: "Drop files here or browse · or pick from the N files the customer sent".
   - Picking adds a document entry to the workstream.
8. **THIS CREATES** (grey box): one line per ticked service.
   - Each line shows **<name>**, with "<N> projects · starts at <first step of that service> · name can be changed later" under it.
   - Default name: the solution's name ("EV charging"). If the batch already has a workstream with that name and service, use "<Solution> · <Service>".
9. **Footer:** **Cancel** and **Add workstream** (filled; label "Add N workstreams" when more than one is ticked).
   - Disabled until a solution, at least one service and at least one property are chosen.

**On Add**, for each ticked service, create a workstream:
- `batchId`, `service`, `solution`, `name`, `lead`, `needs`
- `projects` (one per selected property, at step 0)
- `owner: needs.length ? 'you' : 'cquel'`
- `proposed: batch.planState !== 'live'`
- `startedOn: TODAY`

Also add one activity entry: "Workstream added — <name>, <service>, <N> properties". Close the drawer and expand the new row.

Edit opens the same drawer with the values filled in (one service only), and **Save changes**.

## Ops portfolio (`/concept/ops`): restyle only

- Keep the Set-up card (1 · Reconcile properties, 2 · Create batch, 3 · Add workstreams), the batches table and the plan pills.
- Restyle to the concept's black and white. **Create batch** becomes a link to 52a.
- In the batches table:
  - add the Plan column text by state (Draft / Proposed 14 Oct / Agreed / Live);
  - rename "Buildings" to **Properties**;
  - take out the Projects column, because counts are workstreams and batches.

---

## Done when
- The flow works end to end on Showcase Cinemas:
  1. Create a new batch with 2 properties found by Search and 1 added manually.
  2. Name it, then Create batch. The new page shows Draft.
  3. Add a workstream with 2 services (2 workstreams are created) and one need.
  4. Share the plan with the customer. The batch now appears on the customer side, with the need under its service on the batch page.
- The pilot's ops batch page (53) matches the spec, built from the repo data (goal, cinema names, exclusion, needs, plan proposed 14 Oct).
- The Halvering ops batch pages still work: 11 and 14 workstreams, every row reachable, nothing overflowing.
- No orange fills on ops screens. "Properties" on ops, "buildings/projects" on customer screens.
- The rules in parts 1–8 pass, item by item. Write the checklist into your final message, with a pass or fail for each item.
