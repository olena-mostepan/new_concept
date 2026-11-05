"use client";

import { type OfferSplit, type Workstream } from "@/lib/concept/model";
import { short } from "@/lib/concept/derive";
import { WALTER_SCOTT_MATCHING } from "@/lib/customer/supplier-matching/fixture";
import { SupplierMatchingReview } from "@/components/customer/supplier-matching/SupplierMatchingReview";
import { Card } from "./ui";
import { DetailTags } from "./DetailsGrid";

export type TenderPanelId = "brief" | "supplier-matching" | "tender-results";

export function offersIn(offers?: OfferSplit) {
  if (!offers) return 0;
  return offers.received + (offers.partial ?? 0);
}

function offerSegments(offers: OfferSplit) {
  const items: Array<{
    label: string;
    count: number;
    color: string;
    onDark: boolean;
  }> = [];
  if (offers.received)
    items.push({
      label: "Offer received",
      count: offers.received,
      color: "#1e2832",
      onDark: true,
    });
  if (offers.partial)
    items.push({
      label: "Partial offer",
      count: offers.partial,
      color: "#9ca3af",
      onDark: false,
    });
  if (offers.declined)
    items.push({
      label: "Declined",
      count: offers.declined,
      color: "#6b7280",
      onDark: true,
    });
  if (offers.noResponse)
    items.push({
      label: "No response yet",
      count: offers.noResponse,
      color: "#e5e7eb",
      onDark: false,
    });
  return items;
}

function offerSummary(offers: OfferSplit) {
  if (offers.summary) return offers.summary;
  return [
    offers.received ? `${offers.received} received` : null,
    offers.partial ? `${offers.partial} partial` : null,
    offers.declined ? `${offers.declined} declined` : null,
    offers.noResponse ? `${offers.noResponse} no response` : null,
  ]
    .filter(Boolean)
    .join(" · ");
}

function Soon({ label, noun }: { label: string; noun: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border-dark bg-white px-5 py-10 text-center ">
      <p className="p6 text-text-primary">{label} — coming soon</p>
      <p className="mt-1 p6 text-text-secondary">
        Placeholder for the customer {noun} view.
      </p>
    </div>
  );
}

export function TenderPanel({
  w,
  tab,
}: {
  w: Workstream;
  tab: TenderPanelId;
}) {
  const t = w.tender;
  const invited = t?.invited ?? 0;
  const offersRight = invited
    ? [
        t?.invitedOn
          ? `${invited} suppliers invited ${short(t.invitedOn)}`
          : `${invited} suppliers invited`,
        t?.offersDue ? `offers due ${short(t.offersDue)}` : null,
      ]
        .filter(Boolean)
        .join(" · ")
    : null;

  if (tab === "brief") {
    return (
      <>
        <DetailTags label="Criteria" tags={t?.criteria ?? []} />
        <Soon label="Brief" noun="brief" />
      </>
    );
  }
  if (tab === "tender-results") {
    return (
      <>
        {invited > 0 && t?.offers && (
          <Card title="Offers" right={offersRight ?? undefined}>
            <OffersBar offers={t.offers} />
            <p className="mt-3 p6 text-text-secondary">
              {offerSummary(t.offers)}
            </p>
          </Card>
        )}
        {!(invited > 0 && t?.offers) && <Soon label="Tender" noun="tender" />}
      </>
    );
  }
  if (w.id === "solar-de") {
    return (
      <SupplierMatchingReview
        audience="customer"
        tender={{
          ...WALTER_SCOTT_MATCHING,
          closeDate: "2026-10-24",
          status: "open",
          contacted: t?.approached ?? WALTER_SCOTT_MATCHING.contacted,
          metRequirements: invited,
          exclusionReasons: [],
          unassessed: [],
        }}
      />
    );
  }
  return <Soon label="Supplier matching" noun="supplier matching" />;
}

function OffersBar({ offers }: { offers: OfferSplit }) {
  const segments = offerSegments(offers);
  return (
    <div>
      <div className="flex w-full gap-1.5">
        {segments.map((segment) => (
          <div
            key={segment.label}
            className="min-w-0 text-center"
            style={{ flex: `${segment.count} 1 0` }}
          >
            <p className="truncate p7 text-text-secondary">{segment.label}</p>
          </div>
        ))}
      </div>
      <div
        className="mt-2 flex h-10 w-full overflow-hidden rounded-full"
        role="img"
        aria-label="Offers"
      >
        {segments.map((segment) => (
          <div
            key={segment.label}
            className="flex h-full items-center justify-center h8 tabular-nums"
            style={{
              flex: `${segment.count} 1 0`,
              backgroundColor: segment.color,
              color: segment.onDark ? "#fff" : "#1e2832",
            }}
          >
            {segment.count}
          </div>
        ))}
      </div>
    </div>
  );
}
