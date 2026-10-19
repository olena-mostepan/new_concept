import { SupplierProfileView } from '@/components/supplier-profile-view'
import { getLedRostockProfile, ROSTOCK_LED_SHORTLIST } from '@/lib/led-rostock-profile-data'
import { notFound } from 'next/navigation'

export default async function LedRostockSupplierProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const data = getLedRostockProfile(id)
  if (!data) return notFound()

  return (
    <SupplierProfileView
      data={data}
      shortlist={ROSTOCK_LED_SHORTLIST}
      supplierId={id}
      projectType="led-rostock"
    />
  )
}
