"use client";

import * as React from "react";
import Link from "next/link";
import { User } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TooltipProps } from "recharts";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { sectionTitleClass } from "@/lib/ui/headings";
import { cn } from "@/lib/utils";
import {
  MOMENTUM_POINTS,
  MOMENTUM_SERIES,
  PIPELINE_INSIGHTS,
  PIPELINE_STAGES,
  PORTFOLIO_BATCHES,
  PORTFOLIO_USER,
  RECENT_ACTIVITY,
  STAGE_DAYS,
} from "@/lib/customer/portfolio/mock-data";

function cardClass(className?: string) {
  return cn(
    "overflow-hidden rounded-lg border border-border-dark bg-white ",
    className,
  );
}

function PipelineCard() {
  const [hoveredId, setHoveredId] = React.useState<string | null>(null);

  return (
    <section className={cardClass()}>
      <header className="border-b border-border-dark px-5 py-4 sm:px-6">
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
                  "truncate p7 transition-colors sm:p6",
                  hoveredId === stage.id
                    ? "text-[var(--brand-6)]"
                    : "text-text-secondary",
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
                      "relative flex h-full min-w-[2px] items-center justify-center outline-none transition-colors duration-150",
                      "focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-[var(--brand-6)] focus-visible:ring-offset-1",
                    )}
                    style={{
                      flex: `${stage.count} 1 0`,
                      backgroundColor:
                        hoveredId === stage.id ? "var(--brand-6)" : stage.color,
                    }}
                    onMouseEnter={() => setHoveredId(stage.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onFocus={() => setHoveredId(stage.id)}
                    onBlur={() => setHoveredId(null)}
                  >
                    <span
                      className={cn(
                        "h8 tabular-nums sm:p6",
                        hoveredId === stage.id || stage.onDark
                          ? "text-white"
                          : "text-text-primary",
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
                  className="max-w-[240px] border border-border-dark bg-white px-3 py-2.5 text-left text-text-primary shadow-md"
                >
                  <p className="p6 text-text-primary">{stage.valueLabel}</p>
                  <p className="mt-0.5 p7 text-text-secondary">
                    {stage.detail}
                  </p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </TooltipProvider>

        <div className="mt-6 grid gap-4 border-t border-border-dark pt-5 sm:grid-cols-3">
          {PIPELINE_INSIGHTS.map((insight) => (
            <div key={insight.text} className="flex items-start gap-2.5 p6">
              <span
                className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: insight.color }}
                aria-hidden
              />
              <p className="leading-snug text-text-primary">
                <span className="">{insight.text}</span>
                <span className="text-text-secondary">
                  {" "}
                  ·{" "}
                  <span
                    className={
                      insight.warn ? " text-[var(--brand-6)]" : undefined
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
  );
}

function RecentActivityCard() {
  return (
    <section className={cardClass()}>
      <header className="flex items-center justify-between gap-3 border-b border-border-dark px-5 py-4 sm:px-6">
        <h2 className={sectionTitleClass}>Recent Activity</h2>
        <button type="button" className="btn-link">
          See all
        </button>
      </header>
      <ul className="divide-y divide-border-dark">
        {RECENT_ACTIVITY.map((item) => (
          <li
            key={item.id}
            className="flex items-start gap-3 px-5 py-4 sm:px-6"
          >
            <span
              className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-bg-container-grey text-text-secondary"
              aria-hidden
            >
              <User className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="h8 text-text-primary">{item.title}</p>
              <p className="mt-0.5 p6 text-text-secondary">{item.detail}</p>
              <p className="mt-1 p7 text-text-secondary">{item.when}</p>
            </div>
            <Link
              href={item.href}
              className="shrink-0 pt-0.5 h8 text-text-primary underline underline-offset-2 hover:text-[var(--brand-6)]"
            >
              Go to Project
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function MomentumTooltip({
  active,
  payload,
  label,
}: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;

  return (
    <div className="max-w-[220px] rounded-md border border-border-dark bg-white px-3 py-2.5 text-left shadow-md">
      <p className="p6 text-text-primary">{label}</p>
      <ul className="mt-1.5 space-y-1">
        {payload.map((entry) => {
          const series = MOMENTUM_SERIES.find((s) => s.key === entry.dataKey);
          return (
            <li
              key={String(entry.dataKey)}
              className="flex items-center justify-between gap-4 p7"
            >
              <span className="inline-flex items-center gap-1.5 text-text-secondary">
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: series?.color ?? entry.color }}
                  aria-hidden
                />
                {series?.label ?? entry.name}
              </span>
              <span className="font-semibold tabular-nums text-text-primary">
                {entry.value}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

type MomentumPoint = (typeof MOMENTUM_POINTS)[number];

function isMomentumEmpty(points: readonly MomentumPoint[]): boolean {
  if (points.length === 0) return true;
  return points.every((point) =>
    MOMENTUM_SERIES.every((series) => {
      const value = point[series.key as keyof MomentumPoint];
      return typeof value !== "number" || value === 0;
    }),
  );
}

function MomentumEmptyState() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center px-6 text-center">
      <p className="p6 text-text-secondary">No projects to track yet</p>
      <p className="mt-1.5 max-w-[320px] p6 text-text-tertiary">
        As projects move from onboarded to delivered, you&apos;ll see their
        progress build here over time.
      </p>
    </div>
  );
}

function MomentumCard({
  points = MOMENTUM_POINTS,
  isLoading = false,
}: {
  points?: readonly MomentumPoint[];
  isLoading?: boolean;
} = {}) {
  const [hoverSeries, setHoverSeries] = React.useState<string | null>(null);
  const empty = !isLoading && isMomentumEmpty(points);

  return (
    <section className={cardClass()}>
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border-dark px-5 py-4 sm:px-6">
        <h2 className={sectionTitleClass}>Momentum</h2>
        <ul className="flex flex-wrap gap-x-3 gap-y-1 p7 text-text-secondary">
          {MOMENTUM_SERIES.map((series) => (
            <li key={series.key}>
              <button
                type="button"
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md px-1 py-0.5 transition-colors",
                  hoverSeries === series.key
                    ? "bg-[var(--bg-accent)] text-[var(--brand-6)]"
                    : "hover:text-text-primary",
                )}
                onMouseEnter={() => setHoverSeries(series.key)}
                onMouseLeave={() => setHoverSeries(null)}
                disabled={empty || isLoading}
              >
                <span
                  className="inline-block w-4"
                  style={
                    "strokeDasharray" in series && series.strokeDasharray
                      ? {
                          borderTop: `2px dashed ${
                            hoverSeries === series.key
                              ? "var(--brand-6)"
                              : series.color
                          }`,
                          height: 0,
                        }
                      : {
                          height: 2,
                          backgroundColor:
                            hoverSeries === series.key
                              ? "var(--brand-6)"
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
            <span className="p6 text-text-tertiary">Loading…</span>
          </div>
        ) : empty ? (
          <MomentumEmptyState />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={[...points]}
              margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
            >
              <CartesianGrid stroke="var(--border-light)" vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
                interval="preserveStartEnd"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
              />
              <RechartsTooltip
                content={<MomentumTooltip />}
                cursor={{
                  stroke: "var(--brand-6)",
                  strokeWidth: 1,
                  strokeDasharray: "4 4",
                }}
              />
              {MOMENTUM_SERIES.map((series) => {
                const active = hoverSeries === series.key;
                const dash =
                  "strokeDasharray" in series
                    ? series.strokeDasharray
                    : undefined;
                return (
                  <Line
                    key={series.key}
                    type="monotone"
                    dataKey={series.key}
                    name={series.label}
                    stroke={active ? "var(--brand-6)" : series.color}
                    strokeWidth={
                      active ? 3 : series.key === "inDelivery" ? 2.5 : 2
                    }
                    strokeDasharray={dash}
                    dot={false}
                    activeDot={{
                      r: 5,
                      fill: "var(--brand-6)",
                      stroke: "#fff",
                      strokeWidth: 2,
                    }}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
}

function DaysInStageCard() {
  const maxDays = Math.max(...STAGE_DAYS.map((s) => s.days));
  const [hovered, setHovered] = React.useState<string | null>(null);

  return (
    <section className={cardClass()}>
      <header className="border-b border-border-dark px-5 py-4 sm:px-6">
        <h2 className={sectionTitleClass}>Days in each stage</h2>
      </header>
      <TooltipProvider delayDuration={80}>
        <ul className="space-y-1 px-3 py-3 sm:px-4 sm:py-4">
          {STAGE_DAYS.map((row) => {
            const active = hovered === row.label;
            return (
              <li key={row.label}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="grid w-full grid-cols-[7.5rem_1fr_auto] items-center gap-3 rounded-md px-2 py-2 text-left outline-none transition-colors sm:grid-cols-[8.5rem_1fr_auto] sm:gap-4 sm:px-2"
                      onMouseEnter={() => setHovered(row.label)}
                      onMouseLeave={() => setHovered(null)}
                    >
                      <p
                        className={cn(
                          "truncate p6 transition-colors",
                          active
                            ? "text-[var(--brand-6)]"
                            : "text-text-primary",
                        )}
                      >
                        {row.label}
                      </p>
                      <div className="h-2.5 overflow-hidden rounded-full bg-bg-container-grey">
                        <div
                          className="h-full rounded-full transition-colors"
                          style={{
                            width: `${(row.days / maxDays) * 100}%`,
                            backgroundColor: active
                              ? "var(--brand-6)"
                              : "#9AA3B2",
                          }}
                        />
                      </div>
                      <p
                        className={cn(
                          "whitespace-nowrap text-right p6 tabular-nums transition-colors",
                          active
                            ? " text-[var(--brand-6)]"
                            : "text-text-secondary",
                        )}
                      >
                        {row.days}d{" "}
                        <span>
                          {row.vsBmk > 0 ? "+" : ""}
                          {row.vsBmk}% vs bmk
                        </span>
                      </p>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    sideOffset={8}
                    hideArrow
                    className="max-w-[240px] border border-border-dark bg-white px-3 py-2.5 text-left text-text-primary shadow-md"
                  >
                    <p className="p6 text-text-primary">{row.days}d average</p>
                    <p className="mt-0.5 p7 text-text-secondary">
                      {row.detail}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </li>
            );
          })}
        </ul>
      </TooltipProvider>
    </section>
  );
}

function BatchesCard() {
  const [hovered, setHovered] = React.useState<string | null>(null);

  return (
    <section className={cardClass()}>
      <header className="border-b border-border-dark px-5 py-4 sm:px-6">
        <h2 className={sectionTitleClass}>Batches</h2>
      </header>
      <ul className="space-y-1 px-3 py-3 sm:px-4 sm:py-4">
        {PORTFOLIO_BATCHES.map((batch) => (
          <li
            key={batch.id}
            className="flex flex-col gap-2.5 rounded-md px-2 py-2.5"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <p className="h8 text-text-primary">{batch.name}</p>
              <p className="p6 text-text-secondary">
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
                  const key = `${batch.id}-${seg.id}`;
                  const active = hovered === key;
                  return (
                    <Tooltip key={key}>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          role="listitem"
                          className="h-full min-w-[2px] outline-none transition-colors focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-[var(--brand-6)] focus-visible:ring-offset-1"
                          style={{
                            flex: seg.flex,
                            backgroundColor: active
                              ? "var(--brand-6)"
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
                        className="max-w-[220px] border border-border-dark bg-white px-3 py-2.5 text-left text-text-primary shadow-md"
                      >
                        <p className="p6 text-text-primary">
                          {seg.label}
                          <span className="ml-1.5 text-text-secondary">
                            {seg.count}
                          </span>
                        </p>
                        <p className="mt-0.5 p7 text-text-secondary">
                          {seg.detail}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </TooltipProvider>
          </li>
        ))}
      </ul>
    </section>
  );
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
  }));

  return (
    <div className="mx-auto w-full max-w-screen-2xl space-y-5 px-6 py-8 sm:px-8 lg:px-10">
      <h1 className="text-2xl font-semibold tracking-tight text-text-primary md:text-3xl">
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
  );
}
