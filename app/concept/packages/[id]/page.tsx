"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";
import { getWorkstream } from "@/lib/concept/derive";
import { Page, PageHeader } from "@/components/concept/ui";
import { PackageView } from "@/components/concept/PackageView";
import { useConcept } from "@/components/concept/store";
import { useConceptI18n } from "@/components/concept/useConceptI18n";

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
  const { t, words } = useConceptI18n();
  const w = getWorkstream(account, id);
  if (!w)
    return (
      <Page>
        <PageHeader title={t("{0} not found", words.Package)} />
      </Page>
    );
  return <PackageView w={w} />;
}
