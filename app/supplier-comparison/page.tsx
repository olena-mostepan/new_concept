import { Suspense } from 'react'
import { SupplierComparisonTable } from '@/components/supplier-comparison-table'

export default function SupplierComparisonPage() {
  return (
    <Suspense fallback={null}>
      <SupplierComparisonTable projectType="solar" />
    </Suspense>
  )
}
