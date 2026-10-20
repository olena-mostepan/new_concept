'use client'

import { cn } from '@/lib/utils'
import {
  confidenceReasonLabel,
  resolveStageConfidence,
} from '@/lib/supplier/delivery/stage-confidence'
import type { JobDeliveryStage } from '@/lib/supplier/delivery/job-types'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

const CHIP: Record<
  'confirmed' | 'likely' | 'estimated',
  { label: string; className: string }
> = {
  confirmed: {
    label: 'Confirmed',
    className: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  },
  likely: {
    label: 'Likely',
    className: 'border-sky-200 bg-sky-50 text-sky-800',
  },
  estimated: {
    label: 'Estimated',
    className: 'border-cq-border bg-cq-bg text-cq-text-secondary',
  },
}

export function StageConfidenceChip({
  stage,
  className,
}: {
  stage: JobDeliveryStage
  className?: string
}) {
  const { confidence, reason } = resolveStageConfidence(stage)
  const chip = CHIP[confidence]

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn(
              'inline-flex w-fit cursor-default rounded-full border px-2 py-0.5 capitalize p7',
              chip.className,
              className,
            )}
          >
            {chip.label}
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[16rem] text-xs">
          {confidenceReasonLabel(reason)}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
