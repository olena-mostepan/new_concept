"use client";

/*
 * Supplier concept · after the indicative-offer deadline (C10 board, 19 Nov):
 * shortlisted (sign the Commission Form, outside the platform) → add visit dates
 * (the supplier books with the site) → visits booked; or not shortlisted (feedback),
 * declined, no offer sent. Replaces the offer card on the Overview.
 */

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { SupplierTender as Tender } from "@/lib/concept/supplier";
import type { TenderRow, TenderState } from "@/lib/concept/supplierList";
import { Button, ChipTrack, ResponsibilityPill } from "./ui";
import { StateMark } from "./ops-asset/opsUi";
import { money, priceSummary, sitesLine, type Offer } from "./SupplierOffer";

type Visit = { date: string; time: string; people: string };

const inputClass =
  "h-10 rounded-md border border-border-dark bg-white px-3 p6 font-sans text-text-primary outline-none placeholder:text-text-tertiary focus:border-black-7 focus:shadow-[inset_0_0_0_1px_var(--black-7)]";

const gbp = (n: number) => `£${Math.round(n).toLocaleString("en-GB")}`;

function Head({
  label,
  title,
  text,
  yours,
  aside,
}: {
  label: string;
  title: string;
  text?: string;
  yours?: boolean;
  aside?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-6">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center gap-2">
          {yours && <ResponsibilityPill owner="you" label="Your action" />}
          <span className="s3 text-text-tertiary">{label}</span>
        </div>
        <h2 id="offer-h" className="h6 text-text-primary">
          {title}
        </h2>
        {text && <p className="p6 text-text-secondary">{text}</p>}
      </div>
      {aside && <div className="flex shrink-0 items-center gap-2">{aside}</div>}
    </div>
  );
}

function SectionHead({ label, pill }: { label: string; pill?: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border-light pb-2">
      <h3 className="s3 text-text-tertiary">{label}</h3>
      {pill && (
        <span className="inline-flex h-6 items-center rounded-full border border-border-dark bg-white px-2 h9 text-text-title">
          {pill}
        </span>
      )}
    </div>
  );
}

/** The indicative offer they sent, folded to one line. */
function SentOffer({ t, offer }: { t: Tender; offer: Offer }) {
  return (
    <section className="flex flex-col gap-2">
      <SectionHead label="Your indicative offer" pill="Sent" />
      <p className="flex flex-wrap items-center gap-x-2 p6 text-text-secondary">
        <span>
          {priceSummary(t, offer)} · {sitesLine(t, offer.sites)} · start {offer.start}
        </span>
        <Button type="link" onClick={() => offer.setOpen(true)}>
          View your offer
        </Button>
      </p>
    </section>
  );
}

function Track({ now }: { now: 0 | 1 | 2 | 3 }) {
  const items = [
    { key: "sign", label: "Sign the Commission Form" },
    { key: "arrange", label: "Arrange the site visit" },
    { key: "dates", label: "Tell us the dates" },
  ];
  return (
    <ChipTrack
      steps={items.map((s, i) => ({
        key: s.key,
        lead: i < now ? "done" : i === now ? "now" : "next",
        label: s.label,
      }))}
    />
  );
}

function FormRow({ signed, date }: { signed: boolean; date?: string }) {
  return (
    <div className="grid grid-cols-[20px_minmax(0,1fr)_auto] items-center gap-x-4 border-b border-border-light py-3">
      <StateMark state={signed ? "done" : "open"} size={20} />
      <div className="min-w-0">
        <p className="h8 text-text-primary">{signed ? "Commission Form signed" : "Waiting for your signature"}</p>
        <p className="p7 text-text-secondary">
          {signed
            ? `Marked signed by CQuel${date ? ` · ${date}` : ""}`
            : "CQuel sent it to you. Sign it and send it back the way it came."}
        </p>
      </div>
      <Button type="tertiary" icon="download">
        Download
      </Button>
    </div>
  );
}

