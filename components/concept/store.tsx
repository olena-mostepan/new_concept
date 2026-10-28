'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { ACCOUNTS } from '@/lib/concept/data'
import type { CustomerDeliveryPayload, CustomerProject } from '@/lib/customer/delivery/types'
import { HISTORY_TODAY, splitDeliveryId, writeDelivery } from '@/lib/concept/delivery'
import { checkPhases } from '@/lib/concept/derive'
import { SERVICES, TODAY, service, type Account, type Batch, type Building, type Doc, type Need, type ServiceId, type SolutionId, type Workstream } from '@/lib/concept/model'

/**
 * Prototype state: both accounts, the selected one, and the few writes ops and
 * customers can make. Kept in memory — a reload resets the example data.
 */
interface Store {
  accounts: Account[]
  account: Account
  setAccountId: (id: string) => void
  createBatch: (input: { name: string; goal: string; buildingIds: string[]; route: ServiceId[]; target?: string }) => string
  addBuilding: (input: Omit<Building, 'id'>) => string
  updateBatch: (batchId: string, patch: Partial<Pick<Batch, 'name' | 'goal' | 'target' | 'buildingIds'>>) => void
  addWorkstreams: (input: { batchId: string; solution: SolutionId; services: Array<{ service: ServiceId; name: string }>; buildingIds: string[]; lead: string; needs: Need[]; documents: Doc[] }) => string[]
  updateWorkstream: (workstreamId: string, patch: { name: string; service: ServiceId; solution: SolutionId; buildingIds: string[]; lead: string; needs: Need[]; documents: Doc[] }) => void
  removeWorkstream: (workstreamId: string) => void
  setPlanState: (batchId: string, state: Batch['planState']) => void
  agreePlan: (batchId: string) => void
  decide: (workstreamId: string, buildingId: string, choice: 'go' | 'no') => void
  agreeScope: (workstreamId: string, buildingId: string) => void
  saveDelivery: (next: CustomerDeliveryPayload | CustomerProject) => void
}

const Ctx = createContext<Store | null>(null)
const KEY = 'cq-concept-account'
const clone = <T,>(x: T): T => JSON.parse(JSON.stringify(x))

