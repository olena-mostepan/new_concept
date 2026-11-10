"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  customerBatches,
  foldText,
  noun,
  projectsAtBuilding,
  servicePipeline,
  solutionName,
  wsIn,
  type ServiceCount,
} from "@/lib/concept/derive";
import { nAssets, nPackages, WORDS } from "@/lib/concept/words";
import {
  OWNER_LABEL,
  SERVICE_LABEL,
  type Account,
  type Batch,
  type Building,
} from "@/lib/concept/model";
import { cn } from "@/lib/utils";
import { Icon, Card, CardLink, focusRing } from "./ui";
import { useHrefs } from "./useHrefs";
import { Decisions } from "./Decisions";

const SHADES = [0.16, 0.3, 0.44, 0.58, 0.74, 1];

function ServiceSegment({
  segment,
  shade,
  first,
  last,
}: {
  segment: ServiceCount;
  shade: number;
  first: boolean;
  last: boolean;
}) {
  const hrefs = useHrefs();
  const [open, setOpen] = useState(false);
  const dark = shade >= 0.58;
  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null))
          setOpen(false);
      }}
    >
      <Link
        href={hrefs.service(segment.id)}
        aria-label={`${segment.label}, ${segment.projects} projects`}
        className={`flex h-10 items-center justify-center h8 tabular-nums outline-none ${first ? "rounded-l-full" : ""} ${last ? "rounded-r-full" : ""}`}
        style={{
          backgroundColor: open
            ? "var(--brand-6)"
            : `color-mix(in srgb, var(--black-7) ${Math.round(shade * 100)}%, white)`,
          color: open || dark ? "white" : "var(--black-7)",
        }}
      >
        {segment.projects}
      </Link>
      {open && (
        <div className="absolute bottom-full left-1/2 z-10 w-[280px] -translate-x-1/2 pb-2">
          <div className="rounded-md border border-border-dark bg-white px-4 py-3 shadow-floating">
            <div className="flex items-center justify-between gap-3">
              <p className="h8 min-w-0 text-text-primary">{segment.label}</p>
              <Link
                href={hrefs.service(segment.id)}
                className="h8 shrink-0 text-text-primary underline underline-offset-[3px] decoration-border-dark"
              >
                View
              </Link>
            </div>
            <p className="mt-0.5 p7 text-text-secondary">
              {SERVICE_LABEL[segment.id]}
            </p>
            <div className="mt-2 border-t border-border-light pt-2">
              {segment.byBatch.map((batch) => (
                <p
                  key={batch.batchId}
                  className="flex items-baseline justify-between gap-3 py-0.5"
                >
                  <span className="min-w-0 p6 text-text-secondary">
                    {batch.name}
                  </span>
                  <span className="shrink-0 p6 tabular-nums text-text-primary">
                    {batch.projects} projects
                  </span>
                </p>
              ))}
            </div>
            {segment.you > 0 && (
              <p className="mt-2 flex items-center gap-1.5 border-t border-border-light pt-2 p6 text-text-primary">
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-6"
                  aria-hidden
                />
                {OWNER_LABEL.you}: {nPackages(segment.you)}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Services({ account }: { account: Account }) {
  const hrefs = useHrefs();
  const pipe = servicePipeline(account);
  const services = pipe.services.filter((segment) => segment.projects > 0);
  const showCompleted = pipe.completed.projects > 0;
  const columns = [
    ...services.map((segment) => `minmax(7.5rem, ${segment.projects}fr)`),
    ...(showCompleted ? [`minmax(7.5rem, ${pipe.completed.projects}fr)`] : []),
  ].join(" ");
  const last = services.length + (showCompleted ? 1 : 0) - 1;
  return (
    <Card
      title="Services"
      bodyClassName="p-0"
      className="relative z-10 overflow-visible"
    >
      <div
        className="grid gap-y-2 px-6 py-5"
        style={{ gridTemplateColumns: columns }}
      >
        {services.map((segment) => (
          <p
            key={segment.id}
            className="whitespace-nowrap text-center h8 text-text-primary"
          >
            {segment.label}
          </p>
        ))}
        {showCompleted && (
          <p className="whitespace-nowrap text-center h8 text-text-primary">
            Completed
          </p>
        )}
        {services.map((segment, i) => (
          <ServiceSegment
            key={segment.id}
            segment={segment}
            shade={SHADES[Math.min(i, SHADES.length - 2)]}
            first={i === 0}
            last={i === last}
          />
        ))}
        {showCompleted && (
          <div
            className={`flex h-10 items-center justify-center h8 tabular-nums text-white ${services.length === 0 ? "rounded-l-full" : ""} rounded-r-full`}
            style={{ backgroundColor: "var(--black-7)" }}
          >
            {pipe.completed.projects}
          </div>
        )}
        {services.map((segment) => (
          <p
            key={`${segment.id}-sub`}
            className="text-center p7 text-text-tertiary"
          >
            {nPackages(segment.workstreams)}
          </p>
        ))}
        {showCompleted && (
          <p className="text-center p7 text-text-tertiary">
            {pipe.completed.solutions.join(" · ")}
          </p>
        )}
      </div>
      {pipe.you > 0 && (
        <div className="flex items-center justify-between border-t border-border-light px-6 py-3">
          <p className="flex items-center gap-2 p6 text-text-primary">
            <span
              className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-6"
              aria-hidden
            />
            {OWNER_LABEL.you}: {nPackages(pipe.you)}
          </p>
          <CardLink href={hrefs.buildings}>See {WORDS.assets}</CardLink>
        </div>
      )}
    </Card>
  );
}

const MONTH_LONG: Record<string, string> = {
  Jan: "January",
  Feb: "February",
  Mar: "March",
  Apr: "April",
  May: "May",
  Jun: "June",
  Jul: "July",
  Aug: "August",
  Sep: "September",
  Oct: "October",
  Nov: "November",
  Dec: "December",
};

function monthLong(month: string) {
  const [abbr, year] = month.split(" ");
  return `${MONTH_LONG[abbr] ?? abbr} 20${year ?? ""}`.trim();
}

function yScale(values: number[]) {
  const peak = Math.max(0, ...values);
  const max = Math.max(4, Math.ceil(peak / 4) * 4);
  return { max, ticks: [0, max / 4, max / 2, (max * 3) / 4, max] };
}

function LegendKey({ series }: { series: "started" | "finished" }) {
  if (series === "started") {
    return (
      <svg width="14" height="3" aria-hidden className="shrink-0">
        <rect width="14" height="3" rx="1.5" fill="var(--brand-6)" />
      </svg>
    );
  }
  return (
    <svg width="14" height="2" aria-hidden className="shrink-0">
      <line
        x1="0"
        y1="1"
        x2="14"
        y2="1"
        stroke="var(--black-7)"
        strokeWidth="2"
        strokeDasharray="4 3"
      />
    </svg>
  );
}

function StartedDot({ cx, cy }: { cx?: number; cy?: number }) {
  if (cx == null || cy == null) return null;
  return (
    <g>
      <circle cx={cx} cy={cy} r={8} fill="var(--brand-1)" />
      <circle
        cx={cx}
        cy={cy}
        r={4.5}
        fill="var(--brand-6)"
        stroke="white"
        strokeWidth={2}
      />
    </g>
  );
}

function MomentumTip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ dataKey?: string | number; value?: number }>;
  label?: string;
}) {
  if (!active || !payload?.length || !label) return null;
  const value = (key: string) =>
    payload.find((item) => item.dataKey === key)?.value;
  return (
    <div className="min-w-[180px] rounded-md bg-bg-container px-3 pb-3 pt-2 shadow-floating">
      <p className="h9 text-text-tertiary">{monthLong(label)}</p>
      {(
        [
          ["started", "Started"],
          ["finished", "Finished"],
        ] as const
      ).map(([key, name]) => (
        <div
          key={key}
          className="mt-1.5 flex items-center gap-2 p7 text-text-secondary"
        >
          <LegendKey series={key} />
          {name}
          <span className="ml-auto h8 text-text-primary tabular-nums">
            {value(key)}
          </span>
        </div>
      ))}
    </div>
  );
}

function Momentum({ account }: { account: Account }) {
  const [active, setActive] = useState<number | null>(null);
  if (!account.momentum) return null;
  const points = account.momentum;
  const { max, ticks } = yScale(points.flatMap((point) => [point.started, point.finished]));
  return (
    <Card title="Momentum" className="h-full">
      <div className="mb-3 flex gap-5 p7 text-text-secondary">
        <span className="inline-flex items-center gap-1.5">
          <LegendKey series="started" />
          Started
        </span>
        <span className="inline-flex items-center gap-1.5">
          <LegendKey series="finished" />
          Finished
        </span>
      </div>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={points}
            margin={{ top: 4, right: 8, bottom: 0, left: -20 }}
            onMouseMove={(state) => {
              const index = state?.isTooltipActive
                ? state.activeTooltipIndex
                : null;
              const next = typeof index === "number" ? index : null;
              setActive((current) => (current === next ? current : next));
            }}
            onMouseLeave={() => setActive(null)}
          >
            <defs>
              <linearGradient
                id="momentum-started"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor="var(--brand-6)" stopOpacity={0.16} />
                <stop offset="100%" stopColor="var(--brand-6)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--border-light)" vertical={false} />
            <XAxis
              dataKey="month"
              interval={0}
              axisLine={false}
              tickLine={false}
              tick={(props: {
                x?: number;
                y?: number;
                payload?: { value?: string };
                index?: number;
              }) => (
                <text
                  x={props.x}
                  y={props.y}
                  dy={16}
                  textAnchor="middle"
                  fill={
                    props.index === active
                      ? "var(--text-primary)"
                      : "var(--text-tertiary)"
                  }
                  fontSize={12}
                >
                  {props.payload?.value}
                </text>
              )}
            />
            <YAxis
              domain={[0, max]}
              ticks={ticks}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
              tick={(props: {
                x?: number;
                y?: number;
                payload?: { value?: number };
              }) => (
                <text
                  x={props.x}
                  y={props.y}
                  dy={4}
                  textAnchor="end"
                  fill="var(--text-tertiary)"
                  fontSize={12}
                  style={{ fontVariantNumeric: "tabular-nums" }}
                >
                  {props.payload?.value}
                </text>
              )}
            />
            <Tooltip
              cursor={{ stroke: "var(--black-3)", strokeDasharray: "3 3" }}
              content={<MomentumTip />}
              wrapperStyle={{ outline: "none" }}
              allowEscapeViewBox={{ x: false, y: true }}
            />
            <Line
              type="monotone"
              dataKey="finished"
              name="Finished"
              stroke="var(--black-7)"
              strokeWidth={2}
              strokeDasharray="4 3"
              dot={false}
              activeDot={{
                r: 4,
                fill: "var(--black-7)",
                stroke: "white",
                strokeWidth: 2,
              }}
              isAnimationActive={false}
            />
            <Area
              type="monotone"
              dataKey="started"
              name="Started"
              stroke="var(--brand-6)"
              strokeWidth={2.5}
              fill="url(#momentum-started)"
              dot={false}
              activeDot={StartedDot}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

function FindBuilding({ account }: { account: Account }) {
  const hrefs = useHrefs();
  const batches = customerBatches(account);
  const buildings = batches.flatMap((batch) =>
    batch.buildingIds
      .map((id) => account.buildings.find((item) => item.id === id))
      .filter((item): item is Building => Boolean(item)),
  );
  const unique = [
    ...new Map(buildings.map((item) => [item.id, item])).values(),
  ];
  const input = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const query = q.trim();
  const show = open && foldText(query).length >= 2;
  const needle = foldText(query);
  const buildingHits = show
    ? unique.flatMap((building) => {
        const batch = batches.find((item) =>
          item.buildingIds.includes(building.id),
        );
        const hay = foldText(
          `${building.name} ${building.address ?? ""} ${building.city} ${batch?.name ?? ""}`,
        );
        return hay.includes(needle) && batch ? [{ building, batch }] : [];
      })
    : [];
  const batchHits = show
    ? batches.filter((batch) => foldText(batch.name).includes(needle))
    : [];

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey)
        return;
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      )
        return;
      event.preventDefault();
      input.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (unique.length < 10) return null;
  return (
    <section className="relative rounded-lg border border-border-dark bg-white px-6 py-5">
      <label htmlFor="find-building" className="mb-2 block h8 text-text-title">
        Find an {WORDS.asset}
      </label>
      <div className="relative">
        <Icon name="search" size={22} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-icon-default" />
        <input
          id="find-building"
          ref={input}
          type="search"
          value={q}
          placeholder="Address, city or batch"
          onChange={(event) => {
            setQ(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          className="h-14 w-full rounded-[var(--radius-image)] border border-black-4 bg-white pl-12 pr-14 p6 font-sans text-text-primary outline-none placeholder:text-text-tertiary focus-visible:border-black-6 focus-visible:shadow-focus"
        />
        <kbd className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 rounded border border-black-3 px-1.5 py-0.5 p7 text-text-tertiary">
          /
        </kbd>
      </div>
      {show && (
        <div
          className="absolute left-6 right-6 top-[108px] z-20 rounded-lg border border-border-dark bg-white py-2 shadow-floating"
          onMouseDown={(event) => event.preventDefault()}
        >
          <p className="px-4 pb-1 pt-2 s3 text-text-tertiary">{WORDS.Assets}</p>
          {buildingHits.length === 0 ? (
            <p className="px-4 py-2 p6 text-text-secondary">
              No {WORDS.assets} match “{query}”
            </p>
          ) : (
            buildingHits.map(({ building, batch }) => (
              <BuildingHit
                key={building.id}
                building={building}
                batch={batch}
                account={account}
              />
            ))
          )}
          <p className="px-4 pb-1 pt-3 s3 text-text-tertiary">Batches</p>
          {batchHits.length === 0 ? (
            <p className="px-4 py-2 p6 text-text-secondary">
              No batches match “{query}”
            </p>
          ) : (
            batchHits.map((batch) => (
              <Link
                key={batch.id}
                href={hrefs.batch(batch.id)}
                className={cn(
                  "block rounded-sm px-4 py-2 outline-none h8 text-text-title hover:bg-black-2",
                  focusRing,
                )}
              >
                {batch.name}
              </Link>
            ))
          )}
        </div>
      )}
    </section>
  );
}

function BuildingHit({
  building,
  batch,
  account,
}: {
  building: Building;
  batch: Batch;
  account: Account;
}) {
  const hrefs = useHrefs();
  const projects = projectsAtBuilding(account, building.id).filter(
    (item) => item.workstream.batchId === batch.id,
  );
  const detail =
    projects.length > 1
      ? noun(projects.length, "project", "projects")
      : projects[0]
        ? solutionName(projects[0].workstream.solution)
        : "—";
  return (
    <Link
      href={hrefs.building(building.id, { from: "search" })}
      className={cn(
        "block rounded-sm px-4 py-2 outline-none hover:bg-black-2",
        focusRing,
      )}
    >
      <p className="h8 text-text-title">{building.name}</p>
      <p className="p7 text-text-secondary">
        {building.city} · {batch.name} · {detail}
      </p>
    </Link>
  );
}

function batchSolutions(account: Account, batch: Batch) {
  const seen = new Set<string>();
  const labels: string[] = [];
  for (const stream of wsIn(account, batch.id).filter(
    (item) => !item.proposed,
  )) {
    if (seen.has(stream.solution)) continue;
    seen.add(stream.solution);
    labels.push(solutionName(stream.solution));
  }
  return labels.join(", ");
}

function Batches({ account }: { account: Account }) {
  const hrefs = useHrefs();
  const batches = customerBatches(account);
  if (batches.length < 2) return null;
  return (
    <Card title="Batches" bodyClassName="p-0" className="h-full">
      <ul>
        {batches.map((batch, index) => {
          const facts = [
            nAssets(batch.buildingIds.length),
            batchSolutions(account, batch),
            batch.target ? `target ${batch.target}` : "",
          ].filter(Boolean);
          return (
            <li
              key={batch.id}
              className={index > 0 ? "border-t border-border-light" : ""}
            >
              <Link
                href={hrefs.batch(batch.id)}
                className={cn(
                  "flex items-center gap-3 rounded-sm px-6 py-3.5 outline-none hover:bg-black-2",
                  focusRing,
                )}
              >
                <span className="min-w-0 flex-1">
                  <span className="block h8 text-text-title">{batch.name}</span>
                  <span className="mt-0.5 block truncate p7 text-text-tertiary">
                    {batch.goal}
                  </span>
                  <span className="mt-0.5 block p7 text-text-secondary">
                    {facts.join(" · ")}
                  </span>
                </span>
                <Icon
                  name="chevron-right"
                  size={16}
                  className="shrink-0 text-text-tertiary"
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

export function MatureDashboard({ account }: { account: Account }) {
  const ops = (usePathname() ?? "").startsWith("/concept/ops");
  return (
    <div className="space-y-4">
      <FindBuilding account={account} />
      {!ops && <Decisions account={account} />}
      <Services account={account} />
      <div className="grid items-start gap-4 lg:grid-cols-2">
        <Momentum account={account} />
        <Batches account={account} />
      </div>
    </div>
  );
}
