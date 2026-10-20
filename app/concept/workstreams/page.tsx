'use client'

import { Suspense } from 'react'
import { Page } from '@/components/concept/ui'
import { WorkstreamsByBatch } from '@/components/concept/WorkstreamsByBatch'

export default function WorkstreamsPage() {
  return (
    <Suspense>
      <Page>
        <WorkstreamsByBatch />
      </Page>
    </Suspense>
  )
}
