'use client'

import * as React from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'

export type SupplierNavTab =
  | 'overview'
  | 'tenders'
  | 'questions'
  | 'surveys'
  | 'contracts'
  | 'delivery'

const TABS: Array<{
  id: SupplierNavTab
  label: string
  href?: string
  activePrefix?: string
}> = [
  { id: 'overview', label: 'Overview', href: '/supplier' },
  {
    id: 'tenders',
    label: 'Tenders',
    href: '/supplier/tenders',
    activePrefix: '/supplier/tenders',
  },
  {
    id: 'questions',
    label: 'Questions',
    href: '/supplier/questions',
    activePrefix: '/supplier/questions',
  },
  { id: 'surveys', label: 'Surveys' },
  { id: 'contracts', label: 'Contracts' },
  {
    id: 'delivery',
    label: 'Delivery',
    href: '/supplier/delivery',
    activePrefix: '/supplier/delivery',
  },
]

function isTabActive(
  tab: (typeof TABS)[number],
  pathname: string,
  screenTab: string | null,
): boolean {
  if (tab.id === 'overview') {
    return pathname === '/supplier' || pathname === '/supplier/'
  }
  if (tab.id === 'tenders') {
    return pathname.startsWith('/supplier/tenders')
  }
  if (tab.id === 'questions') {
    return (
      pathname.startsWith('/supplier/questions') ||
      screenTab === 'questions' ||
      screenTab === 'qa' ||
      screenTab === 'clarifications' ||
      screenTab === 'bid-clarifications'
    )
  }
  if (tab.id === 'delivery') {
    return (
      pathname.startsWith('/supplier/delivery') ||
      pathname.startsWith('/supplier/jobs')
    )
  }
  if (tab.activePrefix) {
    return pathname.startsWith(tab.activePrefix)
  }
  return false
}

/** Same underline tab strip pattern as `ClarificationsTopChrome` (ops). */
function SupplierNavContent({
  pathname,
  screenTab,
}: {
  pathname: string
  screenTab: string | null
}) {
  return (
    <nav
      className="border-t border-cq-border bg-white"
      aria-label="Supplier portal sections"
    >
      <div className="mx-auto flex max-w-screen-2xl gap-5 overflow-x-auto px-6 sm:gap-7 sm:px-8 lg:px-10">
        {TABS.map((tab) => {
          const active = isTabActive(tab, pathname, screenTab)
          if (!tab.href) {
            return (
              <span
                key={tab.id}
                className="relative shrink-0 cursor-default whitespace-nowrap border-b-2 border-transparent py-3 text-sm font-medium text-cq-text-secondary"
                title="Prototype: tab not wired"
              >
                {tab.label}
              </span>
            )
          }
          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={cn(
                'relative shrink-0 whitespace-nowrap border-b-2 py-3 text-sm transition-colors',
                active
                  ? 'border-[var(--cq-green)] font-medium text-black'
                  : 'border-transparent font-medium text-cq-text-secondary hover:text-cq-text',
              )}
            >
              {tab.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

function SupplierNavWithSearchParams({ pathname }: { pathname: string }) {
  const searchParams = useSearchParams()
  const screenTab = searchParams?.get('tab') ?? null
  return <SupplierNavContent pathname={pathname} screenTab={screenTab} />
}

/** Same underline tab strip pattern as `ClarificationsTopChrome` (ops). */
export function SupplierNav({ pathname }: { pathname: string }) {
  return (
    <React.Suspense
      fallback={<SupplierNavContent pathname={pathname} screenTab={null} />}
    >
      <SupplierNavWithSearchParams pathname={pathname} />
    </React.Suspense>
  )
}
