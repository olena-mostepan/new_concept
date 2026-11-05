"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, ChevronDown, Plus } from "lucide-react";
import { toast } from "sonner";
import { CustomerNav } from "@/components/customer/CustomerNav";

function EnergiseMark() {
  return (
    <Link
      href="/customer"
      className="flex shrink-0 flex-col leading-tight hover:opacity-80"
    >
      <span className="h8 tracking-tight text-text-primary">Energise</span>
      <span className="p7 text-text-secondary">
        Powered by{" "}
        <span className="font-semibold text-text-primary">CQuel</span>
      </span>
    </Link>
  );
}

function HeaderActions() {
  return (
    <div className="flex flex-wrap items-center justify-end gap-5 sm:gap-7">
      <Link
        href="/customer/delivery"
        className="p6 text-text-secondary hover:text-text-primary"
      >
        Questions
      </Link>
      <button
        type="button"
        className="btn-secondary gap-3"
        onClick={() =>
          toast.message("Report generation opens here in production")
        }
      >
        <Plus className="h-4 w-4 shrink-0" aria-hidden />
        Generate report
      </button>
      <button
        type="button"
        className="inline-flex items-center gap-1.5 text-text-secondary hover:text-text-primary"
        title="Account"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full border border-border-dark bg-bg-container-grey h9 text-text-primary">
          D
        </span>
        <ChevronDown className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}

function isProjectDetailRoute(pathname: string): boolean {
  return pathname.startsWith("/customer/projects/");
}

/** Project detail chrome: ← Back · same actions as main (no section nav) */
function ProjectDetailHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border-dark bg-white">
      <div className="mx-auto flex w-full max-w-screen-2xl items-center justify-between gap-3 px-6 py-3.5 sm:px-8 lg:px-10">
        <Link
          href="/customer/delivery"
          className="inline-flex items-center gap-1.5 h8 text-text-primary hover:opacity-80"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back
        </Link>
        <HeaderActions />
      </div>
    </header>
  );
}

export function CustomerPortalChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "";

  if (isProjectDetailRoute(pathname)) {
    return (
      <div className="min-h-screen bg-bg-container-grey">
        <ProjectDetailHeader />
        <main className="scroll-mt-20 pb-12">{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-container-grey">
      <header className="sticky top-0 z-40 border-b border-border-dark bg-white">
        <div className="mx-auto w-full max-w-screen-2xl px-6 py-3.5 sm:px-8 lg:px-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <EnergiseMark />
            <HeaderActions />
          </div>
        </div>
        <CustomerNav pathname={pathname} />
      </header>
      <main className="scroll-mt-20 pb-12">{children}</main>
    </div>
  );
}
