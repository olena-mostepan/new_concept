'use client'

import { Suspense } from 'react'
import { Page } from '@/components/concept/ui'
import { BatchesIndex } from '@/components/concept/BatchesIndex'

export default function BatchesPage() {
  return (
    <Suspense>
      <Page>
        <BatchesIndex />
      </Page>
    </Suspense>
  )
}
