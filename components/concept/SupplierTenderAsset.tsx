"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import type { SupplierTender as Tender } from "@/lib/concept/supplier";
import { assetsOf, homesKw } from "./SupplierTender";
import { Card, DocumentList, Icon, PageHeader, focusRing, type FactItem } from "./ui";

/**
 * Supplier asset page while the asset is in a tender (26 Nov): opened from the asset window.
 * Only what the brief holds for this asset. The tender stays the place to offer.
 */
export function SupplierTenderAsset({ t, assetKey }: { t: Tender; assetKey: string }) {
  const assets = assetsOf(t);
  const index = assets.findIndex((a) => a.key === assetKey);
  const asset = assets[index];
  const tenderHref = `/concept/supplier/tenders/${t.id}?tab=sites`;

  if (!asset) {
    return (
      <Shell tenderHref={tenderHref}>
        <PageHeader title="Asset not found" />
      </Shell>
    );
  }

  const grouped = asset.rows.length > 1 || Boolean(asset.rows[0].group);
  const sums = asset.rows.map((s) => homesKw(s.system));
  const totals = sums.every(Boolean)
    ? sums.reduce<[number, number]>((acc, x) => [acc[0] + x![0], acc[1] + x![1]], [0, 0])
    : null;
  const unit = t.unitWord === "building" ? "Buildings" : "Sites";
  const facts: FactItem[] = [
    { label: "Tender", value: t.title, href: tenderHref },
    { label: "Customer", value: t.customer },
    ...(grouped ? [{ label: unit, value: String(asset.rows.length) }] : [{ label: "System", value: asset.rows[0].system }]),
    ...(totals ? [{ label: "Homes", value: String(totals[0]) }, { label: "Heat load", value: `${totals[1]} kW` }] : []),
  ];
  const files = [...asset.rows.flatMap((s) => s.files), ...t.sharedDocs.filter((d) => d.name === "Brief")];
  const prev = assets[index - 1];
  const next = assets[index + 1];
  const pager = (key: string) => `/concept/supplier/tenders/${t.id}/assets/${encodeURIComponent(key)}`;

  return (
    <Shell tenderHref={tenderHref}>
      <PageHeader
        crumbs={[
          { label: "Tenders", href: "/concept/supplier/tenders" },
          { label: t.title, href: tenderHref },
          { label: asset.name },
        ]}
        crumbAside={
          <span className="flex items-center gap-3 p6 text-text-secondary">
            {prev && (
              <Link href={pager(prev.key)} className={cn("inline-flex items-center gap-1 hover:text-text-primary", focusRing)}>
                <Icon name="chevron-left" size={14} /> {prev.name}
              </Link>
            )}
            <span className="text-text-tertiary">
              {index + 1} of {assets.length} in this tender
            </span>
            {next && (
              <Link href={pager(next.key)} className={cn("inline-flex items-center gap-1 hover:text-text-primary", focusRing)}>
                {next.name} <Icon name="chevron-right" size={14} />
              </Link>
            )}
          </span>
        }
        kind="asset"
        title={asset.name}
        facts={facts}
      />
      <p className="-mt-2 mb-6 p6 text-text-secondary">{asset.address}</p>

      <div className="flex flex-col gap-4">
        {grouped && (
          <Card title={unit} bodyClassName="p-0">
            <div className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)_minmax(0,1.8fr)] gap-x-6 border-b border-border-light px-4 py-2 pl-8">
              <span className="s3 text-text-tertiary">{unit === "Buildings" ? "Building" : "Site"}</span>
              <span className="s3 text-text-tertiary">Size</span>
              <span className="s3 text-text-tertiary">Existing system</span>
            </div>
            {asset.rows.map((s, i) => {
              const note = (s.systemNote ?? "").replace(/^Existing:\s*/, "");
              const aside = note.match(/\(([^)]+)\)\s*$/)?.[1];
              const existing = aside ? note.replace(/\s*\([^)]+\)\s*$/, "") : note;
              return (
                <div
                  key={s.n}
                  className={cn(
                    "grid grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)_minmax(0,1.8fr)] gap-x-6 px-4 py-3 pl-8",
                    i < asset.rows.length - 1 && "border-b border-border-light",
                  )}
                >
                  <span className="h8 text-text-title">{s.name}</span>
                  <span className="p6 text-text-primary">{s.system}</span>
                  <span className="p6 text-text-primary">
                    {existing || "—"}
                    {aside && <span className="mt-0.5 block p7 text-text-secondary">{aside[0].toUpperCase() + aside.slice(1)}</span>}
                  </span>
                </div>
              );
            })}
          </Card>
        )}
        {files.length > 0 && (
          <Card title="Documents" bodyClassName="px-4 py-0">
            <DocumentList docs={files} />
          </Card>
        )}
      </div>
    </Shell>
  );
}

function Shell({ tenderHref, children }: { tenderHref: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg-container-grey">
      <header className="sticky top-0 z-40 border-b border-border-dark bg-white">
        <div className="mx-auto flex h-16 w-full max-w-screen-2xl items-center justify-between px-8">
          <Link href={tenderHref} className={cn("group inline-flex items-center gap-1.5 h8 text-text-primary", focusRing)}>
            <Icon name="arrow-left" size={16} />
            <span className="group-hover:underline group-hover:underline-offset-[3px]">Tender</span>
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-screen-2xl px-8 pb-28 pt-6">{children}</main>
    </div>
  );
}
