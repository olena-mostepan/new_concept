# CQuel · Workstreams concept prototype

Olena (product designer, CQuel) is redesigning the CQuel customer product around **workstreams inside batches**. This repo is a duplicate of the `comparison-pricing` prototype. The existing pages stay as reference; the new concept lives under `/concept`.

Order of work: customer side first, then ops, then suppliers.

## Run

```bash
npm install --legacy-peer-deps
npm run dev          # http://127.0.0.1:3001/concept (port set in package.json)
```

The legacy-peer-deps flag is needed because of React 19 peer warnings. If lightningcss fails on the Mac: `npm i lightningcss-darwin-arm64 --no-save --legacy-peer-deps`.
Stack: Next.js 16, React 19, Tailwind v4, shadcn/radix (`components/ui`), lucide-react, recharts, sonner.

## Read first

- `docs/concept/taxonomy.md`: the data model (portfolio, batch, workstream, project, service, step, transition).
- `docs/concept/feedback-round1.md`: decisions from the 14–15 Oct calls. These override older wireframes.

## Where the concept lives

| Path | What |
|---|---|
| `lib/concept/model.ts` | Types, services (steps, definition of done), solutions, owner labels, plan states, `TODAY` |
| `lib/concept/data.ts` | Two accounts: **Halvering Estates** (mature — staging demo data, 2 batches, 10 workstreams) and **Showcase Cinemas** (pilot — 1 batch at kickoff, 2 proposed workstreams) |
| `lib/concept/derive.ts` | Everything computed from the data: pipeline, batch slots, waiting-on, counts, days |
| `components/concept/store.tsx` | In-memory store: selected account + ops/customer writes (create batch, add workstream, plan state, agree plan). Reload resets. |
| `components/concept/hrefs.ts` | Routes, customer nav, ops nav, Customer↔Ops counterpart mapping |
| `components/concept/ConceptChrome.tsx` | Prototype bar (Customer / Ops toggle, account picker), customer header, ops header |
| `components/concept/ui.tsx` | Page, PageHeader, Card, Button, Tag, ResponsibilityPill, FilterBar, FilterChips, YourActionOnly, table classes, PhaseStepper, Icon |
| `components/concept/dashboard.tsx` | Mature dashboard: pipeline, batches, right now (your action / in progress / done), activity, momentum |
| `components/concept/ops-*.tsx` | Ops dialogs (create batch, add workstream) and plan-state bits |
| `app/concept/...` | Customer: portfolio, batches, batch, workstreams, workstream, services/[service] |
| `app/concept/ops/...` | Ops: portfolio (set-up flow, batches), batch (plan state, workstreams by step, buildings) |

Customer nav: Overview · Assets | SERVICES · Estimates, Planning, Tender, Pricing, Delivery. Ops nav: Portfolio · Workstreams · Estimates, Planning, Tender, Pricing, Delivery.
Pilot account → the dashboard is its batch's kickoff view. Mature account → the portfolio dashboard; a new batch shows a banner linking to its kickoff view.
The original SVG wireframes (08 mature dashboard, 16a pilot) are the starting point; round-1 changes applied: no deposits, no benchmarks, no future dates, needs tied to the current stage.

## Model rules (keep consistent)

- **Batch** = a group of buildings with one goal (free text, set by ops; batches are predefined). It has a route through services, and a building can be in several batches.
- **Workstream** = one service × one solution over a set of sites, "a group of buildings with a plan". It is always shown under its batch and never floats on its own.
- **Project** = building × solution, in one workstream at a time. It is "debug mode": reachable, but kept slim.
- **Services:** Estimates, Planning, Tender, Pricing, Delivery. A route uses Tender or Pricing. Contracting belongs to Pricing. Only Tender has a brief.
- **Customer status** is only "Your action" (`ResponsibilityPill`). Ops shows Your action / CQuel's action / Suppliers' action / Done. Never "With you" or "Waiting on you". Detailed stages are ops-only. Steps are drill-down.
- **Workstream page order:** 1. Route (the batch pipeline with this workstream marked). 2. This service's steps. 3. "What <service> still needs", tied to the current stage, with open items from the customer lifted to the top and highlighted.
- Supplier matching and tender results sit at workstream level (roll-up). Delivery detail is project-level.
- **Deposits are removed from the UI for now.**
- Every workstream has the same tab set, and only tabs with content are shown.

## Olena's rules for content and design

