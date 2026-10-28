import { noun, short, type StepColumn } from '@/lib/concept/derive'
import { cn } from '@/lib/utils'
import { Card } from './ui'

type Look = 'now' | 'passed' | 'upcoming'

/** A passed step with a current step still behind it was skipped, so it stays empty. */
function looks(columns: StepColumn[]): Look[] {
  return columns.map((column, index) => {
    if (column.state === 'now') return 'now'
    const earlierNow = columns.slice(0, index).some((item) => item.state === 'now')
    if (column.state === 'passed' && !earlierNow) return 'passed'
    return 'upcoming'
  })
}

function lineFor(column: StepColumn, look: Look): string {
  if (look === 'now') return noun(column.count, 'project', 'projects')
  if (look === 'passed' && column.doneOn) return `Done ${short(column.doneOn)}`
  return '—'
}

export function SimpleSteps({ title, columns, right }: { title: string; columns: StepColumn[]; right: string }) {
  const states = looks(columns)
  const n = Math.max(columns.length, 1)
  return (
    <Card title={title} right={right} bodyClassName="px-6 py-5">
      <div className="relative">
        {columns.length > 1 && (
          <div
            className="absolute top-[6px] h-0.5 bg-black-2"
            style={{ left: `${50 / n}%`, right: `${50 / n}%` }}
            aria-hidden
          />
        )}
        <div className="relative grid" style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}>
          {columns.map((column, index) => {
            const look = states[index]
            return (
              <div key={column.label} className="flex flex-col items-center text-center">
                <div className="relative z-10 flex h-3.5 items-center justify-center">
                  <span
                    className={cn(
                      'rounded-full',
                      look === 'now' && 'h-3.5 w-3.5 bg-black-7 ring-4 ring-black-2',
                      look === 'passed' && 'h-2.5 w-2.5 bg-black-6',
                      look === 'upcoming' && 'h-2.5 w-2.5 border-2 border-border-dark bg-white',
                    )}
                  />
                </div>
                <p
                  className={cn(
                    'mt-2.5',
                    look === 'now' && 'l1-strong text-text-primary',
                    look === 'passed' && 'l1 text-text-title',
                    look === 'upcoming' && 'l1 text-text-tertiary',
                  )}
                >
                  {column.label}
                </p>
                <p
                  className={cn(
                    'p7',
                    look === 'now' && 'text-text-primary',
                    look === 'passed' && 'text-text-tertiary',
                    look === 'upcoming' && 'text-black-4',
                  )}
                >
                  {lineFor(column, look)}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </Card>
  )
}
