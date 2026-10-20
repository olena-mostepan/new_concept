'use client'

import * as React from 'react'
import Link from 'next/link'
import { Calendar, Rocket, Search, Zap } from 'lucide-react'
import { toast } from 'sonner'
import { OWNER_LABEL } from '@/lib/concept/model'
import { PORTFOLIO_USER } from '@/lib/customer/portfolio/mock-data'
import {
  CUSTOMER_PROJECT_LIST,
  WORKSPACE_STATS,
  type CustomerProjectListRow,
} from '@/lib/customer/workspace/mock-data'
import {
  FilterSelect,
  ProjectName,
  ResponsibilityPill,
  WorkspaceStat,
} from '@/components/customer/workspace/WorkspaceBits'

const RESPONSIBILITY_LABEL = {
  your_action: OWNER_LABEL.you,
  supplier_action: OWNER_LABEL.suppliers,
} as const

function matches(
  row: CustomerProjectListRow,
  query: string,
  party: string,
  solution: string,
  status: string,
) {
  if (party !== 'all' && RESPONSIBILITY_LABEL[row.responsibility] !== party) return false
  if (solution !== 'all' && row.projectType !== solution) return false
  if (status !== 'all' && row.status !== status) return false
  if (!query) return true
  return `${row.name} ${row.location}`.toLowerCase().includes(query)
}

export function CustomerAllProjectsView() {
  const [search, setSearch] = React.useState('')
  const [party, setParty] = React.useState('all')
  const [solution, setSolution] = React.useState('all')
  const [status, setStatus] = React.useState('all')

  const query = search.trim().toLowerCase()
  const rows = CUSTOMER_PROJECT_LIST.filter((row) =>
    matches(row, query, party, solution, status),
  )

  const parties = [
    ...new Set(CUSTOMER_PROJECT_LIST.map((row) => RESPONSIBILITY_LABEL[row.responsibility])),
  ]
  const types = [...new Set(CUSTOMER_PROJECT_LIST.map((row) => row.projectType))]
  const statuses = [...new Set(CUSTOMER_PROJECT_LIST.map((row) => row.status))]

  return (
    <div className="mx-auto w-full max-w-screen-2xl space-y-5 px-6 py-8 sm:px-8 lg:px-10">
      <h1 className="text-2xl font-semibold tracking-tight text-text-primary md:text-3xl">
        Welcome back, {PORTFOLIO_USER}
      </h1>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <WorkspaceStat
          icon={<Calendar className="h-4 w-4" aria-hidden />}
          value={WORKSPACE_STATS.uploadedPlans}
          label="uploaded plans"
        />
        <WorkspaceStat
          icon={<Rocket className="h-4 w-4" aria-hidden />}
          value={WORKSPACE_STATS.publishedBriefs}
          label="published briefs"
        />
        <WorkspaceStat
          icon={<Zap className="h-4 w-4" aria-hidden />}
          value={WORKSPACE_STATS.activeTenders}
          label="active tenders"
        />
        <WorkspaceStat
          icon={null}
          value={WORKSPACE_STATS.acceptedContracts}
          label="accepted contracts"
          iconTone="success"
        />
      </div>

      <section className="overflow-hidden rounded-xl border border-cq-border bg-white ">
        <div className="flex flex-col gap-4 border-b border-cq-border px-5 py-4 sm:flex-row sm:items-end sm:justify-between sm:px-6">
          <div className="relative w-full sm:max-w-xs">
            <label htmlFor="project-search" className="sr-only">
              Search projects
            </label>
            <input
              id="project-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search..."
              className="w-full rounded-lg border border-cq-border bg-white py-2 pl-3 pr-10 text-sm text-cq-text placeholder:text-cq-muted focus:border-[var(--cq-green)] focus:outline-none focus:ring-1 focus:ring-[var(--cq-green)]"
            />
            <Search
              className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cq-muted"
              aria-hidden
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <FilterSelect
              id="project-party"
              label="Responsible Party"
              value={party}
              onChange={setParty}
              options={parties}
            />
            <FilterSelect
              id="project-solution"
              label="Solution Category"
              value={solution}
              onChange={setSolution}
              options={types}
            />
            <FilterSelect
              id="project-status"
              label="Status"
              value={status}
              onChange={setStatus}
              options={statuses}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] text-left text-sm">
            <thead>
              <tr className="border-b border-cq-border bg-cq-bg/50 text-xs font-normal text-cq-text-secondary">
                <th className="px-5 py-3 font-normal sm:px-6">Project Name</th>
                <th className="px-3 py-3 font-normal">Location</th>
                <th className="px-3 py-3 font-normal">Project Type</th>
                <th className="px-3 py-3 font-normal">Project Delivery</th>
                <th className="px-3 py-3 font-normal">Next Step</th>
                <th className="px-3 py-3 font-normal">Responsibility</th>
                <th className="px-5 py-3 text-right font-normal sm:px-6">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-10 text-center text-sm text-cq-text-secondary sm:px-6"
                  >
                    No projects match this search.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id} className="border-b border-cq-border last:border-b-0">
                    <td className="px-5 py-4 sm:px-6">
                      <ProjectName name={row.name} href={row.href} />
                    </td>
                    <td className="px-3 py-4 text-cq-text">{row.location}</td>
                    <td className="px-3 py-4 text-cq-text">{row.projectType}</td>
                    <td className="px-3 py-4 text-cq-text">{row.delivery}</td>
                    <td className="px-3 py-4 text-cq-text-secondary">
                      Next: {row.nextStep}
                    </td>
                    <td className="px-3 py-4">
                      <ResponsibilityPill
                        responsibility={row.responsibility}
                        label={RESPONSIBILITY_LABEL[row.responsibility]}
                      />
                    </td>
                    <td className="px-5 py-4 text-right sm:px-6">
                      {row.href ? (
                        <Link href={row.href} className="btn-secondary-sm">
                          View status
                        </Link>
                      ) : (
                        <button
                          type="button"
                          className="btn-secondary-sm"
                          onClick={() => toast.message('Status opens here in production')}
                        >
                          View status
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
