"use client";

/*
 * Supplier concept · the indicative offer, C4 + C5 boards (18 Nov), checked against David's v7:
 * upload your files → we read them → check what we read (with flags) → questions on your quote
 * (red items only) → send → what the customer compares, your answers, continuity.
 * Everything happens inside the offer card on the Overview.
 * Decided 18 Nov: an edit after sending notifies CQuel; a supplier can send with a red question
 * unanswered (we use what we read; to check with Ops). Who sets the expected ranges: to confirm.
 */

import { type ReactNode, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { QuoteQuestion, SupplierTender as Tender } from "@/lib/concept/supplier";
import { Button, ChipTrack, Icon, IconButton, ResponsibilityPill, focusRing } from "./ui";
import { RequirementGroup, StateMark } from "./ops-asset/opsUi";

export type OfferPhase = "start" | "reading" | "check" | "sent";
type Unit = "days" | "weeks";

interface Answer {
  /** text questions: the answer; yesno: the months for Yes. */
  text: string;
  choice?: "Yes" | "No" | "Not sure yet";
  /** "Something in our reading is wrong?" */
  wrong?: string;
}

export interface Offer {
  phase: OfferPhase;
  files: string[];
  price: string;
  start: string;
  unit: Unit | null;
  warranties: { panels: number; inverters: number; workmanship: number };
  sites: number[];
  answers: Record<string, Answer | undefined>;
  resend: boolean;
  /** The offer window (C8 · B3) is open. */
  open: boolean;
  setOpen: (v: boolean) => void;
  /** Opens the window and the file picker. */
  begin: () => void;
  /** The row or question you're on: the right column shows "About this in the brief". */
  focus: string | null;
  setFocus: (k: string | null) => void;
  /** Check rows still open (block sending). */
  openCount: number;
  /** Red questions not answered (don't block sending). */
  unanswered: number;
  inputRef: React.RefObject<HTMLInputElement | null>;
  pick: () => void;
  onFiles: (names: string[]) => void;
  removeFile: (name: string) => void;
  cancelReading: () => void;
  send: () => void;
  edit: () => void;
  cancelEdit: () => void;
  setPrice: (v: string) => void;
  setStart: (v: string) => void;
  setUnit: (u: Unit) => void;
  setWarranties: (w: { panels: number; inverters: number; workmanship: number }) => void;
  setSites: (ns: number[]) => void;
  answer: (key: string, a: Answer | undefined) => void;
}

const inputClass =
  "h-10 rounded-md border border-border-dark bg-white px-3 p6 font-sans text-text-primary outline-none placeholder:text-text-tertiary focus:border-black-7 focus:shadow-[inset_0_0_0_1px_var(--black-7)]";

export function useOffer(t: Tender): Offer {
  const q = t.quote;
  const [phase, setPhase] = useState<OfferPhase>("start");
  const [files, setFiles] = useState<string[]>([]);
  const [price, setPrice] = useState(q.price.value);
  const [start, setStart] = useState(q.start.value);
  const [unit, setUnit] = useState<Unit | null>(null);
  const [warranties, setWarranties] = useState({ panels: q.warranties.panels, inverters: q.warranties.inverters, workmanship: q.warranties.workmanship });
  const [sites, setSites] = useState<number[]>(() => t.sites.map((s) => s.n));
  const [answers, setAnswers] = useState<Record<string, Answer | undefined>>({});
  const [resend, setResend] = useState(false);
  const [open, setOpen] = useState(false);
  const [focus, setFocus] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const unanswered = q.questions.filter((x) => !answers[x.key]).length;

  return {
    phase,
    files,
    price,
    start,
    unit,
    warranties,
    sites,
    answers,
    resend,
    open,
    setOpen,
    begin: () => {
      setOpen(true);
      window.setTimeout(() => inputRef.current?.click(), 60);
    },
    focus,
    setFocus,
    openCount: unit ? 0 : 1,
    unanswered,
    inputRef,
    pick: () => inputRef.current?.click(),
    onFiles: (names) => {
      setFiles((cur) => [...cur, ...names.filter((n) => !cur.includes(n))]);
      setPhase("reading");
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setPhase("check"), 1800);
    },
    removeFile: (name) => setFiles((cur) => cur.filter((n) => n !== name)),
    cancelReading: () => {
      window.clearTimeout(timer.current);
      setPhase(resend ? "sent" : files.length > 1 ? "check" : "start");
    },
    send: () => {
      setPhase("sent");
      setResend(false);
      setOpen(false);
      setFocus(null);
      window.scrollTo({ top: 0 });
    },
    edit: () => {
      setResend(true);
      setPhase("check");
      setOpen(true);
    },
    cancelEdit: () => {
      setResend(false);
      setPhase("sent");
      setOpen(false);
    },
    setPrice,
    setStart,
    setUnit,
    setWarranties,
    setSites,
    answer: (key, a) => setAnswers((cur) => ({ ...cur, [key]: a })),
  };
}

