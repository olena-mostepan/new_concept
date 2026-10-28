'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ArrowLeft, ChevronDown, Globe, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { changedRecently, getWorkstream, isLive } from '@/lib/concept/derive'
import type { Account } from '@/lib/concept/model'
import { ConceptStoreProvider, useConcept } from './store'
import { CUSTOMER_NAV, OPS, OPS_NAV, counterpart, hrefs, type NavItem } from './hrefs'

function AccountToggle() {
  const router = useRouter()
  const pathname = usePathname() ?? ''
  const { accounts, account, setAccountId } = useConcept()
  const ops = pathname.startsWith(OPS)
  return (
    <div className="border-b border-cq-border bg-cq-bg">
      <div className="mx-auto flex w-full max-w-screen-2xl items-center gap-3 px-6 py-2 sm:px-8 lg:px-10">
        <span className="text-xs font-normal text-cq-muted">Dashboard</span>
        <div className="inline-flex rounded-lg border border-cq-border bg-white p-0.5" role="tablist" aria-label="Dashboard">
          {accounts.map((a) => {
            const on = a.id === account.id
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => {
                  if (on) return
                  setAccountId(a.id)
                  router.push(ops ? hrefs.ops : hrefs.portfolio)
                }}
                className={cn('rounded-md px-3 py-1 text-sm font-normal transition-colors', on ? 'bg-cq-text text-white' : 'text-cq-text-secondary hover:text-cq-text')}
              >
                {a.kind === 'pilot' ? 'Pilot' : 'Mature'}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function ViewToggle({ ops }: { ops: boolean }) {
  const router = useRouter()
  const pathname = usePathname() ?? ''
  return (
    <div className="inline-flex rounded-lg border border-cq-border bg-white p-0.5" role="tablist" aria-label="View">
      {[
        { id: false, label: 'Customer' },
        { id: true, label: 'Ops' },
      ].map((o) => (
        <button
          key={o.label}
          type="button"
          onClick={() => o.id !== ops && router.push(counterpart(pathname))}
          className={cn('rounded-md px-3 py-1 text-sm font-normal transition-colors', ops === o.id ? 'bg-cq-text text-white' : 'text-cq-text-secondary hover:text-cq-text')}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

function customerNav(account: Account): NavItem[] {
  const changed = new Set(account.workstreams.filter((w) => isLive(w) && changedRecently(w)).map((w) => w.service))
  return CUSTOMER_NAV.map((item) => ({ ...item, changed: item.group === 'services' && changed.has(item.id as Account['workstreams'][number]['service']) }))
}

function NavLink({ item, path }: { item: NavItem; path: string }) {
  return (
    <Link
      href={item.href}
      className={cn(
        'relative inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 py-3 text-sm font-normal transition-colors',
        item.match(path) ? 'border-cq-accent text-text-primary' : 'border-transparent text-cq-text-secondary hover:text-cq-text',
      )}
    >
      {item.label}
      {item.changed && <span role="img" aria-label="Changed in the last 7 days" className="h-1.5 w-1.5 rounded-full bg-brand-6" />}
    </Link>
  )
}

function Nav({ items, path, grouped }: { items: NavItem[]; path: string; grouped?: boolean }) {
  const structure = grouped ? items.filter((item) => item.group === 'structure') : items
  const services = grouped ? items.filter((item) => item.group === 'services') : []
  return (
    <nav className="border-t border-cq-border bg-white" aria-label="Sections">
      <div className="mx-auto flex max-w-screen-2xl items-center gap-8 overflow-x-auto px-6 sm:px-8 lg:px-10">
        {structure.map((item) => (
          <NavLink key={item.id} item={item} path={path} />
        ))}
        {grouped && (
          <span className="flex shrink-0 items-center gap-8">
            <span className="h-5 w-px bg-border-dark" aria-hidden />
            <span className="s3 text-text-tertiary">Services</span>
          </span>
        )}
        {services.map((item) => (
          <NavLink key={item.id} item={item} path={path} />
        ))}
      </div>
    </nav>
  )
}

function Avatar({ letter }: { letter: string }) {
  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-full border border-cq-border bg-cq-bg text-xs font-semibold text-cq-text">
      {letter}
    </span>
  )
}

function AppHeader({ ops, path }: { ops: boolean; path: string }) {
  const { account } = useConcept()
  const nav = ops ? OPS_NAV : customerNav(account)
  return (
    <header className="border-b border-cq-border bg-white">
      <div className="mx-auto flex w-full max-w-screen-2xl flex-wrap items-center justify-between gap-3 px-6 py-3.5 sm:px-8 lg:px-10">
        <Link href={ops ? hrefs.ops : hrefs.portfolio} className="flex min-w-0 items-center gap-3 hover:opacity-80">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cq-accent text-sm font-semibold text-white" aria-hidden>
            C
          </span>
          <span className="shrink-0 rounded-full border border-cq-border bg-cq-bg px-2.5 py-1 text-xs font-normal text-cq-text-secondary">Powered by CQuel</span>
          <span className="truncate text-cq-text h5">{account.customer}</span>
        </Link>
        <div className="flex items-center gap-4 sm:gap-5">
          <Link href="/clarifications" className="text-sm font-normal text-cq-text hover:text-cq-accent">
            Questions
          </Link>
          {ops && (
            <Link href={hrefs.opsNewBatch} className="btn-primary-sm">
              <Plus className="h-4 w-4" aria-hidden /> Create batch
            </Link>
          )}
          <ViewToggle ops={ops} />
          <Avatar letter={account.user[0]} />
        </div>
      </div>
      <Nav items={nav} path={path} grouped={!ops} />
    </header>
  )
}

/** Batch, workstream, project, and ops batch screens. Section pages keep the full header. */
function isInside(pathname: string) {
  return (
    /^\/concept\/batches\/[^/]+/.test(pathname) ||
    /^\/concept\/workstreams\/[^/]+/.test(pathname) ||
    /^\/concept\/projects\//.test(pathname) ||
    /^\/concept\/ops\/batches\//.test(pathname)
  )
}

function backHref(pathname: string, serviceHref?: string) {
  const project = pathname.match(/^\/concept\/projects\/([^/]+)/)
  if (project) return hrefs.workstream(project[1])
  const workstream = pathname.match(/^\/concept\/workstreams\/([^/]+)/)
  if (workstream) return serviceHref ?? hrefs.batches
  if (pathname.startsWith(`${OPS}/batches`)) return hrefs.ops
  return hrefs.portfolio
}

function InsideHeader({ pathname }: { pathname: string }) {
  const { account } = useConcept()
  const match = pathname.match(/^\/concept\/(?:workstreams|projects)\/([^/]+)/)
  const workstream = match ? getWorkstream(account, match[1]) : undefined
  return (
    <header className="border-b border-cq-border bg-white">
      <div className="mx-auto flex w-full max-w-screen-2xl items-center justify-between gap-3 px-6 py-3.5 sm:px-8 lg:px-10">
        <Link href={backHref(pathname, workstream ? hrefs.service(workstream.service) : undefined)} className="inline-flex items-center gap-1.5 text-sm font-normal text-cq-text hover:opacity-80">
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back
        </Link>
        <div className="flex items-center gap-4 sm:gap-5">
          <button type="button" className="inline-flex h-9 items-center rounded-lg border border-cq-accent bg-white px-3.5 text-sm font-normal text-cq-accent">
            Create projects
          </button>
          <span className="inline-flex items-center gap-1.5 text-sm text-cq-text-secondary">
            <Globe className="h-4 w-4" aria-hidden />
            EN
          </span>
          <span className="inline-flex items-center gap-1 text-cq-text-secondary">
            <Avatar letter={account.user[0]} />
            <ChevronDown className="h-4 w-4" aria-hidden />
          </span>
        </div>
      </div>
    </header>
  )
}

function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? ''
  const { account } = useConcept()
  const ops = pathname.startsWith(OPS)
  const inside = isInside(pathname)
  const sectionNav = !ops && (pathname.startsWith(`${hrefs.batches}/`) || /^\/concept\/workstreams\/[^/]+/.test(pathname))

  return (
    <div className="min-h-screen bg-cq-bg">
      <div className="sticky top-0 z-40">
        {inside ? (
          <>
            <InsideHeader pathname={pathname} />
            {sectionNav && <Nav items={customerNav(account)} path={pathname} grouped />}
          </>
        ) : (
          <>
            <AccountToggle />
            <AppHeader ops={ops} path={pathname} />
          </>
        )}
      </div>
      <main>{children}</main>
    </div>
  )
}

export function ConceptChrome({ children }: { children: ReactNode }) {
  return (
    <ConceptStoreProvider>
      <Shell>{children}</Shell>
    </ConceptStoreProvider>
  )
}
