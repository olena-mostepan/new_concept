# German i18n — implementation report

**Date:** 2026-11-11  
**Scope:** **Customer** `/concept` only (German). **Ops** `/concept/ops` stays English — no DE/EN toggle on Ops; `useConceptI18n()` uses `en` on Ops paths while `lang=de` remains stored for Customer.  
**Build:** `npm run build` passes at end of this pass.

## Summary

Core **DE / EN infrastructure** is in place (store, toggle, dictionary, format helpers, partial `derive.ts` / `words.ts`). **Most screens are still English in DE mode** because the bulk of `components/concept/**` has not yet been wrapped with `useConceptI18n` / `t(lang, …)`.

Do **not** run automated regex injectors on function declarations (an attempt duplicated `function` keywords and was reverted).

## Infrastructure (done)

| Piece | Location | Notes |
| --- | --- | --- |
| Dictionary | `lib/concept/i18n/de.json` (from `docs/concept/i18n/concept-de.json`) | ~1k keys |
| `t` / `useT` / `plural` | `lib/concept/i18n/index.ts` | Missing keys warn in dev; `TODO-DE` falls back to EN |
| Dates / money | `lib/concept/i18n/format.ts` | DE dates, `formatMoney*` |
| Hook | `components/concept/useConceptI18n.ts` | `lang`, `t`, `plural`, `words` |
| Language state | `components/concept/store.tsx` | `lang`, `setLang`, `localStorage`, `?lang=de`, `<html lang>` |
| Toggle | `components/concept/ConceptChrome.tsx` | `LangToggle` on Customer header/DetailBar only (hidden on Ops) |
| Customer-only lang | `useConceptI18n.ts` → `customerLang()` | Ops routes always translate as `en` |
| Service pill | `components/concept/ServiceTag.tsx` | `t(serviceDef(s).label)` |
| Owner pill | `components/concept/ui.tsx` → `ResponsibilityPill` | `ownerLabel(lang, owner)` |
| Package status | `components/concept/packageStatus.ts` | Headlines / CTA take `lang` |
| Words / plurals | `lib/concept/words.ts` | `nAssets`, `nPackages`, `fixAssetsAction`, `ownerLabel` |
| Derive (partial) | `lib/concept/derive.ts` | `short`, `nextLine`, `nextParts`, `money`, `moneyOne`, `paybackLabel`, `presentedTotal`, `decisionLabel`, `decidedLine`, `deliveryNextLine` accept `lang` |

## Components with i18n started

- `ConceptChrome.tsx` — header, nav, DetailBar, account toggle, DE/EN toggle
- `lists.tsx` — workstream table headers, next/progress, grouped batch empty state
- `RightNow.tsx` — card title, groups, done line
- `ServiceTag.tsx`
- `packageStatus.ts` (lib-adjacent module)
- `ui.tsx` — `ResponsibilityPill` only (large file still mostly EN)

## Not done (high priority)

### `components/concept/**` still without `useConceptI18n`

Customer-first: `dashboard.tsx`, `BatchView.tsx`, `BuildingView.tsx`, `PackageView.tsx`, `ServiceSection.tsx`, `DeliverySection.tsx`, `WorkstreamChrome.tsx` (beyond status card), remaining `ui.tsx` strings (tips, filters, route, timeline labels, etc.). **Ops routes are out of scope for DE copy** (stay EN).

### `lib/concept/**` strings still hard-coded EN

Large sections of `derive.ts` after ~line 100 (`workstreamMeta`, `routeStages`, `surveyLine`, `deliveryLine`, `sectionOutcome`, step panels, etc.) still build English template strings without `lang`.

- `delivery.ts` — `€${…}k` in `toCustomerProject` / `toDeliveryPayload`; `deliveryPhaseDateNote` uses `short()` without `lang`
- `model.ts` — service steps / happens (translate at display time with `t(lang, key)`)
- `store.tsx` — activity titles (`Batch created`, etc.)
- `data.ts`, `checks.ts`, `opsMutations.ts`, `moves.ts`, `opsDisplay.ts`, `opsAssetDerive.ts` as listed in `cursor-prompt-german.md`

### Call sites

Where derive helpers already accept `lang`, most call sites in untouched components still omit `lang` (defaults to EN even when store is DE).

### Ops (English only)

- `OpsPackageView.tsx` / `AssetWindow.tsx`: use `useConceptI18n().lang` (not store `lang`) so a stored `de` preference does not Germanize fix-asset labels on Ops.

## `TODO-DE` keys added this pass

| Key | Reason |
| --- | --- |
| `No {0} here yet.` | Fragment merge in `lists.tsx` `GroupedByBatch` |

(Existing `TODO-DE` entries in the spreadsheet export were not modified.)

## Keys used without German in dictionary (fallback EN in DE)

Examples introduced or relied on this pass — verify against `concept-de.json` / xlsx:

- `{0} of {1}` — `RightNow.tsx` progress column (no DE entry found)
- `View`, `Language`, `Sections`, `Mature` — added to `de.json` where missing; `Powered by CQuel`, `Ops` left as labels

Run dev with `lang=de` and watch `[i18n] Missing DE key` warnings for the full list.

## Layout overflows

Not systematically checked in this pass. German is ~25% longer; pay special attention to ops filter chips, table headers, and nav tabs when continuing.

## Files touched this pass

- `lib/concept/i18n/` (`index.ts`, `format.ts`, `de.json`)
- `lib/concept/derive.ts`, `lib/concept/words.ts`
- `components/concept/store.tsx`, `ConceptChrome.tsx`, `ServiceTag.tsx`, `packageStatus.ts`, `lists.tsx`, `RightNow.tsx`, `ui.tsx` (partial), `WorkstreamChrome.tsx` (status card), `ops-asset/OpsPackageView.tsx`, `ops-asset/AssetWindow.tsx` (lang source fix only)
- `components/concept/useConceptI18n.ts`
- `docs/concept/i18n/IMPLEMENTATION_REPORT.md` (this file)

## Recommended next steps

1. File-by-file: add `useConceptI18n()` and wrap JSX / aria / placeholders with `t(…)` using **exact** keys from `de.json`.
2. Extend `derive.ts` display helpers with `lang` and `t()`; pass `lang` from every caller.
3. `delivery.ts`: `formatMoneyOne(..., lang)` and `short(..., lang)` for customer delivery payload labels.
4. Fragment sentences: one `t('… {0} …', …)` key each + `TODO-DE` in `de.json`.
5. Manual QA: EN unchanged on Customer and all Ops; DE on **Customer** routes in `cursor-prompt-german.md` § Check (Ops excluded).
6. Re-run `grep -rn "@/components/ui/" components/concept app/concept | grep -v ui.tsx` (must be empty).
