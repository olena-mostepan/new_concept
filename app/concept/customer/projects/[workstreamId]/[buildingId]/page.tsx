import { redirect } from "next/navigation";

export default async function CustomerProjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ workstreamId: string; buildingId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { workstreamId, buildingId } = await params;
  const incoming = await searchParams;
  const next = new URLSearchParams();
  next.set("project", workstreamId);
  const from = incoming.from;
  if (typeof from === "string" && from) next.set("from", from);
  redirect(`/concept/customer/assets/${buildingId}?${next.toString()}`);
}
