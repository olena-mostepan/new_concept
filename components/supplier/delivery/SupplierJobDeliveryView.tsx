'use client'

import * as React from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import {
  applyStageShift,
  markStagesCompleteThrough,
  formatShortDate,
} from '@/lib/supplier/delivery/dates'
import {
  confirmJobStage,
  getJobDelivery,
  jobToDeliveryClaim,
  jobsInProgramme,
} from '@/lib/supplier/delivery/job-mock-data'
import {
  adoptInvoiceAmount,
  applyPaymentModelToJob,
  ingestInvoice,
  keepModelAmount,
  refreshJobMoney,
} from '@/lib/supplier/delivery/payment-model'
import type {
  JobDeliveryDetail,
  JobDeliveryStage,
} from '@/lib/supplier/delivery/job-types'
import type { DeliveryClaim } from '@/lib/supplier/delivery/types'
import { JobMoneyCards } from '@/components/supplier/delivery/JobMoneyCards'
import { DeliveryPhasesStepper } from '@/components/supplier/delivery/DeliveryPhasesStepper'
import { PaymentStagesCard } from '@/components/supplier/delivery/PaymentStagesCard'
import { ChangeDateModal } from '@/components/supplier/delivery/ChangeDateModal'
import { NotStartedModal } from '@/components/supplier/delivery/NotStartedModal'
import { MovedFurtherModal } from '@/components/supplier/delivery/MovedFurtherModal'
import { AlreadyInvoicedModal } from '@/components/supplier/delivery/AlreadyInvoicedModal'
import {
  EditPaymentPlanModal,
  type EditPaymentPlanResult,
} from '@/components/supplier/delivery/EditPaymentPlanModal'
import {
  UploadInvoiceModal,
  type UploadInvoiceResult,
} from '@/components/supplier/delivery/UploadInvoiceModal'
import { showDeliverySuccessToast } from '@/components/supplier/delivery/delivery-toast'

type ModalKind =
  | 'changeDate'
  | 'notStarted'
  | 'moved'
  | 'invoiced'
  | 'editPlan'
  | 'uploadInvoice'
  | null

function applyClaimPatchToJob(
  job: JobDeliveryDetail,
  claim: DeliveryClaim,
  patch: Partial<DeliveryClaim>,
): JobDeliveryDetail {
  const nextClaim = { ...claim, ...patch }
  const stageByName = new Map(
    nextClaim.stages.map((s) => [s.name, s] as const),
  )

  const stages = job.stages.map((s) => {
    if (s.name === 'Complete') {
      const allDone = nextClaim.stages.every((x) => x.done)
      return allDone
        ? {
            ...s,
            status: 'paid' as const,
            est: false,
            date: nextClaim.projectedDate,
          }
        : s
    }
    const synced = stageByName.get(s.name)
    if (!synced) return s
    const isCurrent = synced.name === nextClaim.currentStage
    let status = s.status
    if (synced.done) {
      status = s.status === 'invoiced' ? 'invoiced' : 'paid'
    } else if (isCurrent) {
      status = 'next'
    } else {
      status = 'upcoming'
    }
    return {
      ...s,
      date: synced.projectedDate,
      est: !synced.done && status === 'upcoming',
      status,
    }
  })

  return refreshJobMoney({
    ...job,
    stages,
    currentStage: nextClaim.currentStage,
    confirmStatus: nextClaim.status,
    daysStuck: nextClaim.daysStuck,
  })
}

