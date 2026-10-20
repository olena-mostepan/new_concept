import Link from "next/link"
import Image from "next/image"
import {
  Inbox,
  LayoutDashboard,
  MessageSquare,
  Building2,
} from "lucide-react"

const projects = [
  {
    slug: "solar",
    title: "Solar",
    description: "Project 322 — Braehead. Shopping centre, LL1–LL3, Red Parking, car park roofs. Supplier price comparison with Full-Scope and Smaller systems.",
    href: "/supplier-comparison",
    icon: "/site elements/solar.svg",
  },
  {
    slug: "led",
    title: "LED (Berlin)",
    description: "Project 310 — Alexanderstraße 1/3/5, Berlin. 2,494 luminaires, ranked by €/luminaire.",
    href: "/supplier-comparison/led",
    icon: "/site elements/Avatar.svg",
  },
  {
    slug: "led-rostock",
    title: "LED (Rostock)",
    description: "tender_651_650 — Doberaner Straße 114-116, Rostock. 2 suppliers (490 / 1,029 luminaires).",
    href: "/supplier-comparison/led-rostock",
    icon: "/site elements/Avatar.svg",
  },
]

const supplierPortal = {
  title: "Supplier portal",
  description:
    "One Arin Power workflow — Overview, Delivery, Questions, and Company Profile (plus Tenders, Surveys, Contracts tabs).",
  href: "/supplier",
  cta: "Open supplier portal",
} as const

const customerPortal = {
  title: "Customer portal (Energise)",
  description:
    "Energise portfolio overview and delivery tracking — confirm dates, review phase progress, and open project Delivery detail.",
  href: "/customer",
  cta: "Open customer portal",
} as const

