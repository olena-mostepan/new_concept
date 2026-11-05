# Cursor prompt, part 4: Tender (section, workstream, project)

Run this after parts 1–3 (`cursor-prompt-dashboards.md`, `cursor-prompt-indicative-pricing.md`, `cursor-prompt-scope-definition.md`), in the same `new_concept` repo. Paste everything below the line into Cursor. The wireframes are in `docs/concept/wireframes/`:
`43-tender-v2.svg`, `44-workstream-tender-v2.svg`, `45-project-tender-v2.svg`.

Not in this part: the Briefs tab (`43b`) and the results / choose-a-supplier view (`44b`). Don't build them.

---

## Task

Build the Tender part of the customer side under `/concept`:
- the section page (screen 43)
- the workstream page for a Tender workstream (screen 44)
- the project page for a project inside one (screen 45)

Also add three Tender workstreams to the Halvering data, and update the earlier screens to the new numbers below.

Every rule from parts 1–3 still applies. **This written spec is the source of truth.** The wireframes are a layout reference.

Reuse what's there: `ServiceSection`, `DetailsGrid`, `StepsWithNeeds`, `ProjectsTable`, `ProjectRoute`, and the `ScopeWorkstream` / `IndicativeWorkstream` layout. Only the content, columns and the new blocks below differ.

### Routes
| Route | Screen |
|---|---|
| `/concept/services/tender` | Tender section → screen 43 |
| `/concept/workstreams/[id]` for a Tender workstream | Workstream page → screen 44 |
| `/concept/projects/[workstreamId]/[buildingId]` for a Tender project | Project page → screen 45 |

The nav highlights "Tender" on all three screens.

---

## New rules (add these to the parts 1–3 rules)

- **Group names on the Tender section page:** **Needs your decision / In progress / Done.** In Tender the customer either agrees a brief or chooses a supplier; both are decisions.
- **Service-specific column on the section page: Suppliers.** Two lines split at " — ": "11 invited" / "57 approached", "6 offers" / "9 invited", "Not invited yet", "Shortlisting" / "41 approached". In the Done card it shows the chosen supplier: "Voltreny" / "7 offers".
- **Tender workstreams have tabs: Overview · Brief · Supplier matching (N) · Offers (N).**
  - The project page in the existing app already has these tabs: `components/customer/CustomerProjectPage.tsx` (Overview, Brief, Supplier matching, Tender, Survey…). Use the same thing at workstream level. Same tab bar look (Radix Tabs + the `tabTriggerClass` styling), same URL behaviour (`?tab=`).
  - **Overview** = the page described in screen 44.
  - **Brief** and **Offers** use the same content as the project page's Brief and Tender tabs. Where those are still "coming soon" placeholders, use the same placeholder.
  - **Supplier matching** reuses `SupplierMatchingReview` from `components/customer/supplier-matching/`, fed with the workstream's matched suppliers.
  - No Survey tab: site checks are listed on the Planning page's Surveys tab.
  - Every workstream has the same tab set and only tabs with content show. Estimates and Planning workstreams have only Overview, so they show no tab bar.
- **Tender criteria** sit at the bottom of the Details card as a row of outlined chips, labelled "TENDER CRITERIA".
- **Project route when a project is tendered:** Pricing shows **"Not required"** (dashed), caption "The supplier comes from the tender", as the model already says ("Tender or Pricing — the other is Not required"). A service the project skipped is also dashed, e.g. Planning "Not required" / "Roof data was complete".
- **Search placeholder:** "Search workstreams or projects", never "buildings". Fix it on every section page that has the search box (Estimates, Planning, Tender).
- **Offers due:** a closing date CQuel set on the tender. Show it as stored. It's the one future date allowed, because it's a deadline the platform holds and not a guess.
- The decision actions (agree brief, choose a supplier) are not built in this part. Lists keep **View** only.

---

## Data changes (Halvering Estates)

### Batch route
Offices DE, FR and BE now goes through Tender too:
`route: ['indicative', 'scope', 'tender', 'pricing', 'delivery']`.

### Add three Tender workstreams (all Offices)
The account now has **21 workstreams**: Flagship 10, Offices 11.

