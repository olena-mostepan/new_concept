import type { DeliveryClaim } from './types'
import type { JobDeliveryDetail, JobDeliveryStage } from './job-types'
import {
  PAYMENT_MODELS,
  deriveCommissionAmount,
  deriveDueNow,
  effectiveStageAmount,
  modelAmount,
  refreshJobMoney,
} from './payment-model'

const STANDARD = PAYMENT_MODELS.find((m) => m.id === 'standard')!
const EVEN = PAYMENT_MODELS.find((m) => m.id === 'even')!
const FRONT = PAYMENT_MODELS.find((m) => m.id === 'frontloaded')!

function stage(
  name: string,
  pct: number,
  gmv: number,
  date: string,
  status: JobDeliveryStage['status'],
  opts: {
    est?: boolean
    invoiceAmount?: number | null
    amountSource?: JobDeliveryStage['amountSource']
    confidence?: JobDeliveryStage['confidence']
    confidenceReason?: JobDeliveryStage['confidenceReason']
  } = {},
): JobDeliveryStage {
  const modelled = modelAmount(gmv, pct)
  const amountSource = opts.amountSource ?? 'model'
  const invoiceAmount =
    opts.invoiceAmount === undefined ? null : opts.invoiceAmount
  const amount =
    amountSource === 'invoice' && invoiceAmount != null
      ? invoiceAmount
      : modelled
  const confidence =
    opts.confidence ??
    (amountSource === 'invoice' || invoiceAmount != null
      ? 'confirmed'
      : status === 'upcoming'
        ? 'estimated'
        : 'likely')
  const confidenceReason =
    opts.confidenceReason ??
    (amountSource === 'invoice' || invoiceAmount != null
      ? 'invoice'
      : confidence === 'likely'
        ? 'similar'
        : 'model')
  return {
    name,
    pct,
    amount,
    date,
    est: opts.est ?? status === 'upcoming',
    status,
    invoiceAmount,
    amountSource,
    confidence,
    confidenceReason,
  }
}

function completeStage(
  date: string,
  status: JobDeliveryStage['status'] = 'upcoming',
  est = true,
): JobDeliveryStage {
  return {
    name: 'Complete',
    pct: 0,
    amount: 0,
    date,
    est,
    status,
    invoiceAmount: null,
    amountSource: 'model',
    confidence: 'estimated',
    confidenceReason: 'model',
  }
}

function withMoney(
  job: Omit<JobDeliveryDetail, 'commissionAmount' | 'dueNow'> & {
    commissionAmount?: number
    dueNow?: number
  },
): JobDeliveryDetail {
  const dueNow =
    job.dueNow ??
    (job.confirmStatus === 'settled' ? 0 : deriveDueNow(job.stages))
  const commissionAmount =
    job.commissionAmount ??
    (job.confirmStatus === 'settled'
      ? 0
      : deriveCommissionAmount(job.gmv, job.commissionPct, job.stages))
  return { ...job, dueNow, commissionAmount }
}

