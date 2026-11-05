import type { Account } from "@/lib/concept/model";
import { getWorkstream } from "@/lib/concept/derive";
import { hrefs, OPS } from "./hrefs";

type Query = { get(key: string): string | null };

/** When there is no in-app history, Back goes up one level. */
export function detailFallbackHref(
  account: Account,
  pathname: string,
  query: Query,
): string {
  const batch = pathname.match(/^\/concept\/batches\/([^/]+)/);
  if (batch) return hrefs.overview;

  const pkg = pathname.match(/^\/concept\/packages\/([^/]+)/);
  if (pkg) {
    const w = getWorkstream(account, pkg[1]);
    return w ? hrefs.batch(w.batchId) : hrefs.overview;
  }

  const asset = pathname.match(/^\/concept\/assets\/([^/]+)/);
  if (asset) {
    const project = query.get("project") || query.get("ws");
    if (project) {
      const w = getWorkstream(account, project);
      if (w) return hrefs.workstream(w.id);
    }
    return hrefs.buildings;
  }

  const project = pathname.match(/^\/concept\/projects\/([^/]+)/);
  if (project) return hrefs.workstream(project[1]);

  if (pathname.startsWith(`${OPS}/batches/`)) return hrefs.ops;

  return hrefs.overview;
}

export function isDetail(pathname: string) {
  if (/^\/concept\/ops\/batches\/[^/]+/.test(pathname)) return true;
  if (/^\/concept\/batches\/[^/]+/.test(pathname)) return true;
  if (/^\/concept\/packages\/[^/]+/.test(pathname)) return true;
  if (/^\/concept\/assets\/[^/]+/.test(pathname)) return true;
  if (/^\/concept\/projects\/.+/.test(pathname)) return true;
  return false;
}
