import type {
  CustomerDeliveryPayload,
  CustomerPhaseNode,
  CustomerProject,
} from './types'

function phases(
  nodes: Array<
    Omit<CustomerPhaseNode, 'shortLabel'> & { shortLabel?: string }
  >,
): CustomerPhaseNode[] {
  return nodes.map((n) => ({
    ...n,
    shortLabel: n.shortLabel ?? n.label,
  }))
}

const PROJECTS: CustomerProject[] = [
  {
    id: 'hvac-zeitz-nord',
    name: 'HVAC – Zeitz Nord',
    batchId: 'batch-hvac-zeitz',
    solution: 'HVAC',
    location: 'Zeitz, Germany',
    supplier: 'Arin Power',
    startDate: '2025-09-12',
    startConfirmed: true,
    valueLabel: '€420k',
    overview: {
      type: 'HVAC',
      sizeOfInstallation: '180 kW',
      property: 'Zeitz Nord warehouse',
      contractValue: '€420k',
      photoUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=640&h=400&fit=crop',
    },
    currentPhaseId: 'phase2',
    insight: 'on_track',
    insightLabel: 'On track',
    needsConfirm: true,
    confirmBanner: {
      phaseLabel: 'Installation phase',
      nextAround: '18 Nov 2025',
    },
    phases: phases([
      {
        id: 'start',
        label: 'Kick-off phase',
        shortLabel: 'Kick-off',
        date: '2025-09-12',
        status: 'done',
      },
      {
        id: 'phase1',
        label: 'Design & survey phase',
        shortLabel: 'Design',
        date: '2025-10-03',
        status: 'done',
      },
      {
        id: 'phase2',
        label: 'Installation phase',
        shortLabel: 'Installation',
        date: '2025-11-18',
        status: 'current',
        daysInPhase: 12,
      },
      {
        id: 'phase3',
        label: 'Commissioning phase',
        shortLabel: 'Commissioning',
        date: '2026-01-20',
        status: 'upcoming',
      },
      {
        id: 'phase4',
        label: 'Handover phase',
        shortLabel: 'Handover',
        date: '2026-02-28',
        status: 'upcoming',
      },
      {
        id: 'complete',
        label: 'Complete',
        shortLabel: 'Complete',
        date: null,
        status: 'upcoming',
      },
    ]),
    keyDates: {
      start: { date: '2025-09-12', state: 'confirmed' },
      expectedCompletion: { date: '2026-02-28', state: 'estimate' },
      lastStageChange: { date: '2025-11-06', state: 'from_invoice' },
    },
  },
  {
    id: 'hvac-zeitz-sued',
    name: 'HVAC – Zeitz Süd',
    batchId: 'batch-hvac-zeitz',
    solution: 'HVAC',
    location: 'Zeitz, Germany',
    supplier: 'Arin Power',
    startDate: '2025-10-01',
    startConfirmed: false,
    valueLabel: '€310k',
    overview: {
      type: 'HVAC',
      sizeOfInstallation: '140 kW',
      property: 'Zeitz Süd logistics hub',
      contractValue: '€310k',
      photoUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=640&h=400&fit=crop',
    },
    currentPhaseId: 'start',
    insight: 'awaiting_start',
    insightLabel: 'Awaiting start',
    needsConfirm: true,
    confirmBanner: {
      phaseLabel: 'Kick-off phase',
      nextAround: '1 Oct 2025',
    },
    phases: phases([
      {
        id: 'start',
        label: 'Kick-off phase',
        shortLabel: 'Kick-off',
        date: '2025-10-01',
        status: 'current',
        daysInPhase: 0,
      },
      {
        id: 'phase1',
        label: 'Design & survey phase',
        shortLabel: 'Design',
        date: '2025-10-20',
        status: 'upcoming',
      },
      {
        id: 'phase2',
        label: 'Installation phase',
        shortLabel: 'Installation',
        date: '2025-12-05',
        status: 'upcoming',
      },
      {
        id: 'phase3',
        label: 'Commissioning phase',
        shortLabel: 'Commissioning',
        date: '2026-01-30',
        status: 'upcoming',
      },
      {
        id: 'phase4',
        label: 'Handover phase',
        shortLabel: 'Handover',
        date: '2026-03-15',
        status: 'upcoming',
      },
      {
        id: 'complete',
        label: 'Complete',
        shortLabel: 'Complete',
        date: null,
        status: 'upcoming',
      },
    ]),
    keyDates: {
      start: { date: '2025-10-01', state: 'needs_confirm' },
      expectedCompletion: { date: '2026-03-15', state: 'estimate' },
      lastStageChange: { date: null, state: 'estimate' },
    },
  },
  {
    id: 'hvac-zeitz-mitte',
    name: 'HVAC – Zeitz Mitte',
    batchId: 'batch-hvac-zeitz',
    solution: 'HVAC',
    location: 'Zeitz, Germany',
    supplier: 'ThermoTech',
    startDate: '2025-08-04',
    startConfirmed: true,
    valueLabel: '€275k',
    overview: {
      type: 'HVAC',
      sizeOfInstallation: '110 kW',
      property: 'Zeitz Mitte offices',
      contractValue: '€275k',
      photoUrl: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=640&h=400&fit=crop',
    },
    currentPhaseId: 'phase3',
    insight: 'overdue',
    insightLabel: 'Overdue',
    needsConfirm: true,
    confirmBanner: {
      phaseLabel: 'Commissioning phase',
      nextAround: '10 Dec 2025',
    },
    phases: phases([
      {
        id: 'start',
        label: 'Kick-off phase',
        shortLabel: 'Kick-off',
        date: '2025-08-04',
        status: 'done',
      },
      {
        id: 'phase1',
        label: 'Design & survey phase',
        shortLabel: 'Design',
        date: '2025-08-28',
        status: 'done',
      },
      {
        id: 'phase2',
        label: 'Installation phase',
        shortLabel: 'Installation',
        date: '2025-10-15',
        status: 'done',
      },
      {
        id: 'phase3',
        label: 'Commissioning phase',
        shortLabel: 'Commissioning',
        date: '2025-11-20',
        status: 'current',
        daysInPhase: 45,
        overdue: true,
      },
      {
        id: 'phase4',
        label: 'Handover phase',
        shortLabel: 'Handover',
        date: '2026-01-10',
        status: 'upcoming',
      },
      {
        id: 'complete',
        label: 'Complete',
        shortLabel: 'Complete',
        date: null,
        status: 'upcoming',
      },
    ]),
    keyDates: {
      start: { date: '2025-08-04', state: 'confirmed' },
      expectedCompletion: { date: '2026-01-10', state: 'needs_confirm' },
      lastStageChange: { date: '2025-10-15', state: 'from_invoice' },
    },
  },
  {
    id: 'solar-walter-scott',
    name: 'Solar PV – Walter Scott House',
    batchId: 'batch-solar-pradera',
    solution: 'Solar PV',
    location: 'Edinburgh, UK',
    supplier: 'Arin Power',
    startDate: '2025-07-15',
    startConfirmed: true,
    valueLabel: '£186k',
    overview: {
      type: 'Solar PV',
      sizeOfInstallation: '210 kWp',
      property: 'Walter Scott House',
      contractValue: '£186k',
      photoUrl: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=640&h=400&fit=crop',
      details: [
        {
          label: 'Resilience type',
          value: 'Existing gas boilers retained/integrated as backup for peak demand.',
        },
        { label: 'Second stage required', value: 'No' },
        { label: 'Secondary plant required', value: 'Yes' },
        {
          label: 'Secondary plant description',
          value:
            'Include all plant and modifications required for a complete working system.',
        },
        {
          label: 'Refrigerant requirements',
          value: 'Prefer R290 or CO2 where feasible. Avoid high-GWP refrigerants.',
        },
      ],
    },
    currentPhaseId: 'phase2',
    insight: 'on_track',
    insightLabel: 'On track',
    needsConfirm: true,
    confirmBanner: {
      phaseLabel: 'Installation phase',
      nextAround: '22 Nov 2025',
    },
    note: 'These milestones are inferred from supplier progress and invoices — confirm if they look right.',
    phases: phases([
      {
        id: 'start',
        label: 'Kick-off phase',
        shortLabel: 'Kick-off',
        date: '2025-07-15',
        status: 'done',
      },
      {
        id: 'phase1',
        label: 'Design & survey phase',
        shortLabel: 'Design',
        date: '2025-08-20',
        status: 'done',
      },
      {
        id: 'phase2',
        label: 'Installation phase',
        shortLabel: 'Installation',
        date: '2025-10-28',
        status: 'current',
        daysInPhase: 18,
      },
      {
        id: 'phase3',
        label: 'Commissioning phase',
        shortLabel: 'Commissioning',
        date: '2025-12-12',
        status: 'upcoming',
      },
      {
        id: 'phase4',
        label: 'Handover phase',
        shortLabel: 'Handover',
        date: '2026-01-25',
        status: 'upcoming',
      },
      {
        id: 'complete',
        label: 'Complete',
        shortLabel: 'Complete',
        date: null,
        status: 'upcoming',
      },
    ]),
    keyDates: {
      start: { date: '2025-07-15', state: 'confirmed' },
      expectedCompletion: { date: '2026-01-25', state: 'estimate' },
      lastStageChange: { date: '2025-10-28', state: 'from_invoice' },
    },
  },
  {
    id: 'solar-pradera-west',
    name: 'Solar PV – Pradera West',
    batchId: 'batch-solar-pradera',
    solution: 'Solar PV',
    location: 'Glasgow, UK',
    supplier: 'Beka Solar',
    startDate: '2025-06-02',
    startConfirmed: true,
    valueLabel: '£240k',
    overview: {
      type: 'Solar PV',
      sizeOfInstallation: '320 kWp',
      property: 'Pradera West retail',
      contractValue: '£240k',
      photoUrl: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=640&h=400&fit=crop',
    },
    currentPhaseId: 'complete',
    insight: 'complete',
    insightLabel: 'Complete',
    needsConfirm: false,
    phases: phases([
      {
        id: 'start',
        label: 'Kick-off phase',
        shortLabel: 'Kick-off',
        date: '2025-06-02',
        status: 'done',
      },
      {
        id: 'phase1',
        label: 'Design & survey phase',
        shortLabel: 'Design',
        date: '2025-06-28',
        status: 'done',
      },
      {
        id: 'phase2',
        label: 'Installation phase',
        shortLabel: 'Installation',
        date: '2025-08-14',
        status: 'done',
      },
      {
        id: 'phase3',
        label: 'Commissioning phase',
        shortLabel: 'Commissioning',
        date: '2025-09-20',
        status: 'done',
      },
      {
        id: 'phase4',
        label: 'Handover phase',
        shortLabel: 'Handover',
        date: '2025-10-10',
        status: 'done',
      },
      {
        id: 'complete',
        label: 'Complete',
        shortLabel: 'Complete',
        date: '2025-10-18',
        status: 'done',
      },
    ]),
    keyDates: {
      start: { date: '2025-06-02', state: 'confirmed' },
      expectedCompletion: { date: '2025-10-18', state: 'confirmed' },
      lastStageChange: { date: '2025-10-18', state: 'confirmed' },
    },
  },
  {
    id: 'solar-pradera-east',
    name: 'Solar PV – Pradera East',
    batchId: 'batch-solar-pradera',
    solution: 'Solar PV',
    location: 'Edinburgh, UK',
    supplier: 'Arin Power',
    startDate: null,
    startConfirmed: false,
    valueLabel: '£155k',
    overview: {
      type: 'Solar PV',
      sizeOfInstallation: '175 kWp',
      property: 'Pradera East car park',
      contractValue: '£155k',
      photoUrl: 'https://images.unsplash.com/photo-1559302504-64aae6ca6b6d?w=640&h=400&fit=crop',
    },
    currentPhaseId: 'start',
    insight: 'awaiting_start',
    insightLabel: 'Awaiting start',
    needsConfirm: true,
    confirmBanner: {
      phaseLabel: 'Kick-off phase',
      nextAround: '5 Jan 2026',
    },
    phases: phases([
      {
        id: 'start',
        label: 'Kick-off phase',
        shortLabel: 'Kick-off',
        date: '2026-01-05',
        status: 'current',
      },
      {
        id: 'phase1',
        label: 'Design & survey phase',
        shortLabel: 'Design',
        date: '2026-01-26',
        status: 'upcoming',
      },
      {
        id: 'phase2',
        label: 'Installation phase',
        shortLabel: 'Installation',
        date: '2026-03-10',
        status: 'upcoming',
      },
      {
        id: 'phase3',
        label: 'Commissioning phase',
        shortLabel: 'Commissioning',
        date: '2026-04-20',
        status: 'upcoming',
      },
      {
        id: 'phase4',
        label: 'Handover phase',
        shortLabel: 'Handover',
        date: '2026-05-30',
        status: 'upcoming',
      },
      {
        id: 'complete',
        label: 'Complete',
        shortLabel: 'Complete',
        date: null,
        status: 'upcoming',
      },
    ]),
    keyDates: {
      start: { date: '2026-01-05', state: 'needs_confirm' },
      expectedCompletion: { date: '2026-05-30', state: 'estimate' },
      lastStageChange: { date: null, state: 'estimate' },
    },
  },
]