/** Main list + detail jobs. Sibling sites share a programme for apply-to-many. */
export const JOB_DELIVERY_BY_ID: Record<string, JobDeliveryDetail> = {
  // —— Höhe Solar Portfolio (front-loaded 40/30/20/10 · 6%) ——
  'claim-solar-hohe': withMoney({
    id: 'claim-solar-hohe',
    programme: 'Höhe Solar Portfolio',
    solution: 'Solar PV',
    property: 'Höhe',
    location: 'Frankfurt',
    customer: { name: 'Höhe Immobilien GmbH' },
    supplier: { name: 'Arin Power' },
    lifecycleStatus: 'in delivery',
    overview: {
      type: 'Solar PV',
      sizeOfInstallation: '140 kWp',
      roofCovering: 'Single-Ply',
      usableRoofArea: '780 m²',
      photoUrl:
        'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=640&h=400&fit=crop',
    },
    gmv: 312000,
    commissionPct: 6,
    model: FRONT,
    startDate: '2026-07-01',
    currentStage: 'T2 Prior to install',
    daysInPhase: 12,
    confirmStatus: 'confirmable',
    confidence: 'high',
    stages: [
      stage('T1 Order', 40, 312000, '2026-07-01', 'paid', {
        est: false,
        invoiceAmount: 124800,
        amountSource: 'invoice',
      }),
      stage('T2 Prior to install', 30, 312000, '2026-07-28', 'next', {
        est: false,
        confidence: 'likely',
        confidenceReason: 'external',
      }),
      stage('T3 Energise', 20, 312000, '2026-08-20', 'upcoming', {
        est: true,
        confidence: 'estimated',
        confidenceReason: 'model',
      }),
      stage('T4 Handover', 10, 312000, '2026-09-10', 'upcoming', {
        est: true,
        confidence: 'estimated',
        confidenceReason: 'model',
      }),
    ],
  }),
  'claim-solar-hohe-annex': withMoney({
    id: 'claim-solar-hohe-annex',
    programme: 'Höhe Solar Portfolio',
    solution: 'Solar PV',
    property: 'Höhe Annex',
    location: 'Frankfurt',
    customer: { name: 'Höhe Immobilien GmbH' },
    supplier: { name: 'Arin Power' },
    lifecycleStatus: 'in delivery',
    overview: {
      type: 'Solar PV',
      sizeOfInstallation: '60 kWp',
      roofCovering: 'Metal',
      usableRoofArea: '320 m²',
      photoUrl:
        'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=640&h=400&fit=crop',
    },
    gmv: 128000,
    commissionPct: 6,
    model: FRONT,
    startDate: '2026-08-01',
    currentStage: 'T1 Order',
    daysInPhase: 4,
    confirmStatus: 'confirmable',
    confidence: 'medium',
    stages: [
      stage('T1 Order', 40, 128000, '2026-08-01', 'next', { est: false }),
      stage('T2 Prior to install', 30, 128000, '2026-08-25', 'upcoming', {
        est: true,
      }),
      stage('T3 Energise', 20, 128000, '2026-09-20', 'upcoming', {
        est: true,
      }),
      stage('T4 Handover', 10, 128000, '2026-10-10', 'upcoming', {
        est: true,
      }),
    ],
  }),

  // —— Midsummer Retrofit (even 25×4 · 5%) ——
  'claim-ashp-midsummer': withMoney({
    id: 'claim-ashp-midsummer',
    programme: 'Midsummer Retrofit',
    solution: 'ASHP',
    property: 'Midsummer Place',
    location: 'Milton Keynes',
    customer: { name: 'Midsummer Estates Ltd' },
    supplier: { name: 'Arin Power' },
    lifecycleStatus: 'in delivery',
    overview: {
      type: 'ASHP',
      sizeOfInstallation: '85 kW',
      roofCovering: 'n/a',
      usableRoofArea: 'n/a',
      photoUrl:
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=640&h=400&fit=crop',
    },
    gmv: 164800,
    commissionPct: 5,
    model: EVEN,
    startDate: '2026-07-01',
    currentStage: 'T3 Energise',
    daysInPhase: 5,
    confirmStatus: 'future',
    confidence: 'high',
    stages: [
      stage('T1 Order', 25, 164800, '2026-07-01', 'paid', {
        est: false,
        invoiceAmount: 41200,
        amountSource: 'invoice',
      }),
      stage('T2 Prior to install', 25, 164800, '2026-07-20', 'invoiced', {
        est: false,
        // Model £41,200 · invoice £39,800 — unresolved conflict
        invoiceAmount: 39800,
        amountSource: 'model',
      }),
      stage('T3 Energise', 25, 164800, '2026-08-12', 'next', {
        est: true,
        confidence: 'likely',
        confidenceReason: 'similar',
      }),
      stage('T4 Handover', 25, 164800, '2026-09-01', 'upcoming', {
        est: true,
        confidence: 'estimated',
        confidenceReason: 'model',
      }),
      completeStage('2026-09-15'),
    ],
  }),
  'claim-ashp-midsummer-block-b': withMoney({
    id: 'claim-ashp-midsummer-block-b',
    programme: 'Midsummer Retrofit',
    solution: 'ASHP',
    property: 'Midsummer Block B',
    location: 'Milton Keynes',
    customer: { name: 'Midsummer Estates Ltd' },
    supplier: { name: 'Arin Power' },
    lifecycleStatus: 'in delivery',
    overview: {
      type: 'ASHP',
      sizeOfInstallation: '55 kW',
      roofCovering: 'n/a',
      usableRoofArea: 'n/a',
      photoUrl:
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=640&h=400&fit=crop',
    },
    gmv: 98000,
    commissionPct: 5,
    model: EVEN,
    startDate: '2026-08-10',
    currentStage: 'T1 Order',
    daysInPhase: 2,
    confirmStatus: 'future',
    confidence: 'medium',
    stages: [
      stage('T1 Order', 25, 98000, '2026-08-10', 'next', { est: true }),
      stage('T2 Prior to install', 25, 98000, '2026-09-01', 'upcoming', {
        est: true,
      }),
      stage('T3 Energise', 25, 98000, '2026-09-28', 'upcoming', {
        est: true,
      }),
      stage('T4 Handover', 25, 98000, '2026-10-20', 'upcoming', {
        est: true,
      }),
      completeStage('2026-11-05'),
    ],
  }),

  // —— Navale Lighting (standard 35/35/25/5 · 6%) ——
  'claim-led-navale': withMoney({
    id: 'claim-led-navale',
    programme: 'Navale Lighting',
    solution: 'LED',
    property: 'Navale',
    location: 'Hamburg',
    customer: { name: 'Navale Logistics AG' },
    supplier: { name: 'Arin Power' },
    lifecycleStatus: 'in delivery',
    overview: {
      type: 'LED',
      sizeOfInstallation: '2,100 fittings',
      roofCovering: 'n/a',
      usableRoofArea: 'n/a',
      photoUrl:
        'https://images.unsplash.com/photo-1497366216548-37526070297c?w=640&h=400&fit=crop',
    },
    gmv: 35600,
    commissionPct: 6,
    model: STANDARD,
    startDate: '2026-04-01',
    currentStage: 'T4 Handover',
    daysInPhase: 34,
    confirmStatus: 'stuck',
    confidence: 'high',
    daysStuck: 34,
    stages: [
      stage('T1 Order', 35, 35600, '2026-04-01', 'paid', {
        est: false,
        invoiceAmount: 12460,
        amountSource: 'invoice',
      }),
      stage('T2 Prior to install', 35, 35600, '2026-05-15', 'paid', {
        est: false,
        invoiceAmount: 12460,
        amountSource: 'invoice',
      }),
      // Model £8,900 · invoice £8,450 — unresolved conflict
      stage('T3 Energise', 25, 35600, '2026-06-15', 'invoiced', {
        est: false,
        invoiceAmount: 8450,
        amountSource: 'model',
      }),
      stage('T4 Handover', 5, 35600, '2026-07-01', 'next', {
        est: false,
        confidence: 'estimated',
        confidenceReason: 'model',
      }),
      completeStage('2026-07-20'),
    ],
  }),
  'claim-led-navale-dock': withMoney({
    id: 'claim-led-navale-dock',
    programme: 'Navale Lighting',
    solution: 'LED',
    property: 'Navale Dock',
    location: 'Hamburg',
    customer: { name: 'Navale Logistics AG' },
    supplier: { name: 'Arin Power' },
    lifecycleStatus: 'in delivery',
    overview: {
      type: 'LED',
      sizeOfInstallation: '980 fittings',
      roofCovering: 'n/a',
      usableRoofArea: 'n/a',
      photoUrl:
        'https://images.unsplash.com/photo-1497366216548-37526070297c?w=640&h=400&fit=crop',
    },
    gmv: 18400,
    commissionPct: 6,
    model: STANDARD,
    startDate: '2026-05-01',
    currentStage: 'T2 Prior to install',
    daysInPhase: 8,
    confirmStatus: 'future',
    confidence: 'high',
    stages: [
      stage('T1 Order', 35, 18400, '2026-05-01', 'paid', {
        est: false,
        invoiceAmount: 6440,
        amountSource: 'invoice',
      }),
      stage('T2 Prior to install', 35, 18400, '2026-06-20', 'next', {
        est: false,
      }),
      stage('T3 Energise', 25, 18400, '2026-07-25', 'upcoming', {
        est: true,
      }),
      stage('T4 Handover', 5, 18400, '2026-08-15', 'upcoming', {
        est: true,
      }),
      completeStage('2026-08-30'),
    ],
  }),
  'claim-led-navale-yard': withMoney({
    id: 'claim-led-navale-yard',
    programme: 'Navale Lighting',
    solution: 'LED',
    property: 'Navale Yard',
    location: 'Hamburg',
    customer: { name: 'Navale Logistics AG' },
    supplier: { name: 'Arin Power' },
    lifecycleStatus: 'in delivery',
    overview: {
      type: 'LED',
      sizeOfInstallation: '640 fittings',
      roofCovering: 'n/a',
      usableRoofArea: 'n/a',
      photoUrl:
        'https://images.unsplash.com/photo-1497366216548-37526070297c?w=640&h=400&fit=crop',
    },
    gmv: 12800,
    commissionPct: 6,
    model: STANDARD,
    startDate: '2026-06-01',
    currentStage: 'T1 Order',
    daysInPhase: 3,
    confirmStatus: 'confirmable',
    confidence: 'medium',
    stages: [
      stage('T1 Order', 35, 12800, '2026-06-01', 'next', { est: false }),
      stage('T2 Prior to install', 35, 12800, '2026-07-10', 'upcoming', {
        est: true,
      }),
      stage('T3 Energise', 25, 12800, '2026-08-05', 'upcoming', {
        est: true,
      }),
      stage('T4 Handover', 5, 12800, '2026-08-25', 'upcoming', {
        est: true,
      }),
      completeStage('2026-09-10'),
    ],
  }),

  // —— Port EV Rollout (even 25×4 · 5%) ——
  'claim-ev-bremerhaven': withMoney({
    id: 'claim-ev-bremerhaven',
    programme: 'Port EV Rollout',
    solution: 'EV Chargers',
    property: 'Bremerhaven',
    location: 'Bremerhaven',
    customer: { name: 'NordHafen GmbH' },
    supplier: { name: 'Arin Power' },
    lifecycleStatus: 'in delivery',
    overview: {
      type: 'EV Chargers',
      sizeOfInstallation: '12 chargers',
      roofCovering: 'n/a',
      usableRoofArea: 'n/a',
      photoUrl:
        'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=640&h=400&fit=crop',
    },
    gmv: 114000,
    commissionPct: 5,
    model: EVEN,
    startDate: '2026-07-20',
    currentStage: 'T1 Order',
    daysInPhase: 0,
    confirmStatus: 'not_started',
    confidence: 'medium',
    stages: [
      stage('T1 Order', 25, 114000, '2026-07-20', 'next', { est: true }),
      stage('T2 Prior to install', 25, 114000, '2026-08-15', 'upcoming', {
        est: true,
      }),
      stage('T3 Energise', 25, 114000, '2026-09-20', 'upcoming', {
        est: true,
      }),
      stage('T4 Handover', 25, 114000, '2026-10-10', 'upcoming', {
        est: true,
      }),
      completeStage('2026-10-28'),
    ],
  }),
  'claim-ev-cuxhaven': withMoney({
    id: 'claim-ev-cuxhaven',
    programme: 'Port EV Rollout',
    solution: 'EV Chargers',
    property: 'Cuxhaven',
    location: 'Cuxhaven',
    customer: { name: 'NordHafen GmbH' },
    supplier: { name: 'Arin Power' },
    lifecycleStatus: 'in delivery',
    overview: {
      type: 'EV Chargers',
      sizeOfInstallation: '8 chargers',
      roofCovering: 'n/a',
      usableRoofArea: 'n/a',
      photoUrl:
        'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=640&h=400&fit=crop',
    },
    gmv: 76000,
    commissionPct: 5,
    model: EVEN,
    startDate: '2026-08-05',
    currentStage: 'T1 Order',
    daysInPhase: 0,
    confirmStatus: 'not_started',
    confidence: 'medium',
    stages: [
      stage('T1 Order', 25, 76000, '2026-08-05', 'next', { est: true }),
      stage('T2 Prior to install', 25, 76000, '2026-08-28', 'upcoming', {
        est: true,
      }),
      stage('T3 Energise', 25, 76000, '2026-09-25', 'upcoming', {
        est: true,
      }),
      stage('T4 Handover', 25, 76000, '2026-10-18', 'upcoming', {
        est: true,
      }),
      completeStage('2026-11-02'),
    ],
  }),

  // —— Retail Park Storage (even 25×4 · 5% · settled) ——
  'claim-battery-retail': withMoney({
    id: 'claim-battery-retail',
    programme: 'Retail Park Storage',
    solution: 'Battery Storage',
    property: 'Retail Park',
    location: 'Leeds',
    customer: { name: 'Parkside Retail Ltd' },
    supplier: { name: 'Arin Power' },
    lifecycleStatus: 'complete',
    overview: {
      type: 'Battery Storage',
      sizeOfInstallation: '500 kWh',
      roofCovering: 'n/a',
      usableRoofArea: 'n/a',
      photoUrl:
        'https://images.unsplash.com/photo-1460317442991-0ec209397118?w=640&h=400&fit=crop',
    },
    gmv: 53400,
    commissionPct: 5,
    model: EVEN,
    startDate: '2026-02-01',
    currentStage: 'Complete',
    daysInPhase: 0,
    confirmStatus: 'settled',
    confidence: 'high',
    commissionAmount: 0,
    dueNow: 0,
    stages: [
      stage('T1 Order', 25, 53400, '2026-02-01', 'paid', {
        est: false,
        invoiceAmount: 13350,
        amountSource: 'invoice',
      }),
      stage('T2 Prior to install', 25, 53400, '2026-03-01', 'paid', {
        est: false,
        invoiceAmount: 13350,
        amountSource: 'invoice',
      }),
      stage('T3 Energise', 25, 53400, '2026-04-01', 'paid', {
        est: false,
        invoiceAmount: 13350,
        amountSource: 'invoice',
      }),
      stage('T4 Handover', 25, 53400, '2026-05-01', 'paid', {
        est: false,
        invoiceAmount: 13350,
        amountSource: 'invoice',
      }),
      completeStage('2026-05-20', 'paid', false),
    ],
  }),
  'claim-battery-retail-phase-2': withMoney({
    id: 'claim-battery-retail-phase-2',
    programme: 'Retail Park Storage',
    solution: 'Battery Storage',
    property: 'Retail Park Phase 2',
    location: 'Leeds',
    customer: { name: 'Parkside Retail Ltd' },
    supplier: { name: 'Arin Power' },
    lifecycleStatus: 'in delivery',
    overview: {
      type: 'Battery Storage',
      sizeOfInstallation: '250 kWh',
      roofCovering: 'n/a',
      usableRoofArea: 'n/a',
      photoUrl:
        'https://images.unsplash.com/photo-1460317442991-0ec209397118?w=640&h=400&fit=crop',
    },
    gmv: 26800,
    commissionPct: 5,
    model: EVEN,
    startDate: '2026-06-15',
    currentStage: 'T2 Prior to install',
    daysInPhase: 6,
    confirmStatus: 'confirmable',
    confidence: 'high',
    stages: [
      stage('T1 Order', 25, 26800, '2026-06-15', 'paid', {
        est: false,
        invoiceAmount: 6700,
        amountSource: 'invoice',
      }),
      stage('T2 Prior to install', 25, 26800, '2026-07-10', 'next', {
        est: false,
      }),
      stage('T3 Energise', 25, 26800, '2026-08-05', 'upcoming', {
        est: true,
      }),
      stage('T4 Handover', 25, 26800, '2026-08-28', 'upcoming', {
        est: true,
      }),
      completeStage('2026-09-12'),
    ],
  }),
}

