"use client";

import { useState } from "react";
import {
  SERVICES,
  service as serviceDef,
  type Batch,
  type Doc,
  type Need,
  type ServiceId,
  type SolutionId,
  type Workstream,
} from "@/lib/concept/model";
import { getBuilding } from "@/lib/concept/derive";
import { Tag } from "@/components/ds/tag";
import { cn } from "@/lib/utils";
import { useConcept } from "./store";
import { Button, Dropdown, Icon, IconButton, ServiceIcon } from "./ui";
import { SERVICE_LINES, SOLUTION_OPTIONS, fieldClass, fieldInputClass, labelClass, solutionLabel, workstreamName } from "./ops-shared";
import { AssetPicker, Check, CountPill, CreateWorkspace, WsSection } from "./ops-workspace";

/**
 * Add package / Edit package as a full-screen create workspace (same frame as New batch):
 * solution, services, assets and the rest on the left; what it creates on the right.
 */
export function OpsAddPackage({
  batch,
  editing,
  onClose,
  onSaved,
}: {
  batch: Batch;
  editing?: Workstream;
  onClose: () => void;
  onSaved: (ids: string[]) => void;
}) {
  const { account, addWorkstreams, updateWorkstream } = useConcept();
  const leads = [
    ...new Set([batch.lead, ...account.workstreams.map((w) => w.lead)].filter((l): l is string => Boolean(l))),
  ];
  const [solution, setSolution] = useState<SolutionId>(editing?.solution ?? "solar");
  const [services, setServices] = useState<ServiceId[]>(editing ? [editing.service] : []);
  const [ids, setIds] = useState<string[]>(editing ? editing.projects.map((p) => p.buildingId) : batch.buildingIds);
  const [lead, setLead] = useState(editing?.lead ?? batch.lead ?? leads[0] ?? "");
  const [needs, setNeeds] = useState<string[]>(editing?.needs.length ? editing.needs.map((n) => n.label) : [""]);
  const [documents, setDocuments] = useState<Doc[]>(editing?.documents ?? []);
  const bundles = account.batches.filter((b) => b.filesSummary);

  const toggleService = (sid: ServiceId) =>
    setServices((cur) => (editing ? [sid] : cur.includes(sid) ? cur.filter((x) => x !== sid) : [...cur, sid]));
  const toggleAsset = (bid: string) =>
    setIds((cur) => (cur.includes(bid) ? cur.filter((x) => x !== bid) : [...cur, bid]));

  const others = account.workstreams.filter((w) => w.batchId === batch.id && w.id !== editing?.id);
  // Keep the batch's order of services.
  const chosen = SERVICES.map((s) => s.id).filter((sid) => services.includes(sid));
  const preview = chosen.map((sid) => ({
    id: sid,
    name:
      editing && editing.solution === solution && editing.service === sid ? editing.name : workstreamName(solution, sid, others),
    step: serviceDef(sid).steps[0],
  }));
  const missing = !services.length ? "Choose at least one service" : !ids.length ? "Choose at least one asset" : "";
  const dirty = editing ? true : services.length > 0 || documents.length > 0 || needs.some((n) => n.trim());

  const save = () => {
    if (missing) return;
    const openNeedList = needs
      .map((l) => l.trim())
      .filter(Boolean)
      .map((label): Need => ({ label, why: "", owner: "you" }));
    if (editing) {
      updateWorkstream(editing.id, {
        name: preview[0]?.name ?? editing.name,
        service: chosen[0],
        solution,
        buildingIds: ids,
        lead,
        needs: openNeedList,
        documents,
      });
      onSaved([editing.id]);
      return;
    }
    onSaved(
      addWorkstreams({
        batchId: batch.id,
        solution,
        services: preview.map((p) => ({ service: p.id, name: p.name })),
        buildingIds: ids,
        lead,
        needs: openNeedList,
        documents,
      }),
    );
  };

  const addDocs = (names: string[], meta: string) =>
    setDocuments((cur) => [
      ...cur,
      ...names.filter((n) => !cur.some((d) => d.name === n)).map((name) => ({ name, meta })),
    ]);
  const batchAssets = batch.buildingIds.map((bid) => getBuilding(account, bid));
  const n = ids.length;

  return (
    <CreateWorkspace
      title={editing ? "Edit package" : "Add package"}
      subtitle={`${batch.name} · ${batch.buildingIds.length} ${batch.buildingIds.length === 1 ? "asset" : "assets"}`}
      action={editing ? "Save package" : preview.length > 1 ? `Add ${preview.length} packages` : "Add package"}
      missing={missing}
      onSubmit={save}
      dirty={dirty}
      closeQuestion={editing ? "Close without saving the package?" : "Close without adding the package?"}
      closeLabel={editing ? "Close without saving" : "Close without adding"}
      onClose={onClose}
      sideLabel="This package"
      side={
        <>
          <div>
            <div className="mb-2 flex items-center gap-2">
              <p className="flex-1 h7 text-text-primary">{preview.length > 1 ? "These packages" : "This package"}</p>
              {preview.length > 1 && <CountPill>{preview.length} packages</CountPill>}
            </div>
            {preview.length === 0 ? (
              <p className="rounded-md border-[1.5px] border-dashed border-black-3 bg-white px-4 py-5 text-center p7 text-text-secondary">
                Choose a service on the left.
              </p>
            ) : (
              <ul className="rounded-md border border-border-light bg-white px-3">
                {preview.map((p, i) => (
                  <li key={p.id} className={cn("flex items-center gap-3 py-3", i > 0 && "border-t border-border-light")}>
                    <ServiceIcon service={p.id} size={36} />
                    <div className="min-w-0">
                      <p className="truncate h8 text-text-title">{p.name}</p>
                      <p className="p7 text-text-secondary">
                        {serviceDef(p.id).label} · starts at {p.step}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {preview.length > 1 && (
              <p className="mt-2 p7 text-text-secondary">Each service becomes its own package, run in this order.</p>
            )}
          </div>

          <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-2 p7">
            <dt className="text-text-tertiary">Solution</dt>
            <dd className="text-text-primary">{solutionLabel(solution)}</dd>
            <dt className="text-text-tertiary">Assets</dt>
            <dd className="text-text-primary">
              {n} of {batch.buildingIds.length}
            </dd>
            <dt className="text-text-tertiary">Lead</dt>
            <dd className="text-text-primary">{lead || "—"}</dd>
          </dl>

          <div>
            <div className="mb-2 flex items-center gap-2">
              <p className="flex-1 h7 text-text-primary">Documents</p>
              <CountPill>
                {documents.length} {documents.length === 1 ? "file" : "files"}
              </CountPill>
            </div>
            <p className="mb-3 p7 text-text-secondary">Optional. With several services, each package gets a copy.</p>
            <div className="space-y-3">
            <div className="flex flex-col items-center gap-1 rounded-md border-[1.5px] border-dashed border-black-3 bg-white px-4 py-5 text-center">
              <span className="mb-1.5 flex size-9 items-center justify-center rounded-md border border-border-dark bg-white">
                <Icon name="upload" size={20} className="text-icon-dark" />
              </span>
              <p className="h8 text-text-primary">Drop documents here</p>
              <p className="p7 text-text-secondary">Drawings, specs or an incumbent quote</p>
              <span className="mt-2.5">
                <Button type="secondary" icon="upload" onClick={() => addDocs([`Document_${documents.length + 1}.pdf`], "Added now")}>
                  Upload documents
                </Button>
              </span>
            </div>
            {bundles.length > 0 && (
              <div>
                <p className={labelClass}>Or use what the customer sent</p>
                <div className="flex flex-wrap gap-2">
                  {bundles.map((b) => {
                    const on = documents.some((d) => d.name === b.filesSummary);
                    return (
                      <Button
                        key={b.id}
                        type="secondary"
                        size="small"
                        icon={on ? "check" : "plus"}
                        disabled={on}
                        className="h-auto min-h-8 whitespace-normal py-1.5 text-left"
                        onClick={() => addDocs([b.filesSummary!], b.filesCount ? `${b.filesCount} files from the customer` : "From the customer")}
                      >
                        {b.filesSummary}
                      </Button>
                    );
                  })}
                </div>
              </div>
            )}
            {documents.length > 0 && (
              <ul className="rounded-md border border-border-light bg-white px-3">
                {documents.map((d, i) => (
                  <li key={d.name} className={cn("flex items-center gap-3 py-2.5", i > 0 && "border-t border-border-light")}>
                    <Icon name="document" size={16} className="shrink-0 text-icon-default" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate h8 text-text-title">{d.name}</p>
                      <p className="flex items-center gap-1.5 p7 text-text-secondary">
                        {/\.[a-z]+$/i.test(d.name) && (
                          <Tag type="neutral" size="xsmall">
                            {d.name.split(".").pop()!.toUpperCase()}
                          </Tag>
                        )}
                        {d.meta}
                      </p>
                    </div>
                    <IconButton icon="cross" size="small" label={`Remove ${d.name}`} onClick={() => setDocuments(documents.filter((x) => x.name !== d.name))} />
                  </li>
                ))}
              </ul>
            )}
          </div>
          </div>

          <p className="p7 text-text-secondary">You can rename a package and change its assets later.</p>
        </>
      }
    >
      <WsSection title="Solution">
        <div className="max-w-[420px]">
          <Dropdown
            ariaLabel="Solution"
            value={solution}
            onValueChange={(v) => setSolution(v as SolutionId)}
            options={SOLUTION_OPTIONS.map((o) => ({ value: o.id, label: o.label }))}
          />
        </div>
      </WsSection>

      <WsSection
        title="Services"
        hint={editing ? "The service this package runs." : "Choose one or more. Each becomes its own package, run in this order."}
      >
        <ul className="grid gap-3 sm:grid-cols-2">
          {SERVICES.map((s) => {
            const on = services.includes(s.id);
            const inPlan = batch.route.includes(s.id);
            return (
              <li key={s.id}>
                <button
                  type="button"
                  role={editing ? "radio" : "checkbox"}
                  aria-checked={on}
                  onClick={() => toggleService(s.id)}
                  className={cn(
                    "grid h-full w-full grid-cols-[16px_minmax(0,1fr)] gap-x-3 rounded-md border bg-white p-4 text-left outline-none hover:bg-black-1 focus-visible:shadow-focus",
                    on ? "border-black-7 shadow-[inset_0_0_0_1px_var(--black-7)]" : "border-border-dark",
                  )}
                >
                  <span className="mt-0.5">
                    <Check on={on} />
                  </span>
                  <span className="min-w-0">
                    <span className="block h8 text-text-title">{s.label}</span>
                    <span className="block p7 text-text-secondary">{SERVICE_LINES[s.id]}</span>
                    {!inPlan && <span className="mt-1 block p7 text-text-tertiary">Not in the batch plan yet. Adding it adds it to the plan.</span>}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </WsSection>

      <WsSection title="Assets" hint="Which of the batch's assets this package covers.">
        <AssetPicker
          hits={batchAssets}
          isOn={(bid) => ids.includes(bid)}
          onToggle={toggleAsset}
          onAll={(on) => setIds(on ? batch.buildingIds : [])}
          empty="This batch has no assets yet."
          countLabel="selected"
        />
      </WsSection>

      <WsSection title="Lead">
        <div className="max-w-[420px]">
          {leads.length === 0 ? (
            <p className="p6 text-text-secondary">Add a lead on the batch first.</p>
          ) : (
            <Dropdown
              ariaLabel="Lead"
              value={leads.includes(lead) ? lead : leads[0]}
              onValueChange={setLead}
              options={leads.map((l) => ({ value: l, label: l }))}
            />
          )}
        </div>
      </WsSection>

      <WsSection
        title="What we need from the customer (optional)"
        hint="Shown on their batch page under this package. They reply by email."
      >
        <div className="space-y-2">
          {needs.map((need, i) => (
            <div key={i} className="flex items-center gap-2">
              <label className="sr-only" htmlFor={`need-${i}`}>
                Need {i + 1}
              </label>
              <input
                id={`need-${i}`}
                className={cn(fieldClass, fieldInputClass)}
                value={need}
                placeholder={i === 0 ? "E.g. 12 months of electricity bills" : undefined}
                onChange={(e) => setNeeds(needs.map((x, k) => (k === i ? e.target.value : x)))}
              />
              {needs.length > 1 && (
                <IconButton icon="cross" label={`Remove need ${i + 1}`} onClick={() => setNeeds(needs.filter((_, k) => k !== i))} />
              )}
            </div>
          ))}
          <Button type="tertiary" icon="plus" onClick={() => setNeeds([...needs, ""])}>
            Add another
          </Button>
        </div>
      </WsSection>

    </CreateWorkspace>
  );
}

/** @deprecated Use OpsAddPackage. */
export const OpsWorkstreamDrawer = OpsAddPackage;

export function exclusionLine(name: string, solution: SolutionId, exclusion?: string) {
  if (!exclusion || !exclusion.includes(name)) return "";
  const reason = exclusion.split("—")[1]?.trim();
  const what = solution === "solar" ? "solar" : solutionLabel(solution);
  return reason ? `No ${what} — ${reason}` : exclusion;
}
