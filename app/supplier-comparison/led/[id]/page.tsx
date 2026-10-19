import { SupplierProfileView } from '@/components/supplier-profile-view'
import { getLedProfile, LED_SHORTLIST } from '@/lib/led-profile-data'
import { notFound } from 'next/navigation'

export default async function LedSupplierProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const data = getLedProfile(id)
  if (!data) return notFound()

  return (
    <SupplierProfileView
      data={data}
      shortlist={LED_SHORTLIST}
      supplierId={id}
      projectType="led"
    />
  )
}
