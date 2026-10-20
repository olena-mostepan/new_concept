import { cn } from '@/lib/utils'
import { OWNER_LABEL, type Owner } from '@/lib/concept/model'

const STYLE: Record<Owner, string> = {
  you: 'bg-[var(--cq-accent-muted)] text-[var(--cq-accent)]',
  cquel: 'border border-[var(--cq-owner-cquel-border)] bg-[var(--cq-owner-cquel-bg)] text-cq-owner-cquel',
  suppliers: 'bg-[var(--cq-link)]/10 text-[var(--cq-link)]',
  done: 'bg-cq-bg text-cq-text-secondary',
}

/** Same pill as the customer workspace: soft fill, no ring. */
export function StatusPill({ owner }: { owner: Owner }) {
  return (
    <span className={cn('inline-flex w-fit shrink-0 items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-normal', STYLE[owner])}>
      {OWNER_LABEL[owner]}
    </span>
  )
}
