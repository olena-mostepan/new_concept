"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";
import { getBatch, solutionName, wsInAll } from "@/lib/concept/derive";
import type { Batch } from "@/lib/concept/model";
import { Page, PageHeader } from "@/components/concept/ui";
import { BatchView } from "@/components/concept/BatchView";
import { useConceptMode, useHrefs } from "@/components/concept/useHrefs";
import { OpsBatch } from "@/components/concept/OpsBatch";
import { useConcept } from "@/components/concept/store";
import { useConceptI18n } from "@/components/concept/useConceptI18n";

function batchSolutions(
  account: Parameters<typeof wsInAll>[0],
  batch: Batch,
  lang: import("@/lib/concept/i18n").Lang,
) {
  const seen = new Set<string>();
  const solutions: string[] = [];
  for (const stream of wsInAll(account, batch.id).filter(
    (item) => !item.proposed,
  )) {
    if (seen.has(stream.solution)) continue;
    seen.add(stream.solution);
    solutions.push(solutionName(stream.solution, lang));
  }
  return solutions.join(", ");
}

function batchFacts(
  account: Parameters<typeof wsInAll>[0],
  batch: Batch,
  lang: import("@/lib/concept/i18n").Lang,
  t: (en: string, ...args: unknown[]) => string,
  words: { Assets: string; Packages: string },
): Array<{ label: string; value: string }> {
  const packages = wsInAll(account, batch.id).filter((item) => !item.proposed)
    .length;
  const facts: Array<{ label: string; value: string }> = [
    { label: t("Goal"), value: batch.goal },
    { label: words.Assets, value: String(batch.buildingIds.length) },
    { label: words.Packages, value: String(packages) },
  ];
  const solutions = batchSolutions(account, batch, lang);
  if (solutions) facts.splice(1, 0, { label: t("Solution"), value: solutions });
  if (batch.target)
    facts.push({ label: t("Target"), value: batch.target });
  return facts;
}

function CustomerBatchPage() {
  const hrefs = useHrefs();
  const { id } = useParams<{ id: string }>();
  const { account } = useConcept();
  const { lang, t, words } = useConceptI18n();
  const b = getBatch(account, id);
  if (!b || b.planState === "draft") {
    return (
      <Page>
        <PageHeader
          crumbs={[{ label: t("Overview"), href: hrefs.overview }]}
          title={b?.name ?? t("Batch")}
          meta={t(
            "This batch isn't shared with the customer yet. It appears here once ops propose the plan.",
          )}
        />
      </Page>
    );
  }
  return (
    <Page>
      <PageHeader
        crumbs={[
          { label: t("Overview"), href: hrefs.overview },
          { label: b.name },
        ]}
        kind="batch"
        title={b.name}
        facts={batchFacts(account, b, lang, t, words)}
        changedKey
      />
      <Suspense>
        <BatchView account={account} batch={b} variant="page" />
      </Suspense>
    </Page>
  );
}

/** Ops (main prototype): the batch with its plan and packages. Customer version: the customer's batch page. */
export default function BatchPage() {
  const mode = useConceptMode();
  const { id } = useParams<{ id: string }>();
  if (mode === "ops") {
    return (
      <Suspense>
        <OpsBatch id={id} />
      </Suspense>
    );
  }
  return <CustomerBatchPage />;
}
