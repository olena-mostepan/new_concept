"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import * as Tabs from "@radix-ui/react-tabs";
import {
  getBatch,
  getBuilding,
  getWorkstream,
  short,
} from "@/lib/concept/derive";
import { checksFor } from "@/lib/concept/checks";
import { blockingCell, opsIndicativeSteps, stepLabel } from "@/lib/concept/opsAssetDerive";
import { opsItemSubline } from "@/lib/concept/opsDisplay";
import { service as serviceDef } from "@/lib/concept/model";
import type { CheckItemState } from "@/lib/concept/checks";
import {
  Button,
  Card,
  ChipTrack,
  IconButton,
  ServiceIcon,
  Timeline,
  Page,
  PageHeader,
  PackageCard,
  TabDot,
  tabListClass,
  tabTriggerClass,
  type FactItem,
  type PackageCardChip,
} from "../ui";
import { hrefs } from "../hrefs";
import { useConcept } from "../store";
import { useOpsDetailBar } from "./OpsDetailBarActions";
import { AssetWindow } from "./AssetWindow";
import { AssetFileList, AssistantPanel, StateMark } from "./opsUi";
import { packagePrimaryTab } from "../WorkstreamChrome";
import { PackageOverviewSteps, packageCardChips } from "../PackageView";
import { opsTabsFor, type PackageTabId } from "../packageTabs";

const OPS_DEFAULT_PACKAGE = "solar-est-live";

