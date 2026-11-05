# Design system update: package tabs, Chip, service filter cards (3 Nov 2026)

These are instructions for the next design-system task. They bring the CQuel design system (artifact https://claude.ai/artifact/5TNiRyXkn3UDAK9GfsWRgZ, version 14) in line with prototype part 25 (`claude/cursor-prompt-tabs-chips-batch.md`).

**How to work:**
- Read the artifact first. Edit only the files named here, then republish to the same URL.
- Update `project/components/index.d.ts`, `bundle.css` and `bundle.js` for every component that changes.
- Each changed component gets its README and `preview.html` updated.
- Set `lastChange` in `design-system.json` to one line: "Package page uses one tab row; Chip replaces ProjectServices; ServiceCards become the batch's service filter; Route retired."

Mocks are in `~/Documents/new_concept/docs/concept/wireframes/`:

- `90-package-tabs-chips.png`
- `89-service-cards-separate.png` (batch half)
- `85-route-options.png` ("Asset page · B")

## 1. Tabs: the package page's one navigation

Add to the Tabs README:

- **On the package page,** one tab row is the whole navigation: Overview, then content tabs in service order, each shown only when it has data. The tabs are Estimates, Survey, Brief, Supplier matching, Tender results, Pricing, Contract and Delivery.
- No tab for a planned or not-needed service.
- Only Supplier matching and Tender results carry a count ("Tender results (8)").
- Never two tab rows on one page.
- **The package Overview** holds four things: the Steps of the current service, the Assets table, Recent activity, and Documents.

Change the example in the first line to "Overview · Estimates · Brief · Tender results".

## 2. ServiceCards: from package navigation to the batch's service filter

Rewrite the ServiceCards README. ServiceCards no longer sit on the package page.

- **Purpose:** service cards on a batch page. They choose which assets the list below shows.
- **Cards:**
  - "All" first, with the batch's project count.
  - Then one card per service that has projects in the batch now, in service order. No card for a service with 0.
- **Content:**
  - The service name in `h8` and the project count in `h4`, in tabular figures.
  - Optionally "+<n> done" in `p7` text-tertiary, when projects passed through that service.
  - Nothing else.
- **Shape:** `radius-md`, 12/16 padding, equal columns 8 apart.
- **States:**

  | State | Look |
  |---|---|
  | Default | `bg-container-grey`, `black-2` border |
  | Hover | `border-dark` border, pointer |
  | Selected | `bg-container`, `border-dark` border, 3px `brand-6` top edge |
  | Focus | the 2px `black-7` outline |

  The orange top edge says "where you are". Never fill a card with orange or black.
- **Behaviour:**
  - Single select. Each card is a button that writes `?service=<id>`; "All" clears it.
  - The Assets table below filters to assets with a project in that service.
- **Consumer provides:** `options: [{id, label, count, done?}]` (with `id: ''` for All), `value` and `onChange(id)`.
- **Remove:** the done / now / planned / selected-accent rules and the "Finished 5 Aug" and "Now · since" lines.

## 3. Chip (new), and FilterChips built on it

Add a `Chip` component and rebuild FilterChips on it.

**Every chip:** 32 high, `radius-full`, 12 side padding (8 on the left with a lead), `p6`, `bg-container`, a 1px `border-dark` border, `text-primary`.

**Two uses:**
- **Display:** not clickable, for a fact made of a few states.
  - `lead: 'done'` is the 16px `check` Icon in `black-7`.
  - `lead: 'now'` is the 6px `brand-6` dot, and the label goes `h8`.
- **Filter:** a button, with `count` after the label in text-tertiary.
  - Selected is a 1.5px `black-7` border, with the label `h8` and the count text-primary. No fill.
  - Hover is `bg-container-grey`.

**Rules:**
- **Orange:** only the `now` lead uses it.
- **Not a Tag:** Tag stays for categories and status inside rows, and ResponsibilityPill stays "Your action".

**Types:** `ChipProps { children; lead?: 'done'|'now'; count?: number; selected?: boolean; onClick?: () => void }`

**FilterChips:** keep its README rules, and say it renders `Chip`s.

## 4. AssetHeader: services as chips; retire ProjectServices

**Add to AssetHeader:** a **Services** line, 20 under the facts.
- The label "Services" in `p7` text-tertiary, then display Chips 8 apart.
- **Which chips:** only services the project has done or is in now. No chip for planned or not-needed.
- **Two projects on the asset:** one chip row per project, starting with its solution in `p7` text-secondary.
- **Under the chips:** the large `strong` Button "Open <package> package ›", one per project.
- Change the line "Nothing else in the header: … no buttons" so it allows this one strong button.

**Delete ProjectServices** (README, preview, types, CSS and JS). The asset page no longer has a "Services for this project" card.

## 5. Route: retire it

Neither the asset page nor the batch page uses Route any more.

- Delete Route, and remove its README rules from the "concept pieces" section of `project/README.md`.
- The Overview keeps ServicesBar.

## 6. Table: confirm one link per row

Keep the rule "Never put another link in a row". Add this example: on the batch Assets table, the PACKAGE column is plain text, and the package is reached from the asset page.

## 7. README (`project/README.md`) edits

- **The one rule, "where the customer is" list:**
  - Replace "the current service card (4px left border) and the selected service card (light accent fill)" with "the selected service filter card (3px top edge) and the `now` chip dot".
  - Remove the route.
- **Concept pieces:**
  - Remove Route and the old Service cards paragraph.
  - Add:
    - **Package tabs:** one row, Overview plus the content tabs that have data.
    - **Service filter cards (batch):** All plus the services with projects; they filter the Assets table.
    - **Chips:** one style for display (asset services) and for filters (Assets solution).
- **Content fundamentals:** add "Search finds assets: the placeholder is 'Address or city' on Assets and on every service page."

## Check before publishing

- `index.d.ts` has `ChipProps`, the new `ServiceCardsProps`, and no `RouteProps` or ProjectServices types.
- Every `preview.html` that used Route, ProjectServices or the old ServiceCards states is updated or removed.
- Every component in the artifact's preview list renders (open the page and look).
- Nothing in the README still says "Services for this project", "Not required" bars or "Getting started".
