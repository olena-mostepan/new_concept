'use client'

import { cn } from '@/lib/utils'
import type { ProfileField } from '@/lib/supplier/profile/types'

export function ProfileFieldRow({
  label,
  field,
  renderValue,
}: {
  label: string
  field: ProfileField<unknown>
  renderValue?: (value: unknown) => React.ReactNode
}) {
  const hasValue = Array.isArray(field.value)
    ? field.value.length > 0
    : field.value !== null && field.value !== undefined && String(field.value).trim() !== ''

  const display = hasValue
    ? renderValue
      ? renderValue(field.value)
      : Array.isArray(field.value)
        ? field.value.join(', ')
        : String(field.value)
    : '—'

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] items-center gap-4 border-b border-cq-border-light px-5 py-3.5 last:border-b-0">
      <span className="text-sm text-cq-text-secondary">{label}</span>
      <div className="flex items-center justify-end text-right">
        <span
          className={cn(
            'text-sm',
            hasValue ? 'font-semibold text-cq-text' : 'text-cq-muted',
            typeof display !== 'string' && 'font-normal',
          )}
        >
          {display}
        </span>
      </div>
    </div>
  )
}

export function ProfileSectionCard({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-cq-border bg-white shadow-sm">
      <h3 className="border-b border-cq-border bg-cq-bg px-5 py-3 tracking-[0.12em] text-cq-text-secondary s3">
        {title}
      </h3>
      <div>{children}</div>
    </section>
  )
}
