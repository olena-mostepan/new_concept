"use client";

import { customerBatches } from "@/lib/concept/derive";
import { Page, PageHeader } from "@/components/concept/ui";
import { MatureDashboard } from "@/components/concept/dashboard";
import { BatchView } from "@/components/concept/BatchView";
import { useConcept } from "@/components/concept/store";
import { useConceptI18n } from "@/components/concept/useConceptI18n";

export default function ConceptPortfolio() {
  const { account } = useConcept();
  const { t } = useConceptI18n();
  const batches = customerBatches(account);
  const pilot = account.kind === "pilot" && batches.length === 1;
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
