import { DecisionComparisonView } from '@/components/decision-comparison-view'
import { DEFAULT_DECISION_SUPPLIERS } from '@/lib/decision-comparison-data'

export default async function CompareSuppliersPage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string }>
}) {
  const { ids } = await searchParams
  const selectedIds = ids ? ids.split(',').map((s) => s.trim()).filter(Boolean) : []
  const suppliers = selectedIds.length >= 2
    ? DEFAULT_DECISION_SUPPLIERS.filter((s) => selectedIds.includes(s.id))
    : DEFAULT_DECISION_SUPPLIERS
  const displaySuppliers = suppliers.length >= 2 ? suppliers : DEFAULT_DECISION_SUPPLIERS

  return (
    <DecisionComparisonView
      suppliers={displaySuppliers}
      totalSupplierCount={15}
      clusterLabel="Project 322 Braehead — smaller systems (1,670–2,333 kWp)"
    />
  )
}
