'use client'

import { Suspense } from 'react'
import { OpsNewBatch } from '@/components/concept/OpsNewBatch'

export default function NewBatchPage() {
  return (
    <Suspense>
      <OpsNewBatch />
    </Suspense>
  )
}
