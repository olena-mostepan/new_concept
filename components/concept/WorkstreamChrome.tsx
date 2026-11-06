"use client";

import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  service,
  SOLUTIONS,
  type SolutionId,
  type Doc,
  type Workstream,
} from "@/lib/concept/model";
import {
  currentPhase,
  getBatch,
  getWorkstream,
  isClosed,
  moneyOne,
  presentedTotal,
  pricingTotal,
  short,
  surveyLine,
  totalCapacity,
} from "@/lib/concept/derive";
import { cn } from "@/lib/utils";
import {
  Button,
  IconButton,
  PageHeader,
  ResponsibilityPill,
  ServiceIcon,
  Card,
  CardLink,
  DocumentList,
  type FactItem,
} from "./ui";
import { hrefs } from "./hrefs";
import { useConcept } from "./store";
import { workstreamCrumbs } from "./crumbs";
import { nAssets } from "@/lib/concept/words";
import { activeProjects, isCompleted } from "@/lib/concept/derive";
import {
  packagePrimaryTab,
  packageStatusCta,
  packageStatusHeadline,
  packageStatusService,
} from "./packageStatus";
import { assetPackageScopeLine } from "./packageTabs";
import { serviceChips } from "./serviceChips";

const SOLUTION_NAME: Record<SolutionId, string> = {
  led: "LED",
  solar: "Solar PV",
  ev: "EV charging",
  ashp: "Heat pumps",
  generic: SOLUTIONS.generic,
};

/** Drop the full stop, and use a middle dot where the copy used a dash or a colon. */
export function shortFact(text: string): string {
  return text
    .replace(/(?<!\d)\s*[—–]\s*(?!\d)/g, " · ")
    .replace(/:\s+/g, " · ")
    .replace(/\.\s*$/, "");
}

export function PackageStatusCard({ w }: { w: Workstream }) {
  const searchParams = useSearchParams();
  const sid = packageStatusService(w);
  const headline = packageStatusHeadline(w);
  const closed = isClosed(w);
  const complete = isCompleted(w);
  const cta = packageStatusCta(w);
  const params = new URLSearchParams(searchParams.toString());
  params.set("tab", cta.tab);
  const qs = params.toString();
  const href = `${hrefs.workstream(w.id)}?${qs}`;

  return (
    <div
      className="relative ml-[30px] shrink-0 rounded-2xl border border-border-dark bg-bg-container py-[18px] pl-[84px] pr-5"
      style={{ minWidth: "min(100%, 420px)" }}
    >
      <ServiceIcon
        service={sid}
        size={116}
        grayscale={closed}
        className="pointer-events-none absolute left-[-30px] top-1/2 -translate-y-1/2"
      />
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="p7 text-text-tertiary">{headline.lead}</p>
          {headline.name && (
            <p className="h4 text-text-primary">{headline.name}</p>
          )}
        </div>
        {!closed && !complete && (
          <Button
            type="strong"
            size="large"
            icon="chevron-right"
            iconPosition="right"
            href={href}
          >
            {cta.label}
          </Button>
        )}
      </div>
    </div>
  );
}

export function AssetStripStatus({
  w,
  href,
  ariaLabel,
}: {
  w: Workstream;
  href: string;
  ariaLabel: string;
}) {
  const { account } = useConcept();
  return (
    <div className="flex w-full items-center justify-between gap-6">
      <p className="min-w-0 flex-1 p6 text-text-secondary">
        {assetPackageScopeLine(w, account)}
      </p>
      <Button
        type="strong"
        size="large"
        icon="chevron-right"
        iconPosition="right"
        href={href}
        ariaLabel={ariaLabel}
        className="shrink-0"
      >
        Open package
      </Button>
    </div>
  );
}

export function WorkstreamHeader({ w }: { w: Workstream }) {
  const { account } = useConcept();
  const searchParams = useSearchParams();
  const batch = getBatch(account, w.batchId);
  const crumbs = workstreamCrumbs(account, w, searchParams).map(
    ({ label, href }) => ({ label, href }),
  );
  const assetsLive = activeProjects(w).length;
  const leftCount = w.projects.filter((p) => p.left).length;
  const fromWs = w.from ? getWorkstream(account, w.from.workstreamId) : undefined;
  const facts: FactItem[] = [
    {
      label: "Batch",
      value: batch?.name ?? "—",
      href: batch ? hrefs.batch(w.batchId) : undefined,
    },
  ];
  if (fromWs) {
    facts.push({
      label: "From",
      value: fromWs.name,
      href: hrefs.workstream(fromWs.id),
    });
  }
  facts.push({ label: "Solution", value: SOLUTION_NAME[w.solution] });
  if (isClosed(w)) {
    facts.push({
      label: "Assets",
      value: `${w.projects.length} at the start`,
    });
    if (w.closedOn) {
      facts.push({
        label: "Closed",
        value: short(w.closedOn),
      });
    }
  } else {
    facts.push({
      label: "Assets",
      value:
        leftCount > 0
          ? `${assetsLive} · ${leftCount} left`
          : String(assetsLive),
    });
  }
  if (w.supplier) facts.push({ label: "Supplier", value: w.supplier });

  return (
    <PageHeader
      crumbs={crumbs}
      kind="package"
      title={w.name}
      facts={facts}
      aside={<PackageStatusCard w={w} />}
      changedKey
      actions={
        w.owner === "you" ? <ResponsibilityPill owner="you" /> : undefined
      }
    />
  );
}

export { serviceChips };
export { packagePrimaryTab };

