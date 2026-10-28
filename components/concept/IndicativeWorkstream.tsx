'use client'

import { service as serviceDef, type Workstream } from '@/lib/concept/model'
import { getBatch, indicativeSteps, short, waitingForDecision } from '@/lib/concept/derive'
import { Page, Card } from './ui'
import { SimpleSteps } from './SimpleSteps'
import { ProjectsTable } from './ProjectsTable'
import { stepsAside, WorkstreamFacts, WorkstreamFrame } from './WorkstreamChrome'
import { useConcept } from './store'

export function IndicativeWorkstream({ w, live = w }: { w: Workstream; live?: Workstream }) {
  const { account } = useConcept()
  const batch = getBatch(account, w.batchId)!
  const waiting = waitingForDecision(w)
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
        <SimpleSteps title={`${serviceDef(w.service).label} steps`} columns={indicativeSteps(account, w)} right={stepsAside(w)} />
        <Card title="Projects" right={`${w.projects.length}${waiting ? ` · ${waiting} waiting for your decision` : ''}`} bodyClassName="p-0">
          <ProjectsTable w={w} />
        </Card>
        <WorkstreamFacts activity={activity} documents={w.documents} />
      </WorkstreamFrame>
    </Page>
  )
}
