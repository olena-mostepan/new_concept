"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  service,
  TODAY,
  type EndingKind,
  type ProjectRow,
  type ServiceId,
  type Workstream,
} from "@/lib/concept/model";
import { short } from "@/lib/concept/derive";
import { endingTitle } from "@/lib/concept/moves";
import { cn } from "@/lib/utils";
import { Banner, Button, ChipTrack, focusRing } from "./ui";
import { OpsModal } from "./ops-asset/opsUi";
import { useConcept } from "./store";
import { useConceptI18n } from "./useConceptI18n";

/**
 * How the package ended, always shown on an ended package: the ending is the title,
 * Ops' reason (when recorded) the line under it. The one place a reason shows.
 */
export function WhyItEnded({ w }: { w: Workstream }) {
  const { account } = useConcept();
  const { t, lang } = useConceptI18n();
  if (!w.ending || w.ending.kind === "continued") return null;
  const title = `${endingTitle(account, w, lang)} · ${short(w.ending.on, lang)}`;
  return (
    // Warning Banner (yellow), Olena 23 Nov: the package stopped, so it reads as a state.
    <Banner type="warning" icon="info" title={title}>
      {w.ending.reason || undefined}
    </Banner>
  );
}

/** An asset that stopped when the rest of its package continued: same banner, at asset level. */
export function AssetNotGoingAhead({ row }: { row: ProjectRow }) {
  const { t, lang } = useConceptI18n();
  if (row.left?.kind !== "not_going_ahead") return null;
  return (
    <Banner
      type="warning"
      icon="info"
      title={`${t("Not going ahead")} · ${short(row.left.on, lang)}`}
    >
      {row.left.reason || undefined}
    </Banner>
  );
}

/** Highest step any asset reached in this service. */
function stepReached(w: Workstream, sid: ServiceId): number {
  const phase = w.phases.find((p) => p.service === sid);
  const rows = phase?.projects?.length ? phase.projects : w.projects;
  return rows.reduce((max, r) => Math.max(max, r.step), 0);
}

/**
 * The steps of an ended package, kept as a record.
 * Supplier outside CQuel: every step done, "outside CQuel · date" under Supplier chosen.
 * Not going ahead: done up to the last step reached, then the ended chip. No later steps, no counts.
 * Continued: every step done.
 */
export function EndedSteps({
  w,
  sid,
  reachedStep,
}: {
  w: Workstream;
  sid: ServiceId;
  /** Asset page: this asset's step. Package page: the highest step reached. */
  reachedStep?: number;
}) {
  const { t, lang } = useConceptI18n();
  const ending = w.ending;
  const labels = service(sid).steps;
  if (!ending) return null;
  const on = short(ending.on, lang);
  // Supplier outside CQuel completes a tender (a supplier was chosen). Anywhere else the work stopped where it was.
  const stopped =
    ending.kind === "not_going_ahead" ||
    (ending.kind === "outside" && sid !== "tender");
  if (stopped) {
    const reached = reachedStep ?? stepReached(w, sid);
    const done = labels.slice(0, reached + 1).map((label) => ({
      key: label,
      lead: "done" as const,
      label: t(label),
      notes: [],
    }));
    return (
      <ChipTrack
        steps={[
          ...done,
          {
            key: "ended",
            lead: "ended" as const,
            label:
              ending.kind === "outside"
                ? t("Supplier outside CQuel · {0}", on)
                : t("Not going ahead · {0}", on),
            notes: [],
          },
        ]}
      />
    );
  }
  return (
    <ChipTrack
      steps={labels.map((label, i) => ({
        key: label,
        lead: "done" as const,
        label: t(label),
        notes:
          ending.kind === "outside" && i === labels.length - 1
            ? [
                {
                  text: t("outside CQuel · {0}", on),
                  className: "p7 text-text-secondary",
                },
              ]
            : [],
      }))}
    />
  );
}

/** DS Input / Textarea: border-dark, hover black-4, focus a 2px black-7 border, no halo. */
const fieldClass =
  "w-full rounded-md border border-border-dark bg-bg-container px-3 p6 text-text-primary outline-none placeholder:text-text-tertiary hover:border-black-4 focus:border-2 focus:border-black-7 focus:px-[11px]";

