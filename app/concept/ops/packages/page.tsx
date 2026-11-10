import { Suspense } from "react";
import { Page } from "@/components/concept/ui";
import { WorkstreamsByBatch } from "@/components/concept/WorkstreamsByBatch";

export default function PackagesPage() {
  return (
    <Suspense>
      <Page>
        <WorkstreamsByBatch />
      </Page>
    </Suspense>
  );
}
