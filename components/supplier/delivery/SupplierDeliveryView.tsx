'use client'

import * as React from 'react'
import { toast } from 'sonner'
import { sectionTitleClass } from '@/lib/ui/headings'
import {
  INITIAL_DELIVERY_PAYLOAD,
  commissionDue,
  formatGbp,
  sumProjected,
} from '@/lib/supplier/delivery/mock-data'
import {
  buildReviewQueue,
  confirmClaimPatch,
  isAllHighConfidence,
} from '@/lib/supplier/delivery/claim-copy'
import { applyStageShift } from '@/lib/supplier/delivery/dates'
import type { DeliveryClaim } from '@/lib/supplier/delivery/types'
import { MoneyLeverBanner } from '@/components/supplier/delivery/MoneyLeverBanner'
import { ClaimRow } from '@/components/supplier/delivery/ClaimRow'
import { DeliveryReviewBar } from '@/components/supplier/delivery/DeliveryReviewBar'
import { ChangeDateModal } from '@/components/supplier/delivery/ChangeDateModal'
import { ProvideInvoiceModal } from '@/components/supplier/delivery/ProvideInvoiceModal'
import { showDeliverySuccessToast } from '@/components/supplier/delivery/delivery-toast'

type ModalKind = 'changeDate' | 'invoice' | null

