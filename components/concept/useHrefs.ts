"use client";

import { usePathname } from "next/navigation";
import type { ServiceId } from "@/lib/concept/model";
import { OPS, hrefs, type BuildingFrom, type BuildingVia, type WorkstreamFrom } from "./hrefs";

/**
 * Ops-side links. Shared lists (service pages, packages, the dashboard) are
 * rendered on both sides; on /concept/ops/* their links stay in Ops.
 */
export const opsHrefs: typeof hrefs = {
  ...hrefs,
  overview: OPS,
  portfolio: OPS,
  service: (s: ServiceId) => `${OPS}/services/${s}`,
  workstreams: (s?: ServiceId) => `${OPS}/packages${s ? `?service=${s}` : ""}`,
  workstream: (id: string, _from?: WorkstreamFrom, _buildingId?: string) => hrefs.opsPackage(id),
  batch: (id: string) => hrefs.opsBatch(id),
  project: (workstreamId: string, buildingId: string) =>
    hrefs.opsAsset(buildingId, { package: workstreamId }),
  building: (
    buildingId: string,
    opts?: { project?: string; package?: string; from?: BuildingFrom; via?: BuildingVia; ws?: string; batch?: string; service?: string; tab?: string },
  ) => hrefs.opsAsset(buildingId, { package: opts?.project ?? opts?.package ?? opts?.ws }),
};

/** hrefs for the side the viewer is on (customer or Ops). */
export function useHrefs(): typeof hrefs {
  const path = usePathname() ?? "";
  return path.startsWith(OPS) ? opsHrefs : hrefs;
}

