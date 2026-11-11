"use client";

import Link from "next/link";
import {
  Children,
  isValidElement,
  useRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import * as RadixSelect from "@radix-ui/react-select";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  SERVICES,
  service as serviceDef,
  type Account,
  type Batch,
  type Doc,
  type Owner,
  type ServiceId,
  type Workstream,
} from "@/lib/concept/model";
import { shortFact } from "./WorkstreamChrome";
import {
  batchSlots,
  changedRecently,
  doneCount,
} from "@/lib/concept/derive";
import { nPackages, ownerLabel, WORDS } from "@/lib/concept/words";
import { useConceptI18n } from "./useConceptI18n";
import { Tag } from "@/components/ds/tag";

/* ------------------------------------------------------------------ type */

export function Icon({
  name,
  size = 16,
  className,
  label,
}: {
  name: string;
  size?: number;
  className?: string;
  label?: string;
}) {
  return (
    <span
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cn("inline-block shrink-0", className)}
      style={{
        width: size,
        height: size,
        backgroundColor: "currentColor",
        WebkitMask: `url(/icons/${name}.svg) center / contain no-repeat`,
        mask: `url(/icons/${name}.svg) center / contain no-repeat`,
      }}
    />
  );
}

const TYPE_LABEL: Record<
  "batch" | "package" | "asset",
  { text: string; tip: string; aria: string }
> = {
  batch: {
    text: "BATCH",
    tip: "Assets grouped around one goal. A batch can hold several packages.",
    aria: "What is a batch?",
  },
  package: {
    text: "PACKAGE",
    tip: "Assets that go through the services together. One service at a time.",
    aria: "What is a package?",
  },
  asset: {
    text: "ASSET",
    tip: "A building or site you own.",
    aria: "What is an asset?",
  },
};

