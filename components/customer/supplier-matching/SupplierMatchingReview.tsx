'use client'

import * as React from 'react'
import Link from 'next/link'
import { AlertCircle, ChevronDown, ChevronUp, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import { sectionTitleClass } from '@/lib/ui/headings'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { WALTER_SCOTT_CRITERIA, WALTER_SCOTT_MATCHING } from '@/lib/customer/supplier-matching/fixture'
import {
  BID_STATUS_BAR,
  BID_STATUS_LABEL,
  BID_STATUS_PILL,
  COMPANY_CHECKS,
  RELEVANCE_WEIGHTS,
  bidStatusSupport,
  excludedCount,
  factorLabel,
  formatDayMonthYear,
  formatScore,
  isOverdue,
  partnerMeta,
  pricingExpected,
  responseDue,
  reviewFlags,
  sortForAudience,
  statusCounts,
  type InvitedSupplier,
  type MatchingAudience,
  type MatchingTender,
  type ScoreFactor,
} from '@/lib/customer/supplier-matching/model'

const TENDER_STATUS_LABEL = {
  open: 'Open',
  closed: 'Closed',
} as const

function StatusPill({ supplier }: { supplier: InvitedSupplier }) {
  return (
    <span
      className={cn(
        'inline-flex w-fit shrink-0 rounded-full border px-2.5 py-1 text-xs font-normal',
        BID_STATUS_PILL[supplier.bidStatus],
      )}
    >
      {BID_STATUS_LABEL[supplier.bidStatus]}
    </span>
  )
}

function DatedCell({ primary, supporting }: { primary: string; supporting: string }) {
  return (
    <div>
      <p className="text-sm font-normal text-cq-text">{primary}</p>
      {supporting ? (
        <p className="mt-0.5 text-xs text-cq-text-secondary">{supporting}</p>
      ) : null}
    </div>
  )
}

type MatchingStep = {
  label: string
  detail?: string
  info?: string
}

function supplierCountLabel(count: number) {
  return count === 1 ? '1 supplier' : `${count} suppliers`
}

function matchingSteps(tender: MatchingTender, audience: MatchingAudience): MatchingStep[] {
  const info =
    audience === 'customer'
      ? [
          'We searched our network for installers covering Edinburgh at this size, and approached others not yet on the platform.',
          'Each supplier was checked against your criteria — financial, operational, technical and performance — then scored on how well they fit this project.',
          'Our team checks every score before you see it, so anything missing or misleading is corrected first.',
        ]
      : []

  return [
    {
      label: 'Suppliers approached',
      detail: supplierCountLabel(tender.contacted),
      info: info[0],
    },
    {
      label: 'Matched to your brief',
      detail: supplierCountLabel(tender.suppliers.length),
      info: info[1],
    },
    {
      label: 'Scores under review',
      info: info[2],
    },
    { label: 'Offers ready to compare' },
  ]
}

function Stepper({ steps, current }: { steps: MatchingStep[]; current: number }) {
  return (
    <TooltipProvider delayDuration={80}>
      <ol className="flex flex-col gap-4 lg:flex-row lg:items-center">
        {steps.map((step, index) => {
          const state = index < current ? 'done' : index === current ? 'current' : 'upcoming'
          const last = index === steps.length - 1
          return (
            <li key={step.label} className="flex min-w-0 flex-1 items-center gap-3">
              <div
                className={cn(
                  'flex min-w-0 items-center gap-2',
                  state === 'current' && 'rounded-full bg-[var(--cq-accent-muted)] py-1 pl-1 pr-2.5',
                )}
              >
                <span
                  className={cn(
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                    state === 'done' && 'bg-black text-white',
                    state === 'current' && 'bg-[var(--cq-green)] text-white',
                    state === 'upcoming' && 'border border-cq-border bg-cq-bg text-cq-muted',
                  )}
                >
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <p
                      className={cn(
                        'truncate text-sm font-normal',
                        state === 'current' && 'text-[var(--cq-green)]',
                        state === 'done' && 'text-cq-text',
                        state === 'upcoming' && 'text-cq-text-secondary',
                      )}
                    >
                      {step.label}
                    </p>
                    {step.info ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            className={cn(
                              'shrink-0 text-cq-text-secondary',
                              state === 'current' && 'text-[var(--cq-green)]',
                            )}
                            aria-label={`About ${step.label}`}
                          >
                            <Info className="h-3.5 w-3.5" aria-hidden />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent
                          side="top"
                          sideOffset={8}
                          className="max-w-[18rem] text-xs leading-relaxed"
                        >
                          <p className="font-semibold">{step.label}</p>
                          <p className="mt-1">{step.info}</p>
                        </TooltipContent>
                      </Tooltip>
                    ) : null}
                  </div>
                  {step.detail ? (
                    <p className="text-xs text-cq-text-secondary">{step.detail}</p>
                  ) : null}
                </div>
              </div>
              {!last ? <span className="hidden h-px min-w-4 flex-1 bg-cq-border lg:block" aria-hidden /> : null}
            </li>
          )
        })}
      </ol>
    </TooltipProvider>
  )
}

