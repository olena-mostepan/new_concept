"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import * as Tabs from "@radix-ui/react-tabs";
import { getBuilding, getWorkstream, short } from "@/lib/concept/derive";
import {
  blockingCell,
  groupOf,
  opsIndicativeSteps,
  recCell,
  stepLabel,
} from "@/lib/concept/opsAssetDerive";
import {
  applyAssistantAttachAmHafen,
  applySaveValue,
  blockedCount,
  parseAssistantRoof,
  revertOpsChange,
} from "@/lib/concept/opsMutations";
import type { CheckItemState } from "@/lib/concept/checks";
import { checksFor } from "@/lib/concept/checks";
import { cn } from "@/lib/utils";
import { fixAssetsAction } from "@/lib/concept/words";
import {
  FilterChips,
  Page,
  TabDot,
  tabListClass,
  tabTriggerClass,
} from "../ui";
import { hrefs } from "../hrefs";
import { useConcept } from "../store";
import { useConceptI18n } from "../useConceptI18n";
import { useOpsDetailBar } from "./OpsDetailBarActions";
import { WorkstreamFrame, packagePrimaryTab } from "../WorkstreamChrome";
import { EstimatesPanel } from "../IndicativeWorkstream";
import { PackageOverviewSteps, packageCardChips } from "../PackageView";
import { opsTabsFor, type PackageTabId } from "../packageTabs";
import { service, type Workstream } from "@/lib/concept/model";
import type { PackageCardChip } from "../ui";
import { AssetWindow } from "./AssetWindow";
import { OpsAssetsTable } from "./OpsAssetsTable";
import {
  AssistantPanel,
  SelectionBar,
  UpdatedHighlight,
} from "./opsUi";

type Filter = "blocked" | "ready" | "all";

function opsDisplayChips(w: Workstream): PackageCardChip[] {
  const fromPhases = packageCardChips(w);
  if (fromPhases.length) return fromPhases;
  return [
    {
      id: w.service,
      label: service(w.service).label,
      lead: "now",
    },
  ];
}

