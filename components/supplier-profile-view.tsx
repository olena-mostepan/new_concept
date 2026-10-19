'use client'

import * as React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, FileText, Sparkles, Sun, Zap, Wrench, Shield, Lamp } from 'lucide-react'
import { cn } from '@/lib/utils'
import * as ToggleGroup from '@radix-ui/react-toggle-group'
import { Switch } from '@/components/ui/switch'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { ChartContainer } from '@/components/ui/chart'
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip } from 'recharts'
import { SupplierCompanyProfile } from '@/components/supplier-company-profile'

// ─── Types ─────────────────────────────────────────────────────────────

type ViewMode = 'absolute' | 'per-kwp' | 'pct-total'
type ClusterType = 'full-scope' | 'smaller'

type KeyFlag = {
  icon: 'doc' | 'warn' | 'info'
  text: string
}

type SourceDocument = {
  filename: string
  size: string
  status: 'extracted' | 'unreadable'
}

type SubCategory = {
  name: string
  description: string
  tag?: 'provisional' | 'bundled'
  amount?: number
}

type Category = {
  name: string
  rank?: { position: number; total: number }
  flag?: string
  proportionPercent?: number
  medianPercent?: number
  totalAmount?: number
  subCategories: SubCategory[]
  dimmed?: boolean
}

export type SupplierProfileData = {
  id: string
  name: string
  quality: 1 | 2 | 3
  cluster: ClusterType
  totalPounds: number
  perKwp: number
  systemKwp: number
  totalPosition: 'below' | 'above' // vs median
  perKwpPosition: 'below' | 'above'
  totalPercentPosition: number // 0–100, where on min–max scale
  perKwpPercentPosition: number
  specs: {
    panels: string
    inverters: string
    mounting: string
    workmanshipWarranty: string
    panelWarranty: string
    inverterWarranty: string
  }
  characterisation: string
  keyFlags: KeyFlag[]
  sourceDocuments?: SourceDocument[]
  categories: Category[]
}

// ─── Default data: Photon Energy ───────────────────────────────────────

// Project 322 — Braehead — Photon Energy profile from breakdown.html
const PHOTON_ENERGY_PROFILE: SupplierProfileData = {
  id: 'photon',
  name: 'Photon Energy',
  quality: 1,
  cluster: 'smaller',
  totalPounds: 1_131_500,
  perKwp: 582,
  systemKwp: 1945,
  totalPosition: 'below',
  perKwpPosition: 'below',
  totalPercentPosition: 22,
  perKwpPercentPosition: 35,
  specs: {
    panels: '4,276 × Trina 455W dual-glass modules',
    inverters: '15 Solis three-phase inverters',
    mounting: 'K2 Basic Rail (included)',
    workmanshipWarranty: 'Not stated',
    panelWarranty: 'Not stated',
    inverterWarranty: 'Not stated',
  },
  characterisation:
    "Detailed PDF quotation with itemised equipment, installation, design, and attendances across four MPANs. Smallest scope at 1,946 kWp covering LL1, LL2, LL3, and Red Parking—not the full six-roof brief. H&S at £180k (16%) is provisional for crane, edge protection, pallet splitting—subject to site survey.",
  keyFlags: [
    { icon: 'doc', text: 'Detailed PDF with good document-to-field corroboration' },
    { icon: 'warn', text: '£40k discrepancy between PDF subtotal and form fields' },
    { icon: 'warn', text: "Optimisers listed as 'not included' with no explanation" },
  ],
  sourceDocuments: [
    { filename: 'Pricing Quotation.pdf', size: '2.3 MB', status: 'extracted' },
    { filename: 'Technical Specification.pdf', size: '1.1 MB', status: 'extracted' },
  ],
  categories: [
    {
      name: 'Equipment',
      rank: { position: 1, total: 4 },
      proportionPercent: 53,
      medianPercent: 44,
      totalAmount: 594_000,
      subCategories: [
        { name: 'Main Equipment', description: '4,276 × 455W Trina dual-glass modules, 15 Solis inverters', amount: 594_000 },
        { name: 'Mounting Systems', description: 'K2 Basic Rail included within main_equipment', tag: 'bundled' },
        { name: 'Protection Devices', description: 'DC SPD, isolators, ArcBoxes included', tag: 'bundled' },
        { name: 'Monitoring Equipment', description: 'GSM meter, generation meter included', tag: 'bundled' },
      ],
    },
    {
      name: 'Labour',
      rank: { position: 1, total: 4 },
      proportionPercent: 32,
      medianPercent: 36,
      totalAmount: 357_500,
      subCategories: [
        { name: 'Installation Labour', description: 'In-house installation and commissioning across four roof areas', amount: 247_500 },
        { name: 'Electrical Works', description: 'AC/DC electrical works, containment, PVDB connections', amount: 40_000 },
        { name: 'Project Management', description: 'DNO application, PV system design, project management', amount: 70_000 },
      ],
    },
    {
      name: 'Project Overheads',
      rank: { position: 1, total: 4 },
      flag: 'Provisional—subject to site survey',
      proportionPercent: 16,
      medianPercent: 10,
      totalAmount: 180_000,
      subCategories: [
        { name: 'Health Safety Management', description: 'Provisional: edge protection, lifting, access, scaffolding', amount: 180_000, tag: 'provisional' },
      ],
    },
    {
      name: 'Ongoing Services',
      rank: { position: 1, total: 4 },
      proportionPercent: 2,
      medianPercent: 3,
      totalAmount: 23_350,
      subCategories: [
        { name: 'Maintenance Contract', description: '5-year full-scope O&M paid quarterly; RPI-linked; excludes cleaning', amount: 23_350 },
      ],
    },
  ],
}