function infoRows(
  w: Workstream,
  batchName: string,
): Array<{ label: string; value: string }> {
  const phase = currentPhase(w);
  const since = phase.startedOn ? ` · since ${short(phase.startedOn)}` : "";
  const later = w.phases.slice(
    w.phases.findIndex((item) => item.service === phase.service) + 1,
  );
  const next = later.map((item) => service(item.service).label);
  const dropped = w.projects.filter((project) => project.dropped).length;
  const rows: Array<{ label: string; value: string }> = [
    { label: "Batch", value: batchName },
    { label: "Solution", value: SOLUTION_NAME[w.solution] },
    { label: "Current service", value: `${service(w.service).label}${since}` },
  ];
  if (next.length === 1) rows.push({ label: "Next services", value: next[0] });
  if (next.length > 1)
    rows.push({
      label: "Next services",
      value: `${next.slice(0, -1).join(", ")}, then ${next[next.length - 1]}`,
    });
  rows.push({
    label: "Projects",
    value: dropped
      ? `${w.projects.length} · ${dropped} not proceeding`
      : String(w.projects.length),
  });
  if (w.service === "indicative") {
    const total = presentedTotal(w);
    if (total.count)
      rows.push({
        label: "Estimated cost",
        value: `${total.text} · ${total.count} estimated`,
      });
  } else if (w.service === "tender") {
    const size = totalCapacity(w);
    if (size) rows.push({ label: "Total size", value: size });
  } else if (w.service === "delivery" && w.deliveryProfile?.contractValue) {
    rows.push({
      label: "Contract value",
      value: moneyOne(w.deliveryProfile.contractValue),
    });
  } else if (w.service === "scope") {
    const fact = surveyLine(w).split(" — ")[0];
    if (fact) rows.push({ label: "Surveys", value: fact });
  } else if (w.service === "pricing") {
    const total = pricingTotal(w);
    if (total) rows.push({ label: "Price", value: moneyOne(total) });
  }
  rows.push({
    label: "Done when",
    value:
      w.service === "indicative"
        ? "You have decided on every project"
        : service(w.service).done,
  });
  return rows;
}

function InfoDrawer({
  w,
  batchName,
  open,
  onClose,
}: {
  w: Workstream;
  batchName: string;
  open: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40" role="presentation">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        style={{ backgroundColor: "rgba(30,40,50,.25)" }}
        aria-label="Close info"
        onClick={onClose}
      />
      <aside
        className="absolute inset-y-0 right-0 flex w-[400px] max-w-full flex-col bg-white shadow-xl"
        role="dialog"
        aria-label={`${w.name} · info`}
      >
        <div className="flex items-start justify-between gap-3 px-6 py-5">
          <h2 className="h7 text-text-primary">{w.name} · info</h2>
          <IconButton icon="cross" label="Close" onClick={onClose} />
        </div>
        <div className="flex-1 overflow-y-auto px-6">
          {infoRows(w, batchName).map((row) => (
            <div key={row.label} className="border-t border-border-light py-3">
              <p className="p7 text-text-tertiary">{row.label}</p>
              <p className="p6 text-text-primary">{row.value}</p>
            </div>
          ))}
          <Link
            href={hrefs.batch(w.batchId)}
            className="mt-2 inline-block py-3 h8 text-text-primary"
          >
            View batch
          </Link>
        </div>
      </aside>
    </div>
  );
}

function packageMeta(w: Workstream, batchName?: string) {
  if (w.owner === "done") {
    return w.completedOn ? `Completed ${short(w.completedOn)}` : "Completed";
  }
  const assets = nAssets(w.projects.filter((project) => !project.dropped).length);
  return [batchName, assets, `${service(w.service).label} now`]
    .filter(Boolean)
    .join(" · ");
}

export function WorkstreamFacts({
  activity,
  documents,
}: {
  activity: Array<{ date: string; title: string; text: string }>;
  documents?: Doc[];
}) {
  const path = usePathname();
  const params = useSearchParams();
  const qs = params.toString();
  const seeAll = qs ? `${path}?${qs}` : path;
  const docs = documents ?? [];
  if (!activity.length && !docs.length) return null;
  return (
    <div
      className={
        activity.length && docs.length ? "grid gap-6 lg:grid-cols-2" : ""
      }
    >
      {activity.length > 0 && (
        <Card
          title="Recent activity"
          right={<CardLink href={seeAll}>See all</CardLink>}
          className="h-full"
        >
          <ul>
            {activity.map((item, index) => (
              <li
                key={`${item.date}-${item.title}`}
                className={cn(
                  "flex justify-between gap-4 py-3",
                  index > 0 && "border-t border-border-light",
                )}
              >
                <div>
                  <p className="h8 text-text-primary">
                    {shortFact(item.title)}
                  </p>
                  {item.text && (
                    <p className="p6 text-text-secondary">
                      {shortFact(item.text)}
                    </p>
                  )}
                </div>
                <span className="shrink-0 p7 text-text-tertiary">
                  {item.date}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}
      {docs.length > 0 && (
        <Card
          title="Documents"
          right={<CardLink href={seeAll}>See all</CardLink>}
          className="h-full"
        >
          <DocumentList docs={docs} />
        </Card>
      )}
    </div>
  );
}

export function WorkstreamFrame({
  live,
  children,
}: {
  live: Workstream;
  children: ReactNode;
}) {
  return (
    <>
      <WorkstreamHeader w={live} />
      <div className="space-y-6 pb-12">{children}</div>
    </>
  );
}
