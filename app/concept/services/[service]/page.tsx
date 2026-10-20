'use client'

import { Suspense } from 'react'
import { useParams } from 'next/navigation'
import { SERVICES, type ServiceId } from '@/lib/concept/model'
import { Page } from '@/components/concept/ui'
import { WorkstreamsByBatch } from '@/components/concept/WorkstreamsByBatch'
import { ServiceSection } from '@/components/concept/ServiceSection'
import { DeliverySection } from '@/components/concept/DeliverySection'

function Inner() {
  const { service } = useParams<{ service: ServiceId }>()
  if (!SERVICES.some((s) => s.id === service)) return null
  if (service === 'delivery') {
    return (
      <Page>
        <DeliverySection />
      </Page>
    )
  }
  if (service === 'indicative' || service === 'scope' || service === 'tender' || service === 'pricing') {
    return (
      <Page>
        <ServiceSection serviceId={service} />
      </Page>
    )
  }
  return (
    <Page>
      <WorkstreamsByBatch serviceId={service} />
    </Page>
  )
}

export default function ServicePage() {
  return (
    <Suspense>
      <Inner />
    </Suspense>
  )
}
