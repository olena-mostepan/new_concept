"use client";

import { usePathname } from "next/navigation";
import { useT, type Lang } from "@/lib/concept/i18n";
import { OWNER_LABEL, type Owner } from "@/lib/concept/model";
import { wordAssets } from "@/lib/concept/words";
import { isCustomerPath } from "./hrefs";
import { useConcept } from "./store";

/** German applies to the customer version (`/concept/customer`) only; Ops stays English. */
export function customerLang(stored: Lang, pathname: string): Lang {
  return isCustomerPath(pathname) ? stored : "en";
}

/**
 * The same pages speak to the customer in the customer version and to Ops in the Ops version.
 * Customer-voice phrases (key = the English text passed to t) and their Ops wording.
 */
const OPS_VOICE: Record<string, string> = {
  "Your action": "With customer",
  "Your action only": "With customer only",
  "Your action: {0}": "With customer: {0}",
  "Your action ·": "With customer ·",
};

/** Stored preference plus `t` / `plural` using customer-only effective `lang`. */
export function useConceptI18n() {
  const pathname = usePathname() ?? "";
  const { lang: stored } = useConcept();
  const ops = !isCustomerPath(pathname);
  const lang = customerLang(stored, pathname);
  const i18n = useT(lang);
  const voice = (en: string) => (ops ? (OPS_VOICE[en] ?? en) : en);
  const t = (en: string, ...args: unknown[]) => i18n.t(voice(en), ...args);
  return {
    ...i18n,
    storedLang: stored,
    lang,
    t,
    plural: (n: number, one: string, other: string, ...args: unknown[]) =>
      i18n.plural(n, voice(one), voice(other), ...args),
    /** Who acts next, in this version's voice ("Your action" for the customer, "With customer" for Ops). */
    owner: (o: Owner) => t(OWNER_LABEL[o]),
    words: wordAssets(lang),
  };
}
