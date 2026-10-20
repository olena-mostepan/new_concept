'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { formatGbp } from '@/lib/supplier/delivery/mock-data'
import { jobsInProgramme, jobTitle } from '@/lib/supplier/delivery/job-mock-data'
import {
  PAYMENT_MODELS,
  STAGE_LABELS,
  buildCustomModel,
  isPresetModelId,
  pctSumDelta,
  shortStageLabel,
} from '@/lib/supplier/delivery/payment-model'
import type {
  JobDeliveryDetail,
  PaymentModel,
  PaymentModelScope,
} from '@/lib/supplier/delivery/job-types'
import { ClaimModalShell } from '@/components/supplier/delivery/ClaimModalShell'

export type EditPaymentPlanResult = {
  model: PaymentModel
  scope: PaymentModelScope
  selectedJobIds: string[]
}

type ModelChoice = 'standard' | 'even' | 'frontloaded' | 'custom'

function defaultCustomPcts(job: JobDeliveryDetail): number[] {
  const byName = new Map(
    job.stages
      .filter((s) => s.name !== 'Complete')
      .map((s) => [s.name, s.pct] as const),
  )
  return STAGE_LABELS.map((name) => byName.get(name) ?? 25)
}

function initialChoice(job: JobDeliveryDetail): ModelChoice {
  if (isPresetModelId(job.model.id)) return job.model.id as ModelChoice
  return 'custom'
}

