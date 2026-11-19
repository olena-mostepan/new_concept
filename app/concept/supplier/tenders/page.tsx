import { Suspense } from "react";
import { SupplierTenders } from "@/components/concept/SupplierTenders";

export default function SupplierTendersPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-bg-container-grey" />}>
      <SupplierTenders />
    </Suspense>
  );
}
