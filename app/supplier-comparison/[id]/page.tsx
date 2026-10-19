import { SupplierProfileView } from '@/components/supplier-profile-view'

// Photon Energy has full profile data; other supplier IDs show Photon data as placeholder
export default async function SupplierProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <SupplierProfileView supplierId={id} />
}
