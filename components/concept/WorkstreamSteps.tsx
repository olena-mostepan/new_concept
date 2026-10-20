import { cn } from '@/lib/utils'
import { stepMarks } from '@/lib/concept/derive'
import type { Workstream } from '@/lib/concept/model'

function Dot({ state }: { state: 'passed' | 'now' | 'upcoming' }) {
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

export function WorkstreamSteps({ w, notStarted }: { w: Workstream; notStarted: boolean }) {
  const marks = stepMarks(w, notStarted)
  return (
    <ol className="flex min-w-0 items-start overflow-x-auto">
      {marks.map((mark, i) => (
        <li key={mark.label} className="flex w-28 shrink-0 flex-col items-start">
          <div className="flex w-full items-center">
            <Dot state={mark.state} />
            <span className={cn('ml-2 h-px flex-1', i === marks.length - 1 ? 'bg-transparent' : 'bg-cq-border')} />
          </div>
          <p className={cn('mt-1.5 pr-2 text-left p7', mark.state === 'now' ? 'font-semibold text-cq-text' : 'text-cq-muted')}>{mark.label}</p>
          {mark.showCount && mark.count > 0 && (
            <p className={cn('mt-0.5 text-left p7', mark.state === 'now' ? 'font-normal text-cq-text' : 'text-cq-text-secondary')}>
              {mark.count} {mark.count === 1 ? 'project' : 'projects'}
            </p>
          )}
        </li>
      ))}
    </ol>
  )
}
