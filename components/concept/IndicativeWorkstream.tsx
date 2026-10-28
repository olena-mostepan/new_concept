'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import * as Tabs from '@radix-ui/react-tabs'
import { service as serviceDef, type Workstream } from '@/lib/concept/model'
import { getBatch, indicativeSteps, presentedTotal, short, waitingForDecision } from '@/lib/concept/derive'
import { cn } from '@/lib/utils'
import { Page, Card } from './ui'
import { SimpleSteps } from './SimpleSteps'
import { ProjectsTable } from './ProjectsTable'
import { shortFact, stepsAside, TabDot, WorkstreamFacts, WorkstreamFrame } from './WorkstreamChrome'
import { hrefs } from './hrefs'
import { useConcept } from './store'

const tabTriggerClass = cn(
  'inline-flex shrink-0 items-center whitespace-nowrap border-b-2 border-transparent px-0.5 py-3 text-sm font-normal outline-none transition-colors',
  'text-cq-text-secondary hover:text-cq-text',
  'data-[state=active]:border-[var(--cq-green)] data-[state=active]:text-text-primary',
)

type IndicativeTab = 'overview' | 'estimates' | 'files'

export function IndicativeWorkstream({ w, live = w }: { w: Workstream; live?: Workstream }) {
  const { account } = useConcept()
  const router = useRouter()
  const searchParams = useSearchParams()
  const batch = getBatch(account, w.batchId)!
  const waiting = waitingForDecision(w)
  const estimates = presentedTotal(w).count
  const fresh = w.projects.some((project) => project.decision === 'waiting')
  const estimated = w.projects.filter((project) => project.estimate)
  const estimateDocs = (w.documents ?? []).filter((doc) => /estimate/i.test(doc.name))
  const yourFiles = (w.documents ?? []).filter((doc) => !/estimate/i.test(doc.name))
  const tabs: Array<{ id: IndicativeTab; label: string; dot?: boolean }> = [
    { id: 'overview', label: 'Overview' },
    { id: 'estimates', label: `Estimates (${estimates})`, dot: fresh },
    { id: 'files', label: 'Your files' },
  ]
  const requested = searchParams.get('tab')
  const tab: IndicativeTab = requested === 'estimates' || requested === 'files' ? requested : 'overview'
  const setTab = (next: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (next === 'overview') params.delete('tab')
    else params.set('tab', next)
    const qs = params.toString()
    router.replace(`${hrefs.workstream(w.id)}${qs ? `?${qs}` : ''}`, { scroll: false })
  }
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
      <WorkstreamFrame live={live}>
        <Tabs.Root value={tab} onValueChange={setTab}>
          <Tabs.List className="flex gap-6 border-b border-cq-border-light" aria-label="Workstream">
            {tabs.map((item) => (
              <Tabs.Trigger key={item.id} value={item.id} className={tabTriggerClass}>
                {item.label}
                {item.dot && <TabDot />}
              </Tabs.Trigger>
            ))}
          </Tabs.List>
        </Tabs.Root>

        {tab === 'estimates' && (
          <Card title="Estimates" bodyClassName="p-0">
            <ProjectsTable w={w} rows={estimated} columns={['estimate', 'decision']} />
            {estimateDocs.length > 0 && (
              <ul className="border-t border-border-light px-6">
                {estimateDocs.map((doc) => (
                  <li key={doc.name} className="flex items-start justify-between gap-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-cq-text">{shortFact(doc.name)}</p>
                      <p className="text-sm text-cq-text-secondary">{shortFact(doc.meta)}</p>
                    </div>
                    {doc.action && (
                      <button type="button" className="btn-link shrink-0">
                        {doc.action}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        )}

        {tab === 'files' && (
          <Card title="Your files">
            {yourFiles.length > 0 ? (
              <ul>
                {yourFiles.map((doc, index) => (
                  <li key={doc.name} className={cn('flex items-start justify-between gap-4 py-3', index > 0 && 'border-t border-border-light')}>
                    <div>
                      <p className="text-sm font-semibold text-cq-text">{shortFact(doc.name)}</p>
                      <p className="text-sm text-cq-text-secondary">{shortFact(doc.meta)}</p>
                    </div>
                    {doc.action && (
                      <button type="button" className="btn-link shrink-0">
                        {doc.action}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="p6 text-text-secondary">No files yet</p>
            )}
          </Card>
        )}

        {tab === 'overview' && (
          <>
            <SimpleSteps title={`${serviceDef(w.service).label} steps`} columns={indicativeSteps(account, w)} right={stepsAside(w)} />
            <Card title="Projects" right={`${w.projects.length}${waiting ? ` · ${waiting} waiting for your decision` : ''}`} bodyClassName="p-0">
              <ProjectsTable w={w} />
            </Card>
            <WorkstreamFacts activity={activity} documents={w.documents} />
          </>
        )}
      </WorkstreamFrame>
    </Page>
  )
}
