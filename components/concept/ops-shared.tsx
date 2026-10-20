import { Check } from 'lucide-react'
import { SERVICES, type ServiceId, type SolutionId } from '@/lib/concept/model'
import { cn } from '@/lib/utils'

export const SOLUTION_OPTIONS: Array<{ id: SolutionId; label: string }> = [
  { id: 'solar', label: 'Solar PV' },
  { id: 'ev', label: 'EV charging' },
  { id: 'ashp', label: 'Air source heat pump' },
  { id: 'led', label: 'LED' },
  { id: 'generic', label: 'Generic' },
]

export const solutionLabel = (id: SolutionId) => SOLUTION_OPTIONS.find((item) => item.id === id)?.label ?? id

export const SERVICE_LINES: Record<ServiceId, string> = {
  indicative: 'From CQuel data',
  scope: 'Surveys and checks',
  tender: 'Find and compare suppliers',
  pricing: 'Network or incumbent supplier',
  delivery: 'Kick-off to handover',
}

export const filledBtn = 'inline-flex h-10 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-cq-text px-4 text-sm font-semibold text-white disabled:pointer-events-none disabled:opacity-50'
export const fieldClass = 'w-full rounded-lg border border-cq-border bg-white px-3 py-2 text-sm text-cq-text focus:border-cq-text focus:outline-none focus:ring-1 focus:ring-cq-text'
export const labelClass = 'mb-1.5 block text-sm font-normal text-cq-text'

export function workstreamName(solution: SolutionId, serviceId: ServiceId, existing: Array<{ name: string; service: ServiceId }>) {
  const base = solutionLabel(solution)
  const serviceName = SERVICES.find((item) => item.id === serviceId)?.label ?? serviceId
  const clash = existing.some((item) => item.name === base && item.service === serviceId)
  return clash ? `${base} · ${serviceName}` : base
}

export function Stepper({ step }: { step: 1 | 2 }) {
  const items = [
    { n: 1 as const, title: 'Properties', text: 'Choose the buildings in the batch' },
    { n: 2 as const, title: 'Name and goal', text: 'Name the batch and set its goal' },
  ]
  return (
    <ol className="flex flex-col gap-4 sm:flex-row sm:items-start">
      {items.map((item, index) => {
        const done = step > item.n
        const current = step === item.n
        return (
          <li key={item.n} className="flex min-w-0 flex-1 items-start gap-3">
            {index === 1 && (
              <span className={cn('mt-3.5 hidden h-px w-10 shrink-0 sm:block', step > 1 ? 'bg-cq-text' : 'bg-cq-border')} aria-hidden />
            )}
            <span
              className={cn(
                'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                done && 'bg-cq-text text-white',
                current && 'border-2 border-cq-text bg-white text-cq-text',
                !done && !current && 'border border-cq-border bg-white text-cq-muted',
              )}
            >
              {done ? <Check className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden /> : item.n}
            </span>
            <div className="min-w-0">
              <p className={cn('text-sm font-semibold', current || done ? 'text-cq-text' : 'text-cq-muted')}>{item.title}</p>
              <p className="text-sm text-cq-text-secondary">{item.text}</p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
