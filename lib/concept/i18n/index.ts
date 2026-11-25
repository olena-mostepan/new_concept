import de from "./de.json";

export type Lang = "en" | "de";

export const LANG_STORAGE_KEY = "cquel-concept-lang";

const warned = new Set<string>();

type Dict = Record<string, string>;

const dictionary = de as Dict;

export function plural(
  n: number,
  one: string,
  other: string,
  lang: Lang,
  ...otherArgs: unknown[]
): string {
  const key = n === 1 ? one : other;
  return translate(lang, key, ...(n === 1 ? [] : [n, ...otherArgs]));
}

function fillPlaceholders(text: string, args: unknown[]): string {
  return text.replace(/\{(\d+)\}/g, (_, i) => {
    const v = args[Number(i)];
    return v == null ? "" : String(v);
  });
}

export function translate(lang: Lang, en: string, ...args: unknown[]): string {
  if (lang === "en") {
    return args.length ? fillPlaceholders(en, args) : en;
  }
  const hit = dictionary[en];
  if (!hit) {
    if (process.env.NODE_ENV === "development" && !warned.has(en)) {
      warned.add(en);
      console.warn(`[i18n] Missing DE key: ${JSON.stringify(en)}`);
    }
    return args.length ? fillPlaceholders(en, args) : en;
  }
  if (hit === "TODO-DE") {
    return args.length ? fillPlaceholders(en, args) : en;
  }
  return fillPlaceholders(hit, args);
}

/** Non-hook translation for lib code; pass `lang` from the caller. */
export function t(lang: Lang, en: string, ...args: unknown[]): string {
  return translate(lang, en, ...args);
}

/** Call from client components with `lang` from `useConcept()`. */
export function useT(lang: Lang) {
  return {
    lang,
    t: (en: string, ...args: unknown[]) => translate(lang, en, ...args),
    plural: (n: number, one: string, other: string, ...args: unknown[]) =>
      plural(n, one, other, lang, ...args),
  };
}

/**
 * Example data shown in German: copies the account and swaps the text fields
 * (names, goals, needs, activity, documents…) that have a German entry. Ids and
 * states are never touched; strings without an entry stay English.
 */
const DATA_TEXT_KEYS = new Set([
  "name", "goal", "gives", "exclusion", "label", "why", "scope", "text", "title",
  "meta", "value", "source", "filesSummary", "type", "cost", "happens",
]);

function deText(s: string): string {
  const hit = dictionary[s];
  return hit && hit !== "TODO-DE" ? hit : s;
}

export function localizeData<T>(value: T, lang: Lang, key?: string): T {
  if (lang === "en" || value == null) return value;
  if (typeof value === "string") return (key && DATA_TEXT_KEYS.has(key) ? deText(value) : value) as T;
  if (Array.isArray(value)) return value.map((v) => localizeData(v, lang, key)) as T;
  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      // Route notes: every value is display text.
      out[k] =
        k === "routeNotes" && v && typeof v === "object"
          ? Object.fromEntries(Object.entries(v).map(([s, txt]) => [s, typeof txt === "string" ? deText(txt) : txt]))
          : localizeData(v, lang, k);
    }
    return out as T;
  }
  return value;
}
