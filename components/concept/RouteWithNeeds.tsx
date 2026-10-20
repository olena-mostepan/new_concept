'use client'

import Link from 'next/link'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Workstream } from '@/lib/concept/model'
import { byRecentChange, type PanelItem, type RoutePanel, type RouteStage } from '@/lib/concept/derive'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { hrefs } from './hrefs'
import { StatusPill } from './StatusPill'

function Bar({ state }: { state: RouteStage['state'] }) {
  if (state === 'done') return <div className="h-1.5 rounded-full bg-black-3" />
  if (state === 'now') return <div className="h-1.5 rounded-full bg-black-7" />
  if (state === 'skip') return <div className="h-1.5 rounded-full border border-dashed border-black-3" />
  return <div className="h-1.5 rounded-full bg-black-2" />
}

function Mark({ tone }: { tone: PanelItem['tone'] }) {
  if (tone === 'done') return <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cq-muted" strokeWidth={2.5} aria-hidden />
  if (tone === 'you') return <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-cq-owner-you" aria-hidden />
  return <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full border border-cq-muted" aria-hidden />
}

function Caption({ stage, workstreams }: { stage: RouteStage; workstreams: Workstream[] }) {
  const className = cn('mt-1 p7 text-text-tertiary')
  const mine = workstreams.filter((w) => w.service === stage.id && !w.proposed)
  const items = [...byRecentChange(mine.filter((w) => w.owner !== 'done')), ...mine.filter((w) => w.owner === 'done')]
  if (!stage.caption.includes('workstream') || !items.length) return <p className={className}>{stage.caption}</p>
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button type="button" className={cn(className, 'inline-flex cursor-pointer items-center gap-1 hover:text-text-primary')}>
          {stage.caption}
          <ChevronDown className="h-3 w-3" aria-hidden />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 border-border-dark bg-bg-container p-1.5 text-text-primary shadow-floating">
        <ul>
          {items.map((w) => (
            <li key={w.id}>
              <Link href={hrefs.workstream(w.id)} className="group flex items-center justify-between gap-3 rounded-md px-2 py-1.5 hover:bg-cq-bg">
                <span className="p6 group-hover:text-text-primary">{w.name}</span>
                <StatusPill owner={w.owner} />
              </Link>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  )
}

function StageFoot({
  panel,
  later,
  onAgree,
  onEstimates,
}: {
  panel?: RoutePanel
  later: { label: string; why?: string }[]
  onAgree?: () => void
  onEstimates?: () => void
}) {
  if (!panel && !later.length) return null
  return (
    <div className="border-t border-cq-border-light pt-4">
      {panel && (
        <ul className="space-y-3">
          {panel.items.map((item) => (
            <li key={item.text} className="flex gap-2">
              <Mark tone={item.tone} />
              <div className="min-w-0">
                <p className={cn('text-sm leading-5', item.tone === 'done' ? 'text-cq-text-secondary' : 'text-cq-text')}>{item.text}</p>
                {item.sub && <p className="mt-0.5 text-sm leading-5 text-cq-text-secondary">{item.sub}</p>}
                {item.action === 'agree' && (
                  <button type="button" className="btn-primary mt-3" onClick={onAgree}>
                    Agree plan
                  </button>
                )}
                {item.action === 'estimates' && (
                  <button type="button" className="btn-primary mt-3" onClick={onEstimates}>
                    See estimates
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
      {panel?.email && (
        <a className="btn-link mt-4" href="mailto:">
          {panel.email}
        </a>
      )}
      {later.length > 0 && (
        <div className={cn(panel ? 'mt-4' : undefined)}>
          <p className="text-xs text-cq-text-secondary">Later</p>
          <ul className="mt-2 space-y-3">
            {later.map((item) => (
              <li key={item.label} className="flex gap-2">
                <Mark tone="other" />
                <div className="min-w-0">
                  <p className="text-sm leading-5 text-cq-text-secondary">{item.label}</p>
                  {item.why && <p className="mt-0.5 text-sm leading-5 text-cq-muted">{item.why}</p>}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export function RouteWithNeeds({
  stages,
  panels,
  later = [],
  workstreams = [],
  onAgree,
  onEstimates,
}: {
  stages: RouteStage[]
  panels: RoutePanel[]
  /** Signalled for a later stage, not asked yet. */
  later?: { stage: string; label: string; why?: string }[]
  workstreams?: Workstream[]
  onAgree?: () => void
  onEstimates?: () => void
}) {
  const showFoot = panels.length > 0 || later.length > 0
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[880px]">
        <div className="grid grid-cols-6 gap-x-3">
          {stages.map((stage) => (
            <div key={stage.id}>
              <Bar state={stage.state} />
              <p className={cn('mt-2', stage.state === 'now' ? 'l1-strong text-text-primary' : 'l1 text-text-secondary', stage.state === 'skip' && 'text-text-tertiary')}>{stage.label}</p>
              <Caption stage={stage} workstreams={workstreams} />
              {showFoot && (
                <div className="mt-4">
                  <StageFoot
                    panel={panels.find((p) => p.stageId === stage.id)}
                    later={later.filter((item) => item.stage === stage.id)}
                    onAgree={onAgree}
                    onEstimates={onEstimates}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
