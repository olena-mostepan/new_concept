'use client'

import * as React from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { Building2 } from 'lucide-react'
import { toast } from 'sonner'
import { AnswerActionMenu } from '@/components/supplier/AnswerActionMenu'
import { AddDetailsForm } from '@/components/supplier/AddDetailsForm'
import { BlockedConfirmDialog } from '@/components/supplier/BlockedConfirmDialog'
import { UploadFilesModal } from '@/components/supplier/UploadFilesModal'
import { DEFAULT_BID_CONTEXT_322, DEMO_SUPPLIER_ID } from '@/lib/clarifications/mock-data'
import {
  courtFromPerspective,
  isVisibleToDemoSupplier,
} from '@/lib/clarifications/perspective'
import { useClarifications } from '@/lib/clarifications/store'

const CONTEXT_ORDER = ['Total CapEx', 'PPA rate', 'Maintenance', 'Warranty']

export default function SupplierAnswerPage() {
  const router = useRouter()
  const params = useParams()
  const rawId = params?.id as string | undefined
  const {
    items,
    submitSupplierTextReply,
    submitSupplierAttachmentReply,
    submitSupplierBlocked,
  } = useClarifications()

  const item = rawId ? items.find((x) => x.id === rawId) : undefined

  const [uploadOpen, setUploadOpen] = React.useState(false)
  const [blockedOpen, setBlockedOpen] = React.useState(false)
  const [inlineReply, setInlineReply] = React.useState(false)

  if (!item || !isVisibleToDemoSupplier(item, DEMO_SUPPLIER_ID)) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <p className="text-cq-text-secondary">This clarification could not be found.</p>
        <Link
          href="/supplier/clarifications"
          className="mt-4 inline-block font-bold text-cq-link underline"
        >
          Back to clarifications
        </Link>
      </div>
    )
  }

  const canAnswer =
    item.status === 'awaiting' && courtFromPerspective(item, 'supplier') === 'your'

  const ctxLines = item.bidContext ?? DEFAULT_BID_CONTEXT_322
  const orderedKeys = [
    ...CONTEXT_ORDER.filter((k) => k in ctxLines),
    ...Object.keys(ctxLines).filter((k) => !CONTEXT_ORDER.includes(k)),
  ]

  const submittedLine = [item.bidSubmittedLabel, item.bidLabel].filter(Boolean).join(' · ')

  const handleAfterSubmit = (msg: string) => {
    toast.success(msg)
    router.push('/supplier/clarifications')
  }

  return (
    <div className="mx-auto w-full max-w-[720px] px-6 pb-20 pt-8 sm:px-8">
      <article className="space-y-5">
        <header className="flex gap-4 rounded-xl border border-cq-border bg-white p-5 sm:p-6">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-cq-border bg-cq-bg">
            <Building2 className="h-6 w-6 text-cq-text-secondary" aria-hidden />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-extrabold leading-tight text-cq-text sm:text-2xl">
              {item.project}
            </h1>
            <p className="mt-1 text-sm text-cq-text-secondary">{submittedLine}</p>
          </div>
        </header>

        <section className="rounded-xl border border-[rgba(28,117,188,0.12)] bg-[rgba(28,117,188,0.06)] px-5 py-4 sm:p-6">
          <p className="text-sm font-bold text-cq-text">
            Sent {item.raisedAgo} by {item.raisedBy}:
          </p>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-cq-text">
            {item.question}
          </p>
        </section>

        <section className="rounded-xl border border-cq-border bg-white p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <h2 className="text-base font-bold text-cq-text">Context</h2>
            {canAnswer && !inlineReply ? (
              <AnswerActionMenu
                onUploadFiles={() => setUploadOpen(true)}
                onAddDetails={() => setInlineReply(true)}
                onBlocked={() => setBlockedOpen(true)}
              />
            ) : null}
          </div>

          {inlineReply && canAnswer ? (
            <div className="mt-4">
              <AddDetailsForm
                onCancel={() => setInlineReply(false)}
                onSend={(text) => {
                  submitSupplierTextReply(item.id, text)
                  setInlineReply(false)
                  handleAfterSubmit('Reply sent — CQuel will review')
                }}
              />
            </div>
          ) : (
            <dl className="mt-4 space-y-3">
              {orderedKeys.map((label) => {
                const value = ctxLines[label]
                const linked = item.linkedField === label
                return (
                  <div
                    key={label}
                    className={
                      linked
                        ? 'rounded-r-md border-l-2 border-[var(--cq-green)] bg-cq-bg/50 py-2 pl-3 pr-2'
                        : 'border-l-2 border-transparent py-2 pl-3'
                    }
                  >
                    <dt className="text-xs font-semibold uppercase tracking-wide text-cq-text-secondary">
                      {label}
                    </dt>
                    <dd className="mt-0.5 text-sm font-medium text-cq-text">
                      {value}
                      {linked ? (
                        <span className="ml-2 font-normal text-cq-text-secondary">
                          ← question is about this
                        </span>
                      ) : null}
                    </dd>
                  </div>
                )
              })}
            </dl>
          )}
        </section>

        {!canAnswer ? (
          <p className="rounded-xl border border-cq-border bg-white p-4 text-sm text-cq-text-secondary">
            {item.status === 'applied'
              ? 'This clarification was accepted — no further action needed.'
              : item.status === 'closed'
                ? 'This thread is closed.'
                : "You've replied — CQuel is reviewing. You'll see updates here once they respond."}
          </p>
        ) : null}

        <div className="flex justify-start">
          <Link
            href="/supplier/clarifications"
            className="rounded-lg border border-cq-border bg-white px-4 py-2 text-sm font-bold text-cq-text hover:bg-cq-bg"
          >
            Back to clarifications
          </Link>
        </div>
      </article>

      <UploadFilesModal
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        questionText={item.question}
        onUpload={(files) => {
          submitSupplierAttachmentReply(item.id, files)
          handleAfterSubmit('Files uploaded — CQuel will review')
        }}
      />

      <BlockedConfirmDialog
        open={blockedOpen}
        onOpenChange={setBlockedOpen}
        onConfirm={() => {
          submitSupplierBlocked(item.id)
          setBlockedOpen(false)
          handleAfterSubmit("CQuel notified — they'll provide more info or rephrase")
        }}
      />
    </div>
  )
}
