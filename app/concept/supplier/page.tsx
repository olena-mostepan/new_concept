import { redirect } from "next/navigation";
import { SUPPLIER_TENDERS } from "@/lib/concept/supplier";

/** Supplier concept: no tenders list yet, so open the first tender. */
export default function SupplierHome() {
  redirect(`/concept/supplier/tenders/${SUPPLIER_TENDERS[0].id}`);
}
