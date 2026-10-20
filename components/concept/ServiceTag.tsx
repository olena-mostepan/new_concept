import { service as serviceDef, type ServiceId } from '@/lib/concept/model'

export function ServiceTag({ s }: { s: ServiceId }) {
  return (
    <span className="inline-flex h-6 w-fit shrink-0 items-center whitespace-nowrap rounded-full border border-border-dark bg-black-1 px-2.5 h9 text-text-secondary">
      {serviceDef(s).label}
    </span>
  )
}
