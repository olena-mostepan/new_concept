import { Suspense } from "react";
import { SupplierOverview } from "@/components/concept/SupplierOverview";

/** Supplier concept home: Overview. */
export default function SupplierHome() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-bg-container-grey" />}>
      <SupplierOverview />
    </Suspense>
  );
}
