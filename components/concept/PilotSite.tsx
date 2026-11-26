"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Icon } from "./ui";

export type SiteAsset = {
  id: string;
  n: number;
  name: string;
  type?: string;
  inPlan: boolean;
  /** The package this asset is in ("In Roof + Solar PV"); empty when it isn't in one yet. */
  status?: string;
  href: string;
};

/** The batch's assets: number, address, use, and the package each one is in. */
export function SiteAssetList({ assets }: { assets: SiteAsset[] }) {
  return (
    <ul className="flex flex-col">
      {assets.map((a) => (
        <li key={a.id}>
          <Link
            href={a.href}
            className={cn(
              "table-row-link-row -mx-2 flex items-center gap-3 rounded-md px-2 py-2 outline-none hover:bg-black-1 focus-visible:bg-black-2",
            )}
          >
            <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-black-7 h9 text-white">
              {a.n}
            </span>
            <span className="min-w-0 flex-1">
              <span className={cn("block h8", a.inPlan ? "text-text-title" : "text-text-tertiary")}>{a.name}</span>
              {a.type && <span className="block p7 text-text-secondary">{a.type}</span>}
            </span>
            {a.status && <span className="shrink-0 p7 text-text-primary">{a.status}</span>}
            <Icon name="chevron-right" size={16} className="shrink-0 text-text-tertiary" />
          </Link>
        </li>
      ))}
    </ul>
  );
}
