import Link from 'next/link'
import { cn } from '@/lib/utils'
import { service, type Owner } from '@/lib/concept/model'
import { batchCells, batchOwner, batchSummary, type BatchCell } from '@/lib/concept/derive'
import type { Account } from '@/lib/concept/model'
import { Card } from './ui'
import { StatusPill } from './StatusPill'
import { hrefs } from './hrefs'

function Dot({ owner }: { owner: Owner }) {
  if (owner === 'done') return <span className="h-2.5 w-2.5 rounded-full bg-cq-text" aria-hidden />
  if (owner === 'you') return <span className="h-2.5 w-2.5 rounded-full border-2 border-cq-owner-you" aria-hidden />
  return <span className="h-2.5 w-2.5 rounded-full border border-cq-muted" aria-hidden />
}

function Cell({ cell }: { cell: BatchCell }) {
  const label = service(cell.service).label
  if (cell.kind === 'skip') {
    return (
      <div>
        <p className="text-xs text-cq-muted">{label}</p>
        <span className="mt-2 inline-block h-2.5 w-2.5 rounded-full border border-dashed border-cq-muted" aria-hidden />
        <p className="mt-1.5 text-xs text-cq-muted">Not needed</p>
      </div>
    )
  }
  if (cell.kind === 'planned') {
    return (
      <div>
        <p className="text-xs font-normal text-cq-text-secondary">{label}</p>
        <p className="mt-2 text-xs text-cq-text-secondary">Planned</p>
      </div>
    )
  }
  return (
    <div>
      <p className="text-xs font-normal text-cq-text">{label}</p>
      <div className="mt-2 flex h-2.5 items-center">
        {cell.owners.length > 4 ? (
          <span className="text-xs font-semibold tabular-nums text-cq-text">{cell.owners.length}</span>
        ) : (
          <span className="flex gap-1">
            {cell.owners.map((owner, i) => (
              <Dot key={`${owner}-${i}`} owner={owner} />
            ))}
          </span>
        )}
      </div>
      <div className="mt-1.5 space-y-0.5">
        {cell.lines.map((line) => (
          <p key={line} className="text-xs text-cq-text-secondary">
            {line}
          </p>
        ))}
      </div>
    </div>
  )
}

export function BatchesCard({ account }: { account: Account }) {
  const batches = account.batches.filter((b) => b.planState !== 'draft')
  return (
    <Card title="Batches" bodyClassName="p-0">
      <ul className="divide-y divide-cq-border-light">
        {batches.map((b) => {
          const summary = batchSummary(account, b)
          const owner = batchOwner(account, b)
          return (
            <li key={b.id} className="px-5 py-5">
              <div className="flex items-start gap-6">
                <Link href={hrefs.batch(b.id)} className="shrink-0 pt-0.5 font-semibold text-cq-text hover:text-cq-accent">
                  {b.name}
                </Link>
                <p className="min-w-0 flex-1 pt-0.5 text-right text-sm text-cq-text-secondary">{summary.line}</p>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <StatusPill owner={owner} />
                  <Link href={hrefs.batch(b.id)} className="btn-secondary-sm">
                    View batch
                  </Link>
                </div>
              </div>
              <div className={cn('mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5')}>
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
