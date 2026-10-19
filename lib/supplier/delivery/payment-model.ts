import type {
  JobDeliveryDetail,
  JobDeliveryStage,
  PaymentModel,
  PaymentModelStageDef,
} from './job-types'

export const STAGE_LABELS = [
  'T1 Order',
  'T2 Prior to install',
  'T3 Energise',
  'T4 Handover',
] as const

export const PAYMENT_MODELS: PaymentModel[] = [
  {
    id: 'standard',
    name: 'Standard 4-stage',
    stages: [
      { name: 'T1 Order', pct: 35 },
      { name: 'T2 Prior to install', pct: 35 },
      { name: 'T3 Energise', pct: 25 },
      { name: 'T4 Handover', pct: 5 },
    ],
  },
  {
    id: 'even',
    name: 'Even split',
    stages: [
      { name: 'T1 Order', pct: 25 },
      { name: 'T2 Prior to install', pct: 25 },
      { name: 'T3 Energise', pct: 25 },
      { name: 'T4 Handover', pct: 25 },
    ],
  },
  {
    id: 'frontloaded',
    name: 'Front-loaded',
    stages: [
      { name: 'T1 Order', pct: 40 },
      { name: 'T2 Prior to install', pct: 30 },
      { name: 'T3 Energise', pct: 20 },
      { name: 'T4 Handover', pct: 10 },
    ],
  },
]

export function getPaymentModel(id: string): PaymentModel | null {
  return PAYMENT_MODELS.find((m) => m.id === id) ?? null
}

export function isPresetModelId(id: string): boolean {
  return PAYMENT_MODELS.some((m) => m.id === id)
}

export function buildCustomModel(pcts: number[]): PaymentModel {
  return {
    id: 'custom',
    name: 'Custom',
    stages: STAGE_LABELS.map((name, i) => ({
      name,
      pct: pcts[i] ?? 0,
    })),
  }
}

export function modelAmount(gmv: number, pct: number): number {
  return Math.round((gmv * pct) / 100)
}

export function formatPct(pct: number): string {
  return `${pct}%`
}

/** e.g. "40% £124,800 · 30% £93,600 · …" */
export function derivedAmountsLine(
  gmv: number,
  stages: PaymentModelStageDef[],
): string {
  return stages
    .map((s) => `${formatPct(s.pct)} ${formatGbpPlain(modelAmount(gmv, s.pct))}`)
    .join(' · ')
}

function formatGbpPlain(n: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
  }).format(n)
}

export function shortStageLabel(name: string): string {
  return name.replace(/^T\d+\s*/, '')
}

export function pctSumDelta(sum: number): {
  ok: boolean
  label: string
} {
  const delta = 100 - sum
  if (delta === 0) return { ok: true, label: '100%' }
  if (delta > 0) return { ok: false, label: `${delta}% left` }
  return { ok: false, label: `${Math.abs(delta)}% over` }
}

/** Effective £ for a stage (invoice wins only when adopted). */
export function effectiveStageAmount(stage: JobDeliveryStage): number {
  if (stage.name === 'Complete') return 0
  if (stage.amountSource === 'invoice' && stage.invoiceAmount != null) {
    return stage.invoiceAmount
  }
  return stage.amount
}

export function paymentStages(stages: JobDeliveryStage[]): JobDeliveryStage[] {
  return stages.filter((s) => s.name !== 'Complete')
}

/** True while any payment stage is still model-derived. */
export function hasApproximateAmounts(stages: JobDeliveryStage[]): boolean {
  return paymentStages(stages).some((s) => s.amountSource !== 'invoice')
}

/** Invoice landed but disagrees with model, not yet resolved. */
export function hasInvoiceConflict(stage: JobDeliveryStage): boolean {
  if (stage.invoiceAmount == null) return false
  if (stage.conflictResolved) return false
  if (stage.amountSource === 'invoice') return false
  return stage.invoiceAmount !== stage.amount
}

export function deriveCommissionAmount(
  gmv: number,
  commissionPct: number,
  stages: JobDeliveryStage[],
): number {
  const pay = paymentStages(stages)
  const allModelled = pay.every((s) => s.amountSource === 'model')
  if (allModelled) {
    return Math.round((gmv * commissionPct) / 100)
  }
  const actuals = pay.reduce((sum, s) => sum + effectiveStageAmount(s), 0)
  return Math.round((actuals * commissionPct) / 100)
}

export function deriveDueNow(stages: JobDeliveryStage[]): number {
  const next =
    stages.find((s) => s.status === 'next') ??
    stages.find((s) => s.status === 'upcoming' && s.name !== 'Complete')
  if (!next || next.name === 'Complete') return 0
  return effectiveStageAmount(next)
}

