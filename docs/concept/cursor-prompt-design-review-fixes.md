# Cursor prompt, part 24: design review fixes

Paste everything below the line into Cursor, in the `new_concept` repo.

**Before you start:** parts 22 and 23 must be in the code (`lib/concept/words.ts`, `/concept/assets`, `/concept/packages`, `FilterChips`). If they're missing, stop and say so.

This prompt is closed. It brings the prototype in line with the CQuel design system (version 14) and fixes the inconsistencies found in the 3 Nov review. Customer and ops screens both change; layout and data don't, except where a section below says so.

Phones are out of scope. Don't add mobile layouts.

---

## Why

The review found the same thing built several ways: three card paddings, three done-phase styles, two button systems, two token names for one colour, and copy that breaks the word rules. `CLAUDE.md` still describes the old system, so old patterns keep coming back. This prompt fixes the source first (CLAUDE.md, tokens, `ui.tsx`), then the screens.

## 1. CLAUDE.md

Replace the whole **Design system** section, and the "Customer status" line in **Model rules**, with this:

```md
## Design system

- The source of truth is the CQuel design system (Design System artifact, namespace CQuelDS). Read its README before changing UI.
- Tokens live in `app/globals.css` under the design system's names: `text-primary`, `text-title`, `text-secondary`, `text-tertiary`, `border-dark`, `border-light`, `bg-container`, `bg-container-grey`, `bg-accent`, `brand-6`, `black-1`…`black-7`, `status-*`. There are no `cq-*` tokens.
- Type uses the classes only: `h4` `h5` `h6` `h7` `h8` `h9` `p6` `p7` `s3` (and `h3` for key figures). Never `text-sm`, `text-xs` or a pixel size. 400 and 600 only.
- Orange (`brand-6`) means "this needs you, or this is where you are". It's a mark, never a fill.
- Customer status is only "Your action" (`ResponsibilityPill`). Ops shows Your action / CQuel's action / Suppliers' action / Done. Never "With you" or "Waiting on you".
- Components are in `components/concept/ui.tsx` and match the design system: Card, Button, Tag, ResponsibilityPill, FilterBar, FilterChips, YourActionOnly, Table classes, PhaseStepper, Icon.
- Icons: the CQuel set in `public/icons/` through `<Icon name="…" />`. No lucide in concept code.
- Focus: a 2px black-7 outline, 2px out, on everything you can tab to.
- Desktop only for now.
```

Also fix the nav line: customer nav is Overview · Assets | SERVICES · Estimates, Planning, Tender, Pricing, Delivery; ops nav is Portfolio · Workstreams · the five services. Remove the reference to `kickoff.tsx`.

## 2. Tokens (`app/globals.css`)

- **Radius** in `@theme`: `--radius-sm: 4px`, `--radius-md: 8px`, `--radius-lg: 12px`, and add `--radius-image: 10px`. Remove `--radius-xl`. Then:
  - cards and summary cards: `rounded-xl` and `rounded-[12px]` → `rounded-lg`;
  - buttons, inputs, popovers that use `rounded-lg` today (8px) → `rounded-md`;
  - the site photo and the Overview search box: `rounded-[10px]` → `rounded-[var(--radius-image)]`.
