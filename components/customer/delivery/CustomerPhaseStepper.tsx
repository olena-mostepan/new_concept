'use client'

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CustomerPhaseNode } from '@/lib/customer/delivery/types'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export function CustomerPhaseStepperCompact({
  phases,
}: {
  phases: CustomerPhaseNode[]
}) {
  return (
    <TooltipProvider delayDuration={100}>
      <div className="flex min-w-[300px] items-center py-4 pb-6">
        {phases.map((phase, i) => {
          const isLast = i === phases.length - 1
          return (
            <div key={phase.id} className="flex items-center">
              <div className="relative flex h-8 w-8 items-center justify-center">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className={cn(
                        'flex h-7 w-7 items-center justify-center rounded-full border text-[11px] outline-none',
                        phase.status === 'done' &&
                          'border-[var(--cq-green)] bg-[var(--cq-green)] text-white',
                        phase.status === 'current' &&
                          'border-[var(--cq-green)] bg-white text-[var(--cq-green)]',
                        phase.status === 'upcoming' &&
                          'border-cq-border bg-white text-cq-text-secondary',
                      )}
                      aria-label={phase.label}
                    >
                      {phase.status === 'done' ? (
                        <Check className="h-3.5 w-3.5" aria-hidden />
                      ) : (
                        <span className="font-semibold">{i + 1}</span>
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    sideOffset={6}
                    className="border border-cq-border bg-white px-2.5 py-1.5 text-xs font-medium text-cq-text shadow-sm"
                  >
                    {phase.label}
                  </TooltipContent>
                </Tooltip>
                {phase.status === 'current' ? (
                  <span className="absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap text-[10px] font-medium text-[var(--cq-green)]">
                    {phase.overdue ? 'overdue' : 'confirm ›'}
                  </span>
                ) : null}
              </div>
              {!isLast ? (
                <div
                  className={cn(
                    'mx-1 h-0.5 w-5 sm:w-7',
                    phase.status === 'done'
                      ? 'bg-[var(--cq-green)]'
                      : 'bg-cq-border',
                  )}
                />
              ) : null}
            </div>
          )
        })}
      </div>
    </TooltipProvider>
  )
}
