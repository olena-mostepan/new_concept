'use client'

import * as React from 'react'
import { Suspense } from 'react'
import Link from 'next/link'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Building2 } from 'lucide-react'
import * as Tabs from '@radix-ui/react-tabs'
import { cn } from '@/lib/utils'
import { SupplierQuestionsTab } from '@/components/supplier/questions/SupplierQuestionsTab'
import { StartBidModal } from '@/components/supplier/StartBidModal'
import {
  SUPPLIER_PROJECTS,
  DEMO_PROJECT_ID,
} from '@/lib/supplier/questions/mock-data'
import { useSupplierQuestions } from '@/lib/supplier/questions/store'
import { pageTitleClass, sectionTitleClass } from '@/lib/ui/headings'

type ProjectTab =
  | 'project-info'
  | 'supporting-docs'
  | 'bid-overview'
  | 'questions'

const TAB_VALUES: ProjectTab[] = [
  'project-info',
  'supporting-docs',
  'bid-overview',
  'questions',
]

function tabFromQuery(value: string | null): ProjectTab {
  if (value && TAB_VALUES.includes(value as ProjectTab)) {
    return value as ProjectTab
  }
  if (value === 'qa' || value === 'bid-clarifications' || value === 'clarifications') {
    return 'questions'
  }
  return 'project-info'
}

export default function SupplierProjectPage() {
  return (
    <Suspense fallback={<SupplierProjectPageFallback />}>
      <SupplierProjectPageInner />
    </Suspense>
  )
}

function SupplierProjectPageFallback() {
  return (
    <div className="mx-auto w-full max-w-screen-2xl px-6 py-8 sm:px-8 lg:px-10">
      <div className="h-24 animate-pulse rounded-xl border border-cq-border bg-white" />
    </div>
  )
}

