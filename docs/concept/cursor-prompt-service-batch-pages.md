# Cursor prompt, part 18: service pages and batch page, with phases

Paste everything below the line into Cursor, in the `new_concept` repo. Attach these images from `docs/concept/wireframes/` to the chat:

- `62-batch-page.png`
- `63-service-indicative.png`
- `63-service-scope.png`
- `63-service-tender.png`
- `63-service-pricing.png`
- `63-service-delivery.png`

**Before you start:** parts 16 (phases) and 17 (nav and Batches page) must already be in the code. If `Workstream.phases` or the Batches nav item is missing, stop and say so.

This prompt is closed. It changes the five service pages (`ServiceSection.tsx`) and the batch page (`BatchView.tsx` `variant="page"`, `RouteWithNeeds.tsx`). The dashboards, the Batches page and the workstream page stay as they are.

**Keep the batch page's Route popover from part 14** (`StagePanel` in `RouteWithNeeds.tsx`): its layout, its styling and its Your action line. Only the data behind its "done" group changes (section 3).

---

## Why

- **Workstreams have phases now.** A workstream that finished a service hasn't ended; it **passed through** that service. Only a workstream with every phase done is **completed**.
- **Responsibility shows only the customer's side.** It's the original Your action pill; nothing marks CQuel's or suppliers' action.
- **Orange dots mean only "changed in the last 7 days".**
- **Next steps carry a date, not a "waiting N days" count.**

## 1. Shared changes

### `derive.ts`: next lines

- Remove ` · waiting ${days(...)} days` (and any `· N days late`) from every `nextLine` string. Keep the date. For example, "Gas bills for 8 buildings — asked 1 Oct".
- Lowercase the first word of the detail after " — ", e.g. "requested 1 Oct", "sent 15 Oct".

### Pills

- Customer screens use `StatusPill` **only for `owner === 'you'`**. It's the existing style: `border-brand-2 bg-bg-accent text-brand-7`, reading "Your action".
- Every other owner shows nothing.
- Leave the other styles in `StatusPill` for ops.

### Changed dots

- Keep `ChangedMark` (6px `brand-6`) and `ChangedKey` on the service pages and the batch page.
- Don't use the orange dot for Your action anywhere. That includes summary cards and filters.

### Summary cards (`SummaryCards`)

Three cards:

| Card | Label | Line |
|---|---|---|
| 1 | Workstreams | across <n> batches |
| 2 | Your action, with no dot | of <n> in <service label, lowercased>. |
| 3 | Passed through | moved on to <next service>, or "moved on to the next service" if they differ |

- **Delivery:** card 3 is **Completed**, with the line "handed over".
- **Clicking:** Your action toggles the `you` filter, as now. The other cards aren't clickable.

### Filters

