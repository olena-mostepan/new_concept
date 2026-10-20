'use client'

import * as React from 'react'
import type { ReactNode } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useSearchParams } from 'next/navigation'
import { AlertCircle, ArrowLeft, ChevronDown, Globe } from 'lucide-react'
import { SupplierNav } from '@/components/supplier/SupplierNav'
import { pageTitleClass } from '@/lib/ui/headings'
import {
  BEKA_SOLAR_PROFILE,
  normalizeSupplierProfile,
} from '@/lib/supplier/profile/mock-data'
import { computeProfileScore } from '@/lib/supplier/profile/scoring'

type Variant = 'full' | 'minimal'

function pageTitle(pathname: string, screenTab: string | null): string {
  if (pathname.startsWith('/supplier/tenders')) {
    return 'Tenders'
  }
  if (
    pathname.startsWith('/supplier/questions') ||
    screenTab === 'questions' ||
    screenTab === 'qa' ||
    screenTab === 'clarifications' ||
    screenTab === 'bid-clarifications'
  ) {
    return 'Questions'
  }
  if (
    pathname.startsWith('/supplier/delivery') ||
    pathname.startsWith('/supplier/jobs') ||
    pathname.startsWith('/supplier/projects')
  ) {
    return 'Delivery'
  }
  if (pathname.startsWith('/supplier/profile')) {
    return 'Company Profile'
  }
  return 'Overview'
}

function CQuelMark() {
  return (
    <Link href="/supplier" className="shrink-0 hover:opacity-80">
      <span className="text-sm text-cq-text-secondary">Powered by </span>
      <span className="text-sm font-semibold text-cq-text">CQuel</span>
    </Link>
  )
}

const PROFILE_SCORE_DATA = computeProfileScore(
  normalizeSupplierProfile(BEKA_SOLAR_PROFILE),
)

function CompanyProfileRing({
  percent,
  needsAttention,
}: {
  percent: number
  needsAttention: boolean
}) {
  return (
    <Link
      href="/supplier/profile"
      className="group inline-flex items-center gap-3 rounded-lg py-1 pr-1 transition-opacity hover:opacity-80"
      title={
        needsAttention
          ? `Company profile · ${percent}% complete — needs attention`
          : `Company profile · ${percent}% complete`
      }
    >
      <span className="text-sm font-normal text-cq-text-secondary group-hover:text-cq-text">
        Company Profile
      </span>
      <span className="relative shrink-0">
        <span
          className="flex h-10 w-10 items-center justify-center rounded-full"
          style={{
            background: `conic-gradient(var(--cq-green) ${percent * 3.6}deg, var(--cq-border) 0deg)`,
          }}
          aria-hidden
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-text-primary p7">
            {percent}%
          </span>
        </span>
        {needsAttention ? (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--cq-green)] text-white">
            <AlertCircle className="h-3 w-3" aria-hidden />
            <span className="sr-only">Needs attention</span>
          </span>
        ) : null}
      </span>
    </Link>
  )
}

function LanguageAndAccount() {
  return (
    <>
      <button
        type="button"
        className="inline-flex items-center gap-2 text-sm font-normal text-cq-text-secondary hover:text-cq-text"
        title="Language"
      >
        <Globe className="h-4 w-4" aria-hidden />
        EN
      </button>
      <button
        type="button"
        className="inline-flex items-center gap-1.5 text-cq-text-secondary hover:text-cq-text"
        title="Account"
      >
        <Image
          src="/site elements/profile.svg"
          alt=""
          width={32}
          height={32}
          className="rounded-full"
        />
        <ChevronDown className="h-4 w-4" aria-hidden />
      </button>
    </>
  )
}

function HeaderActions() {
  const needsAttention =
    PROFILE_SCORE_DATA.pendingCount > 0 ||
    PROFILE_SCORE_DATA.verifiedCount < PROFILE_SCORE_DATA.totalFields

  return (
    <div className="flex flex-wrap items-center justify-end gap-5 sm:gap-7">
      <CompanyProfileRing
        percent={PROFILE_SCORE_DATA.overall}
        needsAttention={needsAttention}
      />
      <LanguageAndAccount />
    </div>
  )
}

function isJobDetailRoute(pathname: string): boolean {
  return pathname.startsWith('/supplier/jobs/')
}

/** Job detail chrome: ← Back · same Company Profile ring / EN / avatar as main */
function JobDetailHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-cq-border bg-white">
      <div className="mx-auto flex w-full max-w-screen-2xl items-center justify-between gap-3 px-6 py-3.5 sm:px-8 lg:px-10">
        <Link
          href="/supplier/delivery"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-cq-text hover:opacity-80"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back
        </Link>
        <HeaderActions />
      </div>
    </header>
  )
}

function HeaderBar({
  title,
  showNav,
  pathname,
}: {
  title: string
  showNav: boolean
  pathname: string
}) {
  if (isJobDetailRoute(pathname)) {
    return <JobDetailHeader />
  }

  return (
    <header className="sticky top-0 z-40 border-b border-cq-border bg-white">
      <div className="mx-auto w-full max-w-screen-2xl px-6 py-3.5 sm:px-8 lg:px-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-4 sm:gap-6">
            <CQuelMark />
            <h1 className={pageTitleClass}>{title}</h1>
          </div>
          <HeaderActions />
        </div>
      </div>
      {showNav ? <SupplierNav pathname={pathname} /> : null}
    </header>
  )
}

function ChromeWithSearchParams({
  children,
  variant,
  pathname,
}: {
  children: ReactNode
  variant: Variant
  pathname: string
}) {
  const searchParams = useSearchParams()
  const screenTab = searchParams?.get('tab') ?? null
  const title = pageTitle(pathname, screenTab)

  return (
    <div className="min-h-screen bg-cq-bg">
      <HeaderBar
        title={title}
        showNav={variant === 'full'}
        pathname={pathname}
      />
      <main className="scroll-mt-20 pb-12">{children}</main>
    </div>
  )
}

export function SupplierPortalChrome({
  children,
  variant = 'full',
}: {
  children: ReactNode
  variant?: Variant
}) {
  const pathname = usePathname() ?? ''

  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-cq-bg">
          <HeaderBar
            title={pageTitle(pathname, null)}
            showNav={variant === 'full'}
            pathname={pathname}
          />
          <main className="scroll-mt-20 pb-12">{children}</main>
        </div>
      }
    >
      <ChromeWithSearchParams variant={variant} pathname={pathname}>
        {children}
      </ChromeWithSearchParams>
    </React.Suspense>
  )
}
