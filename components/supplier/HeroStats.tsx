import {
  Banknote,
  ClipboardList,
  FileSpreadsheet,
  Truck,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { sectionTitleClass } from '@/lib/ui/headings'

const STATS: Array<{
  value: string
  label: string
  icon: LucideIcon
  tone: 'accent' | 'emerald' | 'amber' | 'sky'
}> = [
  {
    value: '7',
    label: 'projects in delivery',
    icon: Truck,
    tone: 'sky',
  },
  {
    value: '£214k',
    label: 'cash due · next 90d',
    icon: Banknote,
    tone: 'amber',
  },
  {
    value: '3',
    label: 'invoices ready to raise',
    icon: FileSpreadsheet,
    tone: 'emerald',
  },
  {
    value: '5',
    label: 'active tenders',
    icon: ClipboardList,
    tone: 'accent',
  },
]

const TONE = {
  accent: {
    iconWrap: 'bg-[var(--cq-accent-muted)] text-[var(--cq-green)]',
    value: 'text-cq-text',
  },
  emerald: {
    iconWrap: 'bg-emerald-50 text-emerald-700',
    value: 'text-cq-text',
  },
  amber: {
    iconWrap: 'bg-amber-50 text-amber-700',
    value: 'text-cq-text',
  },
  sky: {
    iconWrap: 'bg-sky-50 text-sky-700',
    value: 'text-cq-text',
  },
} as const

export function HeroStats() {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-stretch">
      <div className="relative flex min-w-0 flex-col justify-center overflow-hidden rounded-xl border border-[var(--cq-green)]/30 bg-gradient-to-br from-[var(--cq-accent-muted)] via-white to-white px-6 py-6 shadow-sm lg:w-[340px] lg:shrink-0">
        <div
          className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-[var(--cq-green)]/10"
          aria-hidden
        />
        <h2 className={sectionTitleClass}>Through CQuel this year</h2>
        <div className="relative mt-4 grid grid-cols-2 gap-5">
          <div>
            <p className="text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
              £1.24m
            </p>
            <p className="mt-1 text-sm font-normal text-cq-text-secondary">
              agreed
            </p>
          </div>
          <div>
            <p className="text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
              £1.24m
            </p>
            <p className="mt-1 text-sm font-normal text-cq-text-secondary">
              signed
            </p>
          </div>
        </div>
      </div>

      <div className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-4">
        {STATS.map((stat) => {
          const Icon = stat.icon
          const tone = TONE[stat.tone]
          return (
            <div
              key={stat.label}
              className="group rounded-xl border border-cq-border bg-white px-4 py-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[var(--cq-green)]/25 hover:shadow-md sm:px-5"
            >
              <span
                className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg ${tone.iconWrap}`}
              >
                <Icon className="h-4 w-4" aria-hidden />
              </span>
              <p
                className={`text-2xl font-semibold tracking-tight ${tone.value}`}
              >
                {stat.value}
              </p>
              <p className="mt-1.5 text-sm font-normal text-cq-text-secondary">
                {stat.label}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
