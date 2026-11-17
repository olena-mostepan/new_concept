"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import * as Tabs from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";
import type { SpecRow, SupplierTender as Tender } from "@/lib/concept/supplier";
import {
  Banner,
  Button,
  Card,
  ChipTrack,
  DocumentList,
  Dropdown,
  FactsRow,
  Icon,
  IconButton,
  ResponsibilityPill,
  focusRing,
  tabListClass,
  tabTriggerClass,
} from "./ui";

/* Supplier concept · one tender as an invited supplier sees it (C2 boards). */

type TabId = "overview" | "sites" | "questions";
const TABS: Array<{ id: TabId; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "sites", label: "Sites & documents" },
  { id: "questions", label: "Questions" },
];

function SupplierBar({ t }: { t: Tender }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border-dark bg-white">
      <div className="mx-auto flex h-16 w-full max-w-screen-2xl items-center justify-between px-6 sm:px-8 lg:px-10">
        <Link
          href="/concept/supplier"
          className={cn("group inline-flex items-center gap-1.5 h8 text-text-primary", focusRing)}
        >
          <Icon name="arrow-left" size={16} />
          <span className="group-hover:underline group-hover:underline-offset-[3px]">Tenders</span>
        </Link>
        <div className="flex items-center gap-4">
          <span
            aria-label="Account"
            className="inline-flex size-8 items-center justify-center rounded-full bg-black-7 h9 text-white"
          >
            {t.supplier.initials}
          </span>
        </div>
      </div>
    </header>
  );
}

