import { redirect } from "next/navigation";
import { hrefs } from "@/components/concept/hrefs";

export default function BatchesPage() {
  redirect(hrefs.buildings);
}
