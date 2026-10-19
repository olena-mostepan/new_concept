'use client'

import Link from 'next/link'
import type { DispatchGroup } from '@/lib/clarifications/dispatch-groups'
import {
  dispatchSupplierSummaryLabel,
  lastAnswerLabel,
  primaryMemberForDispatchGroup,
} from '@/lib/clarifications/dispatch-groups'
import { sectionFromPerspective, type Perspective } from '@/lib/clarifications/perspective'

const btnGhost =
  'inline-flex shrink-0 items-center justify-center rounded-lg border border-cq-border bg-white px-4 py-2 text-sm font-bold text-cq-text hover:bg-cq-bg/70'
const btnReview =
  'inline-flex shrink-0 items-center justify-center rounded-lg bg-cq-text px-4 py-2 text-sm font-bold text-white hover:opacity-90'

export function DispatchClarificationRow({
  group,
  perspective,
}: {
  group: DispatchGroup
  perspective: Perspective
}) {
  const primary = primaryMemberForDispatchGroup(group, perspective)
  const section = sectionFromPerspective(primary, perspective)
  const viewHref =
    perspective === 'ops'
      ? `/clarifications/${primary.id}`
      : `/supplier/clarifications/${primary.id}`
  const projectHref =
    perspective === 'supplier' ? viewHref : '/supplier-comparison'

  const showView =
    perspective === 'ops' || section === 'needs_attention'

  return (
    <div className="grid grid-cols-1 items-center gap-4 py-4 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,0.9fr)_auto] sm:gap-6 lg:py-5">
      <div className="min-w-0 space-y-1">
        <p className="font-bold leading-snug text-cq-text">{group.title}</p>
        <p className="text-sm">
          <span className="font-semibold text-cq-link">{group.project}</span>
          <span className="text-cq-text-secondary"> · {group.raisedAgo}</span>
        </p>
      </div>

      <div className="min-w-0 sm:text-left">
        <p className="text-sm font-semibold text-cq-text">
          {dispatchSupplierSummaryLabel(group)}
        </p>
        <p className="mt-0.5 text-sm text-cq-text-secondary">
          {lastAnswerLabel(group)}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
        <Link href={projectHref} className={btnGhost}>
          View project
        </Link>
        {showView ? (
          <Link href={viewHref} className={btnReview}>
            Review
          </Link>
        ) : null}
      </div>
    </div>
  )
}
