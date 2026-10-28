'use client'

import { Suspense } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { getWorkstream, selectedPhase, workstreamView } from '@/lib/concept/derive'
import { Page, PageHeader } from '@/components/concept/ui'
import { IndicativeWorkstream } from '@/components/concept/IndicativeWorkstream'
import { ScopeWorkstream } from '@/components/concept/ScopeWorkstream'
import { TenderWorkstream } from '@/components/concept/TenderWorkstream'
import { PricingWorkstream } from '@/components/concept/PricingWorkstream'
import { DeliveryWorkstream } from '@/components/concept/DeliveryWorkstream'
import { useConcept } from '@/components/concept/store'

export default function WorkstreamPage() {
  return (
    <Suspense>
      <WorkstreamRoute />
    </Suspense>
  )
}

function WorkstreamRoute() {
  const { id } = useParams<{ id: string }>()
  const params = useSearchParams()
  const { account } = useConcept()
  const w = getWorkstream(account, id)
  if (!w) return <Page><PageHeader title="Workstream not found" /></Page>
  const phase = selectedPhase(w, params.get('service'))
  const view = workstreamView(w, phase)
  if (phase.service === 'indicative') return <IndicativeWorkstream live={w} w={view} />
  if (phase.service === 'scope') return <ScopeWorkstream live={w} w={view} />
  if (phase.service === 'tender') return <TenderWorkstream live={w} w={view} />
  if (phase.service === 'pricing') return <PricingWorkstream live={w} w={view} />
  return <DeliveryWorkstream live={w} w={view} />
}
