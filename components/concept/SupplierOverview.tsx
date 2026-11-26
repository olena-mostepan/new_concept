"use client";


import Link from "next/link";
import { cn } from "@/lib/utils";
import { TENDER_ROWS } from "@/lib/concept/supplierList";
import { INITIAL_DELIVERY_CLAIMS, formatGbp, sumProjected } from "@/lib/supplier/delivery/mock-data";
import { JOB_DELIVERY_BY_ID, LIST_JOB_IDS } from "@/lib/supplier/delivery/job-mock-data";
import { SupplierHeader } from "./SupplierTenders";
import { Button, Icon, PageHeader } from "./ui";

/**
 * Supplier concept · Overview (25 Nov): today's supplier Overview in the design system.
 * Figures are worked out from the prototype's tenders and delivery jobs, not typed in.
 */

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function day(iso: string) {
  const d = new Date(`${iso}T12:00:00`);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}
const short = (n: number) => (n >= 1_000_000 ? `£${(n / 1_000_000).toFixed(2)}m` : n >= 10_000 ? `£${Math.round(n / 1000)}k` : formatGbp(n));

export function SupplierOverview() {
  const claims = INITIAL_DELIVERY_CLAIMS;
  const live = claims.filter((c) => c.status !== "settled");
  const won = LIST_JOB_IDS.reduce((sum, id) => sum + JOB_DELIVERY_BY_ID[id].gmv, 0);
  const toRaise = claims.filter((c) => c.status === "confirmable" || c.status === "confirmed").length;
  const cash = [...live].sort((a, b) => a.projectedDate.localeCompare(b.projectedDate)).slice(0, 5);

  const active = TENDER_ROWS.filter((r) => r.group !== "closed").length;

  return (
    <div className="min-h-screen bg-bg-container-grey">
      <SupplierHeader active="overview" />
      <main className="mx-auto flex w-full max-w-screen-2xl flex-col gap-4 px-6 pb-28 pt-8 sm:px-8 lg:px-10">
        <PageHeader title="Overview" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1.2fr_repeat(4,minmax(0,1fr))]">
          <section className="relative flex flex-col justify-between gap-4 overflow-hidden rounded-lg border border-status-info-border bg-status-info-bg p-4">
            <p className="relative s3 text-status-info-text">Won through CQuel</p>
            <div className="relative flex gap-8">
              <Figure value={short(won)} label="Agreed" />
              <Figure value={short(won)} label="Signed" />
            </div>
            <div
              aria-hidden
              className="absolute -right-5 -top-5 flex size-[132px] items-center justify-center rounded-full bg-white/55"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icons/services/cash.png" alt="" className="size-[96px] object-contain" />
            </div>
          </section>
          {[
            { icon: "projects-in-delivery", value: String(live.length), label: "Projects in delivery", href: "/concept/supplier/delivery" },
            { icon: "pricing", value: short(sumProjected(claims)), label: "To invoice, next 90 days", href: "/concept/supplier/delivery" },
            { icon: "invoices-ready", value: String(toRaise), label: "Invoices ready to raise", href: "/concept/supplier/delivery" },
            { icon: "tender", value: String(active), label: "Active tenders", href: "/concept/supplier/tenders" },
          ].map((f) => (
            <Link
              key={f.label}
              href={f.href}
              className="flex items-end justify-between gap-3 rounded-lg border border-border-dark bg-bg-container p-4 outline-none hover:border-black-4 focus-visible:shadow-focus"
            >
              <Figure value={f.value} label={f.label} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/icons/services/${f.icon}.png`} alt="" className="-mr-1 size-16 shrink-0 self-start object-contain" />
            </Link>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <section className="overflow-hidden rounded-lg border border-border-dark bg-bg-container">
            <header className="flex items-center justify-between border-b border-border-light px-4 py-3">
              <h2 className="h7 text-text-primary">Invoices coming up</h2>
              <Button type="link" href="/concept/supplier/delivery">See all</Button>
            </header>
            <ul>
              {cash.map((c) => (
                <li key={c.id} className="border-b border-border-light last:border-b-0">
                  <Link
                    href={`/concept/supplier/delivery/${c.id}`}
                    className="grid grid-cols-[minmax(0,1fr)_auto_16px] items-center gap-4 px-4 py-3 outline-none hover:bg-black-1 focus-visible:bg-black-2"
                  >
                    <span className="min-w-0">
                      <span className="block h8 text-text-title">{c.job}</span>
                      <span className={cn("mt-0.5 block p7", c.status === "stuck" ? "text-status-danger-text" : "text-text-secondary")}>
                        {c.currentStage} · {c.status === "stuck" ? "overdue" : day(c.projectedDate)}
                      </span>
                    </span>
                    <span className="p6 text-text-primary">{formatGbp(c.amount)}</span>
                    <Icon name="chevron-right" size={16} className="text-icon-default" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section className="overflow-hidden rounded-lg border border-border-dark bg-bg-container">
            <header className="flex items-center justify-between border-b border-border-light px-4 py-3">
              <h2 className="h7 text-text-primary">Recent activity</h2>
            </header>
            <p className="px-4 py-4 p6 text-text-secondary">No recent activity yet.</p>
          </section>
        </div>
      </main>
    </div>
  );
}

function Figure({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="h3 text-text-primary [font-variant-numeric:normal]">{value}</p>
      <p className="p7 text-text-secondary">{label}</p>
    </div>
  );
}
