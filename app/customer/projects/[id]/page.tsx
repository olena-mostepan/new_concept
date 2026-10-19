'use client'

import { Suspense } from 'react'
import { useParams } from 'next/navigation'
import { CustomerProjectPage } from '@/components/customer/CustomerProjectPage'

export default function CustomerProjectRoute() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-screen-2xl px-6 py-8 text-sm text-cq-text-secondary sm:px-8 lg:px-10">
          Loading project…
        </div>
      }
    >
      <CustomerProjectRouteInner />
    </Suspense>
  )
}

function CustomerProjectRouteInner() {
  const params = useParams()
  const id = (params?.id as string | undefined) ?? ''
  return <CustomerProjectPage projectId={id} />
}
