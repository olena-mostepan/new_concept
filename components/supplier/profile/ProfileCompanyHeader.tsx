'use client'

import { BadgeCheck } from 'lucide-react'
import type { SupplierProfileData } from '@/lib/supplier/profile/types'
import { pageTitleClass } from '@/lib/ui/headings'

export function AccountVerifiedBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1">
      <BadgeCheck className="h-3.5 w-3.5 text-emerald-600" aria-hidden />
      <span className="text-xs font-semibold text-emerald-800">Profile verified</span>
    </span>
  )
}

export function ProfileCompanyHeader({
  profile,
  verified,
}: {
  profile: SupplierProfileData
  verified: boolean
}) {
  const name = profile.companyName.value || 'Company profile'
  const logo = profile.logoUrl.value

  return (
    <div className="border-b border-cq-border bg-white">
      <div className="mx-auto flex max-w-screen-2xl items-center gap-4 px-6 py-5 sm:px-8 lg:px-10">
        {logo ? (
          <img
            src={String(logo)}
            alt=""
            className="h-14 w-14 shrink-0 rounded-xl border border-cq-border bg-white object-contain p-1"
          />
        ) : (
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-cq-border bg-cq-bg text-xl font-semibold text-cq-text-secondary"
            aria-hidden
          >
            {name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <h1 className={pageTitleClass}>{name}</h1>
          {verified && <AccountVerifiedBadge />}
        </div>
      </div>
    </div>
  )
}