export const INITIAL_CUSTOMER_DELIVERY: CustomerDeliveryPayload = {
  customer: { id: 'energise', name: 'Energise' },
  datesNeedingConfirm: 5,
  batches: [
    {
      id: 'batch-hvac-zeitz',
      name: 'HVAC – Zeitz',
      locationSummary: 'Zeitz, Germany',
      projectCount: 3,
      valueLabel: '€1.0m',
      toConfirmCount: 3,
      projectIds: ['hvac-zeitz-nord', 'hvac-zeitz-sued', 'hvac-zeitz-mitte'],
    },
    {
      id: 'batch-solar-pradera',
      name: 'Solar / Pradera',
      locationSummary: 'UK portfolio',
      projectCount: 3,
      valueLabel: '£581k',
      toConfirmCount: 2,
      projectIds: [
        'solar-walter-scott',
        'solar-pradera-west',
        'solar-pradera-east',
      ],
    },
  ],
  projects: PROJECTS,
}

export function getCustomerProject(
  id: string,
  payload: CustomerDeliveryPayload = INITIAL_CUSTOMER_DELIVERY,
): CustomerProject | undefined {
  return payload.projects.find((p) => p.id === id)
}

export function getBatchForProject(
  project: CustomerProject,
  payload: CustomerDeliveryPayload = INITIAL_CUSTOMER_DELIVERY,
) {
  return payload.batches.find((b) => b.id === project.batchId)
}

