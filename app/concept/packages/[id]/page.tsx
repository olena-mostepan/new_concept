"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";
import { getWorkstream } from "@/lib/concept/derive";
import { Page, PageHeader } from "@/components/concept/ui";
import { PackageView } from "@/components/concept/PackageView";
import { useConcept } from "@/components/concept/store";
import { WORDS } from "@/lib/concept/words";

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
  const w = getWorkstream(account, id);
  if (!w)
    return (
      <Page>
        <PageHeader title={`${WORDS.Package} not found`} />
      </Page>
    );
  return <PackageView w={w} />;
}
