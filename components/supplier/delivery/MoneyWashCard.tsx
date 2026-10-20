'use client'

import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/** Shared peach wash + accent border + soft blobs — same shell as the job money strip. */
export function MoneyWashCard({
  children,
  className,
  as: Tag = 'section',
}: {
  children: ReactNode
  className?: string
  as?: 'section' | 'div' | 'article'
}) {
  return (
    <Tag
      className={cn(
        'relative overflow-hidden rounded-xl border border-[var(--cq-green)]/35 bg-gradient-to-br from-[var(--cq-accent-muted)] via-[var(--cq-accent-muted)]/50 to-white px-5 py-5  sm:px-6',
        className,
      )}
    >
      <div
        className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-[var(--cq-green)]/15"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-14 -left-10 h-32 w-32 rounded-full bg-[var(--cq-green)]/10"
        aria-hidden
      />
      <div className="relative">{children}</div>
    </Tag>
  )
}
