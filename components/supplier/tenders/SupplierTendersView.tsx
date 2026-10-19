'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronDown, Folder, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  SUPPLIER_TENDERS,
  type TenderListStatus,
  type SupplierTender,
} from '@/lib/supplier/tenders/mock-data'
import { sectionTitleClass } from '@/lib/ui/headings'

const STATUS_OPTIONS: { id: TenderListStatus; label: string }[] = [
  { id: 'active', label: 'Active' },
  { id: 'closed', label: 'Closed' },
  { id: 'all', label: 'All' },
]

function TenderIcon({ icon }: { icon: SupplierTender['icon'] }) {
  if (icon === 'solar') {
    return (
      <Image
        src="/site elements/solar.svg"
        alt=""
        width={36}
        height={36}
        className="h-9 w-9 rounded object-contain"
      />
    )
  }
  if (icon === 'led') {
    return (
      <Image
        src="/site elements/Avatar.svg"
        alt=""
        width={36}
        height={36}
        className="h-9 w-9 rounded object-contain"
      />
    )
  }
  return (
    <span
      className={cn(
        'flex h-9 w-9 items-center justify-center rounded-lg border border-cq-border',
        icon === 'ashp' && 'bg-[var(--cq-accent-muted)] text-[var(--cq-green)]',
        icon === 'ev' && 'bg-cq-bg text-cq-text-secondary',
        icon === 'battery' && 'bg-emerald-50 text-emerald-700',
      )}
      aria-hidden
    >
      <Folder className="h-4 w-4" />
    </span>
  )
}

function BidStatusBadge({ status }: { status: SupplierTender['bidStatus'] }) {
  if (status === 'submitted') {
    return (
      <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
        Submitted
      </span>
    )
  }
  return (
    <span className="inline-flex rounded-full border border-cq-border bg-cq-bg px-2.5 py-0.5 text-xs font-bold text-cq-text-secondary">
      Not started
    </span>
  )
}

export function SupplierTendersView() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<TenderListStatus>('active')

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase()
    return SUPPLIER_TENDERS.filter((t) => {
      if (status !== 'all' && t.listStatus !== status) return false
      if (!q) return true
      return (
        t.name.toLowerCase().includes(q) ||
        t.propertyLabel.toLowerCase().includes(q)
      )
    })
  }, [search, status])

  return (
    <section className="overflow-hidden rounded-2xl border border-cq-border bg-white shadow-[0_1px_2px_rgba(30,40,50,0.06)]">
      <div className="flex flex-col gap-3 border-b border-cq-border px-5 py-4 sm:flex-row sm:items-end sm:justify-between sm:px-6">
        <div className="relative min-w-0 flex-1 sm:max-w-md">
          <label htmlFor="tender-search" className="sr-only">
            Search tenders
          </label>
          <input
            id="tender-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search…"
            className="w-full rounded-lg border border-cq-border bg-white py-2.5 pl-3 pr-10 text-sm text-cq-text placeholder:text-cq-text-secondary focus:border-[var(--cq-green)] focus:outline-none focus:ring-1 focus:ring-[var(--cq-green)]"
          />
          <Search
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cq-text-secondary"
            aria-hidden
          />
        </div>

        <div className="shrink-0">
          <label
            htmlFor="tender-status"
            className="mb-1 block text-xs font-semibold text-cq-text-secondary"
          >
            Status
          </label>
          <div className="relative">
            <select
              id="tender-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as TenderListStatus)}
              className="appearance-none rounded-lg border border-cq-border bg-white py-2.5 pl-3 pr-9 text-sm font-semibold text-cq-text focus:border-[var(--cq-green)] focus:outline-none focus:ring-1 focus:ring-[var(--cq-green)]"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-cq-text-secondary"
              aria-hidden
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left">
          <thead>
            <tr className="border-b border-cq-border bg-cq-bg/50">
              <th className={`px-5 py-3 sm:px-6 ${sectionTitleClass}`}>
                Tender name
              </th>
              <th className={`px-4 py-3 ${sectionTitleClass}`}>Deadline</th>
              <th className={`px-4 py-3 ${sectionTitleClass}`}>Bid Status</th>
              <th className={`px-5 py-3 text-right sm:px-6 ${sectionTitleClass}`}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-5 py-10 text-center text-sm text-cq-text-secondary sm:px-6"
                >
                  No tenders match this search.
                </td>
              </tr>
            ) : (
              rows.map((tender) => (
                <tr
                  key={tender.id}
                  className="border-b border-cq-border last:border-b-0 transition-colors hover:bg-cq-bg/60"
                >
                  <td className="px-5 py-4 sm:px-6">
                    <div className="flex items-center gap-3">
                      <TenderIcon icon={tender.icon} />
                      <div className="min-w-0">
                        <p className="font-bold text-cq-text">{tender.name}</p>
                        <p className="mt-0.5 text-sm text-cq-text-secondary">
                          {tender.propertyLabel}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm font-medium text-cq-text">
                    {tender.deadlineLabel}
                  </td>
                  <td className="px-4 py-4">
                    <BidStatusBadge status={tender.bidStatus} />
                  </td>
                  <td className="px-5 py-4 text-right sm:px-6">
                    <Link href={tender.href} className="btn-secondary-sm">
                      View Tender
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