export function ServiceIcon({
  service,
  size = 44,
  className,
  grayscale,
}: {
  service: ServiceId;
  size?: number;
  className?: string;
  /** Closed package: last service icon in greyscale, drop shadow kept underneath. */
  grayscale?: boolean;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/icons/services/${service}.png`}
      alt=""
      aria-hidden
      width={size}
      height={size}
      className={cn("shrink-0 object-contain", className)}
      style={{
        filter: grayscale
          ? "grayscale(1) drop-shadow(0 10px 14px rgba(30,40,50,.12))"
          : "drop-shadow(0 10px 14px rgba(30,40,50,.12))",
      }}
    />
  );
}

export function TypeLabelInfo({ kind }: { kind: "batch" | "package" | "asset" }) {
  const { tip, aria } = TYPE_LABEL[kind];
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={aria}
          className={cn(
            "inline-flex size-6 shrink-0 items-center justify-center rounded-sm text-icon-default hover:bg-black-2 active:bg-black-3 hover:text-icon-strong",
            focusRing,
          )}
        >
          <Icon name="info" size={14} />
        </button>
      </TooltipTrigger>
      <TooltipContent
        side="bottom"
        align="start"
        className="max-w-[300px] text-wrap p7 font-normal"
      >
        {tip}
      </TooltipContent>
    </Tooltip>
  );
}

export type FactItem = {
  label: string;
  value: ReactNode;
  detail?: ReactNode;
  href?: string;
};

function factValue(item: FactItem) {
  if (item.href) {
    return (
      <Link
        href={item.href}
        className="p6 text-text-primary underline decoration-border-dark underline-offset-[3px] hover:text-text-primary"
      >
        {item.value}
      </Link>
    );
  }
  return <span className="p6 text-text-primary">{item.value}</span>;
}

export function FactsRow({
  facts,
  className,
}: {
  facts: FactItem[];
  className?: string;
}) {
  const shown = facts.filter(
    (fact) =>
      fact.value !== undefined &&
      fact.value !== null &&
      fact.value !== "" &&
      fact.value !== "—",
  );
  if (!shown.length) return null;
  return (
    <dl
      className={cn(
        "flex flex-wrap gap-x-10 gap-y-4",
        className,
      )}
    >
      {shown.map((fact) => (
        <div key={fact.label} className="min-w-40">
          <dt className="p7 text-text-tertiary">{fact.label}</dt>
          <dd className="mt-0.5">{factValue(fact)}</dd>
          {fact.detail && (
            <dd className="mt-0.5 p7 text-text-secondary">{fact.detail}</dd>
          )}
        </div>
      ))}
    </dl>
  );
}

export function TabDot({ label = "New" }: { label?: string }) {
  return (
    <span
      role="img"
      aria-label={label}
      className="ml-1.5 mt-[7px] inline-block h-1.5 w-1.5 shrink-0 self-start rounded-full bg-brand-6"
    />
  );
}

export const tabListClass =
  "mb-4 flex gap-8 border-b border-border-light";

export const tabTriggerClass = cn(
  "inline-flex h-8 shrink-0 items-start whitespace-nowrap rounded-none border-b-2 border-transparent px-0 pb-3 pt-0 -mb-px text-text-secondary outline-none transition-colors hover:text-text-primary hover:shadow-[inset_0_-2px_0_var(--black-3)] data-[state=active]:hover:shadow-none focus-visible:shadow-focus",
  "data-[state=inactive]:p6 data-[state=active]:h8 data-[state=active]:text-text-primary data-[state=active]:border-brand-6",
);

export const pageTitle = "h4 text-text-primary";
export const sectionTitle = "s3 text-text-tertiary";
/** Group titles such as In progress, Needs your decision, Done. */
export const groupTitle = "h7 text-text-primary";
export const focusRing = "outline-none focus-visible:shadow-focus";

/** Mark table row containers for keyboard focus underline (see globals `.table-row-*-row`). */
export const tableRowLinkClass = "table-row-link-row outline-none hover:bg-black-1 focus-visible:bg-black-2";

/** Row shell with several tab stops (name link, batch link): focus underline follows inner focus. */
export const tableRowShellClass =
  "table-row-shell-row outline-none hover:bg-black-1 focus-within:bg-black-2";

/** First-column name cell in a table row (gets underline when row/shell has keyboard focus). */
export const tableRowNameCellClass = "table-row-name-cell";
export const th = "px-4 py-2 pl-8 text-left s3 text-text-tertiary";
export const td = "px-4 py-3 pl-8 align-top p6 text-text-primary";
export const dot = <span className="mx-2 text-text-tertiary">·</span>;

export function Page({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-screen-2xl px-8 pt-8">
      {children}
    </div>
  );
}

/** Long building lists show the first 10, then the rest on request. */
export function ListMore({
  total,
  limit = 10,
  open,
  onOpen,
  noun,
}: {
  total: number;
  limit?: number;
  open: boolean;
  onOpen: () => void;
  noun: string;
}) {
  const { t } = useConceptI18n();
  if (total <= limit) return null;
  return (
    <footer className="flex items-center justify-between gap-3 border-t border-border-light px-6 py-3">
      <p className="p7 text-text-tertiary">
        {open
          ? `${total} ${noun}`
          : t("Showing {0} of {1}", limit, total)}
      </p>
      {!open && (
        <Button type="secondary" size="small" onClick={onOpen}>
          {t("Show all {0}", total)}
        </Button>
      )}
    </footer>
  );
}

export function ChangedKey({ className }: { className?: string }) {
  return (
    <p
      className={cn(
        "flex items-center gap-2",
        className ?? "p6 text-text-secondary",
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-brand-6" aria-hidden />
      Changed in the last 7 days
    </p>
  );
}

export function workstreamSummary(
  list: Array<{ batchId: string; owner: string }>,
) {
  if (!list.length) return `No ${WORDS.packages} match`;
  const batches = new Set(list.map((w) => w.batchId)).size;
  const done = list.filter((w) => w.owner === "done").length;
  const live = list.length - done;
  const batchWord = batches === 1 ? "batch" : "batches";
  return `${nPackages(list.length)} across ${batches} ${batchWord} · ${live} in progress · ${done} done`;
}

/** Only "you" filters the list. Older responsibility values count as no filter. */
export function matchesResponsibility(owner: string, responsibility: string) {
  if (responsibility !== "you") return true;
  return owner === "you";
}

export function SummaryCards({
  total,
  batches,
  yourAction,
  live,
  serviceLabel,
  thirdLabel,
  thirdCount,
  thirdLine,
  responsibility,
  onResponsibility,
}: {
  total: number;
  batches: number;
  yourAction: number;
  live: number;
  serviceLabel: string;
  thirdLabel: string;
  thirdCount: number;
  thirdLine: string;
  responsibility: string;
  onResponsibility: (next: string) => void;
}) {
  const { t, words, plural } = useConceptI18n();
  const yours = responsibility === "you";
  const batchWord = plural(
    batches,
    "Batch",
    "Batches",
  );
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <SummaryCard
        label={words.Packages}
        number={total}
        line={
          total > 0 ? t("across {0} {1}", batches, batchWord) : null
        }
      />
      <SummaryCard
        label={t("Your action")}
        number={yourAction}
        line={
          total > 0
            ? t("of {0} in {1}", live, t(serviceLabel))
            : null
        }
        pressed={yours}
        onClick={() => onResponsibility(yours ? "" : "you")}
      />
      <SummaryCard
        label={t(thirdLabel)}
        number={thirdCount}
        line={total > 0 ? t(thirdLine) : null}
      />
    </div>
  );
}

function SummaryCard({
  label,
  number,
  line,
  mark,
  pressed,
  onClick,
}: {
  label: string;
  number: number;
  line: string | null;
  mark?: boolean;
  pressed?: boolean;
  onClick?: () => void;
}) {
  const className = cn(
    "w-full rounded-lg bg-white px-5 py-4 text-left",
    pressed ? "border-black-7 border-[1.5px]" : "border border-border-dark",
  );
  const body = (
    <>
      <p className="flex items-center gap-1.5 p7 text-text-secondary">
        {mark && (
          <span
            className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-6"
            aria-hidden
          />
        )}
        {label}
      </p>
      <p className="mt-1 h4 tabular-nums text-text-primary">{number}</p>
      {line && <p className="mt-0.5 p7 text-text-tertiary">{line}</p>}
    </>
  );
  if (!onClick) return <div className={className}>{body}</div>;
  return (
    <button
      type="button"
      className={cn(className, focusRing)}
      aria-pressed={pressed}
      onClick={onClick}
    >
      {body}
    </button>
  );
}

export const filterSearchClass =
  "h-10 w-full rounded-md border border-border-dark bg-white p6 font-sans pl-9 pr-3 text-text-primary outline-none placeholder:text-text-tertiary focus:border-black-7 focus:shadow-[inset_0_0_0_1px_var(--black-7)]";

/** Shared with FactSelect / PackagePicker menus */
export const dropdownMenuContentClass =
  "bg-white border border-border-dark rounded-md p6 font-sans shadow-floating p-1.5 min-w-[var(--radix-select-trigger-width)] max-w-[360px] max-h-[320px] z-50";

export const dropdownMenuItemClass =
  "rounded-sm outline-none cursor-pointer data-[highlighted]:bg-black-2 data-[state=checked]:bg-transparent";

const dropdownTriggerBaseClass =
  "flex w-full min-w-0 items-center justify-between gap-2 rounded-md border border-border-dark bg-white px-3 p6 font-sans text-text-primary outline-none transition-colors hover:border-black-4 data-[state=open]:border-black-6 focus:border-black-7 focus:shadow-[inset_0_0_0_1px_var(--black-7)] disabled:cursor-not-allowed disabled:bg-bg-container-grey disabled:text-text-tertiary";

export function Dropdown({
  value,
  onValueChange,
  options,
  placeholder,
  ariaLabel,
  size = "default",
  disabled,
  error,
  triggerClassName,
  valueClassName,
}: {
  value: string;
  onValueChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  ariaLabel: string;
  size?: "default" | "small";
  disabled?: boolean;
  error?: boolean;
  triggerClassName?: string;
  valueClassName?: string;
}) {
  return (
    <RadixSelect.Root value={value} onValueChange={onValueChange} disabled={disabled}>
      <RadixSelect.Trigger
        type="button"
        aria-label={ariaLabel}
        className={cn(
          dropdownTriggerBaseClass,
          size === "default" ? "h-10" : "h-8",
          error &&
            "border-status-danger-mark hover:border-status-danger-mark data-[state=open]:border-status-danger-mark focus:border-status-danger-mark focus:shadow-[inset_0_0_0_1px_var(--danger-mark)]",
          triggerClassName,
        )}
      >
        {/* Radix Select.Value does not forward className — typography lives on the trigger. */}
        <RadixSelect.Value
          placeholder={placeholder}
          className={cn("min-w-0 flex-1 truncate text-left", valueClassName)}
        />
        <span className="pointer-events-none flex h-4 w-4 shrink-0 items-center justify-center text-icon-dark">
          <Icon name="chevron-down" size={16} />
        </span>
      </RadixSelect.Trigger>
      <RadixSelect.Portal>
        <RadixSelect.Content
          position="popper"
          sideOffset={4}
          align="start"
          className={cn(dropdownMenuContentClass, "overflow-hidden")}
        >
          <RadixSelect.Viewport className="max-h-[320px] overflow-y-auto p-0">
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
              <RadixSelect.Item
                key={opt.value}
                value={opt.value}
                textValue={opt.label}
                className={cn(
                  dropdownMenuItemClass,
                  "flex w-full items-center gap-2 px-3 py-2 text-left font-sans text-text-primary",
                  isSelected ? "h8" : "p6",
                )}
              >
                <RadixSelect.ItemText className="item-row-label min-w-0 flex-1">
                  {opt.label}
                </RadixSelect.ItemText>
                <RadixSelect.ItemIndicator className="ml-auto shrink-0">
                  <Icon name="check" size={16} className="text-icon-strong" />
                </RadixSelect.ItemIndicator>
              </RadixSelect.Item>
            );
            })}
          </RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );
}

const FILTER_ALL_VALUE = "__all";

function optionChildrenToLabel(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(optionChildrenToLabel).join("");
  return "";
}

function parseFilterSelectChildren(children: ReactNode): {
  allLabel: string;
  options: { value: string; label: string }[];
} {
  let allLabel = "All";
  const rest: { value: string; label: string }[] = [];
  Children.forEach(children, (child) => {
    if (!isValidElement<{ value?: string; children?: ReactNode }>(child)) return;
    if (child.type !== "option") return;
    const raw = child.props.value != null ? String(child.props.value) : "";
    const label = optionChildrenToLabel(child.props.children);
    if (raw === "") allLabel = label || "All";
    else rest.push({ value: raw, label: label || raw });
  });
  return { allLabel, options: rest };
}

export function FilterField({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={cn("flex min-w-0 flex-col gap-1", className)}>
      <span className="h9 text-text-title">{label}</span>
      {children}
    </label>
  );
}

/** Search is 1.5fr, each select is 1fr, then Your action only and Clear filters. One column on phones. */
export function FilterBar({
  selects,
  children,
  className,
}: {
  selects: number;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-6 mt-6 grid grid-cols-1 items-end gap-4 lg:[grid-template-columns:var(--filter-cols)]",
        className,
      )}
      style={
        {
          "--filter-cols": `1.5fr repeat(${selects}, minmax(0, 1fr)) auto auto`,
        } as CSSProperties
      }
    >
      {children}
    </div>
  );
}

/** Filled black circle with a white tick. 14px on a done chip. */
export function RoundTick({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden
      className="shrink-0"
    >
      <circle cx="12" cy="12" r="12" fill="var(--black-7)" />
      <path
        d="M7 12.5l3.2 3.2L17 9"
        fill="none"
        stroke="white"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Chip({
  children,
  lead,
  count,
  selected,
  onClick,
  size = "default",
}: {
  children: ReactNode;
  /** Display chips: a tick, an orange dot, or a plain later step. */
  lead?: "done" | "now" | "next";
  /** Filter chips: the number after the label. */
  count?: number;
  /** Filter chips: black fill, white label. */
  selected?: boolean;
  /** Present only on a filter chip, which is a button. */
  onClick?: () => void;
  /** Display chips only. Big matches the filter chip and the large tag. */
  size?: "default" | "big";
}) {
  const big = !onClick && size === "big";
  const className = onClick
    ? cn(
        "inline-flex h-8 items-center gap-1.5 rounded-full border px-3",
        focusRing,
        selected
          ? "border-black-7 bg-black-7 h8 text-white"
          : "border-border-dark bg-bg-container p6 text-text-primary hover:bg-black-2 active:bg-black-3",
      )
    : cn(
        "inline-flex items-center rounded-full",
        big ? "h-8 gap-2" : "h-6 gap-1.5",
        lead === "done" &&
          cn(
            "border border-border-dark bg-bg-container text-text-title",
            big ? "pl-[7px] pr-[13px] h8" : "pl-1 pr-[9px] h9",
          ),
        lead === "now" &&
          cn(
            "border border-brand-3 bg-bg-accent text-text-primary",
            big ? "px-[13px] h8" : "px-[9px] h9",
          ),
        lead === "next" &&
          cn(
            "border border-dashed border-black-4 bg-(--chip-surface) text-text-tertiary",
            big ? "px-[13px] p6" : "px-[9px] p7",
          ),
        !lead &&
          cn(
            "border border-border-dark bg-bg-container text-text-primary",
            big ? "px-[13px] h8" : "px-[9px] h9",
          ),
      );
  const body = (
    <>
      {lead === "done" && <RoundTick size={big ? 16 : 14} />}
      {lead === "now" && (
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-6" aria-hidden />
      )}
      {children}
      {count != null && (
        <span className={selected ? "text-white" : "text-text-tertiary"}>
          {count}
        </span>
      )}
    </>
  );
  if (onClick) {
    return (
      <button
        type="button"
        role="radio"
        aria-checked={Boolean(selected)}
        onClick={onClick}
        className={className}
      >
        {body}
      </button>
    );
  }
  return <span className={className}>{body}</span>;
}

export function ChipTrack({
  steps,
}: {
  steps: Array<{
    key: string;
    lead: "done" | "now" | "next";
    label: ReactNode;
    notes?: Array<{ text: string; className: string }>;
  }>;
}) {
  const n = Math.max(steps.length, 1);
  return (
    <div className="relative">
      {steps.length > 1 && (
        <div
          className="absolute top-[11px] h-0.5 bg-border-dark"
          style={{ left: `${50 / n}%`, right: `${50 / n}%` }}
          aria-hidden
        />
      )}
      <div
        className="relative z-10 grid"
        style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}
      >
        {steps.map((step) => (
          <div
            key={step.key}
            className="flex min-w-0 flex-col items-center text-center"
          >
            <Chip lead={step.lead}>{step.label}</Chip>
            {step.notes && step.notes.length > 0 && (
              <div className="mt-1">
                {step.notes.map((note) => (
                  <p key={note.text} className={note.className}>
                    {note.text}
                  </p>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function FilterChips({
  options,
  value,
  onChange,
}: {
  options: Array<{ id: string; label: string; count: number }>;
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="mt-3 flex flex-wrap gap-2" role="radiogroup">
      {options.map((option) => (
        <Chip
          key={option.id || "all"}
          count={option.count}
          selected={option.id === value}
          onClick={() => onChange(option.id)}
        >
          {option.label}
        </Chip>
      ))}
    </div>
  );
}

export function YourActionOnly({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  const { t } = useConceptI18n();
  return (
    <label className="flex h-10 cursor-pointer items-center gap-2">
      <input
        type="checkbox"
        className="peer sr-only"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span
        className={cn(
          "flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border-[1.5px] outline-none peer-focus-visible:shadow-focus",
          checked
            ? "border-black-7 bg-black-7 text-white"
            : "border-black-6 bg-white",
        )}
        aria-hidden
      >
        {checked && <Icon name="check" size={12} />}
      </span>
      <span className="whitespace-nowrap p6 text-text-primary">
        {t("Your action only")}
      </span>
    </label>
  );
}

export function FilterSelect({
  label,
  value,
  onChange,
  children,
  allLabel: allLabelProp,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
  /** Overrides the first &lt;option value=""&gt; label when present */
  allLabel?: string;
}) {
  const { allLabel: parsedAll, options } = parseFilterSelectChildren(children);
  const allLabel = allLabelProp ?? parsedAll;
  const internalValue = value === "" ? FILTER_ALL_VALUE : value;
  const isAll = internalValue === FILTER_ALL_VALUE;
  const dropdownOptions = [
    { value: FILTER_ALL_VALUE, label: allLabel },
    ...options,
  ];
  return (
    <Dropdown
      ariaLabel={label}
      value={internalValue}
      onValueChange={(next) => onChange(next === FILTER_ALL_VALUE ? "" : next)}
      options={dropdownOptions}
      triggerClassName={cn(!isAll && "border-black-6")}
      valueClassName={cn(isAll ? "text-text-title" : "text-text-primary")}
    />
  );
}

export function ClearFilters({ onClick }: { onClick: () => void }) {
  const { t } = useConceptI18n();
  return (
    <button
      type="button"
      onClick={onClick}
      className="h8 whitespace-nowrap text-text-primary underline underline-offset-[3px] decoration-border-dark"
    >
      {t("Clear filters")}
    </button>
  );
}

/** Count line at the far right, with the changed key directly under it. */
export function ChapterAside({ summary }: { summary: string }) {
  return (
    <div className="flex flex-col items-end gap-1.5 text-right">
      <p className="p6 text-text-secondary">{summary}</p>
      <ChangedKey />
    </div>
  );
}

/** 7px dot, 12px to the left of the name. The name stays put. */
export function ChangedDot({
  on,
  children,
}: {
  on: boolean;
  children: ReactNode;
}) {
  return (
    <span className="relative inline-flex items-center">
      {on && (
        <span
          role="img"
          aria-label="Changed in the last 7 days"
          className="absolute right-full top-1/2 mr-4 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-brand-6"
        />
      )}
      {children}
    </span>
  );
}

export function ChangedMark({
  w,
  children,
}: {
  w: Workstream;
  children: ReactNode;
}) {
  return <ChangedDot on={changedRecently(w)}>{children}</ChangedDot>;
}

export function PageHeader({
  crumbs,
  crumbAside,
  kind,
  title,
  facts,
  aside,
  meta,
  actions,
  legend,
  changedKey,
}: {
  crumbs?: Array<{ label: string; href?: string }>;
  crumbAside?: ReactNode;
  kind?: "batch" | "package" | "asset";
  title?: ReactNode;
  facts?: FactItem[];
  aside?: ReactNode;
  meta?: ReactNode;
  actions?: ReactNode;
  legend?: ReactNode;
  /** Design-system key: breadcrumb row (detail pages) or title row (section pages). */
  changedKey?: boolean;
}) {
  const typeText = kind ? TYPE_LABEL[kind].text : null;

  return (
    <header className="mb-6">
      {crumbs && crumbs.length > 0 && (
        <nav className="mb-6 flex min-h-5 items-center justify-between gap-4 p6 text-text-secondary">
          <div className="flex min-w-0 flex-wrap items-center gap-1">
            {crumbs.map((c, i) => (
              <span key={i} className="inline-flex items-center gap-1">
                {i > 0 && (
                  <Icon name="chevron-right" size={14} className="text-text-tertiary" />
                )}
                {c.href ? (
                  <Link href={c.href} className={cn("hover:text-text-primary", focusRing)}>
                    {c.label}
                  </Link>
                ) : (
                  <span>{c.label}</span>
                )}
              </span>
            ))}
          </div>
          {crumbAside ?? (
            kind && (changedKey || actions) ? (
              <div className="flex shrink-0 items-center justify-end gap-3">
                {changedKey && (
                  <ChangedKey className="p7 text-text-secondary" />
                )}
                {actions}
              </div>
            ) : null
          )}
        </nav>
      )}
      {kind ? (
        <div className="flex items-start gap-8">
          <div className="min-w-0 flex-1">
            <div className="flex h-5 items-center gap-2">
              <span className="h9 tracking-[0.06em] text-text-tertiary">
                {typeText}
              </span>
              <span className="-my-0.5">
                <TypeLabelInfo kind={kind} />
              </span>
            </div>
            {title && <h1 className={cn(pageTitle, "mt-1")}>{title}</h1>}
            {facts && facts.length > 0 && (
              <FactsRow facts={facts} className="mt-4" />
            )}
          </div>
          {aside}
        </div>
      ) : (
        (title || meta || legend || actions || changedKey) && (
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              {title && <h1 className={pageTitle}>{title}</h1>}
              {(meta || legend) && (
                <div className="mt-1.5 flex items-center gap-4">
                  {meta && <div className="p6 text-text-secondary">{meta}</div>}
                  {legend && <div className="ml-auto shrink-0">{legend}</div>}
                </div>
              )}
            </div>
            {(changedKey || actions) && (
              <div className="flex shrink-0 items-center gap-3">
                {changedKey && (
                  <ChangedKey className="p7 text-text-secondary" />
                )}
                {actions}
              </div>
            )}
          </div>
        )
      )}
    </header>
  );
}

/* ------------------------------------------------------------------ card */

export function Card({
  title,
  right,
  children,
  footer,
  className,
  bodyClassName,
  titleClassName,
  headerClassName,
}: {
  title?: ReactNode;
  right?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  bodyClassName?: string;
  titleClassName?: string;
  headerClassName?: string;
}) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-lg border border-border-dark bg-bg-container",
        className,
      )}
    >
      {(title || right) && (
        <header
          className={cn(
            "flex items-center justify-between gap-3 border-b border-border-light",
            headerClassName ?? "px-4 py-3",
          )}
        >
          {title && (
            <h2 className={titleClassName ?? "h7 text-text-primary"}>
              {title}
            </h2>
          )}
          {right && <div className="p6 text-text-secondary">{right}</div>}
        </header>
      )}
      <div className={cn("p-4", bodyClassName)}>{children}</div>
      {footer}
    </section>
  );
}

/** Design system Timeline ("History"): date first, newest first, `brand-6` dot when `you`. */
export type TimelineItem = {
  event: string;
  detail?: string;
  /** Short date for the left column (e.g. from `short()`). */
  date: string;
  year: string;
  /** Waits on the customer — accent dot until settled. */
  you?: boolean;
};

export function Timeline({ items }: { items: TimelineItem[] }) {
  const years = new Set(items.map((item) => item.year));
  return (
    <ol className="flex flex-col gap-4">
      {items.map((item, index) => {
        const showYear =
          years.size > 1
            ? index === 0 || item.year !== items[index - 1]?.year
            : index === 0;
        return (
          <li key={`${item.date}-${item.event}-${index}`}>
            {showYear && (
              <div className="grid grid-cols-[52px_16px_minmax(0,1fr)] gap-x-2.5 pb-2">
                <p className="col-start-3 s3 text-text-tertiary">{item.year}</p>
              </div>
            )}
            <div className="grid grid-cols-[52px_16px_minmax(0,1fr)] gap-x-2.5">
              <p className="h9 text-right text-text-title">{item.date}</p>
              <div className="relative flex justify-center">
                <span
                  className={cn(
                    "z-10 mt-1.5 h-2 w-2 shrink-0 rounded-full",
                    item.you
                      ? "bg-brand-6 shadow-[0_0_0_3px_var(--bg-accent)]"
                      : "bg-black-4",
                  )}
                />
                {index < items.length - 1 && (
                  <span
                    className="absolute top-3.5 -bottom-5 w-px bg-black-3"
                    aria-hidden
                  />
                )}
              </div>
              <div className="min-w-0">
                <p className="h8 text-text-primary">{item.event}</p>
                {item.detail && (
                  <p className="p7 text-text-secondary">{item.detail}</p>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

const BUTTON_TYPE = {
  primary: "bg-brand-6 text-white hover:bg-brand-7 active:bg-brand-8",
  strong: "bg-black-7 text-white hover:bg-black-6",
  secondary:
    "border border-border-dark bg-bg-container text-text-primary hover:bg-black-2 active:bg-black-3",
  tertiary: "text-text-primary hover:bg-black-2 active:bg-black-3",
  link: "h-auto rounded-none px-0 text-text-primary underline decoration-border-dark underline-offset-2 hover:text-text-primary hover:decoration-text-primary",
  danger:
    "border border-status-danger-border bg-bg-container text-status-danger-text hover:bg-status-danger-bg active:bg-status-danger-border",
} as const;

const BUTTON_SIZE = {
  large: "h-10 rounded-md px-4",
  default: "h-8 rounded-md px-3",
  small: "h-6 rounded-sm px-2 h9",
} as const;

/** Icon side is tighter; the label side keeps the size's usual padding. */
const ICON_PAD: Record<
  keyof typeof BUTTON_SIZE,
  Record<"left" | "right", string>
> = {
  large: { left: "pl-3 pr-4", right: "pl-4 pr-3" },
  default: { left: "pl-2 pr-3", right: "pl-3 pr-2" },
  small: { left: "pl-1.5 pr-2", right: "pl-2 pr-1.5" },
};

export function Button({
  type = "primary",
  size = "default",
  icon,
  iconPosition = "left",
  href,
  disabled,
  onClick,
  children,
  className,
  ariaLabel,
}: {
  type?: keyof typeof BUTTON_TYPE;
  size?: keyof typeof BUTTON_SIZE;
  icon?: string;
  iconPosition?: "left" | "right";
  href?: string;
  disabled?: boolean;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
}) {
  const showIcon = Boolean(icon) && type !== "link";
  const cls = cn(
    "inline-flex shrink-0 items-center justify-center whitespace-nowrap h8 outline-none focus-visible:shadow-focus disabled:pointer-events-none disabled:bg-black-2 disabled:text-black-4",
    showIcon && (size === "small" ? "gap-1.5" : "gap-2"),
    BUTTON_TYPE[type],
    type !== "link" && BUTTON_SIZE[size],
    showIcon && ICON_PAD[size][iconPosition],
    className,
  );
  const glyph = showIcon ? (
    <Icon name={icon!} size={size === "small" ? 14 : 16} />
  ) : null;
  const content = (
    <>
      {iconPosition === "left" && glyph}
      {children}
      {iconPosition === "right" && glyph}
    </>
  );
  if (href)
    return (
      <Link
        href={href}
        className={cls}
        aria-label={ariaLabel}
        aria-disabled={disabled || undefined}
      >
        {content}
      </Link>
    );
  return (
    <button
      type="button"
      className={cls}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick}
    >
      {content}
    </button>
  );
}

export type PackagePickerOption = {
  id: string;
  name: string;
  subline: string;
};

type PickerGroup = { label?: string; options: PackagePickerOption[] };

function buildPickerEntries(
  options: PackagePickerOption[] | undefined,
  groups: PickerGroup[] | undefined,
): Array<{ kind: "label"; text: string } | { kind: "opt"; option: PackagePickerOption; optIndex: number }> {
  if (groups?.length) {
    const out: Array<
      { kind: "label"; text: string } | { kind: "opt"; option: PackagePickerOption; optIndex: number }
    > = [];
    let optIndex = 0;
    for (const g of groups) {
      if (g.label) out.push({ kind: "label", text: g.label });
      for (const option of g.options) {
        out.push({ kind: "opt", option, optIndex });
        optIndex += 1;
      }
    }
    return out;
  }
  return (options ?? []).map((option, optIndex) => ({
    kind: "opt" as const,
    option,
    optIndex,
  }));
}

/** Package switcher in the asset header when the asset is in more than one package. */
export function PackagePicker({
  options,
  groups,
  selectedId,
  selectedIndex,
  total,
  onSelect,
}: {
  options?: PackagePickerOption[];
  /** When set, options are shown in sections (e.g. Earlier). */
  groups?: PickerGroup[];
  selectedId: string;
  selectedIndex: number;
  total: number;
  onSelect: (id: string) => void;
}) {
  const entries = buildPickerEntries(options, groups);
  const flatOptions = entries
    .filter((e): e is Extract<typeof e, { kind: "opt" }> => e.kind === "opt")
    .map((e) => e.option);
  const selected =
    flatOptions.find((item) => item.id === selectedId) ?? flatOptions[0];
  return (
    <RadixSelect.Root value={selectedId} onValueChange={onSelect}>
      <RadixSelect.Trigger
        type="button"
        className={cn(
          "inline-flex max-w-full min-w-0 items-center gap-1.5 rounded-sm p6 font-sans text-text-primary",
          focusRing,
          "-mx-1.5 -my-0.5 px-1.5 py-0.5",
          "data-[state=open]:bg-black-2",
          "hover:bg-black-2",
        )}
        aria-label={`Package: ${selected?.name ?? ""}. ${selectedIndex} of ${total}. Change package`}
      >
        <span className="min-w-0 truncate">{selected?.name}</span>
        <Icon name="chevron-down" size={16} className="shrink-0 text-icon-dark" />
      </RadixSelect.Trigger>
      <RadixSelect.Portal>
        <RadixSelect.Content
          position="popper"
          sideOffset={4}
          align="start"
          className={cn(dropdownMenuContentClass, "w-[min(330px,var(--radix-select-trigger-width))]")}
        >
          <RadixSelect.Viewport className="max-h-[320px] overflow-y-auto p-0">
            {(() => {
              const blocks: ReactNode[] = [];
              let i = 0;
              while (i < entries.length) {
                const entry = entries[i];
                if (entry.kind === "label") {
                  const labelText = entry.text;
                  i += 1;
                  const groupItems: PackagePickerOption[] = [];
                  while (i < entries.length && entries[i].kind === "opt") {
                    groupItems.push(
                      (entries[i] as { kind: "opt"; option: PackagePickerOption }).option,
                    );
                    i += 1;
                  }
                  blocks.push(
                    <RadixSelect.Group key={`group-${labelText}-${i}`}>
                      <RadixSelect.Label className="block px-3 pb-1 pt-2 p7 text-text-tertiary">
                        {labelText}
                      </RadixSelect.Label>
                      {groupItems.map((item) => {
                        const isSelected = item.id === selectedId;
                        return (
                          <RadixSelect.Item
                            key={item.id}
                            value={item.id}
                            textValue={item.name}
                            className={cn(
                              dropdownMenuItemClass,
                              "flex w-full cursor-pointer items-start gap-2 text-left font-sans text-text-primary",
                              isSelected ? "h8" : "p6",
                            )}
                          >
                            <div className="min-w-0 flex-1">
                              <RadixSelect.ItemText className="item-row-label block">
                                {item.name}
                              </RadixSelect.ItemText>
                              <span className="mt-0.5 block p7 text-text-secondary">
                                {item.subline}
                              </span>
                            </div>
                            <RadixSelect.ItemIndicator className="ml-auto shrink-0">
                              <Icon name="check" size={16} className="text-icon-strong" />
                            </RadixSelect.ItemIndicator>
                          </RadixSelect.Item>
                        );
                      })}
                    </RadixSelect.Group>,
                  );
                } else {
                  const item = entry.option;
                  const isSelected = item.id === selectedId;
                  blocks.push(
                    <RadixSelect.Item
                      key={item.id}
                      value={item.id}
                      textValue={item.name}
                      className={cn(
                        dropdownMenuItemClass,
                        "flex w-full cursor-pointer items-start gap-2 text-left font-sans text-text-primary",
                        isSelected ? "h8" : "p6",
                      )}
                    >
                      <div className="min-w-0 flex-1">
                        <RadixSelect.ItemText className="item-row-label block">
                          {item.name}
                        </RadixSelect.ItemText>
                        <span className="mt-0.5 block p7 text-text-secondary">
                          {item.subline}
                        </span>
                      </div>
                      <RadixSelect.ItemIndicator className="ml-auto shrink-0">
                        <Icon name="check" size={16} className="text-icon-strong" />
                      </RadixSelect.ItemIndicator>
                    </RadixSelect.Item>,
                  );
                  i += 1;
                }
              }
              return blocks;
            })()}
          </RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );
}

export type PackageCardChip = {
  id: string;
  label: string;
  lead: "done" | "now";
  selectable?: boolean;
  selected?: boolean;
  onSelect?: () => void;
};

function renderPackageCardChip(chip: PackageCardChip, _switchable: boolean) {
  const display = (
    <Chip lead={chip.lead} size="big">
      {chip.label}
    </Chip>
  );
  return <span key={chip.id}>{display}</span>;
}

/** White card: service chips and one grey panel (asset page and package Overview). */
export function PackageCard({
  packageName,
  chips,
  switchable = false,
  tablistLabel: _tablistLabel = "Services for this asset",
  scopeLine,
  openPackageHref,
  openPackageAriaLabel,
  /** When set, replaces the scope line + Open package column. */
  asideContent,
  panelTitle,
  panelAside,
  panelChildren,
}: {
  /** Asset page: package label and name above the service chips. */
  packageName?: string;
  chips: PackageCardChip[];
  switchable?: boolean;
  tablistLabel?: string;
  /** Asset page: shared package sections, left of Open package. */
  scopeLine?: string;
  openPackageHref?: string;
  openPackageAriaLabel?: string;
  asideContent?: ReactNode;
  panelTitle?: string;
  panelAside?: string;
  panelChildren?: ReactNode;
}) {
  const chipElements = chips.map((chip) =>
    renderPackageCardChip(chip, switchable),
  );

  /** Service chips are display-only (tabs switch panels). */
  const chipRow = (
    <div className="flex flex-wrap gap-2">{chipElements}</div>
  );

  const openPackage =
    asideContent ??
    (scopeLine && openPackageHref ? (
      <div className="flex shrink-0 items-center gap-6">
        <p className="max-w-[280px] p7 text-right text-text-secondary">
          {scopeLine}
        </p>
        <Button
          type="strong"
          size="large"
          icon="chevron-right"
          iconPosition="right"
          href={openPackageHref}
          ariaLabel={openPackageAriaLabel}
          className="shrink-0"
        >
          Open package
        </Button>
      </div>
    ) : openPackageHref ? (
      <Button
        type="strong"
        size="large"
        icon="chevron-right"
        iconPosition="right"
        href={openPackageHref}
        ariaLabel={openPackageAriaLabel}
        className="shrink-0"
      >
        Open package
      </Button>
    ) : null);

  return (
    <section className="rounded-lg border border-border-dark bg-bg-container px-5 pb-5 pt-4">
      {packageName ? (
        <div className="flex items-start justify-between gap-6">
          <div className="min-w-0">
            <p className="p7 text-text-tertiary">{WORDS.Package}</p>
            <p className="h7 text-text-primary">{packageName}</p>
            <div className="mt-3">{chipRow}</div>
          </div>
          {openPackage}
        </div>
      ) : (
        chipRow
      )}
      {panelTitle && panelChildren && (
        <div className="surface-grey mt-4 rounded-md bg-bg-container-grey px-4 pb-4 pt-3">
          <div className="mb-4 flex items-baseline justify-between gap-3">
            <h3 className="h8 text-text-primary">{panelTitle}</h3>
            {panelAside && (
              <p className="p7 text-text-tertiary">{panelAside}</p>
            )}
          </div>
          {panelChildren}
        </div>
      )}
    </section>
  );
}

/** @deprecated Use PackageCard */
export const AssetPackageCard = PackageCard;

/** One package on an asset page: where it is, and the door to its results. */
export function PackageStrip({
  name,
  services,
  status,
  title,
  aside,
  children,
}: {
  name: string;
  services: Array<{ label: string; lead: "done" | "now" }>;
  status: ReactNode;
  title?: string;
  aside?: string;
  children?: ReactNode;
}) {
  return (
    <Card bodyClassName="px-5 py-4">
      <div className="flex items-center justify-between gap-6">
        <div className="min-w-0">
          <p className="p7 text-text-tertiary">Package</p>
          <h2 className="h7 text-text-primary">{name}</h2>
          {services.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {services.map((item) => (
                <Chip key={item.label} lead={item.lead} size="big">
                  {item.label}
                </Chip>
              ))}
            </div>
          )}
        </div>
        {status}
      </div>
      {children && (
        <div className="surface-grey mt-4 rounded-md border border-border-light bg-bg-container-grey px-4 pb-4 pt-3">
          <div className="flex items-center justify-between gap-3">
            {title && <h3 className="h8 text-text-primary">{title}</h3>}
            {aside && <p className="p7 text-text-tertiary">{aside}</p>}
          </div>
          <div className="mt-3">{children}</div>
        </div>
      )}
    </Card>
  );
}

const ICON_BUTTON_SIZE = {
  large: "size-10 rounded-md",
  default: "size-8 rounded-md",
  small: "size-6 rounded-sm",
} as const;

const ICON_BUTTON_ICON = { large: 20, default: 16, small: 14 } as const;

/** Square icon control. The label is the tooltip and the screen-reader name. */
export function IconButton({
  icon,
  label,
  type = "tertiary",
  size = "default",
  href,
  onClick,
  disabled,
  expanded,
}: {
  icon: string;
  label: string;
  type?: "secondary" | "tertiary";
  size?: keyof typeof ICON_BUTTON_SIZE;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  expanded?: boolean;
}) {
  const cls = cn(
    "inline-flex shrink-0 items-center justify-center outline-none",
    focusRing,
    ICON_BUTTON_SIZE[size],
    type === "secondary"
      ? "border border-border-dark bg-bg-container text-text-primary hover:bg-black-2 active:bg-black-3"
      : "text-icon-default hover:bg-black-2 active:bg-black-3 hover:text-icon-strong",
    disabled && "pointer-events-none text-icon-disabled",
  );
  const glyph = <Icon name={icon} size={ICON_BUTTON_ICON[size]} />;
  const control = href ? (
    <Link
      href={href}
      className={cls}
      aria-label={label}
      aria-disabled={disabled || undefined}
      aria-expanded={expanded}
    >
      {glyph}
    </Link>
  ) : (
    <button
      type="button"
      className={cls}
      aria-label={label}
      aria-expanded={expanded}
      disabled={disabled}
      onClick={onClick}
    >
      {glyph}
    </button>
  );
  return (
    <span className="group relative inline-flex">
      {control}
      <span
        role="tooltip"
        aria-hidden
        className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-black-7 px-2 py-1 p7 text-white opacity-0 shadow-floating group-hover:opacity-100 group-focus-within:opacity-100"
      >
        {label}
      </span>
    </span>
  );
}

/** Ops detail bar: inline pill (36 high) or floating assistant control. */
export function AssistantButton({
  onClick,
  label = "Ask the assistant",
  inline,
}: {
  onClick?: () => void;
  label?: string;
  inline?: boolean;
}) {
  const mark = (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-white",
        inline ? "size-6" : "size-7",
      )}
      aria-hidden
    >
      <Icon
        name="idea"
        size={inline ? 12 : 14}
        className="text-black-7"
      />
    </span>
  );
  const cls = cn(
    "inline-flex items-center gap-2 rounded-full bg-black-7 pr-4 text-white hover:bg-black-6",
    focusRing,
    inline ? "h-9 pl-2.5 h8" : "fixed bottom-8 right-8 z-20 h-12 pl-3 pr-4 h8 shadow-floating",
  );
  return (
    <button type="button" className={cls} onClick={onClick}>
      {mark}
      {label}
    </button>
  );
}

export function FilterSearch({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const { t, words } = useConceptI18n();
  const inputRef = useRef<HTMLInputElement>(null);
  const hasValue = value.length > 0;
  const placeholderText =
    placeholder ?? t("{0} or project name", words.Package);
  const clear = () => {
    onChange("");
    queueMicrotask(() => inputRef.current?.focus());
  };

  return (
    <div className="relative w-full">
      <Icon name="search" size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-icon-default" />
      <input
        ref={inputRef}
        type="search"
        value={value}
        placeholder={placeholderText}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.preventDefault();
            clear();
          }
        }}
        className={cn(filterSearchClass, hasValue && "pr-9")}
      />
      {hasValue && (
        <button
          type="button"
          aria-label={t("Clear search")}
          onClick={clear}
          className="absolute right-3 top-1/2 inline-flex size-5 -translate-y-1/2 items-center justify-center rounded-sm text-black-4 outline-none hover:text-black-7 focus-visible:text-black-7 focus-visible:shadow-[0_0_0_2px_var(--black-7)]"
        >
          <Icon name="cross" size={16} />
        </button>
      )}
    </div>
  );
}

/** One document row: file-type tag, meta, and a single icon action. */
export function DocumentList({
  docs,
  readOnly,
}: {
  docs: Doc[];
  /** Inherited tab: no download / view controls. */
  readOnly?: boolean;
}) {
  const hideActions = readOnly === true;
  return (
    <ul>
      {docs.map((doc, index) => (
        <li
          key={doc.name}
          className={cn(
            "flex items-center justify-between gap-4 py-3",
            index > 0 && "border-t border-border-light",
          )}
        >
          <div className="min-w-0">
            <p
              className={cn(
                "h8",
                doc.muted ? "text-text-tertiary" : "text-text-title",
              )}
            >
              {shortFact(doc.name)}
            </p>
            <div className="mt-0.5 flex items-center gap-1.5">
              {!doc.muted && doc.type && (
                <Tag type="neutral" size="xsmall">
                  {doc.type}
                </Tag>
              )}
              <p
                className={cn(
                  "p7",
                  doc.muted ? "text-text-tertiary" : "text-text-secondary",
                )}
              >
                {shortFact(doc.meta)}
              </p>
            </div>
          </div>
          {!hideActions && !doc.muted && doc.action === "Download" && (
            <IconButton icon="download" label={`Download ${doc.name}`} />
          )}
          {!hideActions && !doc.muted && doc.action === "View" && (
            <IconButton icon="chevron-right" label={`View ${doc.name}`} />
          )}
        </li>
      ))}
    </ul>
  );
}

export function CardLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="h8 text-text-primary underline underline-offset-[3px] decoration-border-dark"
    >
      {children}
    </Link>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="p6 text-text-secondary">{children}</p>;
}

/* --------------------------------------------------------------- status */

const OWNER_STYLE: Record<Owner, string> = {
  you: "border border-brand-2 bg-bg-accent text-brand-7",
  cquel: "border border-border-dark bg-black-1 text-text-secondary",
  suppliers: "border border-border-dark bg-black-1 text-text-secondary",
  done: "bg-black-2 text-text-secondary",
};

export function ResponsibilityPill({
  owner,
  label,
  className,
}: {
  owner: Owner;
  label?: string;
  className?: string;
}) {
  const { lang } = useConceptI18n();
  return (
    <span
      className={cn(
        "inline-flex h-6 w-fit shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-2.5 h9",
        OWNER_STYLE[owner],
        className,
      )}
    >
      {label ?? ownerLabel(lang, owner)}
    </span>
  );
}

export const ownerText: Record<Owner, string> = {
  you: "text-brand-7",
  cquel: "text-text-secondary",
  suppliers: "text-text-secondary",
  done: "text-text-secondary",
};

export { ServiceTag } from "./ServiceTag";
export { ResponsibilityPill as OwnerPill };

/** Thin progress bar: done share in ink, rest light */
export function Bar({
  done,
  total,
  tone = "ink",
  className,
}: {
  done: number;
  total: number;
  tone?: "ink" | "accent";
  className?: string;
}) {
  const pct = total ? Math.round((done / total) * 100) : 0;
  return (
    <div
      className={cn(
        "h-1 w-full overflow-hidden rounded-full bg-black-2",
        className,
      )}
    >
      <div
        className="h-full rounded-full bg-black-6"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

/* ---------------------------------------------------------------- route */

/**
 * A batch's route through its services. Services outside the route show as
 * "Not required" so the layout stays the same for every batch.
 */
export function Route({
  account,
  batch,
  highlight,
}: {
  account: Account;
  batch: Batch;
  highlight?: ServiceId;
}) {
  const slots = batchSlots(account, batch);
  const kickoff = batch.planState !== "live";
  const firstPlanned = slots.find(
    (s) => s.inRoute && s.state === "planned",
  )?.service;
  const cols = slots.map((s) => {
      const label = serviceDef(s.service).label;
      if (s.state === "skip")
        return {
          key: s.service,
          label:
            s.service === "tender" || s.service === "pricing"
              ? `or ${label}`
              : label,
          state: "skip",
          lines: ["Not required"],
          done: 0,
          total: 0,
        };
      if (s.state === "done")
        return {
          key: s.service,
          label,
          state: "done",
          lines: [`Done · ${s.total} projects`],
          done: 1,
          total: 1,
        };
      if (s.state === "now")
        return {
          key: s.service,
          label,
          state: "now",
          lines: [`${s.done} of ${s.total} done`],
          done: s.done,
          total: s.total,
        };
      const laterOn = slots
        .slice(slots.indexOf(s) + 1)
        .some((later) => later.inRoute && (later.state === "now" || later.state === "done"));
      return {
        key: s.service,
        label,
        state: laterOn ? "done" : "planned",
        lines: [laterOn ? `${s.total} passed through` : kickoff && s.service === firstPlanned ? "Next" : "Planned"],
        done: 0,
        total: 0,
      };
    });
  return (
    <ol className="grid grid-cols-3 gap-x-3 gap-y-5 md:grid-cols-5">
      {cols.map((c) => (
        <li
          key={c.key}
          className={cn(
            "min-w-0 rounded-md",
            highlight === c.key &&
              "bg-bg-container-grey p-2 -m-2 ring-1 ring-border-dark",
          )}
        >
          <p
            className={cn(
              "mb-2 truncate p6",
              c.state === "skip"
                ? "text-text-tertiary"
                : "font-semibold text-text-primary",
            )}
          >
            {c.label}
          </p>
          <div
            className={cn(
              "h-2.5 overflow-hidden rounded-full",
              c.state === "done" && "bg-black-7",
              c.state === "now" && "bg-[var(--brand-2)]",
              c.state === "planned" && "bg-black-2",
              c.state === "skip" &&
                "border border-dashed border-border-dark bg-white",
            )}
          >
            {c.state === "now" && (
              <div
                className="h-full rounded-full bg-brand-6"
                style={{
                  width: `${Math.max(8, c.total ? (c.done / c.total) * 100 : 0)}%`,
                }}
              />
            )}
          </div>
          {c.lines.map((l, i) => (
            <p
              key={i}
              className={cn(
                "mt-2 p7",
                i === 0 && c.state === "now"
                  ? "font-semibold text-text-primary"
                  : i === 0 && c.state !== "skip"
                    ? "text-text-secondary"
                    : "text-text-tertiary",
                i > 0 && "mt-0.5 text-text-secondary",
              )}
            >
              {l}
            </p>
          ))}
        </li>
      ))}
    </ol>
  );
}

export const workstreamLabel = (w: Workstream) => w.name;

export { SERVICES, doneCount };
