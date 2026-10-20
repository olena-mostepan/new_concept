import type { ReactNode } from 'react'
import Link from 'next/link'
import { buildingProgress, byRecentChange, nextParts, rightNow } from '@/lib/concept/derive'
import type { Account, Workstream } from '@/lib/concept/model'
import { Card, CardLink, Bar, ChangedMark, groupTitle, sectionTitle, td } from './ui'
import { ServiceTag } from './ServiceTag'
import { StatusPill } from './StatusPill'
import { hrefs } from './hrefs'

function LiveRow({ account, w, waiting }: { account: Account; w: Workstream; waiting?: boolean }) {
  const batch = account.batches.find((b) => b.id === w.batchId)
  const { done, total } = buildingProgress(w)
  const parts = nextParts(w)
  return (
    <tr className="border-t border-cq-border-light">
      <td className={td} style={{ paddingLeft: 36 }}>
        <Link href={hrefs.workstream(w.id)} className="font-semibold text-cq-text hover:text-cq-accent">
          <ChangedMark w={w}>{w.name}</ChangedMark>
        </Link>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <ServiceTag s={w.service} />
          {batch && <span className="text-sm text-cq-muted">{batch.name}</span>}
        </div>
      </td>
      <td className={td}>
        <p className={waiting ? 'font-semibold text-cq-text' : 'text-cq-text'}>{parts.main}</p>
        {parts.detail && <p className="mt-0.5 text-cq-text-secondary">{parts.detail}</p>}
      </td>
      <td className={`${td} w-36`}>
        <p className="tabular-nums text-cq-text-secondary">
          {done} of {total}
        </p>
        <Bar done={done} total={total} className="mt-1.5 w-24" />
      </td>
      <td className={td}>
        <StatusPill owner={w.owner} />
      </td>
    </tr>
  )
}

function DoneRow({ account, w }: { account: Account; w: Workstream }) {
  const batch = account.batches.find((b) => b.id === w.batchId)
  return (
    <tr className="border-t border-cq-border-light">
      <td className={td} style={{ paddingLeft: 36 }}>
        <Link href={hrefs.workstream(w.id)} className="font-normal text-cq-text hover:text-cq-accent">
          {w.name}
        </Link>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <ServiceTag s={w.service} />
          {batch && <span className="text-sm text-cq-muted">{batch.name}</span>}
        </div>
      </td>
      <td className={td} colSpan={2}>
        <span className="text-cq-text-secondary">Done {w.completedOn?.split(' ').slice(0, 2).join(' ')}</span>
      </td>
      <td className={td}>
        <StatusPill owner="done" />
      </td>
    </tr>
  )
}

export function RightNow({ account }: { account: Account }) {
  const groups = rightNow(account)
  const foldDone = groups.done.length > 5
  return (
    <Card title="Right now" titleClassName={sectionTitle} right={<CardLink href={hrefs.workstreams()}>All workstreams</CardLink>} bodyClassName="p-0">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px]">
          <tbody>
            <Group label={`Waiting on you · ${groups.you.length}`}>
              {byRecentChange(groups.you).map((w) => (
                <LiveRow key={w.id} account={account} w={w} waiting />
              ))}
            </Group>
            <Group label={`In progress · ${groups.progress.length}`}>
              {byRecentChange(groups.progress).map((w) => (
                <LiveRow key={w.id} account={account} w={w} />
              ))}
            </Group>
            <Group label={foldDone ? undefined : `Done · ${groups.done.length}`}>
              {foldDone ? (
                <tr className="border-t border-cq-border-light">
                  <td colSpan={4} className="py-3 pl-9 pr-5">
                    <div className="flex items-center justify-between gap-4 text-sm text-cq-text-secondary">
                      <span>{groups.done.length} workstreams done</span>
                      <CardLink href={hrefs.workstreams()}>See all</CardLink>
                    </div>
                  </td>
                </tr>
              ) : (
                groups.done.map((w) => <DoneRow key={w.id} account={account} w={w} />)
              )}
            </Group>
          </tbody>
        </table>
      </div>
    </Card>
  )
}

function Group({ label, children }: { label?: string; children: ReactNode }) {
  return (
    <>
      {label && (
        <tr>
          <td colSpan={4} className="bg-cq-bg py-3 pl-9 pr-5">
            <h3 className={groupTitle}>{label}</h3>
          </td>
        </tr>
      )}
      {children}
    </>
  )
}
