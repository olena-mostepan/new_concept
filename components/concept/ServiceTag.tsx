import { service as serviceDef, type ServiceId } from '@/lib/concept/model'

export function ServiceTag({ s }: { s: ServiceId }) {
  return (
    <span className="inline-flex w-fit shrink-0 whitespace-nowrap rounded-md bg-cq-bg px-1.5 py-0.5 text-cq-text-secondary s3">
      {serviceDef(s).label}
    </span>
  )
}
