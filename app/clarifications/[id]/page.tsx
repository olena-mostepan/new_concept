'use client'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ImpactReviewCard } from '@/components/clarifications/ImpactReviewCard'
import { ClarificationReviewHeader } from '@/components/clarifications/ClarificationReviewHeader'
import { QuestionPromptSection } from '@/components/clarifications/QuestionPromptSection'
import { AttachmentsAccordion } from '@/components/clarifications/AttachmentsAccordion'
import {
  getDispatchSiblingNav,
  getDispatchSiblings,
} from '@/lib/clarifications/dispatch'
import { sectionFromPerspective } from '@/lib/clarifications/perspective'
import { useClarifications } from '@/lib/clarifications/store'
import { toast } from 'sonner'

const btnGhost =
  'rounded-lg border border-cq-border bg-white px-4 py-2.5 text-sm font-bold text-cq-text hover:bg-cq-bg'

export default function ClarificationReviewPage() {
  const router = useRouter()
  const params = useParams()
  const rawId = params?.id as string | undefined
  const { items, acceptClarification } = useClarifications()
  const item = rawId ? items.find((x) => x.id === rawId) : undefined

  if (!item) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <p className="text-cq-text-secondary">This clarification could not be found.</p>
        <Link href="/clarifications" className="mt-4 inline-block font-bold text-cq-link underline">
          Back to clarifications
        </Link>
      </div>
    )
  }

  const canApply =
    sectionFromPerspective(item, 'ops') === 'needs_attention' &&
    item.reply &&
    item.impact

  const siblings = getDispatchSiblings(items, item.dispatchId)
  const dispatchNav = getDispatchSiblingNav(siblings, item.id)

  return (
    <div className="mx-auto w-full max-w-[720px] px-6 pb-20 pt-6 sm:px-8">
      <article className="space-y-5">
        <ClarificationReviewHeader
          item={item}
          prev={dispatchNav.prev}
          next={dispatchNav.next}
          index={dispatchNav.index}
          total={dispatchNav.total}
        />

        <QuestionPromptSection question={item.question} linkedField={item.linkedField} />

        {item.reply ? (
          <section className="rounded-xl border border-cq-border bg-white p-5 sm:p-6">
            <h2 className="text-base font-bold text-cq-text">Supplier answer</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-cq-text">
              {item.reply.text}
            </p>
            <div className="mt-4 flex flex-col gap-2 text-xs text-cq-text-secondary sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <span>
                From <span className="font-semibold text-cq-text">{item.reply.from}</span> ·{' '}
                <span className="font-semibold text-cq-text">{item.reply.fromCompany}</span> ·{' '}
                {item.reply.timeAgo}
              </span>
              <span className="flex flex-wrap gap-x-4">
                Source:{' '}
                <span className="font-semibold lowercase text-cq-text">{item.reply.source}</span>
                Trust:{' '}
                <span className="font-semibold lowercase text-cq-text">{item.reply.trust}</span>
              </span>
            </div>
            {item.reply.attachments?.length ? (
              <div className="mt-4">
                <AttachmentsAccordion attachments={item.reply.attachments} />
              </div>
            ) : null}
          </section>
        ) : (
          <section className="rounded-xl border border-dashed border-cq-border bg-cq-bg/40 px-5 py-8 text-center sm:p-6">
            <p className="text-sm font-semibold text-cq-text">No answer yet</p>
            <p className="mt-1 text-sm text-cq-text-secondary">
              {item.supplier} has not replied — use Previous / Next to review other suppliers.
            </p>
          </section>
        )}

        {item.impact ? (
          <ImpactReviewCard
            impact={item.impact}
            supplierAnswerName={
              item.reply
                ? `${item.reply.from} (${item.reply.fromCompany})`
                : item.supplier
            }
          />
        ) : null}

        <div className="flex flex-col gap-3 border-t border-cq-border pt-5 sm:flex-row sm:flex-wrap sm:justify-end">
          <Link href="/clarifications" className={`${btnGhost} order-3 sm:order-none`}>
            Cancel
          </Link>
          <button
            type="button"
            className={`${btnGhost} order-2 sm:order-none`}
            onClick={() => router.back()}
          >
            Reask
          </button>
          {canApply ? (
            <button
              type="button"
              onClick={() => {
                acceptClarification(item.id)
                toast.success('Applied to Bid ' + item.bidId, {
                  description: 'Tender results regenerating',
                })
                router.push('/clarifications')
              }}
              className="order-1 rounded-lg bg-[var(--cq-green)] px-5 py-2.5 text-sm font-bold text-white hover:bg-[var(--cq-green-hover)] sm:order-none"
            >
              Accept change
            </button>
          ) : null}
        </div>
      </article>
    </div>
  )
}
