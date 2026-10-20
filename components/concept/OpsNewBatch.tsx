'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { groupTitle, Page, PageHeader } from './ui'
import { hrefs } from './hrefs'
import { useConcept } from './store'
import { Stepper, fieldClass, filledBtn, labelClass } from './ops-shared'
import type { Building } from '@/lib/concept/model'

type Source = 'search' | 'describe' | 'files' | 'manual'
type Mode = Source

const MODES: Array<{ id: Mode; title: string; text: string }> = [
  { id: 'search', title: 'Search', text: 'By name, address or postcode' },
  { id: 'describe', title: 'Describe', text: 'All cinemas with a car park' },
  { id: 'files', title: 'From files', text: 'Find them in plans or site lists' },
  { id: 'manual', title: 'Add manually', text: 'A property not in CQuel yet' },
]

const SOURCE_LABEL: Record<Source, (n: number) => string> = {
  search: (n) => `${n} from search`,
  describe: (n) => `${n} from your description`,
  files: (n) => `${n} from the site list you sent`,
  manual: (n) => `${n} added manually`,
}

function matches(building: Building, query: string) {
  const hay = `${building.name} ${building.city} ${building.address ?? ''} ${building.postcode ?? ''}`.toLowerCase()
  return query.toLowerCase().split(/\s+/).filter((word) => word.length > 1).every((word) => hay.includes(word))
}

