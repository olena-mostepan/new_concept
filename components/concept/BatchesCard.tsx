import Link from 'next/link'
import { OWNER_LABEL, service } from '@/lib/concept/model'
import { batchCells, batchSummary, type BatchCell } from '@/lib/concept/derive'
import type { Account } from '@/lib/concept/model'
import { Card } from './ui'
import { hrefs } from './hrefs'

/** Empty segments use #E5E7EB. --black-2 (#f3f4f6) disappears on white. */
const SEGMENT_EMPTY = '#E5E7EB'

function Bar({ done, total }: { done: number; total: number }) {
  return (
    <div className="mt-2 flex gap-[3px]">
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className="h-1 flex-1 rounded-full"
          style={{ backgroundColor: i < done ? 'var(--black-6)' : SEGMENT_EMPTY }}
        />
      ))}
    </div>
  )
}

function Cell({ cell }: { cell: BatchCell }) {
  const label = service(cell.service).label
  if (cell.kind === 'skip') {
    return (
      <div>
        <p className="l1 text-text-tertiary">{label}</p>
        <div className="mt-2 h-1 rounded-full border border-dashed border-black-3" />
        <p className="mt-1.5 p7 text-text-tertiary">Not needed</p>
      </div>
    )
  }
  if (cell.kind === 'planned') {
    return (
      <div>
        <p className="l1 text-text-title">{label}</p>
        <div className="mt-2 h-1 rounded-full" style={{ backgroundColor: SEGMENT_EMPTY }} />
        <p className="mt-1.5 p7 text-text-tertiary">Planned</p>
      </div>
    )
  }
  return (
    <div>
      <p className="l1 text-text-title">{label}</p>
      <Bar done={cell.done} total={cell.total} />
      <p className="mt-1.5 p7 text-text-tertiary">
        {cell.done} of {cell.total} done
      </p>
      {cell.you > 0 && (
        <p className="mt-0.5 flex items-center gap-1.5 p7 text-text-secondary">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-6" aria-hidden />
          {OWNER_LABEL.you}: {cell.you}
        </p>
      )}
    </div>
  )
}

export function BatchesCard({ account }: { account: Account }) {
  const batches = account.batches.filter((b) => b.planState !== 'draft')
  return (
    <Card title="Batches" titleClassName="h7 text-text-primary" bodyClassName="p-0">
      <ul className="divide-y divide-border-light">
        {batches.map((b) => {
          const summary = batchSummary(account, b)
          return (
            <li key={b.id} className="px-6 py-5">
              <div className="flex items-start justify-between gap-6">
                <div className="min-w-0">
                  <Link href={hrefs.batch(b.id)} className="h7 text-text-primary">
                    {b.name}
                  </Link>
                  <p className="mt-1 p7 text-text-secondary">{summary.line}</p>
                </div>
                <Link
                  href={hrefs.batch(b.id)}
                  className="h8 shrink-0 text-text-primary underline underline-offset-[3px] decoration-border-dark"
                >
                  View batch
                </Link>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-5">
                {batchCells(account, b).map((cell) => (
                  <Cell key={cell.service} cell={cell} />
                ))}
              </div>
            </li>
          )
        })}
      </ul>
    </Card>
  )
}
