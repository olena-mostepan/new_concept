'use client'

import { Suspense } from 'react'
import { useParams } from 'next/navigation'
import { ProjectView } from '@/components/concept/ProjectView'

function Inner() {
  const { workstreamId, buildingId } = useParams<{ workstreamId: string; buildingId: string }>()
  return <ProjectView workstreamId={workstreamId} buildingId={buildingId} />
}

export default function ProjectPage() {
  return (
    <Suspense>
      <Inner />
    </Suspense>
  )
}
