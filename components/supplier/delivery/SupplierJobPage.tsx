'use client'

import * as React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { FileBarChart, FileText, FileUp } from 'lucide-react'
import * as Tabs from '@radix-ui/react-tabs'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { sectionTitleClass } from '@/lib/ui/headings'
import {
  getJobDelivery,
  jobSubtitle,
  jobTitle,
} from '@/lib/supplier/delivery/job-mock-data'
import { SupplierJobDeliveryPanel } from '@/components/supplier/delivery/SupplierJobDeliveryView'

export type JobPageTab =
  | 'brief'
  | 'questions'
  | 'survey'
  | 'contract'
  | 'delivery'

const TABS: Array<{ id: JobPageTab; label: string }> = [
  { id: 'brief', label: 'Brief' },
  { id: 'questions', label: 'Questions' },
  { id: 'survey', label: 'Survey' },
  { id: 'contract', label: 'Contract' },
  { id: 'delivery', label: 'Delivery' },
]

const TAB_IDS = TABS.map((t) => t.id)

function tabFromQuery(value: string | null): JobPageTab {
  if (value && TAB_IDS.includes(value as JobPageTab)) {
    return value as JobPageTab
  }
  return 'delivery'
}

const tabTriggerClass = cn(
  'shrink-0 whitespace-nowrap border-b-2 border-transparent px-0.5 py-3 text-sm font-normal outline-none transition-colors',
  'text-cq-text-secondary hover:text-cq-text',
  'data-[state=active]:border-[var(--cq-green)] data-[state=active]:text-text-primary',
)

export function SupplierJobPage({ jobId }: { jobId: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const job = getJobDelivery(jobId)

  const [tab, setTab] = React.useState<JobPageTab>(() =>
    tabFromQuery(searchParams.get('tab')),
  )
  const [mounted, setMounted] = React.useState(false)
  const [uploadOpen, setUploadOpen] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    setTab(tabFromQuery(searchParams.get('tab')))
  }, [searchParams])

  const setTabWithUrl = React.useCallback(
    (next: JobPageTab) => {
      setTab(next)
      const params = new URLSearchParams(searchParams.toString())
      if (next === 'delivery') params.delete('tab')
      else params.set('tab', next)
      const qs = params.toString()
      router.replace(`/supplier/jobs/${jobId}${qs ? `?${qs}` : ''}`, {
        scroll: false,
      })
    },
    [router, searchParams, jobId],
  )

  if (!job) {
    return (
      <div className="rounded-xl border border-cq-border bg-white px-5 py-10 text-center  sm:px-6">
        <p className="text-sm font-normal text-cq-text">Job not found</p>
        <Link href="/supplier/delivery" className="btn-link mt-3 inline-flex">
          Back to Delivery
        </Link>
      </div>
    )
  }

  return (
    <article className="space-y-6">
      <header className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between lg:gap-8">
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
            <h1 className="min-w-0 text-xl font-semibold tracking-tight text-text-primary md:text-2xl">
              {jobTitle(job)}
            </h1>
            <div className="flex shrink-0 flex-row flex-nowrap items-center gap-2">
              <button
                type="button"
                className="btn-secondary shrink-0"
                onClick={() => {
                  if (tab !== 'delivery') setTabWithUrl('delivery')
                  setUploadOpen(true)
                }}
              >
                <FileUp className="h-4 w-4" aria-hidden />
                Upload invoice
              </button>
              <button
                type="button"
                className="btn-secondary shrink-0"
                onClick={() =>
                  toast.message('Documents open here in production')
                }
              >
                <FileText className="h-4 w-4" aria-hidden />
                Documents
              </button>
              <button
                type="button"
                className="btn-secondary shrink-0"
                onClick={() =>
                  toast.message('Report generation opens here in production')
                }
              >
                <FileBarChart className="h-4 w-4" aria-hidden />
                Generate report
              </button>
            </div>
          </div>
          <p className="mt-1.5 text-sm text-cq-text-secondary">
            {jobSubtitle(job)}
          </p>
          <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
            <div>
              <dt className="text-xs text-cq-text-secondary">Type</dt>
              <dd className="mt-0.5 text-sm font-normal text-cq-text">
                {job.overview.type}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-cq-text-secondary">
                Size of installation
              </dt>
              <dd className="mt-0.5 text-sm font-normal text-cq-text">
                {job.overview.sizeOfInstallation}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-cq-text-secondary">Roof covering</dt>
              <dd className="mt-0.5 text-sm font-normal text-cq-text">
                {job.overview.roofCovering}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-cq-text-secondary">
                Usable roof area
              </dt>
              <dd className="mt-0.5 text-sm font-normal text-cq-text">
                {job.overview.usableRoofArea}
              </dd>
            </div>
          </dl>
        </div>
        <div className="relative h-40 w-full shrink-0 overflow-hidden rounded-xl border border-cq-border bg-cq-bg sm:h-44 lg:h-44 lg:w-72">
          <Image
            src={job.overview.photoUrl}
            alt={`${job.property} building`}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 288px"
            priority
          />
        </div>
      </header>

      {mounted ? (
        <Tabs.Root
          value={tab}
          onValueChange={(v) => setTabWithUrl(v as JobPageTab)}
        >
          <Tabs.List
            className="flex gap-5 overflow-x-auto border-b border-cq-border sm:gap-7"
            aria-label="Project sections"
          >
            {TABS.map((item) => (
              <Tabs.Trigger
                key={item.id}
                value={item.id}
                className={tabTriggerClass}
              >
                {item.label}
              </Tabs.Trigger>
            ))}
          </Tabs.List>
        </Tabs.Root>
      ) : (
        <div
          className="flex gap-5 overflow-x-auto border-b border-cq-border sm:gap-7"
          aria-hidden
        >
          {TABS.map((item) => (
            <span
              key={item.id}
              className={cn(
                'shrink-0 whitespace-nowrap border-b-2 py-3 text-sm font-normal',
                item.id === 'delivery'
                  ? 'border-[var(--cq-green)] text-text-primary'
                  : 'border-transparent text-cq-text-secondary',
              )}
            >
              {item.label}
            </span>
          ))}
        </div>
      )}

      {tab === 'delivery' ? (
        <SupplierJobDeliveryPanel
          jobId={jobId}
          uploadOpen={uploadOpen}
          onUploadOpenChange={setUploadOpen}
        />
      ) : (
        <PlaceholderTab tab={tab} title={jobTitle(job)} />
      )}
    </article>
  )
}

function PlaceholderTab({
  tab,
  title,
}: {
  tab: Exclude<JobPageTab, 'delivery'>
  title: string
}) {
  const label = TABS.find((t) => t.id === tab)?.label ?? tab
  return (
    <div className="rounded-xl border border-cq-border bg-white px-5 py-6  sm:px-6">
      <h2 className={sectionTitleClass}>{label}</h2>
      <p className="mt-2 text-sm leading-relaxed text-cq-text-secondary">
        {label} for {title} — prototype placeholder. Delivery is the active
        workflow on this job.
      </p>
    </div>
  )
}
