'use client'

import Link from 'next/link'
import { FileUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DeliveryClaim } from '@/lib/supplier/delivery/types'
import { claimNarrative } from '@/lib/supplier/delivery/claim-copy'
import { ClaimStageDiagram } from '@/components/supplier/delivery/ClaimStageDiagram'

export type ClaimReviewActions = {
  onChangeDate: () => void
  onLooksFine: () => void
  onSkip?: () => void
}

function ClaimActions({
  claim,
  inReviewFocus,
  reviewDimmed,
  reviewActions,
  onLooksRight,
  onChangeDate,
}: {
  claim: DeliveryClaim
  inReviewFocus: boolean
  reviewDimmed: boolean
  reviewActions?: ClaimReviewActions
  onLooksRight: (claim: DeliveryClaim) => void
  onChangeDate: (claim: DeliveryClaim) => void
}) {
  if (reviewDimmed) return null

  if (claim.status === 'confirmed' || claim.status === 'settled') {
    return (
      <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-medium capitalize text-emerald-800">
        paid
      </span>
    )
  }

  if (inReviewFocus && reviewActions) {
    return (
      <>
        <button
          type="button"
          className="btn-primary-sm"
          onClick={reviewActions.onLooksFine}
        >
          Looks fine
        </button>
        <button
          type="button"
          className="btn-secondary-sm"
          onClick={reviewActions.onChangeDate}
        >
          Change date
        </button>
        {reviewActions.onSkip ? (
          <button
            type="button"
            className="btn-link"
            onClick={reviewActions.onSkip}
          >
            Skip
          </button>
        ) : null}
      </>
    )
  }

  if (claim.status === 'confirmable' || claim.status === 'future') {
    return (
      <>
        <button
          type="button"
          className="btn-primary-sm"
          onClick={() => onLooksRight(claim)}
        >
          Looks right
        </button>
        <button
          type="button"
          className="btn-secondary-sm"
          onClick={() => onChangeDate(claim)}
        >
          Change date
        </button>
      </>
    )
  }

  if (claim.status === 'stuck' || claim.status === 'not_started') {
    return (
      <button
        type="button"
        className="btn-secondary-sm"
        onClick={() => onChangeDate(claim)}
      >
        Change date
      </button>
    )
  }

  return null
}

export function ClaimRow({
  claim,
  rowRef,
  onLooksRight,
  onChangeDate,
  onStageClick,
  onProvideInvoice,
  reviewHighlighted = false,
  reviewDimmed = false,
  reviewActions,
}: {
  claim: DeliveryClaim
  rowRef?: (el: HTMLLIElement | null) => void
  onLooksRight: (claim: DeliveryClaim) => void
  onChangeDate: (claim: DeliveryClaim) => void
  onStageClick?: (claim: DeliveryClaim, stageName: string) => void
  onProvideInvoice: (claim: DeliveryClaim) => void
  reviewHighlighted?: boolean
  reviewDimmed?: boolean
  reviewActions?: ClaimReviewActions
}) {
  const { claimLine, moneyLine } = claimNarrative(claim)
  const jobHref = `/supplier/jobs/${claim.id}`
  const inReviewFocus = Boolean(reviewActions)
  const showInvoiceDrop = claim.status !== 'settled' && !reviewDimmed

  return (
    <li
      ref={rowRef}
      id={`claim-${claim.id}`}
      className={cn(
        'rounded-xl border bg-white px-4 py-4 sm:px-5',
        reviewHighlighted
          ? 'border-[var(--cq-green)] ring-2 ring-[var(--cq-green)]/25'
          : 'border-cq-border',
        reviewDimmed && 'opacity-40',
      )}
    >
      {/* One row: header + £ bottom-left | graph | provide invoice top-right + CTAs bottom-right */}
      <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-[minmax(10rem,0.9fr)_minmax(18rem,1.4fr)_minmax(10rem,0.9fr)] md:gap-6">
        {/* Left — job header top, money line bottom-left */}
        <div className="flex min-h-full min-w-0 flex-col justify-between gap-6">
          <div className="min-w-0">
            <Link
              href={jobHref}
              className="text-sm font-semibold text-cq-text hover:text-[var(--cq-green)] hover:underline"
            >
              {claim.job}
            </Link>
            <p className="mt-0.5 text-sm text-cq-text-secondary">
              {claimLine.replace(/\.$/, '')}
            </p>
          </div>
          <p
            className={cn(
              'text-sm font-medium',
              claim.status === 'settled' || claim.status === 'confirmed'
                ? 'text-cq-text-secondary'
                : 'text-cq-text',
            )}
          >
            {moneyLine}
          </p>
        </div>

        {/* Graph — centered, given real width so labels aren't truncated */}
        <div className="flex min-w-0 items-center justify-center">
          <ClaimStageDiagram
            stages={claim.stages}
            currentStage={claim.currentStage}
            onStageClick={
              reviewDimmed
                ? undefined
                : (stageName) =>
                    onStageClick
                      ? onStageClick(claim, stageName)
                      : onChangeDate(claim)
            }
          />
        </div>

        {/* Right — Provide an invoice top-right, Looks right / Change date bottom-right */}
        <div className="flex min-h-full min-w-0 flex-col items-end justify-between gap-6">
          {showInvoiceDrop ? (
            <button
              type="button"
              className="btn-link gap-2"
              onClick={() => onProvideInvoice(claim)}
            >
              <FileUp className="h-3.5 w-3.5 shrink-0" aria-hidden />
              Provide an invoice
            </button>
          ) : (
            <span aria-hidden />
          )}
          <div className="flex flex-wrap items-center justify-end gap-3 md:gap-4">
            <ClaimActions
              claim={claim}
              inReviewFocus={inReviewFocus}
              reviewDimmed={reviewDimmed}
              reviewActions={reviewActions}
              onLooksRight={onLooksRight}
              onChangeDate={onChangeDate}
            />
          </div>
        </div>
      </div>
    </li>
  )
}
