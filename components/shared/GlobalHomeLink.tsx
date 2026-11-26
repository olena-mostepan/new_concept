'use client'

import { usePathname } from 'next/navigation'
import { BackToHomeButton } from '@/components/shared/BackToHomeButton'
import { ViewSwitch } from '@/components/concept/ViewSwitch'

/** Internal prototype control — sits above product chrome, not inside it. */
export function GlobalHomeLink() {
  const pathname = usePathname() ?? ''
  if (pathname === '/') return null
  // Test sessions use the customer version: Home would take participants out of it (Philippa, 26 Nov).
  if (pathname.startsWith('/concept/customer')) return null
  // Ops (/concept) has the prototype bar with the View switch instead (26 Nov).
  if (pathname.startsWith('/concept') && !pathname.startsWith('/concept/supplier')) return null

  return (
    <div className="border-b border-cq-border bg-cq-bg">
      <div className="mx-auto flex w-full max-w-screen-2xl items-center gap-6 px-6 py-2 sm:px-8 lg:px-10">
        <BackToHomeButton />
        {/* The supplier pages have no prototype bar of their own: the view switch lives here. */}
        {pathname.startsWith('/concept/supplier') && <ViewSwitch />}
      </div>
    </div>
  )
}