// Shortlisted suppliers for navigation (Project 322 Braehead — top 3)
const SHORTLISTED_SUPPLIERS = [
  { id: 'photon', name: 'Photon Energy' },
  { id: 'low-carbon', name: 'Low Carbon Energy' },
  { id: 'olympus', name: 'Olympus Power' },
]

// All supplier names for breadcrumb/header when not in shortlist (Project 322 Braehead)
const ALL_SUPPLIER_NAMES: Record<string, string> = {
  'green-nation': 'Green Nation',
  'arin-power': 'Arin Power',
  'green-volt': 'Green Volt',
  sustain: 'Sustain',
  ortus: 'Ortus Energy',
  'electron-green': 'Electron Green',
  shawton: 'Shawton Energy',
  ees: 'EES Group',
  'low-carbon': 'Low Carbon Energy',
  photon: 'Photon Energy',
  'your-eco': 'Your Eco',
  olympus: 'Olympus Power',
}

const SUPPLIER_LOGOS: Record<string, string> = {
  photon: '/site elements/beba.svg',
  ortus: '/site elements/Avatar.svg',
  'your-eco': '/site elements/gogreen.svg',
  'low-carbon': '/site elements/lowcarbon.svg',
}

// ─── Helpers ────────────────────────────────────────────────────────────

