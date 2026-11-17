"use client";

import { useEffect, useState } from "react";
import { checksFor, type CheckItemState } from "@/lib/concept/checks";
import { opsItemSubline } from "@/lib/concept/opsDisplay";
import { service as serviceDef, type Workstream } from "@/lib/concept/model";
import { cn } from "@/lib/utils";
import { Button, Card } from "../ui";
import { useConcept } from "../store";
import { useOpsDetailBar } from "./OpsDetailBarActions";
import { AssetWindow } from "./AssetWindow";
import { AssistantPanel, StateMark } from "./opsUi";

/**
 * Ops part of the asset page: the data this asset needs for the package's service,
 * with Upload documents / Edit data (the Edit asset data workspace) and the assistant.
 * Shown on the shared asset page in the Ops version, under the package card.
 */
export function OpsAssetData({ w, buildingId, buildingName }: { w: Workstream; buildingId: string; buildingName: string }) {
  const { account, patchOpsBundle } = useConcept();
  const bundle = account.opsAssetData?.[w.id]?.[buildingId];
  const [editOpen, setEditOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const bar = useOpsDetailBar();

  useEffect(() => {
    bar?.registerAskAssistant(() => setAssistantOpen(true));
    return () => bar?.registerAskAssistant(null);
  }, [bar?.registerAskAssistant]);

  if (!bundle) return null;
  const defs = checksFor(w.service, w.solution);

  const valueFor = (item: CheckItemState | undefined, def: (typeof defs)[0]) => {
    if (!item) return "—";
    if (item.state === "confirm" && item.found) return `${item.found.value} to confirm`;
    if (item.state === "disagree") return "Files disagree";
    if (item.state === "na") return "Not available";
    if (item.state === "done") return def.file ? "1 file" : item.value ?? "—";
    return opsItemSubline(def, item) || "—";
  };

  return (
    <>
      <Card
        title={`Data for ${serviceDef(w.service).label}`}
        right={
          <div className="flex gap-2">
            <Button type="secondary" size="default" icon="upload" onClick={() => setEditOpen(true)}>
              Upload documents
            </Button>
            <Button type="secondary" size="default" icon="edit" onClick={() => setEditOpen(true)}>
              Edit data
            </Button>
          </div>
        }
        bodyClassName="p-0"
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse">
            <colgroup>
              <col className="w-[52px]" />
              <col className="w-[28%]" />
              <col className="w-[18%]" />
              <col className="w-[22%]" />
              <col />
            </colgroup>
            <thead>
              <tr className="border-b border-border-light">
                <th />
                {["Item", "Requirement", "Value", "Source"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left align-middle s3 text-text-tertiary">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {defs.map((def, i) => {
                const item = bundle.items[def.key];
                const mark =
                  item?.state === "done" || (item?.state === "edit" && item.prev?.state === "done")
                    ? "done"
                    : item?.state === "na"
                      ? "na"
                      : "open";
                const source =
                  item?.state === "confirm" && item.found
                    ? `${item.found.file}${item.found.page != null ? `, page ${item.found.page}` : ""}`
                    : item?.state === "done"
                      ? item.source
                      : undefined;
                return (
                  <tr key={def.key} className={cn("h-14", i < defs.length - 1 && "border-b border-border-light")}>
                    <td className="py-3 pl-4 align-middle">
                      <span className="flex items-center">
                        <StateMark state={mark} size={20} />
                      </span>
                    </td>
                    <td className="px-4 py-3 align-middle h8 text-text-title">{def.name}</td>
                    <td className="px-4 py-3 align-middle p6 text-text-secondary">
                      {def.required ? "Required" : "Recommended"}
                    </td>
                    <td className="px-4 py-3 align-middle p6 text-text-primary">{valueFor(item, def)}</td>
                    <td className="px-4 py-3 align-middle p6 text-text-secondary">{source ?? "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

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
        scope={buildingName}
        onClose={() => setAssistantOpen(false)}
        messages={[]}
        hint='Try: "Set Kelmsdorfer Straße 41 roof area to 610"'
        input=""
        onInputChange={() => {}}
        onSend={() => {}}
        onAttach={() => {}}
      />
    </>
  );
}
