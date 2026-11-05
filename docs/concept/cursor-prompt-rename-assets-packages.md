# Cursor prompt, part 22: rename Buildings → Assets and Workstream → Package

Paste everything below the line into Cursor, in the `new_concept` repo. No images are needed (82–84 in `docs/concept/wireframes/` show the new words in place, but they also show parts 23+, so don't build those).

**Before you start:** part 20 (Buildings) and 20b (batch page) must be in the code. If `components/concept/Buildings.tsx`, `BuildingView.tsx` or the Buildings nav tab are missing, stop and say so.

This prompt is closed. It changes **words and routes on customer screens only**. No layout, data, sorting or logic changes. Ops screens (`/concept/ops/**`, `Ops*.tsx`, `ops-shared.tsx`) stay as they are. "Batch" stays as it is.

---

## Why

Customers name sites by street or asset name, and an asset can contain several buildings. Nobody calls a group of projects a "workstream"; they say "package". The screens should use their words. The model stays the same.

## Rules

- **Code names stay:** `Building`, `buildingId`, `Workstream`, `workstreamId`, `BuildingView`, `WorkstreamChrome`, types, props, `data.ts` fields and file names don't change. Only the text a customer sees and the URL change.
- **One place for the words.** Add `lib/concept/words.ts`:

  ```ts
  export const WORDS = {
    asset: 'asset', assets: 'assets', Asset: 'Asset', Assets: 'Assets',
    package: 'package', packages: 'packages', Package: 'Package', Packages: 'Packages',
  } as const
  export const nAssets = (n: number) => `${n} ${n === 1 ? WORDS.asset : WORDS.assets}`
  export const nPackages = (n: number) => `${n} ${n === 1 ? WORDS.package : WORDS.packages}`
  ```

  Use these for every string you change below. Replace existing inline plurals (`n === 1 ? 'building' : 'buildings'`) with `nAssets(n)`, and the workstream ones with `nPackages(n)`.
- **Column headers** stay upper case through the existing class, so the header text is "Asset" / "Package" in the source.
- **Sentence case** everywhere else.
- **Don't touch** `data.ts` copy, activity text, documents or needs, even when they say "buildings" ("Roof drawings for 7 buildings" stays). That's sample content, and a later prompt may trim it.

## 1. Routes

| Old | New |
|---|---|
| `/concept/buildings` | `/concept/assets` |
| `/concept/buildings/[buildingId]` | `/concept/assets/[buildingId]` |
| `/concept/workstreams` | `/concept/packages` |
| `/concept/workstreams/[id]` | `/concept/packages/[id]` |

- Move the route folders under `app/concept/` (keep the `[buildingId]` and `[id]` param names).
- Add permanent redirects in `next.config` for the four old paths, keeping the query string, so older links and earlier wireframes still open.
- **`hrefs.ts`:** point `buildings`, `building`, `project`, `workstreams` and `workstream` at the new paths. Keep the key names, so call sites don't change.
- **Query values** (`from=buildings`, `from=workstream`, `from=building`) stay as they are. They're internal.
- **Nav `match`:** the Assets tab matches `/concept/assets`.
- **ConceptChrome:** anything matching `/concept/workstreams` matches `/concept/packages`.

## 2. Nav and breadcrumbs

- **Nav tab:** "Buildings" → **"Assets"** (`CUSTOMER_NAV`, id can stay `buildings`).
- **`crumbs.ts`:** "Buildings" → "Assets". Breadcrumbs read, for example, "Assets › Kervelstraat 14", "Assets › Kervelstraat 14 › EV charging · Voltreny".
- "Building not found" → "Asset not found"; "Workstream not found" → "Package not found".

## 3. Overview (`dashboard.tsx`, `BatchesCard.tsx`, `RightNow.tsx`)

| Old | New |
|---|---|
| Find a building (label and placeholder) | Find an asset |
| `<n> buildings across …` | `<n> assets across …` |
| See buildings | See assets |
| Services bar sub-labels "`<n>` workstreams" | "`<n>` packages" |
| Your action: `<n>` workstreams | Your action: `<n>` packages |
| All workstreams | All packages |
| Batches card column BUILDINGS | ASSETS |
| Batches card "`<n>` workstreams" | "`<n>` packages" |

Keep `id="find-building"` and other ids as they are.

## 4. Assets list (`Buildings.tsx`)

- **Title:** "Assets".
- **Filter:** "All buildings" → "All assets".
- **Column header:** "Building" → "Asset".
- **Counts:** "`<n>` buildings" → `nAssets(n)`, and "Showing 10 of `<n>`" / "Show all `<n>`" are unchanged.
- **Empty state:** "No buildings match" → "No assets match", if present.

## 5. Asset page (`BuildingView.tsx`, `ProjectView.tsx`)

| Old | New |
|---|---|
| Estimates, tender results and next steps are on the workstream page | Estimates, tender results and next steps are on the package page |
| Open `<workstream name>` › | Open `<workstream name>` package › |
| Priced for the whole workstream | Priced for the whole package |
| this building and `<n>` others | this asset and `<n>` others |
| Delivery at this building | Delivery at this asset |
| Any other "this building" | "this asset" |
| A "Workstream" label in a fact or card | "Package" |

## 6. Package page and service pages

Files: `WorkstreamChrome.tsx`, `IndicativeWorkstream.tsx`, `ScopeWorkstream.tsx`, `TenderWorkstream.tsx`, `PricingWorkstream.tsx`, `DeliveryWorkstream.tsx`, `DeliverySection.tsx`, `DetailsGrid.tsx`, `SimpleSteps.tsx`, `ProjectsTable.tsx`, `ServiceSection.tsx`, `WorkstreamsByBatch.tsx`, `lists.tsx`, `ui.tsx`, `SurveysTab.tsx`, `RouteWithNeeds.tsx`.

| Old | New |
|---|---|
| Card title "Buildings" | Assets |
| Buildings at each step | Assets at each step |
| Column "Building" | Asset |
| Steps "`<n>` building(s)" | `nAssets(n)` |
| Column "Workstream" | Package |
| Card title "Workstreams" | Packages |
| "`<n>` workstream(s)" | `nPackages(n)` |
| Show / Hide workstream details | Show / Hide package details |
| No workstreams here yet. / No workstreams match | No packages here yet. / No packages match |
| Search workstreams or projects / Workstream or project name | Search packages or projects / Package or project name |
| Workstream started (activity label in the UI) | Package started |
| Fact label "Workstream" | Package |

The page title is the workstream's name, unchanged.

## 7. Batch page (`BatchView.tsx`, `app/concept/batches/[id]/page.tsx`)

- **Meta line:** "`<n>` buildings" → `nAssets(n)`.
- **Cards:** "Workstreams" → "Packages"; "Buildings" → "Assets".
- **Column headers:** "Workstream" → "Package", "Building" → "Asset".
- **Rows:** "`<n>` buildings" → `nAssets(n)`.
- "Batch" stays everywhere.

## 8. Pilot (Showcase Cinemas)

- **Header:** "13 projects · 8 cinemas" is unchanged; cinema is the pilot's own word.
- **Workstream words:** any "workstream" on the pilot dashboard becomes "package".

## 9. Leave alone

- Ops screens and ops copy ("Choose the buildings in the batch", "Properties (n)", "Workstream added" toasts in `store.tsx` if they only show on ops). If a `store.tsx` toast shows on a customer screen, rename it too and list it.
- `data.ts` and all sample content.
- Batch / Batches.
- Service names.

## Check

Run these and paste the output:

1. **Customer files:**

   ```
   grep -rnE "[>'\"\`][^<'\"\`{]*\b[Bb]uildings?\b" app/concept components/concept --include=*.tsx --include=*.ts | grep -v -iE "ops|import|type |interface |buildingId|\.building|Building\[|: Building"
   ```

   Every hit is code, ops, or `data.ts` content. List any visible customer string that is left and say why.
2. **The same for "workstream":** visible customer strings return nothing.
3. **Redirects:** `/concept/buildings`, `/concept/buildings/<id>?from=batch&batch=flagship`, `/concept/workstreams` and `/concept/workstreams/ev-voltreny?from=building&building=<id>` each land on the new path with the query kept.

## Done when

- **Nav:** it reads Overview · Assets | SERVICES · five services, and the Assets tab is active on `/concept/assets` and asset pages.
- **Overview:** "Find an asset", "See assets", "n packages" and "Your action: n packages" show. The Batches card has an ASSETS column.
- **Asset page:** it reads "… on the package page" and "Open EV charging · Voltreny package ›", and breadcrumbs start "Assets ›".
- **Package pages:** they show Assets cards and columns and "n assets" step counts.
- **Batch page:** it shows Packages and Assets cards.
- **Unchanged:** ops screens, `data.ts`, batch wording, layout and sorting.
- **Old URLs:** they redirect.
- **Build:** `npm run build` passes.
- **Report:** write this checklist into your final message with pass or fail for each item, and list every file you touched.
