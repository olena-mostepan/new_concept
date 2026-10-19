'use client'

import { ClarificationsDashboard } from '@/components/clarifications/ClarificationsDashboard'
import { ClarificationsListToolbar } from '@/components/clarifications/ClarificationsChrome'

export default function SupplierClarificationsPage() {
  return (
    <>
      <div className="mx-auto w-full max-w-screen-2xl px-6 pb-4 pt-8 sm:px-8 lg:px-10">
        <p className="text-sm text-cq-text-secondary">
          Questions from your buyer via CQuel — replies sync to the ops dashboard for review and acceptance.
        </p>
      </div>

      <ClarificationsListToolbar searchPlaceholder="Search clarifications… (prototype)" />

      <ClarificationsDashboard perspective="supplier" />
    </>
  )
}