function buildStageFromDef(
  def: PaymentModelStageDef,
  gmv: number,
  prev: JobDeliveryStage | undefined,
): JobDeliveryStage {
  const modelled = modelAmount(gmv, def.pct)
  if (prev?.amountSource === 'invoice' && prev.invoiceAmount != null) {
    return {
      ...prev,
      name: def.name,
      pct: def.pct,
      amount: prev.invoiceAmount,
      confidence: 'confirmed',
      confidenceReason: 'invoice',
    }
  }
  return {
    name: def.name,
    pct: def.pct,
    amount: modelled,
    date: prev?.date ?? '',
    est: prev?.est ?? true,
    status: prev?.status ?? 'upcoming',
    invoiceAmount: prev?.invoiceAmount ?? null,
    amountSource: 'model',
    confidence: prev?.confidence ?? 'estimated',
    confidenceReason: prev?.confidenceReason ?? 'model',
  }
}

/** Re-derive every stage £ from GMV × model %; dates/status preserved. */
export function applyPaymentModelToJob(
  job: JobDeliveryDetail,
  model: PaymentModel,
): JobDeliveryDetail {
  const byName = new Map(job.stages.map((s) => [s.name, s] as const))
  const complete = job.stages.find((s) => s.name === 'Complete')

  const stages: JobDeliveryStage[] = model.stages.map((def) =>
    buildStageFromDef(def, job.gmv, byName.get(def.name)),
  )

  if (complete) {
    stages.push(complete)
  }

  const dueNow =
    job.confirmStatus === 'settled' ? 0 : deriveDueNow(stages)
  const commissionAmount = deriveCommissionAmount(
    job.gmv,
    job.commissionPct,
    stages,
  )

  return {
    ...job,
    model,
    stages,
    dueNow,
    commissionAmount:
      job.confirmStatus === 'settled' ? 0 : commissionAmount,
  }
}

/** Attach an uploaded invoice to a stage; conflict if £ ≠ model. */
export function ingestInvoice(
  job: JobDeliveryDetail,
  stageName: string,
  invoiceAmount: number,
): JobDeliveryDetail {
  const stages = job.stages.map((s) => {
    if (s.name !== stageName) return s
    const modelled = modelAmount(job.gmv, s.pct)
    const matches = invoiceAmount === modelled
    const nextStatus =
      s.status === 'paid'
        ? s.status
        : s.status === 'upcoming' || s.status === 'next'
          ? ('invoiced' as const)
          : s.status
    if (matches) {
      return {
        ...s,
        amount: invoiceAmount,
        invoiceAmount,
        amountSource: 'invoice' as const,
        conflictResolved: 'invoice' as const,
        status: nextStatus,
        est: false,
        confidence: 'confirmed' as const,
        confidenceReason: 'invoice' as const,
      }
    }
    return {
      ...s,
      amount: modelled,
      invoiceAmount,
      amountSource: 'model' as const,
      conflictResolved: null,
      status: nextStatus,
      est: false,
      confidence: 'confirmed' as const,
      confidenceReason: 'invoice' as const,
    }
  })

  return refreshJobMoney({
    ...job,
    stages,
  })
}

export function adoptInvoiceAmount(
  job: JobDeliveryDetail,
  stageName: string,
): JobDeliveryDetail {
  const stages = job.stages.map((s) => {
    if (s.name !== stageName || s.invoiceAmount == null) return s
    return {
      ...s,
      amount: s.invoiceAmount,
      amountSource: 'invoice' as const,
      conflictResolved: 'invoice' as const,
      confidence: 'confirmed' as const,
      confidenceReason: 'invoice' as const,
    }
  })
  return {
    ...job,
    stages,
    dueNow: job.confirmStatus === 'settled' ? 0 : deriveDueNow(stages),
    commissionAmount:
      job.confirmStatus === 'settled'
        ? 0
        : deriveCommissionAmount(job.gmv, job.commissionPct, stages),
  }
}

export function keepModelAmount(
  job: JobDeliveryDetail,
  stageName: string,
): JobDeliveryDetail {
  const stages = job.stages.map((s) => {
    if (s.name !== stageName) return s
    return {
      ...s,
      amountSource: 'model' as const,
      conflictResolved: 'model' as const,
    }
  })
  return {
    ...job,
    stages,
    dueNow: job.confirmStatus === 'settled' ? 0 : deriveDueNow(stages),
    commissionAmount:
      job.confirmStatus === 'settled'
        ? 0
        : deriveCommissionAmount(job.gmv, job.commissionPct, stages),
  }
}

export function refreshJobMoney(job: JobDeliveryDetail): JobDeliveryDetail {
  const dueNow =
    job.confirmStatus === 'settled' ? 0 : deriveDueNow(job.stages)
  return {
    ...job,
    dueNow,
    commissionAmount:
      job.confirmStatus === 'settled'
        ? 0
        : deriveCommissionAmount(job.gmv, job.commissionPct, job.stages),
  }
}