function OverviewCard({
  tender,
  audience,
  overdueCount,
  onOpenExclusions,
}: {
  tender: MatchingTender
  audience: MatchingAudience
  overdueCount: number
  onOpenExclusions: () => void
}) {
  const counts = statusCounts(tender.suppliers)
  const excluded = excludedCount(tender)
  const [hovered, setHovered] = React.useState<string | null>(null)

  return (
    <section className="overflow-hidden rounded-lg border border-cq-border bg-white">
      <header className="flex flex-col gap-3 border-b border-cq-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className={sectionTitleClass}>Tender overview</h2>
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          {audience === 'internal' && overdueCount > 0 ? (
            <span className="inline-flex w-fit shrink-0 rounded-full border border-[var(--cq-link)]/30 bg-[var(--cq-link)]/10 px-2.5 py-1 text-xs font-normal text-[var(--cq-link)]">
              {overdueCount === 1 ? '1 response overdue' : `${overdueCount} responses overdue`}
            </span>
          ) : null}
          <span className="text-sm text-cq-text-secondary">
            Closes <span className="font-semibold text-cq-text">{formatDayMonthYear(tender.closeDate)}</span>
          </span>
          <span
            className={cn(
              'inline-flex rounded-[20px] px-3 py-1 text-sm font-semibold',
              tender.status === 'open'
                ? 'bg-[var(--cq-green)]/10 text-[var(--cq-green)]'
                : 'bg-cq-amber text-white',
            )}
          >
            {TENDER_STATUS_LABEL[tender.status]}
          </span>
        </div>
      </header>

      <div className="px-4 py-4">
      <div className="flex w-full gap-1.5">
        {counts.map((entry) => (
          <div
            key={entry.status}
            className="min-w-0 text-center"
            style={{ flex: `${entry.count} 1 0` }}
          >
            <p
              className={cn(
                'truncate text-xs font-normal transition-colors sm:text-sm',
                hovered === entry.status ? 'text-[var(--cq-green)]' : 'text-cq-text-secondary',
              )}
            >
              {BID_STATUS_LABEL[entry.status]}
            </p>
          </div>
        ))}
      </div>

      <TooltipProvider delayDuration={80}>
        <div
          className="mt-2 flex h-10 w-full overflow-hidden rounded-full sm:h-12"
          role="list"
          aria-label="Suppliers by bid status"
        >
          {counts.map((entry) => {
            const fill = BID_STATUS_BAR[entry.status]
            const active = hovered === entry.status
            return (
              <Tooltip key={entry.status}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    role="listitem"
                    className="relative flex h-full min-w-[2px] items-center justify-center outline-none transition-colors duration-150 focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-[var(--cq-green)] focus-visible:ring-offset-1"
                    style={{
                      flex: `${entry.count} 1 0`,
                      backgroundColor: active ? 'var(--cq-green)' : fill.color,
                    }}
                    onMouseEnter={() => setHovered(entry.status)}
                    onMouseLeave={() => setHovered(null)}
                    onFocus={() => setHovered(entry.status)}
                    onBlur={() => setHovered(null)}
                    aria-label={`${BID_STATUS_LABEL[entry.status]}: ${entry.count}`}
                  >
                    <span
                      className={cn(
                        'text-sm font-semibold tabular-nums sm:text-base',
                        active || fill.onDark ? 'text-white' : 'text-cq-text',
                      )}
                    >
                      {entry.count}
                    </span>
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  sideOffset={10}
                  hideArrow
                  className="max-w-[240px] border border-cq-border bg-white px-3 py-2.5 text-left text-cq-text shadow-md"
                >
                  <p className="text-sm font-normal text-cq-text">
                    {BID_STATUS_LABEL[entry.status]}
                    <span className="ml-1.5 tabular-nums text-cq-text-secondary">{entry.count}</span>
                  </p>
                  <p className="mt-0.5 text-xs text-cq-text-secondary">
                    {entry.count === 1 ? '1 supplier' : `${entry.count} suppliers`}
                  </p>
                </TooltipContent>
              </Tooltip>
            )
          })}
        </div>
      </TooltipProvider>

      {audience === 'internal' ? (
        <div className="mt-4 grid gap-x-4 gap-y-2 text-sm sm:grid-cols-2">
          <p className="font-normal text-cq-text">{tender.contacted} suppliers contacted</p>
          <p className="font-normal text-cq-text">{tender.metRequirements} met the requirements</p>
          <p className="text-cq-text">
            <span className="font-normal">{tender.suppliers.length} invited to tender</span>
            <span className="text-cq-text-secondary"> · </span>
            <button type="button" onClick={onOpenExclusions} className="font-semibold text-cq-link underline underline-offset-2">
              See why {excluded} were excluded
            </button>
          </p>
        </div>
      ) : null}

      <div className="mt-4 border-t border-cq-border pt-4">
        <Stepper steps={matchingSteps(tender, audience)} current={tender.stageIndex} />
      </div>
      </div>
    </section>
  )
}