function SupplierProjectPageInner() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { getQuestions } = useSupplierQuestions()

  const projectId = (params?.projectId as string | undefined) ?? DEMO_PROJECT_ID
  const project = SUPPLIER_PROJECTS[projectId]
  const questionCount = getQuestions(projectId).length

  const [screenTab, setScreenTab] = React.useState<ProjectTab>('project-info')
  const [mounted, setMounted] = React.useState(false)
  const [askOpen, setAskOpen] = React.useState(false)
  const [startBidOpen, setStartBidOpen] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    setScreenTab(tabFromQuery(searchParams.get('tab')))
  }, [searchParams])

  React.useEffect(() => {
    if (screenTab !== 'questions') setAskOpen(false)
  }, [screenTab])

  const setScreenTabWithUrl = React.useCallback(
    (tab: ProjectTab) => {
      setScreenTab(tab)
      const params = new URLSearchParams(searchParams.toString())
      if (tab === 'project-info') params.delete('tab')
      else params.set('tab', tab)
      const qs = params.toString()
      router.replace(
        `/supplier/projects/${projectId}${qs ? `?${qs}` : ''}`,
        { scroll: false },
      )
    },
    [router, searchParams, projectId],
  )

  if (!project) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <p className="text-cq-text-secondary">This project could not be found.</p>
        <Link
          href="/supplier"
          className="mt-4 inline-block font-bold text-cq-link underline"
        >
          Back to Focus
        </Link>
      </div>
    )
  }

  const submittedLine = [project.bidSubmittedLabel, project.bidLabel]
    .filter(Boolean)
    .join(' · ')

  return (
    <div className="mx-auto w-full max-w-screen-2xl px-6 py-8 sm:px-8 lg:px-10">
      <article className="space-y-6">
        <header className="flex gap-4 rounded-xl border border-cq-border bg-white p-5 sm:p-6">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-cq-border bg-cq-bg">
            <Building2 className="h-6 w-6 text-cq-text-secondary" aria-hidden />
          </div>
          <div className="min-w-0">
            <h1 className={pageTitleClass}>{project.name}</h1>
            <p className="mt-1 text-sm text-cq-text-secondary">{submittedLine}</p>
          </div>
        </header>

        {mounted ? (
          <Tabs.Root
            value={screenTab}
            onValueChange={(v) => setScreenTabWithUrl(v as ProjectTab)}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cq-border">
              <Tabs.List className="flex flex-wrap gap-6 sm:gap-8">
                <Tabs.Trigger
                  value="project-info"
                  className="px-1 py-3 text-sm font-semibold text-cq-text-secondary outline-none data-[state=active]:border-b-2 data-[state=active]:border-cq-green data-[state=active]:text-cq-green"
                >
                  Project Info
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="supporting-docs"
                  className="px-1 py-3 text-sm font-semibold text-cq-text-secondary outline-none data-[state=active]:border-b-2 data-[state=active]:border-cq-green data-[state=active]:text-cq-green"
                >
                  Supporting Documents
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="bid-overview"
                  className="px-1 py-3 text-sm font-semibold text-cq-text-secondary outline-none data-[state=active]:border-b-2 data-[state=active]:border-cq-green data-[state=active]:text-cq-green"
                >
                  Bid Overview
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="questions"
                  className="px-1 py-3 text-sm font-semibold text-cq-text-secondary outline-none data-[state=active]:border-b-2 data-[state=active]:border-cq-green data-[state=active]:text-cq-green"
                >
                  Questions ({questionCount})
                </Tabs.Trigger>
              </Tabs.List>
              {screenTab === 'questions' && (
                <button
                  type="button"
                  onClick={() => setAskOpen(true)}
                  className="btn-primary mb-1 sm:mb-0"
                >
                  Ask a question
                </button>
              )}
              {screenTab === 'bid-overview' && (
                <button
                  type="button"
                  onClick={() => setStartBidOpen(true)}
                  className="btn-primary mb-1 sm:mb-0"
                >
                  Start your bid
                </button>
              )}
            </div>
          </Tabs.Root>
        ) : (
          <div className="flex flex-wrap gap-6 border-b border-cq-border sm:gap-8">
            <span className="border-b-2 border-cq-green py-3 text-sm font-semibold text-cq-green">
              Project Info
            </span>
            <span className="py-3 text-sm font-semibold text-cq-text-secondary">
              Supporting Documents
            </span>
            <span className="py-3 text-sm font-semibold text-cq-text-secondary">
              Bid Overview
            </span>
            <span className="py-3 text-sm font-semibold text-cq-text-secondary">
              Questions ({questionCount})
            </span>
          </div>
        )}

        <div className={cn(screenTab !== 'questions' && 'rounded-xl border border-cq-border bg-white p-6 shadow-sm')}>
          {screenTab === 'questions' && mounted ? (
            <SupplierQuestionsTab
              projectId={projectId}
              askOpen={askOpen}
              onAskOpenChange={setAskOpen}
            />
          ) : screenTab === 'supporting-docs' ? (
            <PlaceholderPanel title="Supporting Documents">
              Tender brief, site photos, and landlord constraints — prototype placeholder.
            </PlaceholderPanel>
          ) : screenTab === 'bid-overview' ? (
            <div>
              <h2 className={sectionTitleClass}>Bid Overview</h2>
              <p className="mt-2 text-sm leading-relaxed text-cq-text-secondary">
                Review the questions for this tender and start your bid submission.
              </p>
              <button
                type="button"
                onClick={() => setStartBidOpen(true)}
                className="btn-primary mt-5"
              >
                Start your bid
              </button>
            </div>
          ) : (
            <PlaceholderPanel title="Project Info">
              Solar PV retrofit across LL1–LL3 car park roofs at Braehead Shopping Centre.
              Review your bid status and respond to questions from the Questions tab.
            </PlaceholderPanel>
          )}
        </div>
      </article>

      <StartBidModal
        open={startBidOpen}
        onOpenChange={setStartBidOpen}
        projectName={project.name}
      />
    </div>
  )
}

function PlaceholderPanel({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div>
      <h2 className={sectionTitleClass}>{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-cq-text-secondary">{children}</p>
    </div>
  )
}