- **Aliases:** remove `--surface-primary`, `--surface-strong`, `--text-inverse`, `--border-default` and their `--color-*` lines. Use `bg-container`, `black-7`, `text-white`, `border-dark`.
- **Legacy `cq-*`:** replace every use in `components/concept` and `app/concept`, then delete the legacy block and its `--color-cq-*` lines.

  | Old | New |
  |---|---|
  | `text-cq-text` | `text-text-primary` |
  | `text-cq-text-secondary` | `text-text-secondary` |
  | `text-cq-muted` | `text-text-tertiary` |
  | `border-cq-border` | `border-border-dark` |
  | `border-cq-border-light` | `border-border-light` |
  | `bg-cq-bg` | `bg-bg-container-grey` |
  | `bg-cq-text`, `border-cq-text`, `ring-cq-text` | `bg-black-7`, `border-black-7`, `ring-black-7` |
  | `bg-cq-border`, `bg-cq-border-light` | `bg-black-3`, `bg-black-2` |
  | `bg-cq-muted`, `border-cq-muted` | `bg-black-4`, `border-black-4` |
  | `text-cq-owner-you` | `text-brand-7` |
  | `text-cq-owner-cquel`, `text-cq-owner-suppliers` | `text-text-secondary` |
  | `text-cq-accent`, `bg-cq-accent`, `border-cq-accent` | check each: keep `brand-6` only where it marks Your action or the current place; otherwise `text-primary` / `black-7` |
  | `var(--cq-text)` | `var(--black-7)` |
  | `var(--cq-green)`, `var(--cq-accent)` | `var(--brand-6)` (check each, as above) |
  | `var(--cq-accent-muted)` | `var(--bg-accent)` |
  | `var(--cq-accent-muted-strong)` | `var(--brand-2)` |
  | `text-cq-link`, `--cq-link` | `text-text-primary` with an underline |

  `components/customer/*` (the product's reused delivery components) also use `cq-*`. Change them the same way; don't change their behaviour.
- **Type:** replace Tailwind sizes in concept code. `text-sm` → `p6` (`h8` when it's `font-semibold`), `text-xs` → `p7` (`h9` when semibold), `text-lg font-semibold` → `h6`, `text-base` → `p6`. Remove `font-normal`, which is now redundant. `text-[15px]` → `h7`. `l1` → `p6`, `l1-strong` → `h8`; delete the `.l1` and `.l1-strong` classes.
- **Shadows:** set `--elevation-floating: 0 8px 24px rgba(30, 40, 50, 0.12)` and replace the three `shadow-[0_8px_24px_rgba(30,40,50,.12)]` with `shadow-floating`.
- **Scrim and focus:** add `--bg-scrim: rgba(30, 40, 50, 0.25)` and use it behind drawers and modals. Set `--focus-ring: 0 0 0 2px #ffffff, 0 0 0 4px var(--black-7)`.
- **Buttons in CSS:** every `.btn-*` focus outline becomes `outline-black-7`. `.btn-link` becomes `font-semibold`, with the underline in `border-dark` that turns `text-primary` on hover (no colour change).
- Delete `styles/globals.css`. Nothing imports it.

## 3. `ui.tsx` and shared components

- **Page:** side padding `px-8` at every width.
- **Card:** defaults become the design system's: header `px-4 py-3`, title `h7 text-text-primary`, body `p-4`. Then remove every `titleClassName`, `headerClassName` and `bodyClassName` override that sets `h6`, `h7`, `px-6`, `py-1`, `py-2` or `py-4`. Keep `p-0` for flush tables. List any override you keep and why.
- **Button:** one component with the design system API: `type: 'primary' | 'strong' | 'secondary' | 'tertiary' | 'link' | 'danger'`, `size: 'large' | 'default' | 'small'` (40 / 32 / 24), `href`, `disabled`, `onClick`. Replace `.btn-primary-sm`, `.btn-secondary-sm` and `DecisionButtons` with it. Keep the CSS classes until nothing uses them, then delete them.
- **Duplicates:** delete `StatusPill.tsx` and use `OwnerPill` (rename it `ResponsibilityPill`). Delete the unused `Tag`, `Steps`, `Needs` and `NeedRow` from `ui.tsx`. `ServiceTag` stays but renders the neutral Tag.
- **FilterChips:** the selected chip is no longer filled. Selected: `border-[1.5px] border-black-7 h8`, count in `text-text-primary`. Unselected stays as it is. Add `role="radiogroup"` on the row and `role="radio"` + `aria-checked` on each chip.
- **Focus:** add `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black-7` to tabs, chips, summary cards, table row links, breadcrumb links and the pager links. `YourActionOnly` already does this.
- **Table header and groups:** one header class (`th`) with `s3 text-text-tertiary` everywhere, including the batch page, whose column labels are sentence case today. Group headers are `h7` with the count after it in `p6 text-text-tertiary` ("In progress 1"), not `h6` with " · 1". Group headers start at the same 32px as the rows. The first column is `h8 text-text-title` on every table, including service pages, where it's regular weight today.
- **Icon:** add `Icon({ name, size = 16, className, label })` that renders `/icons/<name>.svg` as a CSS mask in `currentColor`. Put the CQuel icon SVGs (download them from the design system's Icons, or export from Figma "Cquel. V3") in `public/icons/`. Replace lucide in concept code: `ChevronRight` → `chevron-right`, `ChevronDown` → `chevron-down`, `ChevronUp` → `chevron-up`, `Check` → `check`, `Search` → `search`, `X` → `cross`, `Plus` → `plus`, `ArrowLeft` → `arrow-left`. `Globe` and `Circle` have no CQuel icon: list where they're used and leave them.

## 4. Screens

- **Header (`ConceptChrome.tsx`):** the account mark is no longer orange. Use the customer's logo when the account has one; otherwise its initial on a `black-7` square, white `h8` text, `rounded-md`. "Powered by CQuel" uses `p7`.
- **Delivery package, Assets table (`DeliveryWorkstream.tsx` / `CustomerPhaseStepper`):**
  - Remove "confirm ›" and "overdue" from under the mini stepper in rows. The mini stepper is the compact PhaseStepper: 20px circles; done `bg-black-2` with a `black-5` tick; current white with a 1.5px `black-7` ring and the `halo-current` shadow; next white with a `black-3` border and the number in `text-tertiary`.
  - The Status column shows one state per row. A row with a date to confirm reads "Date to confirm" in `h8`; otherwise "On track", "Complete", "Overdue" (status text, no orange) or "Awaiting start". Rows that are awaiting start show nothing about confirming.
  - Confirming stays on the asset page.
- **Delivery phase circles everywhere** (asset page "Delivery at this asset", package page, delivery tab): use the same look as the compact one above, at 28px. On the asset page the done circles are solid black today; change them.
- **Batch route (`BatchView.tsx` / `RouteWithNeeds.tsx` / `ui.tsx` Route):** drop "Getting started" from the customer route. A service the batch has passed shows its count and "<n> passed through"; it never reads "Next" once later services have started.
- **Copy** (customer screens, and `data.ts` strings that show on them):
  - "Workstream started" → "Package started" (three activity items in `data.ts`).
  - "Waiting on you · n" (`RightNow.tsx`) → "Your action · n".
  - "6 buildings joined" → "6 assets joined"; "Estimates ready for 3 more buildings" → "Estimates ready for 3 more assets".
  - "Kick-off to handover" (`ops-shared.tsx`) → "Start to handover".
  - History detail: stop turning dashes into " · " inside a range. "€23–28k" stays "€23–28k"; only a dash between two phrases becomes " · ".
  - Start date column on the Delivery Assets table: "12 Aug 2026" → "12 Aug" (no year, as everywhere else).
  - Product stepper strings: sentence case ("Confirm", "Overdue") wherever they still show.
- **Leave as they are:** "Not required" (it's the agreed wording), the nav item highlighted on package pages, the orange ChangedDot in the nav and on rows, the Delivery tab name, the Overview search height, ops words.

## Check

1. `grep -rn "cq-" components/concept app/concept app/globals.css` returns nothing.
2. `grep -rnE "\btext-(xs|sm|base|lg)\b|text-\[1[0-9]px\]|\bl1\b" components/concept app/concept` returns nothing.
3. `grep -rn "lucide-react" components/concept app/concept` returns only the files that use `Globe` or `Circle`.
4. `grep -rn "rounded-xl\|rounded-\[12px\]\|--surface-strong\|text-inverse\|border-default" components/concept app` returns nothing.
5. `grep -rn "Workstream started\|Waiting on you\|Kick-off\|Getting started" components/concept app/concept lib/concept` returns nothing on customer screens.

## Done when

- **CLAUDE.md:** the Design system section reads as above, with no mention of `cq-*`, "With you", owner colours or `kickoff.tsx`.
- **Cards:** every card on Overview, batch, package, asset and service pages has its title at the same 16px inset, in `h7`.
- **Tables:** every table has `s3` capital column labels, an `h8` first column, and `h7` group headers with the count in tertiary.
- **Delivery:** no "confirm ›" in rows; one status per row; phase circles look the same on the asset page, the package page and in rows.
- **Batch route:** no Getting started; passed services don't say "Next".
- **Header:** no orange square.
- **Chips:** the selected chip is outlined, not filled.
- **Focus:** tabbing through Overview, Assets and a package page shows a black outline on every stop.
- **Unchanged:** layout, data (except the strings in section 4), routes, nav highlighting, "Not required".
- **Build:** `npm run build` passes.
- **Report:** write this checklist into your final message with pass or fail for each item, and list every file you touched.
