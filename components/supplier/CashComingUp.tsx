import Link from 'next/link'
import { sectionTitleClass } from '@/lib/ui/headings'
import { formatGbp } from '@/lib/supplier/delivery/mock-data'
import {
  JOB_DELIVERY_BY_ID,
  jobToDeliveryClaim,
} from '@/lib/supplier/delivery/job-mock-data'
import { formatShortDate } from '@/lib/supplier/delivery/dates'

const CASH_JOB_IDS = [
  'claim-solar-hohe',
  'claim-ashp-midsummer',
  'claim-led-navale',
] as const

export function CashComingUp() {
  const rows = CASH_JOB_IDS.map((id) => {
    const job = JOB_DELIVERY_BY_ID[id]
    const claim = jobToDeliveryClaim(job)
    const overdue = job.confirmStatus === 'stuck'
    return {
      id,
      jobId: id,
      project: `${job.solution} – ${job.property}`,
      amount: formatGbp(claim.amount),
      detail: `${job.currentStage.replace(/^T(\d+)\s*/, 'T$1 · ')} · ${formatShortDate(claim.projectedDate)}`,
      overdue,
    }
  })

  return (
    <section className="overflow-hidden rounded-xl border border-cq-border bg-white ">
      <header className="border-b border-cq-border px-5 py-4 sm:px-6">
        <h2 className={sectionTitleClass}>Cash coming up</h2>
      </header>

      <ul className="divide-y divide-cq-border">
        {rows.map((row) => {
          const href = `/supplier/jobs/${row.jobId}`
          return (
            <li
              key={row.id}
              className="flex flex-col gap-3 px-5 py-4 transition-colors hover:bg-cq-bg/80 sm:flex-row sm:items-center sm:justify-between sm:px-6"
            >
              <div className="min-w-0">
                <Link
                  href={href}
                  className="text-sm font-semibold text-cq-text hover:text-[var(--cq-green)] hover:underline"
                >
                  {row.project}
                </Link>
                <p className="mt-0.5 text-sm text-cq-text-secondary">
                  {row.detail}
                  {row.overdue ? (
                    <>
                      {' '}
                      <span className="font-normal text-[var(--cq-green)]">
                        overdue
                      </span>
                    </>
                  ) : null}
                </p>
              </div>
              <p className="shrink-0 text-sm font-semibold text-text-primary sm:text-right">
                {row.amount}
              </p>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
