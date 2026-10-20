'use client'

import Link from 'next/link'
import { SOLUTIONS, service as serviceDef, type ServiceId } from '@/lib/concept/model'
import { basisRows, days, decisionLabel, getBatch, getBuilding, getWorkstream, money, moneyOne, paybackLabel, priorProject, projectHistory, scopeLine, short, visitStateLabel } from '@/lib/concept/derive'
import { Card, Page, PageHeader } from './ui'
import { StatusPill } from './StatusPill'
import { DetailsGrid } from './DetailsGrid'
import { ProjectRoute } from './ProjectRoute'
import { DecisionButtons } from './DecisionButtons'
import { DeliveryProject } from './DeliveryWorkstream'
import { hrefs } from './hrefs'
import { useConcept } from './store'
import { cn } from '@/lib/utils'

export function ProjectView({ workstreamId, buildingId }: { workstreamId: string; buildingId: string }) {
  const { account, agreeScope, decide } = useConcept()
  const w = getWorkstream(account, workstreamId)
  const building = w && getBuilding(account, buildingId)
  const row = w?.projects.find((p) => p.buildingId === buildingId)
  if (!w || !building || !row || (w.service !== 'indicative' && w.service !== 'scope' && w.service !== 'tender' && w.service !== 'pricing' && w.service !== 'delivery')) {
    return (
      <Page>
        <PageHeader title="Project not found" />
      </Page>
    )
  }
  if (w.service === 'delivery') return <DeliveryProject w={w} building={building} row={row} />
  const batch = getBatch(account, w.batchId)!
  const def = serviceDef(w.service)
  const solutionLabel = w.solution === 'ev' ? 'EV charging' : SOLUTIONS[w.solution]
  const history = projectHistory(account, w, row)
  const basis = basisRows(w, row)
  const scopeCaptions = () => {
    const prior = priorProject(account, w, buildingId)
    const estimate = row.basedOn?.find((field) => field.label === 'Indicative estimate')
    const captions: Partial<Record<ServiceId, { state: 'done' | 'now' | 'planned'; title: string; detail?: string }>> = {
      [w.service]: { state: 'now', title: `Now · ${def.steps[row.step]}`, detail: `In ${w.name}` },
    }
    if (prior) {
      captions.indicative = {
        state: 'done',
        title: `Done ${short(prior.workstream.completedOn)}`,
        detail: estimate?.value ?? (prior.row.estimate ? money(prior.row.estimate) : undefined),
      }
    }
    return captions
  }
  const tenderCaptions = () => {
    const prior = priorProject(account, w, buildingId)
    const estimate = row.basedOn?.find((field) => field.label === 'Indicative estimate')
    const captions: Partial<Record<ServiceId, { state: 'done' | 'now' | 'planned' | 'skip'; title: string; detail?: string }>> = {
      tender: { state: 'now', title: `Now · ${def.steps[row.step]}`, detail: `In ${w.name}` },
      scope: { state: 'skip', title: 'Not needed', detail: 'Roof data was complete' },
      pricing: { state: 'skip', title: 'Not needed', detail: 'The supplier comes from the tender' },
    }
    if (prior) {
      captions.indicative = {
        state: 'done',
        title: `Done ${short(prior.workstream.completedOn)}`,
        detail: estimate?.value ?? (prior.row.estimate ? `${money(prior.row.estimate)} · ${paybackLabel(prior.row.paybackYears)}` : undefined),
      }
    }
    return captions
  }
  const pricingCaptions = () => {
    if (w.pricing?.source !== 'Incumbent') return undefined
    return {
      indicative: { state: 'skip' as const, title: 'Not needed', detail: 'Priced by your incumbent' },
      scope: { state: 'skip' as const, title: 'Not needed', detail: 'Like-for-like with the existing chargers' },
      tender: { state: 'skip' as const, title: 'Not needed', detail: `Incumbent: ${w.supplier}` },
      pricing: { state: 'now' as const, title: `Now · ${def.steps[row.step]}`, detail: `In ${w.name}` },
      delivery: { state: 'planned' as const, title: 'Planned' },
    }
  }

  return (
    <Page>
      <PageHeader
        crumbs={[
          { label: def.label, href: hrefs.service(w.service) },
          { label: w.name, href: hrefs.workstream(w.id) },
          { label: building.name },
        ]}
        title={
          <>
            {building.name} · {w.service === 'indicative' ? w.name : solutionLabel} <span className="font-normal text-cq-text-secondary">{building.city}</span>
          </>
        }
        actions={
          <>
            <StatusPill owner={w.owner} />
            <Link href={hrefs.batch(batch.id)} className="btn-secondary-sm">
              View batch
            </Link>
          </>
        }
      />
      <div className="space-y-6 pb-12">
        <Card title="Details">
          <DetailsGrid
            items={[
              {
                label: 'Batch',
                value: (
                  <Link href={hrefs.batch(batch.id)} className="hover:text-cq-accent">
                    {batch.name}
                  </Link>
                ),
              },
              {
                label: 'Workstream',
                value: (
                  <Link href={hrefs.workstream(w.id)} className="hover:text-cq-accent">
                    {w.name}
                  </Link>
                ),
              },
              { label: 'Solution', value: solutionLabel },
              { label: 'Lead', value: w.lead },
            ]}
          />
        </Card>

        <Card title="Route" right="Services for this project">
          <ProjectRoute batch={batch} serviceId={w.service} workstreamName={w.name} presentedOn={row.presentedOn} captions={w.service === 'scope' ? scopeCaptions() : w.service === 'tender' ? tenderCaptions() : w.service === 'pricing' ? pricingCaptions() : undefined} />
        </Card>

        {(w.service !== 'pricing' || row.price || row.basedOn?.length) && (
        <div className={w.service === 'pricing' && !(row.price && row.basedOn?.length) ? '' : 'grid gap-6 lg:grid-cols-2'}>
          {w.service === 'pricing' && row.price ? (
            <Card title="Price">
              <div className="space-y-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs text-cq-text-secondary">Price</p>
                    <p className="mt-1 text-base font-semibold">{moneyOne(row.price)}</p>
                    <p className="mt-0.5 text-sm text-cq-text-secondary">From {w.supplier}, received {short(w.pricing?.receivedOn)}</p>
                  </div>
                  <button type="button" className="btn-link shrink-0">
                    Price analysis
                  </button>
                </div>
                {row.analysis && (
                  <div>
                    <p className="text-xs text-cq-text-secondary">Analysis</p>
                    <p className={cn('mt-1 text-sm', row.analysisStrong ? 'font-semibold text-cq-text' : 'text-cq-text-secondary')}>{row.analysis}</p>
                    {w.pricing?.analysedOn && <p className="mt-0.5 text-sm text-cq-text-secondary">Checked {short(w.pricing.analysedOn)}</p>}
                  </div>
                )}
                {row.decision && (
                  <div>
                    <p className="text-xs text-cq-text-secondary">Decision</p>
                    <div className="mt-2">
                      {row.decision === 'waiting' ? (
                        <DecisionButtons goLabel="Agree price" onGo={() => decide(w.id, row.buildingId, 'go')} onNotNow={() => decide(w.id, row.buildingId, 'no')} />
                      ) : (
                        <span className="text-sm font-normal">{row.decision === 'no' ? `Not now · ${short(row.decidedOn)}` : `Agreed · ${short(row.decidedOn)}`}</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ) : w.service === 'tender' ? (
            <Card title="Tender">
              <div className="space-y-5">
                {w.tender?.invited && w.next?.kind === 'offers' && (
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs text-cq-text-secondary">Offers</p>
                      <p className="mt-1 text-sm font-semibold">{w.next.in} of {w.next.invited} in</p>
                      <p className="mt-0.5 text-sm text-cq-text-secondary">Priced for the whole workstream</p>
                    </div>
                    <Link href={`${hrefs.workstream(w.id)}?tab=offers`} className="btn-link shrink-0">
                      See offers
                    </Link>
                  </div>
                )}
                {row.visit && (
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs text-cq-text-secondary">Site check</p>
                      <p className={cn('mt-1 text-sm', row.visit.state === 'done' ? 'font-semibold' : 'text-cq-muted')}>
                        {row.visit.state === 'done' && row.visit.on ? `Done ${short(row.visit.on)}` : row.visit.state === 'skip' ? 'Not needed' : visitStateLabel(row.visit)}
                      </p>
                      {row.visit.detail && <p className="mt-0.5 text-sm text-cq-text-secondary">{row.visit.detail}</p>}
                    </div>
                    {row.visit.state === 'done' && (
                      <button type="button" className="btn-link shrink-0">
                        Survey documents
                      </button>
                    )}
                  </div>
                )}
                {w.tender?.brief && (
                  <div>
                    <p className="text-xs text-cq-text-secondary">Brief</p>
                    <p className="mt-1 text-sm font-semibold">{row.briefStrong && row.briefNote ? `${w.tender.brief}` : row.briefLabel ?? w.tender.brief}</p>
                    {row.briefNote && <p className="mt-0.5 text-sm text-cq-text-secondary">{row.briefNote}</p>}
                  </div>
                )}
              </div>
            </Card>
          ) : w.service === 'scope' ? (
            <Card title="Scope">
              <div className="space-y-5">
                {row.gap && w.next && 'since' in w.next && (
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs text-cq-text-secondary">Open gap</p>
                      <p className="mt-1 text-sm font-semibold">{row.gap}</p>
                      <p className="mt-0.5 text-sm text-cq-text-secondary">
                        Asked {short(w.next.since)} · waiting {days(w.next.since)} days
                      </p>
                    </div>
                    <a className="btn-link shrink-0" href="mailto:">
                      Reply by email
                    </a>
                  </div>
                )}
                <div>
                  <p className="text-xs text-cq-text-secondary">Survey</p>
                  <p className="mt-1 text-sm font-normal">{row.visit ? visitStateLabel(row.visit) : '—'}</p>
                  {row.visit?.detail && <p className="mt-0.5 text-sm text-cq-text-secondary">{row.visit.detail}</p>}
                </div>
                <div>
                  <p className="text-xs text-cq-text-secondary">Scope</p>
                  <p className="mt-1 text-sm font-normal">{scopeLine(w, row)}</p>
                  {row.decision === 'waiting' && (
                    <button type="button" className="btn-primary-sm mt-2" onClick={() => agreeScope(w.id, row.buildingId)}>
                      Agree scope
                    </button>
                  )}
                </div>
              </div>
            </Card>
          ) : w.service === 'indicative' ? (
          <Card title="Estimate">
            <dl className="space-y-4">
              <div>
                <dt className="text-xs text-cq-text-secondary">Cost</dt>
                <dd className="mt-1 text-sm font-normal">{row.estimate ? money(row.estimate) : '—'}</dd>
              </div>
              <div>
                <dt className="text-xs text-cq-text-secondary">Payback</dt>
                <dd className="mt-1 text-sm font-normal">{paybackLabel(row.paybackYears)}</dd>
              </div>
              <div>
                <dt className="text-xs text-cq-text-secondary">Your decision</dt>
                <dd className="mt-2">
                  {row.decision === 'waiting' ? (
                    <DecisionButtons onGo={() => decide(w.id, row.buildingId, 'go')} onNotNow={() => decide(w.id, row.buildingId, 'no')} />
                  ) : (
                    <span className="text-sm font-normal">{decisionLabel(row)}</span>
                  )}
                </dd>
              </div>
            </dl>
          </Card>
          ) : null}
          {(w.service !== 'pricing' || row.basedOn?.length) && (
          <Card title="Based on">
            <ul className="space-y-3">
              {basis.map((field) => (
                <li key={field.label} className="flex items-baseline justify-between gap-4 text-sm">
                  <span>
                    <span className="text-cq-text-secondary">{field.label}</span>
                    <span className="ml-2 font-normal text-cq-text">{field.value}</span>
                  </span>
                  <span className="shrink-0 text-cq-muted">{field.source}</span>
                </li>
              ))}
            </ul>
          </Card>
          )}
        </div>
        )}

        {history.length > 0 && (
        <Card title="History" bodyClassName="p-0">
          <table className="w-full">
            <tbody>
              {history.map((item) => (
                <tr key={item.event} className="border-t border-cq-border-light first:border-t-0">
                  <td className="px-5 py-3.5 text-sm font-normal">{item.event}</td>
                  <td className="px-5 py-3.5 text-sm text-cq-text-secondary">{item.detail}</td>
                  <td className="px-5 py-3.5 text-right text-sm text-cq-muted">{item.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
        )}
      </div>
    </Page>
  )
}