| id | Name | Owner | Projects | Step (index) | Started | Lead | Next line |
|---|---|---|---|---|---|---|---|
| `led-offices-de` | LED · Offices DE | you | 6 (the 6 DE offices: Friedrichstraße 200, Königsallee 60, Zeil 106, Leopoldstraße 33, Mönckebergstraße 11, Schildergasse 72) | Results (4) | 1 Sep 2026 | Rich Amos | Choose a supplier — results sent 13 Oct · waiting 6 days |
| `led-offices-frbe` | LED · Offices FR and BE | you | 18 (the other 18 Offices buildings) | Brief ready (0) | 1 Sep 2026 | Rich Amos | Agree the brief — sent 14 Oct · waiting 5 days |
| `solar-be` | Solar PV · BE offices | cquel | 6 Offices buildings with no solar workstream yet | Shortlisted (1) | 15 Sep 2026 | Tamsin Quarrell | Shortlisting suppliers — brief agreed 9 Oct |

Needs (these feed the batch page panel and the dashboard):
- `led-offices-de`: "Your choice of supplier", owner you, since 13 Oct 2026.
- `led-offices-frbe`: "Brief to agree", owner you, since 14 Oct 2026.
- `solar-be`: "Supplier shortlist", owner cquel, since 9 Oct 2026.

Supplier fields:
- `led-offices-de`: 38 approached, 9 invited (15 Sep), 6 offers, 2 declined, 1 no response.
- `led-offices-frbe`: not invited yet.
- `solar-be`: 41 approached, shortlisting.

History: each one starts with "Workstream started — N projects allocated from Offices DE, FR and BE".

### Solar PV DE (`solar-de`, existing): add these fields
Keep the existing data (8 of 11 offers in, chased 12 Oct; projects f1, f4, f5, f7, f12 at Invited; site check at Halverkamp 19 done 8 Oct).

| Field | Value |
|---|---|
| Supplier source | CQuel network |
| Approached / invited | 57 approached, 11 invited 15 Sep 2026 |
| Offers | 6 received, 2 partial, 3 no response yet |
| Offers due | 24 Oct 2026 |
| Brief | Agreed 10 Sep 2026; workstream brief + 1 addition (Halverkamp 19) |
| Tender criteria | Low risk appetite · Company financial stability · PPA or capex · In-house personnel · In-house AC/DC installation · Zero downtime · Under 25 kg/m² · Grid connection experience · On time, on budget |

Project sizes, kWp:

| Project | City | Size | Brief | Site check |
|---|---|---|---|---|
| Halverkamp 19 | Hamburg | 180 | Own · 1 addition (roof access by internal stairs only, added 9 Oct) | Done 8 Oct |
| Speicherallee 7 | Hamburg | 240 | Workstream brief | Not required |
| Lindenhof 3 | Munich | 220 | Workstream brief | Not required |
| Wiesenstraße 88 | Frankfurt | 260 | Workstream brief | Not required |
| Parkring 16 | Stuttgart | 190 | Workstream brief | Not required |

Total 1,090 kWp → shown as "1.1 MWp".

Existing EV charging (`ev-tender`, done 5 Aug, Voltreny chosen): add 10 suppliers invited, 7 offers.

### Knock-on numbers on the earlier screens (check these after the change)

**Dashboard (33)**
- Pipeline: "21 workstreams across 2 batches", and Estimates 5 · Planning 4 · Tender 4 · Pricing 1 · Delivery 2 · Done 5.
- Batches card, Offices: gains a Tender cell [with you, with you, with CQuel]. Meta: "24 buildings · 11 workstreams · by Jun 2028".
- Right now: Waiting on you · 9, In progress · 7, Done · 5.
- Who it's waiting on: 9 With you · 3 With CQuel · 4 With suppliers.
- Momentum (cumulative):

| | Mar | Apr | May | Jun | Jul | Aug | Sep | Oct |
|---|---|---|---|---|---|---|---|---|
| Started | 0 | 0 | 3 | 4 | 5 | 12 | 19 | 21 |
| Finished | 0 | 0 | 1 | 1 | 1 | 4 | 5 | 5 |

