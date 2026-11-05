# Cursor prompt, part 9: align the code with the CQuel design system

Run this after parts 1–8, in the same `new_concept` repo, and paste everything below the line into Cursor.

The design system is the source of truth: the Figma file "Cquel. V3" and the CQuel Design System artifact (tokens, type, components, icons). The decisions and their reasons are on the "CQuel Foundations Audit" page. You don't need either open: every value you need is written out below.

---

## Task

Move the whole app onto one set of tokens and one set of components, so that nothing is styled by hand.

Do it in this order, one commit per step:

1. Tokens
2. Type
3. Radius and shadows
4. Components
5. Icons
6. Sweep

**Don't change behaviour, routes, data or copy.** This part is visual only. The one exception is wording that the rules below explicitly change (sentence case, "Responsibility").

## 1. Tokens (`app/globals.css`)

Replace the colour part of `:root` with these tokens. Keep the `--cq-*` names as aliases until step 6, so nothing breaks in the meantime.

```css
:root {
  /* primitives */
  --black-1:#f9fafb; --black-2:#f3f4f6; --black-3:#d3d7dc; --black-4:#9da4ae; --black-muted:#6c737f;
  --black-5:#4d5761; --black-6:#384250; --black-7:#1e2832; --white:#ffffff;
  --brand-1:#fdeee9; --brand-2:#fbddd2; --brand-6:#d93f0b; --brand-7:#b5360a; --brand-8:#9a2e08;
  --amber-1:#fff7ee; --amber-2:#ffefdd; --amber-mark:#f79009; --amber-text:#a96206;
  --blue-1:#e8f1f8; --blue-2:#d2e3f2; --blue-mark:#409ae3; --blue-text:#1b71b5;
  --danger-1:#fef3f2; --danger-2:#fecdca; --danger-mark:#e97067; --danger-text:#d72d20;
  --success-1:#ecfdf3; --success-2:#abefc6; --success-mark:#12b76a; --success-text:#0d844c;
  /* semantic: use these in components */
  --text-primary:var(--black-7); --text-title:var(--black-6); --text-secondary:var(--black-5);
  --text-tertiary:var(--black-muted); --text-disabled:var(--black-3); --text-white:var(--white); --text-error:var(--danger-text);
  --border-dark:var(--black-3); --border-light:var(--black-2); --border-accent:var(--brand-2); --border-active:var(--brand-6);
  --bg-container:var(--white); --bg-container-grey:var(--black-1); --bg-accent:var(--brand-1);
  --btn-primary:var(--brand-6); --accent-hover:var(--brand-7); --accent-pressed:var(--brand-8);
  --icon-dark:var(--black-5); --icon-strong:var(--black-7); --icon-default:var(--black-muted); --icon-disabled:var(--black-3); --icon-active:var(--brand-6);
  --status-danger-bg:var(--danger-1); --status-danger-border:var(--danger-2); --status-danger-mark:var(--danger-mark); --status-danger-text:var(--danger-text);
  --status-warning-bg:var(--amber-1); --status-warning-border:var(--amber-2); --status-warning-mark:var(--amber-mark); --status-warning-text:var(--amber-text);
  --status-success-bg:var(--success-1); --status-success-border:var(--success-2); --status-success-mark:var(--success-mark); --status-success-text:var(--success-text);
  --status-info-bg:var(--blue-1); --status-info-border:var(--blue-2); --status-info-mark:var(--blue-mark); --status-info-text:var(--blue-text);
  --elevation-floating:0 4px 30px 10px rgba(82,82,82,.06); --elevation-overlay:0 4px 30px 10px rgba(82,82,82,.25);
  --focus-ring:0 0 0 3px var(--black-2); --halo-current:0 0 0 4px var(--black-2);
}
```

**Old names become aliases** for now:

