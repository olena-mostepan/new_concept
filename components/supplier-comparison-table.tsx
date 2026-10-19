'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { Sparkles, ChevronDown, ChevronRight, ChevronUp, HelpCircle, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import * as Tabs from '@radix-ui/react-tabs'
import * as ToggleGroup from '@radix-ui/react-toggle-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { ChartContainer } from '@/components/ui/chart'
import { PieChart, Pie, Tooltip as RechartsTooltip, Cell } from 'recharts'
import { getTenderConfig } from '@/lib/tender-data'
import {
  clarificationBidId,
  clarificationProjectLabel,
  type ClarificationsProjectSlug,
} from '@/lib/clarifications/mock-data'
import { useClarifications } from '@/lib/clarifications/store'
import { QuestionsTab } from '@/components/questions/QuestionsTab'
import { SupplierMatchingTab } from '@/components/questions/SupplierMatchingTab'
import { useQuestions } from '@/lib/questions/store'

// ─── Types ─────────────────────────────────────────────────────────────

type ViewMode = 'absolute' | 'per-kwp' | 'pct-total'
type TenderScreenTab = 'tender-results' | 'supplier-matching' | 'questions'

const TAB_QUERY_VALUES: TenderScreenTab[] = [
  'tender-results',
  'supplier-matching',
  'questions',
]

function tabFromQuery(value: string | null): TenderScreenTab | null {
  if (value && TAB_QUERY_VALUES.includes(value as TenderScreenTab)) {
    return value as TenderScreenTab
  }
  if (value === 'comparison') return 'tender-results'
  if (value === 'clarifications') return 'questions'
  return null
}

type NoteFlag = {
  type: 'warn' | 'info'
  text: string
}

type CategoryBreakdown = {
  equipment?: number
  labour?: number
  overheads?: number
  materials?: number
  design?: number
  commission?: number
  om?: number
}

type Supplier = {
  id: string
  name: string
  badge?: string
  linkedNote?: string
  totalPounds: number
  perKwp: number
  systemKwp: number
  quality: 1 | 2 | 3 // Tier 1, 2, 3 — opacity: high, medium, low
  transparency: 1 | 2 | 3 | 4 | 5
  note?: NoteFlag
  hasEstimates?: boolean
  breakdown?: CategoryBreakdown
}

// ─── Data ───────────────────────────────────────────────────────────────

const PROJECT_PHOTOS = [
  '/photos/Screenshot%202026-03-19%20at%2012.48.40.png',
  '/photos/Screenshot%202026-03-19%20at%2012.48.45.png',
  '/photos/Screenshot%202026-03-19%20at%2012.48.50.png',
]

// Overview data for projects without tender config
const SOLAR_OVERVIEW = {
  invited: 8,
  submitted: 6,
  responseRate: 75,
  details: [
    "1 didn't respond",
    "1 excluded (incomplete pricing)",
    "6 submitted",
  ],
  closedDate: "28 Oct 2025",
  duration: "21 days",
}

const LED_ROSTOCK_OVERVIEW = {
  invited: 6,
  submitted: 2,
  responseRate: 33,
  details: [
    "2 didn't have capacity",
    "2 didn't respond",
    "2 submitted",
  ],
  closedDate: "15 Nov 2025",
  duration: "14 days",
}

const STATUS_CHART_COLORS = [
  '#94A3B8', // slate — didn't respond
  '#F59E0B', // amber — missed deadline
  '#64748B', // grey — excluded
  '#E9571F', // accent — submitted
  '#CBD5E1', // fallback
]

function parseOverviewDetails(details: string[], invited: number): { name: string; value: number; pct: number }[] {
  return details
    .map((d) => {
      const m = d.match(/^(\d+)\s+(.+)$/)
      if (!m) return null
      const count = parseInt(m[1], 10)
      const label = m[2]
      const pct = invited > 0 ? Math.round((count / invited) * 100) : 0
      return { name: label, value: count, pct }
    })
    .filter((x): x is { name: string; value: number; pct: number } => x !== null)
}

