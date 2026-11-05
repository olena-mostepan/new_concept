# Concept feedback — round 1 (14–15 Oct 2026)

Copy of the claude.ai project doc `claude/feedback-round1.md`.
Sources: BuildBetter calls 1063542 "Concept discussion" (Olena, Rich · 14 Oct), 1063879 "Portfolio Batches & Workstreams" (Olena, Deborah, Rich · 14 Oct), 1065540 "Batch and Workstream Design" (Rich, Bruno, Radu, David · 15 Oct), Olena's summary, ops prototype screenshots (create batch → add workstream).

## Olena's six points
1. The pilot dashboard must work for 2+ workstreams, several solutions, several buildings in a batch — the customer hands over a batch and sees its buildings.
2. Remove the deposit block from the mature dashboard.
3. Show steps, not the whole journey. First block: the pipeline with the possible route. Next block: this workstream's steps.
4. "What we still need" is tied to the current stage and highlighted, to help it move on.
5. Batches were missing from the whole concept.
6. Ops need a way to add workstreams.

## Decisions / strong direction
- **Batch = a group of buildings with a goal. Workstream = a group of buildings with a plan** ("a goal is I want to do this; a workstream is I'm going to do this" — Rich). One goal per batch, free text. A building can sit in more than one batch.
- Different goals → different batches (cinemas: EV on 20 sites, estimates on solar for 11 sites = two batches).
- **Workstreams must not float without their batch.**
- **The workstream is the hero; the project is "debug mode"** — reachable, but slimmer the more the workstream shows.
- The pilot view is really the **batch kickoff view** — "evergreen": every new batch gets "this is what we're going to do with your batch". Pilots are batches of 5–10+ buildings, often 2–3 workstreams.
- **Not inevitable journeys**: show where a workstream is now. Customers get a simple status; ops keep detailed stages.
- **"What we still need" belongs to the current stage.** Bruno will define mandatory/recommended fields per service.
- Dashboard answers **"what are we doing right now?"**: active, waiting on a decision, back catalogue; each workstream has a next action and owner. Recent activity works.
- **Supplier matching and tender results move to workstream level** (who bid on how many sites, total cost, main differences).
- **Delivery is project-level**; at workstream level it's navigation only.
- **Contracting belongs to Pricing.**
- **Remove the deposit block** for now.
- **Portfolio-level goal** strapline (e.g. "Net 0 by 2035") — idea, not decided.
- **Ops flow in three parts**: reconcile properties → create batch (free-text goal, no upload) → later, "add workstreams". "Agreed plan" is an internal ops step.

## Open
- Double navigation: service tabs vs Batches · Workstreams (Rich unsure) — the prototype has both behind a toggle.
- Naming: "batch" may not be obvious; Rich to write definitions.
- Deposits model; partial-site bidders in roll-ups; confidence in estimates; how a batch moves to its next service.
- Can a workstream still span batches now that workstreams sit under batches?
