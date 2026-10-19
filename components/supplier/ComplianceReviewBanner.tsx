'use client'

import * as React from 'react'
import Link from 'next/link'
import { AlertCircle, X } from 'lucide-react'
import {
  getComplianceNeedsReview,
  setComplianceBannerDismissed,
  getComplianceBannerDismissed,
  subscribeComplianceNeedsReview,
} from '@/lib/supplier/compliance-review'

/**
 * Overview-only nudge when the supplier org needs to review compliance details.
 * Dismiss (×) is session-only and does not clear `complianceNeedsReview`.
 */
export function ComplianceReviewBanner() {
  const [needsReview, setNeedsReview] = React.useState(true)
  const [dismissed, setDismissed] = React.useState(false)

  React.useEffect(() => {
    setNeedsReview(getComplianceNeedsReview())
    setDismissed(getComplianceBannerDismissed())
    return subscribeComplianceNeedsReview(() => {
      setNeedsReview(getComplianceNeedsReview())
      setDismissed(getComplianceBannerDismissed())
    })
  }, [])

  if (!needsReview || dismissed) return null

  return (
    <div
      role="status"
      className="mb-6 flex flex-col gap-3 rounded-xl border border-[#ffcccc] bg-[#fff0f0] px-4 py-3.5 sm:mb-8 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-5"
    >
      <div className="flex min-w-0 items-start gap-3">
        <AlertCircle
          className="mt-0.5 h-5 w-5 shrink-0 text-[#FF0000]"
          aria-hidden
        />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-cq-text">
            Your compliance details may be out of date
          </p>
          <p className="mt-0.5 text-sm leading-snug text-cq-text-secondary">
            It&apos;s been a while since these were last reviewed, and clients
            see them before they see your bid.
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center justify-end gap-2 sm:pl-2">
        <Link
          href="/supplier/profile?tab=financial"
          className="rounded-md border border-[#FF0000] bg-transparent px-3.5 py-2 text-sm font-semibold text-[#FF0000] transition-colors hover:bg-[#ffe0e0]"
        >
          Review now
        </Link>
        <button
          type="button"
          onClick={() => {
            setComplianceBannerDismissed()
            setDismissed(true)
          }}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md text-cq-text-secondary transition-colors hover:bg-[#ffe0e0] hover:text-cq-text"
          aria-label="Dismiss for this session"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  )
}
