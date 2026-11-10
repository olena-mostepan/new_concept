"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  getBatch,
  getBuilding,
  getWorkstream,
  short,
} from "@/lib/concept/derive";
import { checksFor } from "@/lib/concept/checks";
import { stepLabel } from "@/lib/concept/opsAssetDerive";
import { service as serviceDef } from "@/lib/concept/model";
import type { CheckItemState } from "@/lib/concept/checks";
import {
  Button,
  Card,
  DocumentList,
  Page,
  PageHeader,
  type FactItem,
} from "../ui";
import { hrefs } from "../hrefs";
import { useConcept } from "../store";
import { useOpsDetailBar } from "./OpsDetailBarActions";
import { AssetWindow } from "./AssetWindow";
import { AssistantPanel, StateMark } from "./opsUi";
const OPS_DEFAULT_PACKAGE = "solar-est-live";

export function OpsAssetView({ buildingId }: { buildingId: string }) {
  const { account, patchOpsBundle } = useConcept();
  const search = useSearchParams();
  const packageId = search.get("package") ?? OPS_DEFAULT_PACKAGE;
  const w = getWorkstream(account, packageId);
  const building = getBuilding(account, buildingId);
  const batch = w ? getBatch(account, w.batchId) : undefined;
  const bundle = w ? account.opsAssetData?.[w.id]?.[buildingId] : undefined;
  const [editOpen, setEditOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const bar = useOpsDetailBar();

  useEffect(() => {
    bar?.registerAskAssistant(() => setAssistantOpen(true));
    return () => bar?.registerAskAssistant(null);
  }, [bar]);

  if (!w || !building || !bundle) {
    return (
      <Page>
        <PageHeader title="Asset not found" />
      </Page>
    );
  }

  const defs = checksFor(w.service, w.solution);
  const valueFor = (item: CheckItemState | undefined) => {
    if (!item) return "—";
    if (item.state === "confirm" && item.found)
      return `${item.found.value} to confirm`;
    if (item.state === "disagree") return "Files disagree";
    if (item.state === "na") return "Not available";
    if (item.state === "done") return item.value ?? "—";
    return "—";
  };

  const facts: FactItem[] = [
    {
      label: "Package",
      value: w.name,
      href: hrefs.opsPackage(w.id),
    },
    { label: "In package", value: stepLabel(bundle.projectStep) },
    { label: "Batch", value: batch?.name ?? "—", href: batch ? hrefs.opsBatch(batch.id) : undefined },
    { label: "City", value: building.city },
  ];

  return (
    <Page>
      <PageHeader
        kind="asset"
        crumbs={[
          { label: "Overview", href: hrefs.ops },
          { label: batch?.name ?? "Batch", href: batch ? hrefs.opsBatch(batch.id) : hrefs.ops },
          { label: w.name, href: hrefs.opsPackage(w.id) },
          { label: building.name },
        ]}
        title={building.name}
        facts={facts}
        aside={
          bundle.blockedSince ? (
            <p className="p6 text-text-secondary">
              Blocked since {short(bundle.blockedSince)}
            </p>
          ) : undefined
        }
      />
      <Card className="mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-light px-5 py-4">
          <h2 className="h7 text-text-primary">
            Data for {serviceDef(w.service).label}
          </h2>
          <div className="flex gap-2">
            <Button type="secondary" size="default" icon="plus">
              Upload documents
            </Button>
            <Button
              type="secondary"
              size="default"
              icon="plus"
              onClick={() => setEditOpen(true)}
            >
              Edit data
            </Button>
          </div>
        </div>
        <motion className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-border-light">
                <th className="w-10 px-4 py-2" />
                <th className="px-4 py-2 text-left s3 text-text-tertiary">ITEM</th>
                <th className="px-4 py-2 text-left s3 text-text-tertiary">REQUIREMENT</th>
                <th className="px-4 py-2 text-left s3 text-text-tertiary">VALUE</th>
                <th className="px-4 py-2 text-left s3 text-text-tertiary">SOURCE</th>
              </tr>
            </thead>
            <tbody>
              {defs.map((def) => {
                const item = bundle.items[def.key];
                const mark =
                  item?.state === "done"
                    ? "done"
                    : item?.state === "na"
                      ? "na"
                      : "open";
                return (
                  <tr key={def.key} className="border-b border-border-light">
                    <td className="px-4 py-3">
                      <StateMark state={mark} />
                    </td>
                    <td className="px-4 py-3 h8 text-text-title">{def.name}</td>
                    <td className="px-4 py-3 p6 text-text-secondary">
                      {def.required ? "Required" : "Recommended"}
                    </td>
                    <td className="px-4 py-3 p6 text-text-primary">
                      {valueFor(item)}
                    </td>
                    <td className="px-4 py-3 p6 text-text-secondary">
                      {item?.source ?? "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </motion>
      </Card>
      <motion className="grid gap-6 lg:grid-cols-2">
        <Card title="Documents">
          <DocumentList
            readOnly
            docs={bundle.files.map((f) => ({
              name: f.name,
              type: f.type ?? "File",
              meta: f.what ?? "",
            }))}
          />
        </Card>
        <Card title="History">
          <ol className="divide-y divide-border-light px-5">
            {bundle.history.map((ev) => (
              <li key={`${ev.date}-${ev.title}`} className="py-3">
                <p className="h8 text-text-primary">{ev.title}</p>
                {ev.detail && (
                  <p className="p7 text-text-secondary">{ev.detail}</p>
                )}
                <p className="p7 text-text-tertiary">{ev.date}</p>
              </li>
            ))}
          </ol>
        </Card>
      </motion>
      <AssetWindow
        open={editOpen}
        mode="edit"
        w={w}
        account={account}
        assetId={buildingId}
        assetIds={[buildingId]}
        onSelectAsset={() => {}}
        onClose={() => setEditOpen(false)}
        onDone={() => setEditOpen(false)}
        dirty={false}
        onCloseAttempt={() => true}
        onPatch={(fn) => patchOpsBundle(w.id, buildingId, fn)}
      />
      <AssistantPanel
        open={assistantOpen}
        scope={w.name}
        onClose={() => setAssistantOpen(false)}
        messages={[]}
        hint='Try: "Set Kelmsdorfer Straße 41 roof area to 610"'
        input=""
        onInputChange={() => {}}
        onSend={() => {}}
        onAttach={() => {}}
      />
    </Page>
  );
}

function motion({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={className}>{children}</div>;
}
