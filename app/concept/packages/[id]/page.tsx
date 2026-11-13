"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";
import { getWorkstream } from "@/lib/concept/derive";
import { Page, PageHeader } from "@/components/concept/ui";
import { PackageView } from "@/components/concept/PackageView";
import { OpsPackageView } from "@/components/concept/ops-asset/OpsPackageView";
import { useConcept } from "@/components/concept/store";
import { useConceptI18n } from "@/components/concept/useConceptI18n";
import { useConceptMode } from "@/components/concept/useHrefs";

export default function WorkstreamPage() {
  return (
    <Suspense>
      <WorkstreamRoute />
    </Suspense>
  );
}

function WorkstreamRoute() {
  const { id } = useParams<{ id: string }>();
  const { account } = useConcept();
  const mode = useConceptMode();
  const { t, words } = useConceptI18n();
  const w = getWorkstream(account, id);
  if (!w)
    return (
      <Page>
        <PageHeader title={t("{0} not found", words.Package)} />
      </Page>
    );
  // Ops: the same package page, plus the asset checklist where Ops has data for it (Estimates).
  if (mode === "ops" && account.opsAssetData?.[w.id]) return <OpsPackageView id={w.id} />;
  return <PackageView w={w} />;
}
