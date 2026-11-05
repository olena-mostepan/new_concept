"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";
import { BuildingView } from "@/components/concept/BuildingView";

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
