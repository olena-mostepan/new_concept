"use client";

import { Suspense, useEffect, useRef, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { changedRecently, isClosed, isLive } from "@/lib/concept/derive";
import type { Account } from "@/lib/concept/model";
import { ConceptStoreProvider, useConcept } from "./store";
import {
  CUSTOMER_NAV,
  OPS,
  OPS_NAV,
  counterpart,
  hrefs,
  type NavItem,
} from "./hrefs";
import { activeCustomerTab } from "./crumbs";
import { detailFallbackHref, isDetail } from "./detailNav";
import {
  OpsDetailBarProvider,
  useOpsDetailBar,
} from "./ops-asset/OpsDetailBarActions";
import { useT, type Lang } from "@/lib/concept/i18n";
import { customerLang } from "./useConceptI18n";
import { AssistantButton, Button, focusRing, Icon } from "./ui";

function AccountToggle() {
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const { accounts, account, setAccountId, lang: stored } = useConcept();
  const { t } = useT(customerLang(stored, pathname));
  const ops = pathname.startsWith(OPS);
  return (
    <div className="border-b border-border-dark bg-bg-container-grey">
      <div className="mx-auto flex w-full max-w-screen-2xl items-center gap-3 px-6 py-2 sm:px-8 lg:px-10">
        <span className="p7 text-text-tertiary">{t("Dashboard")}</span>
        <div
          className="inline-flex rounded-md border border-border-dark bg-white p-0.5"
          role="tablist"
          aria-label={t("Dashboard")}
        >
          {accounts.map((a) => {
            const on = a.id === account.id;
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => {
                  if (on) return;
                  setAccountId(a.id);
                  router.push(ops ? hrefs.ops : hrefs.portfolio);
                }}
                className={cn(
                  "rounded-md px-3 py-1 p6 transition-colors",
                  on
                    ? "bg-black-7 text-white"
                    : "text-text-secondary hover:text-text-primary",
                )}
              >
                {a.kind === "pilot" ? t("Pilot") : t("Mature")}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function LangToggle() {
  const { lang: stored, setLang } = useConcept();
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const { t } = useT(customerLang(stored, pathname));
  const search = useSearchParams();
  const set = (next: Lang) => {
    setLang(next);
    const params = new URLSearchParams(search.toString());
    if (next === "en") params.delete("lang");
    else params.set("lang", next);
    const qs = params.toString();
    router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
  };
  return (
    <div
      className="inline-flex rounded-md border border-border-dark bg-white p-0.5"
      role="tablist"
      aria-label={t("Language")}
    >
      {(
        [
          { id: "en" as const, label: "EN" },
          { id: "de" as const, label: "DE" },
        ] as const
      ).map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => set(o.id)}
          className={cn(
            "rounded-md px-3 py-1 p6 transition-colors",
            stored === o.id
              ? "bg-black-7 text-white"
              : "text-text-secondary hover:text-text-primary",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function ViewToggle({ ops }: { ops: boolean }) {
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const { lang: stored } = useConcept();
  const { t } = useT(customerLang(stored, pathname));
  return (
    <div
      className="inline-flex rounded-md border border-border-dark bg-white p-0.5"
      role="tablist"
      aria-label={t("View")}
    >
      {[
        { id: false, label: t("Customer") },
        { id: true, label: t("Ops") },
      ].map((o) => (
        <button
          key={o.label}
          type="button"
          onClick={() => o.id !== ops && router.push(counterpart(pathname))}
          className={cn(
            "rounded-md px-3 py-1 p6 transition-colors",
            ops === o.id
              ? "bg-black-7 text-white"
              : "text-text-secondary hover:text-text-primary",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function customerNav(account: Account): NavItem[] {
  const changed = new Set(
    account.workstreams
      .filter((w) => !isClosed(w) && isLive(w) && changedRecently(w))
      .map((w) => w.service),
  );
  return CUSTOMER_NAV.map((item) => ({
    ...item,
    changed:
      item.group === "services" &&
      changed.has(item.id as Account["workstreams"][number]["service"]),
  }));
}

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  const pathname = usePathname() ?? "";
  const { lang: stored } = useConcept();
  const { t } = useT(customerLang(stored, pathname));
  return (
    <Link
      href={item.href}
      className={cn(
        "relative inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-none border-b-2 py-3 outline-none transition-colors focus-visible:shadow-focus",
        active
          ? "h8 border-brand-6 text-text-primary"
          : "border-transparent p6 text-text-secondary hover:text-text-primary hover:shadow-[inset_0_-2px_0_var(--black-3)]",
      )}
    >
      {t(item.label)}
      {item.changed && (
        <span
          role="img"
          aria-label={t("Changed in the last 7 days")}
          className="h-1.5 w-1.5 rounded-full bg-brand-6"
        />
      )}
    </Link>
  );
}

function Nav({
  items,
  path,
  grouped,
  activeId,
}: {
  items: NavItem[];
  path: string;
  grouped?: boolean;
  activeId?: string;
}) {
  const structure = grouped
    ? items.filter((item) => item.group === "structure")
    : items;
  const services = grouped
    ? items.filter((item) => item.group === "services")
    : [];
  const { lang: stored } = useConcept();
  const { t } = useT(customerLang(stored, path));
  const on = (item: NavItem) =>
    activeId ? item.id === activeId : item.match(path);
  return (
    <nav className="border-t border-border-dark bg-white" aria-label={t("Sections")}>
      <div className="mx-auto flex max-w-screen-2xl items-center gap-8 overflow-x-auto px-6 sm:px-8 lg:px-10">
        {structure.map((item) => (
          <NavLink key={item.id} item={item} active={on(item)} />
        ))}
        {grouped && (
          <span className="flex shrink-0 items-center gap-8">
            <span className="h-5 w-px bg-border-dark" aria-hidden />
            <span className="s3 text-text-tertiary">{t("Services")}</span>
          </span>
        )}
        {services.map((item) => (
          <NavLink key={item.id} item={item} active={on(item)} />
        ))}
      </div>
    </nav>
  );
}

function Avatar({ letter }: { letter: string }) {
  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-full border border-border-dark bg-bg-container-grey h9 text-text-primary">
      {letter}
    </span>
  );
}

function AppHeader({
  ops,
  path,
  activeId,
}: {
  ops: boolean;
  path: string;
  activeId?: string;
}) {
  const { account, lang: stored } = useConcept();
  const { t } = useT(customerLang(stored, path));
  const nav = ops ? OPS_NAV : customerNav(account);
  return (
    <header className="border-b border-border-dark bg-white">
      <div className="mx-auto flex w-full max-w-screen-2xl flex-wrap items-center justify-between gap-3 px-6 py-3.5 sm:px-8 lg:px-10">
        <Link
          href={ops ? hrefs.ops : hrefs.overview}
          className="flex min-w-0 items-center gap-3 hover:opacity-80"
        >
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-black-7 h8 text-white"
            aria-hidden
          >
            {account.customer[0]}
          </span>
          <span className="shrink-0 rounded-full border border-border-dark bg-bg-container-grey px-2.5 py-1 p7 text-text-secondary">
            {t("Powered by CQuel")}
          </span>
          <span className="truncate text-text-primary h5">
            {account.customer}
          </span>
        </Link>
        <div className="flex items-center gap-4 sm:gap-5">
          <Link
            href="/clarifications"
            className="p6 text-text-primary hover:text-text-primary"
          >
            {t("Questions")}
          </Link>
          {ops && (
            <Button
              href={hrefs.opsNewBatch}
              type="primary"
              size="small"
              icon="plus"
            >
              {t("Create batch")}
            </Button>
          )}
          {!ops && <LangToggle />}
          <ViewToggle ops={ops} />
          <Avatar letter={account.user[0]} />
        </div>
      </div>
      <Nav
        items={nav}
        path={path}
        grouped
        activeId={ops ? undefined : activeId}
      />
    </header>
  );
}

function DetailBar() {
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const search = useSearchParams();
  const { account, lang: stored } = useConcept();
  const { t } = useT(customerLang(stored, pathname));
  const opsBar = useOpsDetailBar();
  const showAssistant =
    /^\/concept\/ops\/packages\//.test(pathname) ||
    /^\/concept\/ops\/assets\//.test(pathname);
  const ops = pathname.startsWith(OPS);
  const hasHistory = useRef(false);
  const booted = useRef(false);

  useEffect(() => {
    if (!booted.current) {
      booted.current = true;
      return;
    }
    hasHistory.current = true;
  }, [pathname, search]);

  const onBack = () => {
    if (hasHistory.current) router.back();
    else router.push(detailFallbackHref(account, pathname, search));
  };

  return (
    <header className="border-b border-border-dark bg-white">
      <div className="mx-auto flex h-16 w-full max-w-screen-2xl items-center justify-between px-6 sm:px-8 lg:px-10">
        <button
          type="button"
          onClick={onBack}
          className={cn(
            "group inline-flex items-center gap-1.5 h8 text-text-primary",
            focusRing,
          )}
        >
          <Icon name="arrow-left" size={16} />
          <span className="group-hover:underline group-hover:underline-offset-[3px]">
            {t("Back")}
          </span>
        </button>
        <div className="flex items-center gap-4 sm:gap-5">
          {showAssistant && (
            <AssistantButton
              inline
              onClick={() => opsBar?.askAssistant()}
            />
          )}
          <Link
            href="/clarifications"
            className="p6 text-text-primary hover:text-text-primary"
          >
            {t("Questions")}
          </Link>
          {!ops && <LangToggle />}
          <ViewToggle ops={ops} />
          <Avatar letter={account.user[0]} />
        </div>
      </div>
    </header>
  );
}

function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "";
  const search = useSearchParams();
  const { account, lang: stored } = useConcept();
  const ops = pathname.startsWith(OPS);
  const detail = isDetail(pathname);
  const activeId = ops
    ? undefined
    : activeCustomerTab(pathname, search, account);

  useEffect(() => {
    document.documentElement.lang = ops ? "en" : stored;
  }, [ops, stored]);

  return (
    <div className="min-h-screen bg-bg-container-grey">
      <div className="sticky top-0 z-40">
        {detail ? (
          <DetailBar />
        ) : (
          <>
            <AccountToggle />
            <AppHeader ops={ops} path={pathname} activeId={activeId} />
          </>
        )}
      </div>
      <main>{children}</main>
    </div>
  );
}

export function ConceptChrome({ children }: { children: ReactNode }) {
  return (
    <ConceptStoreProvider>
      <OpsDetailBarProvider>
        <Suspense
          fallback={<div className="min-h-screen bg-bg-container-grey" />}
        >
          <Shell>{children}</Shell>
        </Suspense>
      </OpsDetailBarProvider>
    </ConceptStoreProvider>
  );
}
