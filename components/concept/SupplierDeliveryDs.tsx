"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Tag } from "@/components/ds/tag";
import { formatGbp } from "@/lib/supplier/delivery/mock-data";
import { parseIso } from "@/lib/supplier/delivery/dates";
import {
  effectiveStageAmount,
  formatPct,
  hasApproximateAmounts,
  hasInvoiceConflict,
} from "@/lib/supplier/delivery/payment-model";
import {
  isStageOverdue,
  resolveStageConfidence,
  shouldNudgeConfirm,
} from "@/lib/supplier/delivery/stage-confidence";
import type { JobDeliveryStage } from "@/lib/supplier/delivery/job-types";
import type { DeliveryPanelApi } from "@/components/supplier/delivery/SupplierJobDeliveryView";
import { Button, Card, Chip } from "./ui";

/**
 * The supplier asset page's Delivery tab in the design system (C17, 25 Nov).
 * Same data, state and modals as today's panel; only the drawing changes.
 */

/** "9 Oct", dates as the design system writes them. */
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function day(iso: string) {
  const d = parseIso(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

function approx(stage: JobDeliveryStage) {
  return stage.amountSource === "model" && stage.status !== "paid" && stage.status !== "invoiced";
}

function money(stage: JobDeliveryStage, amount: number) {
  return approx(stage) ? `≈ ${formatGbp(amount)}` : formatGbp(amount);
}

function fullDay(iso: string) {
  return `${day(iso)} ${parseIso(iso).getFullYear()}`;
}

function dateLabel(stage: JobDeliveryStage) {
  return stage.est || stage.status === "upcoming" ? `Est. ${day(stage.date)}` : day(stage.date);
}

function lead(stage: JobDeliveryStage): "done" | "now" | "next" {
  if (stage.status === "paid" || stage.status === "invoiced") return "done";
  if (stage.status === "next") return "now";
  return "next";
}

function StatusTag({ stage }: { stage: JobDeliveryStage }) {
  if (stage.name === "Complete") return null;
  if (isStageOverdue(stage)) return <Tag type="danger" dot>Stuck</Tag>;
  if (stage.status === "paid") return <Tag type="success" dot>Paid</Tag>;
  if (stage.status === "invoiced") return <Tag type="success" dot>Issued</Tag>;
  if (stage.status === "next") return <Tag>Next</Tag>;
  return <Tag>Estimate</Tag>;
}

function KeyCard({ label, value, line, needsYou }: { label: string; value: string; line: ReactNode; needsYou?: boolean }) {
  return (
    <section
      className={cn(
        "flex flex-col gap-1 rounded-lg border border-border-dark bg-bg-container p-4",
        needsYou && "border-t-4 border-t-brand-6",
      )}
    >
      <p className="s3 text-text-tertiary">{label}</p>
      <p className="h3 text-text-primary [font-variant-numeric:normal]">{value}</p>
      <p className="p7 text-text-secondary">{line}</p>
    </section>
  );
}

export function SupplierDeliveryTab(api: DeliveryPanelApi) {
  const { job } = api;
  const settled = job.confirmStatus === "settled";
  const next =
    job.stages.find((s) => s.status === "next") ?? job.stages.find((s) => s.name === job.currentStage);
  const paying = job.stages.filter((s) => s.name !== "Complete");
  const n = job.stages.length;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 md:grid-cols-3">
        <KeyCard
          label="Invoiceable now"
          value={formatGbp(job.dueNow)}
          line={next && next.name !== "Complete" ? `${next.name} · ${day(next.date)}` : "No stage ready"}
          needsYou={job.dueNow > 0 && !settled}
        />
        <KeyCard label="Job value" value={formatGbp(job.gmv)} line={`Across ${paying.length} stages`} />
        <KeyCard
          label="CQuel's commission"
          value={formatPct(job.commissionPct)}
          line={`${hasApproximateAmounts(job.stages) ? "≈ " : ""}${formatGbp(job.commissionAmount)} on ${formatGbp(job.gmv)}`}
        />
      </div>

      <Card title="Delivery phases">
        <div className="relative py-2">
          {n > 1 && (
            <div
              className="absolute top-[19px] h-0.5 bg-border-dark"
              style={{ left: `${50 / n}%`, right: `${50 / n}%` }}
              aria-hidden
            />
          )}
          <ol className="relative z-10 grid" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
            {job.stages.map((stage) => {
              const current = stage.status === "next";
              const overdue = current && isStageOverdue(stage);
              const nudge = shouldNudgeConfirm(stage, { isCurrent: current, settled });
              const conf = resolveStageConfidence(stage).confidence;
              return (
                <li key={stage.name} className="flex min-w-0 flex-col items-center gap-1.5 px-2 text-center">
                  <Chip lead={lead(stage)}>{stage.name}</Chip>
                  {stage.name !== "Complete" && (
                    <>
                      <p className="p6 text-text-primary">
                        {formatPct(stage.pct)} · {money(stage, effectiveStageAmount(stage))}
                      </p>
                    </>
                  )}
                  <button
                    type="button"
                    disabled={settled}
                    onClick={() => api.onDateClick(stage)}
                    className={cn(
                      "p7 underline-offset-2 outline-none hover:underline focus-visible:shadow-focus disabled:no-underline",
                      overdue ? "text-status-danger-text" : "text-text-secondary hover:text-text-primary",
                    )}
                    aria-label={`Change date for ${stage.name}`}
                  >
                    {overdue
                      ? `Overdue since ${day(stage.date)}`
                      : stage.status === "paid" || stage.status === "invoiced" || conf === "confirmed"
                        ? day(stage.date)
                        : conf === "likely"
                          ? `Likely ${day(stage.date)}`
                          : `Est. ${day(stage.date)}`}
                  </button>
                  {overdue && (
                    <Button className="mt-3" onClick={() => api.onUploadInvoice(stage)}>
                      Upload invoice
                    </Button>
                  )}
                  {nudge && (
                    <Button className="mt-3" onClick={api.onYes}>
                      Yes, raise it
                    </Button>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      </Card>

      <Card
        title="Payment stages and dates"
        right={
          <Button type="secondary" size="small" onClick={api.onEditPlan} disabled={settled}>
            Edit plan
          </Button>
        }
        bodyClassName="p-0"
      >
        <div className={cn(GRID, "border-b border-border-light px-4 py-2 pl-8")}>
          {["Stage", "%", "Amount", "Commission", "Date", "Status"].map((h) => (
            <span key={h} className="s3 text-text-tertiary">
              {h}
            </span>
          ))}
        </div>
        {paying.map((stage, i) => {
          const amount = effectiveStageAmount(stage);
          const commission = Math.round((amount * job.commissionPct) / 100);
          const conflict = hasInvoiceConflict(stage) && stage.invoiceAmount != null;
          return (
            <div key={stage.name} className={cn(i < paying.length - 1 && "border-b border-border-light")}>
              <div className={cn(GRID, "items-center px-4 py-3 pl-8")}>
                <span className="p6 text-text-primary">{stage.name}</span>
                <span className="h8 text-text-primary">{formatPct(stage.pct)}</span>
                <span className="h8 text-text-primary">{money(stage, amount)}</span>
                <span className="p6 text-text-primary">{money(stage, commission)}</span>
                <button
                  type="button"
                  disabled={settled}
                  onClick={() => api.onDateClick(stage)}
                  className="w-fit p6 text-left text-text-primary underline-offset-2 outline-none hover:underline focus-visible:shadow-focus disabled:no-underline"
                  aria-label={`Change date for ${stage.name}`}
                >
                  {stage.est || stage.status === "upcoming" ? `Est. ${fullDay(stage.date)}` : fullDay(stage.date)}
                </button>
                <span>
                  <StatusTag stage={stage} />
                </span>
              </div>
              {conflict && (
                <div className="flex flex-wrap items-center justify-between gap-3 px-4 pb-3 pl-8">
                  <p className="p7 text-text-secondary">
                    Plan said {formatGbp(stage.amount)}, the invoice says {formatGbp(stage.invoiceAmount!)}.
                  </p>
                  <span className="flex gap-2">
                    <Button type="secondary" size="small" onClick={() => api.onUseInvoiceAmount(stage)}>
                      Use invoice amount
                    </Button>
                    <Button type="secondary" size="small" onClick={() => api.onKeepModel(stage)}>
                      Keep plan
                    </Button>
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </Card>

      <Card
        title="Additional invoices"
        right={
          !settled && (
            <Button type="link" icon="upload" onClick={() => api.onUploadInvoice()}>
              Provide an additional invoice
            </Button>
          )
        }
      >
        <p className="p6 text-text-secondary">
          No additional invoices yet. Use these for work outside the payment plan, such as a meter or roof repair.
        </p>
      </Card>
    </div>
  );
}

const GRID =
  "grid grid-cols-[minmax(0,1.5fr)_minmax(0,0.3fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] gap-x-6";
