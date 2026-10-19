'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowLeft, ChevronDown, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { CustomerNav } from '@/components/customer/CustomerNav'

function EnergiseMark() {
  return (
    <Link
      href="/customer"
      className="flex shrink-0 flex-col leading-tight hover:opacity-80"
    >
      <span className="text-sm font-extrabold tracking-tight text-cq-text">
        Energise
      </span>
      <span className="text-xs text-cq-text-secondary">
        Powered by <span className="font-extrabold text-cq-text">CQuel</span>
      </span>
    </Link>
  )
}

function HeaderActions() {
  return (
    <div className="flex flex-wrap items-center justify-end gap-5 sm:gap-7">
      <Link
        href="/customer/delivery"
        className="text-sm font-medium text-cq-text-secondary hover:text-cq-text"
      >
        Questions
      </Link>
      <button
        type="button"
        className="btn-secondary gap-3"
        onClick={() =>
          toast.message('Report generation opens here in production')
        }
      >
        <Plus className="h-4 w-4 shrink-0" aria-hidden />
        Generate report
      </button>
      <button
        type="button"
        className="inline-flex items-center gap-1.5 text-cq-text-secondary hover:text-cq-text"
        title="Account"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full border border-cq-border bg-cq-bg text-xs font-semibold text-cq-text">
          D
        </span>
        <ChevronDown className="h-4 w-4" aria-hidden />
      </button>
    </div>
  )
}

function isProjectDetailRoute(pathname: string): boolean {
  return pathname.startsWith('/customer/projects/')
}

/** Project detail chrome: ← Back · same actions as main (no section nav) */
function ProjectDetailHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-cq-border bg-white">
      <div className="mx-auto flex w-full max-w-screen-2xl items-center justify-between gap-3 px-6 py-3.5 sm:px-8 lg:px-10">
        <Link
          href="/customer/delivery"
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

export function CustomerPortalChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? ''

  if (isProjectDetailRoute(pathname)) {
    return (
      <div className="min-h-screen bg-cq-bg">
        <ProjectDetailHeader />
        <main className="scroll-mt-20 pb-12">{children}</main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cq-bg">
      <header className="sticky top-0 z-40 border-b border-cq-border bg-white">
        <div className="mx-auto w-full max-w-screen-2xl px-6 py-3.5 sm:px-8 lg:px-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <EnergiseMark />
            <HeaderActions />
          </div>
        </div>
        <CustomerNav pathname={pathname} />
      </header>
      <main className="scroll-mt-20 pb-12">{children}</main>
    </div>
  )
}