function formatPounds(n: number): string {
  if (n >= 1_000_000) return `£${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `£${(n / 1_000).toFixed(1)}k`
  return `£${n.toLocaleString()}`
}

function formatEur(n: number): string {
  if (n >= 1_000_000) return `€${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `€${(n / 1_000).toFixed(1)}k`
  return `€${n.toLocaleString()}`
}

function formatKwp(n: number): string {
  return `£${n.toLocaleString()}`
}

function formatPerLuminaire(n: number): string {
  return `€${n.toLocaleString()}`
}

// ─── Sub-components ──────────────────────────────────────────────────────

const QUALITY_LABELS: Record<1 | 2 | 3, string> = {
  1: 'Detailed — full itemised breakdown with equipment, labour, overheads, design, and O&M',
  2: 'Partial — some categories broken down, others bundled or missing',
  3: 'Summary — high-level totals only, no detailed category split',
}

function QualityBadge({ quality }: { quality: 1 | 2 | 3 }) {
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

function PositionBar({
  percent,
  label,
}: {
  percent: number
  label: string
}) {
  return (
    <div className="space-y-1">
      <div className="h-1.5 w-full rounded-full bg-cq-border overflow-hidden">
        <div
          className="h-full rounded-full bg-cq-green transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="text-xs text-cq-text-secondary">{label}</p>
    </div>
  )
}

function ProportionBar({
  supplierPercent,
  medianPercent,
}: {
  supplierPercent: number
  medianPercent: number
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-3 min-w-[140px] max-w-[180px] cursor-help">
          <div className="flex-1 relative h-3 rounded-full bg-cq-border overflow-hidden min-w-[80px]">
            <div
              className="absolute inset-y-0 left-0 bg-cq-green rounded-full"
              style={{ width: `${Math.min(supplierPercent, 100)}%` }}
            />
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-cq-text -translate-x-px z-10"
              style={{ left: `${Math.min(medianPercent, 99)}%` }}
            />
          </div>
          <span className="text-sm font-bold tabular-nums text-cq-text shrink-0">{supplierPercent}%</span>
          <span className="text-xs text-cq-text-secondary shrink-0">vs {medianPercent}%</span>
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-[240px]">
        Your share of total spend in this category vs median across suppliers
      </TooltipContent>
    </Tooltip>
  )
}

function KeyFlagIcon({ icon }: { icon: KeyFlag['icon'] }) {
  switch (icon) {
    case 'doc':
      return <FileText className="w-4 h-4 flex-shrink-0 text-cq-text-secondary" />
    case 'warn':
      return <span className="text-cq-text-secondary">⚠️</span>
    case 'info':
      return <span className="text-cq-text-secondary">ℹ️</span>
  }
}

const CHART_COLORS = ['#b8431a', '#e9571f', '#d14e18', '#1c75bc', '#4d5761', '#9ca3af']

function CategoryBreakdownChart({
  categories,
  totalSum,
  isLedLike,
  formatAmount,
}: {
  categories: Category[]
  totalSum: number
  isLedLike: boolean
  formatAmount: (n: number) => string
}) {
  const chartData = categories
    .filter((c) => (c.totalAmount ?? 0) > 0 && !c.dimmed)
    .map((c, i) => ({
      name: c.name,
      value: c.totalAmount ?? 0,
      proportion: c.proportionPercent ?? 0,
      fill: CHART_COLORS[i % CHART_COLORS.length],
    }))
  if (chartData.length === 0) return null
  return (
    <div className="rounded-xl border border-cq-border bg-white p-4 flex flex-col">
      <p className="text-xs font-semibold uppercase tracking-wider text-cq-text-secondary mb-3 shrink-0">Cost breakdown</p>
      <div className="flex gap-4 items-center">
        <div className="flex flex-col gap-1.5 shrink-0">
          {chartData.map((d, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <div
                className="w-2.5 h-2.5 rounded-sm shrink-0"
                style={{ backgroundColor: d.fill }}
              />
              <span className="text-cq-text font-medium">{d.name}</span>
              <span className="text-cq-text-secondary tabular-nums">{d.proportion}%</span>
            </div>
          ))}
        </div>
        <div className="flex-1 min-w-0">
        <ChartContainer
          id="cost-breakdown-chart"
          config={Object.fromEntries(chartData.map((d, i) => [d.name, { label: d.name, color: d.fill }]))}
          className="h-[140px] w-full"
        >
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={35}
            outerRadius={55}
            paddingAngle={2}
          >
            {chartData.map((d, i) => (
              <Cell key={i} fill={d.fill} />
            ))}
          </Pie>
          <RechartsTooltip
            formatter={(value: number) => [formatAmount(value), 'Amount']}
            content={({ active, payload }) =>
              active && payload?.[0] ? (
                <div className="rounded-lg border border-cq-border bg-white px-3 py-2 shadow-sm text-sm">
                  <p className="font-semibold text-cq-text">{payload[0].name}</p>
                  <p className="text-cq-text-secondary">
                    {formatAmount(payload[0].value as number)} ({payload[0].payload.proportion}%)
                  </p>
                </div>
              ) : null
            }
          />
        </PieChart>
      </ChartContainer>
        </div>
      </div>
    </div>
  )
}

// ─── Main component ─────────────────────────────────────────────────────

type SupplierProfileViewProps = {
  data?: SupplierProfileData
  shortlist?: { id: string; name: string }[]
  supplierId?: string // From URL — used to determine nav position; data comes from lookup
  projectType?: 'solar' | 'led' | 'led-rostock'
}

export function SupplierProfileView({
  data = PHOTON_ENERGY_PROFILE,
  shortlist = SHORTLISTED_SUPPLIERS,
  supplierId,
  projectType = 'solar',
}: SupplierProfileViewProps) {
  // Use supplierId from URL to position nav; fall back to data.id
  const currentId = supplierId ?? data.id
  const [viewMode, setViewMode] = React.useState<ViewMode>('absolute')
  const [intelligenceOn, setIntelligenceOn] = React.useState(false)

  const currentIndex = shortlist.findIndex((s) => s.id === currentId)
  const prevSupplier = currentIndex > 0 ? shortlist[currentIndex - 1] : null
  const nextSupplier = currentIndex >= 0 && currentIndex < shortlist.length - 1 ? shortlist[currentIndex + 1] : null
  const [showCompanyProfile, setShowCompanyProfile] = React.useState(false)

  const totalSum = data.categories.reduce(
    (sum, c) => sum + (c.totalAmount ?? 0),
    0
  )

  const clusterLabel =
    data.cluster === 'full-scope' ? 'FULL SCOPE SYSTEM' : 'SMALLER SYSTEM'
  const basePath =
    projectType === 'led'
      ? '/supplier-comparison/led'
      : projectType === 'led-rostock'
        ? '/supplier-comparison/led-rostock'
        : '/supplier-comparison'
  const isLedLike = projectType === 'led' || projectType === 'led-rostock'

  const formatAmount = (amount: number) => {
    if (viewMode === 'absolute') return isLedLike ? formatEur(amount) : formatPounds(amount)
    if (viewMode === 'per-kwp') {
      const perUnit = Math.round(amount / data.systemKwp)
      return isLedLike ? formatPerLuminaire(perUnit) : formatKwp(perUnit)
    }
    return `${((amount / totalSum) * 100).toFixed(1)}%`
  }

  return (
    <>
    <div className="min-h-screen bg-cq-bg">
      <div className="w-full max-w-screen-2xl mx-auto px-6 sm:px-8 lg:px-10 py-8">
        {/* 1. Header */}
        <nav className="flex items-center gap-1.5 text-sm text-cq-text-secondary mb-4 font-medium">
          <Link
            href={basePath}
            className="hover:text-cq-link hover:underline"
          >
            Supplier Price Comparison
          </Link>
          <ChevronRight className="w-4 h-4 text-cq-muted" />
          <span className="text-cq-text font-medium">
            {shortlist.find((s) => s.id === currentId)?.name ?? ALL_SUPPLIER_NAMES[currentId] ?? data.name}
          </span>
        </nav>

        {/* Block 1: Header — logo, name, badges + source docs */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 lg:gap-8">
            <div className="min-w-0 flex-1">
              <div className="mb-4">
                {SUPPLIER_LOGOS[currentId] ? (
                  <Image
                    src={SUPPLIER_LOGOS[currentId]}
                    alt=""
                    width={64}
                    height={64}
                    className="object-contain rounded-lg w-16 h-16"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-cq-border-light flex items-center justify-center text-sm font-bold text-cq-text-secondary">
                    {(shortlist.find((s) => s.id === currentId)?.name ?? ALL_SUPPLIER_NAMES[currentId] ?? data.name)
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <h1 className="text-[28px] font-extrabold text-cq-text leading-tight">
                  {shortlist.find((s) => s.id === currentId)?.name ?? ALL_SUPPLIER_NAMES[currentId] ?? data.name}
                </h1>
                <div className="flex flex-wrap items-center gap-2">
                  <QualityBadge quality={data.quality} />
                  <span className="text-xs font-bold uppercase tracking-wider text-cq-text-secondary">
                    {clusterLabel}
                  </span>
                </div>
              </div>
              <Button
                onClick={() => setShowCompanyProfile(true)}
                className="bg-cq-green hover:bg-cq-green-hover text-white font-semibold"
              >
                Supplier Profile
              </Button>
            </div>
            <div className="w-full max-w-[340px] min-w-0">
              <div className="flex items-center justify-between gap-4 mb-2">
                <h3 className="text-base font-bold text-cq-text">Source Documents</h3>
                {data.sourceDocuments && data.sourceDocuments.length >= 2 && (
                  <Button variant="outline" size="sm" asChild className="border-cq-border bg-white hover:bg-cq-bg text-cq-text shrink-0 ml-auto">
                    <a href="#">Download all</a>
                  </Button>
                )}
              </div>
              {data.sourceDocuments && data.sourceDocuments.length > 0 ? (
                <div className="space-y-1.5">
                  {data.sourceDocuments.map((doc, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm flex-wrap">
                      <FileText className="w-3.5 h-3.5 text-cq-text-secondary shrink-0" />
                      <Button variant="link" size="sm" asChild className="h-auto p-0 font-medium text-cq-link hover:text-cq-green shrink-0">
                        <a href="#">{doc.filename}</a>
                      </Button>
                      <span className="text-cq-muted text-xs tabular-nums shrink-0">{doc.size}</span>
                      <span
                        className={cn(
                          'text-xs font-semibold shrink-0',
                          doc.status === 'extracted' ? 'text-cq-muted' : 'text-cq-amber'
                        )}
                      >
                        {doc.status === 'extracted' ? 'Extracted' : '⚠ Unreadable'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-cq-muted">No documents uploaded</p>
              )}
            </div>
          </div>
        </div>

        {/* Overview block: specs, numbers/graphs, characterisation, key flags */}
        <div className="mb-8">
          <div className="space-y-8">
            <div className="flex flex-wrap gap-x-6 gap-y-4 text-sm min-w-0">
              {(
                isLedLike
                  ? [
                      { label: 'Luminaires', value: data.specs.panels, icon: Lamp },
                      { label: 'Workmanship warranty', value: data.specs.workmanshipWarranty, icon: Shield },
                      { label: 'Luminaire warranty', value: data.specs.panelWarranty, icon: Shield },
                    ]
                  : [
                      { label: 'Panels', value: data.specs.panels, icon: Sun },
                      { label: 'Inverters', value: data.specs.inverters, icon: Zap },
                      { label: 'Mounting', value: data.specs.mounting, icon: Wrench },
                      { label: 'Workmanship warranty', value: data.specs.workmanshipWarranty, icon: Shield },
                      { label: 'Panel warranty', value: data.specs.panelWarranty, icon: Shield },
                      { label: 'Inverter warranty', value: data.specs.inverterWarranty, icon: Shield },
                    ]
              ).map(({ label, value, icon: Icon }) => (
                <div key={label} className="flex items-start gap-2 flex-shrink-0">
                  <Icon className="w-4 h-4 text-cq-text-secondary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-cq-text-secondary mb-0.5">{label}</p>
                    <p className="font-medium text-cq-text">{value}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="grid md:grid-cols-2 gap-8 items-start">
              <div>
                <p className="text-sm text-cq-text leading-relaxed mb-4">{data.characterisation}</p>
                <ul className="space-y-2 list-none">
                  {data.keyFlags.map((flag, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-cq-text-secondary">
                      <KeyFlagIcon icon={flag.icon} />
                      <span>{flag.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col gap-4">
                <CategoryBreakdownChart categories={data.categories} totalSum={totalSum} isLedLike={isLedLike} formatAmount={formatAmount} />
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl border border-cq-border bg-white p-4 min-h-[100px]">
                    <p className="text-xs font-semibold uppercase tracking-wider text-cq-text-secondary mb-1">Total</p>
                    <div className="flex items-center gap-4">
                      <p className="text-2xl font-bold text-cq-text tabular-nums shrink-0">
                        {isLedLike ? formatEur(data.totalPounds) : formatPounds(data.totalPounds)}
                      </p>
                      <div className="flex-1 min-w-0">
                        <PositionBar
                          percent={data.totalPercentPosition}
                          label={data.totalPosition === 'below' ? 'Below median' : 'Above median'}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="rounded-xl border border-cq-border bg-white p-4 min-h-[100px]">
                    <p className="text-xs font-semibold uppercase tracking-wider text-cq-text-secondary mb-1">
                      {isLedLike ? '€/luminaire' : '£/kWp'}
                    </p>
                    <div className="flex items-center gap-4">
                      <p className="text-2xl font-bold text-cq-text tabular-nums shrink-0">
                        {isLedLike ? formatPerLuminaire(data.perKwp) : formatKwp(data.perKwp)}
                      </p>
                      <div className="flex-1 min-w-0">
                        <PositionBar
                          percent={data.perKwpPercentPosition}
                          label={data.perKwpPosition === 'below' ? 'Below median' : 'Above median'}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 5. Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 mt-8">
          <ToggleGroup.Root
            type="single"
            value={viewMode}
            onValueChange={(v) => v && setViewMode(v as ViewMode)}
            className="inline-flex rounded-lg border border-cq-border bg-cq-bg overflow-hidden"
          >
            {[
              { value: 'absolute', label: isLedLike ? 'Absolute €' : 'Absolute £' },
              { value: 'per-kwp', label: isLedLike ? '€/luminaire' : '£/kWp' },
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
          <label
            className={cn(
              'inline-flex items-center gap-3 text-base font-semibold cursor-pointer',
              intelligenceOn ? 'text-cq-text' : 'text-cq-text-secondary'
            )}
          >
            <Switch
              checked={intelligenceOn}
              onCheckedChange={setIntelligenceOn}
              className="scale-125 data-[state=checked]:bg-cq-green data-[state=unchecked]:bg-cq-border"
            />
            CQuel Intelligence
          </label>
        </div>

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

        {/* 6. Category breakdown table */}
        <div className="rounded-xl border border-cq-border bg-white overflow-hidden mb-8">
          <div className="divide-y divide-cq-border">
            {data.categories.map((cat, catIdx) => (
              <div
                key={catIdx}
                className={cn(cat.dimmed && 'opacity-60')}
              >
                {/* Category header row */}
                <div className="flex flex-wrap items-center gap-3 gap-y-2 px-4 py-3 bg-cq-bg">
                  <span className={cn('font-bold text-cq-text whitespace-nowrap w-48 shrink-0', cat.dimmed && 'text-cq-muted')}>
                    {cat.name}
                  </span>
                  {cat.flag && (
                    <span className="inline-flex items-center gap-1 text-xs text-cq-text-secondary shrink-0">
                      ⚠️ {cat.flag}
                    </span>
                  )}
                  <div className="flex items-center gap-6 ml-auto shrink-0">
                    {cat.proportionPercent != null && cat.medianPercent != null && (
                      <ProportionBar
                        supplierPercent={cat.proportionPercent}
                        medianPercent={cat.medianPercent}
                      />
                    )}
                    <div className="text-right tabular-nums font-bold text-cq-text w-20 shrink-0">
                      {cat.totalAmount != null ? formatAmount(cat.totalAmount) : '—'}
                    </div>
                  </div>
                </div>

                {/* Sub-category rows */}
                {cat.subCategories.map((sub, subIdx) => (
                  <div
                    key={subIdx}
                    className="flex flex-wrap items-start gap-2 sm:gap-4 px-4 py-2 border-t border-cq-border/50"
                  >
                    <span className={cn('text-sm font-medium text-cq-text w-48 shrink-0 whitespace-nowrap', cat.dimmed && 'text-cq-muted')}>
                      {sub.name}
                    </span>
                    <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
                      <span className={cn('text-sm', cat.dimmed ? 'text-cq-muted' : 'text-cq-text')}>
                        {sub.description}
                      </span>
                      {sub.tag === 'provisional' && (
                        <span className="text-xs font-medium text-cq-amber shrink-0">provisional</span>
                      )}
                      {sub.tag === 'bundled' && (
                        <span className="text-xs text-cq-muted shrink-0">bundled</span>
                      )}
                    </div>
                    <div className="text-right tabular-nums text-sm text-cq-text shrink-0 sm:ml-auto w-16">
                      {sub.amount != null ? formatAmount(sub.amount) : '—'}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* 7. Navigation footer */}
        <div className="flex items-center justify-end gap-3">
          {prevSupplier ? (
            <Link
              href={`${basePath}/${prevSupplier.id}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-cq-border bg-white text-cq-text font-semibold hover:bg-cq-bg transition-colors text-sm"
            >
              <ChevronLeft className="w-4 h-4" />
              {prevSupplier.name}
            </Link>
          ) : (
            <span className="w-24" />
          )}
          <span className="inline-flex items-center px-4 py-2 text-cq-text font-semibold">
            {shortlist.find((s) => s.id === currentId)?.name ?? ALL_SUPPLIER_NAMES[currentId] ?? data.name}
          </span>
          {nextSupplier ? (
            <Link
              href={`${basePath}/${nextSupplier.id}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-cq-border bg-white text-cq-text font-semibold hover:bg-cq-bg transition-colors text-sm"
            >
              {nextSupplier.name}
              <ChevronRight className="w-4 h-4" />
            </Link>
          ) : (
            <span className="w-24" />
          )}
        </div>
      </div>
    </div>

    {showCompanyProfile && (
      <div className="fixed inset-0 z-[9999] flex items-center justify-end">
        <div
          className="absolute inset-0 bg-black/50"
          onClick={() => setShowCompanyProfile(false)}
          aria-hidden
        />
        <div className="relative w-full max-w-2xl h-full bg-white shadow-xl overflow-y-auto p-6">
          <SupplierCompanyProfile
            onClose={() => setShowCompanyProfile(false)}
          />
        </div>
      </div>
    )}
    </>
  )
}
