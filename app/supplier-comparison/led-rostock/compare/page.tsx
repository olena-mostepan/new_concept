import { DecisionComparisonView } from '@/components/decision-comparison-view'
import { getLedRostockDecisionSuppliers } from '@/lib/led-rostock-decision-comparison-data'

export default async function LedRostockCompareSuppliersPage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string }>
}) {
  const { ids } = await searchParams
  const selectedIds = ids ? ids.split(',').map((s) => s.trim()).filter(Boolean) : []
  const suppliers = getLedRostockDecisionSuppliers(selectedIds.length >= 2 ? selectedIds : undefined)

  return (
    <DecisionComparisonView
      suppliers={suppliers}
      totalSupplierCount={2}
      clusterLabel="Doberaner Straße 114-116, Rostock — different scope (490 vs 1,029 luminaires)"
      projectType="led-rostock"
    />
  )
}
