'use client'

import type { ReactNode } from 'react'
import { ClarificationsTopChrome } from '@/components/clarifications/ClarificationsChrome'

export default function ClarificationsSegmentLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="min-h-screen bg-white">
      <ClarificationsTopChrome />
      <div className="border-b border-cq-border bg-cq-bg/40">{children}</div>
    </div>
  )
}
