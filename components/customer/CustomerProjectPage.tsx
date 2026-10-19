'use client'

import * as React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronDown, ChevronUp, FileBarChart, FileText } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import * as Tabs from '@radix-ui/react-tabs'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  getBatchForProject,
  getCustomerProject,
  projectSubtitle,
} from '@/lib/customer/delivery/mock-data'
import { CustomerProjectDeliveryView } from '@/components/customer/delivery/CustomerProjectDeliveryView'
import {
  MatchingViewSwitch,
  ProjectCriteria,
  SupplierMatchingReview,
} from '@/components/customer/supplier-matching/SupplierMatchingReview'
import type { MatchingAudience } from '@/lib/customer/supplier-matching/model'
import type { CustomerProjectDetail } from '@/lib/customer/delivery/types'

function DetailValue({ value, onRead }: { value: string; onRead: () => void }) {
  const boxRef = React.useRef<HTMLDivElement>(null)
  const [display, setDisplay] = React.useState(value)
  const [needsMore, setNeedsMore] = React.useState(false)

  React.useLayoutEffect(() => {
    const box = boxRef.current
    if (!box) return

    const measure = () => {
      const width = box.clientWidth
      if (width <= 0) return
      const probe = document.createElement('p')
      probe.className = 'text-sm font-medium leading-5'
      probe.style.cssText = `position:absolute;visibility:hidden;width:${width}px;left:0;top:0;`
      box.appendChild(probe)

      const fits = (text: string, withButton: boolean) => {
        probe.replaceChildren(document.createTextNode(text))
        if (withButton) {
          const more = document.createElement('span')
          more.className = 'ml-1 underline'
          more.textContent = 'More'
          probe.appendChild(more)
        }
        return probe.scrollHeight <= 41
      }

      let nextDisplay = value
      let nextMore = false
      if (!fits(value, false)) {
        let lo = 0
        let hi = value.length
        while (lo < hi) {
          const mid = Math.ceil((lo + hi) / 2)
          const slice = value.slice(0, mid).trimEnd()
          if (fits(`${slice}…`, true)) lo = mid
          else hi = mid - 1
        }
        nextDisplay = `${value.slice(0, lo).trimEnd().replace(/[\s,]+$/, '')}…`
        nextMore = true
      }
      probe.remove()
      setDisplay((current) => (current === nextDisplay ? current : nextDisplay))
      setNeedsMore((current) => (current === nextMore ? current : nextMore))
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(box)
    return () => observer.disconnect()
  }, [value])

  return (
    <div ref={boxRef}>
      <p className="text-sm font-medium leading-5 text-cq-text">
        {display}
        {needsMore ? (
          <>
            {' '}
            <button
              type="button"
              className="text-sm font-medium leading-5 text-black underline underline-offset-2"
              onClick={onRead}
            >
              More
            </button>
          </>
        ) : null}
      </p>
    </div>
  )
}

function ProjectDetailFields({ fields }: { fields: CustomerProjectDetail[] }) {
  const [openLabel, setOpenLabel] = React.useState<string | null>(null)
  const openField = fields.find((field) => field.label === openLabel) ?? null

  return (
    <>
      <dl className="grid grid-cols-5 gap-x-8 gap-y-2 lg:gap-x-10">
        {fields.map((field) => (
          <div key={field.label} className="min-w-0">
            <dt className="text-xs text-cq-text-secondary">{field.label}</dt>
            <dd className="mt-0.5">
              <DetailValue value={field.value} onRead={() => setOpenLabel(field.label)} />
            </dd>
          </div>
        ))}
      </dl>
      <Dialog open={openField != null} onOpenChange={(open) => { if (!open) setOpenLabel(null) }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-black">{openField?.label}</DialogTitle>
            <DialogDescription className="text-sm leading-relaxed text-cq-text">
              {openField?.value}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  )
}

export type CustomerProjectTab =
  | 'overview'
  | 'brief'
  | 'supplier-matching'
  | 'tender'
  | 'survey'
  | 'pricing'
  | 'contract'
  | 'delivery'

const TABS: Array<{ id: CustomerProjectTab; label: string }> = [
  { id: 'overview', label: 'Overview' },
  { id: 'brief', label: 'Brief' },
  { id: 'supplier-matching', label: 'Supplier matching' },
  { id: 'tender', label: 'Tender' },
  { id: 'survey', label: 'Survey' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'contract', label: 'Contract' },
  { id: 'delivery', label: 'Delivery' },
]

const TAB_IDS = TABS.map((t) => t.id)

function tabFromQuery(value: string | null): CustomerProjectTab {
  if (value && TAB_IDS.includes(value as CustomerProjectTab)) {
    return value as CustomerProjectTab
  }
  return 'delivery'
}

const tabTriggerClass = cn(
  'shrink-0 whitespace-nowrap border-b-2 border-transparent px-0.5 py-3 text-sm font-medium outline-none transition-colors',
  'text-cq-text-secondary hover:text-cq-text',
  'data-[state=active]:border-[var(--cq-green)] data-[state=active]:text-black',
)

export function CustomerProjectPage({ projectId }: { projectId: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const project = getCustomerProject(projectId)
  const batch = project ? getBatchForProject(project) : undefined

  const [tab, setTab] = React.useState<CustomerProjectTab>(() =>
    tabFromQuery(searchParams.get('tab')),
  )
  const [matchingAudience, setMatchingAudience] = React.useState<MatchingAudience>('customer')
  const [mounted, setMounted] = React.useState(false)
  const [detailsOpen, setDetailsOpen] = React.useState(true)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    setTab(tabFromQuery(searchParams.get('tab')))
  }, [searchParams])

  const setTabWithUrl = React.useCallback(
    (next: CustomerProjectTab) => {
      setTab(next)
      const params = new URLSearchParams(searchParams.toString())
      if (next === 'delivery') params.delete('tab')
      else params.set('tab', next)
      const qs = params.toString()
      router.replace(`/customer/projects/${projectId}${qs ? `?${qs}` : ''}`, {
        scroll: false,
      })
    },
    [router, searchParams, projectId],
  )

  if (!project) {
    return (
      <div className="mx-auto w-full max-w-screen-2xl px-6 py-10 sm:px-8 lg:px-10">
        <div className="rounded-xl border border-cq-border bg-white px-5 py-10 text-center shadow-sm sm:px-6">
          <p className="text-sm font-medium text-cq-text">Project not found</p>
          <Link
            href="/customer/delivery"
            className="btn-link mt-3 inline-flex"
          >
            Back to Delivery
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-screen-2xl space-y-6 px-6 py-8 sm:px-8 lg:px-10">
      <header className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="min-w-0">
            <h1 className="min-w-0 text-xl font-semibold tracking-tight text-black md:text-2xl">
              {project.name}
            </h1>
            <p className="mt-1.5 text-sm text-cq-text-secondary">
              {projectSubtitle(project)}
              {batch ? ` · ${batch.name}` : ''}
            </p>
          </div>
          <div className="flex shrink-0 flex-row flex-nowrap items-center gap-2">
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
            <button
              type="button"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-cq-border bg-white text-cq-text-secondary hover:bg-cq-bg"
              aria-expanded={detailsOpen}
              aria-label={detailsOpen ? 'Hide project details' : 'Show project details'}
              onClick={() => setDetailsOpen((open) => !open)}
            >
              {detailsOpen ? (
                <ChevronUp className="h-4 w-4" aria-hidden />
              ) : (
                <ChevronDown className="h-4 w-4" aria-hidden />
              )}
            </button>
          </div>
        </div>
        {detailsOpen ? (
          <>
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between lg:gap-10">
              <div className="min-w-0 flex-1">
                <ProjectDetailFields
                  fields={[
                    { label: 'Type', value: project.overview.type },
                    { label: 'Size of installation', value: project.overview.sizeOfInstallation },
                    { label: 'Property', value: project.overview.property },
                    { label: 'Contract value', value: project.overview.contractValue },
                    ...(project.overview.details ?? []),
                  ]}
                />
                {tab === 'supplier-matching' && project.id === 'solar-walter-scott' ? (
                  <div className="mt-4">
                    <ProjectCriteria />
                  </div>
                ) : null}
              </div>
              <div className="relative h-40 w-full shrink-0 overflow-hidden rounded-xl border border-cq-border bg-cq-bg sm:h-44 lg:h-44 lg:w-72">
                <Image
                  src={project.overview.photoUrl}
                  alt={`${project.overview.property} building`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 288px"
                  priority
                />
              </div>
            </div>
          </>
        ) : null}
      </header>

      {mounted ? (
        <Tabs.Root
          className="pt-8"
          value={tab}
          onValueChange={(v) => setTabWithUrl(v as CustomerProjectTab)}
        >
          <div className="flex items-end justify-between gap-4 border-b border-cq-border">
            <Tabs.List
              className="flex min-w-0 flex-1 gap-5 overflow-x-auto sm:gap-7"
              aria-label="Project sections"
            >
              {TABS.map((t) => (
                <Tabs.Trigger key={t.id} value={t.id} className={tabTriggerClass}>
                  {t.label}
                </Tabs.Trigger>
              ))}
            </Tabs.List>
            {tab === 'supplier-matching' && project.id === 'solar-walter-scott' ? (
              <div className="mb-2 shrink-0">
                <MatchingViewSwitch audience={matchingAudience} onChange={setMatchingAudience} />
              </div>
            ) : null}
          </div>

          <Tabs.Content value="delivery" className="pt-6 outline-none">
            <CustomerProjectDeliveryView project={project} />
          </Tabs.Content>

          <Tabs.Content value="supplier-matching" className="pt-6 outline-none">
            {project.id === 'solar-walter-scott' ? (
              <SupplierMatchingReview audience={matchingAudience} />
            ) : (
              <div className="rounded-xl border border-dashed border-cq-border bg-white px-5 py-10 text-center shadow-sm">
                <p className="text-sm font-medium text-cq-text">Supplier matching — coming soon</p>
                <p className="mt-1 text-sm text-cq-text-secondary">
                  Placeholder for the customer supplier matching view.
                </p>
              </div>
            )}
          </Tabs.Content>

          {TABS.filter((t) => t.id !== 'delivery' && t.id !== 'supplier-matching').map((t) => (
            <Tabs.Content
              key={t.id}
              value={t.id}
              className="pt-6 outline-none"
            >
              <div className="rounded-xl border border-dashed border-cq-border bg-white px-5 py-10 text-center shadow-sm">
                <p className="text-sm font-medium text-cq-text">
                  {t.label} — coming soon
                </p>
                <p className="mt-1 text-sm text-cq-text-secondary">
                  Placeholder for the customer {t.label.toLowerCase()} view.
                </p>
              </div>
            </Tabs.Content>
          ))}
        </Tabs.Root>
      ) : (
        <div className="h-40 animate-pulse rounded-xl border border-cq-border bg-white" />
      )}
    </div>
  )
}
