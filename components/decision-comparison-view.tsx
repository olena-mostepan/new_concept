'use client'

import * as React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { DecisionComparisonSupplier } from '@/lib/decision-comparison-data'
import { DEFAULT_DECISION_SUPPLIERS } from '@/lib/decision-comparison-data'

type DecisionComparisonViewProps = {
  suppliers?: DecisionComparisonSupplier[]
  totalSupplierCount?: number
  clusterLabel?: string
  projectType?: 'solar' | 'led' | 'led-rostock'
}

// ─── Sub-components ────────────────────────────────────────────────────

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


function CellValue({
  value,
  isWarning,
}: {
  value: string
  isWarning?: boolean
}) {
  if (value === '—' || value === '') {
    return <span className="text-cq-muted">—</span>
  }
  if (isWarning) {
    return (
      <span className="inline-flex items-center gap-1 text-cq-text-secondary text-sm">
        ⚠️ {value.replace(/^⚠+\s*/, '')}
      </span>
    )
  }
  return <span className="text-cq-text">{value}</span>
}

// ─── Main component ────────────────────────────────────────────────────

export function DecisionComparisonView({
  suppliers = DEFAULT_DECISION_SUPPLIERS,
  totalSupplierCount = 13,
  clusterLabel = 'full-scope systems',
  projectType = 'solar',
}: DecisionComparisonViewProps) {
  const selectedCount = suppliers.length
  const [whatAmIGettingExpanded, setWhatAmIGettingExpanded] = React.useState(false)
  const [whatHappensAfterExpanded, setWhatHappensAfterExpanded] = React.useState(false)
  const currency = (projectType === 'led' || projectType === 'led-rostock') ? '€' : '£'
  const formatAmount = (n: number) => {
    if (n >= 1_000_000) return `${currency}${(n / 1_000_000).toFixed(2)}M`
    if (n >= 1_000) return `${currency}${(n / 1_000).toFixed(1)}k`
    return `${currency}${n.toLocaleString()}`
  }
  const basePath =
    projectType === 'led'
      ? '/supplier-comparison/led'
      : projectType === 'led-rostock'
        ? '/supplier-comparison/led-rostock'
        : '/supplier-comparison'
  const isLedLike = projectType === 'led' || projectType === 'led-rostock'

  return (
    <div className="min-h-screen bg-cq-bg">
      <div className="w-full max-w-screen-2xl mx-auto px-6 sm:px-8 lg:px-10 py-4">
        <Link
          href={basePath}
          className="inline-block mb-2 text-sm font-bold text-cq-link hover:underline"
        >
          ← Back to all suppliers
        </Link>
        {/* 1. Header */}
        <div className="flex items-center justify-between gap-4 mb-4">
          <header>
            <h1 className="text-xl font-extrabold text-cq-text leading-tight">
              Supplier Price Comparison
            </h1>
            <p className="text-sm text-cq-text-secondary mt-0.5">
              Compare Shortlisted Suppliers
            </p>
          </header>
          <p className="text-sm text-cq-text-secondary shrink-0">
            {selectedCount} of {totalSupplierCount} suppliers selected · {clusterLabel}
          </p>
        </div>

        {/* 2. Comparison table */}
        <div className="rounded-xl border border-cq-border bg-white overflow-hidden">
          <div className="overflow-auto max-h-[calc(100vh-7rem)]">
            <table className="w-full text-sm">
              <thead>
                <tr className="sticky top-0 z-10 bg-cq-bg">
                  <th className="w-40 min-w-[140px] text-left py-2 px-4 font-semibold text-cq-text-secondary bg-cq-bg border-b border-r border-cq-border" />
                  {suppliers.map((s) => (
                    <th
                      key={s.id}
                      className="min-w-[200px] text-left py-2 px-4 bg-cq-bg border-b border-cq-border last:border-r-0"
                    >
                      <div className="flex items-start gap-2">
                        {s.logo ? (
                          <Image
                            src={s.logo}
                            alt=""
                            width={56}
                            height={56}
                            className="object-contain rounded-lg flex-shrink-0"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-lg bg-cq-border-light flex items-center justify-center text-sm font-bold text-cq-text-secondary flex-shrink-0">
                            {s.name.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-cq-text text-sm whitespace-nowrap">{s.name}</div>
                          <Link
                            href={`${basePath}/${s.id}`}
                            className="inline-flex items-center justify-center mt-2 px-8 py-1.5 rounded-lg border border-cq-border bg-white text-cq-text font-bold text-sm hover:bg-cq-bg hover:border-cq-green transition-colors min-w-[100px]"
                          >
                            View
                          </Link>
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Section 1: What am I paying */}
                <tr>
                  <td
                    colSpan={suppliers.length + 1}
                    className="py-1.5 px-4 font-extrabold text-cq-text text-center bg-cq-bg border-b border-cq-border text-sm"
                  >
                    What am I paying
                  </td>
                </tr>
                <tr className="border-b border-cq-border">
                  <td className="py-2 px-4 text-cq-text-secondary bg-white border-r border-cq-border">
                    {isLedLike ? '€/luminaire' : '£/kWp'}
                  </td>
                  {suppliers.map((s) => (
                    <td
                      key={s.id}
                      className="py-2 px-4 font-bold text-cq-text tabular-nums"
                    >
                      {currency}{s.perKwp.toLocaleString()}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-cq-border">
                  <td className="py-2 px-4 text-cq-text-secondary bg-white border-r border-cq-border">
                    Total
                  </td>
                  {suppliers.map((s) => (
                    <td key={s.id} className="py-2 px-4 text-cq-text tabular-nums">
                      {formatAmount(s.totalPounds)}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-cq-border">
                  <td className="py-2 px-4 text-cq-text-secondary bg-white border-r border-cq-border">
                    Adjusted cost
                  </td>
                  {suppliers.map((s) => (
                    <td key={s.id} className="py-2 px-4">
                      <CellValue
                        value={s.adjustedCost}
                        isWarning={s.adjustedCost !== 'As quoted'}
                      />
                    </td>
                  ))}
                </tr>

                {/* Section 2: What am I getting */}
                <tr>
                  <td
                    colSpan={suppliers.length + 1}
                    className={cn(
                      'py-1.5 px-4 font-extrabold text-cq-text text-center bg-cq-bg border-b border-cq-border text-sm',
                      'cursor-pointer hover:bg-cq-border-light/50 transition-colors'
                    )}
                    onClick={() => setWhatAmIGettingExpanded((v) => !v)}
                  >
                    <span className="inline-flex items-center justify-center gap-1.5">
                      What am I getting
                      {whatAmIGettingExpanded ? (
                        <ChevronUp className="w-4 h-4 text-cq-text-secondary" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-cq-text-secondary" />
                      )}
                    </span>
                  </td>
                </tr>
                <tr className="border-b border-cq-border">
                  <td className="py-2 px-4 text-cq-text-secondary bg-white border-r border-cq-border">
                    {isLedLike ? 'Luminaires' : 'System size'}
                  </td>
                  {suppliers.map((s) => (
                    <td key={s.id} className="py-2 px-4 text-cq-text tabular-nums">
                      {isLedLike
                        ? `${s.systemKwp.toLocaleString()} luminaires`
                        : `${s.systemKwp.toLocaleString()} kWp`}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-cq-border">
                  <td className="py-2 px-4 text-cq-text-secondary bg-white border-r border-cq-border">
                    Coverage
                  </td>
                  {suppliers.map((s) => (
                    <td key={s.id} className="py-2 px-4 text-cq-text">
                      {s.coverage}
                    </td>
                  ))}
                </tr>
                {whatAmIGettingExpanded && (
                  isLedLike ? (
                    <>
                      <tr className="border-b border-cq-border">
                        <td className="py-2 px-4 text-cq-text-secondary bg-white border-r border-cq-border">
                          Equipment
                        </td>
                        {suppliers.map((s) => (
                          <td key={s.id} className="py-2 px-4 text-cq-text">
                            {s.panels}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-cq-border">
                        <td className="py-2 px-4 text-cq-text-secondary bg-white border-r border-cq-border">
                          Product warranty
                        </td>
                        {suppliers.map((s) => (
                          <td key={s.id} className="py-2 px-4 text-cq-text">
                            {s.panelWarranty}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-cq-border">
                        <td className="py-2 px-4 text-cq-text-secondary bg-white border-r border-cq-border">
                          Workmanship warranty
                        </td>
                        {suppliers.map((s) => (
                          <td key={s.id} className="py-2 px-4 text-cq-text">
                            {s.workmanship}
                          </td>
                        ))}
                      </tr>
                    </>
                  ) : (
                    <>
                      <tr className="border-b border-cq-border">
                        <td className="py-2 px-4 text-cq-text-secondary bg-white border-r border-cq-border">
                          Panels
                        </td>
                        {suppliers.map((s) => (
                          <td key={s.id} className="py-2 px-4 text-cq-text">
                            {s.panels}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-cq-border">
                        <td className="py-2 px-4 text-cq-text-secondary bg-white border-r border-cq-border">
                          Inverters
                        </td>
                        {suppliers.map((s) => (
                          <td key={s.id} className="py-2 px-4 text-cq-text">
                            {s.inverters}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-cq-border">
                        <td className="py-2 px-4 text-cq-text-secondary bg-white border-r border-cq-border">
                          Mounting
                        </td>
                        {suppliers.map((s) => (
                          <td key={s.id} className="py-2 px-4 text-cq-text">
                            {s.mounting}
                          </td>
                        ))}
                      </tr>
                    </>
                  )
                )}
                <tr className="border-b border-cq-border">
                  <td className="py-2 px-4 text-cq-text-secondary bg-white border-r border-cq-border">
                    Exclusions
                  </td>
                  {suppliers.map((s) => (
                    <td key={s.id} className="py-2 px-4">
                      <CellValue
                        value={s.exclusions}
                        isWarning={s.exclusions !== '—'}
                      />
                    </td>
                  ))}
                </tr>

                {/* Section 3: Can I trust this number */}
                <tr>
                  <td
                    colSpan={suppliers.length + 1}
                    className="py-1.5 px-4 font-extrabold text-cq-text text-center bg-cq-bg border-b border-cq-border text-sm"
                  >
                    Can I trust this number
                  </td>
                </tr>
                <tr className="border-b border-cq-border">
                    <td className="py-2 px-4 text-cq-text-secondary bg-white border-r border-cq-border">
                    Quality
                  </td>
                  {suppliers.map((s) => (
                    <td key={s.id} className="py-2 px-4">
                      <QualityBadge quality={s.quality} />
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-cq-border">
                  <td className="py-2 px-4 text-cq-text-secondary bg-white border-r border-cq-border">
                    Documentation
                  </td>
                  {suppliers.map((s) => (
                    <td key={s.id} className="py-2 px-4 text-cq-text">
                      {s.documentation}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-cq-border">
                  <td className="py-2 px-4 text-cq-text-secondary bg-white border-r border-cq-border">
                    Reconciliation
                  </td>
                  {suppliers.map((s) => (
                    <td key={s.id} className="py-2 px-4">
                      <CellValue
                        value={s.reconciliation}
                        isWarning={s.reconciliation !== 'No issues found'}
                      />
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-cq-border">
                  <td className="py-2 px-4 text-cq-text-secondary bg-white border-r border-cq-border align-top">
                    Flags
                  </td>
                  {suppliers.map((s) => (
                    <td key={s.id} className="py-2 px-4 align-top">
                      {s.flags.length > 0 ? (
                        <div className="flex flex-col gap-1">
                          {s.flags.map((flag, i) => (
                            <span
                              key={i}
                              className="inline-flex items-start gap-1 text-cq-text-secondary text-sm"
                            >
                              ⚠️ {flag.replace(/^⚠+\s*/, '')}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-cq-muted">—</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Section 4: What happens after */}
                <tr>
                  <td
                    colSpan={suppliers.length + 1}
                    className={cn(
                      'py-1.5 px-4 font-extrabold text-cq-text text-center bg-cq-bg border-b border-cq-border text-sm',
                      'cursor-pointer hover:bg-cq-border-light/50 transition-colors'
                    )}
                    onClick={() => setWhatHappensAfterExpanded((v) => !v)}
                  >
                    <span className="inline-flex items-center justify-center gap-1.5">
                      What happens after
                      {whatHappensAfterExpanded ? (
                        <ChevronUp className="w-4 h-4 text-cq-text-secondary" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-cq-text-secondary" />
                      )}
                    </span>
                  </td>
                </tr>
                <tr className="border-b border-cq-border">
                  <td className="py-2 px-4 text-cq-text-secondary bg-white border-r border-cq-border">
                    Maintenance Contract
                  </td>
                  {suppliers.map((s) => (
                    <td key={s.id} className="py-2 px-4 text-cq-text">
                      {s.maintenanceContract}
                    </td>
                  ))}
                </tr>
                {whatHappensAfterExpanded && (
                  <>
                    <tr className="border-b border-cq-border">
                      <td className="py-2 px-4 text-cq-text-secondary bg-white border-r border-cq-border">
                        Panel warranty
                      </td>
                      {suppliers.map((s) => (
                        <td key={s.id} className="py-2 px-4 text-cq-text">
                          {s.panelWarranty}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-cq-border">
                      <td className="py-2 px-4 text-cq-text-secondary bg-white border-r border-cq-border">
                        Inverter warranty
                      </td>
                      {suppliers.map((s) => (
                        <td key={s.id} className="py-2 px-4 text-cq-text">
                          {s.inverterWarranty}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-cq-border">
                      <td className="py-2 px-4 text-cq-text-secondary bg-white border-r border-cq-border">
                        Workmanship
                      </td>
                      {suppliers.map((s) => (
                        <td key={s.id} className="py-2 px-4 text-cq-text">
                          {s.workmanship}
                        </td>
                      ))}
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}