/** Primary claims shown on the supplier Delivery list. */
export const LIST_JOB_IDS = [
  'claim-solar-hohe',
  'claim-ashp-midsummer',
  'claim-led-navale',
  'claim-ev-bremerhaven',
  'claim-battery-retail',
] as const

export function getJobDelivery(id: string): JobDeliveryDetail | null {
  return JOB_DELIVERY_BY_ID[id] ?? null
}

export function jobTitle(job: JobDeliveryDetail): string {
  return `${job.solution} — ${job.property}`
}

export function jobSubtitle(job: JobDeliveryDetail): string {
  return `${job.solution} · ${job.location} · Supplier: ${job.supplier.name} · ${job.lifecycleStatus}`
}

/** Adapt job payload to DeliveryClaim so shared modals / PATCH shape stay unchanged. */
export function jobToDeliveryClaim(job: JobDeliveryDetail): DeliveryClaim {
  const actionable =
    job.stages.find((s) => s.status === 'next') ??
    job.stages.find((s) => s.status === 'upcoming')
  const pay = job.stages.filter((s) => s.name !== 'Complete')

  return {
    id: job.id,
    job: jobTitle(job),
    currentStage: job.currentStage,
    stages: pay.map((s) => ({
      name: s.name,
      projectedDate: s.date,
      done: s.status === 'paid' || s.status === 'invoiced',
    })),
    projectedDate: actionable?.date ?? job.stages[0]?.date ?? '',
    amount:
      job.dueNow > 0
        ? job.dueNow
        : actionable
          ? effectiveStageAmount(actionable)
          : 0,
    status: job.confirmStatus,
    confidence: job.confidence,
    daysStuck: job.daysStuck,
  }
}

