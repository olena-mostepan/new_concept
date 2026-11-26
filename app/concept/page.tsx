"use client";

import { customerBatches } from "@/lib/concept/derive";
import { Page, PageHeader } from "@/components/concept/ui";
import { MatureDashboard } from "@/components/concept/dashboard";
import { BatchView, PilotRail } from "@/components/concept/BatchView";
import { useConcept } from "@/components/concept/store";
import { useConceptI18n } from "@/components/concept/useConceptI18n";

export default function ConceptPortfolio() {
  const { account } = useConcept();
  const { t } = useConceptI18n();
  const batches = customerBatches(account);
  const pilot = account.kind === "pilot" && batches.length === 1;
  if (pilot && batches[0]) {
    // Pilot: what the batch is about in a white column at the page edge, the work on the right.
    return (
      // Same left and right edges as the header above (max-w-screen-2xl, 40 each side on large screens).
      <div className="mx-auto flex w-full max-w-screen-2xl flex-col gap-8 lg:flex-row lg:items-stretch lg:px-10">
        <PilotRail account={account} batch={batches[0]} />
        <div className="min-w-0 flex-1 px-6 pt-8 sm:px-8 lg:px-0">
          <PageHeader title={t("Welcome back, {0}", account.user)} />
          <BatchView account={account} batch={batches[0]} variant="dashboard" />
        </div>
      </div>
    );
  }
  return (
    <Page>
      <PageHeader title={t("Welcome back, {0}", account.user)} />
      {pilot && batches[0] ? (
        <BatchView account={account} batch={batches[0]} variant="dashboard" />
      ) : (
        <MatureDashboard account={account} />
      )}
    </Page>
  );
}
