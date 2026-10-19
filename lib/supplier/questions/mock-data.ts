import type { Clarification } from '@/lib/clarifications/types'
import {
  DEFAULT_BID_CONTEXT_322,
  DEFAULT_CLARIFICATION_PROJECT,
  DEMO_SUPPLIER_ID,
  SEED_CLARIFICATIONS,
} from '@/lib/clarifications/mock-data'
import { isVisibleToDemoSupplier } from '@/lib/clarifications/perspective'
import type { SupplierQuestion, SupplierQuestionStatus } from './types'
import { sortSupplierQuestions } from './sort'

export const DEMO_PROJECT_ID = '322'
export const SECOND_PROJECT_ID = '418'
export const THIRD_PROJECT_ID = '510'

export const SUPPLIER_PROJECT_IDS = [
  DEMO_PROJECT_ID,
  SECOND_PROJECT_ID,
  THIRD_PROJECT_ID,
] as const

export const SUPPLIER_PROJECTS: Record<
  string,
  { id: string; name: string; bidLabel: string; bidSubmittedLabel: string }
> = {
  [DEMO_PROJECT_ID]: {
    id: DEMO_PROJECT_ID,
    name: DEFAULT_CLARIFICATION_PROJECT,
    bidLabel: 'Bid 1',
    bidSubmittedLabel: 'Submitted 14 days ago',
  },
  [SECOND_PROJECT_ID]: {
    id: SECOND_PROJECT_ID,
    name: 'Project 418 — Meadowhall',
    bidLabel: 'Bid 1',
    bidSubmittedLabel: 'Submitted 6 days ago',
  },
  [THIRD_PROJECT_ID]: {
    id: THIRD_PROJECT_ID,
    name: 'Project 510 — Bluewater',
    bidLabel: 'Bid 2',
    bidSubmittedLabel: 'Submitted 2 days ago',
  },
}

export function getSupplierProjectName(projectId: string): string {
  return SUPPLIER_PROJECTS[projectId]?.name ?? `Project ${projectId}`
}

function withProjectName(
  q: SupplierQuestion,
  projectId: string,
): SupplierQuestion {
  return {
    ...q,
    projectId,
    projectName: q.projectName ?? getSupplierProjectName(projectId),
  }
}

function ageLabelToIso(ageLabel: string, fallbackDaysAgo: number): string {
  const match = ageLabel.match(/(\d+)\s*(m|h|d|w)/i)
  const now = Date.now()
  if (!match) {
    return new Date(now - fallbackDaysAgo * 86400000).toISOString()
  }
  const n = Number.parseInt(match[1]!, 10)
  const unit = match[2]!.toLowerCase()
  let ms = n * 86400000
  if (unit === 'h') ms = n * 3600000
  if (unit === 'm') ms = n * 60000
  if (unit === 'w') ms = n * 7 * 86400000
  return new Date(now - ms).toISOString()
}

function clarificationStatusToSupplierStatus(
  c: Clarification,
): SupplierQuestionStatus {
  switch (c.status) {
    case 'awaiting':
      return 'awaiting_you'
    case 'review':
      return c.reply ? 'you_answered' : 'awaiting_you'
    case 'need_response':
      return 'need_more_info'
    case 'applied':
    case 'closed':
      return 'resolved'
    default:
      return 'awaiting_you'
  }
}

function clarificationToSupplierQuestion(
  c: Clarification,
  projectId: string,
): SupplierQuestion {
  const status = clarificationStatusToSupplierStatus(c)
  const ctx = c.bidContext ?? DEFAULT_BID_CONTEXT_322
  const linkedField = c.linkedField
  const submittedValue =
    linkedField && ctx[linkedField] ? ctx[linkedField] : undefined

  return {
    id: c.id,
    projectId,
    projectName: getSupplierProjectName(projectId),
    questionText: c.question,
    direction: 'cquel_asked',
    status,
    createdAt: ageLabelToIso(c.raisedAgo, 3),
    ageLabel: c.raisedAgo,
    askedBy: `${c.raisedBy} (CQuel)`,
    answer:
      (status === 'you_answered' || status === 'resolved') && c.reply?.text
        ? {
            text: c.reply.text,
            answeredBy: 'You',
            ageLabel: c.reply.timeAgo ?? '—',
            hasAttachment: Boolean(c.reply.attachments?.length),
            attachments: c.reply.attachments,
          }
        : undefined,
    linkedBidField: linkedField,
    bidContext:
      linkedField && submittedValue
        ? { field: linkedField, submittedValue }
        : undefined,
    clarificationId: c.id,
  }
}

const SEED_YOU_ASKED: SupplierQuestion[] = [
  {
    id: 'sq-you-001',
    projectId: DEMO_PROJECT_ID,
    questionText: 'When is the tender submission deadline?',
    direction: 'you_asked',
    status: 'cquel_answered',
    createdAt: ageLabelToIso('3d ago', 3),
    ageLabel: '3d ago',
    askedBy: 'You',
    answer: {
      text: 'Tender closes Friday 29 May at 17:00 BST. Late submissions will not be accepted.',
      answeredBy: 'Lucija (CQuel)',
      ageLabel: '2d ago',
      attachments: [{ name: 'Tender-calendar-322.pdf', sizeLabel: '240 KB' }],
    },
  },
  {
    id: 'sq-you-002',
    projectId: DEMO_PROJECT_ID,
    questionText: 'Can we submit a partial bid covering LL1 and LL2 only?',
    direction: 'you_asked',
    status: 'awaiting_cquel',
    createdAt: ageLabelToIso('1d ago', 1),
    ageLabel: '1d ago',
    askedBy: 'You',
  },
]

