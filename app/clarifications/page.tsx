'use client'

import { ClarificationsDashboard } from '@/components/clarifications/ClarificationsDashboard'
import { ClarificationsListToolbar } from '@/components/clarifications/ClarificationsChrome'

export default function ClarificationsDashboardPage() {
  return (
    <>
      <div className="mx-auto w-full max-w-screen-2xl px-6 pb-4 pt-8 sm:px-8 lg:px-10">
        <p className="text-sm text-cq-text-secondary">
          Supplier clarifications for active tenders — raise questions from{' '}
          <span className="font-semibold text-cq-text">Solar comparison</span> or use{' '}
          <span className="font-semibold text-cq-text">Start new project</span> above.
        </p>
      </div>

      <ClarificationsListToolbar searchPlaceholder="Search clarifications… (prototype)" />

      <ClarificationsDashboard perspective="ops" />
    </>
  )
}