export function OpsNewBatch() {
  const { account, createBatch, addBuilding, updateBatch } = useConcept()
  const router = useRouter()
  const params = useSearchParams()
  const existing = account.batches.find((batch) => batch.id === params.get('batch'))
  const step = params.get('step') === '2' && !existing ? 2 : 1
  const [mode, setMode] = useState<Mode>('search')
  const [query, setQuery] = useState('')
  const [described, setDescribed] = useState('')
  const [describedOn, setDescribedOn] = useState(false)
  const [fileId, setFileId] = useState('')
  const [picked, setPicked] = useState<Record<string, Source>>(() =>
    Object.fromEntries((existing?.buildingIds ?? []).map((id) => [id, 'search' as Source])),
  )
  const [name, setName] = useState(existing?.name ?? '')
  const [goal, setGoal] = useState(existing?.goal ?? '')
  const [target, setTarget] = useState('')
  const [manual, setManual] = useState({ name: '', address: '', city: '', postcode: '', type: '' })

  const files = account.batches
    .filter((batch) => batch.filesSummary)
    .map((batch) => ({ id: batch.id, label: batch.filesSummary!, count: batch.filesCount, buildingIds: batch.buildingIds }))
  const chosen = account.buildings.filter((building) => picked[building.id])
  const setStep = (next: 1 | 2) => {
    const sp = new URLSearchParams(params.toString())
    if (next === 2) sp.set('step', '2')
    else sp.delete('step')
    const qs = sp.toString()
    router.replace(`${hrefs.opsNewBatch}${qs ? `?${qs}` : ''}`)
  }
  const toggle = (id: string, source: Source) => {
    setPicked((current) => {
      const next = { ...current }
      if (next[id]) delete next[id]
      else next[id] = source
      return next
    })
  }
  const addIds = (ids: string[], source: Source, on: boolean) => {
    setPicked((current) => {
      const next = { ...current }
      for (const id of ids) {
        if (on) next[id] = next[id] ?? source
        else if (next[id] === source) delete next[id]
      }
      return next
    })
  }

  const searchHits = useMemo(() => {
    const q = query.trim()
    if (!q) return account.buildings
    return account.buildings.filter((building) => matches(building, q))
  }, [account.buildings, query])
  const describeHits = useMemo(() => {
    if (!describedOn) return []
    const hits = account.buildings.filter((building) => matches(building, described))
    return hits.length ? hits : account.buildings
  }, [account.buildings, described, describedOn])
  const file = files.find((item) => item.id === fileId)
  const fileHits = file ? account.buildings.filter((building) => file.buildingIds.includes(building.id)) : []

  const summary = (['search', 'describe', 'files', 'manual'] as Source[])
    .map((source) => {
      const n = Object.values(picked).filter((item) => item === source).length
      return n ? SOURCE_LABEL[source](n) : ''
    })
    .filter(Boolean)
    .join(' · ')

  const saveExisting = () => {
    if (!existing) return
    updateBatch(existing.id, { buildingIds: chosen.map((building) => building.id) })
    router.push(hrefs.opsBatch(existing.id))
  }
  const create = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const month = target ? `${months[Number(target.slice(5, 7)) - 1]} ${target.slice(0, 4)}` : undefined
    const id = createBatch({ name: name.trim(), goal: goal.trim(), buildingIds: chosen.map((building) => building.id), route: [], target: month })
    router.push(hrefs.opsBatch(id))
  }

  return (
    <Page>
      <PageHeader
        crumbs={[{ label: account.customer, href: hrefs.ops }, { label: 'New batch' }]}
        title="New batch"
      />
      <div className="space-y-6 pb-24">
        <div className="rounded-xl border border-cq-border bg-white p-5 shadow-sm">
          <Stepper step={step} />
        </div>

        {step === 1 ? (
          <>
            <div>
              <h2 className={groupTitle}>Choose properties</h2>
              <p className="mt-1 text-sm text-cq-text-secondary">Search the customer's properties, describe the ones you want, or find them in the files they sent. You can combine all four.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {MODES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setMode(item.id)}
                  className={`rounded-xl border bg-white p-4 text-left shadow-sm ${mode === item.id ? 'border-2 border-cq-text' : 'border-cq-border'}`}
                >
                  <p className="text-sm font-semibold text-cq-text">{item.title}</p>
                  <p className="mt-1 text-sm text-cq-text-secondary">{item.text}</p>
                </button>
              ))}
            </div>

            <div className="rounded-xl border border-cq-border bg-white p-5 shadow-sm">
              {mode === 'search' && (
                <PropertySearch
                  query={query}
                  onQuery={setQuery}
                  hits={searchHits}
                  picked={picked}
                  onToggle={(id) => toggle(id, 'search')}
                  onAll={(on) => addIds(searchHits.map((building) => building.id), 'search', on)}
                />
              )}
              {mode === 'describe' && (
                <form
                  className="space-y-4"
                  onSubmit={(event) => {
                    event.preventDefault()
                    setDescribedOn(true)
                  }}
                >
                  <textarea className={fieldClass} rows={2} value={described} onChange={(event) => { setDescribed(event.target.value); setDescribedOn(false) }} placeholder="All cinemas with a car park" />
                  <button type="submit" className={filledBtn} disabled={!described.trim()}>Find properties</button>
                  {describedOn && (
                    <>
                      <p className="text-sm text-cq-text-secondary">Matched from your description — check before adding</p>
                      <PropertyList hits={describeHits} picked={picked} onToggle={(id) => toggle(id, 'describe')} onAll={(on) => addIds(describeHits.map((building) => building.id), 'describe', on)} />
                    </>
                  )}
                </form>
              )}
              {mode === 'files' && (
                <div className="space-y-4">
                  {files.length === 0 ? (
                    <p className="text-sm text-cq-text-secondary">No files from the customer yet.</p>
                  ) : (
                    <ul className="divide-y divide-cq-border-light">
                      {files.map((item) => (
                        <li key={item.id}>
                          <button type="button" className="flex w-full items-baseline justify-between gap-3 py-2 text-left" onClick={() => setFileId(item.id === fileId ? '': item.id)}> <span className="text-sm font-normal text-cq-text">{item.label}</span> <span className="text-sm text-cq-text-secondary">{item.count ? `${item.count} files` :'Received'}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  {fileHits.length > 0 && (
                    <PropertyList hits={fileHits} picked={picked} onToggle={(id) => toggle(id, 'files')} onAll={(on) => addIds(fileHits.map((building) => building.id), 'files', on)} />
                  )}
                </div>
              )}
              {mode === 'manual' && (
                <form
                  className="grid gap-3 sm:grid-cols-2"
                  onSubmit={(event) => {
                    event.preventDefault()
                    if (!manual.name.trim() || !manual.city.trim()) return
                    const id = addBuilding({
                      name: manual.name.trim(),
                      city: manual.city.trim(),
                      address: manual.address.trim() || undefined,
                      postcode: manual.postcode.trim() || undefined,
                      type: manual.type.trim() || undefined,
                    })
                    setPicked((current) => ({ ...current, [id]: 'manual' }))
                    setManual({ name: '', address: '', city: '', postcode: '', type: '' })
                  }}
                >
                  {(['name', 'address', 'city', 'postcode', 'type'] as const).map((key) => (
                    <label key={key} className="block">
                      <span className={labelClass}>{key === 'type' ? 'Property type' : key[0].toUpperCase() + key.slice(1)}</span>
                      <input className={fieldClass} value={manual[key]} onChange={(event) => setManual((current) => ({ ...current, [key]: event.target.value }))} />
                    </label>
                  ))}
                  <div className="sm:col-span-2">
                    <button type="submit" className={filledBtn} disabled={!manual.name.trim() || !manual.city.trim()}>Add property</button>
                  </div>
                </form>
              )}
            </div>

            <section className="rounded-xl border border-cq-border bg-white shadow-sm">
              <header className="flex flex-wrap items-center justify-between gap-3 border-b border-cq-border-light px-5 py-4">
                <h2 className={groupTitle}>In this batch · {chosen.length} {chosen.length === 1 ? 'property' : 'properties'}</h2> {summary && <p className="text-sm text-cq-text-secondary">{summary}</p>} </header> {chosen.length === 0 ? ( <p className="px-5 py-8 text-sm text-cq-text-secondary">No properties added yet.</p> ) : ( <ul className="grid sm:grid-cols-2"> {chosen.map((building) => ( <li key={building.id} className="flex items-start justify-between gap-3 border-t border-cq-border-light px-5 py-3"> <div> <p className="text-sm font-normal text-cq-text">{building.name}</p> <p className="text-sm text-cq-muted">{building.address || building.city}</p> </div> <button type="button" className="text-sm text-cq-muted hover:text-cq-text" onClick={() => toggle(building.id, picked[building.id])}>Remove</button> </li> ))} </ul> )} </section> </> ) : ( <> <div> <h2 className={groupTitle}>Name and goal</h2> <p className="mt-1 text-sm text-cq-text-secondary">In the customer's words. The goal is what they'll see at the top of the batch page.</p>
            </div>
            <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
              <section className="rounded-xl border border-cq-border bg-white p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-cq-text">Batch</h3>
                <div className="mt-4 space-y-4">
                  <label className="block">
                    <span className={labelClass}>Name</span>
                    <input className={fieldClass} value={name} onChange={(event) => setName(event.target.value)} />
                  </label>
                  <label className="block">
                    <span className={labelClass}>Goal</span>
                    <textarea className={fieldClass} rows={4} value={goal} onChange={(event) => setGoal(event.target.value)} placeholder="E.g. Cut carbon emissions by 60% by 2030, starting with the sites with the shortest payback" />
                  </label>
                  <label className="block">
                    <span className={labelClass}>Target (optional)</span>
                    <input type="month" className={fieldClass} value={target} onChange={(event) => setTarget(event.target.value)} />
                    <p className="mt-1 text-xs text-cq-text-secondary">Only if the customer gave one.</p>
                  </label>
                </div>
              </section>
              <section className="rounded-xl border border-cq-border bg-white p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-cq-text">Next</h3>
                <ol className="mt-4 space-y-4 text-sm">
                  <li>
                    <p className="font-semibold text-cq-text">{chosen.length} {chosen.length === 1 ? 'property' : 'properties'}</p>
                    <p className="text-cq-text-secondary">{chosen.map((building) => building.name).join(', ')}</p> </li> <li> <p className="font-semibold text-cq-text">Then add workstreams</p> <p className="text-cq-text-secondary">Each one runs one service for one solution on some of these properties.</p> </li> <li> <p className="font-semibold text-cq-text">The customer sees nothing yet</p> <p className="text-cq-text-secondary">The batch appears for them once you share the plan.</p> </li> </ol> </section> </div> </> )} </div> <div className="sticky bottom-0 -mx-0 border-t border-cq-border bg-white"> <div className="flex items-center justify-end gap-3 py-4"> {step === 1 ? ( <> <Link href={existing ? hrefs.opsBatch(existing.id) : hrefs.ops} className="btn-secondary">Cancel</Link> {existing ? ( <button type="button" className={filledBtn} disabled={chosen.length === 0} onClick={saveExisting}>Save properties</button> ) : ( <button type="button" className={filledBtn} disabled={chosen.length === 0} onClick={() => setStep(2)}>Next: name and goal</button> )} </> ) : ( <> <button type="button" className="btn-secondary" onClick={() => setStep(1)}>Back</button> <button type="button" className={filledBtn} disabled={!name.trim() || !goal.trim()} onClick={create}>Create batch</button> </> )} </div> </div> </Page> ) } function PropertySearch({ query, onQuery, hits, picked, onToggle, onAll }: { query: string; onQuery: (value: string) => void; hits: Building[]; picked: Record<string, Source>; onToggle: (id: string) => void; onAll: (on: boolean) => void }) { return ( <div className="space-y-3"> <input type="search" className={fieldClass} value={query} onChange={(event) => onQuery(event.target.value)} placeholder="Search by name, address or postcode" aria-label="Search properties" /> <PropertyList hits={hits} picked={picked} onToggle={onToggle} onAll={onAll} /> </div> ) } function PropertyList({ hits, picked, onToggle, onAll }: { hits: Building[]; picked: Record<string, Source>; onToggle: (id: string) => void; onAll: (on: boolean) => void }) { const all = hits.length > 0 && hits.every((building) => picked[building.id])
return ( <div> <div className="mb-2 flex justify-end"> <button type="button" className="text-sm font-normal text-cq-text underline underline-offset-2" onClick={() => onAll(!all)}>{all ?'Clear' : 'Select all'}</button>
      </div>
      <ul className="max-h-72 divide-y divide-cq-border-light overflow-y-auto">
        {hits.map((building) => (
          <li key={building.id}>
            <label className="flex items-center gap-3 py-2 text-sm">
              <input type="checkbox" className="accent-[var(--cq-text)]" checked={Boolean(picked[building.id])} onChange={() => onToggle(building.id)} />
              <span className="min-w-0 flex-1 text-cq-text">{building.name}</span>
              {building.type && <span className="text-cq-text-secondary">{building.type}</span>}
            </label>
          </li>
        ))}
        {hits.length === 0 && <li className="py-3 text-sm text-cq-text-secondary">No properties match.</li>}
      </ul>
    </div>
  )
}
