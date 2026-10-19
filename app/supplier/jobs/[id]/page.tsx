'use client'

import { Suspense } from 'react'
import { useParams } from 'next/navigation'
import { SupplierJobPage } from '@/components/supplier/delivery/SupplierJobPage'

export default function SupplierJobDeliveryPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-screen-2xl px-6 py-8 sm:px-8 lg:px-10">
          <div className="h-28 animate-pulse rounded-xl border border-cq-border bg-white" />
        </div>
      }
    >
      <SupplierJobDeliveryPageInner />
    </Suspense>
  )
}

function SupplierJobDeliveryPageInner() {
  const params = useParams()
  const id = (params?.id as string | undefined) ?? ''

  return (
    <div className="mx-auto w-full max-w-screen-2xl px-6 py-8 sm:px-8 lg:px-10">
      <SupplierJobPage jobId={id} />
    </div>
  )
}