function VisitRows({ t, booked }: { t: Tender; booked: boolean }) {
  const first: Visit = { date: "14 May", time: "10:00", people: "2" };
  const [visits, setVisits] = useState<Record<number, Visit | undefined>>(() =>
    booked
      ? Object.fromEntries(t.sites.map((s, i) => [s.n, { ...first, time: ["10:00", "13:00", "09:00"][i % 3] }]))
      : { [t.sites[0].n]: first },
  );
  const [editing, setEditing] = useState<number | null>(booked ? null : t.sites[1]?.n ?? null);
  const [draft, setDraft] = useState<Visit>({ date: "", time: "", people: "" });
  const missing = t.sites.filter((s) => !visits[s.n]).length;

  return (
    <section className="flex flex-col">
      <SectionHead
        label="Visit dates"
        pill={missing ? `${missing} to add` : `${t.sites.length} of ${t.sites.length}`}
      />
      {t.sites.map((s) => {
        const v = visits[s.n];
        const open = editing === s.n;
        return (
          <div
            key={s.n}
            className="grid grid-cols-[20px_minmax(0,1fr)_auto] items-center gap-x-4 border-b border-border-light py-3"
          >
            <StateMark state={v ? "done" : "open"} size={20} />
            <div className="min-w-0">
              <p className="h8 text-text-primary">
                {s.n} · {s.name}
              </p>
              {open ? (
                <form
                  className="mt-2 flex flex-wrap items-center gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!draft.date) return;
                    setVisits((cur) => ({ ...cur, [s.n]: draft }));
                    setDraft({ date: "", time: "", people: "" });
                    setEditing(null);
                  }}
                >
                  <input aria-label="Date" placeholder="Date" className={cn(inputClass, "w-40")} value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} />
                  <input aria-label="Time" placeholder="Time" className={cn(inputClass, "w-28")} value={draft.time} onChange={(e) => setDraft({ ...draft, time: e.target.value })} />
                  <input aria-label="People coming" placeholder="People coming" className={cn(inputClass, "w-36")} value={draft.people} onChange={(e) => setDraft({ ...draft, people: e.target.value })} />
                  <button type="submit" className="sr-only">
                    Save
                  </button>
                  <Button type="secondary" onClick={() => {
                    if (!draft.date) return;
                    setVisits((cur) => ({ ...cur, [s.n]: draft }));
                    setDraft({ date: "", time: "", people: "" });
                    setEditing(null);
                  }}>
                    Save
                  </Button>
                  <Button type="tertiary" onClick={() => setEditing(null)}>
                    Cancel
                  </Button>
                </form>
              ) : (
                <p className="p7 text-text-secondary">
                  {v
                    ? `${v.date}${v.time ? `, ${v.time}` : ""}${v.people ? ` · ${v.people} ${v.people === "1" ? "person" : "people"}` : ""}`
                    : "No date yet"}
                </p>
              )}
            </div>
            {!open && (
              <Button
                type="tertiary"
                onClick={() => {
                  setDraft(v ?? { date: "", time: "", people: "" });
                  setEditing(s.n);
                }}
              >
                {v ? "Edit" : "Add date"}
              </Button>
            )}
          </div>
        );
      })}
    </section>
  );
}

function Compare({ t, offer }: { t: Tender; offer: Offer }) {
  const q = t.quote;
  const start = t.facts.find((f) => f.label === "Contract start");
  const rows = [
    ...(offer.structure === "one" ? [] : [{ label: "Price", yours: priceSummary(t, offer), asked: `Budget ~${t.facts.find((f) => f.label === "Budget")?.value ?? "not set"}` }]),
    ...(offer.structure !== "one" ? [] : [{ label: "Price per kWp", yours: gbp(money(offer.price) / q.kwp), asked: `Budget ~${t.facts.find((f) => f.label === "Budget")?.value ?? "not set"}` }]),
    { label: "Start", yours: offer.start, asked: start ? `~${start.value}` : "Not set" },
    { label: "Panel warranty", yours: `${offer.warranties.panels} years`, asked: `${q.expected.panels}+ years`, flag: offer.warranties.panels < q.expected.panels },
    { label: "Workmanship warranty", yours: `${offer.warranties.workmanship} years`, asked: `${q.expected.workmanship}+ years`, flag: offer.warranties.workmanship < q.expected.workmanship },
  ];
  return (
    <section className="flex flex-col">
      <SectionHead label="How your offer compared with what the customer asked for" />
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] gap-x-6 border-b border-border-light py-2 s3 text-text-tertiary">
        <span />
        <span>Yours</span>
        <span>Customer</span>
      </div>
      {rows.map((r) => (
        <div
          key={r.label}
          className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] gap-x-6 border-b border-border-light py-2.5"
        >
          <span className="p6 text-text-secondary">{r.label}</span>
          <span className={cn("h8", r.flag ? "text-status-warning-text" : "text-text-primary")}>{r.yours}</span>
          <span className="p6 text-text-secondary">{r.asked}</span>
        </div>
      ))}
      <p className="pt-2 p7 text-text-secondary">Amber means outside what the customer expects.</p>
    </section>
  );
}

