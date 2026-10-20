'use client'

import { cn } from '@/lib/utils'
import type { ProfileNudgeItem } from '@/lib/supplier/profile/nudge-items'

const btnCoralOutline =
  'shrink-0 rounded-md border border-[var(--cq-green)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--cq-green)] hover:bg-[var(--cq-accent-muted)]'

const btnGreyOutline =
  'shrink-0 rounded-md border border-cq-border bg-white px-3 py-1.5 text-xs font-semibold text-cq-text hover:bg-cq-bg'

export function ProfileNudgeBlock({
  items,
  onNavigate,
}: {
  items: ProfileNudgeItem[]
  onNavigate: (href: string) => void
}) {
  if (items.length === 0) return null

  return (
    <section className="overflow-hidden rounded-lg border border-[var(--cq-green)]/20 bg-[var(--cq-accent-muted)]">
      <div className="flex items-center justify-between gap-2 px-4 py-2.5">
        <h3 className="tracking-[0.12em] text-[var(--cq-green)] s3 text-text-tertiary">
          Your profile needs attention
        </h3>
        <span className="inline-flex shrink-0 rounded-full border border-cq-border bg-cq-bg px-2 py-0.5 text-cq-text-secondary p7">
          {items.length} incomplete
        </span>
      </div>

      <ul>
        {items.map((item, index) => (
          <li
            key={item.id}
            className={cn(index > 0 && 'border-t border-white [border-top-width:0.5px]')}
          >
            <div className="flex items-center justify-between gap-3 px-4 py-2">
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    'p6',
                    item.priority === 'high'
                      ? 'font-semibold text-cq-text'
                      : 'font-normal text-cq-text-secondary',
                  )}
                >
                  {item.label}
                </p>
                {item.subtitle ? (
                  <p className="mt-0.5 text-cq-text-secondary p7">{item.subtitle}</p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => onNavigate(item.href)}
                className={item.priority === 'high' ? btnCoralOutline : btnGreyOutline}
              >
                {item.ctaLabel}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
