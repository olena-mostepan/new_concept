import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

const TYPE = {
  neutral: 'border-border-dark bg-black-1 text-text-secondary',
  accent: 'border-brand-2 bg-bg-accent text-brand-7',
  strong: 'border-black-7 bg-black-7 text-white',
  info: 'border-status-info-border bg-status-info-bg text-status-info-text',
  success: 'border-status-success-border bg-status-success-bg text-status-success-text',
  warning: 'border-status-warning-border bg-status-warning-bg text-status-warning-text',
  danger: 'border-status-danger-border bg-status-danger-bg text-status-danger-text',
} as const

export function Tag({
  type = 'neutral',
  size = 'small',
  dot = false,
  children,
}: {
  type?: keyof typeof TYPE
  size?: 'small' | 'big'
  dot?: boolean
  children: ReactNode
}) {
  const showDot = dot || type === 'info' || type === 'success' || type === 'warning' || type === 'danger'
  return (
    <span
      className={cn(
        'inline-flex w-fit items-center gap-1.5 rounded-full border whitespace-nowrap',
        size === 'big' ? 'h-8 px-3 text-sm font-semibold' : 'h-6 px-2.5 h9',
        TYPE[type],
      )}
    >
      {showDot && <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />}
      {children}
    </span>
  )
}