function FactorRows({ factors }: { factors: ScoreFactor[] }) {
  return (
    <ul className="mt-5 space-y-3">
      {factors.map((factor) => (
        <li
          key={factor.id}
          className={cn(
            'grid grid-cols-[7rem_2.25rem_minmax(0,1fr)] items-start gap-x-3 px-3 text-left text-sm',
            factor.missing && 'rounded-lg border border-amber-200 bg-amber-50 py-3',
          )}
        >
          {factor.missing ? (
            <AlertCircle className="col-span-3 mb-2 h-4 w-4 text-amber-600" aria-hidden />
          ) : null}
          <p className="font-normal text-cq-text">{factorLabel(factor.id)}</p>
          <p className="tabular-nums font-semibold text-cq-text">{formatScore(factor.score)}</p>
          <div className="min-w-0">
            <p className="text-cq-text-secondary">{factor.reason}</p>
            {factor.missing ? (
              <p className="mt-1 font-semibold text-cq-text">{factor.missingLabel ?? 'Not on record'}</p>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  )
}

function ExpandedScores({ supplier }: { supplier: InvitedSupplier }) {
  return (
    <div className="grid gap-3 bg-slate-100 p-4 sm:grid-cols-2">
      <div className="rounded-lg border border-cq-border bg-white p-4">
        <p className="text-sm font-semibold text-cq-text">
          Relevance to this project — {formatScore(supplier.relevanceScore)}
        </p>
        <p className="mt-1 text-xs text-cq-text-secondary">
          {RELEVANCE_WEIGHTS.map((item) => `${item.label} ${Math.round(item.weight * 100)}%`).join(' · ')}
        </p>
        <FactorRows factors={supplier.relevance} />
      </div>
      <div className="rounded-lg border border-cq-border bg-white p-4">
        <p className="text-sm font-semibold text-cq-text">
          Company score — {formatScore(supplier.companyScore)}
        </p>
        <p className="mt-1 text-xs text-cq-text-secondary">Even average of three independent checks</p>
        {supplier.company.length > 0 ? (
          <FactorRows factors={supplier.company} />
        ) : (
          <p className="mt-3 text-sm text-cq-text-secondary">Not on record</p>
        )}
      </div>
    </div>
  )
}

function ExclusionsDialog({
  open,
  onOpenChange,
  tender,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  tender: MatchingTender
}) {
  const maxCount = Math.max(...tender.exclusionReasons.map((reason) => reason.count), 1)
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-text-primary">
            Why {excludedCount(tender)} suppliers were excluded
          </DialogTitle>
          <DialogDescription className="text-sm text-cq-text-secondary">
            Requirements are checked before scoring, so a supplier that does not meet one never appears in the list.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 lg:grid-cols-2">
          <section className="rounded-lg border border-cq-border p-4">
            <h3 className="text-base font-semibold text-cq-text">Reasons for exclusion</h3>
            <ul className="mt-4 space-y-4">
              {tender.exclusionReasons.map((reason) => {
                const missingData = reason.id === 'no-data'
                return (
                  <li
                    key={reason.id}
                    className={cn(
                      missingData && 'rounded-lg border border-amber-200 bg-amber-50 px-3 py-3',
                    )}
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-sm font-semibold text-cq-text">{reason.label}</span>
                      <span className="tabular-nums text-base font-semibold text-cq-text">{reason.count}</span>
                    </div>
                    <div
                      className={cn(
                        'mt-2 h-2 overflow-hidden rounded-full bg-cq-bg',
                        reason.id === 'solution' && 'ring-1 ring-[var(--cq-link)]',
                      )}
                    >
                      <div
                        className={cn(
                          'h-full rounded-full',
                          reason.id === 'solution' && 'bg-[var(--cq-link)]',
                          missingData && 'bg-[var(--cq-amber)]',
                          reason.id !== 'solution' && !missingData && 'bg-cq-muted',
                        )}
                        style={{ width: `${(reason.count / maxCount) * 100}%` }}
                      />
                    </div>
                    <p className="mt-2 text-sm text-cq-text-secondary">{reason.detail}</p>
                  </li>
                )
              })}
            </ul>
          </section>
          <section className="rounded-lg border border-cq-border p-4">
            <h3 className="text-base font-semibold text-cq-text">Suppliers with incomplete profiles</h3>
            <p className="mt-1 text-sm text-cq-text-secondary">
              Their profiles need completing before they can be scored.
            </p>
            <ul className="mt-4 space-y-3">
              {tender.unassessed.map((supplier) => (
                <li
                  key={supplier.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-cq-border px-3 py-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-cq-text">{supplier.name}</p>
                    <p className="mt-0.5 text-sm text-cq-text-secondary">{supplier.missing}</p>
                  </div>
                  <span className="inline-flex shrink-0 rounded-full border border-[var(--cq-link)]/30 bg-[var(--cq-link)]/10 px-2.5 py-1 text-xs font-normal text-[var(--cq-link)]">
                    Not assessed
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>
        <DialogFooter>
          <DialogClose className="btn-secondary">Close</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/** Same fills as the portfolio pipeline chart. */
const SCORE_SEGMENT_COLOR: Record<string, string> = {
  finance: '#3D4654',
  experience: '#7B8FA8',
  quality: '#E36B2C',
  capability: '#9AA3B2',
  location: '#7B8FA8',
  trackRecord: '#E36B2C',
  capacity: '#1E2430',
}

function ScoreWeightBar({
  segments,
}: {
  segments: Array<{ id: string; label: string; weight: number }>
}) {
  return (
    <div className="mt-4">
      <div
        className="flex h-2.5 w-full overflow-hidden rounded-full"
        role="img"
        aria-label={segments.map((segment) => `${segment.label} ${Math.round(segment.weight * 100)}%`).join(', ')}
      >
        {segments.map((segment) => (
          <span
            key={segment.id}
            className="h-full min-w-[2px]"
            style={{ flex: `${segment.weight} 1 0`, backgroundColor: SCORE_SEGMENT_COLOR[segment.id] }}
          />
        ))}
      </div>
      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
        {segments.map((segment) => (
          <li key={segment.id} className="flex items-center gap-1.5 text-sm text-cq-text">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: SCORE_SEGMENT_COLOR[segment.id] }}
              aria-hidden
            />
            <span>{segment.label}</span>
            <span className="tabular-nums text-cq-text-secondary">{Math.round(segment.weight * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function ScoresDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const companySegments = COMPANY_CHECKS.map((check) => ({
    id: check.id,
    label: check.label,
    weight: 1 / COMPANY_CHECKS.length,
  }))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-text-primary">
            How these scores are calculated
          </DialogTitle>
          <DialogDescription className="text-sm text-cq-text-secondary">
            Every invited supplier is rated in two ways.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <section className="rounded-lg border border-cq-border p-4">
            <h3 className="text-base font-semibold text-cq-text">Company score</h3>
            <p className="mt-2 text-sm text-cq-text">
              An even average of three independent checks on the supplier&apos;s business. It does not change from project to project.
            </p>
            <ScoreWeightBar segments={companySegments} />
          </section>
          <section className="rounded-lg border border-cq-border p-4">
            <h3 className="flex flex-wrap items-center gap-2 text-base font-semibold text-cq-text">
              Relevance score
              <span className="inline-flex rounded-full border border-[var(--cq-link)]/30 bg-[var(--cq-link)]/10 px-2 py-0.5 text-xs font-semibold text-[var(--cq-link)]">
                Preview
              </span>
            </h3>
            <p className="mt-2 text-sm text-cq-text">
              How well suited a supplier is to this specific project, weighted across four factors.
            </p>
            <ScoreWeightBar segments={RELEVANCE_WEIGHTS.map((item) => ({ ...item }))} />
            <p className="mt-3 text-sm text-cq-text-secondary">
              This weighting is being rolled out gradually, so it may not yet be reflected in every supplier&apos;s score.
            </p>
          </section>
        </div>
        <DialogFooter>
          <DialogClose className="btn-secondary">Close</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function ProjectCriteria() {
  return (
    <section aria-labelledby="project-criteria-heading">
      <h2 id="project-criteria-heading" className={sectionTitleClass}>
        Project criteria
      </h2>
      <ul className="mt-3 flex flex-wrap gap-2">
        {WALTER_SCOTT_CRITERIA.map((item) => (
          <li
            key={item}
            className="inline-flex rounded-full border border-cq-border bg-white px-2.5 py-1 text-sm font-normal text-cq-text"
          >
            {item}
          </li>
        ))}
      </ul>
    </section>
  )
}

export function MatchingViewSwitch({
  audience,
  onChange,
}: {
  audience: MatchingAudience
  onChange: (next: MatchingAudience) => void
}) {
  return (
    <div
      className="inline-flex overflow-hidden rounded-lg border border-cq-border bg-cq-bg"
      role="group"
      aria-label="Matching view"
    >
      {(
        [
          ['customer', 'Customer view'],
          ['internal', 'Internal review'],
        ] as const
      ).map(([value, label]) => (
        <button
          key={value}
          type="button"
          aria-pressed={audience === value}
          onClick={() => onChange(value)}
          className={cn(
            'px-3 py-1.5 text-sm font-semibold',
            audience === value
              ? 'border border-cq-green bg-white text-cq-green'
              : 'border border-transparent text-cq-text-secondary',
          )}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

export function SupplierMatchingReview({
  tender = WALTER_SCOTT_MATCHING,
  audience,
}: {
  tender?: MatchingTender
  audience: MatchingAudience
}) {
  const [expandedId, setExpandedId] = React.useState<string | null>(null)
  const [exclusionsOpen, setExclusionsOpen] = React.useState(false)
  const [scoresOpen, setScoresOpen] = React.useState(false)
  const today = React.useMemo(() => new Date(), [])

  const rows = sortForAudience(tender.suppliers, audience, today)
  const flags = reviewFlags(tender.suppliers)
  const overdueCount = tender.suppliers.filter((supplier) => isOverdue(supplier, today)).length

  React.useEffect(() => {
    setExpandedId(null)
  }, [audience])

  return (
    <div className="space-y-4">
      <OverviewCard
        tender={tender}
        audience={audience}
        overdueCount={overdueCount}
        onOpenExclusions={() => setExclusionsOpen(true)}
      />

      {audience === 'internal' && flags.length > 0 ? (
        <section className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-3">
          <div className="flex min-w-0 items-start gap-2 text-sm text-cq-text">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden />
            <div className="min-w-0">
              <p className="font-semibold">Review before sharing with the customer</p>
              <ul className="mt-3 space-y-1.5">
                {flags.map((flag) => (
                  <li key={flag.supplierId}>
                    <span className="font-semibold">{flag.supplierName}</span> {flag.text}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      ) : null}

      <section className="overflow-hidden rounded-xl border border-cq-border bg-white">
        <div className="flex flex-col gap-3 border-b border-cq-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className={sectionTitleClass}>
            Invited suppliers ({tender.suppliers.length})
          </h2>
          {audience === 'customer' ? (
            <button type="button" className="btn-secondary-sm" onClick={() => setScoresOpen(true)}>
              How these scores are calculated
            </button>
          ) : null}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-cq-border bg-cq-bg text-left">
                <th className={cn(sectionTitleClass, 'py-3 pl-4 pr-3')}>Supplier</th>
                <th className={cn(sectionTitleClass, 'py-3 px-3')}>Bid status</th>
                <th className={cn(sectionTitleClass, 'py-3 px-3')}>
                  {audience === 'customer' ? 'Pricing expected' : 'Response due'}
                </th>
                <th className={cn(sectionTitleClass, 'py-3 px-3')}>Relevance</th>
                <th className={cn(sectionTitleClass, 'py-3 px-3')}>Company</th>
                <th className={cn(sectionTitleClass, 'py-3 pl-3 pr-4 text-right')}>
                  {audience === 'customer' ? 'Profile' : <span className="sr-only">Details</span>}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((supplier) => {
                const due =
                  audience === 'customer' ? pricingExpected(supplier) : responseDue(supplier, today)
                const expanded = audience === 'internal' && expandedId === supplier.id
                return (
                  <React.Fragment key={supplier.id}>
                    <tr className={cn('border-b border-cq-border last:border-b-0', expanded && 'border-b-0 bg-slate-100')}>
                      <td className="py-3 pl-4 pr-3 align-top">
                        <Link
                          href={supplier.profileHref}
                          className="font-semibold text-cq-text underline-offset-2 hover:underline"
                        >
                          {supplier.name}
                        </Link>
                        <p className="mt-0.5 text-xs text-cq-text-secondary">{partnerMeta(supplier)}</p>
                      </td>
                      <td className="py-3 px-3 align-top">
                        <StatusPill supplier={supplier} />
                        <p className="mt-1 text-xs text-cq-text-secondary">
                          {bidStatusSupport(supplier, audience)}
                        </p>
                      </td>
                      <td className="py-3 px-3 align-top">
                        <DatedCell primary={due.primary} supporting={due.supporting} />
                      </td>
                      <td className="py-3 px-3 align-top tabular-nums font-normal text-cq-text">
                        {formatScore(supplier.relevanceScore)}
                      </td>
                      <td className="py-3 px-3 align-top tabular-nums font-normal text-cq-text">
                        {formatScore(supplier.companyScore)}
                      </td>
                      <td className="py-3 pl-3 pr-4 text-right align-top">
                        {audience === 'customer' ? (
                          <Link href={supplier.profileHref} className="text-sm font-semibold text-cq-link underline underline-offset-2">
                            View profile
                          </Link>
                        ) : (
                          <button
                            type="button"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-cq-text-secondary hover:bg-cq-bg"
                            aria-expanded={expanded}
                            aria-label={`${expanded ? 'Collapse' : 'Expand'} ${supplier.name}`}
                            onClick={() => setExpandedId(expanded ? null : supplier.id)}
                          >
                            {expanded ? (
                              <ChevronUp className="h-4 w-4" aria-hidden />
                            ) : (
                              <ChevronDown className="h-4 w-4" aria-hidden />
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                    {expanded ? (
                      <tr className="border-b border-cq-border bg-slate-100">
                        <td colSpan={6} className="p-0">
                          <ExpandedScores supplier={supplier} />
                        </td>
                      </tr>
                    ) : null}
                  </React.Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      <ExclusionsDialog open={exclusionsOpen} onOpenChange={setExclusionsOpen} tender={tender} />
      <ScoresDialog open={scoresOpen} onOpenChange={setScoresOpen} />
    </div>
  )
}