/** Delivery tab body for a job (header/tabs live in SupplierJobPage). */
export function SupplierJobDeliveryPanel({
  jobId,
  uploadOpen = false,
  onUploadOpenChange,
}: {
  jobId: string
  uploadOpen?: boolean
  onUploadOpenChange?: (open: boolean) => void
}) {
  const initial = getJobDelivery(jobId)
  const [job, setJob] = React.useState<JobDeliveryDetail | null>(
    () => (initial ? structuredClone(initial) : null),
  )
  const [modal, setModal] = React.useState<ModalKind>(null)
  const [focusStage, setFocusStage] = React.useState<string | null>(null)

  const claim = React.useMemo(
    () => (job ? jobToDeliveryClaim(job) : null),
    [job],
  )

  React.useEffect(() => {
    if (uploadOpen) {
      setFocusStage(null)
      setModal('uploadInvoice')
    }
  }, [uploadOpen])

  if (!job || !claim) {
    return (
      <div className="rounded-xl border border-cq-border bg-white px-5 py-10 text-center shadow-sm sm:px-6">
        <p className="text-sm font-normal text-cq-text">Job not found</p>
        <Link href="/supplier/delivery" className="btn-link mt-3 inline-flex">
          Back to Delivery
        </Link>
      </div>
    )
  }

  const detail = job
  const activeClaim = claim

  function openModal(kind: ModalKind, stageName?: string) {
    setFocusStage(stageName ?? null)
    setModal(kind)
  }

  function patchFromClaim(patch: Partial<DeliveryClaim>) {
    setJob((prev) => {
      if (!prev) return prev
      const current = jobToDeliveryClaim(prev)
      return applyClaimPatchToJob(prev, current, patch)
    })
  }

  function handleConfirmRaise() {
    const amount = detail.dueNow
    setJob((prev) => (prev ? confirmJobStage(prev) : prev))
    showDeliverySuccessToast(amount)
  }

  function handleDateClick(stage: JobDeliveryStage) {
    if (detail.confirmStatus === 'settled') {
      toast.message('This job is already settled')
      return
    }
    if (detail.confirmStatus === 'not_started') {
      openModal('notStarted', stage.name)
      return
    }
    if (detail.confirmStatus === 'stuck' && stage.status === 'next') {
      openModal('moved', stage.name)
      return
    }
    openModal('changeDate', stage.name)
  }

  function handleEditPlan(result: EditPaymentPlanResult) {
    setJob((prev) => {
      if (!prev) return prev
      return applyPaymentModelToJob(prev, result.model)
    })

    const n =
      result.scope === 'this'
        ? 1
        : result.scope === 'portfolio'
          ? jobsInProgramme(detail.programme).length
          : result.selectedJobIds.length

    toast.message(`Plan applied to ${n} project${n === 1 ? '' : 's'}.`)
  }

  function handleUseInvoice(stage: JobDeliveryStage) {
    setJob((prev) => (prev ? adoptInvoiceAmount(prev, stage.name) : prev))
    toast.message(`Using invoice amount for ${stage.name}`)
  }

  function handleKeepModel(stage: JobDeliveryStage) {
    setJob((prev) => (prev ? keepModelAmount(prev, stage.name) : prev))
    toast.message(`Kept model amount for ${stage.name}`)
  }

  function handleUploadInvoice(stage?: JobDeliveryStage) {
    openModal('uploadInvoice', stage?.name)
  }

  function handleUploadConfirm(result: UploadInvoiceResult) {
    setJob((prev) => {
      if (!prev) return prev
      return ingestInvoice(prev, result.stageName, result.amount)
    })
    const modelSaid = detail.stages.find((s) => s.name === result.stageName)
    const modelled = modelSaid
      ? Math.round((detail.gmv * modelSaid.pct) / 100)
      : result.amount
    if (result.amount !== modelled) {
      toast.message(
        `Invoice uploaded for ${result.stageName} — amount differs from model`,
      )
    } else {
      toast.message(`Invoice uploaded for ${result.stageName}`)
    }
  }

  function closeModal() {
    setModal(null)
    setFocusStage(null)
    onUploadOpenChange?.(false)
  }

  return (
    <div className="space-y-6">
      <JobMoneyCards job={detail} />

      <DeliveryPhasesStepper
        job={detail}
        onDateClick={handleDateClick}
        onYes={handleConfirmRaise}
        onChangeDate={() => openModal('changeDate')}
        onMovedOn={() => openModal('moved')}
        onAlreadyInvoiced={() => openModal('invoiced')}
        onUploadInvoice={handleUploadInvoice}
        onEditPlan={() => openModal('editPlan')}
      />

      <PaymentStagesCard
        job={detail}
        onEditDate={handleDateClick}
        onEditPlan={() => openModal('editPlan')}
        onUploadInvoice={handleUploadInvoice}
        onUseInvoiceAmount={handleUseInvoice}
        onKeepModel={handleKeepModel}
        onMovedOn={() => openModal('moved')}
      />

      <ChangeDateModal
        open={modal === 'changeDate'}
        onOpenChange={(open) => {
          if (!open) closeModal()
        }}
        claim={activeClaim}
        focusStage={focusStage}
        onConfirm={(id, result) => {
          const current = jobToDeliveryClaim(detail)
          if (current.id !== id) return
          patchFromClaim({
            projectedDate: result.actualDate,
            stages: applyStageShift(
              current.stages,
              result.shiftedNextStages,
            ).map((s) =>
              s.name === result.stage
                ? { ...s, projectedDate: result.actualDate }
                : s,
            ),
            status: 'confirmable',
            currentStage: result.stage,
          })
          showDeliverySuccessToast(current.amount)
          toast.message(
            `Date set to ${formatShortDate(result.actualDate)} — later stages shifted`,
          )
        }}
      />
      <NotStartedModal
        open={modal === 'notStarted'}
        onOpenChange={(open) => !open && closeModal()}
        claim={activeClaim}
        onConfirm={(id, result) => {
          if (activeClaim.id !== id) return
          patchFromClaim({
            projectedDate: result.startDate,
            status: 'future',
          })
          showDeliverySuccessToast(activeClaim.amount)
        }}
      />
      <MovedFurtherModal
        open={modal === 'moved'}
        onOpenChange={(open) => !open && closeModal()}
        claim={activeClaim}
        onConfirm={(id, result) => {
          const current = jobToDeliveryClaim(detail)
          if (current.id !== id) return
          patchFromClaim({
            currentStage: result.newStage,
            projectedDate: result.date,
            stages: markStagesCompleteThrough(
              current.stages,
              result.newStage,
              result.date,
            ),
            status: 'confirmable',
            daysStuck: undefined,
          })
          showDeliverySuccessToast(current.amount)
        }}
      />
      <AlreadyInvoicedModal
        open={modal === 'invoiced'}
        onOpenChange={(open) => !open && closeModal()}
        claim={activeClaim}
        onConfirm={(id, result) => {
          if (activeClaim.id !== id) return
          setJob((prev) => {
            if (!prev) return prev
            const confirmed = confirmJobStage({
              ...prev,
              dueNow: result.amount,
            })
            if (result.status !== 'paid') return confirmed
            return refreshJobMoney({
              ...confirmed,
              confirmStatus: 'settled',
              dueNow: 0,
              commissionAmount: 0,
              stages: confirmed.stages.map((s) =>
                s.status === 'next' || s.status === 'invoiced'
                  ? { ...s, status: 'paid' as const, est: false }
                  : s,
              ),
            })
          })
          showDeliverySuccessToast(result.amount)
        }}
      />
      <EditPaymentPlanModal
        open={modal === 'editPlan'}
        onOpenChange={(open) => !open && closeModal()}
        job={detail}
        onConfirm={handleEditPlan}
      />
      <UploadInvoiceModal
        open={modal === 'uploadInvoice'}
        onOpenChange={(open) => !open && closeModal()}
        job={detail}
        focusStage={focusStage}
        onConfirm={handleUploadConfirm}
      />
    </div>
  )
}
