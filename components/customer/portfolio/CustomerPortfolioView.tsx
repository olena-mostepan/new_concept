'use client'

import * as React from 'react'
import Link from 'next/link'
import { User } from 'lucide-react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { TooltipProps } from 'recharts'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { sectionTitleClass } from '@/lib/ui/headings'
import { cn } from '@/lib/utils'
import {
  MOMENTUM_POINTS,
  MOMENTUM_SERIES,
  PIPELINE_INSIGHTS,
  PIPELINE_STAGES,
  PORTFOLIO_BATCHES,
  PORTFOLIO_USER,
  RECENT_ACTIVITY,
  STAGE_DAYS,
} from '@/lib/customer/portfolio/mock-data'

function cardClass(className?: string) {
  return cn(
    'overflow-hidden rounded-xl border border-cq-border bg-white shadow-sm',
    className,
  )
}

function PipelineCard() {
  const [hoveredId, setHoveredId] = React.useState<string | null>(null)

  return (
    <section className={cardClass()}>
      <header className="border-b border-cq-border px-5 py-4 sm:px-6">
        <h2 className={sectionTitleClass}>Pipeline</h2>
      </header>

      <div className="px-5 py-5 sm:px-6">
        <div className="flex w-full gap-1.5">
          {PIPELINE_STAGES.map((stage) => (
            <div
              key={stage.id}
              className="min-w-0 text-center"
              style={{ flex: `${stage.count} 1 0` }}
            >
              <p
                className={cn(
                  'truncate text-xs font-medium transition-colors sm:text-sm',
                  hoveredId === stage.id
                    ? 'text-[var(--cq-green)]'
                    : 'text-cq-text-secondary',
                )}
              >
                {stage.label}
              </p>
            </div>
          ))}
        </div>

        <TooltipProvider delayDuration={80}>
          <div
            className="mt-2 flex h-10 w-full overflow-hidden rounded-full sm:h-12"
            role="list"
            aria-label="Pipeline stages"
          >
            {PIPELINE_STAGES.map((stage) => (
              <Tooltip key={stage.id}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    role="listitem"
                    className={cn(
                      'relative flex h-full min-w-[2px] items-center justify-center outline-none transition-colors duration-150',
                      'focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-[var(--cq-green)] focus-visible:ring-offset-1',
                    )}
                    style={{
                      flex: `${stage.count} 1 0`,
                      backgroundColor:
                        hoveredId === stage.id
                          ? 'var(--cq-green)'
                          : stage.color,
                    }}
                    onMouseEnter={() => setHoveredId(stage.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onFocus={() => setHoveredId(stage.id)}
                    onBlur={() => setHoveredId(null)}
                  >
                    <span
                      className={cn(
                        'text-sm font-semibold tabular-nums sm:text-base',
                        hoveredId === stage.id || stage.onDark
                          ? 'text-white'
                          : 'text-cq-text',
                      )}
                    >
                      {stage.count}
                    </span>
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  sideOffset={10}
                  hideArrow
                  className="max-w-[240px] border border-cq-border bg-white px-3 py-2.5 text-left text-cq-text shadow-md"
                >
                  <p className="text-sm font-medium text-cq-text">
                    {stage.valueLabel}
                  </p>
                  <p className="mt-0.5 text-xs text-cq-text-secondary">
                    {stage.detail}
                  </p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </TooltipProvider>

        <div className="mt-6 grid gap-4 border-t border-cq-border pt-5 sm:grid-cols-3">
          {PIPELINE_INSIGHTS.map((insight) => (
            <div key={insight.text} className="flex items-start gap-2.5 text-sm">
              <span
                className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: insight.color }}
                aria-hidden
              />
              <p className="leading-snug text-cq-text">
                <span className="font-medium">{insight.text}</span>
                <span className="text-cq-text-secondary">
                  {' '}
                  ·{' '}
                  <span
                    className={
                      insight.warn
                        ? 'font-medium text-[var(--cq-green)]'
                        : undefined
                    }
                  >
                    {insight.meta}
                  </span>
                </span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function RecentActivityCard() {
  return (
    <section className={cardClass()}>
      <header className="flex items-center justify-between gap-3 border-b border-cq-border px-5 py-4 sm:px-6">
        <h2 className={sectionTitleClass}>Recent Activity</h2>
        <button type="button" className="btn-link">
          See all
        </button>
      </header>
      <ul className="divide-y divide-cq-border">
        {RECENT_ACTIVITY.map((item) => (
          <li
            key={item.id}
            className="flex items-start gap-3 px-5 py-4 sm:px-6"
          >
            <span
              className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cq-bg text-cq-text-secondary"
              aria-hidden
            >
              <User className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-cq-text">{item.title}</p>
              <p className="mt-0.5 text-sm text-cq-text-secondary">
                {item.detail}
              </p>
              <p className="mt-1 text-xs text-cq-text-secondary">{item.when}</p>
            </div>
            <Link
              href={item.href}
              className="shrink-0 pt-0.5 text-sm font-semibold text-cq-text underline underline-offset-2 hover:text-[var(--cq-green)]"
            >
              Go to Project
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

function MomentumTooltip({
  active,
  payload,
  label,
}: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null

  return (
    <div className="max-w-[220px] rounded-md border border-cq-border bg-white px-3 py-2.5 text-left shadow-md">
      <p className="text-sm font-medium text-cq-text">{label}</p>
      <ul className="mt-1.5 space-y-1">
        {payload.map((entry) => {
          const series = MOMENTUM_SERIES.find((s) => s.key === entry.dataKey)
          return (
            <li
              key={String(entry.dataKey)}
              className="flex items-center justify-between gap-4 text-xs"
            >
              <span className="inline-flex items-center gap-1.5 text-cq-text-secondary">
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: series?.color ?? entry.color }}
                  aria-hidden
                />
                {series?.label ?? entry.name}
              </span>
              <span className="font-semibold tabular-nums text-cq-text">
                {entry.value}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

type MomentumPoint = (typeof MOMENTUM_POINTS)[number]

function isMomentumEmpty(points: readonly MomentumPoint[]): boolean {
  if (points.length === 0) return true
  return points.every((point) =>
    MOMENTUM_SERIES.every((series) => {
      const value = point[series.key as keyof MomentumPoint]
      return typeof value !== 'number' || value === 0
    }),
  )
}

function MomentumEmptyState() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center px-6 text-center">
      <p className="text-base font-medium text-cq-text-secondary">
        No projects to track yet
      </p>
      <p className="mt-1.5 max-w-[320px] text-sm text-cq-muted">
        As projects move from onboarded to delivered, you&apos;ll see their
        progress build here over time.
      </p>
    </div>
  )
}

function MomentumCard({
  points = MOMENTUM_POINTS,
  isLoading = false,
}: {
  points?: readonly MomentumPoint[]
  isLoading?: boolean
} = {}) {
  const [hoverSeries, setHoverSeries] = React.useState<string | null>(null)
  const empty = !isLoading && isMomentumEmpty(points)

  return (
    <section className={cardClass()}>
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-cq-border px-5 py-4 sm:px-6">
        <h2 className={sectionTitleClass}>Momentum</h2>
        <ul className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-cq-text-secondary">
          {MOMENTUM_SERIES.map((series) => (
            <li key={series.key}>
              <button
                type="button"
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-md px-1 py-0.5 transition-colors',
                  hoverSeries === series.key
                    ? 'bg-[var(--cq-accent-muted)] text-[var(--cq-green)]'
                    : 'hover:text-cq-text',
                )}
                onMouseEnter={() => setHoverSeries(series.key)}
                onMouseLeave={() => setHoverSeries(null)}
                disabled={empty || isLoading}
              >
                <span
                  className="inline-block w-4"
                  style={
                    'strokeDasharray' in series && series.strokeDasharray
                      ? {
                          borderTop: `2px dashed ${
                            hoverSeries === series.key
                              ? 'var(--cq-green)'
                              : series.color
                          }`,
                          height: 0,
                        }
                      : {
                          height: 2,
                          backgroundColor:
                            hoverSeries === series.key
                              ? 'var(--cq-green)'
                              : series.color,
                        }
                  }
                  aria-hidden
                />
                {series.label}
              </button>
            </li>
          ))}
        </ul>
      </header>

      <div className="h-56 w-full px-5 py-5 sm:h-64 sm:px-6">
        {isLoading ? (
          <div
            className="flex h-full w-full items-center justify-center"
            aria-busy="true"
            aria-live="polite"
          >
            <span className="text-sm text-cq-muted">Loading…</span>
          </div>
        ) : empty ? (
          <MomentumEmptyState />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={[...points]}
              margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
            >
              <CartesianGrid stroke="var(--cq-border-light)" vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tick={{ fill: 'var(--cq-text-secondary)', fontSize: 11 }}
                interval="preserveStartEnd"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: 'var(--cq-text-secondary)', fontSize: 11 }}
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
              />
              <RechartsTooltip
                content={<MomentumTooltip />}
                cursor={{
                  stroke: 'var(--cq-green)',
                  strokeWidth: 1,
                  strokeDasharray: '4 4',
                }}
              />
              {MOMENTUM_SERIES.map((series) => {
                const active = hoverSeries === series.key
                const dash =
                  'strokeDasharray' in series
                    ? series.strokeDasharray
                    : undefined
                return (
                  <Line
                    key={series.key}
                    type="monotone"
                    dataKey={series.key}
                    name={series.label}
                    stroke={active ? 'var(--cq-green)' : series.color}
                    strokeWidth={
                      active ? 3 : series.key === 'inDelivery' ? 2.5 : 2
                    }
                    strokeDasharray={dash}
                    dot={false}
                    activeDot={{
                      r: 5,
                      fill: 'var(--cq-green)',
                      stroke: '#fff',
                      strokeWidth: 2,
                    }}
                  />
                )
              })}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  )
}

function DaysInStageCard() {
  const maxDays = Math.max(...STAGE_DAYS.map((s) => s.days))
  const [hovered, setHovered] = React.useState<string | null>(null)

  return (
    <section className={cardClass()}>
      <header className="border-b border-cq-border px-5 py-4 sm:px-6">
        <h2 className={sectionTitleClass}>Days in each stage</h2>
      </header>
      <TooltipProvider delayDuration={80}>
        <ul className="space-y-1 px-3 py-3 sm:px-4 sm:py-4">
          {STAGE_DAYS.map((row) => {
            const active = hovered === row.label
            return (
              <li key={row.label}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="grid w-full grid-cols-[7.5rem_1fr_auto] items-center gap-3 rounded-lg px-2 py-2 text-left outline-none transition-colors sm:grid-cols-[8.5rem_1fr_auto] sm:gap-4 sm:px-2"
                      onMouseEnter={() => setHovered(row.label)}
                      onMouseLeave={() => setHovered(null)}
                    >
                      <p
                        className={cn(
                          'truncate text-sm transition-colors',
                          active ? 'text-[var(--cq-green)]' : 'text-cq-text',
                        )}
                      >
                        {row.label}
                      </p>
                      <div className="h-2.5 overflow-hidden rounded-full bg-cq-bg">
                        <div
                          className="h-full rounded-full transition-colors"
                          style={{
                            width: `${(row.days / maxDays) * 100}%`,
                            backgroundColor: active
                              ? 'var(--cq-green)'
                              : '#9AA3B2',
                          }}
                        />
                      </div>
                      <p
                        className={cn(
                          'whitespace-nowrap text-right text-sm tabular-nums transition-colors',
                          active
                            ? 'font-medium text-[var(--cq-green)]'
                            : 'text-cq-text-secondary',
                        )}
                      >
                        {row.days}d{' '}
                        <span>
                          {row.vsBmk > 0 ? '+' : ''}
                          {row.vsBmk}% vs bmk
                        </span>
                      </p>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    sideOffset={8}
                    hideArrow
                    className="max-w-[240px] border border-cq-border bg-white px-3 py-2.5 text-left text-cq-text shadow-md"
                  >
                    <p className="text-sm font-medium text-cq-text">
                      {row.days}d average
                    </p>
                    <p className="mt-0.5 text-xs text-cq-text-secondary">
                      {row.detail}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </li>
            )
          })}
        </ul>
      </TooltipProvider>
    </section>
  )
}

function BatchesCard() {
  const [hovered, setHovered] = React.useState<string | null>(null)

  return (
    <section className={cardClass()}>
      <header className="border-b border-cq-border px-5 py-4 sm:px-6">
        <h2 className={sectionTitleClass}>Batches</h2>
      </header>
      <ul className="space-y-1 px-3 py-3 sm:px-4 sm:py-4">
        {PORTFOLIO_BATCHES.map((batch) => (
          <li key={batch.id} className="flex flex-col gap-2.5 rounded-lg px-2 py-2.5">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <p className="text-sm font-semibold text-cq-text">{batch.name}</p>
              <p className="text-sm text-cq-text-secondary">
                {batch.projectCount} projects · {batch.valueLabel}
              </p>
            </div>
            <TooltipProvider delayDuration={80}>
              <div
                className="flex h-4 w-full overflow-hidden rounded-full sm:h-5"
                role="list"
                aria-label={`${batch.name} stage mix`}
              >
                {batch.segments.map((seg) => {
                  const key = `${batch.id}-${seg.id}`
                  const active = hovered === key
                  return (
                    <Tooltip key={key}>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          role="listitem"
                          className="h-full min-w-[2px] outline-none transition-colors focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-[var(--cq-green)] focus-visible:ring-offset-1"
                          style={{
                            flex: seg.flex,
                            backgroundColor: active
                              ? 'var(--cq-green)'
                              : seg.color,
                          }}
                          onMouseEnter={() => setHovered(key)}
                          onMouseLeave={() => setHovered(null)}
                          aria-label={`${seg.label}: ${seg.count}`}
                        />
                      </TooltipTrigger>
                      <TooltipContent
                        side="top"
                        sideOffset={8}
                        hideArrow
                        className="max-w-[220px] border border-cq-border bg-white px-3 py-2.5 text-left text-cq-text shadow-md"
                      >
                        <p className="text-sm font-medium text-cq-text">
                          {seg.label}
                          <span className="ml-1.5 text-cq-text-secondary">
                            {seg.count}
                          </span>
                        </p>
                        <p className="mt-0.5 text-xs text-cq-text-secondary">
                          {seg.detail}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  )
                })}
              </div>
            </TooltipProvider>
          </li>
        ))}
      </ul>
    </section>
  )
}

export function CustomerPortfolioView() {
  // Demo: empty momentum until real project series exist
  const momentumPoints = MOMENTUM_POINTS.map((point) => ({
    ...point,
    onboarded: 0,
    quoted: 0,
    signed: 0,
    inDelivery: 0,
    delivered: 0,
  }))

  return (
    <div className="mx-auto w-full max-w-screen-2xl space-y-5 px-6 py-8 sm:px-8 lg:px-10">
      <h1 className="text-2xl font-semibold tracking-tight text-black md:text-3xl">
        Welcome back {PORTFOLIO_USER}
      </h1>

      <PipelineCard />

      <div className="grid gap-4 lg:grid-cols-2">
        <MomentumCard points={momentumPoints} />
        <RecentActivityCard />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <DaysInStageCard />
        <BatchesCard />
      </div>
    </div>
  )
}