**Batch page (35), Offices**
- Header: 11 workstreams. The route now has five columns, with Tender between Planning and Pricing. Tender caption: "3 workstreams".
- The Tender NEEDS panel: ● Choose a supplier — LED · Offices DE (Results sent 13 Oct) · ● Agree the brief — LED · Offices FR and BE (Sent 14 Oct) · ○ Supplier shortlist — Solar PV · BE offices (CQuel).
- Workstreams in this batch: add the three rows. Header right: "9 in progress · 2 done".

**Workstreams list (36)**
- Meta: "21 workstreams across 2 batches · 16 in progress · 5 done".
- Flagship unchanged: 7 live + Done · 3.
- Offices: 9 live + Done · 2.

---

## Screen 43: Tender section (`/concept/services/tender`)

- **Title:** "Tender". **Meta:** "Done when you've chosen a supplier".
- No tabs on this page for now.
- **Filters:** search ("Search workstreams or projects"), then Batch, Solution and Responsibility.
- **Three cards,** each titled with its count:
  1. **Needs your decision · 2:** LED · Offices DE, LED · Offices FR and BE.
  2. **In progress · 2:** Solar PV DE (With suppliers), Solar PV · BE offices (With CQuel).
  3. **Done · 1:** EV charging. Outcome "Voltreny chosen 5 Aug" / "6 projects to Delivery".
- **Columns:** Workstream · Batch · **Suppliers** · Next (**Outcome** in the Done card) · Responsibility · View.
- **Sort:** waiting days, longest first. Done: newest first.

## Screen 44: Workstream page (`/concept/workstreams/solar-de`)

**Header**
- Breadcrumb: "Tender › Solar PV DE".
- Title: "Solar PV DE".
- Right: "With suppliers" (outlined) and **View batch**.

**1. Details** (4 × 3 grid, then the criteria chips):

| Row 1 | Row 2 | Row 3 |
|---|---|---|
| Service: Tender | Started: 1 Sep | Supplier source: CQuel network |
| Solution: Solar PV | Projects: 5 | Offers due: 24 Oct |
| Batch: Flagship sites (link) | Total size: 1.1 MWp | Brief: Workstream brief + 1 addition |
| Lead: Tamsin Quarrell | Done when: Supplier chosen | Site checks: 1 done |

Then a thin divider, "TENDER CRITERIA", and the nine chips.

**2. Tabs:** Overview (active) · Brief · Supplier matching (11) · Offers (8). See the rules above.

**3. Steps**, header right "Projects at each step". Six columns, same component and panel styles as before:

| Step | Count | What happens | Panel |
|---|---|---|---|
| Brief ready | — (passed) | We write what suppliers price against; you agree it. | AGREED (grey): ✓ Brief agreed — 10 Sep |
| Shortlisted | — (passed) | We match suppliers in the CQuel network to the brief. | MATCHED (grey): ✓ 11 of 57 suppliers match — Matched 12 Sep |
| Invited | 5 projects | Matched suppliers price the brief. | NEEDS (dashed, suppliers): ○ Offers from 3 suppliers — Chased 12 Oct · due 24 Oct |
| Responses in | — | We check each offer is complete and comparable. | none |
| Results | — | We compare the offers and send you the results. | none |
| Supplier chosen | — | You choose a supplier; projects move on. | none |

**4. Offers** (new block). Header right: "11 suppliers invited 15 Sep · offers due 24 Oct".
- One segmented bar, widths in proportion to the counts, each segment labelled above with its count inside: Offer received 6 (dark) · Partial offer 2 (mid grey) · No response yet 3 (light grey).
- Under it: "8 of 11 in. The last 3 were chased on 12 Oct. Partial offers cover some projects only."

**5. Projects**, header right "5 · all at Invited".
- Columns: Project (+ city) · Step · Size · Brief · Site check · View.
- "Own · 1 addition" and "Done 8 Oct" in semibold; "Not required" muted.

**6. Recent activity | Documents**

Recent activity:
| Date | Title | Text |
|---|---|---|
| 12 Oct | Last 3 suppliers chased | 8 of 11 offers in. |
| 9 Oct | Brief addition sent to suppliers | Halverkamp 19: roof access by internal stairs only. |
| 8 Oct | Site check at Halverkamp 19 | The roof can take the panels. |
| 15 Sep | 11 suppliers invited | Matched to the brief from 57 approached. |
| 1 Sep | Workstream started | 5 projects from Solar PV · Estimates — you decided to go ahead, 28 Aug. |

