'use client'

import * as React from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ClaimStage } from '@/lib/supplier/delivery/types'

function formatShortDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00`)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

function shortStageLabel(name: string): string {
  return name.replace(/^T\d+\s*/, '')
}

/**
 * Read-only greyscale stage timeline.
 * Stage names + dates under each node.
 */
export function ClaimStageDiagram({
  stages,
  currentStage,
  onStageClick,
}: {
  stages: ClaimStage[]
  currentStage: string
  onStageClick?: (stageName: string) => void
}) {
  const [hovered, setHovered] = React.useState<number | null>(null)
  const currentIdx = Math.max(
    0,
    stages.findIndex((s) => s.name === currentStage),
  )

  return (
    <div
      className="flex w-full max-w-xl items-start justify-center"
      aria-label="Delivery stages — click a stage to change its date"
    >
      {stages.map((stage, i) => {
        const isLast = i === stages.length - 1
        const done = stage.done || i < currentIdx
        const current = i === currentIdx && !stage.done
        const upcoming = i > currentIdx && !stage.done
        const active = hovered === i

        return (
          <div
            key={`${stage.name}-${i}`}
            className="flex min-w-0 flex-1 items-start"
          >
            <button
              type="button"
              className="flex w-full min-w-[5.5rem] flex-col items-center px-0.5 outline-none sm:min-w-[6.5rem]"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => onStageClick?.(stage.name)}
              aria-label={`Change date for ${stage.name}${stage.projectedDate ? ` (${formatShortDate(stage.projectedDate)})` : ''}`}
            >
              <span
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-full border text-xs transition-colors sm:h-10 sm:w-10 sm:text-sm',
                  'focus-visible:ring-2 focus-visible:ring-[var(--cq-green)] focus-visible:ring-offset-1',
                  !active &&
                    done &&
                    'border-neutral-400 bg-neutral-400 text-white',
                  !active &&
                    current &&
                    'border-neutral-500 bg-white text-neutral-600',
                  !active &&
                    upcoming &&
                    'border-neutral-200 bg-neutral-50 text-neutral-400',
                  active &&
                    'border-[var(--cq-green)] bg-[var(--cq-green)] text-white',
                )}
              >
                {done ? (
                  <Check className="h-4 w-4" aria-hidden />
                ) : (
                  <span className="font-semibold">{i + 1}</span>
                )}
              </span>
              <span
                className={cn(
                  'mt-1.5 w-full text-center text-[11px] font-medium leading-snug sm:text-xs',
                  'line-clamp-2',
                  active ? 'text-[var(--cq-green)]' : 'text-cq-text-secondary',
                )}
              >
                {shortStageLabel(stage.name)}
              </span>
              <span
                className={cn(
                  'mt-0.5 w-full text-center text-[10px] tabular-nums leading-tight sm:text-[11px]',
                  active ? 'text-[var(--cq-green)]' : 'text-cq-text-secondary',
                )}
              >
                {stage.projectedDate
                  ? formatShortDate(stage.projectedDate)
                  : '—'}
              </span>
            </button>
            {!isLast ? (
              <div
                className={cn(
                  'mt-[1.1rem] h-0.5 w-4 shrink-0 transition-colors sm:mt-[1.2rem] sm:w-6',
                  active || hovered === i + 1
                    ? 'bg-[var(--cq-green)]/40'
                    : done
                      ? 'bg-neutral-400'
                      : 'bg-neutral-200',
                )}
                aria-hidden
              />
            ) : null}
          </div>
        )
      })}
    </div>
  )
}
