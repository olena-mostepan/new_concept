import { Suspense } from "react";
import { SupplierAsset } from "@/components/concept/SupplierDelivery";

export default async function SupplierAssetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense fallback={<div className="min-h-screen bg-bg-container-grey" />}>
      <SupplierAsset id={id} />
    </Suspense>
  );
}