Documents:
| Document | Detail | Action |
|---|---|---|
| Brief — Solar PV DE | PDF · agreed 10 Sep | Download |
| Site check — Halverkamp 19 | PDF · 8 Oct | Download |
| Indicative estimates — Solar PV | PDF · 28 Aug | Download |
| Results | After all offers are in | Greyed out, no action |

**Other Tender workstreams** use the same page with their own data:
- **LED · Offices DE:** Results is the current step, with NEEDS (solid, with you) ● Your choice of supplier — Sent 13 Oct · waiting 6 days. The Offers block shows "6 received · 2 declined · 1 no response" as a closed tender. No results table or Choose buttons yet (that's 44b, a later part).
- **LED · Offices FR and BE:** Brief ready is current, with NEEDS (solid, with you) ● Brief to agree — Sent 14 Oct · waiting 5 days. There's no Offers block until suppliers are invited.
- **Solar PV · BE offices:** Shortlisted is current, NEEDS (dashed, CQuel) ○ Supplier shortlist — Brief agreed 9 Oct.
- **EV charging** (done): all steps done, with Voltreny chosen 5 Aug on Supplier chosen.
- Leave out a block or field that has no data. Don't show it empty.

## Screen 45: Project page (`/concept/projects/solar-de/f1`, Halverkamp 19 · Solar PV)

**Header**
- Breadcrumb: "Tender › Solar PV DE › Halverkamp 19".
- Title: "Halverkamp 19 · Solar PV", with "Hamburg" muted next to it.
- Right: "With suppliers" (outlined) and **View batch**.

**1. Details:** Batch (link) · Workstream (link) · Solution · Lead.

**2. Route**, header right "Services for this project":

| Service | State | Caption |
|---|---|---|
| Estimates | Done | "Done 28 Aug" / "€115–140k · 7–9 yr payback" |
| Planning | Not required (dashed) | "Not required" / "Roof data was complete" |
| Tender | Now | "Now · Invited" / "In Solar PV DE" |
| Pricing | Not required (dashed) | "Not required" / "The supplier comes from the tender" |
| Delivery | Planned | "Planned" |

No needs panel.

**3. Two columns:**
- **Tender:**
  - Offers: **8 of 11 in**, "Priced for the whole workstream", with **See offers** on the right. It opens the workstream's Offers tab.
  - Site check: **Done 8 Oct**, "The roof can take the panels", with **Survey documents** on the right.
  - Brief: **Workstream brief + 1 addition**, "Roof access by internal stairs only".
- **Based on:**
  - Size: 180 kWp — Estimates
  - Roof: Flat, 1,400 m² usable — Site check, 8 Oct
  - Indicative estimate: €115–140k · 7–9 yr payback — Estimates, 28 Aug

**4. History:**
| Event | Detail | Date |
|---|---|---|
| Brief addition sent | Roof access by internal stairs only — sent to the 11 suppliers. | 9 Oct |
| Site check done | The roof can take the panels. | 8 Oct |
| Invited to tender | 11 suppliers in Solar PV DE. | 15 Sep |
| Moved to Tender | You decided to go ahead on 28 Aug; roof data was complete, so no scope needed. | 1 Sep |
| Estimate presented | €115–140k, 7–9 year payback. | 28 Aug |
| Joined Solar PV | Allocated from Flagship sites. | 20 May |

The project page has no tabs. It's debug mode, and the tabs live on the workstream.

---

## Done when
- Screens 43, 44 and 45 match the spec in structure and copy.
- The workstream tabs work with `?tab=` and look like the project page's tabs. Supplier matching uses `SupplierMatchingReview`.
- The earlier screens show the knock-on numbers above.
- Cross-checks:
  - 43 shows 2 / 2 / 1
  - the dashboard pipeline adds up to 21
  - Who it's waiting on 9 / 3 / 4 matches Right now (9 waiting on you)
  - Offices = 11 workstreams on the dashboard, batch page and Workstreams list
  - Solar PV DE: 6 + 2 + 3 = 11 invited, 8 in, and the project sizes sum to 1.1 MWp
- No "buildings" inside workstreams or in search placeholders. The only future date is "Offers due 24 Oct".
- The rules in parts 1–4 pass, item by item. Write the checklist into your final message, with a pass or fail for each item.
