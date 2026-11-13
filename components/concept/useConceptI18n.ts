"use client";

import { usePathname } from "next/navigation";
import { useT, type Lang } from "@/lib/concept/i18n";
import { wordAssets } from "@/lib/concept/words";
import { isCustomerPath } from "./hrefs";
import { useConcept } from "./store";

/** German applies to the customer version (`/concept/customer`) only; Ops stays English. */
export function customerLang(stored: Lang, pathname: string): Lang {
  return isCustomerPath(pathname) ? stored : "en";
}

/** Stored preference plus `t` / `plural` using customer-only effective `lang`. */
export function useConceptI18n() {
  const pathname = usePathname() ?? "";
  const { lang: stored } = useConcept();
  const lang = customerLang(stored, pathname);
  const i18n = useT(lang);
  return {
    storedLang: stored,
    lang,
    ...i18n,
    words: wordAssets(lang),
  };
}
