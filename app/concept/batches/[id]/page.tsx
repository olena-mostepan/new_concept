'use client'

import { useParams } from 'next/navigation'
import { batchSummary, getBatch } from '@/lib/concept/derive'
import { ChangedKey, Page, PageHeader } from '@/components/concept/ui'
import { BatchView } from '@/components/concept/BatchView'
import { hrefs } from '@/components/concept/hrefs'
import { useConcept } from '@/components/concept/store'

export default function BatchPage() {
  const { id } = useParams<{ id: string }>()
  const { account } = useConcept()
  const b = getBatch(account, id)
  if (!b || b.planState === 'draft') {
    return (
      <Page>
        <PageHeader crumbs={[{ label: 'Portfolio', href: hrefs.portfolio }]} title={b?.name ?? 'Batch'} meta="This batch isn't shared with the customer yet. It appears here once ops propose the plan." />
      </Page>
    )
  }
  return (
    <Page>
      <PageHeader crumbs={[{ label: 'Batches', href: hrefs.batches }, { label: b.name }]} title={b.name} meta={<span className="p7 text-text-secondary">{batchSummary(account, b).line}</span>} actions={<ChangedKey className="p7 text-text-secondary" />} />
      <BatchView account={account} batch={b} variant="page" />
    </Page>
  )
}
