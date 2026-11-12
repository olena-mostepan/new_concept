"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Building } from "@/lib/concept/model";
import { cn } from "@/lib/utils";
import { Button, Icon, IconButton } from "./ui";

/**
 * Full-screen create workspace (DS "Workspace · create"): top bar with Close, title and the
 * main action; the content on the left, the thing being made on the right.
 * Used by New batch and Add package.
 */
export function CreateWorkspace({
  title,
  subtitle,
  action,
  missing,
  onSubmit,
  dirty,
  closeQuestion,
  closeLabel,
  onClose,
  side,
  sideLabel,
  children,
}: {
  title: string;
  subtitle?: ReactNode;
  action: string;
  /** What's still needed, one thing at a time. Disables the action while set. */
  missing?: string;
  onSubmit: () => void;
  dirty: boolean;
  closeQuestion: string;
  closeLabel: string;
  onClose: () => void;
  side: ReactNode;
  sideLabel: string;
  children: ReactNode;
}) {
  const [confirming, setConfirming] = useState(false);
  const tryClose = () => (dirty ? setConfirming(true) : onClose());
  const closeRef = useRef(tryClose);
  closeRef.current = tryClose;
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !e.defaultPrevented) closeRef.current();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div role="dialog" aria-modal aria-label={title} className="fixed inset-0 z-50 grid grid-rows-[auto_minmax(0,1fr)] bg-white">
      <header className="flex min-h-16 flex-wrap items-center gap-x-3 gap-y-2 border-b border-border-dark px-4 py-2">
        <IconButton icon="cross" label="Close" onClick={tryClose} />
        <div className="min-w-0 flex-1">
          <h2 className="h6 text-text-primary">{title}</h2>
          {subtitle && <p className="truncate p7 text-text-secondary">{subtitle}</p>}
        </div>
        {confirming ? (
          <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:ml-auto sm:w-auto">
            <p className="mr-2 hidden p6 text-text-primary sm:block">{closeQuestion}</p>
            <Button type="secondary" onClick={() => setConfirming(false)}>
              Keep editing
            </Button>
            <Button type="secondary" onClick={onClose}>
              {closeLabel}
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            {missing && (
              <p className="hidden items-center gap-1.5 p7 text-text-secondary sm:flex">
                <Icon name="info" size={16} className="text-icon-default" />
                {missing}
              </p>
            )}
            <Button type="primary" size="large" disabled={Boolean(missing)} onClick={onSubmit}>
              {action}
            </Button>
          </div>
        )}
      </header>

      <div className="grid min-h-0 grid-cols-[minmax(0,1fr)] content-start overflow-y-auto lg:grid-cols-[minmax(0,1fr)_380px] lg:content-stretch lg:overflow-hidden">
        <main className="min-w-0 px-4 py-6 sm:px-8 lg:min-h-0 lg:overflow-y-auto">
          <div className="mx-auto max-w-[880px]">{children}</div>
        </main>
        <aside
          aria-label={sideLabel}
          className="flex min-w-0 flex-col border-t border-border-dark bg-black-1 lg:min-h-0 lg:border-l lg:border-t-0"
        >
          <div className="flex min-h-0 flex-1 flex-col gap-5 p-5 lg:overflow-y-auto">{side}</div>
        </aside>
      </div>
    </div>
  );
}

/** Section inside a workspace: h7 title, optional hint, then the content. */
export function WsSection({
  title,
  hint,
  right,
  children,
}: {
  title: string;
  hint?: ReactNode;
  right?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="border-b border-border-light py-6 first:pt-0 last:border-b-0">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="h7 text-text-primary">{title}</h3>
          {hint && <p className="mt-1 p6 text-text-secondary">{hint}</p>}
        </div>
        {right}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

/** The white count pill used in titles ("3 assets"). */
export function CountPill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex h-6 shrink-0 items-center rounded-full border border-border-dark bg-white px-2 h9 text-text-title">
      {children}
    </span>
  );
}

/** Square selection mark (16, radius-sm). Decorative: the row carries the role. */
export function Check({ on }: { on: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-4 shrink-0 items-center justify-center rounded-sm border bg-white",
        on ? "border-black-7 bg-black-7" : "border-border-dark",
      )}
    >
      {on && <Icon name="check" size={12} className="text-white" />}
    </span>
  );
}

export const placeOf = (b: Building) =>
  [b.address, [b.postcode, b.city].filter(Boolean).join(" ")].filter(Boolean).join(", ");

/** Choose assets from many: whole row toggles, "Add all" in the header. */
export function AssetPicker({
  hits,
  isOn,
  onToggle,
  onAll,
  empty,
  countLabel,
}: {
  hits: Building[];
  isOn: (id: string) => boolean;
  onToggle: (id: string) => void;
  onAll: (on: boolean) => void;
  empty: string;
  /** e.g. "in the batch", "selected" */
  countLabel: string;
}) {
  const inCount = hits.filter((b) => isOn(b.id)).length;
  const all = hits.length > 0 && inCount === hits.length;
  return (
    <div className="overflow-hidden rounded-md border border-border-dark bg-white">
      <div className="flex items-center justify-between gap-3 border-b border-border-light px-4 py-2">
        <span className="s3 text-text-tertiary">
          {hits.length} {hits.length === 1 ? "asset" : "assets"}
          {inCount > 0 && ` · ${inCount} ${countLabel}`}
        </span>
        {hits.length > 0 && (
          <Button type="link" onClick={() => onAll(!all)}>
            {all ? "Remove all" : `Add all ${hits.length}`}
          </Button>
        )}
      </div>
      {hits.length === 0 ? (
        <p className="px-4 py-4 p6 text-text-secondary">{empty}</p>
      ) : (
        <ul className="max-h-[min(56vh,520px)] overflow-y-auto">
          {hits.map((b) => {
            const on = isOn(b.id);
            return (
              <li key={b.id} className="border-b border-border-light last:border-b-0">
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={on}
                  onClick={() => onToggle(b.id)}
                  className={cn(
                    "grid min-h-14 w-full grid-cols-[16px_minmax(0,1fr)_auto] items-center gap-3 px-4 py-2.5 text-left outline-none hover:bg-black-1 focus-visible:shadow-[inset_0_0_0_2px_var(--black-7)]",
                    on && "bg-black-1",
                  )}
                >
                  <Check on={on} />
                  <span className="min-w-0">
                    <span className="block truncate h8 text-text-title">{b.name}</span>
                    <span className="block truncate p7 text-text-secondary">{placeOf(b) || b.city}</span>
                  </span>
                  <span className="p7 text-text-tertiary">{b.type}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
