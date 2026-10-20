'use client'

import Link from 'next/link'
import { decisionLabel, getBuilding, money, moneyOne, paybackLabel, scopeDecisionLabel, short, visitStateLabel } from '@/lib/concept/derive'
import { service, type ProjectRow, type Workstream } from '@/lib/concept/model'
import { td, th } from './ui'
import { DecisionButtons } from './DecisionButtons'
import { hrefs } from './hrefs'
import { useConcept } from './store'
import { cn } from '@/lib/utils'

export function ProjectsTable({ w }: { w: Workstream }) {
  const { account, agreeScope, decide } = useConcept()
  const steps = service(w.service).steps
  if (w.service === 'pricing') {
    const showPrice = w.projects.some((row) => row.price)
    const showAnalysis = w.projects.some((row) => row.analysis)
    const showDecision = w.projects.some((row) => row.decision)
    const decided = (row: ProjectRow) => (row.decision === 'no' ? `Not now · ${short(row.decidedOn)}` : `Agreed · ${short(row.decidedOn)}`)
    return (
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px]">
          <thead className="border-b border-cq-border-light">
            <tr>
              <th className={th}>Project</th>
              <th className={th}>Step</th>
              {showPrice && <th className={th}>Price</th>}
              {showAnalysis && <th className={th}>Analysis</th>}
              {showDecision && <th className={th}>Decision</th>}
              <th className={th} />
            </tr>
          </thead>
          <tbody>
            {w.projects.map((row) => {
              const building = getBuilding(account, row.buildingId)
              const waiting = row.decision === 'waiting'
              return (
                <tr key={row.buildingId} className="border-t border-cq-border-light">
                  <td className={td}>
                    <span className="font-normal">{building.name}</span>
                    <span className="mt-0.5 block text-cq-text-secondary">{building.city}</span>
                  </td>
                  <td className={td}>{w.owner === 'done' ? 'Done' : steps[row.step]}</td>
                  {showPrice && <td className={td}>{row.price ? moneyOne(row.price) : '—'}</td>}
                  {showAnalysis && (
                    <td className={cn(td, row.analysisStrong ? 'font-semibold' : 'text-cq-text-secondary')}>{row.analysis ?? '—'}</td>
                  )}
                  {showDecision && (
                    <td className={td}>
                      {waiting ? (
                        <DecisionButtons goLabel="Agree price" onGo={() => decide(w.id, row.buildingId, 'go')} onNotNow={() => decide(w.id, row.buildingId, 'no')} />
                      ) : row.decision ? (
                        decided(row)
                      ) : (
                        '—'
                      )}
                    </td>
                  )}
                  <td className={td}>
                    <Link href={hrefs.project(w.id, row.buildingId)} className="btn-secondary-sm">
                      View
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    )
  }
  if (w.service === 'tender') {
    return (
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px]">
          <thead className="border-b border-cq-border-light">
            <tr>
              <th className={th}>Project</th>
              <th className={th}>Step</th>
              <th className={th}>Size</th>
              <th className={th}>Brief</th>
              <th className={th}>Site check</th>
              <th className={th} />
            </tr>
          </thead>
          <tbody>
            {w.projects.map((row) => {
              const building = getBuilding(account, row.buildingId)
              const check = row.visit?.state === 'done' && row.visit.on ? `Done ${short(row.visit.on)}` : row.visit?.state === 'skip' ? 'Not needed' : '—'
              return (
                <tr key={row.buildingId} className="border-t border-cq-border-light">
                  <td className={td}>
                    <span className="font-normal">{building.name}</span>
                    <span className="mt-0.5 block text-cq-text-secondary">{building.city}</span>
                  </td>
                  <td className={td}>{steps[row.step]}</td>
                  <td className={td}>{row.sizeKwp ? `${row.sizeKwp} kWp` : '—'}</td>
                  <td className={td}>
                    {row.briefLabel ? <span className={row.briefStrong ? 'font-semibold' : ''}>{row.briefLabel}</span> : '—'}
                  </td>
                  <td className={cn(td, check === 'Not needed' || check === '—' ? 'text-cq-muted' : 'font-semibold')}>{check}</td>
                  <td className={td}>
                    <Link href={hrefs.project(w.id, row.buildingId)} className="btn-secondary-sm">
                      View
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    )
  }
  if (w.service === 'scope') {
    return (
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px]">
          <thead className="border-b border-cq-border-light">
            <tr>
              <th className={th}>Project</th>
              <th className={th}>Step</th>
              <th className={th}>Open gap</th>
              <th className={th}>Survey</th>
              <th className={th} />
            </tr>
          </thead>
          <tbody>
            {w.projects.map((row) => {
              const building = getBuilding(account, row.buildingId)
              const waiting = row.decision === 'waiting'
              return (
                <tr key={row.buildingId} className={cn('border-t border-cq-border-light', waiting && 'outline outline-1 -outline-offset-1 outline-cq-accent')}>
                  <td className={td}>
                    <span className="font-normal">{building.name}</span>
                    <span className="mt-0.5 block text-cq-text-secondary">{building.city}</span>
                  </td>
                  <td className={td}>{steps[row.step]}</td>
                  <td className={td}>
                    {waiting ? (
                      <button type="button" className="btn-primary-sm" onClick={() => agreeScope(w.id, row.buildingId)}>
                        Agree scope
                      </button>
                    ) : row.decision === 'go' ? (
                      scopeDecisionLabel(row)
                    ) : (
                      row.gap ?? '—'
                    )}
                  </td>
                  <td className={td}>{row.visit ? visitStateLabel(row.visit) : '—'}</td>
                  <td className={td}>
                    <Link href={hrefs.project(w.id, row.buildingId)} className="btn-secondary-sm">
                      View
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    )
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px]">
        <thead className="border-b border-cq-border-light">
          <tr>
            <th className={th}>Project</th>
            <th className={th}>Step</th>
            <th className={th}>Estimate</th>
            <th className={th}>Payback</th>
            <th className={th}>Your decision</th>
            <th className={th} />
          </tr>
        </thead>
        <tbody>
          {w.projects.map((row) => {
            const building = getBuilding(account, row.buildingId)
            const waiting = row.decision === 'waiting'
            return (
              <tr key={row.buildingId} className={cn('border-t border-cq-border-light', waiting && 'outline outline-1 -outline-offset-1 outline-cq-accent')}>
                <td className={td}>
                  <span className="font-normal">{building.name}</span>
                  <span className="mt-0.5 block text-cq-text-secondary">{building.city}</span>
                </td>
                <td className={td}>{steps[row.step]}</td>
                <td className={td}>{row.estimate ? money(row.estimate) : '—'}</td>
                <td className={td}>{paybackLabel(row.paybackYears)}</td>
                <td className={td}>
                  {waiting ? (
                    <DecisionButtons onGo={() => decide(w.id, row.buildingId, 'go')} onNotNow={() => decide(w.id, row.buildingId, 'no')} />
                  ) : (
                    decisionLabel(row)
                  )}
                </td>
                <td className={td}>
                  <Link href={hrefs.project(w.id, row.buildingId)} className="btn-secondary-sm">
                    View
                  </Link>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
