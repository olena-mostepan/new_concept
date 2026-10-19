'use client'

import * as React from 'react'
import { X, MapPin, Users, Calendar, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Types ─────────────────────────────────────────────────────────────

export type SupplierCompanyProfileData = {
  companyName: string
  contactPhoto?: string | null
  contactName: string
  contactTitle: string
  bio: string
  location: string
  turnover2025: string
  turnover2024: string
  teamSize: string
  founded: string
  coverage: string
  useOfSubcontractors: string
  projectSizes: string
}

// ─── Default data: Photon Energy ──────────────────────────────────────

const PHOTON_ENERGY_PROFILE: SupplierCompanyProfileData = {
  companyName: 'Photon Energy',
  contactPhoto: null,
  contactName: 'James Richardson',
  contactTitle: 'Commercial Director',
  bio: 'Specialist solar PV installer with 10+ years experience across commercial and industrial rooftop projects in the UK.',
  location: 'Unit 4, Riverside Business Park, Leeds, LS12 2QQ, UK',
  turnover2025: '£4.2M',
  turnover2024: '£3.1M',
  teamSize: '42',
  founded: '2014',
  coverage: 'UK — England & Wales',
  useOfSubcontractors: 'Yes, electrical works only',
  projectSizes: '£200k – £5M',
}

// ─── Facts row config ──────────────────────────────────────────────────

type FactRow = {
  key: keyof SupplierCompanyProfileData
  label: string
  icon?: React.ComponentType<{ className?: string }>
}

const FACT_ROWS: FactRow[] = [
  { key: 'location', label: 'Location (Office)', icon: MapPin },
  { key: 'turnover2025', label: 'Turnover (2025)' },
  { key: 'turnover2024', label: 'Turnover (2024)' },
  { key: 'teamSize', label: 'Team size', icon: Users },
  { key: 'founded', label: 'Founded', icon: Calendar },
  { key: 'coverage', label: 'Coverage', icon: Globe },
  { key: 'useOfSubcontractors', label: 'Use of subcontractors' },
  { key: 'projectSizes', label: 'Project sizes' },
]

// ─── Component ─────────────────────────────────────────────────────────

export type SupplierCompanyProfileProps = {
  data?: SupplierCompanyProfileData
  onClose: () => void
}

export function SupplierCompanyProfile({
  data = PHOTON_ENERGY_PROFILE,
  onClose,
}: SupplierCompanyProfileProps) {
  return (
    <div className="flex flex-col h-full max-h-[85vh] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0 pb-4 border-b border-cq-border">
        <h2 className="text-xl font-bold text-cq-text">{data.companyName}</h2>
        <button
          onClick={onClose}
          className="p-2 rounded-md text-cq-text-secondary hover:text-cq-text hover:bg-cq-bg transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-6">
        {/* Photo left of quote */}
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="w-full md:w-auto shrink-0">
            <div className="w-40 h-40 rounded-lg border border-cq-border bg-cq-border-light overflow-hidden flex items-center justify-center">
              {data.contactPhoto ? (
                <img
                  src={data.contactPhoto}
                  alt={data.contactName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <svg
                  className="w-24 h-24 text-cq-muted"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              )}
            </div>
            <p className="font-bold text-cq-text mt-2">{data.contactName}</p>
            <p className="text-sm text-cq-text-secondary font-medium">{data.contactTitle}</p>
          </div>
          <div className="rounded-lg border border-cq-border px-4 py-3 flex-1 min-w-0">
            <p className="text-lg text-cq-text-secondary italic">&ldquo;{data.bio}&rdquo;</p>
          </div>
        </div>

        {/* Facts table at bottom */}
        <div className="rounded-lg border border-cq-border overflow-hidden">
            <div className="divide-y divide-cq-border">
              {FACT_ROWS.map(({ key, label, icon: Icon }) => {
                const value = data[key] ?? '—'
                const isEmpty = value === '—'
                return (
                  <div
                    key={key}
                    className="flex items-center justify-between gap-4 px-4 py-3 text-sm"
                  >
                    <span className="text-cq-text-secondary shrink-0">{label}</span>
                    <span
                      className={cn(
                        'flex items-center gap-2 text-right tabular-nums',
                        isEmpty ? 'text-cq-muted' : 'font-bold text-cq-text'
                      )}
                    >
                      {Icon && !isEmpty ? (
                        <Icon className="w-4 h-4 text-cq-muted shrink-0" />
                      ) : null}
                      {value}
                    </span>
                  </div>
                )
              })}
            </div>
        </div>
      </div>
    </div>
  )
}
