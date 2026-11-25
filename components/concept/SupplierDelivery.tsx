"use client";

import Link from "next/link";
import { useState } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";
import { getJobDelivery } from "@/lib/supplier/delivery/job-mock-data";
import { SupplierDeliveryView } from "@/components/supplier/delivery/SupplierDeliveryView";
import { SupplierJobDeliveryPanel } from "@/components/supplier/delivery/SupplierJobDeliveryView";
import { SupplierHeader } from "./SupplierTenders";
import { SupplierDeliveryTab } from "./SupplierDeliveryDs";
import { DELIVERY_DS_LOOK } from "./SupplierDeliveryListDs";
import { Icon, PageHeader, focusRing, tabListClass, tabTriggerClass, type FactItem } from "./ui";

/**
 * Supplier concept · Delivery (25 Nov). Today's Delivery list (data, review flow, windows) drawn in the design system;
 * a job opens the asset page below.
 */
export function SupplierDelivery() {
  return (
    <div className="min-h-screen bg-bg-container-grey">
      <SupplierHeader active="delivery" />
      <main className="mx-auto w-full max-w-screen-2xl px-6 pb-28 pt-8 sm:px-8 lg:px-10">
        <PageHeader title="Delivery" />
        <SupplierDeliveryView look={DELIVERY_DS_LOOK} />
      </main>
    </div>
  );
}

/**
 * Supplier asset page (C17): today's job page with the design system's header.
 * One asset × one solution, the same record as the customer's asset in a Delivery package.
 * Tabs: only those with content (Delivery today; Survey and Contract when they hold something).
 * The Delivery tab keeps today's panel's state and modals, drawn in the design system.
 */
export function SupplierAsset({ id }: { id: string }) {
  const job = getJobDelivery(id);
  const [tab, setTab] = useState("delivery");
  if (!job) {
    return (
      <div className="min-h-screen bg-bg-container-grey">
        <DeliveryBar />
        <main className="mx-auto w-full max-w-screen-2xl px-8 pt-6">
          <PageHeader title="Asset not found" />
        </main>
      </div>
    );
  }
  const facts: FactItem[] = [
    { label: "Solution", value: job.solution },
    ...(job.overview.sizeOfInstallation ? [{ label: "Size", value: job.overview.sizeOfInstallation }] : []),
    { label: "Customer", value: job.customer.name },
    ...(job.location ? [{ label: "City", value: job.location }] : []),
  ];
  const photo = job.overview.photoUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={job.overview.photoUrl} alt="" className="h-[164px] w-[260px] shrink-0 rounded-[10px] object-cover" />
  ) : undefined;
  return (
    <div className="min-h-screen bg-bg-container-grey">
      <DeliveryBar />
      <main className="mx-auto w-full max-w-screen-2xl px-8 pb-28 pt-6">
        <PageHeader
          crumbs={[{ label: "Delivery", href: "/concept/supplier/delivery" }, { label: job.property }]}
          kind="asset"
          title={job.property}
          facts={facts}
          aside={photo}
        />
        <Tabs.Root value={tab} onValueChange={setTab}>
          <Tabs.List className={tabListClass} aria-label="Asset sections">
            <Tabs.Trigger value="delivery" className={tabTriggerClass}>
              Delivery
            </Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="delivery" className="mt-6 outline-none">
            <SupplierJobDeliveryPanel jobId={job.id} render={(api) => <SupplierDeliveryTab {...api} />} />
          </Tabs.Content>
        </Tabs.Root>
      </main>
    </div>
  );
}

/** Detail pages: Back to Delivery, the avatar on the right (as the tender page's bar). */
function DeliveryBar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border-dark bg-white">
      <div className="mx-auto flex h-16 w-full max-w-screen-2xl items-center justify-between px-8">
        <Link
          href="/concept/supplier/delivery"
          className={cn("group inline-flex items-center gap-1.5 h8 text-text-primary", focusRing)}
        >
          <Icon name="arrow-left" size={16} />
          <span className="group-hover:underline group-hover:underline-offset-[3px]">Delivery</span>
        </Link>
        <span
          aria-label="Account"
          className="inline-flex size-8 items-center justify-center rounded-full bg-black-7 h9 text-white"
        >
          A
        </span>
      </div>
    </header>
  );
}
