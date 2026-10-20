'use client'

import Link from 'next/link'
import { SOLUTIONS, service as serviceDef, type Workstream } from '@/lib/concept/model'
import { getBatch, indicativeSteps, presentedTotal, short, waitingForDecision } from '@/lib/concept/derive'
import { Card, Page, PageHeader } from './ui'
import { StatusPill } from './StatusPill'
import { DetailsGrid, DetailsToggle, useDetailsOpen } from './DetailsGrid'
import { StepsWithNeeds } from './StepsWithNeeds'
import { ProjectsTable } from './ProjectsTable'
import { hrefs } from './hrefs'
import { useConcept } from './store'

export function IndicativeWorkstream({ w }: { w: Workstream }) {
  const { account } = useConcept()
  const batch = getBatch(account, w.batchId)!
  const def = serviceDef(w.service)
  const total = presentedTotal(w)
  const waiting = waitingForDecision(w)
  const details = useDetailsOpen()
  const activity =
    w.activity ??
    [
      w.next?.kind === 'decision'
        ? { date: short(w.next.since), title: `${w.projects.filter((p) => p.presentedOn).length} estimates presented`, text: '' }
        : null,
      w.startedOn ? { date: short(w.startedOn), title: 'Workstream started', text: `${w.projects.length} projects allocated from ${batch.name}.` } : null,
    ].filter((item): item is { date: string; title: string; text: string } => Boolean(item))

  return (
    <Page>
      <PageHeader
        crumbs={[
          { label: def.label, href: hrefs.service(w.service) },
          { label: w.name },
        ]}
        title={w.name}
        meta={`${SOLUTIONS[w.solution]} · ${batch.name} · ${w.projects.length} projects · Lead ${w.lead}`}
        actions={
          <>
            <StatusPill owner={w.owner} />
            <Link href={hrefs.batch(batch.id)} className="btn-secondary-sm">
              View batch
            </Link>
            <DetailsToggle open={details.open} onToggle={details.toggle} />
          </>
        }
      />
      <div className="space-y-6 pb-12">
        {details.open && <DetailsGrid
            items={[
              { label: 'Service', value: def.label },
              { label: 'Solution', value: SOLUTIONS[w.solution] },
              {
                label: 'Batch',
                value: (
                  <Link href={hrefs.batch(batch.id)} className="hover:text-cq-accent">
                    {batch.name}
                  </Link>
                ),
              },
              { label: 'Lead', value: w.lead },
              { label: 'Started', value: short(w.startedOn) },
              { label: 'Projects', value: String(w.projects.length) },
              { label: 'Estimated cost', value: total.count ? `${total.text} · ${total.count} presented` : '—' },
              { label: 'Done when', value: "You've decided" },
            ]}
            tags={[def.label, SOLUTIONS[w.solution]]}
          />}

        <Card title="Steps" right="Projects at each step">
          <StepsWithNeeds columns={indicativeSteps(account, w)} />
        </Card>

        <Card title="Projects" right={`${w.projects.length}${waiting ? ` · ${waiting} waiting for your decision` : ''}`} bodyClassName="p-0">
          <ProjectsTable w={w} />
        </Card>

        <div className={w.documents?.length ? 'grid gap-6 lg:grid-cols-2' : ''}>
          <Card title="Recent activity">
            <ul className="space-y-4">
              {activity.map((item) => (
                <li key={`${item.date}-${item.title}`} className="flex justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-cq-text">{item.title}</p>
                    {item.text && <p className="text-sm text-cq-text-secondary">{item.text}</p>}
                  </div>
                  <span className="shrink-0 text-xs text-cq-muted">{item.date}</span>
                </li>
              ))}
            </ul>
          </Card>
          {w.documents && w.documents.length > 0 && (
            <Card title="Documents">
              <ul className="space-y-4">
                {w.documents.map((doc) => (
                  <li key={doc.name}>
                    <p className="text-sm font-semibold text-cq-text">{doc.name}</p>
                    <p className="text-sm text-cq-text-secondary">{doc.meta}</p>
                    {doc.action && (
                      <button type="button" className="btn-link mt-1">
                        {doc.action}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      </div>
    </Page>
  )
}
