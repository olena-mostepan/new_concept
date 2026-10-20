import { Check, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { WorkspaceResponsibility } from '@/lib/customer/workspace/mock-data'

export function WorkspaceStat({
  icon,
  value,
  label,
  iconTone = 'muted',
}: {
  icon: React.ReactNode
  value: number
  label: string
  iconTone?: 'muted' | 'success'
}) {
  return (
    <div className="rounded-xl border border-cq-border bg-white p-5 shadow-sm">
      <span
        className={cn(
          'flex h-8 w-8 items-center justify-center rounded-lg',
          iconTone === 'success'
            ? 'bg-[var(--cq-green)] text-white'
            : 'bg-cq-bg text-cq-text-secondary',
        )}
      >
        {iconTone === 'success' ? (
          <Check className="h-4 w-4" strokeWidth={2.5} aria-hidden />
        ) : (
          icon
        )}
      </span>
      <p className="mt-3 text-2xl font-semibold tabular-nums tracking-tight text-text-primary">
        {value}
      </p>
      <p className="mt-0.5 text-sm text-cq-text-secondary">{label}</p>
    </div>
  )
}

export function ResponsibilityPill({
  responsibility,
  label,
}: {
  responsibility: WorkspaceResponsibility
  label: string
}) {
  return (
    <span
      className={cn(
        'inline-flex w-fit shrink-0 rounded-full px-2.5 py-1 text-xs font-normal',
        responsibility === 'your_action'
          ? 'bg-[var(--cq-accent-muted)] text-[var(--cq-green)]'
          : 'bg-[var(--cq-link)]/10 text-[var(--cq-link)]',
      )}
    >
      {label}
    </span>
  )
}

export function ProjectName({
  name,
  href,
}: {
  name: string
  href?: string
}) {
  const icon = (
    <ExternalLink className="h-3.5 w-3.5 shrink-0 text-cq-muted" aria-hidden />
  )
  if (!href) {
    return (
      <span className="inline-flex items-center gap-1.5 font-normal text-cq-text">
        {name}
        {icon}
      </span>
    )
  }
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 font-normal text-cq-text hover:text-[var(--cq-green)]"
    >
      {name}
      <span className="sr-only">Open project</span>
      {icon}
    </Link>
  )
}

export function FilterSelect({
  id,
  label,
  value,
  onChange,
  options,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  options: string[]
}) {
  return (
    <label htmlFor={id} className="block min-w-[9.5rem]">
      <span className="mb-1 block text-xs text-cq-text-secondary">{label}</span>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full appearance-none rounded-lg border border-cq-border bg-white bg-[length:16px] bg-[right_0.6rem_center] bg-no-repeat py-2 pl-3 pr-8 text-sm font-normal text-cq-text focus:border-[var(--cq-green)] focus:outline-none focus:ring-1 focus:ring-[var(--cq-green)]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%234d5761' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
        }}
      >
        <option value="all">ALL</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  )
}
