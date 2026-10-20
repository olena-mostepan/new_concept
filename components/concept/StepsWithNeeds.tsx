import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { StepColumn } from '@/lib/concept/derive'

function Dot({ state }: { state: StepColumn['state'] }) {
  if (state === 'passed') return <span className="h-3 w-3 rounded-full bg-cq-text" aria-hidden />
  if (state === 'now') {
    return (
      <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-cq-text" aria-hidden>
        <span className="h-1.5 w-1.5 rounded-full bg-cq-text" />
      </span>
    )
  }
  return <span className="h-3 w-3 rounded-full border border-cq-muted bg-white" aria-hidden />
}

function Mark({ mark }: { mark: 'tick' | 'you' | 'other' }) {
  if (mark === 'tick') return <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cq-muted" strokeWidth={2.5} aria-hidden />
  if (mark === 'you') return <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-cq-owner-you" aria-hidden />
  return <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full border border-cq-muted" aria-hidden />
}

export function StepsWithNeeds({ columns }: { columns: StepColumn[] }) {
  return (
    <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}>
      {columns.map((col, i) => (
        <div key={col.label} className="min-w-0">
          <div className="flex items-center">
            <span className={cn('h-px flex-1', i === 0 ? 'bg-transparent' : 'bg-cq-border')} />
            <Dot state={col.state} />
            <span className={cn('h-px flex-1', i === columns.length - 1 ? 'bg-transparent' : 'bg-cq-border')} />
          </div>
          <p className={cn('mt-3 text-sm', col.state === 'now' ? 'font-semibold text-cq-text' : 'font-normal text-cq-text')}>{col.label}</p>
          <p className="mt-0.5 text-sm text-cq-text-secondary">{col.countLabel ?? `${col.count} ${col.count === 1 ? 'project' : 'projects'}`}</p>
          <p className="mt-2 text-sm text-cq-text-secondary">{col.happens}</p>
          {col.panel && (
            <div className="relative mt-1 pt-4">
              <span className={cn('absolute left-1/2 top-0 h-4 w-px -translate-x-1/2', col.panel.tone === 'dashed' ? 'border-l border-dashed border-cq-muted bg-transparent' : col.panel.tone === 'solid' ? 'bg-cq-text' : 'bg-cq-border')} aria-hidden />
              <span className={cn('absolute left-1/2 top-0 h-1.5 w-1.5 -translate-x-1/2 rounded-full', col.panel.tone === 'solid' ? 'bg-cq-text' : 'bg-cq-muted')} aria-hidden />
              <div
                className={cn(
                  'rounded-lg border p-3',
                  col.panel.tone === 'solid' && 'border-cq-text bg-white',
                  col.panel.tone === 'dashed' && 'border-dashed border-cq-border bg-white',
                  col.panel.tone === 'muted' && 'border-cq-border bg-cq-bg text-cq-text-secondary',
                )}
              >
                <p className="text-cq-text-secondary s3">{col.panel.heading}</p>
                <ul className="mt-2 space-y-2">
                  {col.panel.items.map((item) => (
                    <li key={item.text}>
                      <div className="flex gap-2">
                        <Mark mark={item.mark} />
                        <p className={cn('text-sm', item.mark === 'you' ? 'font-semibold text-cq-text' : col.panel?.tone === 'muted' ? 'text-cq-muted' : 'text-cq-text')}>{item.text}</p>
                      </div>
                      {item.action === 'email' && (
                        <a className="btn-link mt-2" href="mailto:">
                          Reply by email
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