/** Extra CQuel-asked rows for richer prototype coverage */
const SEED_CQUEL_EXTRA: SupplierQuestion[] = [
  {
    id: 'sq-cquel-om',
    projectId: DEMO_PROJECT_ID,
    questionText:
      'Please clarify whether inverter replacement labour is covered under the headline O&M line or priced separately.',
    direction: 'cquel_asked',
    status: 'awaiting_you',
    createdAt: ageLabelToIso('4h ago', 0),
    ageLabel: '4h ago',
    askedBy: 'Jamie (CQuel)',
    linkedBidField: 'Maintenance',
    bidContext: {
      field: 'Maintenance',
      submittedValue: DEFAULT_BID_CONTEXT_322.Maintenance ?? '£12.3k / yr',
    },
  },
  {
    id: 'sq-cquel-access',
    projectId: DEMO_PROJECT_ID,
    questionText:
      'We need crane mobilisation assumptions and weekday vs weekend outage windows for LL3 rooftop.',
    direction: 'cquel_asked',
    status: 'need_more_info',
    createdAt: ageLabelToIso('1w ago', 7),
    ageLabel: '1w ago',
    askedBy: 'Lucija (CQuel)',
  },
]

const SEED_PROJECT_418: SupplierQuestion[] = [
  {
    id: 'sq-418-you-001',
    projectId: SECOND_PROJECT_ID,
    questionText: 'Is landlord consent required before site survey?',
    direction: 'you_asked',
    status: 'cquel_answered',
    createdAt: ageLabelToIso('5d ago', 5),
    ageLabel: '5d ago',
    askedBy: 'You',
    answer: {
      text: 'Yes — we have a draft letter of authority in Supporting Documents.',
      answeredBy: 'Jamie (CQuel)',
      ageLabel: '4d ago',
    },
  },
  {
    id: 'sq-418-cquel-001',
    projectId: SECOND_PROJECT_ID,
    questionText:
      'Please confirm whether your unit rate includes DNO application fees for the 1.8 MW export limit.',
    direction: 'cquel_asked',
    status: 'awaiting_you',
    createdAt: ageLabelToIso('2d ago', 2),
    ageLabel: '2d ago',
    askedBy: 'Lucija (CQuel)',
    linkedBidField: 'DNO fees',
    bidContext: { field: 'DNO fees', submittedValue: 'Included in capex' },
  },
]

const SEED_PROJECT_510: SupplierQuestion[] = [
  {
    id: 'sq-510-you-001',
    projectId: THIRD_PROJECT_ID,
    questionText: 'Can we propose an alternative panel manufacturer to the brief?',
    direction: 'you_asked',
    status: 'awaiting_cquel',
    createdAt: ageLabelToIso('12h ago', 0),
    ageLabel: '12h ago',
    askedBy: 'You',
  },
  {
    id: 'sq-510-cquel-001',
    projectId: THIRD_PROJECT_ID,
    questionText:
      'Break out scaffolding and night-working premiums separately in your O&M line.',
    direction: 'cquel_asked',
    status: 'awaiting_you',
    createdAt: ageLabelToIso('1d ago', 1),
    ageLabel: '1d ago',
    askedBy: 'Jamie (CQuel)',
  },
  {
    id: 'sq-510-cquel-002',
    projectId: THIRD_PROJECT_ID,
    questionText: 'Upload your method statement for roof load checks on car park deck B.',
    direction: 'cquel_asked',
    status: 'resolved',
    createdAt: ageLabelToIso('3w ago', 21),
    ageLabel: '3w ago',
    askedBy: 'Lucija (CQuel)',
    answer: {
      text: 'Method statement v2 uploaded via Supporting Documents.',
      answeredBy: 'You',
      ageLabel: '2w ago',
    },
  },
]

function buildProject322Questions(projectId: string): SupplierQuestion[] {
  const cquelFromClarifications = SEED_CLARIFICATIONS.filter(
    (c) =>
      c.project === DEFAULT_CLARIFICATION_PROJECT &&
      isVisibleToDemoSupplier(c, DEMO_SUPPLIER_ID),
  ).map((c) => clarificationToSupplierQuestion(c, projectId))

  const youAsked = SEED_YOU_ASKED.filter((q) => q.projectId === projectId)
  const cquelExtra = SEED_CQUEL_EXTRA.filter((q) => q.projectId === projectId)

  return [...cquelFromClarifications, ...cquelExtra, ...youAsked]
}

export function buildInitialSupplierQuestions(
  projectId: string = DEMO_PROJECT_ID,
): SupplierQuestion[] {
  let merged: SupplierQuestion[] = []

  if (projectId === DEMO_PROJECT_ID) {
    merged = buildProject322Questions(projectId)
  } else if (projectId === SECOND_PROJECT_ID) {
    merged = SEED_PROJECT_418
  } else if (projectId === THIRD_PROJECT_ID) {
    merged = SEED_PROJECT_510
  }

  const byId = new Map<string, SupplierQuestion>()
  for (const q of merged) {
    const row = withProjectName(q, projectId)
    if (!byId.has(row.id)) byId.set(row.id, row)
  }

  return sortSupplierQuestions(Array.from(byId.values()))
}

/** All questions across supplier projects (cross-tender view). */
export function buildAllSupplierQuestions(): SupplierQuestion[] {
  const all = SUPPLIER_PROJECT_IDS.flatMap((id) =>
    buildInitialSupplierQuestions(id),
  )
  const byId = new Map<string, SupplierQuestion>()
  for (const q of all) {
    if (!byId.has(q.id)) byId.set(q.id, q)
  }
  return sortSupplierQuestions(Array.from(byId.values()))
}

export const INITIAL_SUPPLIER_QUESTIONS = buildAllSupplierQuestions()
