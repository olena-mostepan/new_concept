'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { Account, Batch, Workstream } from '@/lib/concept/model'
import { activeProjects, doneCount, getBatch, isBatchDone, nextLine, short, wsIn, yourNeeds } from '@/lib/concept/derive'
import { Bar, OwnerPill, ServiceTag, td, th } from './ui'
import { hrefs } from './hrefs'

/** Light table of workstreams — scales to 30+ rows */
export function WorkstreamTable({ account, items, showBatch, hrefFor = hrefs.workstream }: { account: Account; items: Workstream[]; showBatch?: boolean; hrefFor?: (id: string) => string }) {
  return (
    <table className="w-full table-fixed">
      <thead className="border-b border-cq-border-light">
        <tr>
          <th className={cn(th, 'w-[30%]')}>Workstream</th>
          {showBatch && <th className={cn(th, 'w-[16%]')}>Batch</th>}
          <th className={cn(th, 'w-36')}>Progress</th>
          <th className={th}>Next</th>
          <th className={cn(th, 'w-36')}>With</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-cq-border-light">
        {items.map((w) => {
          const total = activeProjects(w).length
          const done = doneCount(w)
          const mine = yourNeeds(w).length
          return (
            <tr key={w.id} className="hover:bg-cq-bg/60">
              <td className={td}>
                <Link href={hrefFor(w.id)} className="font-normal hover:text-cq-accent">
                  {w.name}
                </Link>
                <div className="mt-1">
                  <ServiceTag s={w.service} />
                </div>
              </td>
              {showBatch && (
                <td className={cn(td, 'text-cq-text-secondary')}>
                  <Link href={hrefs.batch(w.batchId)} className="hover:text-cq-text">
                    {getBatch(account, w.batchId)?.name}
                  </Link>
                </td>
              )}
              <td className={td}>
                {w.proposed ? (
                  <span className="text-cq-text-secondary">{total} buildings</span>
                ) : (
                  <>
                    <span className="tabular-nums">
                      {done} of {total} done
                    </span>
                    <Bar done={done} total={total} className="mt-1.5" />
                  </>
                )}
              </td>
              <td className={cn(td, 'text-cq-text-secondary')}>
                {w.owner === 'done' ? `Done ${short(w.completedOn)}` : nextLine(w) || w.now}
                {mine > 0 && !w.proposed && <span className="ml-2 font-normal text-cq-owner-you">{mine} from you</span>}
              </td>
              <td className={td}>
                <OwnerPill owner={w.owner} />
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

/** Workstreams grouped under their batch; finished batches last */
export function GroupedByBatch({ account, items, batches }: { account: Account; items: Workstream[]; batches: Batch[] }) {
  const groups = batches
    .map((b) => ({ b, ws: items.filter((w) => w.batchId === b.id) }))
    .filter((g) => g.ws.length > 0)
    .sort((a, z) => Number(isBatchDone(account, a.b)) - Number(isBatchDone(account, z.b)))
  if (!groups.length) return <p className="text-sm text-cq-text-secondary">No workstreams here yet.</p>
  return (
    <div className="space-y-6">
      {groups.map(({ b, ws }) => (
        <section key={b.id} className="overflow-hidden rounded-xl border border-cq-border bg-white ">
          <header className="flex flex-wrap items-baseline justify-between gap-3 border-b border-cq-border-light px-5 py-4">
            <div>
              <Link href={hrefs.batch(b.id)} className="text-base font-semibold text-cq-text hover:text-cq-accent">
                {b.name}
              </Link>
              <p className="mt-0.5 text-sm text-cq-text-secondary">{b.goal}</p>
            </div>
            <span className="text-sm text-cq-text-secondary">
              {b.buildingIds.length} buildings · {wsIn(account, b.id).length} workstreams
              {b.target && ` · by ${b.target}`}
            </span>
          </header>
          <WorkstreamTable account={account} items={ws} />
        </section>
      ))}
    </div>
  )
}
