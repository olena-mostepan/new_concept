'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { ChevronDown, ChevronLeft } from 'lucide-react'

function ProfileAvatar() {
  return (
    <button
      type="button"
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-cq-border bg-cq-bg text-xs font-semibold text-cq-text"
      title="Account menu"
    >
      P
    </button>
  )
}

export function SupplierProfileChrome({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-cq-bg">
      <header className="sticky top-0 z-40 border-b border-cq-border bg-white">
        <div className="mx-auto max-w-screen-2xl px-6 py-4 sm:px-8 lg:px-10">
          <div className="flex items-center justify-between gap-4">
            <Link
              href="/supplier"
              className="inline-flex items-center gap-1 text-sm font-semibold text-cq-text-secondary hover:text-cq-text"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden />
              Back to dashboard
            </Link>
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-md border border-cq-border px-2.5 py-1.5 text-xs font-semibold text-cq-text"
              >
                English
                <ChevronDown className="h-3.5 w-3.5 text-cq-text-secondary" aria-hidden />
              </button>
              <ProfileAvatar />
            </div>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  )
}
