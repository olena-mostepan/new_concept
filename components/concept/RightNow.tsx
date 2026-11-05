import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  buildingProgress,
  byRecentChange,
  nextParts,
  rightNow,
} from "@/lib/concept/derive";
import { nPackages, WORDS } from "@/lib/concept/words";
import type { Account, Workstream } from "@/lib/concept/model";
import { Card, CardLink, Bar, ChangedMark, focusRing, groupTitle, td, ResponsibilityPill } from "./ui";
import { ServiceTag } from "./ServiceTag";
import { hrefs } from "./hrefs";

function LiveRow({
  account,
  w,
  waiting,
}: {
  account: Account;
  w: Workstream;
  waiting?: boolean;
}) {
  const batch = account.batches.find((b) => b.id === w.batchId);
  const { done, total } = buildingProgress(w);
  const parts = nextParts(w);
  return (
    <tr className="border-t border-border-light">
      <td className={td} style={{ paddingLeft: 36 }}>
        <Link
          href={hrefs.workstream(w.id)}
          className={cn("h8 text-text-title hover:text-text-title", focusRing)}
        >
          <ChangedMark w={w}>{w.name}</ChangedMark>
        </Link>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <ServiceTag s={w.service} />
          {batch && <span className="p6 text-text-tertiary">{batch.name}</span>}
        </div>
      </td>
      <td className={td}>
        <p
          className={
            waiting ? "font-semibold text-text-primary" : "text-text-primary"
          }
        >
          {parts.main}
        </p>
        {parts.detail && (
          <p className="mt-0.5 text-text-secondary">{parts.detail}</p>
        )}
      </td>
      <td className={`${td} w-36`}>
        <p className="tabular-nums text-text-secondary">
          {done} of {total}
        </p>
        <Bar done={done} total={total} className="mt-1.5 w-24" />
      </td>
      <td className={td}>
        <ResponsibilityPill owner={w.owner} />
      </td>
    </tr>
  );
}

function DoneRow({ account, w }: { account: Account; w: Workstream }) {
  const batch = account.batches.find((b) => b.id === w.batchId);
  return (
    <tr className="border-t border-border-light">
      <td className={td} style={{ paddingLeft: 36 }}>
        <Link
          href={hrefs.workstream(w.id)}
          className={cn("h8 text-text-title hover:text-text-title", focusRing)}
        >
          {w.name}
        </Link>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <ServiceTag s={w.service} />
          {batch && <span className="p6 text-text-tertiary">{batch.name}</span>}
        </div>
      </td>
      <td className={td} colSpan={2}>
        <span className="text-text-secondary">
          Done {w.completedOn?.split(" ").slice(0, 2).join(" ")}
        </span>
      </td>
      <td className={td}>
        <ResponsibilityPill owner="done" />
      </td>
    </tr>
  );
}

export function RightNow({ account }: { account: Account }) {
  const groups = rightNow(account);
  const foldDone = groups.done.length > 5;
  return (
    <Card
      title="Right now"
      right={<CardLink href={hrefs.batches}>All {WORDS.packages}</CardLink>}
      bodyClassName="p-0"
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px]">
          <tbody>
            <Group label="Your action ·" count={groups.you.length}>
              {byRecentChange(groups.you).map((w) => (
                <LiveRow key={w.id} account={account} w={w} waiting />
              ))}
            </Group>
            <Group label="In progress" count={groups.progress.length}>
              {byRecentChange(groups.progress).map((w) => (
                <LiveRow key={w.id} account={account} w={w} />
              ))}
            </Group>
            <Group
              label={foldDone ? undefined : "Done"}
              count={foldDone ? undefined : groups.done.length}
            >
              {foldDone ? (
                <tr className="border-t border-border-light">
                  <td colSpan={4} className="py-3 pl-8 pr-5">
                    <div className="flex items-center justify-between gap-4 p6 text-text-secondary">
                      <span>{nPackages(groups.done.length)} done</span>
                      <CardLink href={hrefs.batches}>See all</CardLink>
                    </div>
                  </td>
                </tr>
              ) : (
                groups.done.map((w) => (
                  <DoneRow key={w.id} account={account} w={w} />
                ))
              )}
            </Group>
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function Group({
  label,
  count,
  children,
}: {
  label?: string;
  count?: number;
  children: ReactNode;
}) {
  return (
    <>
      {label && (
        <tr>
          <td colSpan={4} className="bg-bg-container-grey py-3 pl-8 pr-5">
            <h3 className={groupTitle}>
              {label}{" "}
              {count != null && (
                <span className="p6 text-text-tertiary">{count}</span>
              )}
            </h3>
          </td>
        </tr>
      )}
      {children}
    </>
  );
}