- The Responsibility select is the **"Your action only"** checkbox (`YourActionOnly`, if it's already in `ui.tsx`).
- Pricing and Delivery keep their Supplier select.
- On Delivery, add labels and 40px fields to the filter row, matching the other pages.

## 2. Service pages (`ServiceSection.tsx`)

### Which workstreams appear

- **Live:** workstreams whose **current** service is this one, and `owner !== 'done'`. Use the existing grouping logic: "Needs your decision" (Scope: "Needs your input"; Delivery: "Needs attention"), then "In progress".
- **Passed through:** use `phasesIn(a, b, serviceId)` across customer batches. Take workstreams with a `'done'` phase for this service **and** a current service that's different (or completed). The group title is **"Passed through"**.
- **Delivery:** the third group is **"Completed"**. It holds workstreams where `isCompleted(w)` and the last phase is delivery.

### Columns (all groups)

The grid is `minmax(0,1.2fr) minmax(0,1fr) minmax(0,0.8fr) minmax(0,1.2fr) 120px 16px`. The headings are uppercase, as now.

1. **Workstream:** the name, with `ChangedMark`.
2. **Batch:** the batch name.
3. **The service column:**
   - Its header is Estimate / Surveys / Suppliers / Price / Delivery, as now.
   - It keeps its two lines.
   - For passed-through rows, use the **phase snapshot**: `phase.projects`, `phase.tender`, `phase.pricing` and `phase.surveyNote` from part 16.
4. **Next step** (header renamed from "Next"):
   - The first line is `nextParts(w).main`. It's `h8`-weight when `owner === 'you'`, otherwise `p6`.
   - The second line is the detail, in `p7 text-text-tertiary`.
   - In passed-through and completed groups, the header is **Outcome**:
     - first line: `phase.outcome` or "You decided <date>", then the completed date;
     - second line: "now in <current service label>". For Delivery's Completed group, use "installed".
5. **The pill column:** the `StatusPill` for `you`, otherwise empty.
6. **Chevron:** a 16px `ChevronRight` in `text-text-tertiary`.

**Row behaviour:**
- **Remove:** the Responsibility column and the "View" buttons. The whole row is a `Link` to the workstream, with `hover:bg-black-1`.
- **Passed-through and completed rows:** in `text-text-tertiary`.

### Delivery's "Dates to confirm" banner

- Make it a plain white card: `border-border-dark`, radius 12, `px-6 py-4`, no gradient and no orange.
- **Text:** "2 dates to confirm" in `h7`, then "From Voltreny's invoices" in `p6 text-text-secondary`.
- **Button:** a secondary button, "Confirm dates", that does what the current button does.

## 3. Batch page (`/concept/batches/[id]`)

### Route (keep the part 14 card and popover)

- **Captions:** live projects per service, as now.
- **The `sub` line:**
  - For a service with done phases that are now somewhere else, it's "<n> passed through".
  - For Delivery, it's "<n> completed", counting completed workstreams.
- **Popover data (`StagePanel`):** the done group lists the workstreams that have a done phase for that service, each with "Done <short(phase.completedOn)>". It uses `phasesIn`, not `owner === 'done'`.
- **Don't change** the popover's layout, its live list or its Your action line.

### Workstreams in this batch

**Rows (live):** each row uses the grid `minmax(0,1.2fr) 160px minmax(0,1.5fr) 120px 16px`, with a 44px left padding for the `ChangedMark`.

| Column | Content |
|---|---|
| Workstream | The name in `h8 text-text-title`, then "<n> projects" in `p7 text-text-tertiary`. |
| Service | `ServiceTag` for the current service. |
| Next step | `nextParts(w).main`, in `h8` weight if `you`, with the detail under it. This replaces `stepNote` on this page. |
| Pill | `StatusPill` for `you`, otherwise empty. |
| Chevron | As on the service pages. |

- **Header row:** Workstream / Service / Next step.
- **Fold:** "Completed · <n>" holds only workstreams where `isCompleted(w)`, collapsed by default.
  - Its rows are muted, with a muted `ServiceTag` and the outcome ("All 3 handed over 30 Sep" / "installed").
- **Card header right slot:** "<live> in progress · <completed> completed".
- **Activity:** Recent activity is unchanged.

## Expected values (Halvering)

**Batch page `/concept/batches/flagship`**

**Route:**

| Service | Projects | Sub line |
|---|---|---|
| Estimates | 16 | 3 passed through |
| Planning | 11 | |
| Tender | 5 | 1 passed through |
| Pricing | 4 | |
| Delivery | 6 | 1 completed |

**Popover:** the Estimates done group lists Solar PV DE (Done 28 Aug), Solar PV · Missing roof data (Done 28 Aug) and EV charging · Voltreny (Done 30 May).

**Rows:**
- LED: Your action
- Heat pumps · Flagship: Your action
- Solar PV · Missing roof data: Your action
- EV charging · DE flagships: Your action
- Solar PV DE
- Heat pumps · Kelderby
- EV charging · Voltreny

The fold reads "Completed · 1" and holds LED · Lumora.

**Service pages**

| Page | Cards | Groups |
|---|---|---|
| Estimates | 8 / 4 of 5 / Passed through 3 | Needs your decision 3 · In progress 2 · Passed through 3 (Solar PV DE €575–700k now in Tender; Solar PV · Missing roof data €825k–1.0m now in Planning; EV charging · Voltreny €140–170k now in Delivery) |
| Planning | 5 / 3 of 4 / Passed through 1 | Needs your input 3 · In progress 1 · Passed through 1 (Solar PV FR/BE · Solvarek, Scope agreed 2 Aug, now in Delivery) |
| Tender | 5 / 2 of 4 / Passed through 1 | Needs your decision 2 · In progress 2 · Passed through 1 (EV charging · Voltreny, Voltreny chosen 5 Aug, now in Delivery) |
| Pricing | 4 / 2 of 3 / Passed through 1 | Needs your decision 2 · In progress 1 · Passed through 1 (Solar PV FR/BE · Solvarek, €214k, Contract signed 15 Sep, now in Delivery) |
| Delivery | 4 / 0 of 3 / Completed 1 | Needs attention 2 · In progress 1 · Completed 1 (LED · Lumora) |

The Estimates estimates for the split Solar PV workstreams are the sums of their phase snapshot projects (5 × 115–140 and 3 × 115–140 + 4 × 120–145).

## Done when

- **Matches the wireframes:** each page matches its image. The batch page Route popover is the part 14 popover, unchanged except for its done list.
- **Values:** every value in the expected tables is right.
- **Cleanup:** there's no "waiting N days" text, no Responsibility column, no View button and no CQuel's or Suppliers' action pill on these six pages.
- **Orange:** it appears only as changed dots and in the Your action pills.
- **Build:** `npm run build` passes.
- **Report:** write this checklist into your final message, with pass or fail for each item.
