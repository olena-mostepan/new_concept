'use client'

import Link from 'next/link'
import { toast } from 'sonner'
import type { FocusItem } from '@/lib/clarifications/types'
import { cn } from '@/lib/utils'

const pillBase =
  'inline-flex rounded-md border border-cq-border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-cq-text-secondary'

function kindPill(kind: FocusItem['kind']) {
  if (kind === 'question') return 'QUESTION'
  if (kind === 'bid_update') return 'BID UPDATE'
  return 'PROFILE'
}

export function FocusItemCard({ item }: { item: FocusItem }) {
  const href =
    item.clarificationId != null
      ? '/supplier/questions'
      : undefined

  const noop = (msg: string) => () => toast.message(msg)

  return (
    <div className="flex flex-col rounded-2xl border border-cq-border border-l-[3px] border-l-[var(--cq-green)] bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-2">
        <span className={pillBase}>{kindPill(item.kind)}</span>
        <span className="flex shrink-0 items-center gap-2">
          {item.overdue ? (
            <span className="rounded-md bg-cq-amber-bg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-cq-text">
              Overdue
            </span>
          ) : null}
          <span className="text-xs font-semibold text-cq-text-secondary">{item.ageLabel}</span>
        </span>
      </div>
      <p className="text-base font-bold leading-snug text-cq-text">{item.title}</p>
      <p className="mt-1 text-sm text-cq-text-secondary">{item.contextLine}</p>

      <div className={cn('mt-6 flex gap-2', item.kind !== 'question' && 'flex-col')}>
        {item.kind === 'question' && href ? (
          <>
            <Link href={href} className="btn-secondary flex-1">
              Go to project
            </Link>
            <Link href={href} className="btn-primary flex-1">
              Answer question
            </Link>
          </>
        ) : null}
        {item.kind === 'bid_update' ? (
          <button type="button" className="btn-primary w-full" onClick={noop('Bid update flow not wired in prototype.')}>
            Go to project
          </button>
        ) : null}
        {item.kind === 'profile' ? (
          <button type="button" className="btn-primary w-full" onClick={noop('Profile flow not wired in prototype.')}>
            Go to profile
          </button>
        ) : null}
      </div>
    </div>
  )
}