| Old name | Becomes |
|---|---|
| `--cq-text` | `--text-primary` |
| `--cq-text-secondary` | `--text-secondary` |
| `--cq-muted` | `--text-tertiary` (was #9CA3AF, which fails contrast) |
| `--cq-border` | `--border-dark` (was #E5E7EB: the decision is the darker #D3D7DC) |
| `--cq-border-light` | `--border-light` |
| `--cq-bg` | `--bg-container-grey` |
| `--cq-accent`, `--cq-green`, `--cq-owner-you` | `--brand-6` |
| `--cq-accent-hover` | `--brand-7` |
| `--cq-accent-muted`, `--cq-owner-you-bg` | `--bg-accent` |

`--cq-owner-cquel*` and `--cq-owner-suppliers*` map to the neutral pill colours (see Tag below).

**Map shadcn onto CQuel** in `:root`:

| shadcn token | Becomes |
|---|---|
| `--foreground` | `--text-primary` |
| `--muted-foreground` | `--text-secondary` |
| `--border`, `--input` | `--border-dark` |
| `--ring` | `--black-6` |
| `--primary` | `--brand-6` |
| `--primary-foreground` | `#fff` |
| `--destructive` | `--danger-text` |
| `--background` | `--bg-container-grey` |
| `--card`, `--popover` | `--white` |

Then delete the `.dark` block. There's no dark theme.

**In `@theme inline`**, expose the semantic tokens as Tailwind colours with these exact names: `text-primary`, `text-title`, `text-secondary`, `text-tertiary`, `border-dark`, `border-light`, `bg-container`, `bg-container-grey`, `bg-accent`, `brand-6`, `brand-7`, `status-*`. That way `text-text-secondary`, `border-border-dark` and the rest work.

## 2. Type

Add one utility class per Figma text style in `@layer components`. Every class sets the font family to Schibsted Grotesk.

| Class | Size / line height | Weight | Extra |
|---|---|---|---|
| `.h3` | 32/40 | 600 | tabular-nums |
| `.h4` | 24/32 | 600 | |
| `.h5` | 20/28 | 600 | |
| `.h6` | 18/26 | 600 | |
| `.h7` | 16/20 | 600 | |
| `.h8` | 14/20 | 600 | |
| `.p6` | 14/20 | 400 | |
| `.h9` | 12/16 | 600 | |
| `.p7` | 12/16 | 400 | |
| `.s3` | 12/16 | 600 | uppercase, letter-spacing .04em |
| `.l1` | 13/18 | 400 | |
| `.l1-strong` | 13/18 | 600 | |

Then:

- **Only two weights.** Replace every `font-bold`, `font-extrabold` and `font-medium` with `font-semibold` (600) or `font-normal` (400). Medium becomes 400 unless it's a heading or label.
- **Load only those weights.** In `app/layout.tsx`, load just 400 and 600 from Google Fonts (`wght@400;600`).
- **Drop the off-scale sizes.** Replace `text-[10px]`, `text-[11px]`, `text-[13px]` and `text-[15px]` with the nearest class: 10 and 11 become `.p7` or `.s3`, 13 becomes `.l1` (steppers only) or `.p6`, and 15 becomes `.h7` (row titles) or `.p6`.
- **One page title style.** Page titles use `.h4` (the five versions found today go). Section headings use `.h5`, card titles `.h7` and column labels `.s3` in `text-tertiary`.
- **No pure black text.** Replace `text-black` with `text-text-primary`.

## 3. Radius and shadows

- Set `--radius` to 8px (was 10).
- Use these four radii:
  - **4**: checkbox and small button.
  - **8**: buttons, inputs, check cards and needs panels.
  - **12**: cards and drawers. Change `rounded-xl` / `rounded-2xl` on cards to `rounded-[12px]`, or add `--radius-lg`.
  - **full**: pills, dots and circles.
- Cards get **no shadow**. Remove `shadow-sm` and `shadow` from cards and keep the `border-border-dark` line.
- Only menus and popovers use `--elevation-floating`, and only drawers and modals use `--elevation-overlay`.

## 4. Components

Build or refactor these components, then use them everywhere. They live in `components/ds/` and keep their old export names as re-exports where other files import them.

- **Button.** `type` is `primary | secondary | tertiary | link | danger`; `size` is `large` (40, padding 16) | `default` (32, padding 12) | `small` (24, padding 8, radius 4, 12px text).
  - Primary: brand-6, with hover brand-7 and pressed brand-8.
  - Secondary: white with `border-dark` and ink text, hover black-1.
  - Link: ink with an underline.
  - Danger: danger-text on white with a danger-2 border.
  - Focus: a 2px brand-6 outline, offset 2px.
  - Disabled: black-2 fill, black-4 text.
  - Replace `.btn-primary`, `.btn-primary-sm`, `.btn-secondary`, `.btn-secondary-sm`, `.btn-link` and all 27 hand-styled buttons. Size 36 goes away.
  - Rule: at most one primary per screen or panel; lists only ever use a secondary or link "View".
- **Tag.** `type` is `neutral | accent | strong | info | success | warning | danger`; `size` is `small` 24 | `big` 32; `dot` is optional. Always fully rounded, sentence case, 12/600 (14/600 for big).
  - Accent: brand-1 background, brand-2 border, brand-7 text.
  - Neutral: black-1 background, border-dark, text-secondary.
  - Status types use the four `status-*` tokens and always show the dot.
  - Replaces `Tag`, `ServiceTag` (no more 11px capitals) and `PlanPill`.
- **ResponsibilityPill**, which replaces `OwnerPill` and `StatusPill`: `you` → Accent "With you"; `cquel` and `suppliers` → Neutral; `done` → black-2 with text-secondary. Never use status colours for this.
- **Card.** White, `border-dark`, radius 12, no shadow. The header is padded 12/16 with an `.h7` title, a `border-light` line and an optional right slot. The body is padded 16, with a `flush` option for tables.
- **Tables** (the shared `th` and `td` classes, `ProjectsTable`, `lists.tsx`, the service section tables):
  - Group header: `.h7` plus the count in text-tertiary, padding 12/16/12/32.
  - Column labels: `.s3` in text-tertiary, padding 8/16/8/32.
  - Rows: padding 12/16/12/32, at least 56 tall, `border-light` between rows, hover black-1.
  - Only the first column is `.h8` in `text-title`; other cells are `.p6`, with second lines `.p7` in text-secondary.
  - The row action is an underlined "View" link.
  - The column for who it's with is called "Responsibility".
- **ChangedDot** (`ui.tsx`): 6px brand-6, 16px left of the name (was 7px at 12), sitting in the row's 32 left padding, with `aria-label="Changed in the last 7 days"`.
- **Form fields:**
  - Replace the five copies of `fieldClass` / `selectClass` and the shadcn Input / Textarea styling with one `Input`, `Select` and `Textarea`.
  - The box is 40 tall, or 32 for filter bars, with radius 8, `border-dark`, white, no shadow, 14px text, a text-tertiary placeholder and padding 0 12.
  - Hover: black-4 border. Focus: black-6 border plus `--focus-ring`, with no orange. Error: danger-mark border with a `.p7` danger-text message below. Disabled: black-1 fill and text-tertiary, with no opacity fade.
  - Select uses a 16px chevron at right 12 in text-secondary.
  - Search uses a 16px search icon at left 12 in icon-default.
  - Textarea is at least 88 tall, padded 8/12, with no resize handle.
  - **FormField** wraps a field: the label is `.h8` in text-title, the hint `.p7` in text-secondary, with 4 between each part; fields stack 12 apart. Replace `labelClass`, which is 14/500 today.
- **Checkbox and Radio:**
  - Checkbox: a 16px box with radius 4 and a border-dark border. Checked is a black-7 fill with a white tick. Never orange, so restyle the shadcn checkbox too.
  - Radio: 16px; checked is a 5px black-7 ring.
- **CheckCard** (ops drawer and new batch): padding 12, radius 8, border-dark. Selected is a 1.5px black-7 border plus a checked box. The title is `.h8` and the line `.p7` in text-secondary.
- **Route** (`RouteWithNeeds`, `ProjectRoute`):
  - Bars are 6 tall and 12 apart, with the label under the bar.
  - Only the current service is dark: done black-3, now black-7, next black-2, and Not required a dashed black-3 bar with its reason.
  - Labels are `.l1`, or `.l1-strong` for the current one, with the second line `.p7` in text-tertiary. No orange in the route.
- **Steps** (`StepsWithNeeds`, `WorkstreamSteps`):
  - Dots: done is 8px black-4, now is 10px black-7 with `--halo-current`, and next is an 8px outline in black-4.
  - Lines are 1px: black-3 up to the current step, black-2 after.
  - Labels are `.l1`, or `.l1-strong` for now.
- **NeedsPanel:**
  - Panel: padding 12, radius 8, 240 wide.
  - Borders: solid black-2 when it's with the customer, dashed border-dark for CQuel or suppliers, and a black-1 background once received.
  - No capitals heading. Each need has a 6px mark, a title and a second line in text-tertiary saying who it's with and when.
  - A need that's with the customer gets the brand-6 mark and an `.h8` title.
  - The stem to its step is 1px border-dark.
- **PhaseStepper** (`CustomerDeliveryPhasesStepper`, `CustomerPhaseStepper`):
  - Circles are 28px with an 8px gap to the line. Remove all `--cq-green`.
  - Done: black-2 fill with a black-5 tick.
  - Now: white with a 1.5px black-7 ring, `--halo-current` and the number in 13/600.
  - Next: white with a black-2 outline and the number in text-tertiary.
  - Names are `.l1`, or `.l1-strong` for now; key dates are `.p7` in text-tertiary.
  - A phase waiting on the customer shows a brand-6 dot and "Confirm dates" in brand-7 `.h9` under it. The circles never turn orange.
  - The tinted orange and green card goes.
- **Progress:** 4 tall, black-2 track, black-6 fill (was orange in `ui.tsx`).
- **PlanTrack** (`ops-bits.tsx`): four 6px dots, 6 apart, black-7 for done and border-dark for to go.
- **Details grid:** the label is `.p7` in text-secondary and the value `.h8`. Four columns (two on phones), with gaps of 12 between rows and 24 between columns.
- **KeyFigure:** the number in `.h3` with tabular figures, and the label `.p7` in text-secondary underneath.

## 5. Icons

- **Export the set.** Export the 92 SVGs from the Figma component set "Icon" into `public/icons/` (or `components/ds/icons/`). Use kebab-case names: chevron-down, check, search, trash, mail, heat-pump and so on.
- **Make them recolourable.** Replace the fill and stroke `#4D5761` in every file with `currentColor`.
- **Add `<Icon name size />`**, with sizes 16, 20 and 24 (default 16). It renders the SVG inline with `aria-hidden`, and its colour comes from the text colour. The colour roles are `text-icon-dark` (default), `-strong`, `-default` (muted), `-disabled`, `-active` and `-white`.
- **Replace lucide** at all 60 import sites: ChevronDown/Up/Left/Right → the chevrons, Check/CheckIcon → check, X/XIcon → cross, Search → search, FileText/FileIcon → document, Upload/CloudUpload/FileUp → upload, AlertCircle → alert, HelpCircle → question, Plus → plus, Calendar → calendar, ArrowLeft/Right → the arrows, Trash2 → trash, Mail → mail, MessageCircle → message, RefreshCw → refresh, ImageIcon → image, Loader2 → spinner, Home → home, ExternalLink → external-link, MoreHorizontal → more-horizontal, MapPin → location, Users → people, User → profile, Pencil → edit, Folder → programme, Building2 → building, Sun → solar, Zap → fast, Info → info.
- **Leftovers.** Keep lucide only where the set has nothing (e.g. Sparkles, Globe, Rocket, GripVertical, PanelLeft), at size 16 and `strokeWidth={1.5}`. List those in your final message.
- **Sizes.** Use 16 in buttons, inputs and table rows; 20 in card headers and menus; 24 in empty states.

## 6. Sweep

- Replace every hard-coded hex in `app/` and `components/` (about 330 today) with a token or Tailwind token class. The nine near-identical greys map to the nearest of `text-primary`, `text-secondary` and `text-tertiary`.
- Replace off-scale spacing with the nearest step on the scale 4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48: 2 → 4, 6 → 4 or 8, 10 → 8 or 12, 14 → 12 or 16, 28 → 24 or 32, 36 → 32 or 40.
- Use sentence case for buttons, pills and headings.
- Once nothing uses the `--cq-*` aliases, delete them.

## Done when

- `grep -rE "#[0-9a-fA-F]{6}" app components` finds only `globals.css` and the icon files.
- No `font-bold`, `font-extrabold`, `font-medium` or `text-black` remains, and no `text-[10px|11px|13px|15px]` outside the `.l1` class.
- No `--cq-green`, `--cq-accent-muted` or `shadow-sm` remains on cards.
- No `lucide-react` import remains except the ones you list.
- Orange (brand-6 / brand-7 / bg-accent) appears only in:
  - the primary button
  - the active nav
  - the "With you" pill
  - the Accent tag
  - the changed dot
  - a need that's with the customer
  - a delivery phase waiting on the customer

  It does not appear on checkboxes, progress, route, steps, phase circles or focus rings on fields.
- The concept pages (dashboard, Workstreams, Estimates, Planning, Tender, Pricing, Delivery, the batch, workstream and project pages, and ops) look the same apart from the styling changes above. There are no layout shifts beyond the new paddings.
- Write the checklist above into your final message, with pass or fail for each item.
