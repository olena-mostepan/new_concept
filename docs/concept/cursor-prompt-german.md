# Cursor prompt: German version of the concept (DE / EN toggle)

Paste everything below the line into Cursor, in the `new_concept` repo.

---

Add a German version of the concept prototype (`/concept`) with a DE / EN toggle. The translations are done and are not to be rewritten:

- `docs/concept/i18n/concept-de.json`: English string → German string, 1,043 entries. `{0}`, `{1}` … are placeholders.
- `docs/concept/i18n/Concept UI strings (DE).xlsx`:
  - **Strings:** where each string is used, file and line;
  - **Glossary decisions;**
  - **Concerns:** read this sheet, it lists the code changes German needs.

**Use the German exactly as written.** If a string has no entry, leave it in English and list it in your report. Don't translate anything yourself.

## 1. The language switch

- **Language state:** keep it the same way as the view (Customer / Ops) in `components/concept/store.tsx`:
  - a `lang: 'en' | 'de'` value, saved in `localStorage` (key `cquel-concept-lang`);
  - overridable with `?lang=de` in the URL, so a link can open the German version.
- **Toggle:** a DE / EN control in the header and the DetailBar, right of the Customer / Ops toggle. Use the same component as `ViewToggle` in `ConceptChrome.tsx`, labelled "EN" and "DE", with `aria-label="Language"`. Switching changes the language in place: same page, same scroll, no reload.
- **`<html lang>`:** set it to `de` or `en` to match, so screen readers and hyphenation use the right language.

## 2. One translation helper

- **Dictionary:** copy `docs/concept/i18n/concept-de.json` to `lib/concept/i18n/de.json` and import it there.
- **`lib/concept/i18n/index.ts`:**
  - **`t(en: string, ...args)`:** returns the German string when `lang` is `de`, otherwise the English. It fills `{0}`, `{1}` … from `args`.
  - **`useT()` hook:** for components.
  - **Plain `t(lang, en, ...args)`:** for the derive/model code in `lib/concept`, which has no hooks. Pass `lang` down from the components that call it. Don't read React state from `lib/`.
- **Missing keys:** in development, a missing key logs a warning once per string.
- **Wrap every user-facing string** in the files listed on the Strings sheet, in both `components/concept/**` and `lib/concept/**`:
  - JSX text, `label`, `title`, `placeholder`, `aria-label`, and button and menu labels;
  - generated lines in `derive.ts`, `model.ts`, `delivery.ts`, `moves.ts`, `opsMutations.ts`, `words.ts` and `store.tsx`;
  - mock-data text in `data.ts` and `checks.ts`.
- **Don't wrap** CSS classes, ids, keys, file names, or person, customer, supplier, site and batch names. The "Not translated" and "Name (kept)" rows show these.
- **Template strings:** turn `` `Started ${date}` `` into `t('Started {0}', date)`. The English key must be exactly the string in the dictionary, with `{0}`, `{1}` … in the same order as the original `${…}`.

## 3. Sentences split across JSX

German word order is different, so a sentence built from pieces can't be translated piece by piece. Every row whose Type is **Fragment** on the Strings sheet is one of these, for example:

- "Find an" + asset;
- "No" … "match “" … "”";
- "It used" + value;
- "Showing" … "· newest first";
- "This creates" … "projects · starts at".

For each one:

1. Make the whole sentence one string with placeholders, for example `t('No {0} match “{1}”', noun, query)`. Keep any bold or link parts as React nodes passed in as placeholders.
2. Add the new English key to `de.json` with **`"TODO-DE"`** as its value. Don't write the German yourself.
3. List the new keys in your report so they can be translated.

## 4. Singular and plural

Where a number drives the text ("1 project" / "3 projects", "1 asset needs" / "3 assets need"):

- choose the form with a small `plural(n, one, other)` helper;
- give each form its own key.

The dictionary already has both forms for "1 Objekt muss zuerst behoben werden" / "{0} Objekte müssen zuerst behoben werden" and "1 Objekt beheben" / "{0} Objekte beheben". Copy that pattern. For other counts with no singular German entry, add a `"TODO-DE"` key, as in section 3.

## 5. Dates and money

Don't translate date or money literals one by one.

- **`lib/concept/i18n/format.ts`:**
  - `formatDate(d, lang, { year?: boolean })`:
    - EN: "28 Aug" / "28 Aug 2026";
    - DE: "28. Aug." / "28. Aug. 2026", with the Duden month abbreviations Jan., Feb., März, Apr., Mai, Juni, Juli, Aug., Sep., Okt., Nov., Dez.
  - `formatMoney(k, lang)` and `formatMoneyRange(a, b, lang)`:
    - EN keeps today's output ("€26k", "€23–28k", "€1.2m");
    - DE writes "26.000 €", "23.000–28.000 €", "1,2 Mio. €": dot thousands, decimal comma, € after the amount, en dash in ranges.
- **Where they're used:**
  - replace the `€${…}k` / `€${…}m` builders in `derive.ts` (~867–874, ~1173) and `delivery.ts` (~112, ~200);
  - format every date the UI shows through `formatDate`. Mock dates in `data.ts` are English strings ("28 Aug 2026", "1 Sep"); parse them once into dates, or add a small parser in `format.ts`. Don't add a German copy of each date.
- **Percentages and units** in German take a space before the sign: "60 %", "380 m²".

## 6. Don't change

- **Layout:** no CSS, layout or design-system changes, apart from text that no longer fits. German runs about 25 % longer, so check tabs, pills, buttons and table headers.
  - Let text wrap where the design allows it.
  - Never truncate a button label.
  - List any overflow you find instead of fixing it with smaller type.
- **English:** with `lang = en`, every page must look exactly as it does today.

## Check

- **English unchanged:** with the toggle on EN, every page matches the current version.
- **German pages:** with DE, open each of these as Customer and as Ops:
  - Overview, Assets, a batch page, a package page (Overview and a service tab), an asset page;
  - Ops: the package page, Fix assets, Edit asset data, the assistant panel.
  - No English is left except names, file names and `TODO-DE` keys.
- **German examples:**
  - the StatusCard reads "Dieses Paket ist in der Kostenschätzung";
  - a date reads "28. Aug. 2026";
  - a price reads "23.000–28.000 €".
- **Link:** `?lang=de` opens a page in German, and a reload keeps the choice.
- **Report:**
  - `npm run build` passes;
  - every `TODO-DE` key you added;
  - every English string you found with no entry;
  - every layout overflow;
  - every file you touched.
