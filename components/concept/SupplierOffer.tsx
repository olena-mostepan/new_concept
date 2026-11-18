"use client";

/*
 * Supplier concept · the indicative offer, C4 board (18 Nov):
 * upload your quote → we read it → check what we read → send → sent (with continuity).
 * Everything happens inside the offer card on the Overview.
 * Decided 18 Nov: an edit after sending notifies CQuel; "How your offer reads" is shown
 * to the supplier and written automatically.
 */

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { SupplierTender as Tender } from "@/lib/concept/supplier";
import { Button, ChipTrack, Icon, ResponsibilityPill, focusRing } from "./ui";
import { FoundValue, StateMark } from "./ops-asset/opsUi";

export type OfferPhase = "start" | "reading" | "check" | "sent";
type RowKey = "price" | "sites" | "start" | "duration" | "warranties";
type RowState = "done" | "open" | "disagree";

interface Row {
  key: RowKey;
  name: string;
  state: RowState;
  value: string;
  source: string;
}

export interface Offer {
  phase: OfferPhase;
  fileName: string;
  rows: Row[];
  /** Site numbers in the price. */
  sites: number[];
  /** Editing after sending. */
  resend: boolean;
  openCount: number;
  pick: () => void;
  send: () => void;
  edit: () => void;
  cancelEdit: () => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onFile: (name: string) => void;
  cancelReading: () => void;
  setRow: (key: RowKey, value: string, source: string) => void;
  setSites: (ns: number[]) => void;
}

const inputClass =
  "h-10 rounded-md border border-border-dark bg-white px-3 p6 font-sans text-text-primary outline-none placeholder:text-text-tertiary focus:border-black-7 focus:shadow-[inset_0_0_0_1px_var(--black-7)]";

function firstRows(t: Tender): Row[] {
  const q = t.quote;
  return [
    { key: "price", name: "Total price", state: "disagree", value: "", source: "" },
    { key: "sites", name: "Sites covered", state: "done", value: "", source: `page ${q.sitesPage}` },
    { key: "start", name: "Start", state: "done", value: q.start.value, source: `page ${q.start.page}` },
    { key: "duration", name: "Duration", state: "done", value: q.duration.value, source: `page ${q.duration.page}` },
    { key: "warranties", name: "Warranties", state: "open", value: "", source: "" },
  ];
}

export function useOffer(t: Tender): Offer {
  const [phase, setPhase] = useState<OfferPhase>("start");
  const [fileName, setFileName] = useState("");
  const [rows, setRows] = useState<Row[]>(() => firstRows(t));
  const [sites, setSitesState] = useState<number[]>(() => t.sites.map((s) => s.n));
  const [resend, setResend] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const onFile = (name: string) => {
    setFileName(name);
    setRows(firstRows(t));
    setSitesState(t.sites.map((s) => s.n));
    setPhase("reading");
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setPhase("check"), 1800);
  };

  return {
    phase,
    fileName,
    rows,
    sites,
    resend,
    openCount: rows.filter((r) => r.state !== "done").length,
    inputRef,
    pick: () => inputRef.current?.click(),
    onFile,
    cancelReading: () => {
      window.clearTimeout(timer.current);
      setPhase(resend ? "sent" : "start");
    },
    send: () => {
      setPhase("sent");
      setResend(false);
    },
    edit: () => {
      setResend(true);
      setPhase("check");
    },
    cancelEdit: () => {
      setResend(false);
      setPhase("sent");
    },
    setRow: (key, value, source) =>
      setRows((cur) => cur.map((r) => (r.key === key ? { ...r, value, source, state: "done" } : r))),
    setSites: setSitesState,
  };
}

/* ------------------------------------------------------------- helpers */

export function sitesLine(t: Tender, ns: number[]) {
  const left = t.sites.filter((s) => !ns.includes(s.n));
  const base = `${ns.length} of ${t.sites.length}`;
  return left.length ? `${base} · not covered: ${left.map((s) => s.name).join(", ")}` : base;
}

function rowValue(t: Tender, offer: Offer, r: Row) {
  return r.key === "sites" ? sitesLine(t, offer.sites) : r.value;
}

