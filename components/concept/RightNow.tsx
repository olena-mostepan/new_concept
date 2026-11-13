"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  buildingProgress,
  byRecentChange,
  nextParts,
  rightNow,
  short,
} from "@/lib/concept/derive";
import { nPackages } from "@/lib/concept/words";
import type { Account, Workstream } from "@/lib/concept/model";
import {
  Card,
  CardLink,
  Bar,
  ChangedMark,
  focusRing,
  groupTitle,
  td,
  ResponsibilityPill,
} from "./ui";
import { ServiceTag } from "./ServiceTag";
import { useHrefs } from "./useHrefs";
import { useConceptI18n } from "./useConceptI18n";

function LiveRow({
  account,
  w,
  waiting,
}: {
  account: Account;
  w: Workstream;
  waiting?: boolean;
}) {
  const hrefs = useHrefs();
  const { lang, t } = useConceptI18n();
  const batch = account.batches.find((b) => b.id === w.batchId);
  const { done, total } = buildingProgress(w);
  const parts = nextParts(w, lang);
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
          {t("{0} of {1}", done, total)}
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
  const hrefs = useHrefs();
  const { lang, t } = useConceptI18n();
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
          {t("Done {0}", short(w.completedOn, lang))}
        </span>
      </td>
      <td className={td}>
        <ResponsibilityPill owner="done" />
      </td>
    </tr>
  );
}

export function RightNow({ account }: { account: Account }) {
  const hrefs = useHrefs();
  const { lang, t, words } = useConceptI18n();
  const groups = rightNow(account);
  const foldDone = groups.done.length > 5;
  return (
    <Card
      title={t("Right now")}
      right={
        <CardLink href={hrefs.batches}>
          {t("All {0}", words.packages)}
        </CardLink>
      }
      bodyClassName="p-0"
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px]">
          <tbody>
            <Group label={t("Your action ·")} count={groups.you.length}>
              {byRecentChange(groups.you).map((w) => (
                <LiveRow key={w.id} account={account} w={w} waiting />
              ))}
            </Group>
            <Group label={t("In progress")} count={groups.progress.length}>
              {byRecentChange(groups.progress).map((w) => (
                <LiveRow key={w.id} account={account} w={w} />
              ))}
            </Group>
            <Group
              label={foldDone ? undefined : t("Done")}
              count={foldDone ? undefined : groups.done.length}
            >
              {foldDone ? (
                <tr className="border-t border-border-light">
                  <td colSpan={4} className="py-3 pl-8 pr-5">
                    <div className="flex items-center justify-between gap-4 p6 text-text-secondary">
                      <span>
                        {t("{0} done", nPackages(groups.done.length, lang))}
                      </span>
                      <CardLink href={hrefs.batches}>{t("See all")}</CardLink>
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
