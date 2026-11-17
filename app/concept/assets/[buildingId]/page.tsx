"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";
import { BuildingView } from "@/components/concept/BuildingView";

/** One asset page for both versions; the Ops version adds the data checklist (see BuildingView). */
function Inner() {
  const { buildingId } = useParams<{ buildingId: string }>();
  return <BuildingView buildingId={buildingId} />;
}

export default function BuildingPage() {
  return (
    <Suspense>
      <Inner />
    </Suspense>
  );
}
