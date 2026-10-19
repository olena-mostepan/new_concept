'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Home } from 'lucide-react'

export function ProjectSwitcher() {
  const pathname = usePathname()

  if (pathname.startsWith('/clarifications')) {
    return null
  }

  if (pathname.startsWith('/supplier')) {
    return null
  }

  const isHome = pathname === '/' || pathname === ''
  const isSolar =
    pathname === '/supplier-comparison' ||
    (pathname.startsWith('/supplier-comparison/') &&
      !pathname.startsWith('/supplier-comparison/led'))
  const isLedBerlin =
    pathname.startsWith('/supplier-comparison/led') &&
    !pathname.startsWith('/supplier-comparison/led-rostock')
  const isLedRostock = pathname.startsWith('/supplier-comparison/led-rostock')
  const isClarifications = pathname.startsWith('/clarifications')
  const isSupplierClarifications = pathname.startsWith('/supplier/clarifications')
  const isSupplierPortal =
    pathname.startsWith('/supplier') && !isSupplierClarifications

  return (
    <div className="border-b border-cq-border bg-white">
      <div className="mx-auto flex w-full max-w-screen-2xl flex-wrap items-center justify-between gap-4 px-6 py-3 sm:px-8 lg:px-10">
        <Link
          href="/"
          className={cn(
            'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors',
            isHome
              ? 'border border-cq-border bg-cq-bg text-cq-text'
              : 'text-cq-text-secondary hover:bg-cq-bg hover:text-cq-text',
          )}
        >
          <Home className="h-4 w-4" />
          Home
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-lg border border-cq-border bg-cq-bg p-1">
            <Link
              href="/supplier-comparison"
              className={cn(
                'rounded-md px-4 py-2 text-sm font-semibold transition-colors',
                isSolar
                  ? 'border border-cq-border bg-white text-cq-text shadow-sm'
                  : 'text-cq-text-secondary hover:text-cq-text',
              )}
            >
              Solar project
            </Link>
            <Link
              href="/supplier-comparison/led"
              className={cn(
                'rounded-md px-4 py-2 text-sm font-semibold transition-colors',
                isLedBerlin
                  ? 'border border-cq-border bg-white text-cq-text shadow-sm'
                  : 'text-cq-text-secondary hover:text-cq-text',
              )}
            >
              LED (Berlin)
            </Link>
            <Link
              href="/supplier-comparison/led-rostock"
              className={cn(
                'rounded-md px-4 py-2 text-sm font-semibold transition-colors',
                isLedRostock
                  ? 'border border-cq-border bg-white text-cq-text shadow-sm'
                  : 'text-cq-text-secondary hover:text-cq-text',
              )}
            >
              LED (Rostock)
            </Link>
          </div>
          <div className="inline-flex flex-wrap rounded-lg border border-cq-border bg-cq-bg p-1">
            <Link
              href="/clarifications"
              className={cn(
                'rounded-md px-4 py-2 text-sm font-semibold transition-colors',
                isClarifications
                  ? 'border border-cq-border bg-white text-cq-text shadow-sm'
                  : 'text-cq-text-secondary hover:text-cq-text',
              )}
            >
              Clarifications (ops)
            </Link>
            <Link
              href="/supplier/clarifications"
              className={cn(
                'rounded-md px-4 py-2 text-sm font-semibold transition-colors',
                isSupplierClarifications
                  ? 'border border-cq-border bg-white text-cq-text shadow-sm'
                  : 'text-cq-text-secondary hover:text-cq-text',
              )}
            >
              Supplier clarifications
            </Link>
            <Link
              href="/supplier"
              className={cn(
                'rounded-md px-4 py-2 text-sm font-semibold transition-colors',
                isSupplierPortal
                  ? 'border border-cq-border bg-white text-cq-text shadow-sm'
                  : 'text-cq-text-secondary hover:text-cq-text',
              )}
            >
              Supplier home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
