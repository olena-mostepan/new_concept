import { Suspense } from 'react'
import { SupplierComparisonTable } from '@/components/supplier-comparison-table'

export default function LedSupplierComparisonPage() {
  return (
    <Suspense fallback={null}>
      <SupplierComparisonTable projectType="led" />
    </Suspense>
  )
}
