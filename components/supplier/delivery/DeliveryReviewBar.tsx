'use client'

export function DeliveryReviewBar({
  count,
  pickAny,
  onExit,
}: {
  count: number
  pickAny: boolean
  onExit: () => void
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[var(--cq-green)]/30 bg-[var(--cq-accent-muted)]/60 px-4 py-3">
      <p className="text-sm font-normal text-cq-text">
        {pickAny
          ? 'Everything looks confident — pick anything that\u2019s wrong.'
          : `Let\u2019s fix what\u2019s off — ${count} to check`}
      </p>
      <button
        type="button"
        className="btn-link text-sm"
        onClick={onExit}
      >
        {pickAny ? 'Done' : 'Exit review'}
      </button>
    </div>
  )
}
