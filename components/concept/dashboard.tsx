'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { getBatch, noun, servicePipeline, type ServiceCount } from '@/lib/concept/derive'
import { OWNER_LABEL, SERVICE_LABEL, type Account } from '@/lib/concept/model'
import { Card, CardLink } from './ui'
import { hrefs } from './hrefs'

const SHADES = [0.16, 0.3, 0.44, 0.58, 0.74, 1]
const header = { titleClassName: 'h7 text-text-primary', headerClassName: 'px-6 py-3' }

function ServiceSegment({
  segment,
  shade,
  first,
  last,
}: {
  segment: ServiceCount
  shade: number
  first: boolean
  last: boolean
}) {
  const [open, setOpen] = useState(false)
  const dark = shade >= 0.58
  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false)
      }}
    >
      <Link
        href={hrefs.service(segment.id)}
        aria-label={`${segment.label}, ${segment.projects} projects`}
        className={`flex h-10 items-center justify-center text-sm font-semibold tabular-nums outline-none ${first ? 'rounded-l-full' : ''} ${last ? 'rounded-r-full' : ''}`}
        style={{
          backgroundColor: open ? 'var(--cq-accent)' : `color-mix(in srgb, var(--cq-text) ${Math.round(shade * 100)}%, white)`,
          color: open || dark ? 'white' : 'var(--cq-text)',
        }}
      >
        {segment.projects}
      </Link>
      {open && (
        <div className="absolute bottom-full left-1/2 z-10 w-[280px] -translate-x-1/2 pb-2">
          <div className="rounded-lg border border-border-dark bg-white px-4 py-3 shadow-[0_8px_24px_rgba(30,40,50,.12)]">
            <div className="flex items-center justify-between gap-3">
              <p className="h8 min-w-0 text-text-primary">{segment.label}</p>
              <Link href={hrefs.service(segment.id)} className="h8 shrink-0 text-text-primary underline underline-offset-[3px] decoration-border-dark">
                View
              </Link>
            </div>
            <p className="mt-0.5 p7 text-text-secondary">{SERVICE_LABEL[segment.id]}</p>
            <div className="mt-2 border-t border-border-light pt-2">
              {segment.byBatch.map((batch) => (
                <p key={batch.batchId} className="flex items-baseline justify-between gap-3 py-0.5">
                  <span className="min-w-0 p6 text-text-secondary">{batch.name}</span>
                  <span className="shrink-0 p6 tabular-nums text-text-primary">{batch.projects} projects</span>
                </p>
              ))}
            </div>
            {segment.you > 0 && (
              <p className="mt-2 flex items-center gap-1.5 border-t border-border-light pt-2 p6 text-text-primary">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-6" aria-hidden />
                {OWNER_LABEL.you}: {noun(segment.you, 'workstream', 'workstreams')}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function Services({ account }: { account: Account }) {
  const pipe = servicePipeline(account)
  const services = pipe.services.filter((segment) => segment.projects > 0)
  const showCompleted = pipe.completed.projects > 0
  const columns = [
    ...services.map((segment) => `minmax(7.5rem, ${segment.projects}fr)`),
    ...(showCompleted ? [`minmax(7.5rem, ${pipe.completed.projects}fr)`] : []),
  ].join(' ')
  const last = services.length + (showCompleted ? 1 : 0) - 1
  return (
    <Card
      title="Services"
      right={<span className="p7 text-text-secondary">{`${pipe.total} projects in progress across ${pipe.batches} ${pipe.batches === 1 ? 'batch' : 'batches'}`}</span>}
      bodyClassName="p-0"
      className="relative z-10 overflow-visible"
      {...header}
    >
      <div className="grid gap-y-2 px-6 py-5" style={{ gridTemplateColumns: columns }}>
        {services.map((segment) => (
          <p key={segment.id} className="whitespace-nowrap text-center h8 text-text-primary">
            {segment.label}
          </p>
        ))}
        {showCompleted && <p className="whitespace-nowrap text-center h8 text-text-primary">Completed</p>}
        {services.map((segment, i) => (
          <ServiceSegment key={segment.id} segment={segment} shade={SHADES[Math.min(i, SHADES.length - 2)]} first={i === 0} last={i === last} />
        ))}
        {showCompleted && (
          <div
            className={`flex h-10 items-center justify-center text-sm font-semibold tabular-nums text-white ${services.length === 0 ? 'rounded-l-full' : ''} rounded-r-full`}
            style={{ backgroundColor: 'var(--cq-text)' }}
          >
            {pipe.completed.projects}
          </div>
        )}
        {services.map((segment) => (
          <p key={`${segment.id}-sub`} className="text-center p7 text-text-tertiary">
            {noun(segment.workstreams, 'workstream', 'workstreams')}
          </p>
        ))}
        {showCompleted && <p className="text-center p7 text-text-tertiary">{pipe.completed.solutions.join(' · ')}</p>}
      </div>
      {pipe.you > 0 && (
        <div className="flex items-center justify-between border-t border-border-light px-6 py-3">
          <p className="flex items-center gap-2 p6 text-text-primary">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-6" aria-hidden />
            {OWNER_LABEL.you}: {noun(pipe.you, 'workstream', 'workstreams')}
          </p>
          <Link href={hrefs.batches} className="h8 text-text-primary underline underline-offset-[3px] decoration-border-dark">
            See batches
          </Link>
        </div>
      )}
    </Card>
  )
}

function Activity({ account }: { account: Account }) {
  return (
    <Card title="Recent activity" right={<CardLink href={hrefs.batches}>See all</CardLink>} bodyClassName="px-6 py-1" className="h-full" {...header}>
      <ul>
        {account.activity.slice(0, 5).map((item, index) => {
          const batch = item.batchId ? getBatch(account, item.batchId)?.name : undefined
          return (
            <li key={`${item.date}-${item.title}`} className={`flex justify-between gap-4 py-3 ${index > 0 ? 'border-t border-border-light' : ''}`}>
              <div className="min-w-0">
                <p className="h8 text-text-title">{item.title}</p>
                <p className="p7 text-text-secondary">{item.text}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="whitespace-nowrap p7 text-text-tertiary">{item.date}</p>
                {batch && batch !== item.title && <p className="whitespace-nowrap p7 text-text-tertiary">{batch}</p>}
              </div>
            </li>
          )
        })}
      </ul>
    </Card>
  )
}

function Momentum({ account }: { account: Account }) {
  if (!account.momentum) return null
  return (
    <Card title="Momentum" right="Services started and finished" className="h-full" {...header}>
      <div className="mb-3 flex gap-5 text-xs text-cq-text-secondary">
        <span className="inline-flex items-center gap-1.5">
          <svg width="18" height="4" aria-hidden>
            <line x1="0" y1="2" x2="18" y2="2" stroke="var(--cq-text)" strokeWidth="2" />
          </svg>
          Started
        </span>
        <span className="inline-flex items-center gap-1.5">
          <svg width="18" height="4" aria-hidden>
            <line x1="0" y1="2" x2="18" y2="2" stroke="var(--cq-text)" strokeWidth="2" strokeDasharray="4 3" />
          </svg>
          Finished
        </span>
      </div>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={account.momentum} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
            <CartesianGrid stroke="var(--cq-border-light)" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--cq-muted)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: 'var(--cq-muted)' }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: 'var(--cq-border)' }} />
            <Line type="monotone" dataKey="started" name="Started" stroke="var(--cq-text)" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="finished" name="Finished" stroke="var(--cq-text)" strokeWidth={2} strokeDasharray="4 3" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}

export function MatureDashboard({ account }: { account: Account }) {
  return (
    <div className="space-y-4">
      <Services account={account} />
      <div className="grid gap-4 lg:grid-cols-2">
        <Momentum account={account} />
        <Activity account={account} />
      </div>
    </div>
  )
}
