import { Suspense } from "react";
import { SupplierDelivery } from "@/components/concept/SupplierDelivery";

export default function SupplierDeliveryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-bg-container-grey" />}>
      <SupplierDelivery />
    </Suspense>
  );
}
