import { cn } from '@/lib/utils'

export function CourtBadge({
  label,
  variant = 'ops',
}: {
  label: string
  variant?: 'ops' | 'supplier'
}) {
  if (!label) return null

  if (variant === 'supplier') {
    return (
      <span
        className={cn(
          'inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold',
          label === 'Your Court'
            ? 'border border-[var(--cq-green)]/35 bg-[var(--cq-accent-muted)] text-cq-text'
            : 'border border-cq-border bg-cq-bg text-cq-text-secondary',
        )}
      >
        {label}
      </span>
    )
  }

  return (
    <span
      className={cn(
        'inline-flex shrink-0 rounded-md border border-cq-border px-2 py-0.5 text-xs font-semibold text-cq-text-secondary',
      )}
    >
      {label}
    </span>
  )
}
