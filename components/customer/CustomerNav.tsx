'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'

export type CustomerNavTab =
  | 'portfolio'
  | 'all-projects'
  | 'briefs'
  | 'tenders'
  | 'surveys'
  | 'contracts'
  | 'delivery'
  | 'questions'

const TABS: Array<{
  id: CustomerNavTab
  label: string
  href?: string
}> = [
  { id: 'portfolio', label: 'Portfolio', href: '/customer' },
  { id: 'all-projects', label: 'All Projects', href: '/customer/projects' },
  { id: 'briefs', label: 'Briefs' },
  { id: 'tenders', label: 'Tenders', href: '/customer/tenders' },
  { id: 'surveys', label: 'Surveys' },
  { id: 'contracts', label: 'Contracts' },
  { id: 'delivery', label: 'Delivery', href: '/customer/delivery' },
  { id: 'questions', label: 'Questions' },
]

function isTabActive(tab: (typeof TABS)[number], pathname: string): boolean {
  if (tab.id === 'portfolio') {
    return pathname === '/customer' || pathname === '/customer/'
  }
  if (tab.id === 'all-projects') {
    return pathname === '/customer/projects'
  }
  if (tab.id === 'tenders') {
    return pathname.startsWith('/customer/tenders')
  }
  if (tab.id === 'delivery') {
    return pathname.startsWith('/customer/delivery')
  }
  return false
}

export function CustomerNav({ pathname }: { pathname: string }) {
  return (
    <nav
      className="border-t border-cq-border bg-white"
      aria-label="Customer portal sections"
    >
      <div className="mx-auto flex max-w-screen-2xl gap-8 overflow-x-auto px-6 sm:gap-10 sm:px-8 lg:px-10">
        {TABS.map((tab) => {
          const active = isTabActive(tab, pathname)
          if (!tab.href) {
            return (
              <span
                key={tab.id}
                className="relative shrink-0 cursor-default whitespace-nowrap border-b-2 border-transparent py-3 text-sm font-normal text-cq-text-secondary"
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
                  ? 'border-[var(--cq-green)] font-normal text-text-primary'
                  : 'border-transparent font-normal text-cq-text-secondary hover:text-cq-text',
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
