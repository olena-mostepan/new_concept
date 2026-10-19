import Link from 'next/link'
import { Banknote, CircleCheck, Mail } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { sectionTitleClass } from '@/lib/ui/headings'

const ACTIVITIES: Array<{
  id: string
  text: string
  when: string
  href: string
  icon: LucideIcon
  tone: string
}> = [
  {
    id: 'payment-hohe',
    text: 'Payment received — Solar PV Höhe T1, £93,452',
    when: '7 days ago',
    href: '/supplier/projects/322',
    icon: Banknote,
    tone: 'bg-emerald-50 text-emerald-700',
  },
  {
    id: 'invite-ashp',
    text: 'Invited to tender — ASHP Bremerhaven',
    when: '7 days ago',
    href: '/supplier/tenders',
    icon: Mail,
    tone: 'bg-[var(--cq-accent-muted)] text-[var(--cq-green)]',
  },
  {
    id: 'milestone-navale',
    text: 'Milestone confirmed — LED Navale marked energised',
    when: '12 days ago',
    href: '/supplier/projects/322',
    icon: CircleCheck,
    tone: 'bg-sky-50 text-sky-700',
  },
]

export function RecentActivity() {
  return (
    <section className="overflow-hidden rounded-xl border border-cq-border bg-white shadow-sm">
      <header className="flex items-center justify-between gap-3 border-b border-cq-border px-5 py-4 sm:px-6">
        <h2 className={sectionTitleClass}>Recent Activity</h2>
        <button type="button" className="btn-link">
          See all
        </button>
      </header>

      <ul className="divide-y divide-cq-border">
        {ACTIVITIES.map((item) => {
          const Icon = item.icon
          return (
            <li
              key={item.id}
              className="flex items-start gap-3 px-5 py-4 transition-colors hover:bg-cq-bg/80 sm:px-6"
            >
              <span
                className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${item.tone}`}
                aria-hidden
              >
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-cq-text">{item.text}</p>
                <p className="mt-0.5 text-xs text-cq-text-secondary">{item.when}</p>
              </div>
              <Link href={item.href} className="btn-link shrink-0 pt-0.5">
                Go to Project
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
