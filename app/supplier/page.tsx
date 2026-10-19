'use client'

import { CashComingUp } from '@/components/supplier/CashComingUp'
import { ComplianceReviewBanner } from '@/components/supplier/ComplianceReviewBanner'
import { HeroStats } from '@/components/supplier/HeroStats'
import { RecentActivity } from '@/components/supplier/RecentActivity'

export default function SupplierOverviewPage() {
  return (
    <div className="mx-auto w-full max-w-screen-2xl px-6 py-8 sm:px-8 lg:px-10">
      <ComplianceReviewBanner />
      <HeroStats />

      <div className="mt-6 grid gap-4 lg:mt-8 lg:grid-cols-2 lg:gap-5">
        <CashComingUp />
        <RecentActivity />
      </div>
    </div>
  )
}
