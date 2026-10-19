'use client'

import type { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { SupplierPortalChrome } from '@/components/supplier/SupplierPortalChrome'
import { SupplierQuestionsProvider } from '@/lib/supplier/questions/store'

function isAnswerDetailRoute(pathname: string): boolean {
  const parts = pathname.split('/').filter(Boolean)
  return (
    parts.length === 3 &&
    parts[0] === 'supplier' &&
    parts[1] === 'clarifications' &&
    parts[2] !== ''
  )
}

function isProfileRoute(pathname: string): boolean {
  return pathname === '/supplier/profile' || pathname.startsWith('/supplier/profile/')
}

export default function SupplierLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? ''

  if (isProfileRoute(pathname)) {
    return <SupplierQuestionsProvider>{children}</SupplierQuestionsProvider>
  }

  const variant = isAnswerDetailRoute(pathname) ? 'minimal' : 'full'

  return (
    <SupplierQuestionsProvider>
      <SupplierPortalChrome variant={variant}>{children}</SupplierPortalChrome>
    </SupplierQuestionsProvider>
  )
}
