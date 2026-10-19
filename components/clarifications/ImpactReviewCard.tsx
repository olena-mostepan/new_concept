import type { Clarification } from '@/lib/clarifications/types'

export function ImpactReviewCard({
  impact,
  supplierAnswerName,
}: {
  impact: NonNullable<Clarification['impact']>
  supplierAnswerName?: string
}) {
  return (
    <div className="rounded-xl border border-cq-border bg-white p-4">
      <h3 className="mb-4 text-base font-bold text-cq-text">Impact review</h3>
      <div className="overflow-hidden rounded-lg border border-cq-border">
        <div className="grid grid-cols-[minmax(0,7rem)_1fr] divide-y divide-cq-border md:grid-cols-[10rem_1fr]">
          <div className="bg-cq-bg/80 px-3 py-2 text-xs font-semibold text-cq-text-secondary">
            Context
          </div>
          <div className="px-3 py-2 text-sm font-medium text-cq-text">{impact.fieldLabel}</div>

          <div className="bg-cq-bg/80 px-3 py-2 text-xs font-semibold text-cq-text-secondary">
            Current value
          </div>
          <div className="flex flex-wrap items-baseline gap-x-2 px-3 py-2 text-sm text-cq-text">
            <span className="font-semibold tabular-nums">{impact.currentValue}</span>
            {impact.currentNote ? (
              <span className="text-cq-text-secondary">{impact.currentNote}</span>
            ) : null}
          </div>

          <div className="bg-cq-bg/80 px-3 py-2 text-xs font-semibold text-cq-text-secondary">
            Proposed value
          </div>
          <div className="flex flex-col gap-0.5 px-3 py-2">
            <span className="text-sm font-semibold tabular-nums text-cq-text">
              {impact.proposedValue}
            </span>
            {impact.proposedNote ? (
              <span className="text-sm text-cq-text-secondary">{impact.proposedNote}</span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2 text-sm md:flex-row md:items-start md:justify-between md:gap-6">
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-cq-text">Accepting will also:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-cq-text-secondary">
            <li>
              Record this answer as <code className="text-cq-text">final_answer</code> on the{' '}
              <span className="font-medium text-cq-text">{impact.fieldLabel}</span> field,
              with source attribution
            </li>
            <li>Regenerate the tender comparison view for this project</li>
            <li>
              Notify{' '}
              <span className="font-medium text-cq-text">
                {supplierAnswerName ?? 'the supplier'} that their answer was accepted
              </span>
            </li>
            <li>
              Add to audit trail: value · source · trust · who accepted · when
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
