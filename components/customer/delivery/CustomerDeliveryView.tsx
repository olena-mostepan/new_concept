"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, ListChecks } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { sectionTitleClass } from "@/lib/ui/headings";
import {
  INITIAL_CUSTOMER_DELIVERY,
  confirmProjectPhase,
  patchProjectDates,
  recountConfirmations,
} from "@/lib/customer/delivery/mock-data";
import type {
  CustomerDeliveryPayload,
  CustomerProject,
} from "@/lib/customer/delivery/types";
import { nAssets, WORDS } from "@/lib/concept/words";
import { Chip } from "@/components/concept/ui";
import { CustomerChangeDateModal } from "@/components/customer/delivery/CustomerChangeDateModal";
import { MoneyWashCard } from "@/components/supplier/delivery/MoneyWashCard";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function dayMonth(iso: string) {
  const [, month, day] = iso.slice(0, 10).split("-").map(Number);
  return `${day} ${MONTHS[(month ?? 1) - 1]}`;
}

function needsDateConfirm(project: CustomerProject): boolean {
  return !project.startConfirmed || project.needsConfirm;
}

function phaseChip(project: CustomerProject) {
  const allDone = project.phases.every((phase) => phase.status === "done");
  if (allDone || project.insight === "complete") {
    return { lead: "done" as const, label: "Complete" };
  }
  if (
    project.insight === "awaiting_start" ||
    (project.currentPhaseId === "start" && !project.startDate)
  ) {
    return { lead: "next" as const, label: "Start" };
  }
  const current =
    project.phases.find((phase) => phase.status === "current") ??
    project.phases.find((phase) => phase.id === project.currentPhaseId);
  return { lead: "now" as const, label: current?.label ?? "Start" };
}

function statusOf(project: CustomerProject) {
  if (project.needsConfirm) {
    return { text: "Date to confirm", className: "h8 text-text-primary" };
  }
  if (
    project.insight === "complete" ||
    project.phases.every((phase) => phase.status === "done")
  ) {
    const done = project.phases.find((phase) => phase.id === "complete");
    const when = done?.date ? dayMonth(done.date) : "";
    return {
      text: when ? `Handed over ${when}` : "Handed over",
      className: "p6 text-text-primary",
    };
  }
  if (project.insight === "overdue") {
    return { text: "Overdue", className: "p6 text-status-danger-text" };
  }
  if (project.insight === "awaiting_start" || !project.startDate) {
    return { text: "Awaiting start", className: "p6 text-text-primary" };
  }
  return { text: "On track", className: "p6 text-text-primary" };
}

function DeliveryStatus({ project }: { project: CustomerProject }) {
  const status = statusOf(project);
  return <span className={status.className}>{status.text}</span>;
}

function buildConfirmQueue(projects: CustomerProject[]): string[] {
  return projects.filter(needsDateConfirm).map((p) => p.id);
}

