"use client";

import { Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { BuildingView } from "@/components/concept/BuildingView";
import { OpsAssetView } from "@/components/concept/ops-asset/OpsAssetView";
import { useConcept } from "@/components/concept/store";
import { useConceptMode } from "@/components/concept/useHrefs";

function Inner() {
  const { buildingId } = useParams<{ buildingId: string }>();
  const search = useSearchParams();
  const { account } = useConcept();
  const mode = useConceptMode();
  if (mode === "ops") {
    // Ops: the asset's checklist for the package it is opened from, when Ops has data for it.
    const asked = search.get("package") ?? search.get("project") ?? search.get("ws");
    const data = account.opsAssetData ?? {};
    const pkg = asked
      ? data[asked]?.[buildingId]
        ? asked
        : undefined
      : Object.keys(data).find((id) => data[id]?.[buildingId]);
    if (pkg) return <OpsAssetView buildingId={buildingId} packageId={pkg} />;
  }
  return <BuildingView buildingId={buildingId} />;
}

export default function BuildingPage() {
  return (
    <Suspense>
      <Inner />
    </Suspense>
  );
}
