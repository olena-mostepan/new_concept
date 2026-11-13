import type { Account } from "@/lib/concept/model";
import { getWorkstream } from "@/lib/concept/derive";
import { BASE, hrefsForPath, mainPath } from "./hrefs";

type Query = { get(key: string): string | null };

/** When there is no in-app history, Back goes up one level (in the version being viewed). */
export function detailFallbackHref(
  account: Account,
  pathname: string,
  query: Query,
): string {
  const hrefs = hrefsForPath(pathname);
  const path = mainPath(pathname);

  if (/^\/concept\/batches\/[^/]+/.test(path)) return hrefs.overview;

  const pkg = path.match(/^\/concept\/packages\/([^/]+)/);
  if (pkg) {
    const w = getWorkstream(account, pkg[1]);
    return w ? hrefs.batch(w.batchId) : hrefs.overview;
  }

  const asset = path.match(/^\/concept\/assets\/([^/]+)/);
  if (asset) {
    const project = query.get("package") || query.get("project") || query.get("ws");
    if (project) {
      const w = getWorkstream(account, project);
      if (w) return hrefs.workstream(w.id);
    }
    return hrefs.buildings;
  }

  const project = path.match(/^\/concept\/projects\/([^/]+)/);
  if (project) return hrefs.workstream(project[1]);

  return hrefs.overview;
}

/** Full-screen workspaces (new batch) hide app chrome. */
export function isFullscreenWorkspace(pathname: string) {
  return mainPath(pathname) === `${BASE}/batches/new`;
}

export function isDetail(pathname: string) {
  if (isFullscreenWorkspace(pathname)) return false;
  const path = mainPath(pathname);
  if (/^\/concept\/batches\/[^/]+/.test(path)) return true;
  if (/^\/concept\/packages\/[^/]+/.test(path)) return true;
  if (/^\/concept\/assets\/[^/]+/.test(path)) return true;
  if (/^\/concept\/projects\/.+/.test(path)) return true;
  return false;
}
