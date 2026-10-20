import { cn } from '@/lib/utils'
import type { ButtonHTMLAttributes } from 'react'

const TYPE = {
  primary: 'bg-brand-6 text-white hover:bg-brand-7 active:bg-brand-8',
  secondary: 'border border-border-dark bg-bg-container text-text-primary hover:bg-black-1',
  tertiary: 'text-text-primary hover:bg-black-1',
  link: 'h-auto rounded-none px-0 text-text-primary underline underline-offset-2',
  danger: 'border border-status-danger-border bg-bg-container text-status-danger-text',
} as const

const SIZE = {
  large: 'h-10 rounded-lg px-4 text-sm',
  default: 'h-8 rounded-lg px-3 text-sm',
  small: 'h-6 rounded px-2 p7',
} as const

export function Button({
  type = 'primary',
  size = 'default',
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  type?: keyof typeof TYPE
  size?: keyof typeof SIZE
}) {
  return (
    <button
      className={cn(
        'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap font-semibold outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-6 disabled:bg-black-2 disabled:text-black-4',
        TYPE[type],
        type !== 'link' && SIZE[size],
        className,
      )}
      {...props}
    />
  )
}
