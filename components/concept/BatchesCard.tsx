import Link from 'next/link'
import { service } from '@/lib/concept/model'
import { batchCells, batchSummary, noun, type BatchCell } from '@/lib/concept/derive'
import type { Account } from '@/lib/concept/model'
import { Card } from './ui'
import { hrefs } from './hrefs'

function Cell({ cell }: { cell: BatchCell }) {
  const label = service(cell.service).label
  if (cell.kind === 'skip') {
    return (
      <div>
        <p className="l1 text-text-tertiary">{label}</p>
        <p className="mt-1.5 p7 text-text-tertiary">Not needed</p>
      </div>
    )
  }
  if (cell.kind === 'planned') {
    return (
      <div>
        <p className="l1 text-text-title">{label}</p>
        <p className="mt-1.5 p7 text-text-tertiary">Planned</p>
      </div>
    )
  }
  if (cell.kind === 'done') {
    return (
      <div>
        <p className="l1 text-text-title">{label}</p>
        <p className="mt-1.5 p7 text-text-tertiary">Done</p>
      </div>
    )
  }
  return (
    <div>
      <p className="l1 text-text-title">{label}</p>
      <p className="mt-1.5 h8 tabular-nums text-text-primary">{cell.projects} projects</p>
      <p className="p7 text-text-tertiary">{noun(cell.workstreams, 'workstream', 'workstreams')}</p>
      {cell.completed > 0 && <p className="p7 text-text-tertiary">{cell.completed} completed</p>}
    </div>
  )
}

export function BatchesCard({ account }: { account: Account }) {
  const batches = account.batches.filter((b) => b.planState !== 'draft')
  return (
    <Card title="Batches" titleClassName="h7 text-text-primary" headerClassName="px-6 py-3" bodyClassName="p-0">
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
                  <p className="mt-1 p7 text-text-secondary">{summary.detail}</p>
                </div>
                <Link
                  href={hrefs.batch(b.id)}
                  className="h8 shrink-0 text-text-primary underline underline-offset-[3px] decoration-border-dark"
                >
                  View batch
                </Link>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
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
