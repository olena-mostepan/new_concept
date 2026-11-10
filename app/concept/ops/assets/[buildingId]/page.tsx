import { OpsAssetView } from "@/components/concept/ops-asset/OpsAssetView";

export default async function OpsAssetPage({
  params,
}: {
  params: Promise<{ buildingId: string }>;
}) {
  const { buildingId } = await params;
  return <OpsAssetView buildingId={buildingId} />;
}
