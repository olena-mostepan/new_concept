'use client'

import * as React from 'react'
import { ArrowUp, ChevronDown, ChevronUp } from 'lucide-react'
import type { ProfileScore } from '@/lib/supplier/profile/types'
import { scoreLabel } from '@/lib/supplier/profile/scoring'

const INSIGHTS = [
  {
    id: 'shortlist',
    text: 'Complete profiles get shortlisted ',
    stat: '32% more often',
  },
] as const

export function ProfileCompletenessSidebar({
  score,
  pendingChangeCount,
  scoreDelta,
  accountVerified,
  onAction,
}: {
  score: ProfileScore
  pendingChangeCount: number
  scoreDelta?: number
  accountVerified: boolean
  onAction: () => void
}) {
  const [detailsOpen, setDetailsOpen] = React.useState(true)
  const { label, subtitle } = scoreLabel(score.overall)
  const showDelta = scoreDelta != null && scoreDelta > 0

  const hasPendingChanges = pendingChangeCount > 0

  return (
    <aside className="flex h-fit flex-col lg:sticky lg:top-24">
      <div className="rounded-xl border border-cq-border bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold text-cq-text-secondary">
          Profile completeness score
        </p>

        <div className="mt-4 flex items-start gap-4">
          <div
            className="relative flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-full"
            style={{
              background: `conic-gradient(var(--cq-green) ${score.overall * 3.6}deg, var(--cq-border-light) 0deg)`,
            }}
          >
            <div className="flex h-[60px] w-[60px] items-center justify-center rounded-full bg-white">
              <span className="text-lg font-extrabold text-cq-text">{score.overall}%</span>
            </div>
          </div>
          <div className="min-w-0 pt-1">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <p className="text-2xl font-extrabold leading-tight text-cq-text">{label}</p>
              {showDelta && (
                <span className="inline-flex items-center gap-0.5 text-xs font-extrabold text-[var(--cq-green)]">
                  <ArrowUp className="h-3 w-3 stroke-[2.5]" aria-hidden />
                  {scoreDelta} pts
                </span>
              )}
            </div>
            <p className="mt-2 text-sm leading-relaxed text-cq-text-secondary">{subtitle}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setDetailsOpen((o) => !o)}
          className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-cq-text-secondary hover:text-cq-text"
        >
          {detailsOpen ? 'Hide details' : 'Show details'}
          {detailsOpen ? (
            <ChevronUp className="h-4 w-4" aria-hidden />
          ) : (
            <ChevronDown className="h-4 w-4" aria-hidden />
          )}
        </button>

        {detailsOpen && (
          <div className="mt-4 space-y-4 border-t border-cq-border-light pt-4">
            {score.sections.map((section) => (
              <div key={section.section}>
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <span className="text-sm text-cq-text-secondary">{section.label}</span>
                  <span className="text-sm font-extrabold text-cq-text">{section.percent}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-cq-border-light">
                  <div
                    className="h-full rounded-full bg-cq-text transition-all duration-500"
                    style={{ width: `${section.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-5 rounded-lg bg-cq-bg p-4">
          <div className="space-y-2.5 text-xs leading-relaxed text-cq-text-secondary">
            {INSIGHTS.map(({ id, text, stat }) => (
              <p key={id}>
                {text}
                <strong className="font-extrabold text-cq-text">{stat}</strong>
              </p>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={onAction}
          className="btn-primary mt-5 w-full"
        >
          {accountVerified
            ? hasPendingChanges
              ? `Apply changes (${pendingChangeCount})`
              : 'Improve your profile'
            : 'Verify profile'}
        </button>
      </div>
    </aside>
  )
}
