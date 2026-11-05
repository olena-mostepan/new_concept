# Cursor prompt, part 16: workstreams with phases (data model)

Paste everything below the line into Cursor, in the `new_concept` repo. There's no image: this task changes data and derived helpers, not layouts.

This prompt is closed. It touches `lib/concept/model.ts`, `lib/concept/data.ts` and `lib/concept/derive.ts`, plus the few lookups that break. Screens are updated in parts 17 and 18. In this task they just have to keep rendering, with the new counts. Don't add phase strips or route visuals to any screen.

---

## Why

A workstream no longer ends after one service. It is **one solution, one set of projects, and its own route of services ("phases")**, a subset of the batch's route. It stays the same workstream from start to finish. The separate "done" workstreams in the data were really finished phases, so they merge into the workstream that carried on.

## 1. Model (`model.ts`)

```ts
export type PhaseState = 'done' | 'now' | 'planned'

export interface Phase {
  service: ServiceId
  state: PhaseState
  startedOn?: string
  completedOn?: string
  /** Short result, e.g. "Voltreny chosen", "Price agreed" */
  outcome?: string
  /** Done phases only: the project rows as they were when the phase finished (keeps estimates, decisions, steps) */
  projects?: ProjectRow[]
  /** Done phases only: the service data that belonged to that phase */
  tender?: TenderProfile
  pricing?: PricingInfo
  surveyNote?: string
  surveyDocs?: boolean
}
```

**Additions to `Workstream`:**
- **`phases: Phase[]`** (required). The phases are in `SERVICES` order. Exactly one phase is `'now'`, with two exceptions: in a completed workstream they're all `'done'`, and in a `proposed` workstream (plan not agreed) they're all `'planned'`. Every phase service must be in the batch's `route`.

**What the existing fields mean now:**
- **`service`:** the `'now'` phase's service, or the last phase's when everything is done. Keep it stored; `derive.ts` checks it (see section 3).
- **`owner`:** responsibility for the current phase. `'done'` only when every phase is done.
- **`projects[].step`, `tender`, `pricing`, `deliveryProfile`, `needs`, `next`:** these describe the **current** phase.

## 2. Data (`data.ts`, Halvering)

**Merges.** Keep the surviving id. Move the merged workstreams' data into `phases` on the survivor, then delete the merged workstreams.

| Survivor id | Merges | Phases |
|---|---|---|
| `ev-voltreny` | `ev-ind`, `ev-tender` | indicative done (started 20 May, completed 30 May, `projects` from `ev-ind`) → tender done (2 Jun → 5 Aug, outcome "Voltreny chosen", `tender` and `projects` from `ev-tender`) → delivery now (6 Aug) |
| `solar-de` | `solar-ind` (its 5 buildings) | indicative done (20 May → 28 Aug, `projects` = the `solar-ind` rows for those 5 buildings) → tender now (1 Sep) → delivery planned |
| `solar-roof` | `solar-ind` (its other 7 buildings) | indicative done (20 May → 28 Aug, `projects` = the `solar-ind` rows for those 7) → scope now (1 Sep) → tender planned → delivery planned |
| `solvarek` | `solar-frbe-scope`, `solvarek-quote` | scope done (1 Jul → 2 Aug, `surveyNote`/`surveyDocs`/`projects` from `solar-frbe-scope`) → pricing done (4 Aug → 15 Sep, outcome "Price agreed", `pricing` and `projects` from `solvarek-quote`) → delivery now (16 Sep) |

Also:
- **Merged names:** if any workstream's `name` included a phase word ("· scope", "· Solvarek quote"), it's gone with the merge. The survivors keep their names.
- **`activity` and `documents`:** concatenate them from the merged workstreams onto the survivor, newest first.
- **Phase starts:** a merged phase's `startedOn` comes from the merged workstream. The `now` phase's `startedOn` is the survivor's `startedOn`.

**Every other workstream gets `phases`.** The current service is `now`, using the workstream's `startedOn`; the rest are planned. This route is agreed: use it as written.

