import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

/** Shared CQuel button system — primary, secondary, link. Radius is always rounded-lg. */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-[var(--cq-green)]/30 focus-visible:ring-offset-1",
  {
    variants: {
      variant: {
        default:
          'bg-[var(--cq-green)] text-white shadow-sm hover:bg-[var(--cq-green-hover)]',
        primary:
          'bg-[var(--cq-green)] text-white shadow-sm hover:bg-[var(--cq-green-hover)]',
        secondary:
          'border border-cq-border bg-white text-cq-text hover:bg-cq-bg',
        outline:
          'border border-cq-border bg-white text-cq-text hover:bg-cq-bg',
        ghost: 'text-cq-text-secondary hover:bg-cq-bg hover:text-cq-text',
        link: 'h-auto rounded-none p-0 text-cq-text-secondary underline underline-offset-2 hover:text-cq-text',
        destructive:
          'bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 px-3.5 py-2',
        lg: 'h-11 px-5',
        icon: 'size-10',
        'icon-sm': 'size-9',
        'icon-lg': 'size-11',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
