'use client'

import { customerBatches } from '@/lib/concept/derive'
import { Page, PageHeader } from '@/components/concept/ui'
import { MatureDashboard } from '@/components/concept/dashboard'
import { BatchView } from '@/components/concept/BatchView'
import { useConcept } from '@/components/concept/store'

export default function OpsPortfolio() {
  const { account } = useConcept()
  const batches = customerBatches(account)
  const pilot = account.kind === 'pilot' && batches.length === 1
  return (
    <Page>
      <PageHeader title={`Welcome back, ${account.user}`} />
      {pilot && batches[0] ? <BatchView account={account} batch={batches[0]} variant="dashboard" /> : <MatureDashboard account={account} />}
    </Page>
  )
}