const opsWorkflows = [
  {
    slug: "clarifications-ops",
    title: "Clarifications (ops)",
    description:
      "Buyer workspace: raise questions from Solar comparison or here, track supplier replies, review impact, and accept changes onto the bid.",
    href: "/clarifications",
    icon: MessageSquare,
    cta: "Open ops prototype",
  },
  {
    slug: "clarifications-supplier",
    title: "Clarifications inbox (legacy)",
    description:
      "Earlier supplier clarifications inbox — same mock loop as ops, before the full supplier portal shell.",
    href: "/supplier/clarifications",
    icon: Inbox,
    cta: "Open legacy inbox",
  },
] as const

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <header className="bg-white border-b border-[#F3F4F6]">
        <div className="w-full max-w-screen-2xl mx-auto px-6 sm:px-8 lg:px-10 py-6 flex flex-col gap-2">
          <p className="text-sm text-[#4D5761] font-semibold uppercase tracking-wide">CQuel Prototype Library</p>
          <h1 className="text-[32px] font-semibold text-[#1E2832] leading-tight">
            Pick a scenario to explore
          </h1>
          <p className="text-base text-[#4D5761] max-w-3xl">
            Tender comparisons, the supplier portal, and ops collaboration workflows — each opens as its own interactive prototype.
          </p>
        </div>
      </header>

      <main className="w-full max-w-screen-2xl mx-auto px-6 sm:px-8 lg:px-10 py-10 space-y-12">
        <Link
          href="/concept"
          className="flex items-center justify-between gap-6 rounded-xl border-2 border-[var(--cq-accent)] bg-white p-6 shadow-sm hover:bg-[var(--cq-accent-muted)]"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--cq-accent)]">New concept</p>
            <p className="mt-1 text-lg font-semibold text-[#1E2832]">Workstreams in batches — customer side</p>
            <p className="text-sm text-[#4D5761]">Portfolio, batches, workstreams and both navigation options, on one example portfolio.</p>
          </div>
          <span className="btn-primary">Open concept</span>
        </Link>
        <section>
          <h2 className="mb-1 text-lg font-semibold text-[#1E2832]">Portals</h2>
          <p className="mb-4 max-w-2xl text-sm text-[#4D5761]">
            Supplier (Arin Power) and customer (Energise) delivery workflows — separate shells, shared design tokens.
          </p>
          <div className="grid max-w-4xl gap-6 md:grid-cols-2">
            <Link
              href={supplierPortal.href}
              className="group flex flex-col gap-4 rounded-2xl border border-[var(--cq-green)] bg-white p-6 shadow-sm ring-1 ring-[var(--cq-green)]/20 transition-shadow hover:shadow-lg"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl border border-[#E4E7EC] bg-[#F9FAFB] text-[var(--cq-green)]">
                  <LayoutDashboard className="h-8 w-8" aria-hidden />
                </div>
                <div className="flex-1">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#4D5761]">
                    Supplier
                  </p>
                  <h3 className="mb-2 text-xl font-semibold text-[#1E2832]">
                    {supplierPortal.title}
                  </h3>
                  <p className="text-sm text-[#4D5761]">{supplierPortal.description}</p>
                </div>
              </div>
              <span className="btn-primary w-fit group-hover:bg-[var(--cq-green-hover)]">
                {supplierPortal.cta}
              </span>
            </Link>
            <Link
              href={customerPortal.href}
              className="group flex flex-col gap-4 rounded-2xl border border-[#E4E7EC] bg-white p-6 shadow-sm transition-shadow hover:shadow-lg"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl border border-[#E4E7EC] bg-[#F9FAFB] text-[var(--cq-green)]">
                  <Building2 className="h-8 w-8" aria-hidden />
                </div>
                <div className="flex-1">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#4D5761]">
                    Customer
                  </p>
                  <h3 className="mb-2 text-xl font-semibold text-[#1E2832]">
                    {customerPortal.title}
                  </h3>
                  <p className="text-sm text-[#4D5761]">{customerPortal.description}</p>
                </div>
              </div>
              <span className="btn-primary w-fit group-hover:bg-[var(--cq-green-hover)]">
                {customerPortal.cta}
              </span>
            </Link>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#1E2832] mb-4">Tender comparison</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-5xl">
            {projects.map((project) => (
              <Link
                key={project.slug}
                href={project.href}
                className="group rounded-2xl border border-[#E4E7EC] bg-white shadow-sm hover:shadow-lg transition-shadow p-6 flex flex-col gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-16 h-16 flex items-center justify-center">
                    <Image
                      src={project.icon}
                      alt={project.title}
                      width={64}
                      height={64}
                      className="object-contain"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-[#4D5761] uppercase tracking-wide mb-1">Project</p>
                    <h3 className="text-2xl font-semibold text-[#1E2832] mb-2">{project.title}</h3>
                    <p className="text-sm text-[#4D5761]">{project.description}</p>
                  </div>
                </div>
                <span className="btn-primary w-fit group-hover:bg-[var(--cq-green-hover)]">
                  View Comparison
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#1E2832] mb-1">Ops collaboration</h2>
          <p className="text-sm text-[#4D5761] mb-4 max-w-2xl">
            Buyer-side clarifications and the older supplier inbox for the same mock loop.
          </p>
          <div className="grid gap-6 md:grid-cols-2 max-w-4xl">
            {opsWorkflows.map((w) => {
              const Icon = w.icon
              return (
                <Link
                  key={w.slug}
                  href={w.href}
                  className="group rounded-2xl border border-[#E4E7EC] bg-white shadow-sm hover:shadow-lg transition-shadow p-6 flex flex-col gap-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-16 h-16 flex items-center justify-center rounded-xl border border-[#E4E7EC] bg-[#F9FAFB] text-[var(--cq-green)]">
                      <Icon className="w-9 h-9" aria-hidden />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-[#4D5761] uppercase tracking-wide mb-1">
                        Workflow
                      </p>
                      <h3 className="text-2xl font-semibold text-[#1E2832] mb-2">{w.title}</h3>
                      <p className="text-sm text-[#4D5761]">{w.description}</p>
                    </div>
                  </div>
                  <span className="btn-primary w-fit group-hover:bg-[var(--cq-green-hover)]">
                    {w.cta}
                  </span>
                </Link>
              )
            })}
          </div>
        </section>
      </main>
    </div>
  )
}
