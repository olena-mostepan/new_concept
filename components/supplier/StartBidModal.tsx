'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AlertCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import { START_BID_SECTIONS } from '@/lib/supplier/bid/start-bid-questions'
import { markComplianceNeedsReview } from '@/lib/supplier/compliance-review'
import { BEKA_SOLAR_PROFILE, normalizeSupplierProfile } from '@/lib/supplier/profile/mock-data'
import { computeProfileScore } from '@/lib/supplier/profile/scoring'

const PROFILE_SCORE = computeProfileScore(normalizeSupplierProfile(BEKA_SOLAR_PROFILE)).overall

export function StartBidModal({
  open,
  onOpenChange,
  projectName,
  onStart,
  profileScore = PROFILE_SCORE,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectName: string
  onStart?: () => void
  profileScore?: number
}) {
  const router = useRouter()
  const showProfileAlert = profileScore < 100

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex max-h-[calc(100dvh-2rem)] w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl"
      >
        {showProfileAlert ? (
          <div className="flex shrink-0 flex-wrap items-center gap-3 border-b border-[#ffcccc] bg-[#fff0f0] px-6 py-3 sm:gap-5 sm:px-8">
            <div
              className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full"
              style={{
                background: `conic-gradient(#FF0000 ${profileScore * 3.6}deg, #ffffff 0deg)`,
              }}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fff0f0]">
                <span className="text-xs font-extrabold text-cq-text">{profileScore}%</span>
              </div>
            </div>
            <p className="min-w-0 flex-1 pr-2 text-sm leading-snug text-cq-text sm:pr-4">
              Your profile is still missing information. Fill it out to maximise your chances of
              winning the tender.
            </p>
            <button
              type="button"
              onClick={() => {
                onOpenChange(false)
                router.push('/supplier/profile')
              }}
              className="ml-auto shrink-0 rounded-md border border-[#FF0000] bg-transparent px-3.5 py-2 text-sm font-semibold text-[#FF0000] hover:bg-[#ffe0e0]"
            >
              Complete profile
            </button>
          </div>
        ) : null}

        <div className="flex-1 overflow-y-auto px-6 pt-6 pb-4 sm:px-8 sm:pt-8">
          <DialogTitle className="sr-only">Start Your Bid — {projectName}</DialogTitle>
          <DialogDescription className="sr-only">
            Review the questions you will need to answer to submit your bid for {projectName}.
          </DialogDescription>

          <p className="text-base font-bold text-cq-text">{projectName}</p>
          <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-cq-text sm:text-[1.75rem]">
            Start Your Bid
          </h2>
          <p className="mt-2 text-sm text-cq-text-secondary">
            In order to submit your bid you will need to answer the questions listed below.
          </p>

          <div className="mt-5 rounded-lg border border-[var(--cq-link)]/25 bg-[rgba(28,117,188,0.09)] px-4 py-3.5">
            <div className="flex items-start gap-2.5">
              <AlertCircle
                className="mt-0.5 h-4 w-4 shrink-0 text-[var(--cq-link)]"
                aria-hidden
              />
              <div>
                <p className="text-sm font-bold text-[var(--cq-link)]">Before you submit</p>
                <ul className="mt-2 list-disc space-y-1 pl-4 text-sm leading-relaxed text-cq-text">
                  <li>Please ensure your answers are accurate</li>
                  <li>
                    Your progress will be saved to your device when you click &apos;Next&apos; on
                    each section
                  </li>
                  <li>
                    If anything changes with your bid, you can always make edits before the
                    deadline
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-6 divide-y divide-cq-border">
            {START_BID_SECTIONS.map((section) => (
              <section key={section.id} className="py-5 first:pt-0 last:pb-0">
                <h3 className="text-base font-semibold text-cq-text">{section.title}</h3>
                <ul className="mt-2">
                  {section.questions.map((question) => (
                    <li key={question.id} className="px-1 py-2.5">
                      <p className="text-sm font-medium leading-snug text-cq-text">
                        {question.label}
                        {!question.required ? (
                          <span className="ml-1 font-normal text-cq-muted">(optional)</span>
                        ) : null}
                      </p>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-cq-border bg-white px-6 py-4 sm:px-8">
          <Link
            href="/supplier"
            onClick={() => onOpenChange(false)}
            className="btn-link"
          >
            ← Back to dashboard
          </Link>
          <button
            type="button"
            onClick={() => {
              // Prototype: treat starting a bid as leaving draft → submitted path.
              markComplianceNeedsReview()
              onStart?.()
              onOpenChange(false)
            }}
            className="btn-primary"
          >
            Start
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
