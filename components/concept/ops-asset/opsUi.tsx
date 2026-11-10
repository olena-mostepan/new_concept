"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Tag } from "@/components/ds/tag";
import {
  Button,
  Icon,
  IconButton,
  focusRing,
  filterSearchClass,
  th,
  td,
  tableRowLinkClass,
} from "../ui";

export function StateMark({
  state,
  size = 16,
}: {
  state: "done" | "open" | "na";
  size?: number;
}) {
  if (state === "done") {
    return (
      <span
        className="inline-flex items-center justify-center rounded-full bg-black-7"
        style={{ width: size, height: size }}
        aria-hidden
      >
        <Icon name="check" size={size >= 20 ? 12 : 10} className="text-white" />
      </span>
    );
  }
  if (state === "na") {
    return (
      <span
        className="inline-flex items-center justify-center rounded-full bg-black-2"
        style={{ width: size, height: size }}
        aria-hidden
      >
        <span className="h-0.5 w-2 rounded-full bg-black-4" />
      </span>
    );
  }
  return (
    <span
      className="inline-block rounded-full border-[1.5px] border-dashed border-black-4"
      style={{ width: size, height: size }}
      aria-hidden
    />
  );
}

export function SelectionBar({
  count,
  actionLabel,
  onAction,
  onClear,
}: {
  count: number;
  actionLabel: string;
  onAction: () => void;
  onClear: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md bg-bg-accent py-2 pl-4 pr-2">
      <span className="h8 text-[var(--accent-hover)]">{count} selected</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onClear}
          className={cn(
            "h-8 rounded-md px-3 h8 text-text-primary hover:bg-black-2",
            focusRing,
          )}
        >
          Clear
        </button>
        <Button type="primary" size="default" onClick={onAction}>
          {actionLabel}
        </Button>
      </div>
    </div>
  );
}

export function UpdatedHighlight({ children }: { children: ReactNode }) {
  return (
    <span className="relative inline-flex rounded-sm outline outline-2 outline-offset-0 outline-black-6">
      <span className="absolute -top-2 right-0 rounded-sm bg-black-6 px-1 h9 text-white">
        UPDATED
      </span>
      <span className="rounded-sm bg-black-1 px-1">{children}</span>
    </span>
  );
}

export function FoundValue({
  value,
  file,
  page,
  quote,
  children,
}: {
  value: string;
  file: string;
  page?: number | string;
  quote?: string;
  children?: ReactNode;
}) {
  return (
    <div className="grid gap-3 rounded-md border border-status-warning-border bg-status-warning-bg px-4 py-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
      <div className="min-w-0">
        <p className="flex items-center gap-2 h8 text-text-primary">
          <Icon name="info" size={16} className="shrink-0 text-status-warning-text" />
          <span>
            Found {value} in {file}
            {page != null && `, page ${page}`}
          </span>
        </p>
        {quote && (
          <p className="mt-0.5 pl-6 p7 text-text-secondary">
            &ldquo;{quote}&rdquo; ·{" "}
            <button
              type="button"
              className={cn("text-text-primary underline underline-offset-[3px]", focusRing)}
            >
              View
            </button>
          </p>
        )}
      </div>
      {children && <div className="flex shrink-0 flex-wrap items-center gap-2 pl-6 sm:pl-0">{children}</div>}
    </div>
  );
}

export function RequirementGroup({
  label,
  count,
  countLabel,
  accentPill,
  children,
}: {
  label: string;
  count?: number;
  countLabel?: string;
  accentPill?: boolean;
  children: ReactNode;
}) {
  return (
    <section>
      <div className="flex items-center justify-between gap-3 border-b border-border-light pb-2">
        <h3 className="s3 text-text-tertiary">{label}</h3>
        {count != null && (
          <span
            className={cn(
              "inline-flex h-6 items-center rounded-full border px-2 h9",
              accentPill
                ? "border-border-accent bg-bg-accent text-[var(--accent-hover)]"
                : "border-border-dark bg-white text-text-title",
            )}
          >
            {countLabel ?? `${count} open`}
          </span>
        )}
      </div>
      <div className="divide-y divide-border-light">{children}</div>
    </section>
  );
}

export function UploadRow({
  onUpload,
}: {
  onUpload: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-md border border-dashed border-border-dark bg-black-2 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-md border border-border-dark bg-white">
          <Icon name="upload" size={20} className="text-icon-dark" />
        </span>
        <div>
          <p className="h8 text-text-primary">Drop documents here</p>
          <p className="p7 text-text-secondary">
            We read them and fill what we can
          </p>
        </div>
      </div>
      <Button type="secondary" size="default" icon="upload" onClick={onUpload}>
        Upload documents
      </Button>
    </div>
  );
}

