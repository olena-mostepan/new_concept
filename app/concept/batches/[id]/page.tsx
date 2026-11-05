"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";
import { getBatch, solutionName, wsIn } from "@/lib/concept/derive";
import type { Batch } from "@/lib/concept/model";
import { ChangedKey, Page, PageHeader } from "@/components/concept/ui";
import { BatchView } from "@/components/concept/BatchView";
import { hrefs } from "@/components/concept/hrefs";
import { useConcept } from "@/components/concept/store";

function batchSolutions(account: Parameters<typeof wsIn>[0], batch: Batch) {
  const seen = new Set<string>();
  const solutions: string[] = [];
  for (const stream of wsIn(account, batch.id).filter(
    (item) => !item.proposed,
  )) {
    if (seen.has(stream.solution)) continue;
    seen.add(stream.solution);
    solutions.push(solutionName(stream.solution));
  }
  return solutions.join(", ");
}

function batchFacts(
  account: Parameters<typeof wsIn>[0],
  batch: Batch,
): Array<{ label: string; value: string }> {
  const packages = wsIn(account, batch.id).filter((item) => !item.proposed)
    .length;
  const facts: Array<{ label: string; value: string }> = [
    { label: "Goal", value: batch.goal },
    { label: "Assets", value: String(batch.buildingIds.length) },
    { label: "Packages", value: String(packages) },
  ];
  const solutions = batchSolutions(account, batch);
  if (solutions) facts.splice(1, 0, { label: "Solution", value: solutions });
  if (batch.target)
    facts.push({ label: "Target", value: batch.target });
  return facts;
}

export default function BatchPage() {
  const { id } = useParams<{ id: string }>();
  const { account } = useConcept();
  const b = getBatch(account, id);
  if (!b || b.planState === "draft") {
    return (
      <Page>
        <PageHeader
          crumbs={[{ label: "Overview", href: hrefs.overview }]}
          title={b?.name ?? "Batch"}
          meta="This batch isn't shared with the customer yet. It appears here once ops propose the plan."
        />
      </Page>
    );
  }
  return (
    <Page>
      <PageHeader
        crumbs={[
          { label: "Overview", href: hrefs.overview },
          { label: b.name },
        ]}
        kind="batch"
        title={b.name}
        facts={batchFacts(account, b)}
        actions={<ChangedKey className="p7 text-text-secondary" />}
      />
      <Suspense>
        <BatchView account={account} batch={b} variant="page" />
      </Suspense>
    </Page>
  );
}
