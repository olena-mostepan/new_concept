import type { ClarificationsProjectSlug } from '@/lib/clarifications/mock-data'
import type { TenderQuestion } from './types'
import { agoToIso } from './time'
import { tenderSuppliersForSlug } from './tender-suppliers'

function shortName(name: string): string {
  if (name.length <= 12) return name
  const parts = name.split(' ')
  if (parts.length > 1 && parts[0]!.length <= 8) return parts[0]!
  return name.slice(0, 10)
}

function buildAiQuestion(
  id: string,
  slug: ClarificationsProjectSlug,
  questionText: string,
  ageLabel: string,
  answerBySupplierId: Record<
    string,
    { status: 'answered' | 'partial' | 'awaiting'; text?: string; age?: string }
  >,
): TenderQuestion {
  const suppliers = tenderSuppliersForSlug(slug)
  return {
    id,
    questionText,
    type: 'ai',
    tenderSlug: slug,
    createdAt: agoToIso(ageLabel),
    ageLabel,
    answers: suppliers.map((s) => {
      const a = answerBySupplierId[s.id]
      if (!a) {
        return {
          supplierId: s.id,
          supplierName: shortName(s.name),
          status: 'not_asked' as const,
        }
      }
      if (a.status === 'awaiting') {
        return {
          supplierId: s.id,
          supplierName: shortName(s.name),
          status: 'awaiting' as const,
        }
      }
      return {
        supplierId: s.id,
        supplierName: shortName(s.name),
        status: a.status,
        answerText: a.text,
        ageLabel: a.age,
      }
    }),
  }
}

