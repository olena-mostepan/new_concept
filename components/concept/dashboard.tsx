'use client'

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { activeProjects, days, lastChangedOn, pipeline, rightNow } from '@/lib/concept/derive'
import { OWNER_LABEL, type Account, type Workstream } from '@/lib/concept/model'
import { Card, CardLink, sectionTitle } from './ui'
import { BatchesCard } from './BatchesCard'
import { RightNow } from './RightNow'
import { hrefs } from './hrefs'

const SHADES = [0.16, 0.3, 0.44, 0.58, 0.74, 1]

function Pipeline({ account }: { account: Account }) {
  const { segments, total, batches } = pipeline(account)
  const columns = segments.map((segment) => `minmax(7.5rem, ${segment.n}fr)`).join(' ')
  return (
    <Card title="Pipeline" titleClassName={sectionTitle} right={`${total} workstreams across ${batches} ${batches === 1 ? 'batch' : 'batches'}`}>
      <div className="overflow-x-auto">
        <div className="grid min-w-[720px] gap-y-2" style={{ gridTemplateColumns: columns }}>
          {segments.map((segment) => (
            <p key={segment.id} className="truncate text-center h7 text-text-primary">
              {segment.label}
            </p>
          ))}
          {segments.map((segment, i) => {
            const shade = SHADES[Math.min(i, SHADES.length - 1)]
            const dark = shade >= 0.58
            return (
              <div
                key={segment.id}
                className={`flex h-10 items-center justify-center text-sm font-semibold tabular-nums ${i === 0 ? 'rounded-l-full' : ''} ${i === segments.length - 1 ? 'rounded-r-full' : ''}`}
                style={{
                  backgroundColor: `color-mix(in srgb, var(--cq-text) ${Math.round(shade * 100)}%, white)`,
                  color: dark ? 'white' : 'var(--cq-text)',
                }}
              >
                {segment.n}
              </div>
            )
          })}
        </div>
      </div>
    </Card>
  )
}

function waitedDays(w: Workstream): number {
  const n = w.next
  if (n && 'since' in n && n.since) return days(n.since)
  if (n?.kind === 'offers') return days(n.chased)
  if (n?.kind === 'shortlist') return days(n.on)
  if (n?.kind === 'design') return days(n.on)
  if (n?.kind === 'overdue') return days(n.due)
  const on = lastChangedOn(w)
  return on ? days(on) : 0
}

function waitingLabel(w: Workstream): string {
  const n = w.next
  const count = activeProjects(w).length
  if (!n || n.kind === 'landing') return `${w.name} · building data`
  if (n.kind === 'roof') return `Roof drawings · ${count} buildings`
  if (n.kind === 'gas') return `Gas bills · ${count} buildings`
  if (n.kind === 'carpark') return `Car park ownership · ${count} buildings`
  if (n.kind === 'offers') return `${w.name} · ${n.in} offers`
  if (n.kind === 'decision') return `${w.name} · estimates`
  if (n.kind === 'agree') return `${w.name} · scope`
  if (n.kind === 'price' || n.kind === 'agreePrice') return `${w.name} · price`
  if (n.kind === 'sign') return `${w.name} · contract`
  if (n.kind === 'brief') return `${w.name} · brief`
  if (n.kind === 'choose') return `${w.name} · supplier`
  if (n.kind === 'shortlist') return `${w.name} · shortlist`
  if (n.kind === 'writing') return `${w.name} · surveys`
  if (n.kind === 'design') return `${w.name} · design`
  if (n.kind === 'overdue') return `${n.place} · overdue`
  return w.name
}

function Waiting({ account }: { account: Account }) {
  const live = rightNow(account)
  const rows = (['you', 'cquel', 'suppliers'] as const)
    .map((owner) => {
      const list = owner === 'you' ? live.you : live.progress.filter((w) => w.owner === owner)
      return list.map((w) => ({ w, days: waitedDays(w) })).sort((a, b) => b.days - a.days)[0]
    })
    .filter((row): row is { w: Workstream; days: number } => Boolean(row))
    .sort((a, b) => b.days - a.days)
  const counts = [
    { owner: 'you' as const, n: live.you.length },
    { owner: 'cquel' as const, n: live.progress.filter((w) => w.owner === 'cquel').length },
    { owner: 'suppliers' as const, n: live.progress.filter((w) => w.owner === 'suppliers').length },
  ]
  return (
    <Card title="Who it's waiting on" titleClassName={sectionTitle} bodyClassName="p-0" className="h-full">
      <div className="grid grid-cols-3 gap-4 px-5 py-5">
        {counts.map((item) => (
          <div key={item.owner}>
            <p className="tabular-nums text-text-primary h4">{item.n}</p>
            <p className="mt-1.5 text-sm text-cq-text-secondary">{OWNER_LABEL[item.owner]}</p>
          </div>
        ))}
      </div>
      <ul className="border-t border-cq-border-light px-5">
        {rows.map(({ w, days: waited }) => (
          <li key={w.id} className="flex items-center gap-6 border-t border-cq-border-light py-4 first:border-t-0">
            <span className="min-w-0 flex-1 truncate text-sm text-cq-text">{waitingLabel(w)}</span>
            <span className="w-32 shrink-0 text-sm text-cq-text-secondary">{OWNER_LABEL[w.owner]}</span>
            <span className="w-16 shrink-0 text-right text-sm font-semibold tabular-nums text-cq-text">
              {waited} {waited === 1 ? 'day' : 'days'}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  )
}

function Activity({ account }: { account: Account }) {
  return (
    <Card title="Recent activity" titleClassName={sectionTitle} right={<CardLink href={hrefs.workstreams()}>See all</CardLink>} className="h-full">
      <ul className="space-y-6">
        {account.activity.slice(0, 4).map((item) => (
          <li key={`${item.date}-${item.title}`} className="flex justify-between gap-4">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-cq-text">{item.title}</p>
              <p className="truncate text-sm text-cq-text-secondary">{item.text}</p>
            </div>
            <span className="shrink-0 text-xs text-cq-muted">{item.date}</span>
          </li>
        ))}
      </ul>
    </Card>
  )
}

function Momentum({ account }: { account: Account }) {
  if (!account.momentum) return null
  return (
    <Card title="Momentum" titleClassName={sectionTitle} right="Workstreams started and finished">
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
    <div className="space-y-6">
      <Pipeline account={account} />
      <Momentum account={account} />
      <BatchesCard account={account} />
      <div className="grid items-stretch gap-6 lg:grid-cols-2">
        <Waiting account={account} />
        <Activity account={account} />
      </div>
      <RightNow account={account} />
    </div>
  )
}