export function ConceptStoreProvider({ children }: { children: ReactNode }) {
  const [accounts, setAccounts] = useState<Account[]>(() => clone(ACCOUNTS))
  const [accountId, setId] = useState(ACCOUNTS[0].id)

  useEffect(() => {
    try {
      const fromUrl = new URLSearchParams(window.location.search).get('account')
      const saved = fromUrl ?? window.localStorage.getItem(KEY)
      if (saved && ACCOUNTS.some((a) => a.id === saved)) setId(saved)
    } catch {}
  }, [])

  useEffect(() => {
    const current = accounts.find((item) => item.id === accountId) ?? accounts[0]
    checkPhases(current)
  }, [accounts, accountId])

  const setAccountId = (id: string) => {
    setId(id)
    try {
      window.localStorage.setItem(KEY, id)
    } catch {}
  }

  const update = (fn: (a: Account) => void) =>
    setAccounts((all) =>
      all.map((a) => {
        if (a.id !== accountId) return a
        const next = clone(a)
        fn(next)
        return next
      }),
    )

  const today = TODAY.split(' ').slice(0, 2).join(' ')
  const account = accounts.find((a) => a.id === accountId) ?? accounts[0]

  const store: Store = {
    accounts,
    account,
    setAccountId,
    createBatch: ({ name, goal, buildingIds, route, target }) => {
      const id = `batch-${Date.now().toString(36)}`
      update((a) => {
        a.batches.push({ id, name, goal, buildingIds, route, target: target || undefined, planState: 'draft', createdOn: TODAY })
        a.activity.unshift({ date: today, title: 'Batch created', text: `${buildingIds.length} ${buildingIds.length === 1 ? 'property' : 'properties'}`, batchId: id })
      })
      return id
    },
    addBuilding: (input) => {
      const id = `p-${Date.now().toString(36)}`
      update((a) => {
        a.buildings.push({ id, ...input })
      })
      return id
    },
    updateBatch: (batchId, patch) =>
      update((a) => {
        const b = a.batches.find((x) => x.id === batchId)
        if (!b) return
        Object.assign(b, patch)
      }),
    addWorkstreams: ({ batchId, solution, services: chosen, buildingIds, lead, needs, documents }) => {
      const ids = chosen.map((item) => `ws-${Date.now().toString(36)}-${item.service}`)
      update((a) => {
        const b = a.batches.find((x) => x.id === batchId)
        if (!b) return
        chosen.forEach((item, index) => {
          if (!b.route.includes(item.service)) {
            b.route = SERVICES.map((s) => s.id).filter((id) => b.route.includes(id) || id === item.service)
          }
          const open = needs.filter((need) => need.label.trim())
          const ws: Workstream = {
            id: ids[index],
            batchId,
            name: item.name,
            service: item.service,
            solution,
            owner: open.length ? 'you' : 'cquel',
            proposed: b.planState !== 'live',
            startedOn: TODAY,
            now: '',
            needs: open.map((need) => ({ label: need.label.trim(), why: '', owner: 'you', since: TODAY })),
            documents: documents.map((doc) => ({ ...doc })),
            projects: buildingIds.map((buildingId) => ({ buildingId, step: 0 })),
            phases: b.planState === 'live'
              ? [{ service: item.service, state: 'now', startedOn: TODAY }]
              : [{ service: item.service, state: 'planned' }],
            lead,
          }
          a.workstreams.push(ws)
          a.activity.unshift({ date: today, title: 'Workstream added', text: `${ws.name}, ${service(ws.service).label}, ${buildingIds.length} ${buildingIds.length === 1 ? 'property' : 'properties'}`, batchId })
        })
      })
      return ids
    },
    updateWorkstream: (workstreamId, patch) =>
      update((a) => {
        const w = a.workstreams.find((item) => item.id === workstreamId)
        const b = w && a.batches.find((item) => item.id === w.batchId)
        if (!w || !b) return
        if (!b.route.includes(patch.service)) {
          b.route = SERVICES.map((s) => s.id).filter((id) => b.route.includes(id) || id === patch.service)
        }
        const kept = new Set(patch.buildingIds)
        const previous = w.service
        w.name = patch.name
        w.service = patch.service
        const phase = w.phases.find((item) => item.service === previous)
        if (phase) phase.service = patch.service
        w.phases.sort((a, b) => SERVICES.findIndex((item) => item.id === a.service) - SERVICES.findIndex((item) => item.id === b.service))
        w.solution = patch.solution
        w.lead = patch.lead
        w.needs = patch.needs.filter((need) => need.label.trim()).map((need) => ({ label: need.label.trim(), why: need.why, owner: 'you' as const, since: need.since || TODAY }))
        w.documents = patch.documents
        w.owner = w.needs.some((need) => !need.received) ? 'you' : w.owner === 'you' ? 'cquel' : w.owner
        w.projects = [
          ...w.projects.filter((project) => kept.has(project.buildingId)),
          ...patch.buildingIds.filter((id) => !w.projects.some((project) => project.buildingId === id)).map((buildingId) => ({ buildingId, step: 0 })),
        ]
      }),
    removeWorkstream: (workstreamId) =>
      update((a) => {
        a.workstreams = a.workstreams.filter((item) => item.id !== workstreamId)
      }),
    setPlanState: (batchId, state) =>
      update((a) => {
        const b = a.batches.find((x) => x.id === batchId)!
        b.planState = state
        if (state === 'proposed') {
          b.planProposed = TODAY
          a.activity.unshift({ date: today, title: 'Plan proposed', text: (() => { const n = a.workstreams.filter((w) => w.batchId === batchId).length; return `${n} ${n === 1 ? 'workstream' : 'workstreams'} planned for ${b.name}.` })(), batchId })
        }
        if (state === 'agreed') b.planAgreed = TODAY
      }),
    decide: (workstreamId, buildingId, choice) =>
      update((a) => {
        const w = a.workstreams.find((x) => x.id === workstreamId)
        const row = w?.projects.find((x) => x.buildingId === buildingId)
        if (!w || !row || row.decision !== 'waiting') return
        const decisionStep = service(w.service).steps.indexOf('Decision')
        row.decision = choice
        row.decidedOn = TODAY
        if (decisionStep >= 0) row.step = decisionStep
      }),
    agreeScope: (workstreamId, buildingId) =>
      update((a) => {
        const w = a.workstreams.find((x) => x.id === workstreamId)
        const row = w?.projects.find((x) => x.buildingId === buildingId)
        if (!w || !row || row.decision !== 'waiting') return
        const agreed = service(w.service).steps.indexOf('Scope agreed')
        row.decision = 'go'
        row.decidedOn = TODAY
        row.gap = undefined
        if (agreed >= 0) row.step = agreed
        if (agreed >= 0 && w.projects.every((p) => p.step === agreed)) {
          w.owner = 'done'
          w.completedOn = TODAY
        }
      }),
    saveDelivery: (next) =>
      update((a) => {
        const projects = 'projects' in next ? next.projects : [next]
        for (const project of projects) {
          const parts = splitDeliveryId(project.id)
          const w = parts && a.workstreams.find((item) => item.id === parts.workstreamId)
          const row = w?.projects.find((item) => item.buildingId === parts?.buildingId)
          if (!w || !row || !parts) continue
          const added = writeDelivery(row, project)
          if (added) row.history = [{ event: added.event, detail: 'Confirmed.', date: HISTORY_TODAY }, ...(row.history ?? [])]
        }
      }),
    agreePlan: (batchId) =>
      update((a) => {
        const b = a.batches.find((x) => x.id === batchId)!
        b.planState = 'live'
        if (!b.planAgreed) b.planAgreed = TODAY
        b.planLive = TODAY
        a.workstreams
          .filter((w) => w.batchId === batchId && w.proposed)
          .forEach((w) => {
            w.proposed = false
            w.startedOn = TODAY
            const phase = w.phases.find((item) => item.service === w.service)
            if (phase) {
              phase.state = 'now'
              phase.startedOn = TODAY
            }
            w.owner = w.needs.some((n) => !n.received && n.owner === 'you') ? 'you' : 'cquel'
            const open = w.needs.find((n) => !n.received)
            w.now = open?.label ?? 'Estimates in progress'
          })
      }),
  }

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>
}

export function useConcept() {
  const s = useContext(Ctx)
  if (!s) throw new Error('useConcept outside ConceptStoreProvider')
  return s
}