export function EditPaymentPlanModal({
  open,
  onOpenChange,
  job,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  job: JobDeliveryDetail | null
  onConfirm: (result: EditPaymentPlanResult) => void
}) {
  const [choice, setChoice] = React.useState<ModelChoice>('standard')
  const [customPcts, setCustomPcts] = React.useState<number[]>([35, 35, 25, 5])
  const [scope, setScope] = React.useState<PaymentModelScope>('this')
  const [selectedJobIds, setSelectedJobIds] = React.useState<string[]>([])

  React.useEffect(() => {
    if (!job || !open) return
    setChoice(initialChoice(job))
    setCustomPcts(defaultCustomPcts(job))
    setScope('this')
    setSelectedJobIds([job.id])
  }, [job, open])

  if (!job) return null
  const current = job

  const customSum = customPcts.reduce((a, b) => a + (Number.isFinite(b) ? b : 0), 0)
  const customDelta = pctSumDelta(customSum)
  const activeModel: PaymentModel =
    choice === 'custom'
      ? buildCustomModel(customPcts)
      : (PAYMENT_MODELS.find((m) => m.id === choice) ?? PAYMENT_MODELS[0])

  const portfolioJobs = jobsInProgramme(current.programme)
  const selectList = portfolioJobs.map((j) => ({
    id: j.id,
    label: jobTitle(j),
    isCurrent: j.id === current.id,
  }))

  const selectValid = selectedJobIds.length >= 1
  const modelValid = choice !== 'custom' || customDelta.ok
  const canApply = modelValid && (scope !== 'selected' || selectValid)

  function toggleJob(id: string) {
    setSelectedJobIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  function setCustomPct(index: number, raw: string) {
    const n = raw === '' ? 0 : Number(raw)
    setCustomPcts((prev) =>
      prev.map((v, i) => (i === index ? (Number.isFinite(n) ? n : 0) : v)),
    )
  }

  function resolveIds(): string[] {
    if (scope === 'this') return [current.id]
    if (scope === 'portfolio') return portfolioJobs.map((j) => j.id)
    return selectedJobIds
  }

  return (
    <ClaimModalShell
      open={open}
      onOpenChange={onOpenChange}
      title="Edit payment plan"
      subtitle={`${current.solution} — ${current.property} · ${formatGbp(current.gmv)} GMV`}
      primaryLabel="Apply plan"
      primaryDisabled={!canApply}
      contentClassName="gap-0 overflow-hidden border-cq-border p-0 sm:max-w-[520px]"
      onPrimary={() => {
        if (!canApply) return
        onConfirm({
          model: activeModel,
          scope,
          selectedJobIds: resolveIds(),
        })
        onOpenChange(false)
      }}
    >
      <div className="space-y-2">
        <p className="text-sm font-normal text-cq-text">Payment model</p>
        <p className="text-sm text-cq-text-secondary">
          A model is a best-guess split — stage £ re-derives from GMV × %. Dates
          stay as they are.
        </p>

        <ul className="space-y-2" role="radiogroup" aria-label="Payment model">
          {PAYMENT_MODELS.map((m) => {
            const selected = choice === m.id
            return (
              <li key={m.id}>
                <button
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setChoice(m.id as ModelChoice)}
                  className={cn(
                    'w-full rounded-lg border px-3 py-3 text-left transition-colors',
                    selected
                      ? 'border-[var(--cq-green)] bg-[var(--cq-accent-muted)]/40'
                      : 'border-cq-border bg-white hover:border-cq-text-secondary/40',
                  )}
                >
                  <p className="text-sm font-semibold text-cq-text">{m.name}</p>
                  <p className="mt-1 text-xs text-cq-text-secondary">
                    {m.stages
                      .map(
                        (s) =>
                          `${shortStageLabel(s.name)} ${s.pct}%`,
                      )
                      .join(' · ')}
                  </p>
                </button>
              </li>
            )
          })}

          <li>
            <div
              role="radio"
              aria-checked={choice === 'custom'}
              tabIndex={0}
              onClick={() => setChoice('custom')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  setChoice('custom')
                }
              }}
              className={cn(
                'w-full cursor-pointer rounded-lg border px-3 py-3 text-left transition-colors',
                choice === 'custom'
                  ? 'border-[var(--cq-green)] bg-[var(--cq-accent-muted)]/40'
                  : 'border-cq-border bg-white hover:border-cq-text-secondary/40',
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-cq-text">Custom</p>
                <p
                  className={cn(
                    'text-xs font-normal',
                    customDelta.ok
                      ? 'text-emerald-700'
                      : 'text-[var(--cq-green)]',
                  )}
                >
                  {customDelta.label}
                </p>
              </div>
              <p className="mt-1 text-xs text-cq-text-secondary">
                Set your own split — must total 100%
              </p>

              {choice === 'custom' ? (
                <div
                  className="mt-3"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {STAGE_LABELS.map((name, i) => (
                      <label key={name} className="block space-y-1">
                        <span className="text-xs text-cq-text-secondary">
                          {shortStageLabel(name)}
                        </span>
                        <div className="relative">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            inputMode="numeric"
                            value={customPcts[i] ?? 0}
                            onChange={(e) => setCustomPct(i, e.target.value)}
                            className="w-full rounded-md border border-cq-border bg-white px-2 py-1.5 pr-6 text-sm text-cq-text outline-none focus:border-[var(--cq-green)]"
                          />
                          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-cq-muted">
                            %
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </li>
        </ul>
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-normal text-cq-text">
          Apply this plan to
        </legend>
        <label className="flex cursor-pointer items-start gap-2 text-sm text-cq-text">
          <input
            type="radio"
            name="plan-scope"
            className="mt-0.5 accent-[var(--cq-green)]"
            checked={scope === 'this'}
            onChange={() => setScope('this')}
          />
          <span>Just this project</span>
        </label>
        <label className="flex cursor-pointer items-start gap-2 text-sm text-cq-text">
          <input
            type="radio"
            name="plan-scope"
            className="mt-0.5 accent-[var(--cq-green)]"
            checked={scope === 'portfolio'}
            onChange={() => setScope('portfolio')}
          />
          <span>All your projects</span>
        </label>
        <label className="flex cursor-pointer items-start gap-2 text-sm text-cq-text">
          <input
            type="radio"
            name="plan-scope"
            className="mt-0.5 accent-[var(--cq-green)]"
            checked={scope === 'selected'}
            onChange={() => {
              setScope('selected')
              setSelectedJobIds((prev) =>
                prev.length ? prev : [current.id],
              )
            }}
          />
          <span>Select projects</span>
        </label>

        {scope === 'selected' ? (
          <ul className="ml-6 space-y-1.5 rounded-lg border border-cq-border bg-cq-bg/60 px-3 py-2">
            {selectList.map((j) => (
              <li key={j.id}>
                <label className="flex items-center gap-2 text-sm text-cq-text">
                  <input
                    type="checkbox"
                    className="accent-[var(--cq-green)]"
                    checked={selectedJobIds.includes(j.id)}
                    onChange={() => toggleJob(j.id)}
                  />
                  <span className={j.isCurrent ? 'font-normal' : undefined}>
                    {j.label}
                    {j.isCurrent ? (
                      <span className="font-normal text-cq-muted">
                        {' '}
                        (this project)
                      </span>
                    ) : null}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        ) : null}
      </fieldset>
    </ClaimModalShell>
  )
}