/** Ops: "End package…" and its window. Live packages only. */
export function EndPackageButton({ w }: { w: Workstream }) {
  const { endPackage } = useConcept();
  const { t, words } = useConceptI18n();
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<Exclude<EndingKind, "continued"> | null>(
    null,
  );
  const [supplier, setSupplier] = useState("");
  const [on, setOn] = useState(TODAY);
  const [reason, setReason] = useState("");
  const live = w.projects.filter((p) => !p.left).length;
  const close = () => setOpen(false);
  const save = () => {
    if (!kind) return;
    endPackage(w.id, {
      kind,
      on,
      ...(kind === "outside" && supplier.trim()
        ? { supplier: supplier.trim() }
        : {}),
      ...(reason.trim() ? { reason: reason.trim() } : {}),
    });
    setOpen(false);
  };
  const choices: Array<{
    id: Exclude<EndingKind, "continued">;
    title: string;
    line: string;
  }> = [
    {
      id: "outside",
      title: t("Supplier chosen outside CQuel"),
      line: t("The customer went with a supplier we didn't bring"),
    },
    {
      id: "not_going_ahead",
      title: t("Not going ahead"),
      line: t("The customer stopped this work, or dropped the supplier"),
    },
  ];
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <>
      <Button type="secondary" size="small" onClick={() => setOpen(true)}>
        {t("End package…")}
      </Button>
      {mounted && createPortal(
      <OpsModal
        open={open}
        width={480}
        title={t("End package")}
        subtitle={`${w.name} · ${t(service(w.service).label)} · ${live} ${live === 1 ? words.asset : words.assets}`}
        onClose={close}
        footer={
          <div className="flex justify-end gap-2">
            <Button type="tertiary" size="large" onClick={close}>
              {t("Cancel")}
            </Button>
            <Button
              type="primary"
              size="large"
              disabled={!kind}
              onClick={save}
            >
              {t("End package")}
            </Button>
          </div>
        }
      >
        <div className="flex max-h-[70dvh] flex-col gap-3 overflow-y-auto px-6 py-5">
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-1 h9 text-text-title">
              {t("What happened")}
            </legend>
            {choices.map((c) => {
              const on = kind === c.id;
              return (
                <label
                  key={c.id}
                  className={cn(
                    // CheckCard look (padding 12, radius-md; selected 1.5px black-7) with a DS Radio.
                    "flex cursor-pointer items-start gap-3 rounded-md p-3",
                    on
                      ? "border-[1.5px] border-black-7"
                      : "border border-border-dark hover:bg-black-2",
                  )}
                >
                  <input
                    type="radio"
                    name={`ending-${w.id}`}
                    checked={on}
                    onChange={() => setKind(c.id)}
                    className={cn(
                      "mt-0.5 size-4 shrink-0 cursor-pointer appearance-none rounded-full border border-black-4 bg-bg-container checked:border-[5px] checked:border-black-7",
                      focusRing,
                    )}
                  />
                  <span className="min-w-0">
                    <span className="block h8 text-text-primary">{c.title}</span>
                    <span className="block p7 text-text-secondary">{c.line}</span>
                  </span>
                </label>
              );
            })}
          </fieldset>
          {kind === "outside" && (
            <label className="flex flex-col gap-1">
              <span className="h9 text-text-title">
                {t("Supplier")}{" "}
                <span className="font-normal text-text-tertiary">
                  {t("(optional)")}
                </span>
              </span>
              <input
                className={cn(fieldClass, "h-10")}
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
              />
            </label>
          )}
          <label className="flex flex-col gap-1">
            <span className="h9 text-text-title">{t("Ended on")}</span>
            <input
              className={cn(fieldClass, "h-10")}
              value={on}
              onChange={(e) => setOn(e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="h9 text-text-title">
              {t("Why it ended · the customer sees this")}
            </span>
            <textarea
              className={cn(fieldClass, "min-h-[88px] resize-none py-2 focus:py-[7px]")}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </label>
        </div>
      </OpsModal>,
      document.body,
      )}
    </>
  );
}
