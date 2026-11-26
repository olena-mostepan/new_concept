import { notFound } from "next/navigation";
import { Suspense } from "react";
import { supplierTender } from "@/lib/concept/supplier";
import { SupplierTenderAsset } from "@/components/concept/SupplierTenderAsset";

export default async function SupplierTenderAssetPage({
  params,
}: {
  params: Promise<{ id: string; asset: string }>;
}) {
  const { id, asset } = await params;
  const t = supplierTender(id);
  if (!t) notFound();
  return (
    <Suspense fallback={<div className="min-h-screen bg-bg-container-grey" />}>
      <SupplierTenderAsset t={t} assetKey={decodeURIComponent(asset)} />
    </Suspense>
  );
}