export function OpsAssetView({ buildingId }: { buildingId: string }) {
  const { account, patchOpsBundle } = useConcept();
  const router = useRouter();
  const search = useSearchParams();
  const packageId = search.get("package") ?? OPS_DEFAULT_PACKAGE;
  const w = getWorkstream(account, packageId);
  const building = getBuilding(account, buildingId);
  const batch = w ? getBatch(account, w.batchId) : undefined;
  const bundle = w ? account.opsAssetData?.[w.id]?.[buildingId] : undefined;
  const project = w?.projects.find((p) => p.buildingId === buildingId);
  const [editOpen, setEditOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const bar = useOpsDetailBar();

  useEffect(() => {
    bar?.registerAskAssistant(() => setAssistantOpen(true));
    return () => bar?.registerAskAssistant(null);
  }, [bar?.registerAskAssistant]);

  const tabs = w ? opsTabsFor(w) : [];
  const requested = search.get("tab");
  const primary = w ? (packagePrimaryTab(w) as PackageTabId) : "overview";
  let tab: PackageTabId =
    !requested && w && tabs.some((item) => item.id === primary)
      ? primary
      : "overview";
  if (requested && tabs.some((item) => item.id === requested)) {
    tab = requested as PackageTabId;
  }

  const stepColumns = useMemo(
    () => (w ? opsIndicativeSteps(account, w) : []),
    [account, w],
  );

  const chips: PackageCardChip[] = w
    ? packageCardChips(w).length
      ? packageCardChips(w)
      : [{ id: w.service, label: serviceDef(w.service).label, lead: "now" }]
    : [];

  if (!w || !building || !bundle) {
    return (
      <Page>
        <PageHeader title="Asset not found" />
      </Page>
    );
  }

  const defs = checksFor(w.service, w.solution);

  const valueFor = (item: CheckItemState | undefined, def: (typeof defs)[0]) => {
    if (!item) return "—";
    if (item.state === "confirm" && item.found)
      return `${item.found.value} to confirm`;
    if (item.state === "disagree") return "Files disagree";
    if (item.state === "na") return "Not available";
    if (item.state === "done") {
      // File items: the Source column names the file, so the value is just the count.
      if (def.file) return "1 file";
      return item.value ?? "—";
    }
    return opsItemSubline(def, item) || "—";
  };

  const inPackage = project?.joined?.on
    ? `Since ${short(project.joined.on)}`
    : w.startedOn
      ? `Since ${short(w.startedOn)}`
      : "—";

  const facts: FactItem[] = [
    {
      label: "Package",
      value: (
        <Link
          href={hrefs.opsPackage(w.id)}
          className="p6 text-text-primary underline decoration-border-dark underline-offset-[3px]"
        >
          {w.name}
        </Link>
      ),
    },
    { label: "In package", value: inPackage },
    {
      label: "Batch",
      value: batch?.name ?? "—",
      href: batch ? hrefs.opsBatch(batch.id) : undefined,
    },
    { label: "City", value: building.city },
  ];

  const setTab = (next: string) => {
    const params = new URLSearchParams(search.toString());
    if (next === "overview") params.delete("tab");
    else params.set("tab", next);
    const qs = params.toString();
    router.replace(
      `${hrefs.opsAsset(buildingId, { package: w.id })}${qs ? `?${qs}` : ""}`,
      { scroll: false },
    );
  };

  return (
    <Page>
      <PageHeader
        kind="asset"
        crumbs={[
          { label: "Overview", href: hrefs.ops },
          {
            label: batch?.name ?? "Batch",
            href: batch ? hrefs.opsBatch(batch.id) : hrefs.ops,
          },
          { label: w.name, href: hrefs.opsPackage(w.id) },
          { label: building.name },
        ]}
        title={building.name}
        facts={facts}
      />

      <Tabs.Root value={tab} onValueChange={setTab}>
        <Tabs.List className={tabListClass} aria-label="Package">
          {tabs.map((item) => (
            <Tabs.Trigger
              key={item.id}
              value={item.id}
              className={tabTriggerClass}
            >
              {item.label}
              {item.dot && (
                <TabDot label="Current service" />
              )}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
      </Tabs.Root>

      <div className="mt-6 space-y-6">
        {/* Ops work happens on the current service tab (and Overview): package card + Data card. */}
        {(tab === "overview" || tab === packagePrimaryTab(w)) && (
          <>
            <PackageCard
              packageName={w.name}
              chips={chips}
              asideContent={
                <div className="flex shrink-0 items-center gap-6">
                  <div className="flex items-center gap-4">
                    <ServiceIcon service={w.service} size={72} className="shrink-0" />
                    <div className="min-w-0">
                      <p className="p7 text-text-tertiary">This asset is in</p>
                      <p className="h4 text-text-primary">{serviceDef(w.service).label}</p>
                    </div>
                  </div>
                  <Button
                    type="strong"
                    size="large"
                    icon="chevron-right"
                    iconPosition="right"
                    href={hrefs.opsPackage(w.id)}
                    ariaLabel={`Open ${w.name}`}
                  >
                    Open package
                  </Button>
                </div>
              }
              panelTitle={`${serviceDef(w.service).label} for this asset`}
              panelAside={
                bundle.blockedSince
                  ? `Blocked since ${short(bundle.blockedSince)}`
                  : bundle.estimateStartedOn
                    ? `Started ${short(bundle.estimateStartedOn)}`
                    : undefined
              }
              panelChildren={
                <ChipTrack
                  steps={serviceDef(w.service).steps.map((label, i) => {
                    const lead: "done" | "now" | "next" =
                      bundle.projectStep > i ? "done" : bundle.projectStep === i ? "now" : "next";
                    const block = blockingCell(bundle, w.service, w.solution);
                    const note =
                      lead !== "now"
                        ? ""
                        : bundle.stepLineOverride ??
                          (block
                            ? `${block.item} · ${block.state}`
                            : i === 0
                              ? "Ready for Estimate"
                              : bundle.estimateStartedOn
                                ? `since ${short(bundle.estimateStartedOn)}`
                                : "");
                    return {
                      key: label,
                      lead,
                      label,
                      notes: note ? [{ text: note, className: "p7 text-text-secondary" }] : [],
                    };
                  })}
                />
              }
            />
            <Card>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-light px-5 py-4">
                <h2 className="h7 text-text-primary">
                  Data for {serviceDef(w.service).label}
                </h2>
                <div className="flex gap-2">
                  <Button type="secondary" size="default" icon="upload" onClick={() => setEditOpen(true)}>
                    Upload documents
                  </Button>
                  <Button
                    type="secondary"
                    size="default"
                    icon="edit"
                    onClick={() => setEditOpen(true)}
                  >
                    Edit data
                  </Button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px]">
                  <thead>
                    <tr className="border-b border-border-light">
                      <th className="w-10 px-4 py-2" />
                      <th className="px-4 py-2 text-left s3 text-text-tertiary">
                        ITEM
                      </th>
                      <th className="px-4 py-2 text-left s3 text-text-tertiary">
                        REQUIREMENT
                      </th>
                      <th className="px-4 py-2 text-left s3 text-text-tertiary">
                        VALUE
                      </th>
                      <th className="px-4 py-2 text-left s3 text-text-tertiary">
                        SOURCE
                      </th>
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
                            <StateMark state={mark} size={20} />
                          </td>
                          <td className="px-4 py-3 h8 text-text-title">
                            {def.name}
                          </td>
                          <td className="px-4 py-3 p6 text-text-secondary">
                            {def.required ? "Required" : "Recommended"}
                          </td>
                          <td className="px-4 py-3 p6 text-text-primary">
                            {valueFor(item, def)}
                          </td>
                          <td className="px-4 py-3 p6 text-text-secondary">
                            {item?.source ?? "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}
        {tab === "estimates" && tab !== packagePrimaryTab(w) && (
          <PackageOverviewSteps account={account} w={w} columns={stepColumns} />
        )}
      </div>

      <div className="mt-6 grid gap-6 pb-12 lg:grid-cols-2">
        <Card title="History">
          {bundle.history.length ? (
            <Timeline
              items={bundle.history.map((ev) => ({
                event: ev.title,
                detail: ev.detail,
                date: short(ev.date),
                year: "2026",
              }))}
            />
          ) : (
            <p className="p6 text-text-secondary">Nothing yet</p>
          )}
        </Card>
        <Card title="Documents">
          <AssetFileList files={bundle.files} empty="No documents yet" />
        </Card>
      </div>

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
        scope={building.name}
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
