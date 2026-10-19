import { DecisionComparisonView } from '@/components/decision-comparison-view'
import { getLedDecisionSuppliers } from '@/lib/led-decision-comparison-data'

export default async function LedCompareSuppliersPage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string }>
}) {
  const { ids } = await searchParams
  const selectedIds = ids ? ids.split(',').map((s) => s.trim()).filter(Boolean) : []
  const suppliers = getLedDecisionSuppliers(selectedIds.length >= 2 ? selectedIds : undefined)

  return (
    <DecisionComparisonView
      suppliers={suppliers}
      totalSupplierCount={7}
      clusterLabel="2,494 luminaires"
      projectType="led"
    />
  )
}