- No generic or filler text and no AI-sounding copy. Use plain, short, specific wording.
- Don't invent future dates. Past dates and estimates the platform already holds are fine (label estimates "Estimate").
- Don't invent data the platform doesn't record. For example, there are no benchmarks and no survey type.
- Don't invent tabs or sections (no Quotes or Estimates tabs). Show tabs only when they have content.
- Keep tables light: few columns, no heavy borders.
- Think ahead and stay consistent across the hierarchy. If something exists at project level, check how it shows at workstream and batch level and in the nav.
- Lists must scale to 30+ workstreams, so avoid big cards per item.
- The product is read-mostly for customers. Ops enter data, and customers see what CQuel is doing with what they sent. Show missing info as taken care of, not as a broken record.

## Design system

- The source of truth is the CQuel design system (Design System artifact, namespace CQuelDS). A copy lives in `docs/design-system/`. Before any UI change, read `docs/design-system/README.md` (rules), then the component's section in `docs/design-system/components.md`. Props are in `types.md`, tokens in `tokens.json`, and decisions and settled preferences in `decisions.md`.
- Never invent a one-off element or a second variant of a component for a different background. If the design system has no piece for something, say so instead of making one up.
- Concept UI (`components/concept`, `app/concept`) uses only the pieces in `components/concept/ui.tsx`. Never import from `components/ui/*` (shadcn) in concept code; only `ui.tsx` may wrap one of them. Before finishing, `grep -rn "@/components/ui/" components/concept app/concept | grep -v "components/concept/ui.tsx"` must print nothing.
- If the code and `docs/design-system/` disagree, follow the docs and flag the difference. Don't edit `docs/design-system/` by hand; it's exported from the artifact.
- Tokens live in `app/globals.css` under the design system's names: `text-primary`, `text-title`, `text-secondary`, `text-tertiary`, `border-dark`, `border-light`, `bg-container`, `bg-container-grey`, `bg-accent`, `brand-6`, `black-1`…`black-7`, `status-*`. There are no `cq-*` tokens.
- Type uses the classes only: `h4` `h5` `h6` `h7` `h8` `h9` `p6` `p7` `s3` (and `h3` for key figures). Never `text-sm`, `text-xs` or a pixel size. 400 and 600 only.
- Orange (`brand-6`) means "this needs you, or this is where you are". It's a mark, never a fill.
- Customer status is only "Your action" (`ResponsibilityPill`). Ops shows Your action / CQuel's action / Suppliers' action / Done. Never "With you" or "Waiting on you".
- Components are in `components/concept/ui.tsx` and match the design system: Card, Button, IconButton, Tag, Chip, ChipTrack, PackageStrip, ResponsibilityPill, FilterBar, FilterChips, YourActionOnly, Table classes, PhaseStepper, Icon.
- Icons: the CQuel set in `public/icons/` through `<Icon name="…" />`. No lucide in concept code.
- Focus: a 2px black-7 outline, 2px out, on everything you can tab to.
- Desktop only for now.

## Plan

1. **Done:** concept shell, data model, services nav + Batches, both dashboards (mature + batch kickoff), Customer / Ops toggle, ops portfolio and batch pages with create batch and add workstream.
2. **Dashboards — first pass done, iterate with Olena:**
   - Mature dashboard: "what are we doing right now", with groups for active, waiting on a decision and back catalogue. Workstreams by batch, each with a next action and owner. Recent activity. Optional portfolio goal strapline. No deposit block.
   - Batch kickoff view: replaces the pilot dashboard, "this is what we're going to do with your batch". It must work for 5–10+ buildings and 2–3 workstreams.
   - Test both on the cinema example.
3. **Chunk 3:** the rest.
   - Workstream page with tabs, a supplier-matching and tender-results roll-up, and surveys grouped by date.
   - A slimmer project page and the service section contents.
   - Project-level delivery.
   - Ops flows: reconcile properties → create batch (free-text goal) → add workstreams, plus the internal agreed plan.
4. Design-system polish (see above).

## Open questions

- Nav: services as top-level tabs (current) — Rich still unsure about double navigation.
- Naming "batch". Rich is writing definitions.
- Deposits model.
- Partial-site bidders in roll-ups.
- How a batch moves to its next service.
- Whether a workstream can span batches.

## Constraints

- Never request, store or enter credentials.
- This prototype doesn't write to CQuel's real systems. Changes to the Django admin are made by people.
- Screenshots and prototypes are references. The written spec is the source of truth when this is handed over for implementation.
