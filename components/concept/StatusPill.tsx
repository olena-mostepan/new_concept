import { cn } from '@/lib/utils'
import type { Owner } from '@/lib/concept/model'

const LABEL: Record<Owner, string> = {
  you: 'With you',
  cquel: 'With CQuel',
  suppliers: 'With suppliers',
  done: 'Done',
}

const STYLE: Record<Owner, string> = {
  you: 'border border-brand-2 bg-bg-accent text-brand-7',
  cquel: 'border border-border-dark bg-black-1 text-text-secondary',
  suppliers: 'border border-border-dark bg-black-1 text-text-secondary',
  done: 'bg-black-2 text-text-secondary',
}

export function StatusPill({ owner }: { owner: Owner }) {
  return (
    <span className={cn('inline-flex h-6 w-fit shrink-0 items-center whitespace-nowrap rounded-full px-2.5 h9', STYLE[owner])}>
      {LABEL[owner]}
    </span>
  )
}
