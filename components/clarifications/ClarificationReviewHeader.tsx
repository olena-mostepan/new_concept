'use client'

import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { TenderDetailHeader } from '@/components/clarifications/TenderDetailHeader'
import { cn } from '@/lib/utils'
import type { Clarification } from '@/lib/clarifications/types'
import { clarificationSiteAddress } from '@/lib/clarifications/site-address'

const btnNav =
  'inline-flex items-center gap-1.5 rounded-lg border border-cq-border bg-white px-3 py-2 text-sm font-bold text-cq-text hover:bg-cq-bg disabled:pointer-events-none disabled:opacity-40'

function NavButtons({
  prev,
  next,
}: {
  prev: Clarification | null
  next: Clarification | null
}) {
  return (
    <div className="flex shrink-0 items-center gap-2">
      {prev ? (
        <Link
          href={`/clarifications/${prev.id}`}
          className={btnNav}
          aria-label={`Previous supplier: ${prev.supplier}`}
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
          Previous
        </Link>
      ) : (
        <span className={cn(btnNav, 'opacity-40')} aria-disabled>
          <ChevronLeft className="h-4 w-4" aria-hidden />
          Previous
        </span>
      )}
      {next ? (
        <Link
          href={`/clarifications/${next.id}`}
          className={btnNav}
          aria-label={`Next supplier: ${next.supplier}`}
        >
          Next
          <ChevronRight className="h-4 w-4" aria-hidden />
        </Link>
      ) : (
        <span className={cn(btnNav, 'opacity-40')} aria-disabled>
          Next
          <ChevronRight className="h-4 w-4" aria-hidden />
        </span>
      )}
    </div>
  )
}

export function ClarificationReviewHeader({
  item,
  prev,
  next,
  index,
  total,
}: {
  item: Clarification
  prev: Clarification | null
  next: Clarification | null
  index: number
  total: number
}) {
  const position = index >= 0 ? index + 1 : 1
  const multiDispatch = total > 1
  const address = clarificationSiteAddress(item)

  return (
    <TenderDetailHeader
      project={item.project}
      address={address}
      meta={<p className="text-sm text-cq-text-secondary">Raised {item.raisedAgo}</p>}
      footer={
        <>
          <div className="min-w-0">
            {multiDispatch ? (
              <p className="text-sm font-semibold text-cq-text">
                <span className="tabular-nums">
                  {position} of {total}
                </span>
                <span className="text-cq-text-secondary"> · </span>
                {item.supplier}
                {!item.reply ? (
                  <span className="font-medium text-cq-text-secondary"> (no reply yet)</span>
                ) : null}
              </p>
            ) : (
              <p className="text-sm font-semibold text-cq-text">{item.supplier}</p>
            )}
          </div>
          {multiDispatch ? <NavButtons prev={prev} next={next} /> : null}
        </>
      }
      footerClassName={cn(!multiDispatch && 'sm:items-start')}
    />
  )
}
