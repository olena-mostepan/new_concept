'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ClarificationWorkflowSwitcher } from '@/components/shared/ClarificationWorkflowSwitcher'
import { useClarifications } from '@/lib/clarifications/store'

type DashboardTab =
  | { label: string; href: '#'; stub: true }
  | { label: string; href: '/clarifications'; activePrefix: '/clarifications' }

const DASHBOARD_TABS: DashboardTab[] = [
  { label: 'Focus here now', href: '#', stub: true },
  { label: 'All Projects', href: '#', stub: true },
  { label: 'Briefs', href: '#', stub: true },
  { label: 'Tenders', href: '#', stub: true },
  { label: 'Surveys', href: '#', stub: true },
  { label: 'Pricing', href: '#', stub: true },
  { label: 'Contracts', href: '#', stub: true },
  { label: 'Clarifications', href: '/clarifications', activePrefix: '/clarifications' },
]

export function ClarificationsTopChrome() {
  const { openRaiseModal } = useClarifications()
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-40 border-b border-cq-border bg-white">
      {/* Row 1 — LEVEL bar + dashboard title + actions */}
      <div className="mx-auto w-full max-w-screen-2xl px-6 py-4 sm:px-8 lg:px-10">
        <div className="flex flex-wrap items-center gap-y-3 md:flex-nowrap md:gap-4">
          <div className="flex min-w-0 flex-1 items-center gap-3 md:flex-[1_1_0%]">
            <Link
              href="/"
              className="text-xl font-semibold tracking-tight text-cq-text hover:opacity-80 md:text-2xl"
            >
              LEVEL
            </Link>
            <span className="rounded-full border border-cq-border bg-cq-bg px-2.5 py-1 text-cq-text-secondary s3">
              Powered by CQuel
            </span>
          </div>

          <div className="order-last flex w-full justify-center md:order-none md:w-auto md:flex-none md:px-4">
            <h1 className="text-center text-lg font-semibold text-cq-text md:text-xl">
              Projects Dashboard
            </h1>
          </div>

          <div className="flex flex-1 flex-wrap items-center justify-end gap-2 sm:gap-3 md:flex-[1_1_0%]">
            <ClarificationWorkflowSwitcher />
            <button
              type="button"
              title="Raise a clarification"
              onClick={() => openRaiseModal(null)}
              className="btn-primary"
            >
              Start new project
            </button>
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-cq-border bg-cq-bg text-xs font-semibold text-cq-text"
              title="Profile"
            >
              P
            </span>
          </div>
        </div>
      </div>

      {/* Row 2 — primary navigation tabs */}
      <nav
        className="border-t border-cq-border bg-white"
        aria-label="Dashboard sections"
      >
        <div className="mx-auto flex max-w-screen-2xl gap-1 overflow-x-auto px-6 sm:gap-2 sm:px-8 lg:px-10">
          {DASHBOARD_TABS.map((tab) => {
            if ('stub' in tab) {
              return (
                <span
                  key={tab.label}
                  className="relative shrink-0 cursor-default whitespace-nowrap border-b-2 border-transparent px-3 py-3 text-sm font-semibold text-cq-text-secondary sm:px-4"
                  title="Prototype: tab not wired"
                >
                  {tab.label}
                </span>
              )
            }

            const active = pathname.startsWith(tab.activePrefix)
            return (
              <Link
                key={tab.label}
                href={tab.href}
                className={cn(
                  'relative shrink-0 whitespace-nowrap border-b-2 px-3 py-3 text-sm font-semibold transition-colors sm:px-4',
                  active
                    ? 'border-[var(--cq-green)] text-cq-text'
                    : 'border-transparent text-cq-text-secondary hover:text-cq-text',
                )}
              >
                {tab.label}
              </Link>
            )
          })}
        </div>
      </nav>
    </header>
  )
}

/** Search + filter row used on the clarifications list only */
export function ClarificationsListToolbar({
  searchPlaceholder = 'Search clarifications…',
}: {
  searchPlaceholder?: string
}) {
  return (
    <div className="mx-auto mb-8 flex w-full max-w-screen-2xl flex-col gap-3 px-6 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
      <div className="relative min-w-0 flex-1 max-w-xl">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cq-muted" />
        <input
          type="search"
          placeholder={searchPlaceholder}
          className="w-full rounded-lg border border-cq-border bg-white py-2.5 pl-10 pr-4 text-sm text-cq-text placeholder:text-cq-muted outline-none focus:border-cq-text focus:ring-1 focus:ring-cq-text/10"
          aria-label="Search clarifications"
          readOnly
        />
      </div>
      <button
        type="button"
        className="btn-secondary"
        title="Prototype only"
      >
        Filter by: Status
      </button>
    </div>
  )
}
