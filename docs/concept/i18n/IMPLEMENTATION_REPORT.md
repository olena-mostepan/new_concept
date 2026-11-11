# German i18n — implementation report

**Date:** 2026-11-11  
**Scope:** **Customer** `/concept` only (German). **Ops** `/concept/ops` stays English — `useConceptI18n()` uses `en` on Ops paths.  
**Build:** `npm run build` passes.

## Summary

Customer-facing routes in the § Check list are wrapped with `useConceptI18n` / `t(lang, …)` for UI copy, filters, tables, batch and package chrome, and service workstream lists. Overview dashboard and Decisions were already done; this pass completes Assets, Batches index, Batch page view (incl. pilot kickoff), Packages, service sections, Workstreams-by-batch, shared filter controls, and partial Asset (Building) page coverage.

Ops UI is unchanged (English). `derive.ts` gained `lang` on `batchSummary` and `stepNote`; many deeper derive strings on asset/package tabs remain English in DE until a follow-up.

## `TODO-DE` keys added this pass

| Key | Reason |
| --- | --- |
| `of {0} in {1}` | `SummaryCards` subtitle line |
| `{0} · {1} · {2} projects in progress` | `BatchesIndex` header count |
| `{0} dropped` | Batch assets fold row |
| `{0} moved out` | Batch assets fold row |
| `{0} closed` | Batch packages fold row |
| `+{0} done` | Batch service filter cards |
| `{0} · {1} left` | Package / workstream asset counts |
| `Your action: {0}` | Workstreams-by-batch batch header |

(Existing `No {0} here yet.` and other prior `TODO-DE` entries unchanged.)

## Keys used without German in dictionary (fallback EN in DE)

Examples — run `?lang=de` and watch `[i18n] Missing DE key` in dev for the full set:

- `Closed · {0}` — batch package now column (verify spreadsheet)
- `Batch name` — assets filter placeholder if missing
- `Briefs`, `Passed through`, `Needs your input`, `Needs your decision` — service section groups (verify)
- `from` — package tab chip
- `Previous`, `Next` — asset pager if missing
- Activity/doc titles from mock `data.ts` (not wrapped)
- `routeStages` / pilot `RouteWithNeeds` stage labels (Batch kickoff route)
- `leftHowLabel` move kinds in batch package table
- `closedPackageOutcomeLine` split/dropped fragments
- `BuildingView`: header facts, history, delivery panels, many `assetHeaderFacts` labels
- Package tab panels: `IndicativeWorkstream`, `TenderWorkstream`, `DeliveryWorkstream`, etc.

## Layout overflows

Not systematically re-checked this pass. German is longer — watch batch service filter grids, SummaryCards subtitles, and package fact rows.

## Files touched this pass

- `lib/concept/i18n/de.json`
- `lib/concept/derive.ts` (`batchSummary`, `stepNote`)
- `components/concept/ui.tsx` (`ClearFilters`, `FilterSearch`, `YourActionOnly`, `SummaryCards`)
- `components/concept/Buildings.tsx` (completed rows)
- `components/concept/BatchesIndex.tsx`
- `components/concept/BatchView.tsx` (page + pilot dashboard)
- `components/concept/WorkstreamsByBatch.tsx`
- `components/concept/ServiceSection.tsx`
- `components/concept/PackageView.tsx`
- `components/concept/WorkstreamChrome.tsx` (customer header, facts, activity)
- `components/concept/BuildingView.tsx` (partial: shell, tabs, pager, overview/service cards)
- `app/concept/batches/[id]/page.tsx`
- `app/concept/packages/[id]/page.tsx`
- `docs/concept/i18n/IMPLEMENTATION_REPORT.md`

## Recommended next steps

1. Finish `BuildingView.tsx` (facts grid, status headlines, history, documents).
2. Package service tabs and `packageTabs.ts` labels at source; inherited-estimate intro in `PackageView`.
3. `RouteWithNeeds` + `routeStages(..., lang)` for batch kickoff and mature batch route.
4. `leftHowLabel` / `moves.ts` with `lang` for DE move kinds.
5. Mock activity in `data.ts` / `store.tsx` — translate at display or add DE content rows.
6. Manual QA per `cursor-prompt-german.md` § Check with `?lang=de`.
