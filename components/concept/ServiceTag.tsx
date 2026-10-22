import { cn } from '@/lib/utils'
import { service as serviceDef, type ServiceId } from '@/lib/concept/model'

export function ServiceTag({ s, muted }: { s: ServiceId; muted?: boolean }) {
  return (
    <span className={cn('inline-flex h-6 w-fit shrink-0 items-center whitespace-nowrap rounded-full border border-border-dark bg-black-1 px-2.5 h9', muted ? 'text-text-tertiary' : 'text-text-secondary')}>
      {serviceDef(s).label}
    </span>
  )
}
