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
  return translate(lang, key, n === 1 ? [] : [n, ...otherArgs]);
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
