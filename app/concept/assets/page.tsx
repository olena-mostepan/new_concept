"use client";

import { Suspense } from "react";
import { Page } from "@/components/concept/ui";
import { Buildings } from "@/components/concept/Buildings";

export default function BuildingsPage() {
  return (
    <Suspense>
      <Page>
        <Buildings />
      </Page>
    </Suspense>
  );
}
