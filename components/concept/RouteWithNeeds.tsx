'use client'

import { useState, type ReactNode } from 'react'
import Link from 'next/link'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { OWNER_LABEL, SERVICE_LABEL, type ServiceId, type Workstream } from '@/lib/concept/model'
import { activeProjects, byCompleted, byRecentChange, noun, short, type PanelItem, type RoutePanel, type RouteStage } from '@/lib/concept/derive'
import { hrefs } from './hrefs'

function Bar({ state, pilot, hot }: { state: RouteStage['state']; pilot?: boolean; hot?: boolean }) {
  if (hot) return <div className="h-1.5 rounded-full bg-brand-6" />
  if (state === 'done') return <div className="h-1.5 rounded-full bg-black-3" />
  if (state === 'now') return <div className="h-1.5 rounded-full bg-black-7" />
  if (state === 'skip') return <div className={cn('h-1.5 rounded-full border border-dashed', pilot ? 'border-border-dark' : 'border-black-3')} />
  return <div className="h-1.5 rounded-full bg-black-2" />
}

function Mark({ tone }: { tone: PanelItem['tone'] }) {
  if (tone === 'done') return <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cq-muted" strokeWidth={2.5} aria-hidden />
  if (tone === 'you') return <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-cq-owner-you" aria-hidden />
  return <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full border border-cq-muted" aria-hidden />
}

function stageSets(stage: RouteStage, workstreams: Workstream[]) {
  const mine = workstreams.filter((w) => w.service === stage.id && !w.proposed)
  const live = byRecentChange(mine.filter((w) => w.owner !== 'done'))
  const done = byCompleted(mine.filter((w) => w.owner === 'done'))
  return {
    live,
    done,
    you: live.filter((w) => w.owner === 'you').length,
    canOpen: (stage.state === 'now' || stage.state === 'done') && mine.length > 0,
  }
}

function StagePanel({ stage, live, done, you }: { stage: RouteStage; live: Workstream[]; done: Workstream[]; you: number }) {
  return (
    <div className="rounded-lg border border-border-dark bg-white px-4 py-3 shadow-[0_8px_24px_rgba(30,40,50,.12)]">
      <div className="flex items-center justify-between gap-3">
        <p className="h8 min-w-0 text-text-primary">{stage.label}</p>
        <Link href={hrefs.service(stage.id as ServiceId)} className="h8 shrink-0 text-text-primary underline underline-offset-[3px] decoration-border-dark">
          View
        </Link>
      </div>
      <p className="mt-0.5 p7 text-text-secondary">{SERVICE_LABEL[stage.id as ServiceId]}</p>
      {live.length > 0 && (
        <div className="mt-2 border-t border-border-light pt-2">
          {live.map((w) => (
            <Link key={w.id} href={hrefs.workstream(w.id)} className="flex justify-between gap-3 py-1.5 p7">
              <span className="min-w-0 text-text-primary">{w.name}</span>
              <span className="shrink-0 tabular-nums text-text-primary">{noun(activeProjects(w).length, 'project', 'projects')}</span>
            </Link>
          ))}
        </div>
      )}
      {done.length > 0 && (
        <div className="mt-2 border-t border-border-light pt-2">
          {done.map((w) => (
            <Link key={w.id} href={hrefs.workstream(w.id)} className="flex items-center justify-between gap-3 py-1.5 p7">
              <span className="min-w-0 text-text-tertiary">{w.name}</span>
              <span className="flex shrink-0 items-center gap-1.5 text-text-tertiary">
                <Check className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                Done {short(w.completedOn)}
              </span>
            </Link>
          ))}
        </div>
      )}
      {you > 0 && (
        <p className="mt-2 flex items-center gap-1.5 border-t border-border-light pt-2 p6 text-text-primary">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-6" aria-hidden />
          {OWNER_LABEL.you}: {noun(you, 'workstream', 'workstreams')}
        </p>
      )}
    </div>
  )
}

function RouteColumn({
  stage,
  workstreams,
  pilot,
  alignEnd,
  nameClass,
  note,
  foot,
}: {
  stage: RouteStage
  workstreams: Workstream[]
  pilot?: boolean
  alignEnd?: boolean
  nameClass: string
  note?: { text: string; muted?: boolean }
  foot?: ReactNode
}) {
  const sets = stageSets(stage, workstreams)
  const [open, setOpen] = useState(false)
  const hot = !pilot && sets.canOpen && open
  const captionClass = 'mt-1 p7 text-text-tertiary'
  return (
    <div
      className="relative"
      onMouseEnter={() => sets.canOpen && !pilot && setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocusCapture={() => sets.canOpen && !pilot && setOpen(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false)
      }}
    >
      <Bar state={stage.state} pilot={pilot} hot={hot} />
      <p className={cn(pilot ? 'mt-2.5' : 'mt-2', nameClass)}>{stage.label}</p>
      {pilot || !sets.canOpen ? (
        <p className={pilot ? 'mt-0.5 p7 text-text-tertiary' : captionClass}>{stage.caption}</p>
      ) : (
        <button type="button" className={cn(captionClass, 'inline-flex cursor-pointer items-center gap-1 hover:text-text-primary')}>
          {stage.caption}
          <ChevronDown className="h-3 w-3" aria-hidden />
        </button>
      )}
      {!pilot && stage.sub && <p className="mt-0.5 p7 text-text-tertiary">{stage.sub}</p>}
      {note && <p className={cn('mt-1.5 p7', note.muted ? 'text-text-tertiary' : 'text-text-secondary')}>{note.text}</p>}
      {foot}
      {hot && (
        <div className={cn('absolute bottom-full z-20 w-[300px] pb-2', alignEnd ? 'right-0' : 'left-0')}>
          <StagePanel stage={stage} live={sets.live} done={sets.done} you={sets.you} />
        </div>
      )}
    </div>
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
  pilot = false,
  notes,
}: {
  stages: RouteStage[]
  panels: RoutePanel[]
  /** Signalled for a later stage, not asked yet. */
  later?: { stage: string; label: string; why?: string }[]
  workstreams?: Workstream[]
  onAgree?: () => void
  onEstimates?: () => void
  /** Pilot dashboard: labels under each stage, no needs lists. */
  pilot?: boolean
  notes?: Record<string, { text: string; muted?: boolean }>
}) {
  const showFoot = !pilot && (panels.length > 0 || later.length > 0)
  const nameTone = (stage: RouteStage) => {
    if (stage.state === 'now') return 'l1-strong text-text-primary'
    if (stage.state === 'skip') return 'l1 text-text-tertiary'
    return pilot ? 'l1 text-text-title' : 'l1 text-text-secondary'
  }
  return (
    <div className={pilot ? 'overflow-x-auto' : undefined}>
      <div className="min-w-[880px]">
        <div className={cn('grid grid-cols-6', pilot ? 'gap-4' : 'gap-x-3')}>
          {stages.map((stage, index) => (
            <RouteColumn
              key={stage.id}
              stage={stage}
              workstreams={workstreams}
              pilot={pilot}
              alignEnd={index >= stages.length - 2}
              nameClass={nameTone(stage)}
              note={notes?.[stage.id]}
              foot={
                <>
                  {pilot && stage.id === 'start' && onAgree && (
                    <button type="button" className="btn-primary-sm mt-3" onClick={onAgree}>
                      Agree plan
                    </button>
                  )}
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
                </>
              }
            />
          ))}
        </div>
      </div>
    </div>
  )
}
