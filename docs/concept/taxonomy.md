# Workstream taxonomy — customer side

Copy of the claude.ai project doc `claude/taxonomy.md` (13 Oct 2026), with round-1 changes marked.
The workstream is the main unit the customer sees. Everything else sits above it, inside it, or attaches to it.

## 1. Structure — what the customer has

```
Portfolio
├── Batches        buildings + goal
├── Workstreams    one service × one solution        ← main unit
└── Projects       building × solution
                   in one workstream at a time
```

Batch and workstream are two different groupings of projects. A workstream can hold projects from more than one batch (seen in practice), and buildings and projects can join or leave both. Round 1: in the UI, workstreams are always shown under their batch — they must not float on their own.

| Name | What it is | Contains |
|---|---|---|
| **Portfolio** | All of a customer's buildings | Buildings, batches. Optional goal strapline (idea, not decided) |
| **Batch** | A group of buildings with one goal — the customer's original ask. Predefined by ops. Can span several solutions. Buildings can join or leave; a building can be in several batches. | Name, goal (free text), buildings. Its solutions and workstreams are worked out from its projects. |
| **Building** | One customer building | Name, address, coordinates |
| **Solution** | A type only, no details | Generic · Solar PV · EV Charging · Air Source Heat Pump · Lighting |
| **Workstream** | One run of one service, for one solution — "a group of buildings with a plan" | Service, solution, supplier, owner, summary, requirements, brief (Tender only), files, closed date, projects |
| **Project** | One building × one solution. Same project while it moves through services. In one workstream at a time. | Building, solution, batch, workstream, step, waiting on (+ reason), supplier matches, surveys |

A project's solution and its workstream's solution are always the same.

## 2. Process — how work moves

| Name | What it is | Contains |
|---|---|---|
| **Service** | A process CQuel runs. Set on the workstream. | Entry condition, steps, definition of done |
| **Step** | A stage of a service, stored on the project. Kept light. | Name, order |
| **Transition** | A project entering, moving within, moving between or leaving workstreams, with the reason | Project, from → to workstream and step, reason, moved by, moved at |

### Services and steps

| Service | Steps | Done when |
|---|---|---|
| Estimates | Data collected → Estimate → Presented → Decision | You've decided |
| Planning | Gap found → Info requested → Survey booked → Survey done → Scope agreed | Scope agreed |
| Tender | Brief ready → Shortlisted → Invited → Responses in → Results → Supplier chosen | Supplier chosen |
| Pricing (network or incumbent) | Supplier set → Price requested → Price received → Analysed → Decision → Contracting | Price agreed, contract signed |
| Delivery | Kick-off → Design & survey → Installation → Commissioning → Handover → Complete | Installed |

Round 1: Contracting moved from Delivery to Pricing (Rich).
Customers see a simple status (who it's with), not the steps; steps are drill-down. Ops keep detailed stages.

### Transition types

| Type | Meaning | Example reason |
|---|---|---|
| Enter | Project comes in from the batch | "Allocated from the batch" |
| Move | Project goes to a new workstream when its service changes | "Voltreny: best price and earliest start" |
| Step | Changes step inside its service (can go backwards). No reason needed. | — |
| Drop | Leaves, no next workstream | "Payback over 12 years; the customer will revisit with the next refurbishment" |

The customer never sees the word "transition" — they see the reason.

## 3. Attached

| Name | Attached to | Contains |
|---|---|---|
| **Survey** | Project (grouped per workstream) | Date, visit. No survey type is recorded on the platform. |
| **Brief** | Workstream — Tender only | Requirements suppliers price against |
| **Workstream supplier** | Workstream | Supplier, status, group score, group price |
| **Supplier match** | Project | Supplier, status, relevance |
| **Deposit** | Linked to any number of batches, workstreams, services — a credit | Amount, date paid, links. **Removed from the UI for now (round 1).** |

## Decided

- Step is stored on the project; keep it light.
- Buildings and workstreams can join or leave batches.
- Surveys at project level, grouped on the workstream.
- Batches are predefined (ops), not created by customers.
- Every workstream has the same tab set; only tabs with content are shown.
- Suppliers may price per project or per workstream — project page shows its own offers only when they exist.
- Not every step change needs a reason.
- Only Tender needs a brief.