export function OpsModal({
  open,
  title,
  subtitle,
  onClose,
  footer,
  children,
  width = 1000,
}: {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  footer: ReactNode;
  children: ReactNode;
  width?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black-7/40"
        onClick={onClose}
      />
      <div
        ref={ref}
        role="dialog"
        aria-modal
        className="relative flex max-h-[calc(100dvh-32px)] w-full flex-col overflow-hidden rounded-lg border border-border-dark bg-white shadow-overlay"
        style={{ maxWidth: width }}
      >
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-border-light px-6 py-4">
          <div>
            <h2 className="h5 text-text-primary">{title}</h2>
            {subtitle && <p className="p6 text-text-secondary">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className={cn(
              "inline-flex size-8 items-center justify-center rounded-md hover:bg-black-2",
              focusRing,
            )}
          >
            <Icon name="cross" size={16} />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
        <footer className="shrink-0 border-t border-border-light px-6 py-4">
          {footer}
        </footer>
      </div>
    </div>
  );
}

export function OpsDataTable({
  columns,
  rows,
  toolbar,
  aside,
  title,
  count,
  selectable,
  selected,
  onSelectRow,
  onRowClick,
}: {
  title: string;
  count: number;
  columns: { key: string; label: string }[];
  rows: Array<
    Record<string, ReactNode> & {
      id: string;
      selectable?: boolean;
      blocked?: boolean;
      href?: string;
    }
  >;
  toolbar?: ReactNode;
  aside?: ReactNode;
  selectable?: boolean;
  selected: string[];
  onSelectRow: (id: string, on: boolean) => void;
  onRowClick: (id: string, blocked: boolean) => void;
}) {
  const router = useRouter();
  return (
    <section className="overflow-hidden rounded-lg border border-border-dark bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-light px-5 py-4">
        <h2 className="h7 text-text-primary">
          {title}{" "}
          <span className="h7 text-text-tertiary">{count}</span>
        </h2>
        {aside}
      </div>
      {toolbar && (
        <div className="border-b border-border-light px-5 py-2">{toolbar}</div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse">
          <thead>
            <tr className="border-b border-border-light">
              {selectable && <th className="w-10" />}
              {columns.map((col) => (
                <th key={col.key} className={th}>
                  {col.label}
                </th>
              ))}
              <th className="w-10" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const isSel = selected.includes(row.id);
              const selectionMode = selected.length > 0;
              const cells = (
                <>
                  {selectable && (
                    <td className="px-4 py-3 pl-8">
                      {row.selectable ? (
                        <label
                          className="flex cursor-pointer items-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            className="peer sr-only"
                            checked={isSel}
                            onChange={(e) =>
                              onSelectRow(row.id, e.target.checked)
                            }
                          />
                          <span className="flex size-4 items-center justify-center rounded-sm border border-border-dark bg-white peer-focus-visible:shadow-focus peer-checked:border-black-7 peer-checked:bg-black-7">
                            {isSel && (
                              <Icon name="check" size={12} className="text-white" />
                            )}
                          </span>
                        </label>
                      ) : null}
                    </td>
                  )}
                  {columns.map((col) => (
                    <td key={col.key} className={td}>
                      {row[col.key]}
                    </td>
                  ))}
                  <td className="px-4 py-3">
                    <Icon name="chevron-right" size={16} className="text-icon-dark" />
                  </td>
                </>
              );
              const go = () => {
                if (row.href) router.push(row.href);
                else onRowClick(row.id, Boolean(row.blocked));
              };
              return (
                <tr
                  key={row.id}
                  className={cn(
                    "border-b border-border-light",
                    isSel && "bg-black-1",
                    !selectionMode && "cursor-pointer hover:bg-black-1 focus-visible:bg-black-2 focus-visible:outline-none",
                  )}
                  tabIndex={selectionMode ? undefined : 0}
                  aria-label={selectionMode ? undefined : `Open ${row.label ?? row.id}`}
                  onClick={selectionMode ? undefined : go}
                  onKeyDown={
                    selectionMode
                      ? undefined
                      : (e) => {
                          if (e.key === "Enter") go();
                        }
                  }
                >
                  {cells}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function AssistantPanel({
  open,
  scope,
  onClose,
  messages,
  hint,
  input,
  onInputChange,
  onSend,
  onAttach,
}: {
  open: boolean;
  scope: string;
  onClose: () => void;
  messages: Array<{
    from: "me" | "assistant";
    text: string;
    note?: string;
    changes?: string[];
    onUndo?: () => void;
  }>;
  hint: string;
  input: string;
  onInputChange: (v: string) => void;
  onSend: () => void;
  onAttach: () => void;
}) {
  if (!open) return null;
  return (
    <aside className="fixed inset-y-0 right-0 z-30 flex w-full max-w-[400px] flex-col border-l border-border-dark bg-white shadow-overlay">
      <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-border-light px-4">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-full bg-black-7">
            <Icon name="idea" size={14} className="text-white" />
          </span>
          <div>
            <p className="h8 text-text-primary">Assistant</p>
            <p className="p7 text-text-secondary">{scope}</p>
          </div>
        </div>
        <button type="button" onClick={onClose} className={cn("size-8", focusRing)} aria-label="Close">
          <Icon name="cross" size={16} />
        </button>
      </header>
      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto bg-black-1 p-5">
        <p className="p6 text-text-primary">
          I work on {scope}. Attach a file or tell me what to add or change.
        </p>
        {messages.map((msg, i) => (
          <div
            key={i}
            className={cn(
              "max-w-[300px] rounded-md p-3",
              msg.from === "me"
                ? "ml-auto bg-black-7 text-white"
                : "border border-border-light bg-white",
            )}
          >
            <p className={msg.from === "me" ? "p6 text-white" : "p6 text-text-primary"}>
              {msg.text}
            </p>
            {msg.changes?.map((c) => (
              <p key={c} className="mt-2 p7 text-text-secondary">
                <Icon name="check" size={12} className="mr-1 text-status-success-mark" />
                {c}
              </p>
            ))}
            {msg.note && <p className="mt-2 p7 text-text-secondary">{msg.note}</p>}
            {msg.onUndo && (
              <Button type="secondary" size="small" className="mt-2" onClick={msg.onUndo}>
                Undo
              </Button>
            )}
          </div>
        ))}
      </div>
      <div className="shrink-0 border-t border-border-light p-4">
        <p className="mb-2 p7 text-text-secondary">
          <Icon name="info" size={12} className="mr-1 inline-block" />
          {hint}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            aria-label="Attach files"
            onClick={onAttach}
            className={cn(
              "inline-flex size-10 shrink-0 items-center justify-center rounded-md border border-border-dark bg-bg-container hover:bg-black-2",
              focusRing,
            )}
          >
            <Icon name="plus" size={16} />
          </button>
          <input
            className={cn(filterSearchClass, "min-w-0 flex-1")}
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder="Add or change something…"
            onKeyDown={(e) => {
              if (e.key === "Enter") onSend();
            }}
          />
        </div>
      </div>
    </aside>
  );
}


export function BlockingCellContent({
  item,
  state,
  detail,
}: {
  item: string;
  state: string;
  detail?: string;
}) {
  if (!item) {
    return <span className="p6 text-text-tertiary">—</span>;
  }
  return (
    <div>
      <p className="h8 text-text-primary">
        <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-brand-6" aria-hidden />
        {item} · {state}
      </p>
      {detail && <p className="p7 text-text-secondary">{detail}</p>}
    </div>
  );
}

export function RecCellContent({
  count,
  names,
}: {
  count: number;
  names: string;
}) {
  if (!count) return <span className="p6 text-text-tertiary">—</span>;
  return (
    <p className="p6 text-text-primary">
      {count} · {names}
    </p>
  );
}

/** An asset's files in the DS DocumentList look: name, type tag and what it is, Download. */
export function AssetFileList({
  files,
  empty = "No files yet",
}: {
  files: { name: string; type?: string; what?: string; state?: "reading" | "unknown" }[];
  empty?: string;
}) {
  if (!files.length) return <p className="py-3 p6 text-text-secondary">{empty}</p>;
  return (
    <ul>
      {files.map((f, i) => {
        const ext = (f.name.split(".").pop() ?? "").toUpperCase();
        const meta =
          f.state === "reading" ? "Reading…" : f.state === "unknown" ? "Couldn\u2019t tell what this is" : f.what ?? "File";
        return (
          <li
            key={f.name}
            className={cn("flex items-center justify-between gap-4 py-3", i > 0 && "border-t border-border-light")}
          >
            <div className="min-w-0">
              <p className="h8 text-text-title">{f.name}</p>
              <div className="mt-0.5 flex items-center gap-1.5">
                {ext && <Tag type="neutral" size="xsmall">{ext}</Tag>}
                <p className="p7 text-text-secondary">{meta}</p>
              </div>
            </div>
            {f.state === "reading" ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-black-3 border-t-black-6" role="img" aria-label="Reading" />
            ) : f.state === "unknown" ? (
              <Button type="secondary" size="small">Choose a type</Button>
            ) : (
              <IconButton icon="download" label={`Download ${f.name}`} />
            )}
          </li>
        );
      })}
    </ul>
  );
}
