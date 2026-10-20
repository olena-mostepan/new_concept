'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronDown } from 'lucide-react'
import { service as serviceDef, type Batch, type Owner, type SolutionId } from '@/lib/concept/model'
import { getBuilding, openNeeds, short, wsIn } from '@/lib/concept/derive'
import { OwnerPill, Page, PageHeader, groupTitle } from './ui'
import { PlanSteps } from './ops-bits'
import { filledBtn } from './ops-shared'
import { exclusionLine, OpsWorkstreamDrawer } from './OpsWorkstreamDrawer'
import { hrefs } from './hrefs'
import { useConcept } from './store'
import { cn } from '@/lib/utils'

const WITH: Record<Exclude<Owner, 'done'>, string> = {
  you: 'With customer',
  cquel: 'With CQuel',
  suppliers: 'With suppliers',
}

function propertyMeta(building: { city: string; postcode?: string; type?: string }) {
  return [building.city, building.postcode, building.type].filter(Boolean).join(' · ')
}

export function OpsBatch({ id }: { id: string }) {
  const { account, setPlanState, agreePlan, removeWorkstream } = useConcept()
  const router = useRouter()
  const params = useSearchParams()
  const batch = account.batches.find((item) => item.id === id)
  const streams = batch ? wsIn(account, batch.id) : []
  const firstId = streams[0]?.id ?? null
  const [openId, setOpenId] = useState<string | null>(firstId)
  useEffect(() => {
    setOpenId(firstId)
  }, [id, firstId])
  if (!batch) {
    return (
      <Page>
        <PageHeader crumbs={[{ label: account.customer, href: hrefs.ops }]} title="Batch not found" />
      </Page>
    )
  }
  const editingId = params.get('edit')
  const adding = params.get('add') === 'workstream'
  const editing = streams.find((item) => item.id === editingId)
  const drawer = adding || Boolean(editing)
  const setQuery = (next: Record<string, string | null>) => {
    const sp = new URLSearchParams(params.toString())
    for (const [key, value] of Object.entries(next)) {
      if (value) sp.set(key, value)
      else sp.delete(key)
    }
    const qs = sp.toString()
    router.replace(`${hrefs.opsBatch(batch.id)}${qs ? `?${qs}` : ''}`)
  }
  const close = () => setQuery({ add: null, edit: null })
  const plan = planCopy(batch, streams.length)
  const meta = [
    `${streams.length} ${streams.length === 1 ? 'workstream' : 'workstreams'}`,
    `${batch.buildingIds.length} ${batch.buildingIds.length === 1 ? 'property' : 'properties'}`,
    batch.filesReceived ? `files received ${short(batch.filesReceived)}` : '',
  ].filter(Boolean).join(' · ')

  return (
    <Page>
      <PageHeader
        crumbs={[{ label: account.customer, href: hrefs.ops }, { label: batch.name }]}
        title={batch.name}
        meta={<>{batch.goal}{batch.target ? ` · by ${batch.target}` : ''}</>}
        actions={<Link href={hrefs.batch(batch.id)} className="btn-secondary">Customer view</Link>}
      />
      <div className="space-y-6">
        <section className={cn('rounded-xl border bg-white p-5 shadow-sm', batch.planState === 'live' ? 'border-cq-border' : 'border-2 border-cq-text')}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-cq-text-secondary">Plan</p>
              <p className="text-sm text-cq-text">{plan.line}</p>
              <PlanSteps state={batch.planState} />
            </div>
            <p className="text-sm text-cq-muted">{meta}</p>
            {plan.action && (
              <button type="button" className={filledBtn} disabled={plan.disabled} onClick={plan.action === 'share' ? () => setPlanState(batch.id, 'proposed') : plan.action === 'agree' ? () => setPlanState(batch.id, 'agreed') : () => agreePlan(batch.id)}>
                {plan.label}
              </button>
            )}
          </div>
        </section>

        <section className="overflow-hidden rounded-xl border border-cq-border bg-white shadow-sm">
          <header className="flex items-center justify-between gap-3 border-b border-cq-border-light px-5 py-4">
            <h2 className={groupTitle}>Workstreams ({streams.length})</h2>
            <button type="button" className="btn-secondary-sm" onClick={() => setQuery({ add: 'workstream', edit: null })}>
              + Add workstream
            </button>
          </header>
          {streams.length === 0 ? (
            <div className="px-5 py-8">
              <p className="text-sm text-cq-text-secondary">No workstreams yet. Add one to run a service for a solution on some of the batch's properties.</p>
              <button type="button" className="btn-secondary-sm mt-3" onClick={() => setQuery({ add: 'workstream', edit: null })}>+ Add workstream</button>
            </div>
          ) : (
            <ul>
              {streams.map((stream) => {
                const need = openNeeds(stream)[0]
                const open = openId === stream.id
                const inPlan = batch.planState === 'draft' || batch.planState === 'proposed'
                return (
                  <li key={stream.id} className="border-t border-cq-border-light first:border-t-0">
                    <div className="flex items-start gap-3 px-5 py-4">
                      <button type="button" className="mt-1 text-cq-text" aria-expanded={open} aria-label={open ? 'Collapse' : 'Expand'} onClick={() => setOpenId(open ? null : stream.id)}>
                        <ChevronDown className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} />
                      </button>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-cq-text">{stream.name}</p>
                        <p className="text-sm text-cq-text-secondary">{solutionName(stream.solution)} · {stream.projects.length} {stream.projects.length === 1 ? 'property' : 'properties'} · lead {stream.lead}</p>
                      </div>
                      <div className="hidden min-w-0 sm:block sm:w-56">
                        {need ? (
                          <>
                            <p className="truncate text-sm text-cq-text">{need.label}</p>
                            <p className="text-sm text-cq-text-secondary">{WITH[need.owner]}</p>
                          </>
                        ) : (
                          <p className="text-sm text-cq-muted">—</p>
                        )}
                      </div>
                      <div className="shrink-0">
                        {inPlan ? (
                          <span className="text-sm text-cq-text-secondary">In plan</span>
                        ) : (
                          <OwnerPill owner={stream.owner} label={stream.owner === 'done' ? 'Done' : WITH[stream.owner]} className={stream.owner === 'you' ? 'bg-cq-text text-white': undefined} /> )} </div> <button type="button" className="shrink-0 text-sm font-semibold text-cq-text" onClick={() => setQuery({ add: null, edit: stream.id })}>Edit</button> <button type="button" className="shrink-0 text-sm text-cq-muted hover:text-cq-text" onClick={() => removeWorkstream(stream.id)}>Remove</button> </div> {open && ( <div className="bg-cq-bg px-5 py-4"> <p className="text-xs font-semibold uppercase tracking-wide text-cq-text-secondary">Properties</p> <ul className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4"> {stream.projects.map((project) => { const building = getBuilding(account, project.buildingId)
return ( <li key={project.buildingId} className="rounded-lg bg-white px-3 py-2"> <p className="text-sm font-semibold text-cq-text">{building.name}</p> <p className="text-sm text-cq-text-secondary">{building.city}</p> </li> ) })} </ul> </div> )} </li> ) })} </ul> )} </section> <section className="overflow-hidden rounded-xl border border-cq-border bg-white shadow-sm"> <header className="flex items-center justify-between gap-3 border-b border-cq-border-light px-5 py-4"> <h2 className={groupTitle}>Properties ({batch.buildingIds.length})</h2> <Link href={`${hrefs.opsNewBatch}?batch=${batch.id}`} className="btn-secondary-sm">+ Add properties</Link> </header> <ul> {batch.buildingIds.map((buildingId) => { const building = getBuilding(account, buildingId)
const mine = streams.filter((stream) => stream.projects.some((project) => project.buildingId === buildingId))
const reason = streams.map((stream) => exclusionLine(building.name, stream.solution, stream.exclusion)).find(Boolean)
return ( <li key={buildingId} className="grid items-center gap-3 border-t border-cq-border-light px-5 py-3 first:border-t-0 md:grid-cols-[minmax(12rem,1fr)_minmax(0,1.2fr)_minmax(0,1.4fr)]"> <div className="min-w-0"> <p className="font-semibold text-cq-text">{building.name}</p> <p className="text-sm text-cq-text-secondary">{propertyMeta(building)}</p> </div> <p className="text-sm text-cq-muted">{reason}</p> <div className="flex flex-wrap justify-start gap-1.5 md:justify-end"> {mine.map((stream) => ( <span key={stream.id} className="rounded-md border border-cq-border px-2 py-1 text-xs text-cq-text"> {stream.name} · {serviceDef(stream.service).label} </span> ))} {mine.length === 0 && !reason && <span className="text-sm text-cq-muted">No workstream yet</span>} </div> </li> ) })} </ul> </section> </div> {drawer && ( <OpsWorkstreamDrawer key={editing?.id ??'new'}
          batch={batch}
          editing={editing}
          onClose={close}
          onSaved={(ids) => {
            setOpenId(ids[0] ?? null)
            close()
          }}
        />
      )}
    </Page>
  )
}

function solutionName(id: SolutionId) {
  return id === 'ev' ? 'EV charging' : id === 'solar' ? 'Solar PV' : id === 'ashp' ? 'Air source heat pump' : id === 'led' ? 'LED' : 'Generic'
}

function planCopy(batch: Batch, count: number): { line: string; label?: string; action?: 'share' | 'agree' | 'start'; disabled?: boolean } {
  if (batch.planState === 'draft') return { line: 'Draft — not shared with the customer', label: 'Share plan with customer', action: 'share', disabled: count === 0 }
  if (batch.planState === 'proposed') return { line: `Proposed to the customer ${short(batch.planProposed)} — waiting for them to agree`, label: 'Mark plan agreed', action: 'agree' }
  if (batch.planState === 'agreed') return { line: `Agreed ${short(batch.planAgreed)}`, label: 'Start workstreams', action: 'start' }
  return { line: `Live since ${short(batch.planLive || batch.planAgreed)}` }
}