// Multi-supplier CapEx comparison (representative submission notes)
const FULL_SCOPE_SUPPLIERS: Supplier[] = [
  {
    id: 'electron-green',
    name: 'Electron Green',
    totalPounds: 357_330,
    perKwp: 645,
    systemKwp: 554,
    quality: 2,
    transparency: 3,
    note: {
      type: 'info',
      text: 'Mid-to-high price submission at £645/kWp for a 554 kWp system; pricing is category-level only with no itemised PDF, making independent verification difficult. Includes proprietary SAM monitoring platform.',
    },
    breakdown: { equipment: 160_000, labour: 125_000, overheads: 60_000, om: 12_330 },
  },
  {
    id: 'sustain-commercial-solar',
    name: 'Sustain Commercial Solar',
    totalPounds: 272_506,
    perKwp: 611,
    systemKwp: 446,
    quality: 1,
    transparency: 4,
    note: {
      type: 'info',
      text: 'Competitive submission with detailed spreadsheet; 446 kWp system is the smallest in the field, which drives the lower absolute price. £/kWp of £611 is mid-range. In-house installation teams and efficient panel procurement are key cost drivers.',
    },
    breakdown: { equipment: 122_000, labour: 95_000, overheads: 41_000, om: 14_506 },
  },
  {
    id: 'low-carbon-energy-company',
    name: 'The Low Carbon Energy Company Ltd',
    totalPounds: 231_084,
    perKwp: 588,
    systemKwp: 393,
    quality: 1,
    transparency: 4,
    note: {
      type: 'info',
      text: 'Lowest absolute price but also smallest system (393 kWp); highest transparency with fully itemised spreadsheet. Labour cost is disproportionately high relative to materials, suggesting a labour-intensive installation approach or conservative labour pricing.',
    },
    breakdown: { equipment: 104_000, labour: 81_000, overheads: 35_000, om: 11_084 },
  },
  {
    id: 'ortus-energy-ltd',
    name: 'Ortus Energy Ltd.',
    totalPounds: 373_396,
    perKwp: 674,
    systemKwp: 554,
    quality: 1,
    transparency: 4,
    note: {
      type: 'info',
      text: 'Highest £/kWp submission at £674, partly due to the 7% CQUEL fee (£24,427) included in the client-facing total; underlying Ortus budget is £348,960 (£629/kWp). H&S and access costs are the highest in the field at £79,574 combined.',
    },
    breakdown: { equipment: 168_000, labour: 131_000, overheads: 60_000, om: 14_396 },
  },
  {
    id: 'evo-energy',
    name: 'Evo Energy',
    badge: 'Lowest price/kWp',
    totalPounds: 293_620,
    perKwp: 530,
    systemKwp: 554,
    quality: 1,
    transparency: 4,
    note: {
      type: 'info',
      text: 'Lowest £/kWp among the 554 kWp systems at £530; detailed PDF breakdown provided. Notable for the highest panel count (1,218 x 455Wp) and highest material cost, offset by competitive labour and overhead rates. No separate electrical works line — AC/DC cabling included in materials.',
    },
    breakdown: { equipment: 132_000, labour: 103_000, overheads: 47_000, om: 11_620 },
  },
  {
    id: 'oracle-energy',
    name: 'Oracle Energy',
    totalPounds: 306_900,
    perKwp: 550,
    systemKwp: 558,
    quality: 2,
    transparency: 3,
    note: {
      type: 'info',
      text: 'Mid-range submission at £550/kWp for the largest system (558 kWp); very high materials allocation (£224,660) relative to labour (£33,793) suggests either bundled subcontractor labour within materials or a lean in-house labour model. No itemised breakdown provided.',
    },
    breakdown: { equipment: 200_000, labour: 80_000, overheads: undefined, om: 26_900 },
  },
]

const SMALLER_SUPPLIERS: Supplier[] = [
  {
    id: 'photon',
    name: 'Photon Energy',
    badge: 'Lowest',
    totalPounds: 1_131_500,
    perKwp: 582,
    systemKwp: 1945,
    quality: 1,
    transparency: 4,
    note: { type: 'warn', text: '£180k H&S provisional—crane, edge protection, pallet splitting subject to site survey' },
    hasEstimates: true,
    breakdown: { equipment: 594_000, labour: 357_500, overheads: 180_000, om: 23_350 },
  },
  {
    id: 'low-carbon',
    name: 'Low Carbon Energy',
    badge: '2nd lowest',
    totalPounds: 1_163_127,
    perKwp: 499,
    systemKwp: 2333,
    quality: 2,
    transparency: 3,
    note: { type: 'warn', text: 'Materials £240k (~£103/kWp) exceptionally low—typical modules £200–280/kWp' },
    hasEstimates: true,
    breakdown: { equipment: 240_111, labour: 465_863, overheads: 60_500, om: 7_000 },
  },
  {
    id: 'olympus',
    name: 'Olympus Power',
    badge: '3rd lowest',
    totalPounds: 1_226_053,
    perKwp: 734,
    systemKwp: 1670,
    quality: 3,
    transparency: 2,
    note: { type: 'warn', text: 'No breakdown available; 1,670 kWp is smallest scope in CapEx set' },
    breakdown: { equipment: undefined, labour: undefined, overheads: undefined, om: 16_000 },
  },
  {
    id: 'your-eco',
    name: 'Your Eco',
    totalPounds: 1_726_089,
    perKwp: 799,
    systemKwp: 2161,
    quality: 1,
    transparency: 4,
    note: { type: 'info', text: 'SolarEdge Platinum; sum of price_* £56k less than cost_estimated' },
    breakdown: { equipment: 974_838, labour: 584_749, overheads: 109_942, om: 3_250 },
  },
]

// ─── Helpers ────────────────────────────────────────────────────────────