/** AI-extracted bid intelligence questions for Project 322 — Braehead (solar). */
export const SEED_AI_QUESTIONS_SOLAR: TenderQuestion[] = [
  buildAiQuestion(
    'ai-inv-322',
    'solar',
    'Which inverter manufacturer is specified in each bid?',
    '3d ago',
    {
      'electron-green': { status: 'answered', text: 'Huawei SUN2000-100KTL', age: '3d ago' },
      'sustain-commercial-solar': {
        status: 'answered',
        text: 'Solis S5-GC100K',
        age: '3d ago',
      },
      'low-carbon-energy-company': {
        status: 'answered',
        text: 'Huawei SUN2000-100KTL',
        age: '3d ago',
      },
      'ortus-energy-ltd': { status: 'answered', text: 'Solis S5-GC100K', age: '3d ago' },
      'evo-energy': { status: 'answered', text: 'Huawei SUN2000-100KTL', age: '3d ago' },
      'oracle-energy': { status: 'partial', text: 'Inverter make not stated', age: '3d ago' },
    },
  ),
  buildAiQuestion(
    'ai-warranty-322',
    'solar',
    'What performance warranty period is offered on modules?',
    '5d ago',
    {
      'electron-green': { status: 'answered', text: '25-year linear performance', age: '5d ago' },
      'sustain-commercial-solar': {
        status: 'answered',
        text: '25-year at 87% minimum',
        age: '5d ago',
      },
      'low-carbon-energy-company': {
        status: 'answered',
        text: '30-year manufacturer warranty',
        age: '5d ago',
      },
      'ortus-energy-ltd': { status: 'answered', text: '25-year performance', age: '5d ago' },
      'evo-energy': { status: 'answered', text: '25-year at 84% minimum', age: '5d ago' },
      'oracle-energy': { status: 'answered', text: '25-year performance', age: '5d ago' },
    },
  ),
  buildAiQuestion(
    'ai-export-322',
    'solar',
    'Is the 100 kW export cap assumed at MPAN or feeder level?',
    '1w ago',
    {
      'electron-green': { status: 'answered', text: 'MPAN-level limit stated', age: '1w ago' },
      'sustain-commercial-solar': {
        status: 'partial',
        text: 'Export mentioned, level unclear',
        age: '1w ago',
      },
      'low-carbon-energy-company': {
        status: 'answered',
        text: 'Feeder-level for Red Car Park',
        age: '1w ago',
      },
      'ortus-energy-ltd': { status: 'awaiting' },
      'evo-energy': { status: 'answered', text: 'MPAN-level', age: '1w ago' },
      'oracle-energy': { status: 'answered', text: 'MPAN-level', age: '1w ago' },
    },
  ),
  buildAiQuestion(
    'ai-om-322',
    'solar',
    'Does headline O&M include inverter replacement labour?',
    '4d ago',
    {
      'electron-green': { status: 'answered', text: 'Included in annual O&M fee', age: '4d ago' },
      'sustain-commercial-solar': {
        status: 'answered',
        text: 'Labour excluded — provisional',
        age: '4d ago',
      },
      'low-carbon-energy-company': {
        status: 'answered',
        text: 'Included for first 5 years',
        age: '4d ago',
      },
      'ortus-energy-ltd': { status: 'answered', text: 'Not specified in PDF', age: '4d ago' },
      'evo-energy': { status: 'awaiting' },
      'oracle-energy': {
        status: 'answered',
        text: 'Included in maintenance schedule',
        age: '4d ago',
      },
    },
  ),
  buildAiQuestion(
    'ai-panel-322',
    'solar',
    'Which module wattage and cell technology is nominated?',
    '6d ago',
    {
      'electron-green': { status: 'answered', text: '455 Wp mono PERC', age: '6d ago' },
      'sustain-commercial-solar': { status: 'answered', text: '450 Wp mono', age: '6d ago' },
      'low-carbon-energy-company': { status: 'answered', text: '445 Wp mono', age: '6d ago' },
      'ortus-energy-ltd': { status: 'answered', text: '455 Wp mono PERC', age: '6d ago' },
      'evo-energy': { status: 'answered', text: '455 Wp — 1,218 modules', age: '6d ago' },
      'oracle-energy': { status: 'answered', text: '450 Wp mono', age: '6d ago' },
    },
  ),
  buildAiQuestion(
    'ai-crane-322',
    'solar',
    'Are crane mobilisation costs included in CapEx or provisional?',
    '2d ago',
    {
      'electron-green': { status: 'partial', text: 'Crane line not itemised', age: '2d ago' },
      'sustain-commercial-solar': {
        status: 'answered',
        text: 'Included in access costs',
        age: '2d ago',
      },
      'low-carbon-energy-company': {
        status: 'answered',
        text: 'Separate provisional £18k',
        age: '2d ago',
      },
      'ortus-energy-ltd': {
        status: 'answered',
        text: 'Included in H&S provisional',
        age: '2d ago',
      },
      'evo-energy': { status: 'answered', text: 'Included in materials', age: '2d ago' },
      'oracle-energy': { status: 'awaiting' },
    },
  ),
  buildAiQuestion(
    'ai-monitoring-322',
    'solar',
    'What monitoring platform is proposed and is there an ongoing licence fee?',
    '8d ago',
    {
      'electron-green': {
        status: 'answered',
        text: 'Proprietary SAM — licence included',
        age: '8d ago',
      },
      'sustain-commercial-solar': {
        status: 'answered',
        text: 'SolarEdge monitoring — 5 yr included',
        age: '8d ago',
      },
      'low-carbon-energy-company': {
        status: 'answered',
        text: 'Grafana-based — no licence fee',
        age: '8d ago',
      },
      'ortus-energy-ltd': { status: 'answered', text: 'Huawei FusionSolar', age: '8d ago' },
      'evo-energy': { status: 'answered', text: 'Solis cloud portal', age: '8d ago' },
      'oracle-energy': {
        status: 'answered',
        text: 'Third-party portal — £1.2k/yr',
        age: '8d ago',
      },
    },
  ),
  buildAiQuestion(
    'ai-dno-322',
    'solar',
    'Who is responsible for G99 application fees in each submission?',
    '10d ago',
    {
      'electron-green': { status: 'answered', text: 'Client account — EPC assists', age: '10d ago' },
      'sustain-commercial-solar': {
        status: 'answered',
        text: 'Included in EPC scope',
        age: '10d ago',
      },
      'low-carbon-energy-company': {
        status: 'answered',
        text: 'Client DNO account',
        age: '10d ago',
      },
      'ortus-energy-ltd': { status: 'answered', text: 'EPC manages — fee in CapEx', age: '10d ago' },
      'evo-energy': { status: 'answered', text: 'Client-led G99', age: '10d ago' },
      'oracle-energy': { status: 'answered', text: 'EPC scope includes G99', age: '10d ago' },
    },
  ),
]

export const AI_QUESTION_SUGGESTIONS = [
  'Which inverter manufacturer is specified in each bid?',
  'What performance warranty period is offered on modules?',
  'Is the export limit assumed at MPAN or feeder level?',
  'Does headline O&M include inverter replacement labour?',
  'Are crane mobilisation costs included in CapEx?',
]
