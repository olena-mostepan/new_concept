"use client";

import Link from "next/link";
import type { ReactNode, Ref } from "react";
import { cn } from "@/lib/utils";
import { formatGbp } from "@/lib/supplier/delivery/mock-data";
import { claimNarrative } from "@/lib/supplier/delivery/claim-copy";
import type { ClaimRowProps } from "@/components/supplier/delivery/ClaimRow";
import type { DeliveryViewLook } from "@/components/supplier/delivery/SupplierDeliveryView";
import { Button, Chip } from "./ui";

/**
 * The supplier Delivery list in the design system (25 Nov).
 * Same data, review flow and windows as today's list; only the drawing changes.
 */

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function day(iso: string) {
  const d = new Date(`${iso}T12:00:00`);
  return Number.isNaN(d.getTime()) ? "" : `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

function Banner({
  sumProjected,
  commission,
}: {
  sumProjected: number;
  commission: number;
  onLooksRight: () => void;
  onSomethingsOff: () => void;
}) {
  // Today's cash picture, same words; on the info ground instead of the orange wash.
  return (
    <section className="flex items-center gap-4 rounded-lg border border-status-info-border bg-status-info-bg p-4">
      <div className="min-w-0 flex-1">
      <p className="s3 text-status-info-text">Cash picture</p>
      <p className="mt-2 h6 font-normal text-text-primary">
        Based on this picture, you'll invoice <span className="font-semibold">{formatGbp(sumProjected)}</span> over the next 3 months
        and owe CQuel <span className="font-semibold">{formatGbp(commission)}</span> commission.
      </p>
      <p className="mt-1 p7 text-text-secondary">
        If a date or stage is wrong, your cash flow and commission are wrong too. Please tell your CQuel representative if
        you notice any errors.
      </p>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/icons/services/cash.png" alt="" className="-my-2 size-[116px] shrink-0 object-contain" />
    </section>
  );
}

function ReviewBar({ count, pickAny, onExit }: { count: number; pickAny: boolean; onExit: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border-light bg-black-1 px-4 py-3 pl-8">
      <p className="p6 text-text-primary">
        {pickAny ? "Everything looks confident. Pick anything that's wrong." : `${count} to check`}
      </p>
      <Button type="link" onClick={onExit}>
        {pickAny ? "Done" : "Stop checking"}
      </Button>
    </div>
  );
}

function List({ listRef, reviewBar, children }: { listRef: Ref<HTMLElement>; reviewBar: ReactNode; children: ReactNode }) {
  return (
    <section ref={listRef} className="overflow-hidden rounded-lg border border-border-dark bg-bg-container">
      <header className="border-b border-border-light px-4 py-3">
        <h2 className="h7 text-text-primary">Your jobs</h2>
      </header>
      {reviewBar}
      <ul>{children}</ul>
    </section>
  );
}

const GRID = "minmax(0,1fr) minmax(0,2.2fr) 200px";

/** The job's stages as on today's list: every stage, a chip each, its date under it. */
function Stages({
  stages,
  currentStage,
  settled,
  onDate,
}: {
  stages: ClaimRowProps["claim"]["stages"];
  currentStage: string;
  settled: boolean;
  onDate?: (name: string) => void;
}) {
  const n = stages.length;
  const cur = Math.max(0, stages.findIndex((s) => s.name === currentStage));
  return (
    <div className="relative">
      {n > 1 && (
        <div
          className="absolute top-[11px] h-0.5 bg-border-dark"
          style={{ left: `${50 / n}%`, right: `${50 / n}%` }}
          aria-hidden
        />
      )}
      <ol className="relative z-10 grid" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
        {stages.map((s, i) => {
          const lead = settled || s.done || i < cur ? "done" : i === cur ? "now" : "next";
          return (
            <li key={`${s.name}-${i}`} className="flex min-w-0 flex-col items-center gap-1 px-1 text-center">
              <Chip lead={lead}>{s.name}</Chip>
              {s.projectedDate && (
                <button
                  type="button"
                  disabled={!onDate}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDate?.(s.name);
                  }}
                  className="p7 text-text-secondary underline-offset-2 outline-none hover:text-text-primary hover:underline focus-visible:shadow-focus disabled:no-underline"
                  aria-label={`Change date for ${s.name}`}
                >
                  {lead === "next" ? `Est. ${day(s.projectedDate)}` : day(s.projectedDate)}
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function Row({
  claim,
  rowRef,
  onStageClick,
  onProvideInvoice,
  reviewHighlighted = false,
  reviewDimmed = false,
  reviewActions,
}: ClaimRowProps) {
  const { claimLine, moneyLine } = claimNarrative(claim);
  const settled = claim.status === "settled";
  const stuck = claim.status === "stuck";
  return (
    <li
      ref={rowRef}
      id={`claim-${claim.id}`}
      className={cn(
        "grid items-start gap-x-8 border-b border-border-light px-4 py-3 pl-8 last:border-b-0",
        reviewHighlighted && "bg-bg-accent",
        reviewDimmed && "opacity-40",
      )}
      style={{ gridTemplateColumns: GRID }}
    >
      <div className="flex min-w-0 flex-col gap-3">
        <div>
          <Link
            href={`/concept/supplier/delivery/${claim.id}`}
            className="h8 text-text-title underline-offset-2 outline-none hover:underline focus-visible:shadow-focus"
          >
            {claim.job}
          </Link>
          <p className={cn("mt-0.5 p7", stuck ? "text-status-danger-text" : "text-text-secondary")}>
            {claimLine.replace(/\.$/, "").replace(/'/g, "")}
          </p>
        </div>
        <p className={cn("p6", settled ? "text-text-tertiary" : "text-text-primary")}>{moneyLine}</p>
      </div>
      <Stages
        stages={claim.stages}
        currentStage={claim.currentStage}
        settled={settled}
        onDate={reviewDimmed || !onStageClick ? undefined : (name) => onStageClick(claim, name)}
      />
      <div className="flex flex-wrap justify-end gap-2">
        {reviewActions ? (
          <>
            <Button type="secondary" size="small" onClick={reviewActions.onLooksFine}>
              Looks fine
            </Button>
            <Button type="secondary" size="small" onClick={reviewActions.onChangeDate}>
              Change date
            </Button>
            {reviewActions.onSkip && (
              <Button type="tertiary" size="small" onClick={reviewActions.onSkip}>
                Skip
              </Button>
            )}
          </>
        ) : (
          !reviewDimmed &&
          !settled && (
            <Button type="tertiary" size="small" icon="upload" onClick={() => onProvideInvoice(claim)}>
              Provide an invoice
            </Button>
          )
        )}
      </div>
    </li>
  );
}

export const DELIVERY_DS_LOOK: DeliveryViewLook = { Banner, ReviewBar, Row, List };
