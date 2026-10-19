import { TenderDetailHeader } from '@/components/clarifications/TenderDetailHeader'
import { QuestionTypeBadge } from '@/components/questions/QuestionTypeBadge'
import {
  clarificationBidId,
  clarificationProjectLabel,
} from '@/lib/clarifications/mock-data'
import { siteAddressForProjectLabel } from '@/lib/clarifications/site-address'
import type { TenderQuestion } from '@/lib/questions/types'

export function AiQuestionDetailHeader({ question }: { question: TenderQuestion }) {
  const project = clarificationProjectLabel(question.tenderSlug)
  const address = siteAddressForProjectLabel(project)
  const bidId = clarificationBidId(question.tenderSlug)
  const visible = question.answers.filter((a) => a.status !== 'not_asked')
  const answered = visible.filter(
    (a) => a.status === 'answered' || a.status === 'partial',
  ).length

  return (
    <TenderDetailHeader
      project={project}
      address={address}
      meta={
        <p className="text-sm text-cq-text-secondary">
          Bid {bidId} · Asked {question.ageLabel}
        </p>
      }
      footer={
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <QuestionTypeBadge type="ai" />
            <p className="text-sm font-semibold text-cq-text">
              {answered} of {visible.length} suppliers answered
              <span className="font-medium text-cq-text-secondary">
                {' '}
                · Extracted from bids
              </span>
            </p>
          </div>
        </div>
      }
      footerClassName="sm:items-start"
    />
  )
}
