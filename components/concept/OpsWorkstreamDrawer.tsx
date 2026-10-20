'use client'

import { useRef, useState } from 'react'
import { X } from 'lucide-react'
import { SERVICES, service as serviceDef, type Batch, type Doc, type Need, type ServiceId, type SolutionId, type Workstream } from '@/lib/concept/model'
import { getBuilding } from '@/lib/concept/derive'
import { useConcept } from './store'
import { SERVICE_LINES, SOLUTION_OPTIONS, fieldClass, filledBtn, labelClass, solutionLabel, workstreamName } from './ops-shared'

export function OpsWorkstreamDrawer({
  batch,
  editing,
  onClose,
  onSaved,
}: {
  batch: Batch
  editing?: Workstream
  onClose: () => void
  onSaved: (ids: string[]) => void
}) {
  const { account, addWorkstreams, updateWorkstream } = useConcept()
  const fileRef = useRef<HTMLInputElement>(null)
  const leads = [...new Set([batch.lead, ...account.workstreams.map((item) => item.lead)].filter((lead): lead is string => Boolean(lead)))]
  const [solution, setSolution] = useState<SolutionId>(editing?.solution ?? 'solar')
  const [services, setServices] = useState<ServiceId[]>(editing ? [editing.service] : [])
  const [ids, setIds] = useState<string[]>(editing ? editing.projects.map((project) => project.buildingId) : batch.buildingIds)
  const [lead, setLead] = useState(editing?.lead ?? batch.lead ?? leads[0] ?? '')
  const [needs, setNeeds] = useState<string[]>(editing?.needs.length ? editing.needs.map((need) => need.label) : [''])
  const [documents, setDocuments] = useState<Doc[]>(editing?.documents ?? [])
  const sent = account.batches.reduce((sum, item) => sum + (item.filesCount ?? 0), 0)
  const bundles = account.batches.filter((item) => item.filesSummary)

  const toggleService = (id: ServiceId) => {
    setServices((current) => {
      if (editing) return [id]
      return current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    })
  }
  const toggleProperty = (id: string) => {
    setIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]))
  }
  const others = account.workstreams.filter((item) => item.batchId === batch.id && item.id !== editing?.id)
  const preview = services.map((id) => ({
    id,
    name: editing && editing.solution === solution && editing.service === id ? editing.name : workstreamName(solution, id, others),
    step: serviceDef(id).steps[0],
  }))
  const ready = Boolean(solution) && services.length > 0 && ids.length > 0
  const openNeeds = needs.map((label) => label.trim()).filter(Boolean).map((label): Need => ({ label, why: '', owner: 'you' }))

  const save = () => {
    const docs = documents
    if (editing) {
      const item = preview[0]
      updateWorkstream(editing.id, {
        name: item?.name ?? editing.name,
        service: services[0],
        solution,
        buildingIds: ids,
        lead,
        needs: openNeeds,
        documents: docs,
      })
      onSaved([editing.id])
      return
    }
    const created = addWorkstreams({
      batchId: batch.id,
      solution,
      services: preview.map((item) => ({ service: item.id, name: item.name })),
      buildingIds: ids,
      lead,
      needs: openNeeds,
      documents: docs,
    })
    onSaved(created)
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
      <button type="button" className="absolute inset-0 cursor-default" aria-label="Close" onClick={onClose} />
      <aside className="relative flex h-full w-full max-w-[640px] flex-col bg-white shadow-xl">
        <div className="flex items-start justify-between gap-4 border-b border-cq-border-light px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-cq-text">{editing ? 'Edit workstream' : 'Add workstream'}</h2>
            <p className="mt-1 text-sm text-cq-text-secondary">Choose a solution, the services CQuel runs for it, and the properties it covers.</p>
          </div>
          <button type="button" className="text-cq-text" aria-label="Close" onClick={onClose}><X className="h-5 w-5" /></button>
        </div>
        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
          <label className="block">
            <span className={labelClass}>Solution</span>
            <select className={fieldClass} value={solution} onChange={(event) => setSolution(event.target.value as SolutionId)}>
              {SOLUTION_OPTIONS.map((item) => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </select>
          </label>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-cq-text-secondary">Services</p>
            <p className="mt-1 text-sm text-cq-text-secondary">Choose one or more. Each service becomes its own workstream.</p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {SERVICES.map((item) => {
                const on = services.includes(item.id)
                const inRoute = batch.route.includes(item.id)
                return (
                  <button key={item.id} type="button" onClick={() => toggleService(item.id)} className={`rounded-xl border p-3 text-left ${on ? 'border-2 border-cq-text' : 'border-cq-border'}`}>
                    <p className="text-sm font-semibold text-cq-text">{item.label}</p>
                    <p className="mt-1 text-sm text-cq-text-secondary">{SERVICE_LINES[item.id]}</p>
                    {!inRoute && <p className="mt-1 text-xs text-cq-muted">(not in the route yet — adding it adds it to the route)</p>}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-cq-text-secondary">Properties · {ids.length} of {batch.buildingIds.length} selected</p>
              <button type="button" className="text-sm font-normal underline underline-offset-2" onClick={() => setIds(ids.length === batch.buildingIds.length ? [] : batch.buildingIds)}>
                {ids.length === batch.buildingIds.length ? 'Clear' : 'Select all'}
              </button>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {batch.buildingIds.map((id) => {
                const building = getBuilding(account, id)
                const on = ids.includes(id)
                return (
                  <button key={id} type="button" onClick={() => toggleProperty(id)} className={`rounded-xl border p-3 text-left ${on ? 'border-2 border-cq-text' : 'border-cq-border'}`}>
                    <p className="text-sm font-normal text-cq-text">{building.name}</p>
                    <p className="text-sm text-cq-text-secondary">{building.postcode || building.city}</p>
                  </button>
                )
              })}
            </div>
          </div>

          <label className="block">
            <span className={labelClass}>Lead</span>
            <select className={fieldClass} value={lead} onChange={(event) => setLead(event.target.value)}>
              {leads.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </label>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-cq-text-secondary">What we need from the customer (optional)</p>
            <p className="mt-1 text-sm text-cq-text-secondary">Shown on their batch page under this service. They reply by email.</p>
            <div className="mt-3 space-y-2">
              {needs.map((need, index) => (
                <input key={index} className={fieldClass} value={need} onChange={(event) => setNeeds(needs.map((item, i) => (i === index ? event.target.value : item)))} />
              ))}
              <button type="button" className="text-sm font-normal text-cq-text" onClick={() => setNeeds([...needs, ''])}>+ Add another</button>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-cq-text-secondary">Documents (optional)</p>
            <p className="mt-1 text-sm text-cq-text-secondary">Drawings, specs or an incumbent quote. With several services, each workstream gets a copy.</p>
            <button
              type="button"
              className="mt-3 w-full rounded-xl border border-dashed border-cq-border px-4 py-6 text-sm text-cq-text-secondary"
              onClick={() => fileRef.current?.click()}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault()
                const files = [...event.dataTransfer.files]
                setDocuments((current) => [...current, ...files.map((file) => ({ name: file.name, meta: 'Added from this form' }))])
              }}
            >
              Drop files here or browse{sent > 0 ? ` · or pick from the ${sent} files the customer sent` : ''}
            </button>
            <input ref={fileRef} type="file" multiple className="hidden" onChange={(event) => {
              const files = [...(event.target.files ?? [])]
              setDocuments((current) => [...current, ...files.map((file) => ({ name: file.name, meta: 'Added from this form' }))])
              event.target.value = ''
            }} />
            {bundles.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {bundles.map((item) => (
                  <button key={item.id} type="button" className="rounded-full border border-cq-border px-3 py-1 text-xs text-cq-text" onClick={() => setDocuments((current) => current.some((doc) => doc.name === item.filesSummary) ? current : [...current, { name: item.filesSummary!, meta: item.filesCount ? `${item.filesCount} files` : 'Received' }])}>
                    {item.filesSummary}
                  </button>
                ))}
              </div>
            )}
            {documents.length > 0 && (
              <ul className="mt-3 space-y-1 text-sm text-cq-text-secondary">
                {documents.map((doc) => (
                  <li key={doc.name}>{doc.name}</li>
                ))}
              </ul>
            )}
          </div>

          {preview.length > 0 && (
            <div className="rounded-xl bg-cq-bg p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-cq-text-secondary">This creates</p>
              <ul className="mt-3 space-y-3">
                {preview.map((item) => (
                  <li key={item.id}>
                    <p className="text-sm font-semibold text-cq-text">{item.name}</p>
                    <p className="text-sm text-cq-text-secondary">{ids.length} projects · starts at {item.step} · name can be changed later</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="flex items-center justify-end gap-3 border-t border-cq-border-light px-6 py-4">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button type="button" className={filledBtn} disabled={!ready} onClick={save}>
            {editing ? 'Save changes' : services.length > 1 ? `Add ${services.length} workstreams` : 'Add workstream'}
          </button>
        </div>
      </aside>
    </div>
  )
}

export function exclusionLine(name: string, solution: SolutionId, exclusion?: string) {
  if (!exclusion || !exclusion.includes(name)) return ''
  const reason = exclusion.split('—')[1]?.trim()
  const what = solution === 'solar' ? 'solar' : solutionLabel(solution)
  return reason ? `No ${what} — ${reason}` : exclusion
}
