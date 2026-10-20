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
                        'flex h-7 w-7 items-center justify-center rounded-full border outline-none p7',
                        phase.status === 'done' && 'border-black-2 bg-black-2 text-black-5',
                        phase.status === 'current' && 'border-black-7 bg-bg-container text-text-primary shadow-[var(--halo-current)]',
                        phase.status === 'upcoming' && 'border-black-2 bg-bg-container text-text-tertiary',
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
                    className="border border-cq-border bg-white px-2.5 py-1.5 text-xs font-normal text-cq-text shadow-sm"
                  >
                    {phase.label}
                  </TooltipContent>
                </Tooltip>
                {phase.status === 'current' ? (
                  <span className="absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap h9 text-brand-7">
                    {phase.overdue ? 'overdue' : 'confirm ›'}
                  </span>
                ) : null}
              </div>
              {!isLast ? (
                <div
                  className={cn(
                    'mx-1 h-0.5 w-5 sm:w-7',
                    phase.status === 'done' ? 'bg-black-3' : 'bg-black-2',
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
