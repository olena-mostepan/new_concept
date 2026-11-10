"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getBatch, getBuilding, getWorkstream, short } from "@/lib/concept/derive";
import {
  blockingCell,
  groupOf,
  recCell,
  stepLabel,
} from "@/lib/concept/opsAssetDerive";
import { blockedCount, parseAssistantRoof, applySaveValue } from "@/lib/concept/opsMutations";
import { checksFor } from "@/lib/concept/checks";
import { service as serviceDef } from "@/lib/concept/model";
import { cn } from "@/lib/utils";
import { Chip, FilterChips, Page, PageHeader } from "../ui";
import { hrefs } from "../hrefs";
import { useConcept } from "../store";
import { useOpsDetailBar } from "./OpsDetailBarActions";
import { WorkstreamFrame, serviceChips } from "../WorkstreamChrome";
import { packagePrimaryTab } from "../packageTabs";
import { AssetWindow } from "./AssetWindow";
import {
  AssistantPanel,
  BlockingCellContent,
  OpsDataTable,
  OpsFixStatusCard,
  RecCellContent,
  SelectionBar,
  UpdatedHighlight,
} from "./opsUi";

type Filter = "blocked" | "ready" | "all";

export function OpsPackageView({ id }: { id: string }) {
  const { account, patchOpsBundle, startEstimatesForAssets, markOpsUpdated } =
    useConcept();
  const router = useRouter();
  const bar = useOpsDetailBar();
  const w = getWorkstream(account, id);
  const [filter, setFilter] = useState<Filter>("blocked");
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
  }, [bar]);

  if (!w) {
    return (
      <Page>
        <PageHeader title="Package not found" />
      </Page>
    );
  }

  const batch = getBatch(account, w.batchId);
  const blockedN = blockedCount(account, w);
  const assetRows = useMemo(() => {
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
        onPatch(row.id, (b) =>
          applySaveValue(b, roof, parsed.value, "Typed", w, row.id),
        );
        markOpsUpdated(w.id, row.id, true);
        setFilter("all");
        setMessages((m) => [
          ...m,
          {
            from: "assistant",
            text: `Done for ${row.building?.name}.`,
            changes: [`Usable roof area: ${parsed.value} m²`],
            note:
              "Nothing is blocking it now. The change is in its History.",
            onUndo: () => markOpsUpdated(w.id, row.id, false),
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

  const crumbs = [
    { label: "Overview", href: hrefs.ops },
    { label: batch?.name ?? "Batch", href: batch ? hrefs.opsBatch(batch.id) : hrefs.ops },
    { label: w.name },
  ];

  return (
    <div className={cn(assistantOpen && "mr-[min(400px,40vw)]")}>
    <Page>
      <PageHeader
        crumbs={crumbs}
        kind="package"
        title={w.name}
        facts={[
          { label: "Batch", value: batch?.name ?? "—", href: batch ? hrefs.opsBatch(batch.id) : undefined },
          { label: "Solution", value: "Solar PV" },
          { label: "Assets", value: String(w.projects.length) },
        ]}
        aside={
          <OpsFixStatusCard
            serviceLabel={serviceDef(w.service).label}
            blocked={blockedN}
            onFix={() => openFix()}
          />
        }
      />
      <WorkstreamFrame live={w}>
        <div className="mb-6 flex flex-wrap gap-2">
          {serviceChips(w).map((chip) => (
            <Chip key={chip.label} lead={chip.lead} size="big">
              {chip.label}
            </Chip>
          ))}
        </div>
        <OpsDataTable
          title="Assets"
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
                    ? `Fix ${selected.length} assets`
                    : `Start estimates for ${selected.length}`
                }
                onAction={bulkAction}
                onClear={() => setSelected([])}
              />
            ) : undefined
          }
          selectable
          selected={selected}
          onSelectRow={(id, on) =>
            setSelected((prev) =>
              on ? [...prev, id] : prev.filter((x) => x !== id),
            )
          }
          columns={[
            { key: "asset", label: "ASSET" },
            { key: "step", label: "STEP" },
            { key: "blocking", label: "BLOCKING THE NEXT STEP" },
            { key: "rec", label: "RECOMMENDED, MISSING" },
            { key: "since", label: "BLOCKED SINCE" },
          ]}
          rows={filtered.map((r) => ({
            id: r.id,
            selectable: r.selectable,
            blocked: r.blocked,
            asset: (
              <div>
                <p className="h8 text-text-title">{r.building?.name}</p>
                <p className="p7 text-text-tertiary">{r.building?.city}</p>
              </div>
            ),
            step: r.stepNode,
            blocking: r.block ? (
              <BlockingCellContent
                item={r.block.item}
                state={r.block.state}
                detail={r.block.detail}
              />
            ) : (
              <span className="p6 text-text-tertiary">—</span>
            ),
            rec: r.rec ? (
              <RecCellContent count={r.rec.count} names={r.rec.names} />
            ) : (
              <span className="p6 text-text-tertiary">—</span>
            ),
            since: r.bundle?.blockedSince ? (
              <span className="p6 text-text-secondary">
                {short(r.bundle.blockedSince)}
              </span>
            ) : (
              <span className="p6 text-text-tertiary">—</span>
            ),
          }))}
          onRowClick={(id, blocked) => {
            if (selected.length) return;
            if (blocked) openFix(id);
            else router.push(hrefs.opsAsset(id, { package: w.id }));
          }}
        />
      </WorkstreamFrame>
      <AssetWindow
        open={windowOpen}
        mode="fix"
        w={w}
        account={account}
        assetId={windowAsset ?? w.projects[0].buildingId}
        assetIds={w.projects.map((p) => p.buildingId)}
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
          const id = windowAsset ?? w.projects[0].buildingId;
          onPatch(id, fn);
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
          setMessages((m) => [
            ...m,
            {
              from: "assistant",
              text: "Attached file added. Values stay to confirm until Ops press Use.",
            },
          ]);
        }}
      />
    </Page>
    </div>
  );
}