export function paymentStageCount(stages: JobDeliveryStage[]): number {
  return stages.filter((s) => s.name !== 'Complete' && s.pct > 0).length
}

export function confirmJobStage(job: JobDeliveryDetail): JobDeliveryDetail {
  const nextIdx = job.stages.findIndex((s) => s.status === 'next')
  if (nextIdx < 0) {
    return refreshJobMoney({ ...job, confirmStatus: 'settled', dueNow: 0 })
  }

  const stages = job.stages.map((s, i) => {
    if (i < nextIdx) return s
    if (i === nextIdx) return { ...s, status: 'invoiced' as const, est: false }
    if (i === nextIdx + 1 && s.name !== 'Complete') {
      return { ...s, status: 'next' as const }
    }
    if (i === nextIdx + 1 && s.name === 'Complete') {
      return { ...s, status: 'next' as const }
    }
    return s
  })

  const newNext = stages.find((s) => s.status === 'next')
  const allPaymentDone = stages
    .filter((s) => s.name !== 'Complete')
    .every((s) => s.status === 'paid' || s.status === 'invoiced')

  if (allPaymentDone) {
    return refreshJobMoney({
      ...job,
      stages: stages.map((s) =>
        s.name === 'Complete'
          ? { ...s, status: 'paid' as const, est: false }
          : s,
      ),
      currentStage: 'Complete',
      dueNow: 0,
      confirmStatus: 'settled',
      lifecycleStatus: 'complete',
      daysInPhase: 0,
      daysStuck: undefined,
      commissionAmount: 0,
    })
  }

  const dueNow =
    newNext && newNext.name !== 'Complete'
      ? effectiveStageAmount(newNext)
      : 0

  return refreshJobMoney({
    ...job,
    stages,
    currentStage: newNext?.name ?? job.currentStage,
    dueNow,
    confirmStatus: dueNow > 0 ? 'confirmable' : 'future',
    daysInPhase: dueNow > 0 ? 0 : job.daysInPhase,
    daysStuck: undefined,
  })
}

/** Jobs in the same programme (batch) — for apply-to-many. */
export function jobsInProgramme(programme: string): JobDeliveryDetail[] {
  return Object.values(JOB_DELIVERY_BY_ID).filter(
    (j) => j.programme === programme,
  )
}

export function allJobOptions(): Array<{ id: string; label: string }> {
  return Object.values(JOB_DELIVERY_BY_ID).map((j) => ({
    id: j.id,
    label: jobTitle(j),
  }))
}