/* ------------------------------------------------------------- helpers */

export function sitesLine(t: Tender, ns: number[]) {
  const left = t.sites.filter((s) => !ns.includes(s.n));
  const base = `${ns.length} of ${t.sites.length}`;
  return left.length ? `${base} · not covered: ${left.map((s) => s.name).join(", ")}` : base;
}
const sitesCount = (t: Tender, ns: number[]) => `${ns.length} of ${t.sites.length}`;

function money(v: string) {
  const n = Number(v.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}
const gbp = (n: number) => `£${Math.round(n).toLocaleString("en-GB")}`;

function durationLine(t: Tender, unit: Unit | null) {
  const q = t.quote;
  return unit
    ? `Lead ${q.lead} · installation ${q.installation} ${unit} · commissioning ${q.commissioning} ${unit}`
    : `Lead ${q.lead} · installation ${q.installation} · commissioning ${q.commissioning}`;
}
function warrantyLine(w: Offer["warranties"]) {
  return `Panels ${w.panels} years · inverters ${w.inverters} years · workmanship ${w.workmanship} years`;
}
function warrantyFlags(t: Tender, w: Offer["warranties"]) {
  const e = t.quote.expected;
  const f: string[] = [];
  if (w.panels < e.panels) f.push(`Panels: expected at least ${e.panels} years`);
  if (w.workmanship < e.workmanship) f.push(`Workmanship: expected at least ${e.workmanship} years`);
  return f;
}
/** Start after answers: the off-peak months replace the preferred start. */
function startAfter(offer: Offer) {
  const a = offer.answers.offpeak;
  if (a?.choice === "Yes" && a.text) return a.text.split(/\s+to\s+|[-–]/)[0].trim();
  return offer.start;
}

/** What the customer sees, one line each. Used for "You said". */
export function saidJob(t: Tender, offer: Offer) {
  return `${sitesCount(t, offer.sites)} sites · start ${startAfter(offer)} · installation ${t.quote.installation} ${offer.unit ?? ""}`.trim();
}
export function saidPrice(offer: Offer) {
  const w = offer.warranties;
  return `${offer.price} excl. VAT · panels ${w.panels} years, workmanship ${w.workmanship} years`;
}

function answerLine(q: QuoteQuestion, a: Answer | undefined) {
  if (!a) return "";
  if (q.kind === "yesno") return [a.choice, a.choice === "Yes" ? a.text : ""].filter(Boolean).join(", ");
  return a.text;
}

/* --------------------------------------------------------------- pieces */

export function Flag({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-1 flex items-center gap-1.5 p7 text-status-warning-text">
      <Icon name="alert" size={14} className="shrink-0" />
      {children}
    </p>
  );
}

function Seg<T extends string>({ options, value, onChange, label }: { options: T[]; value: T | null | undefined; onChange: (v: T) => void; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex self-start overflow-hidden rounded-md border border-border-dark">
      {options.map((o, i) => (
        <button
          key={o}
          type="button"
          role="radio"
          aria-checked={value === o}
          onClick={() => onChange(o)}
          className={cn(
            "h-9 px-3.5 p6 first-letter:uppercase",
            i > 0 && "border-l border-border-dark",
            value === o ? "bg-black-7 h8 text-white" : "bg-white text-text-primary hover:bg-black-2",
            focusRing,
          )}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

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

function Files({ t, offer, reading }: { t: Tender; offer: Offer; reading?: boolean }) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between gap-3 rounded-md border-[1.5px] border-dashed border-black-3 bg-black-2 py-3 pl-4 pr-3">
        <div className="flex items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-md border border-border-dark bg-white">
            <Icon name="upload" size={20} className="text-icon-dark" />
          </span>
          <div>
            <p className="h8 text-text-primary">Drop your quote and anything that goes with it</p>
            <p className="p7 text-text-secondary">Quote, price breakdown, drawings, datasheets. PDF, Word or Excel.</p>
          </div>
        </div>
        <Button type="secondary" icon="upload" onClick={offer.pick}>
          Upload files
        </Button>
      </div>
      {offer.files.map((name, i) => {
        const f = t.quote.files[i];
        return (
          <div key={name} className="grid grid-cols-[36px_minmax(0,1fr)_auto] items-center gap-3 border-b border-border-light py-2.5">
            <span className="flex size-9 items-center justify-center rounded-md border border-border-dark bg-white">
              <Icon name="document" size={16} className="text-icon-default" />
            </span>
            <div className="min-w-0">
              <p className="flex min-w-0 items-center gap-2 h8 text-text-primary">
                <span className="truncate">{name}</span>
                {!reading && f && (
                  <span className="inline-flex h-5 shrink-0 items-center rounded-full border border-border-dark bg-black-1 px-1.5 h9 text-text-secondary">{f.kind}</span>
                )}
              </p>
              <p className="p7 text-text-secondary">{reading ? "Reading…" : f ? f.meta : "Read · nothing for this tender found in it"}</p>
              {reading && (
                <div className="mt-1.5 h-1 w-60 overflow-hidden rounded-full bg-black-2" role="progressbar" aria-label={`Reading ${name}`}>
                  <div className="h-full w-full origin-left animate-[offerread_1.8s_ease-out_forwards] rounded-full bg-black-7" />
                </div>
              )}
            </div>
            {reading ? (
              <span />
            ) : (
              <Button type="tertiary" onClick={() => offer.removeFile(name)} ariaLabel={`Remove ${name}`}>
                Remove
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ----------------------------------------------------------- check rows */

function Row({
  k,
  offer,
  name,
  done,
  line,
  flags,
  action,
  children,
}: {
  k: string;
  offer: Offer;
  name: string;
  done: boolean;
  line: string;
  flags?: string[];
  action?: React.ReactNode;
  children?: React.ReactNode;
}) {
  const on = offer.focus === k;
  return (
    <div
      onClick={() => offer.setFocus(k)}
      onFocusCapture={() => offer.setFocus(k)}
      className={cn(
        "-mx-3 grid grid-cols-[20px_minmax(0,1fr)_auto] items-start gap-x-4 rounded-md border-b border-border-light px-3 py-3.5",
        on && "bg-black-1",
      )}
    >
      <span className="mt-0.5">
        <StateMark state={done ? "done" : "open"} size={20} />
      </span>
      <div className="min-w-0">
        <p className="h8 text-text-primary">{name}</p>
        <p className="p7 text-text-secondary">{line}</p>
        {flags && flags.length > 0 && <Flag>{flags.join(" · ")}</Flag>}
      </div>
      {action ?? <span />}
      {children && <div className="col-start-2 col-end-4 mt-3">{children}</div>}
    </div>
  );
}

function EditBox({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap items-center gap-2 rounded-md border border-border-dark bg-black-1 px-4 py-3">{children}</div>;
}

function TextEdit({ initial, label, onSave, onCancel }: { initial: string; label: string; onSave: (v: string) => void; onCancel: () => void }) {
  const [v, setV] = useState(initial);
  return (
    <EditBox>
      <input className={cn(inputClass, "w-[320px]")} value={v} aria-label={label} onChange={(e) => setV(e.target.value)} />
      <Button type="primary" disabled={!v.trim()} onClick={() => onSave(v.trim())}>
        Save
      </Button>
      <Button type="secondary" onClick={onCancel}>
        Cancel
      </Button>
    </EditBox>
  );
}

function WarrantyEdit({ offer, onDone }: { offer: Offer; onDone: () => void }) {
  const [w, setW] = useState(offer.warranties);
  const field = (k: keyof Offer["warranties"], label: string) => (
    <label className="flex items-center gap-2 p6 text-text-secondary">
      {label}
      <span className="relative inline-block w-[110px]">
        <input
          className={cn(inputClass, "w-full pr-14")}
          inputMode="numeric"
          value={w[k]}
          aria-label={`${label} warranty in years`}
          onChange={(e) => setW({ ...w, [k]: Number(e.target.value.replace(/\D/g, "")) || 0 })}
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 p6 text-text-tertiary">years</span>
      </span>
    </label>
  );
  return (
    <EditBox>
      {field("panels", "Panels")}
      {field("inverters", "Inverters")}
      {field("workmanship", "Workmanship")}
      <Button
        type="primary"
        onClick={() => {
          offer.setWarranties(w);
          onDone();
        }}
      >
        Save
      </Button>
      <Button type="secondary" onClick={onDone}>
        Cancel
      </Button>
    </EditBox>
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
      {all > 10 && <input className={cn(inputClass, "w-full")} placeholder="Search sites" aria-label="Search sites" value={q} onChange={(e) => setQ(e.target.value)} />}
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

function CheckRows({ t, offer }: { t: Tender; offer: Offer }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [unit, setUnit] = useState<Unit | null>(offer.unit);
  const q = t.quote;
  const edit = (key: string) => (
    <Button type="tertiary" icon="edit" onClick={() => setEditing(key)} ariaLabel={`Edit ${key}`}>
      Edit
    </Button>
  );
  const close = () => setEditing(null);
  return (
    <div>
      <Row k="price" offer={offer} name="Total price" done line={`${offer.price} excl. VAT · ${q.price.source}`} action={editing !== "price" && edit("price")}>
        {editing === "price" && <TextEdit initial={offer.price} label="Total price" onSave={(v) => { offer.setPrice(v); close(); }} onCancel={close} />}
      </Row>
      <Row k="sites" offer={offer} name="Sites covered" done line={`${sitesLine(t, offer.sites)} · ${q.sitesSource}`} action={editing !== "sites" && edit("sites")}>
        {editing === "sites" && <SitesEdit t={t} offer={offer} onDone={close} />}
      </Row>
      <Row k="start" offer={offer} name="Start" done line={`${offer.start} (your preferred start) · ${q.start.source}`} action={editing !== "start" && edit("start")}>
        {editing === "start" && <TextEdit initial={offer.start} label="Start" onSave={(v) => { offer.setStart(v); close(); }} onCancel={close} />}
      </Row>
      {offer.unit && editing !== "duration" ? (
        <Row k="duration" offer={offer} name="Duration" done line={`${durationLine(t, offer.unit)} · ${q.durationSource}`} action={edit("duration")} />
      ) : (
        <Row k="duration" offer={offer} name="Duration" done={false} line={`${durationLine(t, null)} · ${q.durationSource}`} flags={offer.unit ? undefined : ["No unit given for installation and commissioning: days or weeks?"]}>
          <div className="flex items-center gap-2">
            <Seg label="Unit for installation and commissioning" options={["days", "weeks"] as Unit[]} value={unit} onChange={setUnit} />
            <Button
              type="secondary"
              disabled={!unit}
              onClick={() => {
                if (unit) offer.setUnit(unit);
                close();
              }}
            >
              Save
            </Button>
            {offer.unit && (
              <Button type="secondary" onClick={close}>
                Cancel
              </Button>
            )}
          </div>
        </Row>
      )}
      <Row
        k="warranties"
        offer={offer}
        name="Warranties"
        done
        line={`${warrantyLine(offer.warranties)} · ${q.warranties.source}`}
        flags={warrantyFlags(t, offer.warranties)}
        action={editing !== "warranties" && edit("warranties")}
      >
        {editing === "warranties" && <WarrantyEdit offer={offer} onDone={close} />}
      </Row>
    </div>
  );
}

/* ------------------------------------------------------------ questions */

function QuestionRow({ q, offer }: { q: QuoteQuestion; offer: Offer }) {
  const saved = offer.answers[q.key];
  const [open, setOpen] = useState(!saved);
  const [text, setText] = useState(saved?.text ?? "");
  const [choice, setChoice] = useState<Answer["choice"]>(saved?.choice);
  const [wrongOpen, setWrongOpen] = useState(false);
  const [wrong, setWrong] = useState(saved?.wrong ?? "");
  const ready = q.kind === "text" ? text.trim().length > 0 : !!choice && (choice !== "Yes" || text.trim().length > 0);

  const on = offer.focus === q.key;
  const focusProps = { onClick: () => offer.setFocus(q.key), onFocusCapture: () => offer.setFocus(q.key) };
  if (saved && !open) {
    return (
      <div {...focusProps} className={cn("-mx-3 grid grid-cols-[20px_minmax(0,1fr)_auto] items-center gap-x-4 rounded-md border-b border-border-light px-3 py-3.5", on && "bg-black-1")}>
        <StateMark state="done" size={20} />
        <div className="min-w-0">
          <p className="h8 text-text-primary">{q.title}</p>
          <p className="p7 text-text-secondary">
            Answered: {answerLine(q, saved)}
            {saved.wrong ? " · you told us our reading was wrong" : ""}
          </p>
        </div>
        <Button type="tertiary" icon="edit" onClick={() => setOpen(true)}>
          Edit
        </Button>
      </div>
    );
  }

  return (
    <div {...focusProps} className={cn("-mx-3 grid grid-cols-[20px_minmax(0,1fr)] gap-x-4 rounded-md border-b border-border-light px-3 py-4", on && "bg-black-1")}>
      <span className="mt-0.5">
        <StateMark state="open" size={20} />
      </span>
      <div className="flex min-w-0 flex-col gap-2.5">
        <div>
          <p className="h8 text-text-primary">{q.title}</p>
          <p className="p7 text-text-secondary">{q.asks}</p>
        </div>
        <div className="flex flex-col gap-1 rounded-md border border-border-dark bg-bg-container-grey px-3.5 py-2.5">
          <span className="p7 text-text-tertiary">What we read</span>
          <span className="p6 text-text-primary">{q.read}</span>
          <span className="p7 text-text-secondary">
            &ldquo;{q.quote}&rdquo; · <Button type="link" className="p7">{`${q.source} ↗`}</Button>
          </span>
        </div>
        <p className="h8 text-text-primary">{q.question}</p>
        {q.kind === "text" ? (
          <textarea
            className="min-h-[72px] w-full resize-y rounded-md border border-border-dark px-3 py-2 p6 font-sans text-text-primary outline-none placeholder:text-text-tertiary focus:border-black-7 focus:shadow-[inset_0_0_0_1px_var(--black-7)]"
            placeholder="Your answer"
            aria-label={q.question}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        ) : (
          <>
            <Seg label={q.question} options={["Yes", "No", "Not sure yet"] as NonNullable<Answer["choice"]>[]} value={choice} onChange={setChoice} />
            {choice === "Yes" && q.followUp && (
              <label className="flex items-center gap-3 p6 text-text-secondary">
                {q.followUp}
                <input className={cn(inputClass, "w-[220px]")} placeholder="For example: Nov to Feb" value={text} onChange={(e) => setText(e.target.value)} />
              </label>
            )}
            {choice === "Not sure yet" && <p className="p7 text-text-secondary">The customer sees that this is settled at the site visit.</p>}
          </>
        )}
        {wrongOpen && (
          <textarea
            className="min-h-[56px] w-full resize-y rounded-md border border-border-dark px-3 py-2 p6 font-sans text-text-primary outline-none placeholder:text-text-tertiary focus:border-black-7 focus:shadow-[inset_0_0_0_1px_var(--black-7)]"
            placeholder="What did we get wrong?"
            aria-label="What did we get wrong?"
            value={wrong}
            onChange={(e) => setWrong(e.target.value)}
          />
        )}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="secondary"
            disabled={!ready && !wrong.trim()}
            onClick={() => {
              offer.answer(q.key, { text: text.trim(), choice, wrong: wrong.trim() || undefined });
              setOpen(false);
            }}
          >
            Save answer
          </Button>
          {q.kind === "text" && (
            <Button type="tertiary" icon="upload" onClick={offer.pick}>
              Attach a file
            </Button>
          )}
          {saved && (
            <Button type="tertiary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          )}
          <span className="flex-1" />
          {!wrongOpen && (
            <Button type="link" className="p7" onClick={() => setWrongOpen(true)}>
              Something in our reading is wrong?
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function Questions({ t, offer }: { t: Tender; offer: Offer }) {
  const n = offer.unanswered;
  return (
    <RequirementGroup label="Questions on your quote" count={n} countLabel={n ? `${n} to answer` : "All answered"} accentPill={n > 0}>
      {t.quote.questions.map((q) => (
        <QuestionRow key={q.key} q={q} offer={offer} />
      ))}
    </RequirementGroup>
  );
}

/* ----------------------------------------------------------------- card */

function Header({ t, title, text }: { t: Tender; title: string; text?: string }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1">
      <div className="flex items-center gap-2">
        <ResponsibilityPill owner="you" label="Your action" />
        <span className="s3 text-text-tertiary">Due {t.round.due.replace("due ", "")}</span>
      </div>
      <h2 id="offer-h" className="h6 text-text-primary">
        {title}
      </h2>
      {text && <p className="p6 text-text-secondary">{text}</p>}
    </div>
  );
}

function Cell({ label, value, note, was, flag }: { label: string; value: string; note?: string; was?: string; flag?: string }) {
  return (
    <div className={cn("flex flex-col gap-1 rounded-md border px-3.5 py-3", flag ? "border-status-warning-border bg-status-warning-bg" : "border-border-dark bg-bg-container-grey")}>
      <span className="p7 text-text-tertiary">{label}</span>
      <span className="h8 text-text-primary">{value}</span>
      {note && <span className="p7 text-text-secondary">{note}</span>}
      {was && <span className="p7 text-text-tertiary line-through">{was}</span>}
      {flag && (
        <span className="flex items-center gap-1.5 p7 text-status-warning-text">
          <Icon name="alert" size={14} className="shrink-0" />
          {flag}
        </span>
      )}
    </div>
  );
}

function Sent({ t, offer }: { t: Tender; offer: Offer }) {
  const q = t.quote;
  const due = t.round.due.replace("due ", "");
  const w = offer.warranties;
  const startNow = startAfter(offer);
  const u = offer.unit ?? "days";
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
          <Button type="tertiary">View your files</Button>
          <Button type="secondary" onClick={offer.edit}>
            Edit your offer
          </Button>
        </div>
      </div>
      <ChipTrack steps={steps(t, "sent")} />

      <div className="flex flex-col gap-1">
        <h3 className="h7 text-text-primary">What the customer compares</h3>
        <p className="p7 text-text-secondary">Your figures after your answers. Flags show what&apos;s outside the range the customer expects.</p>
      </div>
      <div className="flex flex-col gap-2">
        <span className="s3 text-text-tertiary">Price</span>
        <div className="grid grid-cols-4 gap-3">
          <Cell label="Total price" value={offer.price} note="excl. VAT" />
          <Cell label="Price per kWp" value={gbp(money(offer.price) / q.kwp)} note={`worked out from ${q.kwp} kWp`} />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <span className="s3 text-text-tertiary">Speed</span>
        <div className="grid grid-cols-4 gap-3">
          <Cell label="Start" value={startNow} was={startNow !== offer.start ? offer.start : undefined} />
          <Cell label="Lead time" value={q.lead} />
          <Cell label="Installation" value={`${q.installation} ${u}`} />
          <Cell label="Commissioning" value={`${q.commissioning} ${u}`} />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <span className="s3 text-text-tertiary">Quality</span>
        <div className="grid grid-cols-4 gap-3">
          <Cell label="Panel warranty" value={`${w.panels} years`} flag={w.panels < q.expected.panels ? `Expected at least ${q.expected.panels}` : undefined} />
          <Cell label="Workmanship warranty" value={`${w.workmanship} years`} flag={w.workmanship < q.expected.workmanship ? `Expected at least ${q.expected.workmanship}` : undefined} />
          <Cell label="Inverter warranty" value={`${w.inverters} years`} />
          <Cell label="PI insurance" value={q.piInsurance} />
        </div>
      </div>

      <RequirementGroup
        label="Your answers"
        count={q.questions.length}
        countLabel={`${q.questions.length - offer.unanswered} of ${q.questions.length}`}
      >
        {q.questions.map((qq) => {
          const a = offer.answers[qq.key];
          return (
            <div key={qq.key} className="grid grid-cols-[20px_minmax(0,1fr)_auto] items-center gap-x-4 py-3">
              <StateMark state={a ? "done" : "open"} size={20} />
              <div className="min-w-0">
                <p className="h8 text-text-primary">{qq.title}</p>
                <p className="p7 text-text-secondary">{a ? answerLine(qq, a) : "Not answered: the customer sees what we read"}</p>
              </div>
              {a ? <span /> : <Button type="tertiary" onClick={offer.edit}>Answer now</Button>}
            </div>
          );
        })}
      </RequirementGroup>
    </>
  );
}

function FileInput({ offer }: { offer: Offer }) {
  return (
    <input
      ref={offer.inputRef}
      type="file"
      multiple
      accept=".pdf,.doc,.docx,.xls,.xlsx,.csv"
      className="sr-only"
      tabIndex={-1}
      aria-hidden
      onChange={(e) => {
        const names = Array.from(e.target.files ?? []).map((f) => f.name);
        if (names.length) offer.onFiles(names);
        e.target.value = "";
      }}
    />
  );
}

function statusLine(offer: Offer) {
  if (offer.phase === "start") return "Upload your files to start";
  if (offer.phase === "reading") return "Reading your files";
  if (offer.openCount > 0) return `${offer.openCount} to fill in before you send`;
  if (offer.unanswered > 0) return `${offer.unanswered} ${offer.unanswered === 1 ? "question" : "questions"} not answered: we use what we read`;
  return offer.resend ? "CQuel is told when you send changes" : "Ready to send";
}

/** The offer card on the Overview: start, in progress (window closed), sent. */
export function OfferPanel({ t, offer, cardRef }: { t: Tender; offer: Offer; cardRef: React.Ref<HTMLElement> }) {
  const { phase } = offer;
  const inProgress = phase === "reading" || phase === "check";
  return (
    <section
      ref={cardRef}
      aria-labelledby="offer-h"
      className={cn("flex flex-col gap-4 rounded-lg border border-border-dark bg-bg-container px-6 py-5", phase !== "sent" && "border-t-4 border-t-brand-6")}
    >
      <FileInput offer={offer} />

      {phase === "start" && (
        <>
          <div className="flex items-start justify-between gap-6">
            <Header t={t} title={t.offer.title} text={t.offer.text} />
            <div className="flex shrink-0 flex-col items-end gap-2">
              <Button type="primary" size="large" icon="upload" onClick={offer.begin}>
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

      {inProgress && (
        <>
          <div className="flex items-start justify-between gap-6">
            <Header t={t} title={offer.resend ? "Edit your offer" : "Finish your indicative offer"} text={`${offer.files.length} ${offer.files.length === 1 ? "file" : "files"} · ${statusLine(offer)}`} />
            <div className="flex shrink-0 flex-col items-end gap-2">
              <Button type="primary" size="large" onClick={() => offer.setOpen(true)}>
                Continue your offer
              </Button>
              <p className="p6 text-text-secondary">
                Not bidding? <Button type="link">Decline this tender</Button>
              </p>
            </div>
          </div>
          <ChipTrack steps={steps(t, "check")} />
        </>
      )}

      {phase === "sent" && <Sent t={t} offer={offer} />}
    </section>
  );
}

function AboutCard({ t, k }: { t: Tender; k: string }) {
  const a = t.quote.about[k];
  if (!a) return null;
  return (
    <section aria-live="polite" className="flex flex-col gap-1.5 rounded-md border border-status-info-border bg-status-info-bg px-4 py-3">
      <span className="p7 text-text-tertiary">About {a.title.toLowerCase()} in the brief</span>
      <p className="p6 text-text-primary">&ldquo;{a.quote}&rdquo;</p>
      <p className="p7 text-text-secondary">{a.source}</p>
      {a.note && <p className="p7 text-text-secondary">{a.note}</p>}
    </section>
  );
}

/**
 * The offer window (C8 · B3): the offer on the left, one scroll; on the right (400, grey, fixed)
 * "About this in the brief" for the row you're on, Find it in this tender, the brief in short.
 */
export function OfferWindow({
  t,
  offer,
  find,
  onFullBrief,
}: {
  t: Tender;
  offer: Offer;
  find: ReactNode;
  onFullBrief: () => void;
}) {
  const { phase, open } = offer;
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && offer.setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, offer]);
  if (!open || phase === "sent") return null;
  const due = t.round.due.replace("due ", "");
  const facts = [
    ...t.jobFacts.filter((f) => ["Sites", "Size", "Installation"].includes(f.label)),
    ...t.facts.filter((f) => f.label === "Budget"),
  ];

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="offer-w-h" className="fixed inset-0 z-50 flex flex-col bg-white">
      <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border-dark px-6">
        <IconButton icon="cross" label="Close" onClick={() => offer.setOpen(false)} />
        <div className="min-w-0">
          <h2 id="offer-w-h" className="h7 text-text-primary">{offer.resend ? "Edit your offer" : "Your indicative offer"}</h2>
          <p className="truncate p7 text-text-secondary">
            {t.title} · due {due}
          </p>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <main className="min-w-0 flex-1 overflow-y-auto">
          <div className="mx-auto flex max-w-[860px] flex-col gap-5 px-8 pb-12 pt-6">
            <ChipTrack steps={steps(t, phase)} />
            {phase === "check" && <p className="p6 text-text-secondary">This is what the customer sees. Edit anything we got wrong.</p>}
            <section className="flex flex-col gap-2">
              <h3 className="s3 text-text-tertiary">Your files{offer.files.length ? ` · ${offer.files.length}` : ""}</h3>
              <Files t={t} offer={offer} reading={phase === "reading"} />
            </section>
            {phase === "check" && (
              <>
                <section className="flex flex-col gap-1">
                  <h3 className="s3 text-text-tertiary">What we read</h3>
                  <CheckRows t={t} offer={offer} />
                </section>
                <section className="flex flex-col gap-1.5">
                  <p className="h8 text-text-primary">
                    Also in your offer <span className="p7 font-normal text-text-tertiary">· not asked for in the brief</span>
                  </p>
                  <ul className="list-disc pl-5 p6 text-text-secondary">
                    {t.quote.alsoInOffer.map((x) => (
                      <li key={x}>{x}</li>
                    ))}
                  </ul>
                </section>
                <Questions t={t} offer={offer} />
              </>
            )}
            {phase === "reading" && (
              <div className="flex justify-end">
                <Button type="tertiary" onClick={offer.cancelReading}>
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </main>

        <aside aria-label="The brief" className="flex w-[400px] shrink-0 flex-col gap-5 overflow-y-auto border-l border-border-dark bg-bg-container-grey px-6 pb-8 pt-5">
          {offer.focus && <AboutCard t={t} k={offer.focus} />}
          {find}
          <section className="flex flex-col gap-3">
            <h3 className="s3 text-text-tertiary">The brief</h3>
            <dl className="border-t border-border-light">
              {facts.map((f) => (
                <div key={f.label} className="flex items-baseline justify-between gap-4 border-b border-border-light py-2">
                  <dt className="p6 text-text-secondary">{f.label}</dt>
                  <dd className="text-right h8 text-text-primary">
                    {f.estimate && <span className="text-text-tertiary" title="Estimate">~</span>}
                    {f.value}
                  </dd>
                </div>
              ))}
            </dl>
            <div className="flex flex-col gap-1">
              <span className="h9 text-text-secondary">The brief asks for</span>
              <ul className="list-disc pl-5 p7 text-text-primary">
                {t.quote.briefAsks.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-1">
              <span className="h9 text-text-secondary">Not known yet</span>
              <p className="p7 text-text-primary">{t.openCells.map((c) => c.value).join(" · ")}</p>
            </div>
            <Button type="link" className="self-start p7" onClick={onFullBrief}>
              Full brief
            </Button>
          </section>
        </aside>
      </div>

      <footer className="flex h-[72px] shrink-0 items-center justify-end gap-3 border-t border-border-dark px-6">
        <p className="p7 text-text-secondary" role="status">
          {statusLine(offer)}
        </p>
        {offer.resend ? (
          <Button type="secondary" size="large" onClick={offer.cancelEdit}>
            Cancel
          </Button>
        ) : (
          <Button type="secondary" size="large" onClick={() => offer.setOpen(false)}>
            Save and close
          </Button>
        )}
        <Button type="primary" size="large" disabled={phase !== "check" || offer.openCount > 0} onClick={offer.send}>
          {offer.resend ? "Send changes" : "Send your offer"}
        </Button>
      </footer>
    </div>
  );
}

/**
 * An InfoCell on the info blue: what the supplier said, in the chapters after sending.
 * One icon for both labels: cite (16), in line with the label.
 */
export function YouSaid({ label = "You said", value, note, children }: { label?: string; value: string; note?: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 rounded-md border border-status-info-border bg-status-info-bg px-3.5 py-3">
      <Icon name="cite" size={16} className="shrink-0 text-status-info-text" />
      <div className="flex min-w-0 flex-col gap-1">
        <span className="p7 text-text-tertiary">{label}</span>
        <span className="h8 text-text-primary">{value}</span>
        {note && <span className="p7 text-text-secondary">{note}</span>}
        {children}
      </div>
    </div>
  );
}