function formatPounds(n: number, currency: 'gbp' | 'eur' = 'gbp'): string {
  const sym = currency === 'eur' ? '€' : '£'
  if (n >= 1_000_000) return `${sym}${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `${sym}${(n / 1_000).toFixed(1)}k`
  return `${sym}${n.toLocaleString()}`
}

function formatKwp(n: number, projectType?: ProjectType): string {
  if (projectType === 'led' || projectType === 'led-rostock') return `${n.toLocaleString()} luminaires`
  return `${n.toLocaleString()} kWp`
}

/** Supplier column capped; £/kWp / Total / System equal width. Note capped (no 1fr). Quality given extra width + padding vs System. */
const NUMERIC_COL_WIDTH = '7rem'
const QUALITY_COL_WIDTH = '7.5rem'
const VIEW_COL_WIDTH = '7.5rem'
/** Capped so long notes wrap; extra row width flows to Supplier column (minmax). */
const NOTE_COL_WIDTH = 'minmax(16rem, min(36rem, min(55vw, 90ch)))'
const SUPPLIER_TABLE_GRID_TEMPLATE = `3rem minmax(0, min(260px, 36vw)) repeat(3, ${NUMERIC_COL_WIDTH}) ${QUALITY_COL_WIDTH} ${NOTE_COL_WIDTH} ${VIEW_COL_WIDTH}`

const BREAKDOWN_PIE_COLORS = ['#b8431a', '#e9571f', '#d14e18', '#1c75bc', '#4d5761', '#9ca3af']

// ─── Sub-components ────────────────────────────────────────────────────

const QUALITY_LABELS: Record<1 | 2 | 3, string> = {
  1: 'Detailed — full itemised breakdown with equipment, labour, overheads, design, and O&M',
  2: 'Partial — some categories broken down, others bundled or missing',
  3: 'Summary — high-level totals only, no detailed category split',
}

function QualityBadge({ quality }: { quality: Supplier['quality'] }) {
  const labels: Record<1 | 2 | 3, string> = { 1: 'Detailed', 2: 'Partial', 3: 'Summary' }
  const shades: Record<1 | 2 | 3, string> = {
    1: 'bg-gray-900 text-white',
    2: 'bg-gray-600 text-white',
    3: 'bg-gray-300 text-gray-800',
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={cn(
            'inline-flex items-center justify-center min-w-[72px] px-2 py-0.5 rounded text-xs font-semibold cursor-help',
            shades[quality]
          )}
        >
          {labels[quality]}
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-[260px]">
        {QUALITY_LABELS[quality]}
      </TooltipContent>
    </Tooltip>
  )
}

// ─── Main component ─────────────────────────────────────────────────────

const ALL_SUPPLIERS = [...FULL_SCOPE_SUPPLIERS, ...SMALLER_SUPPLIERS]

export type ProjectType = 'solar' | 'led' | 'led-rostock'

function mapLedToSupplier(led: import('@/lib/led-supplier-data').LedSupplier): Supplier {
  const b = led.breakdown
  return {
    id: led.id,
    name: led.name,
    badge: led.badge,
    totalPounds: led.totalEur,
    perKwp: led.perLuminaire,
    systemKwp: led.luminaireCount,
    quality: led.quality,
    transparency: led.transparency,
    note: led.note,
    breakdown: b
      ? {
          equipment: b.equipment,
          labour: b.labour,
          overheads: b.projectOverheads,
          materials: b.materials,
          design: b.designTechnical,
          commission: b.commissioningAssurance,
          om: b.ongoingServices,
        }
      : undefined,
  }
}

export function SupplierComparisonTable({
  projectType = 'solar',
}: {
  projectType?: ProjectType
} = {}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { openRaiseModal } = useClarifications()
  const { getQuestions, openAskModal } = useQuestions()
  const [screenTab, setScreenTab] = React.useState<TenderScreenTab>('tender-results')
  const [mounted, setMounted] = React.useState(false)
  const [viewMode, setViewMode] = React.useState<ViewMode>('absolute')
  const [showOverviewDetails, setShowOverviewDetails] = React.useState(false)
  const [intelligenceOn, setIntelligenceOn] = React.useState(false)
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set())
  const [expandedIds, setExpandedIds] = React.useState<Set<string>>(new Set())
  const [sortBy, setSortBy] = React.useState<'quality' | null>(null)
  const [sortDir, setSortDir] = React.useState<'asc' | 'desc'>('desc')

  const baseSuppliers =
    projectType === 'led'
      ? (() => {
          const { LED_SUPPLIERS } = require('@/lib/led-supplier-data')
          return LED_SUPPLIERS.map(mapLedToSupplier)
        })()
      : projectType === 'led-rostock'
        ? (() => {
            const { ROSTOCK_LED_SUPPLIERS } = require('@/lib/led-rostock-supplier-data')
            return ROSTOCK_LED_SUPPLIERS.map(mapLedToSupplier)
          })()
        : FULL_SCOPE_SUPPLIERS
  const suppliers =
    sortBy === 'quality'
        ? [...baseSuppliers].sort((a, b) =>
            sortDir === 'desc'
              ? b.quality - a.quality
              : a.quality - b.quality
          )
        : baseSuppliers


  React.useEffect(() => setMounted(true), [])

  React.useEffect(() => {
    const fromUrl = tabFromQuery(searchParams.get('tab'))
    if (fromUrl) setScreenTab(fromUrl)
  }, [searchParams])

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const basePath =
    projectType === 'led'
      ? '/supplier-comparison/led'
      : projectType === 'led-rostock'
        ? '/supplier-comparison/led-rostock'
        : '/supplier-comparison'
  const currency = (projectType === 'led' || projectType === 'led-rostock') ? 'eur' as const : 'gbp' as const
  const formatAmount = (n: number) => formatPounds(n, currency)
  const clarificationSlug = projectType as ClarificationsProjectSlug
  const questionCount = getQuestions(clarificationSlug).length

  const setScreenTabWithUrl = React.useCallback(
    (tab: TenderScreenTab) => {
      setScreenTab(tab)
      const params = new URLSearchParams(searchParams.toString())
      params.set('tab', tab)
      router.replace(`${basePath}?${params.toString()}`, { scroll: false })
    },
    [router, searchParams, basePath],
  )

  const handleCompare = () => {
    const ids = Array.from(selectedIds)
    if (ids.length >= 2) {
      router.push(`${basePath}/compare?ids=${ids.join(',')}`)
    }
  }
  const totalSum = suppliers.reduce((s, x) => s + x.totalPounds, 0)

  const overview =
    projectType === 'led'
      ? getTenderConfig('led')?.overview
      : projectType === 'led-rostock'
        ? LED_ROSTOCK_OVERVIEW
        : SOLAR_OVERVIEW
  const responseRate = overview ? `${overview.responseRate}% response rate` : ''

  return (
    <div className={cn('min-h-screen bg-cq-bg', screenTab === 'tender-results' && selectedIds.size >= 2 && 'pb-20')}>
      <div className="w-full max-w-screen-2xl mx-auto px-6 sm:px-8 lg:px-10 py-8">
        {/* Header */}
        <header className="mb-6">
          <h1 className="text-xl font-extrabold text-cq-text leading-tight">
            Supplier Price Comparison
          </h1>
        </header>

        {/* Project info — icon + title + address + tags + photos on right */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-3 mb-5">
              <Image
                src={(projectType === 'led' || projectType === 'led-rostock') ? '/site elements/Avatar.svg' : '/site elements/solar.svg'}
                alt=""
                width={40}
                height={40}
                className="flex-shrink-0 rounded-lg"
              />
              <div>
                <h2 className="text-xl font-extrabold text-cq-text leading-tight">
                  {projectType === 'led'
                    ? 'Project 310 — Alexanderstraße 1/3/5'
                    : projectType === 'led-rostock'
                      ? 'tender_651_650 — Doberaner Straße 114-116'
                      : 'Project 322 — Braehead'}
                </h2>
                <p className="text-sm text-cq-text-secondary mt-0.5">
                  {projectType === 'led'
                    ? 'Berlin, 2,494 luminaires'
                    : projectType === 'led-rostock'
                      ? 'Rostock, 2 suppliers (490 / 1,029 luminaires)'
                      : 'Shopping centre, LL1–LL3, Red Parking, car park roofs'}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
            {((projectType === 'led' || projectType === 'led-rostock')
              ? ['Commercial', 'Occupied', 'LED Retrofit']
              : ['Residential', 'Occupied', '> 70kW Solar']
            ).map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-md text-xs font-medium uppercase tracking-wider bg-cq-border-light text-cq-text-secondary"
              >
                {tag}
              </span>
            ))}
          </div>
          </div>
          <div className="flex gap-2 shrink-0">
            {PROJECT_PHOTOS.map((src, i) => (
              <img
                key={i}
                src={src}
                alt={`Project photo ${i + 1}`}
                className="w-48 h-24 rounded-lg border border-cq-border object-cover"
              />
            ))}
          </div>
        </div>

        {/* Tender Overview */}
        {overview && (
          <div className="mb-6 flex flex-col items-start gap-4 p-4 rounded-lg border border-cq-border bg-white">
            {/* Header row: title left, metadata + badge + show/hide right */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-full">
              <div className="font-bold text-cq-text">Tender Overview:</div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                <span className="text-sm text-cq-text-secondary">
                  Tender closed: <span className="font-bold text-cq-text">{overview.closedDate}</span>
                  <span className="mx-2 text-cq-border">|</span>
                  Duration: <span className="font-bold text-cq-text">{overview.duration}</span>
                </span>
                <div className="flex items-center px-3 py-1 rounded-[20px] bg-[#F59E0B] text-white text-sm font-bold">
                  Closed
                </div>
                <button
                  onClick={() => setShowOverviewDetails((v) => !v)}
                  className="text-sm text-[#1C75BC] hover:underline font-bold flex items-center gap-1 shrink-0"
                >
                  {showOverviewDetails ? (
                    <>
                      Hide details
                      <ChevronUp className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Show details
                      <ChevronDown className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
            <div className="text-sm text-cq-text-secondary">
              <span className="font-semibold">{overview.submitted}</span> of{" "}
              <span className="font-semibold">{overview.invited}</span> suppliers submitted (
              <span className="font-semibold">{responseRate}</span>)
            </div>
                {showOverviewDetails && (() => {
                  const chartData = parseOverviewDetails(overview.details, overview.invited)
                  const chartConfig = Object.fromEntries(
                    chartData.map((row, i) => [
                      row.name,
                      { label: `${row.name} (${row.pct}%)`, color: STATUS_CHART_COLORS[i % STATUS_CHART_COLORS.length] },
                    ])
                  )
                  return (
                    <div className="mt-3 flex gap-6 items-center">
                        <div className="flex flex-col gap-1.5 shrink-0">
                          {chartData.map((row, i) => (
                            <div key={row.name} className="flex items-center gap-2 text-sm">
                              <div
                                className="w-2.5 h-2.5 rounded-sm shrink-0"
                                style={{ backgroundColor: STATUS_CHART_COLORS[i % STATUS_CHART_COLORS.length] }}
                              />
                              <span className="text-cq-text font-medium">{row.name}</span>
                              <span className="text-cq-text-secondary tabular-nums">{row.pct}%</span>
                            </div>
                          ))}
                        </div>
                        {chartData.length > 0 && (
                          <div className="flex-1 min-w-[200px] flex justify-center">
                            <ChartContainer config={chartConfig} className="h-[180px] w-[180px]">
                              <PieChart>
                                <Pie
                                  data={chartData}
                                  dataKey="pct"
                                  nameKey="name"
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={50}
                                  outerRadius={75}
                                  paddingAngle={2}
                                >
                                  {chartData.map((_, i) => (
                                    <Cell key={i} fill={STATUS_CHART_COLORS[i % STATUS_CHART_COLORS.length]} />
                                  ))}
                                </Pie>
                                <RechartsTooltip
                                  formatter={(value: number, name: string) => [`${value}%`, name]}
                                  contentStyle={{ fontSize: 12 }}
                                />
                              </PieChart>
                            </ChartContainer>
                          </div>
                        )}
                    </div>
                  )
                })()}
          </div>
        )}

        <div className="mt-6">
          {mounted ? (
            <Tabs.Root
              value={screenTab}
              onValueChange={(v) => setScreenTabWithUrl(v as TenderScreenTab)}
            >
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-cq-border">
                <Tabs.List className="flex flex-wrap gap-6 sm:gap-8">
                  <Tabs.Trigger
                    value="tender-results"
                    className="px-4 py-3 text-sm font-semibold text-cq-text-secondary outline-none data-[state=active]:border-b-2 data-[state=active]:border-cq-green data-[state=active]:text-cq-green"
                  >
                    Tender results
                  </Tabs.Trigger>
                  <Tabs.Trigger
                    value="supplier-matching"
                    className="px-4 py-3 text-sm font-semibold text-cq-text-secondary outline-none data-[state=active]:border-b-2 data-[state=active]:border-cq-green data-[state=active]:text-cq-green"
                  >
                    Supplier matching
                  </Tabs.Trigger>
                  <Tabs.Trigger
                    value="questions"
                    className="px-4 py-3 text-sm font-semibold text-cq-text-secondary outline-none data-[state=active]:border-b-2 data-[state=active]:border-cq-green data-[state=active]:text-cq-green"
                  >
                    Questions ({questionCount})
                  </Tabs.Trigger>
                </Tabs.List>
                {screenTab === 'questions' && (
                  <button
                    type="button"
                    onClick={openAskModal}
                    className="mb-1 inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-cq-green px-4 py-2 text-sm font-bold text-primary-foreground hover:bg-cq-green-hover sm:mb-0"
                  >
                    <Plus className="h-4 w-4" aria-hidden />
                    Ask question
                  </button>
                )}
              </div>
            </Tabs.Root>
          ) : (
            <div className="mb-4 flex flex-wrap gap-6 border-b border-cq-border sm:gap-8">
              <span className="border-b-2 border-cq-green px-4 py-3 text-sm font-semibold text-cq-green">
                Tender results
              </span>
              <span className="px-4 py-3 text-sm font-semibold text-cq-text-secondary">
                Supplier matching
              </span>
              <span className="px-4 py-3 text-sm font-semibold text-cq-text-secondary">
                Questions ({questionCount})
              </span>
            </div>
          )}

          {screenTab === 'questions' && mounted ? (
            <QuestionsTab tenderSlug={clarificationSlug} />
          ) : screenTab === 'supplier-matching' && mounted ? (
            <SupplierMatchingTab
              suppliers={suppliers.map((s) => ({
                id: s.id,
                name: s.name,
                quality: s.quality,
                perUnit: s.perKwp,
                unitLabel:
                  projectType === 'led' || projectType === 'led-rostock'
                    ? '/luminaire'
                    : '/kWp',
              }))}
              currencySymbol={currency === 'eur' ? '€' : '£'}
            />
          ) : (
            <>
          <p className="mb-4 text-sm text-cq-text-secondary">
            {projectType === 'led' || projectType === 'led-rostock'
              ? `${suppliers.length} CapEx submissions`
              : '6 comparable CapEx submissions'}
          </p>

          {/* Controls row — breakdown view filter (applies to expanded card only) */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-cq-text-secondary">Breakdown view:</span>
              <ToggleGroup.Root
              type="single"
              value={viewMode}
              onValueChange={(v) => v && setViewMode(v as ViewMode)}
              className="inline-flex rounded-lg border border-cq-border bg-cq-bg overflow-hidden"
            >
              {[
                { value: 'absolute', label: (projectType === 'led' || projectType === 'led-rostock') ? 'Absolute €' : 'Absolute £' },
                { value: 'per-kwp', label: (projectType === 'led' || projectType === 'led-rostock') ? '€/luminaire' : '£/kWp' },
                { value: 'pct-total', label: '% of total' },
              ].map(({ value, label }) => (
                <ToggleGroup.Item
                  key={value}
                  value={value}
                  className={cn(
                    'px-4 py-2 text-sm font-bold transition-colors',
                    viewMode === value
                      ? 'bg-white text-cq-green border border-cq-green'
                      : 'bg-transparent text-cq-text border border-cq-border hover:bg-cq-border/50'
                  )}
                >
                  {label}
                </ToggleGroup.Item>
              ))}
            </ToggleGroup.Root>
            </div>

            <label
              className={cn(
                'inline-flex items-center gap-3 text-base font-semibold cursor-pointer',
                intelligenceOn ? 'text-cq-text' : 'text-cq-text-secondary'
              )}
            >
              <Switch
                checked={intelligenceOn}
                onCheckedChange={setIntelligenceOn}
                className={cn(
                  'scale-125 data-[state=checked]:bg-cq-green data-[state=unchecked]:bg-cq-border'
                )}
              />
              CQuel Intelligence
            </label>
          </div>

          {/* CQuel Intelligence callout */}
          {intelligenceOn && (
            <div className="rounded-lg border border-cq-green/30 bg-cq-green/5 px-4 py-3 mb-4 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-cq-green flex-shrink-0 mt-0.5" />
              <p className="text-sm text-cq-text">
                Where full pricing breakdowns are missing, CQuel Intelligence uses project
                benchmarks and supplier history to produce estimates. These are flagged with a green
                pill for transparency.
              </p>
            </div>
          )}

          {/* Table */}
          <div className="rounded-xl border border-cq-border bg-white overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full table-fixed text-sm">
                <colgroup>
                  <col style={{ width: '3rem' }} />
                  <col style={{ width: 'min(260px, 36vw)', maxWidth: 'min(260px, 36vw)' }} />
                  <col style={{ width: NUMERIC_COL_WIDTH }} />
                  <col style={{ width: NUMERIC_COL_WIDTH }} />
                  <col style={{ width: NUMERIC_COL_WIDTH }} />
                  <col style={{ width: QUALITY_COL_WIDTH }} />
                  <col style={{ width: 'clamp(16rem, 42vw, 36rem)' }} />
                  <col style={{ width: VIEW_COL_WIDTH }} />
                </colgroup>
                <thead>
                  <tr className="border-b border-cq-border bg-cq-bg">
                    <th className="py-3 px-2 text-center align-middle">
                      <span className="sr-only">Select</span>
                    </th>
                    <th className="text-left py-3 pl-4 pr-6 font-normal text-cq-text-secondary text-sm align-middle">
                      Supplier
                    </th>
                    <th className="text-left py-3 px-3 font-normal text-cq-text-secondary text-sm align-middle tabular-nums">
                      {(projectType === 'led' || projectType === 'led-rostock') ? '€/luminaire' : '£/kWp'}
                    </th>
                    <th className="text-right py-3 px-3 font-normal text-cq-text-secondary text-sm align-middle tabular-nums">
                      Total
                    </th>
                    <th className="text-right py-3 pl-3 pr-8 font-normal text-cq-text-secondary text-sm align-middle tabular-nums">
                      System
                    </th>
                    <th className="align-middle">
                      <div className="flex items-center justify-center gap-1 py-3 pl-10 pr-10">
                        <span className="font-normal text-cq-text-secondary text-sm">
                          Quality
                        </span>
                        <div className="flex flex-col items-center gap-0">
                          <button
                            type="button"
                            onClick={() => {
                              setSortBy('quality')
                              setSortDir('asc')
                            }}
                            className={cn(
                              'p-0.5 rounded hover:bg-cq-border/50 transition-colors -my-0.5',
                              sortBy === 'quality' && sortDir === 'asc' && 'text-cq-green'
                            )}
                            aria-label="Sort ascending"
                          >
                            <ChevronUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSortBy('quality')
                              setSortDir('desc')
                            }}
                            className={cn(
                              'p-0.5 rounded hover:bg-cq-border/50 transition-colors -my-0.5',
                              sortBy === 'quality' && sortDir === 'desc' && 'text-cq-green'
                            )}
                            aria-label="Sort descending"
                          >
                            <ChevronDown className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </th>
                    <th className="text-left py-3 pl-8 pr-8 font-normal text-cq-text-secondary text-sm align-middle">
                      Note
                    </th>
                    <th className="text-left py-3 pl-6 pr-6 font-normal text-cq-text-secondary text-sm align-middle">
                      View
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {suppliers.map((row, rowIndex) => {
                    const isExpanded = expandedIds.has(row.id)
                    const hasBreakdown = row.breakdown != null
                    const breakdownSum = row.breakdown
                      ? (row.breakdown.equipment ?? 0) +
                        (row.breakdown.labour ?? 0) +
                        (row.breakdown.overheads ?? 0) +
                        (row.breakdown.materials ?? 0) +
                        (row.breakdown.design ?? 0) +
                        (row.breakdown.commission ?? 0) +
                        (row.breakdown.om ?? 0)
                      : 0
                    const unallocated = row.totalPounds - breakdownSum
                    const allocatedPct =
                      breakdownSum > 0 ? Math.round((breakdownSum / row.totalPounds) * 100) : 0
                    const showWarning =
                      isExpanded && hasBreakdown && unallocated > 1000

                    const formatBreakdownValue = (n?: number, suffix = '') => {
                      if (n == null) return '—'
                      if (viewMode === 'absolute') return formatAmount(n) + suffix
                      if (viewMode === 'per-kwp')
                        return `${currency === 'eur' ? '€' : '£'}${Math.round(n / row.systemKwp).toLocaleString()}` + suffix
                      if (viewMode === 'pct-total')
                        return `${((n / row.totalPounds) * 100).toFixed(1)}%`
                      return formatAmount(n) + suffix
                    }

                    const expandedOpen = isExpanded && hasBreakdown
                    const breakdownCols =
                      projectType === 'led' || projectType === 'led-rostock'
                        ? [
                            { key: 'equipment' as const, label: 'Equipment' },
                            { key: 'labour' as const, label: 'Labour' },
                            { key: 'overheads' as const, label: 'Overheads' },
                            { key: 'materials' as const, label: 'Materials' },
                            { key: 'commission' as const, label: 'Commissioning & Assurance' },
                          ]
                        : [
                            { key: 'equipment' as const, label: 'Equipment' },
                            { key: 'labour' as const, label: 'Labour' },
                            { key: 'overheads' as const, label: 'Overheads' },
                            { key: 'design' as const, label: 'Design' },
                            { key: 'commission' as const, label: 'Commission' },
                            { key: 'om' as const, label: 'O&M' },
                          ]

                    const breakdownPieData =
                      expandedOpen && row.breakdown
                        ? breakdownCols
                            .map(({ key, label }, i) => ({
                              name: label,
                              value: row.breakdown![key] ?? 0,
                              fill: BREAKDOWN_PIE_COLORS[i % BREAKDOWN_PIE_COLORS.length],
                            }))
                            .filter((d) => d.value > 0)
                        : []

                    const isLastRow = rowIndex === suppliers.length - 1

                    return (
                      <tr key={row.id} className={cn(!expandedOpen && 'border-b border-cq-border')}>
                        <td colSpan={8} className="p-0 align-top">
                          <div
                            className={cn(
                              'transition-colors min-w-[52rem]',
                              !isLastRow && 'mb-4',
                              expandedOpen
                                ? cn(
                                    'rounded-lg border border-cq-border border-l-[3px] border-l-[var(--cq-link)] shadow-sm overflow-hidden',
                                    selectedIds.has(row.id)
                                      ? 'bg-slate-200/70 group-hover:bg-slate-200'
                                      : 'bg-slate-100 group-hover:bg-slate-200/70',
                                    'group'
                                  )
                                : cn(
                                    selectedIds.has(row.id) && 'bg-cq-green/5',
                                    !selectedIds.has(row.id) && 'hover:bg-cq-bg/50'
                                  )
                            )}
                          >
                            <div
                              role={hasBreakdown ? 'button' : undefined}
                              tabIndex={hasBreakdown ? 0 : undefined}
                              aria-expanded={hasBreakdown ? isExpanded : undefined}
                              onClick={hasBreakdown ? () => toggleExpand(row.id) : undefined}
                              onKeyDown={
                                hasBreakdown
                                  ? (e) => {
                                      if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault()
                                        toggleExpand(row.id)
                                      }
                                    }
                                  : undefined
                              }
                              className={cn(
                                'grid w-full items-center gap-x-0 text-sm',
                                hasBreakdown && 'cursor-pointer'
                              )}
                              style={{ gridTemplateColumns: SUPPLIER_TABLE_GRID_TEMPLATE }}
                            >
                              <div
                                className="py-3 px-2 text-center"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <span className="inline-flex">
                                  <Checkbox
                                    checked={selectedIds.has(row.id)}
                                    onCheckedChange={() => toggleSelection(row.id)}
                                    aria-label={`Select ${row.name}`}
                                  />
                                </span>
                              </div>
                              <div className="py-3 pl-4 pr-6 min-w-0">
                                <div className="flex flex-col gap-0.5">
                                  <span className="flex items-start gap-1 min-w-0">
                                    {hasBreakdown &&
                                      (isExpanded ? (
                                        <ChevronDown className="w-4 h-4 text-cq-text-secondary shrink-0 mt-0.5" />
                                      ) : (
                                        <ChevronRight className="w-4 h-4 text-cq-text-secondary shrink-0 mt-0.5" />
                                      ))}
                                    <span className="font-semibold text-cq-text min-w-0 break-words leading-snug">
                                      {row.name}
                                    </span>
                                  </span>
                                  {row.badge && (
                                    <span
                                      className={cn(
                                        'text-xs font-medium text-cq-green',
                                        hasBreakdown && 'pl-[calc(1rem+0.25rem)]'
                                      )}
                                    >
                                      {row.badge}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="py-3 px-3 text-left tabular-nums font-bold text-cq-text">
                                {currency === 'eur' ? '€' : '£'}
                                {row.perKwp.toLocaleString()}
                              </div>
                              <div className="py-3 px-3 text-right tabular-nums text-cq-text">
                                {formatAmount(row.totalPounds)}
                              </div>
                              <div className="py-3 pl-3 pr-8 text-right tabular-nums text-cq-text">
                                {formatKwp(row.systemKwp, projectType)}
                              </div>
                              <div
                                className="py-3 pl-10 pr-10 flex items-center justify-center"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <QualityBadge quality={row.quality} />
                              </div>
                              <div className="py-3 pl-8 pr-8 min-w-0 max-w-full">
                                <div className="flex flex-wrap items-center gap-2">
                                  {row.hasEstimates && intelligenceOn && (
                                    <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-cq-green/20 text-cq-green">
                                      has estimates
                                    </span>
                                  )}
                                  {row.note && (
                                    <span className="inline-flex items-center gap-1 text-[12px] text-cq-text-secondary">
                                      {row.note.type === 'warn' ? '⚠️' : 'ℹ️'} {row.note.text}
                                    </span>
                                  )}
                                  {!row.note && row.linkedNote && (
                                    <span className="inline-flex items-center gap-1 text-[12px] text-cq-text-secondary">
                                      ℹ️ {row.linkedNote}
                                    </span>
                                  )}
                                  {!row.note &&
                                    !row.linkedNote &&
                                    !(row.hasEstimates && intelligenceOn) && (
                                      <span className="text-cq-muted">—</span>
                                    )}
                                </div>
                              </div>
                              <div
                                className="flex items-center gap-2 py-3 pl-4 pr-4 text-left justify-self-start min-w-0 sm:pl-6 sm:pr-6"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  type="button"
                                  title="Raise clarification"
                                  aria-label={`Raise clarification for ${row.name}`}
                                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-cq-border bg-white text-cq-text-secondary transition-colors hover:bg-cq-bg hover:text-cq-text"
                                  onClick={() =>
                                    openRaiseModal({
                                      bidId: clarificationBidId(clarificationSlug),
                                      bidLabel: `Bid ${rowIndex + 1}`,
                                      supplierIds: [row.id],
                                      supplierNames: [row.name],
                                      project: clarificationProjectLabel(clarificationSlug),
                                    })
                                  }
                                >
                                  <HelpCircle className="h-4 w-4" />
                                </button>
                                <Link
                                  href={`${basePath}/${row.id}`}
                                  className="font-bold text-cq-link hover:underline inline-block whitespace-nowrap"
                                >
                                  View
                                </Link>
                              </div>
                            </div>

                            {expandedOpen && (
                              <div
                                className="border-t border-cq-border/70 py-3 grid gap-x-0"
                                style={{ gridTemplateColumns: SUPPLIER_TABLE_GRID_TEMPLATE }}
                              >
                                <div aria-hidden className="min-w-0" />
                                <div className="col-span-7 min-w-0 pl-4 pr-6">
                                  <div className="flex max-w-full flex-col gap-6 pl-4 sm:flex-row sm:items-start sm:gap-12">
                                    <div className="grid min-w-0 [grid-template-columns:max-content_minmax(0,1fr)] items-baseline gap-x-4 gap-y-2">
                                      {breakdownCols.map(({ key, label }) => {
                                        const val = row.breakdown?.[key]
                                        const suffix =
                                          key === 'equipment' &&
                                          row.breakdown?.design == null &&
                                          row.breakdown?.commission == null
                                            ? '+'
                                            : ''
                                        return (
                                          <React.Fragment key={key}>
                                            <span className="text-sm font-normal text-cq-text-secondary">
                                              {label}
                                            </span>
                                            <span className="min-w-0 font-semibold tabular-nums text-cq-text text-sm">
                                              {formatBreakdownValue(val, suffix)}
                                            </span>
                                          </React.Fragment>
                                        )
                                      })}
                                    </div>
                                    {breakdownPieData.length > 0 && (
                                      <div
                                        className="flex shrink-0 items-center justify-center self-center sm:justify-start sm:self-start"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <ChartContainer
                                          id={`supplier-breakdown-${row.id}`}
                                          config={Object.fromEntries(
                                            breakdownPieData.map((d) => [
                                              d.name,
                                              { label: d.name, color: d.fill },
                                            ])
                                          )}
                                          className="h-[152px] w-[152px] sm:h-[164px] sm:w-[164px]"
                                        >
                                          <PieChart>
                                            <Pie
                                              data={breakdownPieData}
                                              dataKey="value"
                                              nameKey="name"
                                              cx="50%"
                                              cy="50%"
                                              innerRadius={44}
                                              outerRadius={66}
                                              paddingAngle={2}
                                            >
                                              {breakdownPieData.map((d, i) => (
                                                <Cell key={i} fill={d.fill} />
                                              ))}
                                            </Pie>
                                            <RechartsTooltip
                                              content={({ active, payload }) =>
                                                active && payload?.[0] ? (
                                                  <div className="rounded-lg border border-cq-border bg-white px-3 py-2 text-sm shadow-sm">
                                                    <p className="font-semibold text-cq-text">
                                                      {String(payload[0].name)}
                                                    </p>
                                                    <p className="text-cq-text-secondary">
                                                      {formatAmount(
                                                        payload[0].value as number
                                                      )}
                                                    </p>
                                                  </div>
                                                ) : null
                                              }
                                            />
                                          </PieChart>
                                        </ChartContainer>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}

                            {showWarning && (
                              <div
                                className="border-t border-cq-border/70 py-3 grid gap-x-0"
                                style={{ gridTemplateColumns: SUPPLIER_TABLE_GRID_TEMPLATE }}
                              >
                                <div aria-hidden className="min-w-0" />
                                <div className="col-span-7 min-w-0 pl-4 pr-6">
                                  <div className="flex items-start gap-1.5 pl-5 text-[12px] text-cq-text-secondary w-full">
                                    <span className="text-cq-text-secondary shrink-0">⚠️</span>
                                    <span>
                                      Breakdown accounts for {allocatedPct}% of total —{' '}
                                      {formatAmount(unallocated)} not allocated to categories
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer */}
          <footer className="mt-4 text-sm text-cq-text-secondary">
            {projectType === 'led'
              ? '7 CapEx submissions · ranked by €/luminaire'
              : projectType === 'led-rostock'
                ? '2 CapEx submissions · ranked by €/luminaire'
                : '6 CapEx submissions · ranked by £/kWp'}
          </footer>
          {(projectType !== 'led' && projectType !== 'led-rostock') && (
          <p className="mt-2 text-xs text-cq-text-secondary">
            Notes reflect submission materials; expand rows for category breakdown where provided.
          </p>
          )}
            </>
          )}
        </div>

        {/* Compare shortlisted bar */}
        {screenTab === 'tender-results' && selectedIds.size >= 2 && (
          <div className="fixed bottom-0 left-0 right-0 z-10 border-t border-cq-border bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
            <div className="w-full max-w-screen-2xl mx-auto px-6 sm:px-8 lg:px-10 py-4 flex items-center justify-between">
              <p className="text-sm text-cq-text-secondary">
                {selectedIds.size} supplier{selectedIds.size > 1 ? 's' : ''} selected
              </p>
              <button
                type="button"
                onClick={handleCompare}
                className="px-4 py-2 rounded-lg bg-cq-green text-primary-foreground font-semibold hover:bg-cq-green-hover transition-colors"
              >
                Compare {selectedIds.size} suppliers
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
