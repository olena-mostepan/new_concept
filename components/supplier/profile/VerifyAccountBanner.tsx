'use client'

export function VerifyAccountBanner({ onVerify }: { onVerify: () => void }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--cq-green)]/20 bg-[var(--cq-accent-muted)] px-4 py-3 sm:px-5">
      <p className="text-sm text-cq-text">
        Your account isn&apos;t verified yet. Confirm your company details to unlock full access
        to buyer briefs.
      </p>
      <button
        type="button"
        onClick={onVerify}
        className="btn-primary shrink-0"
      >
        Verify profile
      </button>
    </div>
  )
}