/** Label / value rows, light borders. */
function Spec({ rows, labelWidth = "200px" }: { rows: SpecRow[]; labelWidth?: string }) {
  return (
    <dl className="grid px-4" style={{ gridTemplateColumns: `${labelWidth} minmax(0,1fr)` }}>
      {rows.map((r, i) => (
        <div key={r.label} className={cn("contents")}>
          <dt className={cn("py-3 pr-4 h8 text-text-title", i > 0 && "border-t border-border-light")}>
            {r.label}
          </dt>
          <dd className={cn("py-3 p6 text-text-primary", i > 0 && "border-t border-border-light")}>
            {r.value}
            {r.note && <span className="block p7 text-text-secondary">{r.note}</span>}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function Rail({ t, onTab }: { t: Tender; onTab: (id: TabId) => void }) {
  return (
    <aside className="flex w-[420px] shrink-0 flex-col gap-4 pb-14 pl-8 pr-5 pt-6">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <span className="s3 text-text-tertiary">Tender · {t.service}</span>
          <h1 className="h6 text-text-primary">{t.title}</h1>
          <p className="p7 text-text-secondary">For {t.customer}</p>
        </div>
        <Banner type="info" icon="info" title="Why you were invited">
          {t.whyInvited}
        </Banner>
        <div className="grid grid-cols-2 gap-x-6 gap-y-4 border-t border-border-light pt-4">
          {t.facts.map((f) => (
            <div key={f.label} className="min-w-0">
              <p className="p7 text-text-tertiary">{f.label}</p>
              <p className="mt-0.5 h8 text-text-primary">{f.value}</p>
              {f.note && <p className="mt-0.5 p7 text-text-secondary">{f.note}</p>}
            </div>
          ))}
        </div>
      </div>

      <section className="overflow-hidden rounded-lg border border-border-dark bg-bg-container">
        <div className="flex items-start justify-between gap-3 px-5 py-4">
          <div className="flex flex-col gap-1">
            <span className="s3 text-text-tertiary">Your status</span>
            <h2 className="h7 text-text-primary">{t.status.label}</h2>
            <p className="p7 text-text-secondary">{t.status.detail}</p>
          </div>
        </div>
        <div className="px-5 pb-4">
          <Button type="secondary" size="large" className="w-full" onClick={() => onTab("overview")}>
            Upload your quote
          </Button>
          <p className="mt-3 text-center p7 text-text-secondary">
            Not bidding?{" "}
            <Button type="link" className="h9">
              Decline this tender
            </Button>
          </p>
        </div>
        <div className="border-t border-border-light px-5 pb-4 pt-4">
          <h3 className="mb-3 s3 text-text-tertiary">What happens next</h3>
          <ol>
            {t.next.map((step, i) => (
              <li key={step.title} className="relative grid grid-cols-[12px_1fr] gap-3 pb-4 last:pb-1">
                {i < t.next.length - 1 && (
                  <span className="absolute left-[5px] top-4 -bottom-0.5 w-0.5 bg-border-dark" aria-hidden />
                )}
                <span
                  aria-hidden
                  className={cn(
                    "relative z-10 mt-1 size-3 rounded-full",
                    step.now
                      ? "bg-brand-6 shadow-[0_0_0_3px_var(--bg-accent)]"
                      : "border-2 border-black-4 bg-white",
                  )}
                />
                <div>
                  <p className={step.now ? "h8 text-text-primary" : "p6 text-text-primary"}>{step.title}</p>
                  {step.detail && <p className="p7 text-text-secondary">{step.detail}</p>}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="flex flex-col gap-2 rounded-lg border border-status-warning-border bg-status-warning-bg px-5 py-4">
        <h2 className="h7 text-text-primary">How CQuel is paid</h2>
        <p className="p6 text-text-secondary">{t.paid}</p>
        <div>
          <Button type="secondary" size="default">Read the form</Button>
        </div>
      </section>
    </aside>
  );
}

function Overview({ t, onTab }: { t: Tender; onTab: (id: TabId) => void }) {
  return (
    <div className="flex flex-col gap-4">
      <section className="flex flex-col gap-5 rounded-lg border border-border-dark border-t-4 border-t-brand-6 bg-bg-container p-6">
        <div className="flex items-start justify-between gap-6">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="flex items-center gap-2">
              <ResponsibilityPill owner="you" label="Your action" />
              <span className="s3 text-text-tertiary">
                {t.round.label} · {t.round.due}
              </span>
            </div>
            <h2 className="h6 text-text-primary">{t.offer.title}</h2>
            <p className="p6 text-text-secondary">{t.offer.text}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button type="secondary" size="large" onClick={() => onTab("questions")}>
              Ask a question
            </Button>
            <Button type="primary" size="large" icon="upload">
              Upload your quote
            </Button>
          </div>
        </div>
        <ChipTrack
          steps={t.offerSteps.map((s, i) => ({
            key: s.key,
            lead: i === 0 ? "now" : "next",
            label: s.label,
            notes: [{ text: s.text, className: "mt-1 max-w-[30ch] p7 text-text-secondary" }],
          }))}
        />
        <p className="border-t border-border-light pt-3 p7 text-text-secondary">
          {t.offer.footer} ·{" "}
          <a href="#" className="underline underline-offset-2 decoration-border-dark">
            See the terms
          </a>
        </p>
      </section>

      <Card title="The job" bodyClassName="p-0">
        <Spec rows={t.job} />
      </Card>

      <Card title="What to price and send" right={<span className="p7">{t.round.label.replace(" of 2", "")}</span>} bodyClassName="p-0">
        <Spec rows={t.priceAndSend} />
      </Card>

      <div className="grid grid-cols-2 items-stretch gap-4">
        <Card title="Checked at the site visit" bodyClassName="p-0" className="h-full">
          <Spec rows={t.atVisit} labelWidth="140px" />
        </Card>
        <Card
          title={
            <span className="flex flex-col gap-0.5">
              Not known yet
              <span className="p7 text-text-secondary">Price on what you know. Say what you assumed.</span>
            </span>
          }
          bodyClassName="p-0"
          className="h-full"
        >
          <Spec rows={t.notKnown} labelWidth="140px" />
        </Card>
      </div>

      <button
        type="button"
        onClick={() => onTab("sites")}
        className={cn(
          "flex items-center justify-between gap-4 rounded-lg border border-status-info-border bg-status-info-bg px-5 py-4 text-left",
          focusRing,
        )}
      >
        <span>
          <span className="block h8 text-text-primary">Sites & documents</span>
          <span className="block p7 text-text-secondary">
            {t.sites.length} sites on a map, their sizes and files, plus the design document, price template and commission form
          </span>
        </span>
        <Icon name="chevron-right" size={16} className="text-icon-default" />
      </button>

      <Card title="How the customer chooses, and the contract" bodyClassName="flex flex-col gap-5 px-4 pb-5 pt-4">
        <div className="flex flex-col gap-3">
          <h3 className="s3 text-text-tertiary">How you&apos;re chosen</h3>
          <div className="grid grid-cols-3 gap-3">
            {t.criteria.map((c) => (
              <div key={c.title} className="flex flex-col gap-1 rounded-md border border-border-dark bg-bg-container px-4 py-3.5">
                <Icon name={c.icon} size={24} className="mb-1.5 text-icon-default" />
                <p className="h8 text-text-primary">{c.title}</p>
                <p className="p7 text-text-secondary">{c.text}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <h3 className="s3 text-text-tertiary">The contract</h3>
          <div className="rounded-md bg-bg-container-grey px-4 pb-4 pt-3">
            <FactsRow
              facts={t.contract.map((c) => ({ label: c.label, value: c.value, detail: c.note }))}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}

function SiteMap({ t }: { t: Tender }) {
  return (
    <div
      role="img"
      aria-label={`Map of the ${t.sites.length} sites`}
      className="relative min-h-[260px] flex-1 overflow-hidden rounded-lg border border-border-dark bg-black-2"
    >
      <div className="absolute inset-y-0 left-0 w-[34%] bg-black-3/60" />
      <span className="absolute bottom-2 left-2 p7 text-text-tertiary">Irish Sea</span>
      {t.sites.map((s) => (
        <span
          key={s.n}
          className="absolute inline-flex size-5 items-center justify-center rounded-full border-2 border-white bg-black-7 h9 text-white"
          style={{ left: `${s.pin.left}%`, top: `${s.pin.top}%` }}
        >
          {s.n}
        </span>
      ))}
      <span className="absolute right-2 top-2 rounded-full border border-border-dark bg-white px-2 py-0.5 p7 text-text-secondary">
        {t.distance}
      </span>
    </div>
  );
}

function SitesAndDocs({ t }: { t: Tender }) {
  const total = t.sites.reduce((n, s) => n + s.files.length, 0) + t.sharedDocs.length;
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-stretch gap-4">
        <SiteMap t={t} />
        <Card
          className="w-[400px] shrink-0"
          title={
            <>
              Documents for all sites <span className="font-normal text-text-tertiary">{t.sharedDocs.length}</span>
            </>
          }
          right={
            <Button type="link" ariaLabel={`Download all ${total} files`}>
              Download everything
            </Button>
          }
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
              <p className="h8 text-text-title">
                {s.n} · {s.name}
              </p>
              <p className="p7 text-text-secondary">{s.address}</p>
            </div>
            <div className="p6 text-text-primary">
              {s.system}
              {s.systemNote && <span className="block p7 text-text-tertiary">{s.systemNote}</span>}
            </div>
            <div className="grid grid-cols-[minmax(0,1fr)_32px] items-center gap-2">
              <div className="min-w-0">
                <p className="p6 text-text-primary">
                  {s.files.length} {s.files.length === 1 ? "file" : "files"}
                </p>
                <p className="truncate p7 text-text-tertiary">
                  {s.files.map((f, j) => (j === 0 ? f.name : f.name.toLowerCase())).join(", ")}
                </p>
              </div>
              <IconButton icon="download" label={`Download files for ${s.name}`} />
            </div>
            <div className="flex justify-end">
              <Button type="tertiary" size="default" icon="chevron-right" iconPosition="right">
                View site
              </Button>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

function Questions({ t }: { t: Tender }) {
  const [about, setAbout] = useState(t.questionTopics[0]);
  const [text, setText] = useState("");
  const field =
    "w-full rounded-md border border-border-dark bg-white px-3 p6 text-text-primary outline-none placeholder:text-text-tertiary hover:border-black-4 focus:border-black-7 focus:shadow-[inset_0_0_0_1px_var(--black-7)]";
  return (
    <div className="flex flex-col gap-4">
      <Card title="Ask a question" bodyClassName="flex flex-col gap-3 p-4">
        <div className="flex max-w-[360px] flex-col gap-1">
          <span className="h9 text-text-title" id="q-about">About</span>
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
            className={cn(field, "min-h-[88px] resize-none py-2")}
            rows={4}
            placeholder="For example: is the export limit known for Boulevard Hotel?"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </label>
        <div className="flex items-center justify-between gap-3">
          <span className="p7 text-text-secondary">We reply here and by email.</span>
          <Button type="secondary" size="large" disabled={!text.trim()}>
            Send question
          </Button>
        </div>
      </Card>
      <Card
        title={
          <>
            Questions and answers <span className="font-normal text-text-tertiary">0</span>
          </>
        }
      >
        <p className="p6 text-text-tertiary">No questions yet</p>
      </Card>
    </div>
  );
}

export function SupplierTender({ t }: { t: Tender }) {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();
  const raw = search.get("tab");
  const tab: TabId = raw === "sites" || raw === "questions" ? raw : "overview";
  const setTab = (id: TabId) => {
    router.replace(id === "overview" ? pathname : `${pathname}?tab=${id}`, { scroll: false });
    window.scrollTo({ top: 0 });
  };

  return (
    <div className="min-h-screen bg-bg-container-grey">
      <SupplierBar t={t} />
      <div className="mx-auto flex w-full max-w-screen-2xl">
        <Rail t={t} onTab={setTab} />
        <main className="min-w-0 flex-1 border-l border-border-dark px-8 pb-14 pt-6">
          <Tabs.Root value={tab} onValueChange={(v) => setTab(v as TabId)}>
            <Tabs.List className={cn(tabListClass, "mt-2")} aria-label="Tender sections">
              {TABS.map((item) => (
                <Tabs.Trigger key={item.id} value={item.id} className={tabTriggerClass}>
                  {item.label}
                </Tabs.Trigger>
              ))}
            </Tabs.List>
            <Tabs.Content value="overview" className="outline-none">
              <Overview t={t} onTab={setTab} />
            </Tabs.Content>
            <Tabs.Content value="sites" className="outline-none">
              <SitesAndDocs t={t} />
            </Tabs.Content>
            <Tabs.Content value="questions" className="outline-none">
              <Questions t={t} />
            </Tabs.Content>
          </Tabs.Root>
        </main>
      </div>
    </div>
  );
}
