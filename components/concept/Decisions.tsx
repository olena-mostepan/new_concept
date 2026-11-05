import Link from "next/link";
import type { Account } from "@/lib/concept/model";
import {
  activeProjects,
  changedRecently,
  getBatch,
  nextParts,
  yourActionWorkstreams,
} from "@/lib/concept/derive";
import { nAssets } from "@/lib/concept/words";
import { hrefs } from "./hrefs";
import { Icon, Card, ChangedDot, OwnerPill } from "./ui";

const PREVIEW = 3;
const grid = {
  gridTemplateColumns: "minmax(0,1.4fr) minmax(0,1.4fr) 110px 16px",
};

export function Decisions({ account }: { account: Account }) {
  const rows = yourActionWorkstreams(account);
  if (!rows.length) return null;
  const shown = rows.slice(0, PREVIEW);
  return (
    <Card
      title="Needs your decision"
      bodyClassName="p-0"
      footer={
        rows.length > PREVIEW ? (
          <footer className="flex items-center justify-between gap-3 border-t border-border-light px-6 py-3">
            <p className="p7 text-text-tertiary">
              Showing {PREVIEW} of {rows.length} · newest first
            </p>
            <Link
              href={`${hrefs.workstreams()}?responsibility=you`}
              className="h8 text-text-primary underline underline-offset-[3px] decoration-border-dark"
            >
              See all {rows.length}
            </Link>
          </footer>
        ) : undefined
      }
    >
      <div className="overflow-x-auto">
        <div className="min-w-[640px]">
          <div
            className="grid items-center gap-x-6 border-b border-border-light py-2.5 pl-8 pr-6 s3 text-text-tertiary"
            style={grid}
          >
            <span>Package</span>
            <span>Next step</span>
            <span />
            <span />
          </div>
          {shown.map((w) => {
            const next = nextParts(w);
            const batch = getBatch(account, w.batchId);
            const assets = new Set(
              activeProjects(w).map((project) => project.buildingId),
            ).size;
            return (
              <Link
                key={w.id}
                href={hrefs.workstream(w.id)}
                className="grid items-center gap-x-6 border-t border-border-light py-3.5 pl-8 pr-6 hover:bg-black-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black-7"
                style={grid}
              >
                <span className="min-w-0">
                  <ChangedDot on={changedRecently(w)}>
                    <span className="block h8 text-text-title">{w.name}</span>
                  </ChangedDot>
                  <span className="mt-0.5 block p7 text-text-tertiary">
                    {batch?.name ?? "—"} · {nAssets(assets)}
                  </span>
                </span>
                <span className="min-w-0">
                  <span className="block h8 text-text-primary">
                    {next.main}
                  </span>
                  {next.detail ? (
                    <span className="mt-0.5 block p7 text-text-secondary">
                      {next.detail}
                    </span>
                  ) : null}
                </span>
                <OwnerPill owner="you" />
                <Icon name="chevron-right" size={16} className="text-text-tertiary" />
              </Link>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
