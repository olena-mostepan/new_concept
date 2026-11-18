"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import * as Tabs from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";
import type { FindEntry, SpecRow, SupplierTender as Tender } from "@/lib/concept/supplier";
import {
  Banner,
  Button,
  Card,
  ChipTrack,
  DocumentList,
  Dropdown,
  Icon,
  IconButton,
  ResponsibilityPill,
  focusRing,
  tabListClass,
  tabTriggerClass,
} from "./ui";

/* Supplier concept · one tender as an invited supplier sees it (C3 boards, 18 Nov). */

type TabId = "overview" | "sites" | "questions";
const TABS: Array<{ id: TabId; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "sites", label: "Sites & documents" },
  { id: "questions", label: "Questions" },
];

type Question = { text: string; about: string; sent: string };

function SupplierBar({ t }: { t: Tender }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border-dark bg-white">
      <div className="mx-auto flex h-16 w-full max-w-screen-2xl items-center justify-between px-8">
        <Link
          href="/concept/supplier"
          className={cn("group inline-flex items-center gap-1.5 h8 text-text-primary", focusRing)}
        >
          <Icon name="arrow-left" size={16} />
          <span className="group-hover:underline group-hover:underline-offset-[3px]">Tenders</span>
        </Link>
        <span
          aria-label="Account"
          className="inline-flex size-8 items-center justify-center rounded-full bg-black-7 h9 text-white"
        >
          {t.supplier.initials}
        </span>
      </div>
    </header>
  );
}

/* ---------------------------------------------------------------- parent */