export function OpsPackageView({ id }: { id: string }) {
  const {
    account,
    patchOpsBundle,
    startEstimatesForAssets,
    markOpsUpdated,
  } = useConcept();
  const { lang } = useConceptI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const bar = useOpsDetailBar();
  const w = getWorkstream(account, id);
  const [filter, setFilter] = useState<Filter>("all");
  const [expanded, setExpanded] = useState<string[]>([]);
  const [windowMode, setWindowMode] = useState<"fix" | "edit">("fix");
  const [selected, setSelected] = useState<string[]>([]);
  const [windowOpen, setWindowOpen] = useState(false);
  const [windowAsset, setWindowAsset] = useState<string | null>(null);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [assistantInput, setAssistantInput] = useState("");
  const [messages, setMessages] = useState<
    Array<{
      from: "me" | "assistant";
      text: string;
      note?: string;
      changes?: string[];
      onUndo?: () => void;
    }>
  >([]);

  useEffect(() => {
    bar?.registerAskAssistant(() => setAssistantOpen(true));
    return () => bar?.registerAskAssistant(null);
  }, [bar?.registerAskAssistant]);

  const tabs = w ? opsTabsFor(w) : [];
  const requested = searchParams.get("tab");
  const primary = w ? (packagePrimaryTab(w) as PackageTabId) : "overview";
  let tab: PackageTabId =
    !requested && w && tabs.some((item) => item.id === primary)
      ? primary
      : "overview";
  if (requested && tabs.some((item) => item.id === requested)) {
    tab = requested as PackageTabId;
  }
  const setTab = (next: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "overview") params.delete("tab");
    else params.set("tab", next);
    const qs = params.toString();
    router.replace(`${hrefs.opsPackage(id)}${qs ? `?${qs}` : ""}`, {
      scroll: false,
    });
  };

  const stepColumns = useMemo(
    () => (w ? opsIndicativeSteps(account, w) : []),
    [account, w],
  );

  const assetRows = useMemo(() => {
    if (!w) return [];
    const rows = w.projects.map((row) => {
      const bundle = account.opsAssetData?.[w.id]?.[row.buildingId];
      const building = getBuilding(account, row.buildingId);
      const grp = bundle
        ? groupOf(bundle, w.service, w.solution)
        : ("ready" as const);
      const block = bundle ? blockingCell(bundle, w.service, w.solution) : null;
      const rec = bundle ? recCell(bundle, w.service, w.solution) : null;
      const updated = account.opsUpdatedAssets?.[w.id]?.includes(
        row.buildingId,
      );
      const step = bundle ? stepLabel(bundle.projectStep) : stepLabel(row.step);
      const stepNode = updated ? (
        <UpdatedHighlight>{step}</UpdatedHighlight>
      ) : (
        step
      );
      return {
        id: row.buildingId,
        building,
        grp,
        block,
        rec,
        bundle,
        stepNode,
        selectable: grp === "blocked" || grp === "ready",
        blocked: grp === "blocked",
        sortDate: bundle?.blockedSince ?? "",
      };
    });
    const order = { blocked: 0, started: 1, ready: 2 };
    rows.sort(
      (a, b) =>
        order[a.grp] - order[b.grp] ||
        (a.grp === "blocked"
          ? days(a.sortDate) - days(b.sortDate)
          : 0),
    );
    return rows;
  }, [account, w]);

  if (!w) {
    return (
      <Page>
        <p className="h6 text-text-primary">Package not found</p>
      </Page>
    );
  }

  const blockedN = blockedCount(account, w);

  function days(d: string) {
    if (!d) return 0;
    return new Date(d).getTime();
  }

  const filtered = assetRows.filter((r) => {
    if (filter === "all") return true;
    if (filter === "blocked") return r.grp === "blocked";
    return r.grp === "ready";
  });

  const counts = {
    blocked: assetRows.filter((r) => r.grp === "blocked").length,
    ready: assetRows.filter((r) => r.grp === "ready").length,
    all: assetRows.length,
  };

  const openFix = (buildingId?: string) => {
    const first =
      buildingId ??
      assetRows.find((r) => r.grp === "blocked")?.id ??
      assetRows[0]?.id;
    if (first) {
      setWindowMode("fix");
      setWindowAsset(first);
      setWindowOpen(true);
    }
  };

  const onPatch = (buildingId: string, fn: Parameters<typeof patchOpsBundle>[2]) =>
    patchOpsBundle(w.id, buildingId, fn);

  const selectionHasBlocked = selected.some(
    (id) => assetRows.find((r) => r.id === id)?.grp === "blocked",
  );

  const bulkAction = () => {
    if (selectionHasBlocked) {
      openFix(selected.find((id) => assetRows.find((r) => r.id === id)?.blocked));
      return;
    }
    startEstimatesForAssets(w.id, selected);
    setSelected([]);
  };

  const sendAssistant = () => {
    const text = assistantInput.trim();
    if (!text) return;
    setMessages((m) => [...m, { from: "me", text }]);
    const parsed = parseAssistantRoof(text);
    if (parsed) {
      const row = assetRows.find((r) =>
        r.building?.name.toLowerCase().includes(parsed.assetQuery.toLowerCase()),
      );
      const roof = checksFor(w.service, w.solution).find((c) => c.key === "roof");
      if (row && roof) {
        let prior: CheckItemState | undefined;
        onPatch(row.id, (b) => {
          prior = JSON.parse(JSON.stringify(b.items.roof));
          applySaveValue(b, roof, parsed.value, "Typed", w, row.id);
        });
        markOpsUpdated(w.id, row.id, true);
        setFilter("all");
        const historyTitle = `${roof.name} added`;
        const snap = prior;
        setMessages((m) => [
          ...m,
          {
            from: "assistant",
            text: `Done for ${row.building?.name}.`,
            changes: [`Usable roof area: ${parsed.value} m²`],
            note:
              "Nothing is blocking it now. The change is in its History.",
            onUndo: () => {
              if (snap) {
                onPatch(row.id, (b) =>
                  revertOpsChange(b, "roof", snap, historyTitle),
                );
              }
              markOpsUpdated(w.id, row.id, false);
            },
          },
        ]);
      }
    } else {
      setMessages((m) => [
        ...m,
        {
          from: "assistant",
          text:
            "In this first version I can add a file to an asset or set a value. Try “Set Kelmsdorfer Straße 41 roof area to 610”.",
        },
      ]);
    }
    setAssistantInput("");
  };

  const currentTab = packagePrimaryTab(w);

  return (
    <div className={cn(assistantOpen && "mr-[min(400px,40vw)]")}>
      <Page>
        <WorkstreamFrame
          live={w}
          ops
          fix={
            blockedN > 0
              ? { count: blockedN, onClick: () => openFix() }
              : undefined
          }
        >
          <Tabs.Root value={tab} onValueChange={setTab}>
            <Tabs.List className={tabListClass} aria-label="Package">
              {tabs.map((item) => (
                <Tabs.Trigger
                  key={item.id}
                  value={item.id}
                  className={tabTriggerClass}
                >
                  <span className="inline-flex items-center gap-2">
                    {item.label}
                  </span>
                  {item.dot && (
                    <TabDot
                      label={
                        item.id === currentTab
                          ? "Current service"
                          : "New"
                      }
                    />
                  )}
                </Tabs.Trigger>
              ))}
            </Tabs.List>
          </Tabs.Root>

          {/* Ops work happens on the current service tab (and Overview): steps + Assets table. */}
          {(tab === "overview" || tab === currentTab) && (
            <>
              <PackageOverviewSteps
                account={account}
                w={w}
                columns={stepColumns}
                chips={opsDisplayChips(w)}
              />
              <OpsAssetsTable
                w={w}
                count={filtered.length}
                aside={
                  <FilterChips
                    options={[
                      { id: "blocked", label: "Blocked", count: counts.blocked },
                      { id: "ready", label: "Ready", count: counts.ready },
                      { id: "all", label: "All", count: counts.all },
                    ]}
                    value={filter}
                    onChange={(v) => setFilter(v as Filter)}
                  />
                }
                toolbar={
                  selected.length > 0 ? (
                    <SelectionBar
                      count={selected.length}
                      actionLabel={
                        selectionHasBlocked
                          ? fixAssetsAction(selected.length, lang)
                          : `Start estimates for ${selected.length}`
                      }
                      onAction={bulkAction}
                      onClear={() => setSelected([])}
                    />
                  ) : undefined
                }
                selected={selected}
                onSelectRow={(id, on) =>
                  setSelected((prev) =>
                    on ? [...prev, id] : prev.filter((x) => x !== id),
                  )
                }
                expanded={expanded}
                onToggle={(id) =>
                  setExpanded((prev) =>
                    prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
                  )
                }
                onFix={(id) => {
                  setWindowMode("fix");
                  openFix(id);
                }}
                onEdit={(id) => {
                  setWindowMode("edit");
                  setWindowAsset(id);
                  setWindowOpen(true);
                }}
                onOpen={(id) => router.push(hrefs.opsAsset(id, { package: w.id }))}
                empty={filter === "blocked" ? "Nothing is blocked" : "No assets here"}
                rows={filtered.map((r) => ({
                  id: r.id,
                  name: r.building?.name ?? r.id,
                  city: r.building?.city,
                  bundle: r.bundle,
                  step: r.stepNode,
                }))}
              />
            </>
          )}
          {tab === "estimates" && tab !== currentTab && <EstimatesPanel w={w} readOnly />}
        </WorkstreamFrame>
        <AssetWindow
          open={windowOpen}
          mode={windowMode}
          w={w}
          account={account}
          assetId={windowAsset ?? w.projects[0].buildingId}
          assetIds={windowMode === "edit" && windowAsset ? [windowAsset] : w.projects.map((p) => p.buildingId)}
          onSelectAsset={setWindowAsset}
          onClose={() => setWindowOpen(false)}
          onDone={() => setWindowOpen(false)}
          dirty={false}
          onCloseAttempt={() => true}
          showAll={() => {
            setWindowOpen(false);
            setFilter("all");
          }}
          onPatch={(fn) => {
            const bid = windowAsset ?? w.projects[0].buildingId;
            onPatch(bid, fn);
          }}
        />
        <AssistantPanel
          open={assistantOpen}
          scope={w.name}
          onClose={() => setAssistantOpen(false)}
          messages={messages}
          hint='Try: "Set Kelmsdorfer Straße 41 roof area to 610", or attach a file'
          input={assistantInput}
          onInputChange={setAssistantInput}
          onSend={sendAssistant}
        onAttach={() => {
          const row = assetRows.find((r) => r.id === "f6");
          if (!row) return;
          let prior: CheckItemState | undefined;
          let priorDrawings: CheckItemState | undefined;
          onPatch("f6", (b) => {
            prior = JSON.parse(JSON.stringify(b.items.roof));
            priorDrawings = JSON.parse(JSON.stringify(b.items.drawings));
            applyAssistantAttachAmHafen(b);
          });
          markOpsUpdated(w.id, "f6", true);
          setFilter("all");
          setMessages((m) => [
            ...m,
            {
              from: "assistant",
              text: `Added Dachplan_AmHafen.pdf to ${row.building?.name}.`,
              changes: [
                "Roof drawings · 1 file",
                "Usable roof area · 380 m² to confirm",
              ],
              note: "Press Use when the value is right.",
              onUndo: () => {
                if (prior && priorDrawings) {
                  onPatch("f6", (b) => {
                    revertOpsChange(b, "roof", prior!, "File added");
                    b.items.drawings = priorDrawings!;
                    b.files = b.files.filter(
                      (f) => f.name !== "Dachplan_AmHafen.pdf",
                    );
                  });
                }
                markOpsUpdated(w.id, "f6", false);
              },
            },
          ]);
        }}
        />
      </Page>
    </div>
  );
}
