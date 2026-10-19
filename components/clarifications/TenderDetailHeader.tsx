import type { ReactNode } from 'react'
import { Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function TenderDetailHeader({
  project,
  address,
  meta,
  footer,
  footerClassName,
}: {
  project: string
  address: string
  meta?: ReactNode
  footer?: ReactNode
  footerClassName?: string
}) {
  return (
    <header className="rounded-xl border border-cq-border bg-white p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-cq-border bg-cq-bg text-cq-text"
          aria-hidden
        >
          <Building2 className="h-5 w-5" strokeWidth={2.25} />
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-extrabold leading-tight text-cq-text sm:text-3xl">
            {project}
          </h1>
          <p className="mt-1 text-sm text-cq-text-secondary">{address}</p>
          {meta ? <div className="mt-0.5">{meta}</div> : null}
        </div>
      </div>

      {footer ? (
        <div
          className={cn(
            'mt-5 flex flex-col gap-3 border-t border-cq-border pt-5 sm:flex-row sm:items-center sm:justify-between',
            footerClassName,
          )}
        >
          {footer}
        </div>
      ) : null}
    </header>
  )
}
