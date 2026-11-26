"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { isCustomerPath } from "./hrefs";

/** Prototype control: the three versions of the concept. */
export function ViewSwitch({ label = "View" }: { label?: string }) {
  const pathname = usePathname() ?? "";
  const supplier = pathname.startsWith("/concept/supplier");
  const views = [
    { label: "Customer", href: "/concept/customer", on: isCustomerPath(pathname) },
    { label: "Supplier", href: "/concept/supplier", on: supplier },
    { label: "Ops", href: "/concept", on: !isCustomerPath(pathname) && !supplier },
  ];
  return (
    <div className="flex items-center gap-3">
      <span className="p7 text-text-tertiary">{label}</span>
      <nav className="inline-flex rounded-md border border-border-dark bg-white p-0.5" aria-label={label}>
        {views.map((v) => (
          <Link
            key={v.label}
            href={v.href}
            aria-current={v.on ? "page" : undefined}
            className={cn(
              "rounded-md px-3 py-1 p6 transition-colors outline-none focus-visible:shadow-focus",
              v.on ? "bg-black-7 text-white" : "text-text-secondary hover:text-text-primary",
            )}
          >
            {v.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
