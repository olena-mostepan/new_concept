import { notFound } from "next/navigation";
import { Suspense } from "react";
import { supplierTender } from "@/lib/concept/supplier";
import { SupplierTender } from "@/components/concept/SupplierTender";

export default async function SupplierTenderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = supplierTender(id);
  if (!t) notFound();
  return (
    <Suspense fallback={<div className="min-h-screen bg-bg-container-grey" />}>
      <SupplierTender t={t} />
    </Suspense>
  );
}
