'use client'

import Link from 'next/link'
import { DispatchClarificationRow } from '@/components/clarifications/DispatchClarificationRow'
import { DEMO_SUPPLIER_ID } from '@/lib/clarifications/mock-data'
import {
  groupClarificationsByDispatch,
  partitionDispatchGroups,
  type DispatchGroup,
} from '@/lib/clarifications/dispatch-groups'
import {
  isVisibleToDemoSupplier,
  type Perspective,
} from '@/lib/clarifications/perspective'
import { useClarifications } from '@/lib/clarifications/store'

/** Groups clarifications into three buckets using derived sections only (never `c.section`). */
export function ClarificationsDashboard({ perspective }: { perspective: Perspective }) {
  const { items } = useClarifications()

  const visible =
    perspective === 'supplier'
      ? items.filter((c) => isVisibleToDemoSupplier(c, DEMO_SUPPLIER_ID))
      : items

  if (visible.length === 0) {
    return (
      <div className="mx-auto w-full max-w-screen-2xl px-6 pb-20 pt-4 sm:px-8 lg:px-10">
        <div className="rounded-xl border border-cq-border bg-white p-8 text-center shadow-sm">
          <p className="text-base font-bold text-cq-text">No clarifications in this view</p>
          <p className="mt-2 text-sm text-cq-text-secondary">
            {perspective === 'supplier' ? (
              <>
                The demo supplier is <span className="font-semibold text-cq-text">Tom · Evo Energy</span>.
                Use the top bar switcher to open the ops workspace, or go to{' '}
                <Link className="font-semibold text-cq-link underline" href="/supplier-comparison">
                  Solar comparison
                </Link>{' '}
                and raise a clarification to suppliers including Evo Energy.
              </>
            ) : (
              <>
                Raise a question from{' '}
                <Link className="font-semibold text-cq-link underline" href="/supplier-comparison">
                  supplier comparison
                </Link>{' '}
                or use <span className="font-semibold text-cq-text">Start new project</span> in the header.
              </>
            )}
          </p>
        </div>
      </div>
    )
  }

  const groups = groupClarificationsByDispatch(visible)
  const { needs_attention, in_progress, done } = partitionDispatchGroups(
    groups,
    perspective,
  )

  return (
    <div className="mx-auto w-full max-w-screen-2xl space-y-10 px-6 pb-20 sm:px-8 lg:px-10">
      <DispatchDashboardSection
        title="Needs Attention"
        groups={needs_attention}
        perspective={perspective}
      />
      <DispatchDashboardSection
        title="In Progress"
        groups={in_progress}
        perspective={perspective}
      />
      <DispatchDashboardSection title="Done" groups={done} perspective={perspective} />
    </div>
  )
}

function DispatchDashboardSection({
  title,
  groups,
  perspective,
}: {
  title: string
  groups: DispatchGroup[]
  perspective: Perspective
}) {
  if (groups.length === 0) return null

  return (
    <section>
      <h2 className="mb-4 text-base font-extrabold text-cq-text">
        {title} ({groups.length})
      </h2>
      <div className="overflow-hidden rounded-xl border border-cq-border bg-white shadow-sm">
        <div className="divide-y divide-cq-border px-4 sm:px-5">
          {groups.map((group) => (
            <DispatchClarificationRow
              key={group.dispatchId}
              group={group}
              perspective={perspective}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
