import { Suspense } from 'react'
import { SupplierComparisonTable } from '@/components/supplier-comparison-table'

export default function LedRostockSupplierComparisonPage() {
  return (
    <Suspense fallback={null}>
      <SupplierComparisonTable projectType="led-rostock" />
    </Suspense>
  )
}