export function projectSubtitle(project: CustomerProject): string {
  return `${project.solution} · ${project.location} · Supplier: ${project.supplier} · in delivery`
}

/** Client-side confirm helpers (mock PATCH) */
export function confirmProjectPhase(
  project: CustomerProject,
  dateIso?: string,
): CustomerProject {
  const date = dateIso ?? new Date().toISOString().slice(0, 10)
  const phases = project.phases.map((p) => {
    if (p.id === project.currentPhaseId) {
      return {
        ...p,
        date,
        overdue: false,
        daysInPhase: p.daysInPhase ?? 0,
      }
    }
    return p
  })
  return {
    ...project,
    needsConfirm: false,
    confirmBanner: undefined,
    startConfirmed:
      project.currentPhaseId === 'start' ? true : project.startConfirmed,
    startDate:
      project.currentPhaseId === 'start'
        ? date
        : project.startDate,
    insight: project.insight === 'awaiting_start' ? 'on_track' : project.insight,
    insightLabel:
      project.insight === 'awaiting_start' ? 'On track' : project.insightLabel,
    phases,
    keyDates: {
      ...project.keyDates,
      start:
        project.currentPhaseId === 'start'
          ? { date, state: 'confirmed' }
          : project.keyDates.start,
      lastStageChange: { date, state: 'confirmed' },
      expectedCompletion:
        project.keyDates.expectedCompletion.state === 'needs_confirm'
          ? { ...project.keyDates.expectedCompletion, state: 'estimate' }
          : project.keyDates.expectedCompletion,
    },
  }
}