export function CustomerDeliveryView({
  payload: payloadProp,
  onPayloadChange,
  projectHref,
  embedded = false,
  showBanner = true,
  showList = true,
  showCity = false,
  conceptRows = false,
  bare = false,
  bannerDetail,
  rowLinks = false,
  buildingColumn = false,
  isChanged,
  previewLimit,
}: {
  payload?: CustomerDeliveryPayload;
  onPayloadChange?: (next: CustomerDeliveryPayload) => void;
  projectHref?: (project: CustomerProject) => string;
  embedded?: boolean;
  showBanner?: boolean;
  showList?: boolean;
  showCity?: boolean;
  conceptRows?: boolean;
  bare?: boolean;
  bannerDetail?: string;
  /** Whole row opens the project. Pending dates stay as text. */
  rowLinks?: boolean;
  /** Workstream overview: building name, city underneath, optional changed dot. */
  buildingColumn?: boolean;
  isChanged?: (project: CustomerProject) => boolean;
  /** Hide rows past this count until Show all. Omitted lists every project. */
  previewLimit?: number;
} = {}) {
  const router = useRouter();
  const [uncontrolled, setUncontrolled] =
    React.useState<CustomerDeliveryPayload>(INITIAL_CUSTOMER_DELIVERY);
  const payload = payloadProp ?? uncontrolled;
  const setPayload = (
    value:
      | CustomerDeliveryPayload
      | ((prev: CustomerDeliveryPayload) => CustomerDeliveryPayload),
  ) => {
    const next = typeof value === "function" ? value(payload) : value;
    if (onPayloadChange) onPayloadChange(next);
    else setUncontrolled(next);
  };
  const [confirmProjectId, setConfirmProjectId] = React.useState<string | null>(
    null,
  );
  const [reviewMode, setReviewMode] = React.useState(false);
  const [reviewQueue, setReviewQueue] = React.useState<string[]>([]);
  const [showAllProjects, setShowAllProjects] = React.useState(false);
  const [clearedIds, setClearedIds] = React.useState<string[]>([]);
  const rowRefs = React.useRef<Record<string, HTMLTableRowElement | null>>({});
  const listRef = React.useRef<HTMLDivElement | null>(null);

  const projectsById = React.useMemo(() => {
    const map = new Map(payload.projects.map((p) => [p.id, p]));
    return map;
  }, [payload.projects]);

  const confirmProject = projectsById.get(confirmProjectId ?? "");

  const activeQueue = React.useMemo(() => {
    const cleared = new Set(clearedIds);
    return reviewQueue.filter((id) => {
      if (cleared.has(id)) return false;
      const p = projectsById.get(id);
      return p ? needsDateConfirm(p) : false;
    });
  }, [reviewQueue, clearedIds, projectsById]);

  const patchProject = (
    id: string,
    updater: (p: CustomerProject) => CustomerProject,
  ) => {
    setPayload((prev) => {
      const projects = prev.projects.map((p) => (p.id === id ? updater(p) : p));
      return recountConfirmations({ ...prev, projects });
    });
  };

  function scrollToProject(id: string) {
    requestAnimationFrame(() => {
      rowRefs.current[id]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    });
  }

  function exitReview() {
    setReviewMode(false);
    setReviewQueue([]);
    setClearedIds([]);
    setConfirmProjectId(null);
  }

  function completeReview() {
    exitReview();
    toast.success("All dates checked — project tracking is up to date.");
  }

  function openForProject(id: string) {
    setConfirmProjectId(id);
    scrollToProject(id);
  }

  function advancePast(id: string) {
    const cleared = new Set([...clearedIds, id]);
    setClearedIds([...cleared]);
    const next = reviewQueue.find((qid) => !cleared.has(qid));
    if (!next) {
      completeReview();
      return;
    }
    openForProject(next);
  }

  function startReview() {
    const queue = buildConfirmQueue(payload.projects);
    if (queue.length === 0) {
      toast.message("Nothing left that needs confirmation");
      return;
    }
    setReviewMode(true);
    setReviewQueue(queue);
    setClearedIds([]);
    listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    openForProject(queue[0]!);
  }

  function applyConfirm(project: CustomerProject, date: string) {
    if (!project.startConfirmed) {
      patchProject(project.id, (p) =>
        patchProjectDates(confirmProjectPhase(p, date), { start: date }),
      );
    } else {
      patchProject(project.id, (p) =>
        patchProjectDates(confirmProjectPhase(p, date), {
          phaseDate: { phaseId: p.currentPhaseId, date },
        }),
      );
    }
  }

  function handleModalConfirm(date: string) {
    if (!confirmProject) return;
    const id = confirmProject.id;
    applyConfirm(confirmProject, date);
    toast.success("Date confirmed");
    if (reviewMode) {
      advancePast(id);
    } else {
      setConfirmProjectId(null);
    }
  }

  function handleSkip() {
    if (!confirmProject || !reviewMode) {
      setConfirmProjectId(null);
      return;
    }
    advancePast(confirmProject.id);
  }

  function handleCancel() {
    if (reviewMode) exitReview();
    else setConfirmProjectId(null);
  }

  const currentStageLabel =
    confirmProject?.phases.find((p) => p.id === confirmProject.currentPhaseId)
      ?.label ?? null;

  const listOn = showList || reviewMode;

  return (
    <div
      className={
        embedded
          ? "space-y-6"
          : "mx-auto w-full max-w-screen-2xl space-y-6 px-6 py-8 sm:px-8 lg:px-10"
      }
    >
      {showBanner &&
      payload.datesNeedingConfirm > 0 &&
      !reviewMode &&
      conceptRows ? (
        <div className="flex items-center justify-between gap-4 rounded-md border border-border-dark bg-white px-6 py-4">
          <div className="min-w-0">
            <p className="h7 text-text-primary">
              {payload.datesNeedingConfirm}{" "}
              {payload.datesNeedingConfirm === 1 ? "date" : "dates"} to confirm
            </p>
            <p className="p6 text-text-secondary">
              From Voltreny&apos;s invoices
            </p>
          </div>
          <button
            type="button"
            className="btn-secondary shrink-0"
            onClick={startReview}
          >
            Confirm dates
          </button>
        </div>
      ) : showBanner && payload.datesNeedingConfirm > 0 && !reviewMode ? (
        <MoneyWashCard>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
            <div className="min-w-0 flex-1 space-y-2">
              <p className="h9 uppercase tracking-wide text-[var(--brand-6)]">
                Dates to confirm
              </p>
              <p className="h8 text-text-primary sm:h6">
                <span className="font-semibold text-text-primary">
                  {payload.datesNeedingConfirm}{" "}
                  {payload.datesNeedingConfirm === 1 ? "date" : "dates"}
                </span>{" "}
                {payload.datesNeedingConfirm === 1
                  ? "needs confirming"
                  : "need confirming"}
              </p>
              <p className="p6 text-text-secondary">
                {bannerDetail ??
                  "If a start date or phase is wrong, project tracking will be off too — so check them below."}
              </p>
            </div>
            <button
              type="button"
              className="btn-secondary shrink-0"
              onClick={startReview}
            >
              <ListChecks className="h-4 w-4" aria-hidden />
              Confirm from your data
            </button>
          </div>
        </MoneyWashCard>
      ) : null}

      {reviewMode ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-[var(--brand-6)]/30 bg-[var(--bg-accent)]/60 px-4 py-3">
          <p className="p6 text-text-primary">
            Let&apos;s confirm dates — {activeQueue.length} to check
          </p>
          <button type="button" className="btn-link p6" onClick={exitReview}>
            Exit review
          </button>
        </div>
      ) : null}

      {listOn ? (
        <div ref={listRef} className="space-y-8">
          {payload.batches.map((batch) => (
            <section
              key={batch.id}
              className={
                bare
                  ? ""
                  : "overflow-hidden rounded-lg border border-border-dark bg-white "
              }
            >
              {!bare ? (
                <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border-dark bg-bg-container-grey/60 px-5 py-4 sm:px-6">
                  <div className="min-w-0">
                    <h3 className="h8 text-text-primary">{batch.name}</h3>
                    <p className="mt-0.5 p6 text-text-secondary">
                      {batch.projectCount} projects · {batch.locationSummary} ·{" "}
                      {batch.valueLabel}
                    </p>
                  </div>
                  {batch.toConfirmCount > 0 ? (
                    <span className="inline-flex rounded-full border border-[var(--text-primary)]/30 bg-[var(--text-primary)]/10 px-2.5 py-1 p7 text-[var(--text-primary)]">
                      {batch.toConfirmCount} to confirm
                    </span>
                  ) : (
                    <span className="inline-flex rounded-full border border-[var(--brand-6)]/30 bg-[var(--brand-6)]/10 px-2.5 py-1 p7 text-[var(--brand-6)]">
                      All confirmed
                    </span>
                  )}
                </header>
              ) : null}

              <div className="overflow-x-auto">
                <table className="w-full min-w-[960px] text-left p6">
                  <thead>
                    <tr className="border-b border-border-dark">
                      <th
                        className={cn(
                          sectionTitleClass,
                          "min-w-[240px] px-5 py-3 sm:min-w-[280px] sm:px-6",
                        )}
                      >
                        {buildingColumn ? WORDS.Asset : "Project"}
                      </th>
                      <th
                        className={cn(
                          sectionTitleClass,
                          "whitespace-nowrap px-3 py-3",
                        )}
                      >
                        Start date
                      </th>
                      <th
                        className={cn(sectionTitleClass, "px-3 py-3")}
                      >
                        Phase
                      </th>
                      <th
                        className={cn(
                          sectionTitleClass,
                          "whitespace-nowrap px-5 py-3 text-right sm:px-6",
                        )}
                      >
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(previewLimit && !showAllProjects
                      ? batch.projectIds.slice(0, previewLimit)
                      : batch.projectIds
                    ).map((pid) => {
                      const project = projectsById.get(pid);
                      if (!project) return null;
                      const chip = phaseChip(project);
                      const focused =
                        reviewMode && confirmProjectId === project.id;
                      const dimmed =
                        reviewMode &&
                        confirmProjectId != null &&
                        confirmProjectId !== project.id;
                      return (
                        <tr
                          key={project.id}
                          ref={(el) => {
                            rowRefs.current[project.id] = el;
                          }}
                          className={cn(
                            "border-b border-border-dark last:border-b-0 transition-colors",
                            focused &&
                              "bg-[var(--bg-accent)]/40 ring-2 ring-inset ring-[var(--brand-6)]/40",
                            dimmed && "opacity-50",
                            rowLinks && "cursor-pointer hover:bg-black-1",
                          )}
                          onClick={
                            rowLinks && projectHref
                              ? (event) => {
                                  if (
                                    (event.target as HTMLElement).closest(
                                      "a,button",
                                    )
                                  )
                                    return;
                                  router.push(projectHref(project));
                                }
                              : undefined
                          }
                        >
                          <td className="min-w-[240px] px-5 py-4 align-middle sm:min-w-[280px] sm:px-6">
                            <Link
                              href={
                                projectHref
                                  ? projectHref(project)
                                  : `/customer/projects/${project.id}`
                              }
                              className={
                                buildingColumn
                                  ? "block text-text-title"
                                  : " text-text-primary hover:text-[var(--brand-6)] hover:underline"
                              }
                            >
                              {buildingColumn ? (
                                <span className="relative inline-flex">
                                  {isChanged?.(project) && (
                                    <span
                                      role="img"
                                      aria-label="Changed in the last 7 days"
                                      className="absolute right-full top-1/2 mr-4 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-brand-6"
                                    />
                                  )}
                                  <span>
                                    <span className="block h8 text-text-title">
                                      {project.name}
                                    </span>
                                    {project.location ? (
                                      <span className="mt-0.5 block p7 text-text-tertiary">
                                        {project.location}
                                      </span>
                                    ) : null}
                                  </span>
                                </span>
                              ) : (
                                <>
                                  {project.name}
                                  {showCity && project.location ? (
                                    <span className="ml-2 text-text-secondary">
                                      {project.location}
                                    </span>
                                  ) : null}
                                </>
                              )}
                            </Link>
                            {!buildingColumn && (
                              <p className="mt-0.5 p7 text-text-secondary">
                                {project.supplier}
                                {project.valueLabel !== "—"
                                  ? ` · ${project.valueLabel}`
                                  : ""}
                              </p>
                            )}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 align-middle">
                            {project.startDate ? (
                              <span className="p6 text-text-primary">
                                {dayMonth(project.startDate)}
                              </span>
                            ) : conceptRows ? null : (
                              <span className="p6 text-text-secondary">—</span>
                            )}
                          </td>
                          <td className="px-3 py-4 align-middle">
                            <Chip lead={chip.lead}>{chip.label}</Chip>
                          </td>
                          <td className="whitespace-nowrap px-5 py-4 align-middle text-right sm:px-6">
                            {rowLinks ? (
                              <div className="flex items-center justify-end gap-3">
                                <DeliveryStatus project={project} />
                                <ChevronRight
                                  className="h-4 w-4 text-text-tertiary"
                                  aria-hidden
                                />
                              </div>
                            ) : (
                              <div className="flex items-center justify-end gap-3">
                                {conceptRows ? (
                                  <span className="p6 text-text-primary">
                                    {project.insightLabel}
                                  </span>
                                ) : null}
                                {(
                                  conceptRows
                                    ? project.needsConfirm
                                    : needsDateConfirm(project)
                                ) ? (
                                  <button
                                    type="button"
                                    className="btn-primary-sm"
                                    onClick={() => {
                                      if (reviewMode)
                                        openForProject(project.id);
                                      else setConfirmProjectId(project.id);
                                    }}
                                  >
                                    Confirm date
                                  </button>
                                ) : conceptRows ? null : (
                                  <span className="inline-flex w-fit rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 p7 capitalize text-emerald-800">
                                    confirmed
                                  </span>
                                )}
                                {conceptRows && projectHref ? (
                                  <Link
                                    href={projectHref(project)}
                                    className="btn-secondary-sm"
                                  >
                                    View
                                  </Link>
                                ) : null}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {previewLimit && batch.projectIds.length > previewLimit && (
                <footer className="flex items-center justify-between gap-3 border-t border-border-light px-6 py-3">
                  <p className="p7 text-text-tertiary">
                    {showAllProjects
                      ? nAssets(batch.projectIds.length)
                      : `Showing ${previewLimit} of ${batch.projectIds.length}`}
                  </p>
                  {!showAllProjects && (
                    <button
                      type="button"
                      className="btn-secondary-sm"
                      onClick={() => setShowAllProjects(true)}
                    >
                      Show all {batch.projectIds.length}
                    </button>
                  )}
                </footer>
              )}
            </section>
          ))}
        </div>
      ) : null}

      <CustomerChangeDateModal
        open={Boolean(confirmProject)}
        onOpenChange={(open) => {
          if (open) return;
          handleCancel();
        }}
        title={
          confirmProject && !confirmProject.startConfirmed
            ? "Confirm kick-off date"
            : `Confirm ${currentStageLabel ?? "date"}`
        }
        subtitle={
          confirmProject
            ? `${confirmProject.name} · ${currentStageLabel ?? "Current stage"}`
            : ""
        }
        stageLabel={currentStageLabel}
        reviewProgress={
          reviewMode && reviewQueue.length > 0
            ? {
                current: Math.min(clearedIds.length + 1, reviewQueue.length),
                total: reviewQueue.length,
              }
            : null
        }
        initialDate={
          confirmProject && !confirmProject.startConfirmed
            ? (confirmProject.startDate ??
              confirmProject.phases[0]?.date ??
              null)
            : (confirmProject?.phases.find(
                (p) => p.id === confirmProject.currentPhaseId,
              )?.date ?? null)
        }
        onConfirm={handleModalConfirm}
        onSkip={reviewMode ? handleSkip : undefined}
      />
    </div>
  );
}
