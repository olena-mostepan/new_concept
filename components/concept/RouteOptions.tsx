"use client";

/**
 * The pilot route: services (CQuel's work) as display chips, the customer's
 * decisions as StageList dots between them. Chosen 26 Nov (option A).
 */
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Chip, RoundTick } from "./ui";
import { useConceptI18n } from "./useConceptI18n";

type Service = { id: string; label: string; caption: string; icon?: ReactNode };

/**
 * Option A, chosen 26 Nov: services stay the route (CQuel's work, display chips);
 * the customer's decisions are diamond gates on the line between them;
 * one sentence above says what happens next.
 */
export function RouteGates({
  services,
  next,
  agreed,
}: {
  services: Service[];
  /** After the customer agrees: the first gate is done and the first service is under way. */
  agreed?: boolean;
  /** Optional sentence above the route. */
  next?: ReactNode;
}) {
  const { t } = useConceptI18n();
  const [first, ...rest] = services;
  // One kind of column for everything: a mark on the line, one short label under it.
  type Col = { key: string; kind: "gate" | "service"; now?: boolean; done?: boolean; label: string; icon?: ReactNode };
  const cols: Col[] = [
    { key: "agree", kind: "gate", now: !agreed, done: agreed, label: agreed ? t("Plan agreed") : t("You agree the plan") },
    { key: first.id, kind: "service", now: agreed, label: first.label, icon: first.icon },
    { key: "decide", kind: "gate", label: t("You decide: go on or stop") },
    ...rest.map((s) => ({ key: s.id, kind: "service" as const, label: s.label, icon: s.icon })),
  ];
  const captions: Record<string, string> = Object.fromEntries(services.map((s) => [s.id, s.caption]));
  const n = cols.length;
  const grid = { gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` };
  return (
    <div>
      {next && (
        <p className="mb-4 flex items-center gap-2 p6 text-text-primary">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-6" aria-hidden />
          <span>{next}</span>
        </p>
      )}
      {cols.some((c) => c.icon) && (
        <div className="mb-3 grid" style={grid}>
          {cols.map((c) => (
            <div key={c.key} className="flex h-14 items-end justify-center">{c.icon}</div>
          ))}
        </div>
      )}
      <div className="relative">
        <div
          className="absolute top-[11px] h-0.5 bg-border-dark"
          style={{ left: `${50 / n}%`, right: `${50 / n}%` }}
          aria-hidden
        />
        <div className="relative grid" style={grid}>
          {cols.map((c) => (
            <div key={c.key} className="flex min-w-0 flex-col items-center px-1 text-center">
              <div className="flex h-6 items-center">
                {c.kind === "service" ? (
                  <Chip lead={c.now ? "now" : "next"}>{c.label}</Chip>
                ) : c.done ? (
                  /* StageList done: the done chip's tick. */
                  <RoundTick size={14} />
                ) : (
                  /* StageList dots: current brand-6 with a 3px bg-accent ring; later white with a 2px black-4 border. */
                  <span
                    aria-hidden
                    className={cn(
                      "block h-3 w-3 rounded-full",
                      c.now ? "bg-brand-6 ring-[3px] ring-[var(--bg-accent)]" : "border-2 border-black-4 bg-bg-container",
                    )}
                  />
                )}
              </div>
              {/* Same size for every label; only the current gate is SemiBold. */}
              <p className={cn("mt-1.5", c.now && c.kind === "gate" ? "h9 text-text-primary" : c.now ? "p7 text-text-primary" : "p7 text-text-secondary")}>
                {c.kind === "service" ? captions[c.key] : c.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