export function Outcome({
  t,
  offer,
  state,
  row,
  cardRef,
}: {
  t: Tender;
  offer: Offer;
  state: TenderState;
  row?: TenderRow;
  cardRef: React.Ref<HTMLElement>;
}) {
  const yours = state === "shortlisted" || state === "visitDates";
  const due = t.round.due.replace("due ", "");
  return (
    <section
      ref={cardRef}
      aria-labelledby="offer-h"
      className={cn(
        "flex flex-col gap-5 rounded-lg border border-border-dark bg-bg-container px-6 py-5",
        yours && "border-t-4 border-t-brand-6",
      )}
    >
      {state === "shortlisted" && (
        <>
          <Head
            yours
            label="Shortlist"
            title="You're on the shortlist"
            text="The customer wants to visit with you before your final offer. CQuel has sent you the Commission Form to sign. When it's signed, the site contact shows here."
            aside={<Button type="secondary" icon="download">Download the form</Button>}
          />
          <Track now={0} />
          <FormRow signed={false} />
          <SentOffer t={t} offer={offer} />
        </>
      )}

      {state === "visitDates" && (
        <>
          <Head
            yours
            label="Site visit"
            title="Arrange the site visit"
            text="Book it with the site, then add the date for each site here. CQuel and the customer don't attend."
          />
          <Track now={1} />
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-0.5 rounded-md border border-border-light bg-bg-container-grey px-4 py-3">
              <span className="p7 text-text-tertiary">Site contact</span>
              <span className="h8 text-text-primary">{t.customer || "The site"}</span>
              <span className="p7 text-text-secondary">Name and phone are in CQuel&apos;s email</span>
            </div>
            <div className="flex flex-col gap-0.5 rounded-md border border-border-light bg-bg-container-grey px-4 py-3">
              <span className="p7 text-text-tertiary">Checked at the visit</span>
              <span className="p6 text-text-primary">{t.atVisit.map((a) => a.label).join(" · ")}</span>
            </div>
          </div>
          <VisitRows t={t} booked={false} />
          <FormRow signed date={row?.next.detail?.replace("form signed ", "")} />
        </>
      )}

      {state === "visitBooked" && (
        <>
          <Head
            label="Site visit · booked"
            title="Your visits are booked"
            text="After the visits, you update your offer into a final offer."
          />
          <VisitRows t={t} booked />
          <SentOffer t={t} offer={offer} />
        </>
      )}

      {state === "notShortlisted" && (
        <>
          <Head
            label="Shortlist"
            title="You're not on the shortlist this time"
            text="Thanks for sending your offer. Here's how it compared with what the customer asked for."
          />
          <section className="flex flex-col">
            <SectionHead label="What the customer was looking for" />
            {t.criteria.map((c) => (
              <div key={c.title} className="flex items-baseline gap-4 border-b border-border-light py-2.5">
                <span className="w-32 shrink-0 h8 text-text-primary">{c.title}</span>
                <span className="p6 text-text-secondary">{c.text}</span>
              </div>
            ))}
          </section>
          <Compare t={t} offer={offer} />
          <div className="rounded-md border border-border-light bg-bg-container-grey px-4 py-3">
            <p className="h8 text-text-primary">What worked, and what would make your next offer stronger</p>
            <p className="p6 text-text-secondary">CQuel is writing this. It shows here when it&apos;s ready.</p>
          </div>
          <SentOffer t={t} offer={offer} />
          <div className="flex items-center justify-between gap-3 border-t border-border-light pt-4">
            <span className="p6 text-text-primary">Questions about this feedback?</span>
            <Button type="secondary">Ask CQuel</Button>
          </div>
        </>
      )}

      {state === "declined" && (
        <Head
          label="Closed"
          title="You declined this tender"
          text={`You told CQuel on ${row?.next.detail ?? "the invitation"}. Changed your mind before the deadline? Ask CQuel.`}
          aside={<Button type="secondary">Ask CQuel</Button>}
        />
      )}

      {state === "missed" && (
        <Head
          label="Closed"
          title="No offer sent"
          text={`The indicative offer was due ${row?.next.detail?.replace("deadline was ", "") ?? due}. Nothing was sent, so the customer didn't see an offer from you.`}
        />
      )}
    </section>
  );
}
