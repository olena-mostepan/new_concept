'use client'

import Link from 'next/link'
import { SOLUTIONS, service as serviceDef, type Workstream } from '@/lib/concept/model'
import { getBatch, openGapsLine, scopeProjectsAside, scopeSteps, short } from '@/lib/concept/derive'
import { Card, Page, PageHeader } from './ui'
import { StatusPill } from './StatusPill'
import { DetailsGrid, DetailsToggle, useDetailsOpen } from './DetailsGrid'
import { StepsWithNeeds } from './StepsWithNeeds'
import { ProjectsTable } from './ProjectsTable'
import { hrefs } from './hrefs'
import { useConcept } from './store'

export function ScopeWorkstream({ w }: { w: Workstream }) {
  const { account } = useConcept()
  const batch = getBatch(account, w.batchId)!
  const def = serviceDef(w.service)
  const details = useDetailsOpen()

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
              { label: 'Open gaps', value: openGapsLine(w) },
              { label: 'Done when', value: 'Scope agreed' },
            ]}
            tags={[def.label, SOLUTIONS[w.solution]]}
          />}

        <Card title="Steps" right="Projects at each step">
          <div className="overflow-x-auto">
            <div className="min-w-[960px]">
              <StepsWithNeeds columns={scopeSteps(account, w)} />
            </div>
          </div>
        </Card>

        <Card title="Projects" right={scopeProjectsAside(w)} bodyClassName="p-0">
          <ProjectsTable w={w} />
        </Card>

        <div className={w.documents?.length ? 'grid gap-6 lg:grid-cols-2' : ''}>
          <Card title="Recent activity">
            <ul className="space-y-4">
              {(w.activity ?? []).map((item) => (
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