export function SupplierDeliveryView() {
  const [claims, setClaims] = React.useState<DeliveryClaim[]>(
    () => INITIAL_DELIVERY_PAYLOAD.claims,
  )
  const [activeClaim, setActiveClaim] = React.useState<DeliveryClaim | null>(
    null,
  )
  const [modal, setModal] = React.useState<ModalKind>(null)
  const [focusStage, setFocusStage] = React.useState<string | null>(null)
  const [reviewMode, setReviewMode] = React.useState(false)
  const [pickAnyMode, setPickAnyMode] = React.useState(false)
  const [focusId, setFocusId] = React.useState<string | null>(null)
  const [clearedIds, setClearedIds] = React.useState<string[]>([])
  const listRef = React.useRef<HTMLElement | null>(null)
  const rowRefs = React.useRef<Record<string, HTMLLIElement | null>>({})

  const rate = INITIAL_DELIVERY_PAYLOAD.commissionRate
  const projected = sumProjected(claims)
  const commission = commissionDue(claims, rate)

  const reviewQueue = React.useMemo(() => {
    const cleared = new Set(clearedIds)
    return buildReviewQueue(claims).filter((c) => !cleared.has(c.id))
  }, [claims, clearedIds])

  const focusClaim =
    reviewMode && !pickAnyMode && focusId
      ? (claims.find((c) => c.id === focusId) ?? null)
      : null

  const visibleClaims = React.useMemo(() => {
    if (!reviewMode || pickAnyMode) return claims
    const queueIds = new Set(reviewQueue.map((c) => c.id))
    const rest = claims.filter((c) => !queueIds.has(c.id))
    return [...reviewQueue, ...rest]
  }, [claims, reviewMode, pickAnyMode, reviewQueue])

  function scrollToList() {
    listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function scrollToClaim(id: string) {
    requestAnimationFrame(() => {
      rowRefs.current[id]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    })
  }

  function exitReview() {
    setReviewMode(false)
    setPickAnyMode(false)
    setFocusId(null)
    setClearedIds([])
    setModal(null)
    setActiveClaim(null)
  }

  function completeReview(latestClaims: DeliveryClaim[]) {
    setReviewMode(false)
    setPickAnyMode(false)
    setFocusId(null)
    setClearedIds([])
    setModal(null)
    setActiveClaim(null)
    toast.success(
      `Updated — you'll invoice ${formatGbp(sumProjected(latestClaims))} over the next 3 months.`,
    )
  }

  function advancePast(id: string, latestClaims: DeliveryClaim[]) {
    const cleared = new Set([...clearedIds, id])
    setClearedIds([...cleared])
    const next = buildReviewQueue(latestClaims).find((c) => !cleared.has(c.id))
    if (!next) {
      completeReview(latestClaims)
      return
    }
    setFocusId(next.id)
    scrollToClaim(next.id)
  }

  function startReview() {
    const queue = buildReviewQueue(claims)
    setClearedIds([])
    setReviewMode(true)
    scrollToList()

    if (queue.length === 0 || isAllHighConfidence(claims)) {
      setPickAnyMode(true)
      setFocusId(null)
      return
    }

    setPickAnyMode(false)

    if (queue.length === 1) {
      const only = queue[0]!
      setFocusId(only.id)
      scrollToClaim(only.id)
      openModal('changeDate', only)
      return
    }

    setFocusId(queue[0]!.id)
    scrollToClaim(queue[0]!.id)
  }

  function confirmHighConfidence() {
    const targets = claims.filter(
      (c) => c.status === 'confirmable' && c.confidence === 'high',
    )
    if (targets.length === 0) {
      toast.message('Nothing left that needs bulk confirmation')
      return
    }
    setClaims((prev) =>
      prev.map((c) =>
        c.status === 'confirmable' && c.confidence === 'high'
          ? { ...c, ...confirmClaimPatch(c) }
          : c,
      ),
    )
    const total = targets.reduce((s, c) => s + c.amount, 0)
    showDeliverySuccessToast(total)
  }

  function openModal(kind: ModalKind, claim: DeliveryClaim) {
    setActiveClaim(claim)
    setModal(kind)
  }

  function patchAndMaybeAdvance(
    id: string,
    patch: Partial<DeliveryClaim>,
    toastAmount?: number,
  ) {
    const nextClaims = claims.map((c) =>
      c.id === id ? { ...c, ...patch } : c,
    )
    setClaims(nextClaims)
    if (toastAmount != null) showDeliverySuccessToast(toastAmount)
    if (reviewMode && !pickAnyMode) {
      advancePast(id, nextClaims)
    }
  }

  function handleLooksRight(claim: DeliveryClaim) {
    if (claim.status === 'confirmable') {
      patchAndMaybeAdvance(claim.id, confirmClaimPatch(claim), claim.amount)
      return
    }
    if (claim.status === 'future') {
      patchAndMaybeAdvance(
        claim.id,
        { confidence: 'high' },
        claim.amount,
      )
      return
    }
  }

  function handleChangeDate(claim: DeliveryClaim) {
    setFocusStage(null)
    openModal('changeDate', claim)
  }

  function handleStageClick(claim: DeliveryClaim, stageName: string) {
    setFocusStage(stageName)
    openModal('changeDate', claim)
  }

  function handleProvideInvoice(claim: DeliveryClaim) {
    openModal('invoice', claim)
  }

  function closeModal() {
    setModal(null)
    setFocusStage(null)
    setActiveClaim(null)
  }

  function looksFineCurrent() {
    if (!focusClaim) return
    if (focusClaim.status === 'confirmable') {
      patchAndMaybeAdvance(
        focusClaim.id,
        confirmClaimPatch(focusClaim),
        focusClaim.amount,
      )
      return
    }
    patchAndMaybeAdvance(
      focusClaim.id,
      { confidence: 'high' },
      focusClaim.amount,
    )
  }

  function skipCurrent() {
    if (!focusId) return
    advancePast(focusId, claims)
  }

  return (
    <div className="space-y-6">
      <MoneyLeverBanner
        sumProjected={projected}
        commission={commission}
        onLooksRight={confirmHighConfidence}
        onSomethingsOff={startReview}
      />

      <section
        ref={listRef}
        className="rounded-xl border border-cq-border bg-white shadow-sm"
      >
        <header className="border-b border-cq-border px-5 py-4 sm:px-6">
          <h2 className={sectionTitleClass}>Your jobs — is this right?</h2>
        </header>

        {reviewMode ? (
          <div className="border-b border-cq-border px-4 py-3 sm:px-5">
            <DeliveryReviewBar
              count={reviewQueue.length}
              pickAny={pickAnyMode}
              onExit={exitReview}
            />
          </div>
        ) : null}

        <ul className="space-y-3 p-4 sm:p-5">
          {visibleClaims.map((claim) => {
            const highlighted =
              reviewMode && !pickAnyMode && claim.id === focusId
            const dimmed =
              reviewMode && !pickAnyMode && claim.id !== focusId

            const pickAnyActions =
              reviewMode &&
              pickAnyMode &&
              claim.status !== 'settled' &&
              claim.status !== 'confirmed'
                ? {
                    onChangeDate: () => openModal('changeDate', claim),
                    onLooksFine: () => {
                      if (claim.status === 'confirmable') {
                        patchAndMaybeAdvance(
                          claim.id,
                          confirmClaimPatch(claim),
                          claim.amount,
                        )
                      } else {
                        patchAndMaybeAdvance(
                          claim.id,
                          { confidence: 'high' },
                          claim.amount,
                        )
                      }
                    },
                  }
                : undefined

            return (
              <ClaimRow
                key={claim.id}
                claim={claim}
                rowRef={(el) => {
                  rowRefs.current[claim.id] = el
                }}
                onLooksRight={handleLooksRight}
                onChangeDate={handleChangeDate}
                onStageClick={handleStageClick}
                onProvideInvoice={handleProvideInvoice}
                reviewHighlighted={Boolean(highlighted)}
                reviewDimmed={Boolean(dimmed)}
                reviewActions={
                  highlighted && focusClaim
                    ? {
                        onChangeDate: () =>
                          openModal('changeDate', focusClaim),
                        onLooksFine: looksFineCurrent,
                        onSkip: skipCurrent,
                      }
                    : pickAnyActions
                }
              />
            )
          })}
        </ul>
      </section>

      <ChangeDateModal
        open={modal === 'changeDate'}
        onOpenChange={(open) => !open && closeModal()}
        claim={activeClaim}
        focusStage={focusStage}
        onConfirm={(id, result) => {
          const claim = claims.find((c) => c.id === id)
          if (!claim) return
          const touchesCurrent =
            !focusStage || result.stage === claim.currentStage
          patchAndMaybeAdvance(
            id,
            {
              ...(touchesCurrent
                ? { projectedDate: result.actualDate }
                : {}),
              stages: applyStageShift(
                claim.stages,
                result.shiftedNextStages,
              ),
              status: 'confirmable',
              daysStuck: undefined,
            },
            claim.amount,
          )
          closeModal()
        }}
      />
      <ProvideInvoiceModal
        open={modal === 'invoice'}
        onOpenChange={(open) => !open && closeModal()}
        claim={activeClaim}
        onConfirm={(id) => {
          const claim = claims.find((c) => c.id === id)
          patchAndMaybeAdvance(
            id,
            { status: 'settled' },
            claim?.amount,
          )
          closeModal()
        }}
      />
    </div>
  )
}
