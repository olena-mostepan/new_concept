import { redirect } from "next/navigation";
import { customerHrefs } from "@/components/concept/hrefs";

/** Customer version: batches are listed on the assets page. */
export default function CustomerBatchesPage() {
  redirect(customerHrefs.buildings);
}