| Workstream id | Phases |
|---|---|
| `ev-de` | **scope** → tender → delivery |
| `led-ind` | **indicative** → tender → delivery |
| `hp-flagship` | **indicative** → scope → tender → delivery |
| `hp-kelderby` | **pricing** → delivery |
| `led-lumora` | delivery done (2 Jun → 30 Sep, outcome "Installed"). `owner: 'done'`, so it's a completed workstream. |
| `hp-ind` | **indicative** → scope → tender → delivery |
| `solar-offices` | **indicative** → tender → delivery |
| `ev-offices` | **indicative** → tender → delivery |
| `solar-fr` | **scope** → tender → delivery |
| `hp-be` | **scope** → tender → delivery |
| `led-offices-de` | **tender** → delivery |
| `led-offices-frbe` | **tender** → delivery |
| `solar-be` | **tender** → delivery |
| `ev-ladewerk` | **pricing** → delivery |
| `ev-chargeo` | **pricing** → delivery |
| `ev-be` | **delivery** |

**Pilot (Showcase).** `pilot-ev` and `pilot-solar` both get indicative → scope → tender → delivery, all `planned`, because the plan isn't agreed. `service` stays `indicative`.

**References to removed ids.** Grep for the removed ids (`ev-ind`, `ev-tender`, `solar-ind`, `solar-frbe-scope`, `solvarek-quote`) in `movedTo`, `activity` and anywhere else, and point them at the survivor.

## 3. Derived helpers (`derive.ts`)

Add:
- **`currentPhase(w)`:** the `'now'` phase; the last phase if all are done; the first phase if all are planned.
- **`isCompleted(w)`:** every phase is `'done'`.
- **`phasesIn(a, b, service)`:** the workstreams in batch `b` that have a phase for `service`, each with that phase. The batch Route will use this later to list what "passed through" a service.
- **`WORKSTREAM_ALIAS`:** `Record<string, string>` mapping each removed id to its survivor. Make `getWorkstream(a, id)` resolve it, so old links like `/concept/workstreams/ev-tender` open `ev-voltreny`.

**Dev check.** In development, `console.warn` when any of these is broken for a workstream:
- `w.service !== currentPhase(w).service`;
- the number of `'now'` phases isn't exactly one (except for a completed workstream, or a `proposed` one whose phases are all planned);
- a phase service isn't in its batch's `route`;
- phases aren't in `SERVICES` order.

**"Done" now means completed.** Anywhere that treats `owner === 'done'` as done keeps working. There are now fewer such workstreams, which is the intent.

**Momentum.** The chart data counts service runs started and finished, so change the card's right-slot text to **"Services started and finished"**. Leave the numbers as they are.

## Expected values (Halvering)

**Workstream counts**

| | Total | In progress | Completed |
|---|---|---|---|
| All | **20** | 19 | 1 (LED · Lumora) |
| Flagship sites | 8 | 7 | 1 |
| Offices DE, FR and BE | 12 | 12 | 0 |

**Your action:** 11, unchanged.

**Live projects and workstreams by current service:**

| Service | Projects | Workstreams |
|---|---|---|
| Estimates | 54 | 5 |
| Planning | 22 | 4 |
| Tender | 35 | 4 |
| Pricing | 14 | 3 |
| Delivery | 12 | 3 |

That's 137 projects in total, unchanged. The dashboard Services bar shows the same numbers as before.

**Phases spot-checks:**
- `ev-voltreny`: Indicative ✓ 30 May → Tender ✓ 5 Aug "Voltreny chosen" → Delivery (now)
- `solvarek`: Scope ✓ 2 Aug → Pricing ✓ 15 Sep "Price agreed" → Delivery (now)

## Done when

- **Counts:** `/concept` (Halvering), `/concept/batches/flagship`, `/concept/batches/offices` and `/concept/workstreams` all render. The workstream counts read 20 / 19 / 1, the Your action count reads 11, and the dashboard Services bar is unchanged.
- **Old links:** `/concept/workstreams/ev-tender`, `/concept/workstreams/solar-ind` and `/concept/workstreams/solvarek-quote` open their survivors.
- **Dev check:** there are no warnings in the browser console.
- **Pilot:** the pilot account renders, with both workstreams' phases planned.
- **Grep:** `grep -rn "'ev-ind'\|'ev-tender'\|'solar-ind'\|'solar-frbe-scope'\|'solvarek-quote'" lib components app` only matches `WORKSTREAM_ALIAS`.
- **Build:** `npm run build` passes.
- **Report:** write this checklist into your final message, with pass or fail for each item.
