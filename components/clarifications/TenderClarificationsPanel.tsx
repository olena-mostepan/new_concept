'use client'

import type { ClarificationsProjectSlug } from '@/lib/clarifications/mock-data'
import { clarificationsForTenderSlug } from '@/lib/clarifications/mock-data'
import {
  groupClarificationsByDispatch,
  partitionDispatchGroups,
  type DispatchGroup,
} from '@/lib/clarifications/dispatch-groups'
import { DispatchClarificationRow } from '@/components/clarifications/DispatchClarificationRow'
import { useClarifications } from '@/lib/clarifications/store'

export function TenderClarificationsPanel({
  projectSlug,
}: {
  projectSlug: ClarificationsProjectSlug
}) {
  const { items } = useClarifications()
  const tenderItems = clarificationsForTenderSlug(items, projectSlug)
  const groups = groupClarificationsByDispatch(tenderItems)
  const { needs_attention, in_progress, done } = partitionDispatchGroups(
    groups,
    'ops',
  )

  if (groups.length === 0) {
    return (
      <div className="rounded-xl border border-cq-border bg-white p-8 text-center shadow-sm">
        <p className="text-base font-bold text-cq-text">No clarifications for this tender</p>
        <p className="mt-2 text-sm text-cq-text-secondary">
          Raise a question from a supplier row using the help icon, or use Start new project in the
          header.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <TenderClarificationsSection title="Needs Attention" groups={needs_attention} />
      <TenderClarificationsSection title="In Progress" groups={in_progress} />
      <TenderClarificationsSection title="Done" groups={done} />
    </div>
  )
}

function TenderClarificationsSection({
  title,
  groups,
}: {
  title: string
  groups: DispatchGroup[]
}) {
  if (groups.length === 0) return null

  return (
    <section>
      <h3 className="mb-3 text-sm font-extrabold text-cq-text">
        {title} ({groups.length})
      </h3>
      <div className="overflow-hidden rounded-xl border border-cq-border bg-white shadow-sm">
        <div className="divide-y divide-cq-border px-4 sm:px-5">
          {groups.map((group) => (
            <DispatchClarificationRow
              key={group.dispatchId}
              group={group}
              perspective="ops"
            />
          ))}
        </div>
      </div>
    </section>
  )
}