export function patchProjectDates(
  project: CustomerProject,
  patch: {
    start?: string
    expectedCompletion?: string
    phaseDate?: { phaseId: string; date: string }
  },
): CustomerProject {
  let next = { ...project }
  if (patch.start) {
    next = {
      ...next,
      startDate: patch.start,
      startConfirmed: true,
      keyDates: {
        ...next.keyDates,
        start: { date: patch.start, state: 'confirmed' },
      },
    }
  }
  if (patch.expectedCompletion) {
    next = {
      ...next,
      keyDates: {
        ...next.keyDates,
        expectedCompletion: {
          date: patch.expectedCompletion,
          state: 'confirmed',
        },
      },
    }
  }
  if (patch.phaseDate) {
    next = {
      ...next,
      phases: next.phases.map((p) =>
        p.id === patch.phaseDate!.phaseId
          ? { ...p, date: patch.phaseDate!.date, overdue: false }
          : p,
      ),
      needsConfirm: false,
      confirmBanner: undefined,
      keyDates: {
        ...next.keyDates,
        lastStageChange: {
          date: patch.phaseDate.date,
          state: 'confirmed',
        },
      },
    }
  }
  return next
}

export function recountConfirmations(
  payload: CustomerDeliveryPayload,
): CustomerDeliveryPayload {
  const projects = payload.projects
  const batches = payload.batches.map((b) => ({
    ...b,
    toConfirmCount: b.projectIds.filter((id) => {
      const p = projects.find((x) => x.id === id)
      return p?.needsConfirm || !p?.startConfirmed
    }).length,
  }))
  const datesNeedingConfirm = projects.filter(
    (p) =>
      p.needsConfirm ||
      !p.startConfirmed ||
      p.keyDates.start.state === 'needs_confirm' ||
      p.keyDates.expectedCompletion.state === 'needs_confirm',
  ).length
  return { ...payload, batches, datesNeedingConfirm }
}
