'use client'

import { service as serviceDef, type Workstream } from '@/lib/concept/model'
import { scopeProjectsAside, scopeSteps } from '@/lib/concept/derive'
import { Page, Card } from './ui'
import { SimpleSteps } from './SimpleSteps'
import { ProjectsTable } from './ProjectsTable'
import { stepsAside, WorkstreamFacts, WorkstreamFrame } from './WorkstreamChrome'
import { useConcept } from './store'

export function ScopeWorkstream({ w, live = w }: { w: Workstream; live?: Workstream }) {
  const { account } = useConcept()
  return (
    <Page>
      <WorkstreamFrame live={live}>
        <SimpleSteps title={`${serviceDef(w.service).label} steps`} columns={scopeSteps(account, w)} right={stepsAside(w)} />
        <Card title="Projects" right={scopeProjectsAside(w)} bodyClassName="p-0">
          <ProjectsTable w={w} />
        </Card>
        <WorkstreamFacts activity={w.activity ?? []} documents={w.documents} />
      </WorkstreamFrame>
    </Page>
  )
}
