'use client'

import { cn } from '@/lib/utils'
import { short } from '@/lib/concept/derive'
import type { Batch, PlanState } from '@/lib/concept/model'

export function planText(batch: Pick<Batch, 'planState' | 'planProposed'>): string {
  if (batch.planState === 'proposed') return `Proposed ${short(batch.planProposed)}`
  if (batch.planState === 'agreed') return 'Agreed'
  if (batch.planState === 'live') return 'Live'
  return 'Draft'
}

/** Ops-only plan state. Black and white — no orange fill. */
export function PlanPill({ batch }: { batch: Pick<Batch, 'planState' | 'planProposed'> }) {
  const live = batch.planState === 'live'
  return (
    <span
      className={cn(
        'inline-flex w-fit whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-normal',
        live ? 'bg-cq-text text-white' : 'bg-white text-cq-text ring-1 ring-inset ring-cq-border',
      )}
    >
      {planText(batch)}
    </span>
  )
}

const PLAN_ORDER: PlanState[] = ['draft', 'proposed', 'agreed', 'live']

/** Small 4-dot track: draft → proposed → agreed → live. */
export function PlanSteps({ state }: { state: PlanState }) {
  const i = PLAN_ORDER.indexOf(state)
  return (
    <ol className="flex items-center gap-1.5" aria-label="Plan">
      {PLAN_ORDER.map((step, k) => (
        <li key={step} className={cn('h-1.5 w-1.5 rounded-full', k <= i ? 'bg-cq-text' : 'bg-cq-border')} />
      ))}
    </ol>
  )
}
