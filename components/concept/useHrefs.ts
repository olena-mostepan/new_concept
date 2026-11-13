"use client";

import { usePathname } from "next/navigation";
import { hrefsForPath, modeOf, type ConceptMode, type hrefs } from "./hrefs";

/** Links for the version the viewer is in: Ops at /concept, customer at /concept/customer. */
export function useHrefs(): typeof hrefs {
  return hrefsForPath(usePathname() ?? "");
}

/** "ops" on the main prototype, "customer" under /concept/customer. */
export function useConceptMode(): ConceptMode {
  return modeOf(usePathname() ?? "");
}