function money(v: string) {
  const n = Number(v.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

/** What the customer sees, one line each. Used for "You said". */
export function saidJob(t: Tender, offer: Offer) {
  const get = (k: RowKey) => offer.rows.find((r) => r.key === k)?.value ?? "";
  return `${sitesLine(t, offer.sites).split(" · ")[0]} sites · start ${get("start")} · ${get("duration")}`;
}
export function saidPrice(offer: Offer) {
  const get = (k: RowKey) => offer.rows.find((r) => r.key === k)?.value ?? "";
  return `${get("price")} excl. VAT · ${get("warranties")}`;
}

/* ---------------------------------------------------------------- card */

function steps(t: Tender, phase: OfferPhase) {
  return t.offerSteps.map((s, i) => {
    const now = phase === "start" ? 0 : phase === "sent" ? 3 : 1;
    return {
      key: s.key,
      lead: (i < now ? "done" : i === now ? "now" : "next") as "done" | "now" | "next",
      label: s.label,
      notes: phase === "start" ? [{ text: s.text, className: "mt-1 p7 text-text-secondary" }] : undefined,
    };
  });
}

function FileRow({ name, meta, reading, action }: { name: string; meta: string; reading?: boolean; action: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[36px_minmax(0,1fr)_auto] items-center gap-3 border-y border-border-light py-3">
      <span className="flex size-9 items-center justify-center rounded-md border border-border-dark bg-white">
        <Icon name="document" size={18} className="text-icon-default" />
      </span>
      <div className="min-w-0">
        <p className="truncate h8 text-text-primary">{name}</p>
        <p className="p7 text-text-secondary">
          {meta}
          {reading && " · Reading: total price, sites, start, duration, warranties"}
        </p>
        {reading && (
          <div className="mt-1.5 h-1 w-60 overflow-hidden rounded-full bg-black-2" role="progressbar" aria-label="Reading your quote">
            <div className="h-full w-full origin-left animate-[offerread_1.8s_ease-out_forwards] rounded-full bg-black-7" />
          </div>
        )}
      </div>
      {action}
    </div>
  );
}

function ValueEdit({
  initial,
  placeholder,
  label,
  onSave,
  onCancel,
  saveType = "primary",
}: {
  initial: string;
  placeholder?: string;
  label: string;
  onSave: (v: string) => void;
  onCancel?: () => void;
  saveType?: "primary" | "secondary";
}) {
  const [v, setV] = useState(initial);
  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        className={cn(inputClass, "w-[420px] max-w-full")}
        value={v}
        placeholder={placeholder}
        aria-label={label}
        onChange={(e) => setV(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && v.trim() && onSave(v.trim())}
      />
      <Button type={saveType} disabled={!v.trim()} onClick={() => onSave(v.trim())}>
        Save
      </Button>
      {onCancel && (
        <Button type="secondary" onClick={onCancel}>
          Cancel
        </Button>
      )}
    </div>
  );
}

function SitesEdit({ t, offer, onDone }: { t: Tender; offer: Offer; onDone: () => void }) {
  const [sel, setSel] = useState<number[]>(offer.sites);
  const [q, setQ] = useState("");
  const all = t.sites.length;
  const shown = t.sites.filter((s) => s.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="flex flex-col gap-2.5 rounded-md border border-border-dark bg-black-1 px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <span className="s3 text-text-tertiary">
          Sites in your price · {sel.length} of {all}
        </span>
        <Button type="link" onClick={() => setSel(t.sites.map((s) => s.n))}>
          Select all
        </Button>
      </div>
      {all > 10 && (
        <input className={cn(inputClass, "w-full")} placeholder="Search sites" aria-label="Search sites" value={q} onChange={(e) => setQ(e.target.value)} />
      )}
      <div className="max-h-[232px] overflow-y-auto rounded-md border border-border-dark bg-white">
        {shown.map((s) => (
          <label key={s.n} className="flex cursor-pointer items-center gap-2.5 border-b border-border-light px-3 py-2 last:border-b-0 p6 text-text-primary">
            <input
              type="checkbox"
              className={cn("size-4 accent-[var(--black-7)]", focusRing)}
              checked={sel.includes(s.n)}
              onChange={(e) => setSel((cur) => (e.target.checked ? [...cur, s.n].sort((a, b) => a - b) : cur.filter((n) => n !== s.n)))}
            />
            {s.n} · {s.name}
          </label>
        ))}
      </div>
      <div className="flex gap-2">
        <Button
          type="primary"
          disabled={sel.length === 0}
          onClick={() => {
            offer.setSites(sel);
            onDone();
          }}
        >
          {`Save ${sel.length} ${sel.length === 1 ? "site" : "sites"}`}
        </Button>
        <Button type="secondary" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

function CheckRow({ t, offer, r }: { t: Tender; offer: Offer; r: Row }) {
  const [editing, setEditing] = useState(false);
  const [another, setAnother] = useState(false);
  const line =
    r.state === "done"
      ? `${rowValue(t, offer, r)} · ${r.source}`
      : r.state === "disagree"
        ? `Your quote has ${t.quote.priceOptions.length} totals. Choose one, or enter another.`
        : "Not in your quote";
  return (
    <div className="grid grid-cols-[20px_minmax(0,1fr)_auto] items-center gap-x-4 border-b border-border-light py-3.5">
      <StateMark state={r.state === "done" ? "done" : "open"} size={20} />
      <div className="min-w-0">
        <p className="h8 text-text-primary">{r.name}</p>
        <p className="p7 text-text-secondary">{line}</p>
      </div>
      {r.state === "done" && !editing ? (
        <Button type="tertiary" icon="edit" onClick={() => setEditing(true)}>
          Edit
        </Button>
      ) : (
        <span />
      )}

      {r.state === "done" && editing && (
        <div className="col-start-2 col-end-4 mt-3">
          {r.key === "sites" ? (
            <SitesEdit t={t} offer={offer} onDone={() => setEditing(false)} />
          ) : (
            <div className="rounded-md border border-border-dark bg-black-1 px-4 py-3">
              <ValueEdit
                initial={r.value}
                label={r.name}
                onSave={(v) => {
                  offer.setRow(r.key, v, "Typed");
                  setEditing(false);
                }}
                onCancel={() => setEditing(false)}
              />
            </div>
          )}
        </div>
      )}

      {r.state === "open" && (
        <div className="col-start-2 col-end-4 mt-3">
          <ValueEdit
            initial=""
            label={r.name}
            placeholder="For example: panels 25 years, workmanship 10 years"
            saveType="secondary"
            onSave={(v) => offer.setRow(r.key, v, "Typed")}
          />
        </div>
      )}

      {r.state === "disagree" && (
        <div className="col-start-2 col-end-4 mt-3 flex flex-col gap-2">
          {t.quote.priceOptions.map((o) => (
            <FoundValue key={o.page} value={o.value} file={offer.fileName} page={o.page} quote={o.quote}>
              <Button type="secondary" onClick={() => offer.setRow("price", o.value, `page ${o.page}`)}>
                {`Use ${o.value}`}
              </Button>
            </FoundValue>
          ))}
          {another ? (
            <ValueEdit initial="" label="Total price" placeholder="£" saveType="secondary" onSave={(v) => offer.setRow("price", v, "Typed")} onCancel={() => setAnother(false)} />
          ) : (
            <div>
              <Button type="secondary" onClick={() => setAnother(true)}>
                Another value
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Header({ t, title, text, pill = true }: { t: Tender; title: string; text?: string; pill?: boolean }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1">
      {pill && (
        <div className="flex items-center gap-2">
          <ResponsibilityPill owner="you" label="Your action" />
          <span className="s3 text-text-tertiary">Due {t.round.due.replace("due ", "")}</span>
        </div>
      )}
      <h2 id="offer-h" className="h6 text-text-primary">
        {title}
      </h2>
      {text && <p className="p6 text-text-secondary">{text}</p>}
    </div>
  );
}

function Sent({ t, offer }: { t: Tender; offer: Offer }) {
  const get = (k: RowKey) => offer.rows.find((r) => r.key === k)?.value ?? "";
  const due = t.round.due.replace("due ", "");
  const budgetFact = t.facts.find((f) => f.label === "Budget");
  const price = money(get("price"));
  const budget = budgetFact ? money(budgetFact.value) : 0;
  const allSites = offer.sites.length === t.sites.length;
  const reads: Array<{ ok: boolean; title: string; text: string }> = [];
  if (budget)
    reads.push({
      ok: price <= budget,
      title: price <= budget ? "Price is within the budget" : "Price is over the budget",
      text: `Your total ${get("price")} · their budget ~${budgetFact?.value}`,
    });
  reads.push({
    ok: allSites,
    title: allSites ? `All ${t.sites.length} sites covered` : `${offer.sites.length} of ${t.sites.length} sites covered`,
    text: allSites ? "The customer asked for every site in one price" : `Not covered: ${t.sites.filter((s) => !offer.sites.includes(s.n)).map((s) => s.name).join(", ")}`,
  });
  t.quote.gaps.forEach((g) => reads.push({ ok: false, title: g.title, text: g.text }));

  const cells = [
    { label: "Total price", value: get("price"), note: "excl. VAT" },
    { label: "Sites covered", value: sitesLine(t, offer.sites).split(" · ")[0] },
    { label: "Start", value: get("start") },
    { label: "Duration", value: get("duration") },
    { label: "Warranties", value: get("warranties") },
  ];

  return (
    <>
      <div className="flex items-start justify-between gap-6">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="s3 text-text-tertiary">Sent · due {due}</span>
          <h2 id="offer-h" className="h6 text-text-primary">Your indicative offer is in</h2>
          <p className="p6 text-text-secondary">
            You can edit it until {due}; CQuel is told when you change it. After the deadline, CQuel tells you if you&apos;re on the shortlist.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button type="tertiary">View your quote</Button>
          <Button type="secondary" onClick={offer.edit}>
            Edit your offer
          </Button>
        </div>
      </div>
      <ChipTrack steps={steps(t, "sent")} />
      <div className="grid grid-cols-5 gap-3">
        {cells.map((c) => (
          <div key={c.label} className="flex flex-col gap-1 rounded-md border border-border-dark bg-bg-container-grey px-3.5 py-3">
            <span className="p7 text-text-tertiary">{c.label}</span>
            <span className="h8 text-text-primary">{c.value}</span>
            {c.note && <span className="p7 text-text-secondary">{c.note}</span>}
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-1 pt-1">
        <h3 className="h7 text-text-primary">How your offer reads to the customer</h3>
        <p className="p7 text-text-secondary">Against what they asked for, not against other suppliers</p>
      </div>
      <div>
        {reads.map((r) => (
          <div key={r.title} className="grid grid-cols-[20px_minmax(0,1fr)_auto] items-center gap-x-4 border-b border-border-light py-3">
            <StateMark state={r.ok ? "done" : "open"} size={20} />
            <div className="min-w-0">
              <p className="h8 text-text-primary">{r.title}</p>
              <p className="p7 text-text-secondary">{r.text}</p>
            </div>
            {!r.ok && t.quote.gaps.some((g) => g.title === r.title) ? (
              <Button type="tertiary" onClick={() => document.getElementById("c-job")?.scrollIntoView({ behavior: "smooth", block: "start" })}>
                See in the brief
              </Button>
            ) : (
              <span />
            )}
          </div>
        ))}
      </div>
    </>
  );
}

export function OfferPanel({ t, offer, cardRef }: { t: Tender; offer: Offer; cardRef: React.Ref<HTMLElement> }) {
  const { phase } = offer;
  return (
    <section
      ref={cardRef}
      aria-labelledby="offer-h"
      className={cn(
        "flex flex-col gap-4 rounded-lg border border-border-dark bg-bg-container px-6 py-5",
        phase !== "sent" && "border-t-4 border-t-brand-6",
      )}
    >
      <input
        ref={offer.inputRef}
        type="file"
        accept=".pdf,.xls,.xlsx,.csv"
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) offer.onFile(f.name);
          e.target.value = "";
        }}
      />

      {phase === "start" && (
        <>
          <div className="flex items-start justify-between gap-6">
            <Header t={t} title={t.offer.title} text={t.offer.text} />
            <div className="flex shrink-0 flex-col items-end gap-2">
              <Button type="primary" size="large" icon="upload" onClick={offer.pick}>
                Upload your quote
              </Button>
              <p className="p6 text-text-secondary">
                Not bidding? <Button type="link">Decline this tender</Button>
              </p>
            </div>
          </div>
          <ChipTrack steps={steps(t, "start")} />
        </>
      )}

      {phase === "reading" && (
        <>
          <Header t={t} title={offer.resend ? "Edit your offer" : t.offer.title} />
          <ChipTrack steps={steps(t, "reading")} />
          <FileRow
            name={offer.fileName}
            meta={t.quote.fileMeta}
            reading
            action={
              <Button type="tertiary" onClick={offer.cancelReading}>
                Cancel
              </Button>
            }
          />
        </>
      )}

      {phase === "check" && (
        <>
          <Header
            t={t}
            title={offer.resend ? "Edit your offer" : "Check what we read"}
            text="This is what the customer sees. Edit anything we got wrong."
          />
          <ChipTrack steps={steps(t, "check")} />
          <FileRow
            name={offer.fileName}
            meta={t.quote.fileMeta}
            action={
              <Button type="tertiary" onClick={offer.pick}>
                Replace
              </Button>
            }
          />
          <div>
            {offer.rows.map((r) => (
              <CheckRow key={`${offer.fileName}-${r.key}`} t={t} offer={offer} r={r} />
            ))}
          </div>
          <div className="flex items-center justify-end gap-3">
            <p className="p7 text-text-secondary" role="status">
              {offer.openCount > 0
                ? `${offer.openCount} to fill in before you send`
                : offer.resend
                  ? "CQuel is told when you send changes"
                  : "Ready to send"}
            </p>
            {offer.resend && (
              <Button type="secondary" onClick={offer.cancelEdit}>
                Cancel
              </Button>
            )}
            <Button type="primary" disabled={offer.openCount > 0} onClick={offer.send}>
              {offer.resend ? "Send changes" : "Send your offer"}
            </Button>
          </div>
        </>
      )}

      {phase === "sent" && <Sent t={t} offer={offer} />}
    </section>
  );
}

/** An InfoCell with an ink border: what the supplier said, in the chapters after sending. */
export function YouSaid({ label = "You said", value, note, children }: { label?: string; value: string; note?: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 rounded-md border border-black-7 bg-white px-3.5 py-3">
      <span className="p7 text-text-tertiary">{label}</span>
      <span className="h8 text-text-primary">{value}</span>
      {note && <span className="p7 text-text-secondary">{note}</span>}
      {children}
    </div>
  );
}