function Rail({ t }: { t: Tender }) {
  return (
    <aside className="flex min-h-[calc(100vh-64px)] w-[400px] shrink-0 flex-col border-r border-border-dark bg-white">
      <div className="relative overflow-hidden border-b border-status-info-border bg-status-info-bg px-8 pb-5 pt-6">
        {t.icon3d && (
          <div
            aria-hidden
            className="absolute -right-5 -top-4 flex size-[150px] items-center justify-center rounded-full bg-white/55"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={t.icon3d} alt="" className="size-28 object-contain" />
          </div>
        )}
        <div className="relative flex flex-col gap-1 pt-14">
          <span className="s3 text-text-tertiary">Tender · {t.service}</span>
          <h1 className="h6 text-text-primary">{t.title}</h1>
          <p className="p7 text-text-secondary">For {t.customer}</p>
        </div>
      </div>
      <div className="flex flex-col gap-4 px-8 pb-14 pt-5">
        <Banner type="info" icon="info" title="Why you were invited" className="border-border-dark bg-bg-container-grey">
          {t.whyInvited}
        </Banner>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
          {t.facts.map((f) => (
            <div key={f.label} className="min-w-0">
              <dt className="p7 text-text-tertiary">{f.label}</dt>
              <dd className="mt-0.5 h8 text-text-primary">{f.value}</dd>
              {f.note && <dd className="mt-0.5 p7 text-text-secondary">{f.note}</dd>}
            </div>
          ))}
        </dl>
        <div className="flex flex-col gap-3 border-t border-border-light pt-4">
          <h2 className="s3 text-text-tertiary">How this tender runs</h2>
          <ol>
            {t.process.map((step, i) => (
              <li key={step.title} className="relative grid grid-cols-[12px_1fr] gap-3 pb-3.5 last:pb-0">
                {i < t.process.length - 1 && (
                  <span className="absolute left-[5px] top-4 -bottom-0.5 w-0.5 bg-border-dark" aria-hidden />
                )}
                <span
                  aria-hidden
                  className={cn(
                    "relative z-10 mt-1 size-3 rounded-full",
                    step.now ? "bg-brand-6 shadow-[0_0_0_3px_var(--bg-accent)]" : "border-2 border-black-4 bg-white",
                  )}
                />
                <div>
                  <p className={step.now ? "h8 text-text-primary" : "p6 text-text-primary"}>{step.title}</p>
                  <p className="p7 text-text-secondary">{step.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <section className="flex flex-col gap-2 rounded-lg border border-border-accent bg-status-warning-bg px-5 py-4">
          <h2 className="h7 text-text-primary">How CQuel is paid</h2>
          <p className="p6 text-text-secondary">{t.paid}</p>
          <div>
            <Button type="secondary" size="default">Read the Commission Form</Button>
          </div>
        </section>
      </div>
    </aside>
  );
}

/* ----------------------------------------------------------------- offer */

function OfferCard({ t, cardRef }: { t: Tender; cardRef: React.Ref<HTMLElement> }) {
  return (
    <section
      ref={cardRef}
      aria-labelledby="offer-h"
      className="flex flex-col gap-4 rounded-lg border border-border-dark border-t-4 border-t-brand-6 bg-bg-container px-6 py-5"
    >
      <div className="flex items-start justify-between gap-6">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-center gap-2">
            <ResponsibilityPill owner="you" label="Your action" />
            <span className="s3 text-text-tertiary">Due {t.round.due.replace("due ", "")}</span>
          </div>
          <h2 id="offer-h" className="h6 text-text-primary">{t.offer.title}</h2>
          <p className="p6 text-text-secondary">{t.offer.text}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <Button type="primary" size="large" icon="upload">Upload your quote</Button>
          <p className="p6 text-text-secondary">
            Not bidding? <Button type="link">Decline this tender</Button>
          </p>
        </div>
      </div>
      <ChipTrack
        steps={t.offerSteps.map((s, i) => ({
          key: s.key,
          lead: i === 0 ? "now" : "next",
          label: s.label,
          notes: [{ text: s.text, className: "mt-1 p7 text-text-secondary" }],
        }))}
      />
    </section>
  );
}

function StickyOffer({ t, show }: { t: Tender; show: boolean }) {
  return (
    <div
      aria-hidden={!show}
      className={cn(
        "fixed bottom-0 left-0 right-0 z-30 border-t border-border-dark bg-white shadow-[0_-8px_24px_rgba(30,40,50,0.08)] transition-transform duration-200",
        show ? "translate-y-0" : "pointer-events-none translate-y-full",
      )}
    >
      <div className="mx-auto flex h-[72px] w-full max-w-screen-2xl items-center justify-between gap-6 px-8">
        <div className="flex min-w-0 items-center gap-3">
          <ResponsibilityPill owner="you" label="Your action" />
          <div className="min-w-0">
            <p className="h8 text-text-primary">{t.offer.title}</p>
            <p className="p7 text-text-secondary">Due {t.round.due.replace("due ", "")} · not binding, you update it after the site visit</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-4">
          <Button type="link">Decline this tender</Button>
          <Button type="primary" size="large" icon="upload">Upload your quote</Button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ find */

function highlight(text: string, q: string) {
  if (!q) return text;
  const i = text.toLowerCase().indexOf(q.toLowerCase());
  if (i < 0) return text;
  return (
    <>
      {text.slice(0, i)}
      <mark className="rounded-sm bg-status-warning-bg px-px text-inherit">{text.slice(i, i + q.length)}</mark>
      {text.slice(i + q.length)}
    </>
  );
}

function Find({
  t,
  onTab,
  onAsk,
}: {
  t: Tender;
  onTab: (id: TabId) => void;
  onAsk: (q: Question) => void;
}) {
  const [q, setQ] = useState("");
  const [asking, setAsking] = useState(false);
  const [draft, setDraft] = useState("");
  const [sent, setSent] = useState<string | null>(null);
  const query = q.trim();
  const results = useMemo<FindEntry[]>(() => {
    if (query.length < 2) return [];
    const words = query.toLowerCase().split(/\s+/);
    return t.findIndex.filter((e) => words.every((w) => `${e.text} ${e.source}`.toLowerCase().includes(w)));
  }, [query, t.findIndex]);

  const field =
    "flex h-11 w-full items-center gap-2.5 rounded-md border border-border-dark bg-white px-3.5 hover:border-black-4 focus-within:border-black-7 focus-within:shadow-[inset_0_0_0_1px_var(--black-7)]";

  return (
    <section aria-labelledby="find-h" className="flex flex-col gap-3 rounded-lg border border-border-dark bg-bg-container px-5 pb-5 pt-4">
      <label id="find-h" htmlFor="find-q" className="h7 text-text-primary">Find it in this tender</label>
      <div className={field}>
        <Icon name="search" size={20} className="text-icon-default" />
        <input
          id="find-q"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setAsking(false);
            setSent(null);
          }}
          placeholder="Search the brief, files and answered questions"
          className="min-w-0 flex-1 bg-transparent p6 text-text-primary outline-none placeholder:text-text-tertiary"
        />
        {q && <IconButton icon="cross" size="small" label="Clear search" onClick={() => setQ("")} />}
      </div>

      {query.length < 2 && !sent && (
        <div className="flex flex-wrap gap-2">
          {t.findSuggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setQ(s)}
              className={cn("inline-flex h-8 items-center rounded-full border border-border-dark bg-white px-3 p6 text-text-primary hover:bg-black-2", focusRing)}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {query.length >= 2 && results.length > 0 && (
        <>
          <ul className="overflow-hidden rounded-md border border-border-dark">
            {results.map((r, i) => (
              <li key={r.text} className={cn(i > 0 && "border-t border-border-light")}>
                <button
                  type="button"
                  onClick={() => r.tab && onTab(r.tab)}
                  className={cn("grid w-full grid-cols-[16px_1fr_auto] items-start gap-2.5 px-3.5 py-3 text-left hover:bg-black-1", focusRing)}
                >
                  <Icon name={r.action === "download" ? "download" : "document"} size={16} className="mt-0.5 text-icon-default" />
                  <span>
                    <span className="block p6 text-text-primary">{highlight(r.text, query.split(/\s+/)[0])}</span>
                    <span className="block p7 text-text-secondary">{r.source}</span>
                  </span>
                  <span className="p7 text-text-tertiary">{r.action === "download" ? "Download" : "Open"}</span>
                </button>
              </li>
            ))}
          </ul>
          <p className="p7 text-text-secondary">
            {results.length} {results.length === 1 ? "result" : "results"} in this tender
          </p>
        </>
      )}

      {query.length >= 2 && results.length === 0 && !asking && (
        <div className="flex items-center justify-between gap-4 rounded-md border border-border-dark bg-bg-container-grey px-4 py-3.5">
          <div>
            <p className="h8 text-text-primary">Nothing about “{query}” in this tender</p>
            <p className="p6 text-text-secondary">Ask CQuel. The answer comes back to Questions and by email.</p>
          </div>
          <Button
            type="secondary"
            size="large"
            onClick={() => {
              setDraft(query);
              setAsking(true);
            }}
          >
            Ask CQuel
          </Button>
        </div>
      )}

      {asking && (
        <div className="flex flex-col gap-3 rounded-md border border-border-dark px-4 py-3.5">
          <label className="flex flex-col gap-1">
            <span className="h9 text-text-title">Your question</span>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={3}
              autoFocus
              className="min-h-[72px] w-full resize-none rounded-md border border-border-dark px-3 py-2 p6 text-text-primary outline-none hover:border-black-4 focus:border-black-7 focus:shadow-[inset_0_0_0_1px_var(--black-7)]"
            />
          </label>
          <div className="flex items-center justify-between gap-3">
            <span className="p7 text-text-secondary">CQuel replies in Questions and by email.</span>
            <div className="flex gap-2">
              <Button type="tertiary" onClick={() => setAsking(false)}>Cancel</Button>
              <Button
                type="secondary"
                disabled={!draft.trim()}
                onClick={() => {
                  onAsk({ text: draft.trim(), about: "The whole tender", sent: "Just now" });
                  setSent(draft.trim());
                  setAsking(false);
                  setQ("");
                }}
              >
                Send question
              </Button>
            </div>
          </div>
        </div>
      )}

      {sent && (
        <div className="grid grid-cols-[18px_1fr_auto] items-center gap-2.5 rounded-md border border-border-dark px-3.5 py-3" role="status">
          <span className="inline-flex size-[18px] items-center justify-center rounded-full bg-black-7 text-white">
            <Icon name="check" size={12} />
          </span>
          <div className="min-w-0">
            <p className="h8 text-text-primary">Question sent to CQuel</p>
            <p className="truncate p7 text-text-secondary">“{sent}” · we&apos;ll email you when it&apos;s answered</p>
          </div>
          <Button type="tertiary" icon="chevron-right" iconPosition="right" onClick={() => onTab("questions")}>
            Questions
          </Button>
        </div>
      )}
    </section>
  );
}

/* ---------------------------------------------------------------- the job */

function Cells({ rows, cols }: { rows: SpecRow[]; cols: number }) {
  return (
    <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
      {rows.map((r) => (
        <div key={r.label} className="flex flex-col gap-1 rounded-md border border-border-dark bg-bg-container-grey px-3.5 py-3">
          <span className="p7 text-text-tertiary">{r.label}</span>
          <span className={r.note ? "h8 text-text-primary" : "p6 text-text-primary"}>{r.value}</span>
          {r.note && <span className="p7 text-text-secondary">{r.note}</span>}
        </div>
      ))}
    </div>
  );
}

function Chapter({ n, id, title, children }: { n: number; id: string; title: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="overflow-hidden rounded-lg border border-border-dark bg-bg-container">
      <h2 id={id} className="flex items-baseline gap-2 px-5 pt-4 h7 text-text-primary">
        <span className="text-text-tertiary">{n}</span>
        {title}
      </h2>
      <div className="flex flex-col gap-3 px-5 pb-5 pt-3">{children}</div>
    </section>
  );
}

function SiteMap({ t, onTab }: { t: Tender; onTab: (id: TabId) => void }) {
  const [open, setOpen] = useState<number | null>(null);
  const site = t.sites.find((s) => s.n === open);
  return (
    <div
      className="relative overflow-hidden rounded-md border border-border-light"
      style={{ aspectRatio: `${t.map.width} / ${t.map.height}` }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={t.map.image} alt="" className="absolute inset-0 size-full object-cover" />
      {t.sites.map((s) => (
        <button
          key={s.n}
          type="button"
          aria-label={`Site ${s.n}, ${s.name}`}
          aria-expanded={open === s.n}
          onClick={() => setOpen(open === s.n ? null : s.n)}
          className={cn(
            "absolute inline-flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-black-7 h9 text-white outline-none focus-visible:shadow-focus",
            open === s.n ? "size-7 shadow-[0_0_0_3px_rgba(30,40,50,.25)]" : "size-6",
          )}
          style={{ left: `${s.pin.left}%`, top: `${s.pin.top}%` }}
        >
          {s.n}
        </button>
      ))}
      {site && (
        <div
          className="absolute z-10 flex w-60 flex-col gap-1.5 rounded-md border border-border-dark bg-white px-3.5 py-3 shadow-floating"
          style={{ left: `calc(${site.pin.left}% + 22px)`, top: `${Math.max(4, Math.min(site.pin.top, 60))}%` }}
        >
          <div className="flex items-start justify-between gap-2">
            <span className="h8 text-text-primary">{site.n} · {site.name}</span>
            <IconButton icon="cross" size="small" label="Close" onClick={() => setOpen(null)} />
          </div>
          <span className="p7 text-text-secondary">{site.address}</span>
          <span className="p6 text-text-primary">
            {site.system}
            {site.systemNote ? ` · ${site.systemNote}` : ""}
          </span>
          <Button type="tertiary" size="small" icon="chevron-right" iconPosition="right" className="self-start px-0" onClick={() => onTab("sites")}>
            {site.files.length} {site.files.length === 1 ? "file" : "files"}
          </Button>
        </div>
      )}
      <span className="absolute right-2 top-2 rounded-full border border-border-dark bg-white px-2 py-0.5 p7 text-text-secondary">
        {t.distance}
      </span>
      <span className="absolute bottom-0 left-0 bg-white/85 px-1.5 py-0.5 p7 text-text-secondary">{t.map.credit}</span>
    </div>
  );
}

/* --------------------------------------------------------------- overview */

function Overview({ t, onTab, onAsk }: { t: Tender; onTab: (id: TabId) => void; onAsk: (q: Question) => void }) {
  const offerRef = useRef<HTMLElement>(null);
  const [showSticky, setShowSticky] = useState(false);
  useEffect(() => {
    const el = offerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setShowSticky(!e.isIntersecting), { rootMargin: "-64px 0px 0px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <OfferCard t={t} cardRef={offerRef} />
      <Find t={t} onTab={onTab} onAsk={onAsk} />

      <Chapter n={1} id="c-job" title={`The job: ${t.sites.length === 3 ? "three" : t.sites.length} seafront roofs`}>
        <p className="p6 text-text-primary">{t.jobLead}</p>
        <div className="grid grid-cols-[minmax(0,3fr)_minmax(0,2fr)] items-start gap-3">
          <SiteMap t={t} onTab={onTab} />
          <Cells rows={t.jobCells} cols={2} />
        </div>
        <div className="flex items-center justify-between gap-3">
          <p className="p7 text-text-secondary">{t.seafront}</p>
          <Button type="tertiary" icon="chevron-right" iconPosition="right" onClick={() => onTab("sites")}>
            {`Sites & documents · ${t.sites.length} sites, ${t.fileCount} files`}
          </Button>
        </div>
      </Chapter>

      <Chapter n={2} id="c-price" title="What you price">
        <Cells rows={t.priceCells} cols={3} />
      </Chapter>

      <Chapter n={3} id="c-open" title="What nobody knows yet">
        <p className="p6 text-text-primary">Price on what you know and say what you assumed. These are settled later:</p>
        <Cells rows={t.openCells} cols={2} />
      </Chapter>

      <Chapter n={4} id="c-choose" title="How the customer chooses">
        <div className="grid grid-cols-3 gap-3">
          {t.criteria.map((c) => (
            <div key={c.title} className="flex items-start gap-2.5 rounded-md border border-border-dark bg-bg-container-grey px-3.5 py-3">
              <Icon name={c.icon} size={20} className="text-icon-default" />
              <div>
                <p className="h8 text-text-primary">{c.title}</p>
                <p className="p7 text-text-secondary">{c.text}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="p7 text-text-secondary">
          {t.contractLine} CQuel&apos;s commission is in the{" "}
          <Button type="link" className="p7">Commission Form</Button>.
        </p>
      </Chapter>

      <StickyOffer t={t} show={showSticky} />
    </div>
  );
}

/* ------------------------------------------------------ sites & documents */

function SitesAndDocs({ t }: { t: Tender }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-4">
        <div className="min-w-0 flex-1">
          <SiteMap t={t} onTab={() => undefined} />
        </div>
        <Card
          className="w-[400px] shrink-0"
          title={
            <>
              Documents for all sites <span className="font-normal text-text-tertiary">{t.sharedDocs.length}</span>
            </>
          }
          right={<Button type="link" ariaLabel={`Download all ${t.fileCount} files`}>Download everything</Button>}
          bodyClassName="px-4 py-0"
        >
          <DocumentList docs={t.sharedDocs} />
        </Card>
      </div>
      <Card
        title={
          <>
            Sites <span className="font-normal text-text-tertiary">{t.sites.length}</span>
          </>
        }
        right={<span className="p7">{t.sitesHint}</span>}
        bodyClassName="p-0"
      >
        <div className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,0.9fr)_minmax(0,1.3fr)_110px] items-center gap-4 border-b border-border-light px-4 py-2 pl-8">
          <span className="s3 text-text-tertiary">Site</span>
          <span className="s3 text-text-tertiary">System</span>
          <span className="s3 text-text-tertiary">Documents</span>
          <span />
        </div>
        {t.sites.map((s, i) => (
          <div
            key={s.n}
            className={cn(
              "grid min-h-14 grid-cols-[minmax(0,1.4fr)_minmax(0,0.9fr)_minmax(0,1.3fr)_110px] items-center gap-4 px-4 py-3 pl-8 hover:bg-black-1",
              i < t.sites.length - 1 && "border-b border-border-light",
            )}
          >
            <div className="min-w-0">
              <p className="h8 text-text-title">{s.n} · {s.name}</p>
              <p className="p7 text-text-secondary">{s.address}</p>
            </div>
            <div className="p6 text-text-primary">
              {s.system}
              {s.systemNote && <span className="block p7 text-text-tertiary">{s.systemNote}</span>}
            </div>
            <div className="grid grid-cols-[minmax(0,1fr)_32px] items-center gap-2">
              <div className="min-w-0">
                <p className="p6 text-text-primary">{s.files.length} {s.files.length === 1 ? "file" : "files"}</p>
                <p className="truncate p7 text-text-tertiary">
                  {s.files.map((f, j) => (j === 0 ? f.name : f.name.toLowerCase())).join(", ")}
                </p>
              </div>
              <IconButton icon="download" label={`Download files for ${s.name}`} />
            </div>
            <div className="flex justify-end">
              <Button type="tertiary" icon="chevron-right" iconPosition="right">View site</Button>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

/* --------------------------------------------------------------- questions */

function Questions({ t, questions, onAsk }: { t: Tender; questions: Question[]; onAsk: (q: Question) => void }) {
  const [about, setAbout] = useState(t.questionTopics[0]);
  const [text, setText] = useState("");
  return (
    <div className="flex flex-col gap-4">
      <Card title="Ask a question" bodyClassName="flex flex-col gap-3 p-4">
        <div className="flex max-w-[360px] flex-col gap-1">
          <span className="h9 text-text-title">About</span>
          <Dropdown
            ariaLabel="About"
            value={about}
            onValueChange={setAbout}
            options={t.questionTopics.map((q) => ({ value: q, label: q }))}
          />
        </div>
        <label className="flex flex-col gap-1">
          <span className="h9 text-text-title">Your question</span>
          <textarea
            className="min-h-[88px] w-full resize-none rounded-md border border-border-dark bg-white px-3 py-2 p6 text-text-primary outline-none placeholder:text-text-tertiary hover:border-black-4 focus:border-black-7 focus:shadow-[inset_0_0_0_1px_var(--black-7)]"
            rows={4}
            placeholder="For example: is the export limit known for Boulevard Hotel?"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </label>
        <div className="flex items-center justify-between gap-3">
          <span className="p7 text-text-secondary">CQuel replies here and by email. If only the customer knows, CQuel asks them first.</span>
          <Button
            type="secondary"
            size="large"
            disabled={!text.trim()}
            onClick={() => {
              onAsk({ text: text.trim(), about, sent: "Just now" });
              setText("");
            }}
          >
            Send question
          </Button>
        </div>
      </Card>
      <Card
        title={
          <>
            Questions and answers <span className="font-normal text-text-tertiary">{questions.length}</span>
          </>
        }
        bodyClassName={questions.length ? "px-4 py-0" : undefined}
      >
        {questions.length === 0 ? (
          <p className="p6 text-text-tertiary">No questions yet</p>
        ) : (
          <ul>
            {questions.map((q, i) => (
              <li key={`${q.text}-${i}`} className={cn("flex items-start justify-between gap-4 py-3", i > 0 && "border-t border-border-light")}>
                <div className="min-w-0">
                  <p className="h8 text-text-title">{q.text}</p>
                  <p className="p7 text-text-secondary">{q.about} · sent {q.sent.toLowerCase()}</p>
                </div>
                <span className="p7 text-text-tertiary">Waiting for CQuel</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------------- page */

export function SupplierTender({ t }: { t: Tender }) {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();
  const raw = search.get("tab");
  const tab: TabId = raw === "sites" || raw === "questions" ? raw : "overview";
  const [questions, setQuestions] = useState<Question[]>([]);
  const setTab = (id: TabId) => {
    router.replace(id === "overview" ? pathname : `${pathname}?tab=${id}`, { scroll: false });
    window.scrollTo({ top: 0 });
  };
  const ask = (q: Question) => setQuestions((cur) => [q, ...cur]);

  return (
    <div className="min-h-screen bg-[linear-gradient(to_right,white_50%,var(--bg-container-grey)_50%)]">
      <SupplierBar t={t} />
      <div className="mx-auto flex w-full max-w-screen-2xl items-stretch bg-bg-container-grey">
        <Rail t={t} />
        <main className="min-w-0 flex-1 px-8 pb-28 pt-6">
          <Tabs.Root value={tab} onValueChange={(v) => setTab(v as TabId)}>
            <Tabs.List className={cn(tabListClass, "mt-2")} aria-label="Tender sections">
              {TABS.map((item) => (
                <Tabs.Trigger key={item.id} value={item.id} className={tabTriggerClass}>
                  {item.label}
                  {item.id === "questions" && questions.length > 0 ? ` (${questions.length})` : ""}
                </Tabs.Trigger>
              ))}
            </Tabs.List>
            <Tabs.Content value="overview" className="outline-none">
              <Overview t={t} onTab={setTab} onAsk={ask} />
            </Tabs.Content>
            <Tabs.Content value="sites" className="outline-none">
              <SitesAndDocs t={t} />
            </Tabs.Content>
            <Tabs.Content value="questions" className="outline-none">
              <Questions t={t} questions={questions} onAsk={ask} />
            </Tabs.Content>
          </Tabs.Root>
        </main>
      </div>
    </div>
  );
}
