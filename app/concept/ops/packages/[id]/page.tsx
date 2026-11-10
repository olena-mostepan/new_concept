import { OpsPackageView } from "@/components/concept/ops-asset/OpsPackageView";

export default async function OpsPackagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <OpsPackageView id={id} />;
}
