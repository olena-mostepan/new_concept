'use client'

import * as React from 'react'
import Link from 'next/link'
import { ListChecks } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { sectionTitleClass } from '@/lib/ui/headings'
import {
  INITIAL_CUSTOMER_DELIVERY,
  confirmProjectPhase,
  patchProjectDates,
  recountConfirmations,
} from '@/lib/customer/delivery/mock-data'
import type {
  CustomerDeliveryPayload,
  CustomerProject,
} from '@/lib/customer/delivery/types'
import { formatShortDate } from '@/lib/customer/delivery/dates'
import { CustomerPhaseStepperCompact } from '@/components/customer/delivery/CustomerPhaseStepper'
import { CustomerChangeDateModal } from '@/components/customer/delivery/CustomerChangeDateModal'
import { MoneyWashCard } from '@/components/supplier/delivery/MoneyWashCard'

function needsDateConfirm(project: CustomerProject): boolean {
  return !project.startConfirmed || project.needsConfirm
}

function buildConfirmQueue(projects: CustomerProject[]): string[] {
  return projects.filter(needsDateConfirm).map((p) => p.id)
}

export function CustomerDeliveryView({
  payload: payloadProp,
  onPayloadChange,
  projectHref,
  embedded = false,
  showBanner = true,
  showList = true,
  showCity = false,
  conceptRows = false,
  bare = false,
  bannerDetail,
}: {
  payload?: CustomerDeliveryPayload
  onPayloadChange?: (next: CustomerDeliveryPayload) => void
  projectHref?: (project: CustomerProject) => string
  embedded?: boolean
  showBanner?: boolean
  showList?: boolean
  showCity?: boolean
  conceptRows?: boolean
  bare?: boolean
  bannerDetail?: string
} = {}) {
  const [uncontrolled, setUncontrolled] = React.useState<CustomerDeliveryPayload>(
    INITIAL_CUSTOMER_DELIVERY,
  )
  const payload = payloadProp ?? uncontrolled
  const setPayload = (
    value: CustomerDeliveryPayload | ((prev: CustomerDeliveryPayload) => CustomerDeliveryPayload),
  ) => {
    const next = typeof value === 'function' ? value(payload) : value
    if (onPayloadChange) onPayloadChange(next)
    else setUncontrolled(next)
  }
  const [confirmProjectId, setConfirmProjectId] = React.useState<string | null>(
    null,
  )
  const [reviewMode, setReviewMode] = React.useState(false)
  const [reviewQueue, setReviewQueue] = React.useState<string[]>([])
  const [clearedIds, setClearedIds] = React.useState<string[]>([])
  const rowRefs = React.useRef<Record<string, HTMLTableRowElement | null>>({})
  const listRef = React.useRef<HTMLDivElement | null>(null)

  const projectsById = React.useMemo(() => {
    const map = new Map(payload.projects.map((p) => [p.id, p]))
    return map
  }, [payload.projects])

  const confirmProject = projectsById.get(confirmProjectId ?? '')

  const activeQueue = React.useMemo(() => {
    const cleared = new Set(clearedIds)
    return reviewQueue.filter((id) => {
      if (cleared.has(id)) return false
      const p = projectsById.get(id)
      return p ? needsDateConfirm(p) : false
    })
  }, [reviewQueue, clearedIds, projectsById])

  const patchProject = (
    id: string,
    updater: (p: CustomerProject) => CustomerProject,
  ) => {
    setPayload((prev) => {
      const projects = prev.projects.map((p) => (p.id === id ? updater(p) : p))
      return recountConfirmations({ ...prev, projects })
    })
  }

  function scrollToProject(id: string) {
    requestAnimationFrame(() => {
      rowRefs.current[id]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    })
  }

  function exitReview() {
    setReviewMode(false)
    setReviewQueue([])
    setClearedIds([])
    setConfirmProjectId(null)
  }

  function completeReview() {
    exitReview()
    toast.success('All dates checked — project tracking is up to date.')
  }

  function openForProject(id: string) {
    setConfirmProjectId(id)
    scrollToProject(id)
  }

  function advancePast(id: string) {
    const cleared = new Set([...clearedIds, id])
    setClearedIds([...cleared])
    const next = reviewQueue.find((qid) => !cleared.has(qid))
    if (!next) {
      completeReview()
      return
    }
    openForProject(next)
  }

  function startReview() {
    const queue = buildConfirmQueue(payload.projects)
    if (queue.length === 0) {
      toast.message('Nothing left that needs confirmation')
      return
    }
    setReviewMode(true)
    setReviewQueue(queue)
    setClearedIds([])
    listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    openForProject(queue[0]!)
  }

  function applyConfirm(project: CustomerProject, date: string) {
    if (!project.startConfirmed) {
      patchProject(project.id, (p) =>
        patchProjectDates(confirmProjectPhase(p, date), { start: date }),
      )
    } else {
      patchProject(project.id, (p) =>
        patchProjectDates(confirmProjectPhase(p, date), {
          phaseDate: { phaseId: p.currentPhaseId, date },
        }),
      )
    }
  }

  function handleModalConfirm(date: string) {
    if (!confirmProject) return
    const id = confirmProject.id
    applyConfirm(confirmProject, date)
    toast.success('Date confirmed')
    if (reviewMode) {
      advancePast(id)
    } else {
      setConfirmProjectId(null)
    }
  }

  function handleSkip() {
    if (!confirmProject || !reviewMode) {
      setConfirmProjectId(null)
      return
    }
    advancePast(confirmProject.id)
  }

  function handleCancel() {
    if (reviewMode) exitReview()
    else setConfirmProjectId(null)
  }

  const currentStageLabel =
    confirmProject?.phases.find((p) => p.id === confirmProject.currentPhaseId)
      ?.label ?? null

  const listOn = showList || reviewMode

  return (
    <div className={embedded ? 'space-y-6' : 'mx-auto w-full max-w-screen-2xl space-y-6 px-6 py-8 sm:px-8 lg:px-10'}>
      {showBanner && payload.datesNeedingConfirm > 0 && !reviewMode ? (
        <MoneyWashCard>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
            <div className="min-w-0 flex-1 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--cq-green)]">
                Dates to confirm
              </p>
              <p className="text-base font-semibold text-cq-text sm:text-lg">
                <span className="font-semibold text-text-primary">
                  {payload.datesNeedingConfirm}{' '}
                  {payload.datesNeedingConfirm === 1 ? 'date' : 'dates'}
                </span>{' '}
                {payload.datesNeedingConfirm === 1
                  ? 'needs confirming'
                  : 'need confirming'}
              </p>
              <p className="text-sm text-cq-text-secondary">
                {bannerDetail ??
                  'If a start date or phase is wrong, project tracking will be off too — so check them below.'}
              </p>
            </div>
            <button
              type="button"
              className="btn-secondary shrink-0"
              onClick={startReview}
            >
              <ListChecks className="h-4 w-4" aria-hidden />
              Confirm from your data
            </button>
          </div>
        </MoneyWashCard>
      ) : null}

      {reviewMode ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[var(--cq-green)]/30 bg-[var(--cq-accent-muted)]/60 px-4 py-3">
          <p className="text-sm font-normal text-cq-text">
            Let&apos;s confirm dates — {activeQueue.length} to check
          </p>
          <button type="button" className="btn-link text-sm" onClick={exitReview}>
            Exit review
          </button>
        </div>
      ) : null}

      {listOn ? (
      <div ref={listRef} className="space-y-8">
        {payload.batches.map((batch) => (
          <section
            key={batch.id}
            className={bare ? '' : 'overflow-hidden rounded-xl border border-cq-border bg-white '}
          >
            {!bare ? (
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-cq-border bg-cq-bg/60 px-5 py-4 sm:px-6">
              <div className="min-w-0">
                <h3 className="text-base font-semibold text-text-primary">
                  {batch.name}
                </h3>
                <p className="mt-0.5 text-sm text-cq-text-secondary">
                  {batch.projectCount} projects · {batch.locationSummary} ·{' '}
                  {batch.valueLabel}
                </p>
              </div>
              {batch.toConfirmCount > 0 ? (
                <span className="inline-flex rounded-full border border-[var(--cq-link)]/30 bg-[var(--cq-link)]/10 px-2.5 py-1 text-xs font-normal text-[var(--cq-link)]">
                  {batch.toConfirmCount} to confirm
                </span>
              ) : (
                <span className="inline-flex rounded-full border border-[var(--cq-green)]/30 bg-[var(--cq-green)]/10 px-2.5 py-1 text-xs font-normal text-[var(--cq-green)]">
                  All confirmed
                </span>
              )}
            </header>
            ) : null}

            <div className="overflow-x-auto">
              <table className="w-full min-w-[960px] text-left text-sm">
                <thead>
                  <tr className="border-b border-cq-border">
                    <th
                      className={cn(
                        sectionTitleClass,
                        'min-w-[240px] px-5 py-3 sm:min-w-[280px] sm:px-6',
                      )}
                    >
                      Project
                    </th>
                    <th
                      className={cn(
                        sectionTitleClass,
                        'whitespace-nowrap px-3 py-3',
                      )}
                    >
                      Start date
                    </th>
                    <th
                      className={cn(
                        sectionTitleClass,
                        'px-3 py-3 text-center',
                      )}
                    >
                      Delivery stages
                    </th>
                    <th
                      className={cn(
                        sectionTitleClass,
                        'whitespace-nowrap px-5 py-3 text-right sm:px-6',
                      )}
                    >
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {batch.projectIds.map((pid) => {
                    const project = projectsById.get(pid)
                    if (!project) return null
                    const focused =
                      reviewMode && confirmProjectId === project.id
                    const dimmed =
                      reviewMode &&
                      confirmProjectId != null &&
                      confirmProjectId !== project.id
                    return (
                      <tr
                        key={project.id}
                        ref={(el) => {
                          rowRefs.current[project.id] = el
                        }}
                        className={cn(
                          'border-b border-cq-border last:border-b-0 transition-colors',
                          focused &&
                            'bg-[var(--cq-accent-muted)]/40 ring-2 ring-inset ring-[var(--cq-green)]/40',
                          dimmed && 'opacity-50',
                        )}
                      >
                        <td className="min-w-[240px] px-5 py-4 align-middle sm:min-w-[280px] sm:px-6">
                          <Link
                            href={projectHref ? projectHref(project) : `/customer/projects/${project.id}`}
                            className="font-normal text-cq-text hover:text-[var(--cq-green)] hover:underline"
                          >
                            {project.name}
                            {showCity && project.location ? (
                              <span className="ml-2 font-normal text-cq-text-secondary">{project.location}</span>
                            ) : null}
                          </Link>
                          <p className="mt-0.5 text-xs text-cq-text-secondary">
                            {project.supplier}{project.valueLabel !== '—' ? ` · ${project.valueLabel}` : ''}
                          </p>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 align-middle">
                          {project.startConfirmed && project.startDate ? (
                            <span className="text-sm text-cq-text">
                              {formatShortDate(project.startDate)}
                            </span>
                          ) : (
                            <span className="text-sm text-cq-text-secondary">
                              Awaiting start
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-4 align-middle">
                          <div className="flex items-center justify-center">
                            <CustomerPhaseStepperCompact
                              phases={project.phases}
                            />
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 align-middle text-right sm:px-6">
                          <div className="flex items-center justify-end gap-3">
                            {conceptRows ? <span className="text-sm text-cq-text">{project.insightLabel}</span> : null}
                            {(conceptRows ? project.needsConfirm : needsDateConfirm(project)) ? (
                              <button
                                type="button"
                                className="btn-primary-sm"
                                onClick={() => {
                                  if (reviewMode) openForProject(project.id)
                                  else setConfirmProjectId(project.id)
                                }}
                              >
                                Confirm date
                              </button>
                            ) : conceptRows ? null : (
                              <span className="inline-flex w-fit rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-normal capitalize text-emerald-800">
                                confirmed
                              </span>
                            )}
                            {conceptRows && projectHref ? (
                              <Link href={projectHref(project)} className="btn-secondary-sm">
                                View
                              </Link>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>
        ))}
      </div>
      ) : null}

      <CustomerChangeDateModal
        open={Boolean(confirmProject)}
        onOpenChange={(open) => {
          if (open) return
          handleCancel()
        }}
        title={
          confirmProject && !confirmProject.startConfirmed
            ? 'Confirm kick-off date'
            : `Confirm ${currentStageLabel ?? 'date'}`
        }
        subtitle={
          confirmProject
            ? `${confirmProject.name} · ${currentStageLabel ?? 'Current stage'}`
            : ''
        }
        stageLabel={currentStageLabel}
        reviewProgress={
          reviewMode && reviewQueue.length > 0
            ? {
                current: Math.min(clearedIds.length + 1, reviewQueue.length),
                total: reviewQueue.length,
              }
            : null
        }
        initialDate={
          confirmProject && !confirmProject.startConfirmed
            ? (confirmProject.startDate ??
              confirmProject.phases[0]?.date ??
              null)
            : (confirmProject?.phases.find(
                (p) => p.id === confirmProject.currentPhaseId,
              )?.date ?? null)
        }
        onConfirm={handleModalConfirm}
        onSkip={reviewMode ? handleSkip : undefined}
      />
    </div>
  )
}
