'use client'

import Link from 'next/link'
import { toast } from 'sonner'
import type { Clarification } from '@/lib/clarifications/types'
import { CourtBadge } from '@/components/clarifications/CourtBadge'
import { StatusBlock } from '@/components/clarifications/StatusBlock'
import {
  courtFromPerspective,
  courtLabel,
  sectionFromPerspective,
  type Perspective,
} from '@/lib/clarifications/perspective'

function opsNeedsAttentionPrimaryHref(c: Clarification): string | null {
  const sec = sectionFromPerspective(c, 'ops')
  if (sec !== 'needs_attention') return null
  if (c.status === 'review' || c.status === 'need_response') {
    return `/clarifications/${c.id}`
  }
  return null
}

function supplierNeedsAttentionHref(c: Clarification): string | null {
  const sec = sectionFromPerspective(c, 'supplier')
  if (sec !== 'needs_attention') return null
  return `/supplier/clarifications/${c.id}`
}

function opsPrimaryLabel(status: Clarification['status']): string {
  if (status === 'need_response') return 'Respond'
  return 'Review'
}

function rowContextLine(c: Clarification): string {
  return `${c.bidLabel} · ${c.project} · ${c.raisedAgo}`
}

const btnGhost =
  'inline-flex shrink-0 items-center justify-center rounded-lg border border-cq-border bg-white px-3 py-1.5 text-xs font-bold text-cq-text hover:bg-cq-bg/70'
const btnPrimaryDark =
  'inline-flex shrink-0 items-center justify-center rounded-lg bg-cq-text px-3 py-1.5 text-xs font-bold text-white hover:opacity-90'

export function ClarificationRow({
  item,
  perspective,
}: {
  item: Clarification
  perspective: Perspective
}) {
  const section = sectionFromPerspective(item, perspective)
  const badgeLabel = courtLabel(courtFromPerspective(item, perspective), perspective)

  const hrefOpsReview = opsNeedsAttentionPrimaryHref(item)
  const hrefSupplierReply = supplierNeedsAttentionHref(item)

  const viewProjectHref =
    perspective === 'supplier' ? `/supplier/clarifications/${item.id}` : '/supplier-comparison'

  const showNudge =
    perspective === 'ops' && section === 'in_progress' && item.overdue

  const primaryHref =
    perspective === 'ops' ? hrefOpsReview : hrefSupplierReply
  const primaryLabel =
    perspective === 'ops' ? opsPrimaryLabel(item.status) : 'Reply'

  return (
    <div className="flex flex-col gap-3 py-3 lg:flex-row lg:items-start lg:justify-between lg:gap-6 lg:py-4">
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-bold leading-snug text-cq-text">{item.title}</p>
          <CourtBadge
            label={badgeLabel}
            variant={perspective === 'supplier' ? 'supplier' : 'ops'}
          />
        </div>
        <p className="text-sm text-cq-text-secondary">{rowContextLine(item)}</p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between lg:flex-col lg:items-end xl:flex-row xl:items-start">
        <StatusBlock item={item} perspective={perspective} align="right" />
        <div className="flex flex-wrap items-center gap-2">
          {perspective === 'ops' ? (
            <>
              {section === 'needs_attention' && primaryHref ? (
                <Link href={primaryHref} className={btnPrimaryDark}>
                  {primaryLabel}
                </Link>
              ) : null}
              {showNudge ? (
                <button
                  type="button"
                  className={btnGhost}
                  onClick={() =>
                    toast('Nudge sent', {
                      description: 'Supplier will receive a reminder.',
                    })
                  }
                >
                  Nudge
                </button>
              ) : null}
              <Link href={viewProjectHref} className={btnGhost}>
                View Project
              </Link>
            </>
          ) : (
            <>
              {section === 'needs_attention' && primaryHref ? (
                <Link href={primaryHref} className={btnPrimaryDark}>
                  {primaryLabel}
                </Link>
              ) : null}
              <Link href={viewProjectHref} className={btnGhost}>
                View Project
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
