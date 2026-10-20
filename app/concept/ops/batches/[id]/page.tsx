'use client'

import { Suspense } from 'react'
import { useParams } from 'next/navigation'
import { OpsBatch } from '@/components/concept/OpsBatch'

function Inner() {
  const { id } = useParams<{ id: string }>()
  return <OpsBatch id={id} />
}

export default function OpsBatchPage() {
  return (
    <Suspense>
      <Inner />
    </Suspense>
  )
}
