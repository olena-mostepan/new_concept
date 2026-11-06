# CQuel design system: component props

The props each design-system component takes, as TypeScript. Documentation only: kept in a .md file so the repo's TypeScript build ignores it.

```ts
// CQuel components — window.CQuelDS. Types are documentation.
import type { ReactNode } from 'react';

export interface ButtonProps { /** strong: dark fill, the one way on from an orientation page. primary: orange, the one action that moves the work on. */ type?: 'primary' | 'strong' | 'secondary' | 'tertiary' | 'link' | 'danger'; size?: 'large' | 'default' | 'small'; /** 16px (14 on small), 8 from the label. Left for actions; right only 'chevron-right' on a button that goes to another page. Never on 'link'. */ icon?: IconName; iconPosition?: 'left' | 'right'; disabled?: boolean; href?: string; onClick?: () => void; ariaLabel?: string; children: ReactNode; className?: string }
/** Square icon-only button. label is required: it's the tooltip and the screen-reader name. */
export interface IconButtonProps { icon: IconName; label: string; type?: 'secondary' | 'tertiary'; size?: 'large' | 'default' | 'small'; href?: string; onClick?: () => void; disabled?: boolean }
export interface TagProps { /** 'strong' is retired: don't use it in new screens */ type?: 'neutral' | 'accent' | 'strong' | 'info' | 'success' | 'warning' | 'danger'; size?: 'xsmall' | 'small' | 'big'; dot?: boolean; children: ReactNode }
export interface ResponsibilityPillProps { owner: 'you' | 'cquel' | 'suppliers' | 'done'; /** 'customer' (default) renders only owner 'you' */ audience?: 'customer' | 'ops'; children?: ReactNode }
export interface CardProps { title?: ReactNode; action?: ReactNode; flush?: boolean; /** grey strip under the body: a footer line and at most one link or button */ footer?: ReactNode; children: ReactNode; className?: string }
/** Same rule as PageHeader facts: label p7 tertiary, 2, value p6; min 160 wide, 40 apart, 16 between rows. detail: optional p7 third line, cards only. */
export interface DetailsGridProps { items: { label: string; value: ReactNode; detail?: ReactNode; href?: string }[] }
export interface KeyFigureProps { value: ReactNode; label: string; size?: 'big' | 'default' }
export interface TableColumn { key: string; label?: string; width?: string; type?: 'title' | 'text' | 'twoLines' | 'owner' | 'chevron' | 'action' | 'number'; actionLabel?: string; /** twoLines: main line in h8 */ emphasis?: boolean }
/** A 'title' cell may be a string or {main, detail}: detail is a p7 text-tertiary meta line ("Flagship sites · 6 assets"). */
export interface TableProps { title?: string; count?: number; /** accessible name when there's no title */ label?: string; /** text when there are no rows */ empty?: string; columns: TableColumn[]; rows: (Record<string, any> & { id?: string; changed?: boolean; href?: string; muted?: boolean })[] }
export interface ChangedDotProps {}
export interface FormFieldProps { label: string; hint?: string; error?: string; width?: number | string; children: ReactNode }
export interface InputProps { value?: string; defaultValue?: string; placeholder?: string; type?: string; size?: 'default' | 'small'; error?: boolean; disabled?: boolean; search?: boolean; onChange?: (e: any) => void }
export interface SelectProps { options: (string | { value: string; label: string })[]; value?: string; defaultValue?: string; placeholder?: string; size?: 'default' | 'small'; error?: boolean; disabled?: boolean; onChange?: (e: any) => void }
export interface TextareaProps { value?: string; defaultValue?: string; placeholder?: string; rows?: number; error?: boolean; disabled?: boolean; onChange?: (e: any) => void }
export interface CheckboxProps { checked?: boolean; label: ReactNode; detail?: ReactNode; onChange?: (e: any) => void }
export interface RadioProps { name?: string; checked?: boolean; label: ReactNode; onChange?: (e: any) => void }
export interface CheckCardProps { title: string; line?: string; selected?: boolean; onClick?: () => void }
export interface Need { title: string; line?: string; owner: 'you' | 'cquel' | 'suppliers' | 'received' }
/** Chips on a track. state 'now' with count > 0 reads "Label · n"; line is one p7 line under the chip. */
export interface StepsProps { steps: { label: string; state?: 'done' | 'now' | 'next'; count?: number; line?: string }[] }
export interface NeedsPanelProps { needs: Need[] }
/** source: where the date comes from. Start: 'Contract start date' | 'Contract signed' | 'LOI signed' | 'From invoice · date to confirm'. Other phases: 'Site check report' | 'From invoice · date to confirm' | 'Estimate'. */
export interface PhaseStepperProps { /** 'compact': one Chip for the phase the asset is in (table rows) */ size?: 'default' | 'compact'; phases: { name: string; state?: 'done' | 'now' | 'next' | 'needs-you'; date?: string; source?: string; action?: string }[] }
export interface ProgressProps { value: number; max: number; label?: string }
export interface PlanTrackProps { done: 0 | 1 | 2 | 3 | 4 }
export interface FilterFieldProps { label: string; children: ReactNode }
export interface SearchFieldProps { label?: string; placeholder?: string; value?: string; defaultValue?: string; width?: number; onChange?: (e: any) => void }
export interface FilterSelectProps { label: string; allLabel?: string; options: (string | { value: string; label: string })[]; value?: string; defaultValue?: string; onChange?: (e: any) => void }
export interface FilterBarProps { children: ReactNode; onClear?: () => void; aside?: ReactNode }
/** The batch page's service filter: All, then each service with projects. */
export interface ServiceCardsProps { options: { id: string; label: string; count: number; done?: number }[]; value?: string; onChange?: (id: string) => void; label?: string }
export interface TabsProps { /** current: the package's/asset's current service (orange dot, 'Current service'). isNew: something unseen (orange dot, 'New'). Never both. */ tabs: { id: string; label: ReactNode; current?: boolean; isNew?: boolean }[]; value?: string; onChange?: (id: string) => void }
export interface InfoDrawerProps { title: string; items: { label: string; value: ReactNode }[]; footer?: ReactNode; open?: boolean; inline?: boolean; onClose?: () => void }
export interface FilterChip { /** '' is the All chip */ id: string; label: string; count?: number }
export interface FilterChipsProps { options: FilterChip[]; value?: string; onChange?: (id: string) => void; label?: string }
/** Retired: use PageHeader kind 'asset'. */
export interface AssetFact { label: string; value: ReactNode }
export interface AssetHeaderProps { title: string; /** "<postcode> <city> · <batch>" */ meta?: ReactNode; /** at most 6 shown */ facts?: AssetFact[]; /** site photo we hold; omit for none (no placeholder) */ photo?: { src: string; alt?: string } }
/** One per project on the asset page: the package, its services as display chips, the strong Open package button, and this asset's own data for the current service as children. */
/** Retired: use PackageCard. */
export interface PackageStripProps { name: string; service?: ServiceId; completed?: boolean; services?: { label: string; lead: 'done' | 'now' }[]; href?: string; onOpen?: () => void; title?: string; aside?: string; children?: ReactNode }
export interface PagerProps { index: number; total: number; prev?: { label: string; href?: string; onClick?: () => void }; next?: { label: string; href?: string; onClick?: () => void }; /** default "in this package" */ context?: string; /** default "asset" */ noun?: string }
export interface NeedsDecisionRow { id?: string; href?: string; changed?: boolean; package: { main: string; detail?: string }; next: { main: string; detail?: string } }
export interface NeedsDecisionProps { rows: NeedsDecisionRow[]; total?: number; limit?: number; title?: string; /** right slot, e.g. "5 packages" */ countLabel?: string; nameLabel?: string; seeAllHref?: string; onSeeAll?: () => void }
export type IconName = 'access-cap' | 'add-building' | 'alert' | 'arrow-left' | 'arrow-right' | 'battery-storage' | 'building' | 'calendar' | 'check' | 'chevron-down' | 'chevron-left' | 'chevron-right' | 'chevron-up' | 'cross' | 'document' | 'download' | 'edit' | 'ev-charging' | 'external-link' | 'filter' | 'heat-pump' | 'info' | 'led' | 'more' | 'plus' | 'search' | 'solar' | 'trash' | 'upload' | string;
/** The CQuel icon set, recoloured with currentColor. Set CQuelDS.iconBase = '/icons/' to load '<name>.svg' from your own folder. */
export interface IconProps { name: IconName; size?: 16 | 20 | 24; /** icon role token: 'strong' | 'default' | 'disabled' | 'white' | 'active' */ role?: string; /** give a label only when the icon carries meaning on its own */ label?: string; src?: string; className?: string }
export interface Crumb { label: string; href?: string }
export interface BreadcrumbsProps { items: Crumb[] }
/** Batch, package and asset pages. Gaps fixed: crumbs 24 · type label 4 · title 16 · facts; 24 below. Facts with no value are dropped. */
export interface PageHeaderProps { crumbs?: Crumb[]; /** right of the breadcrumbs, e.g. a Pager */ crumbAside?: ReactNode; kind?: 'batch' | 'package' | 'asset'; title?: ReactNode; facts?: ({ label: string; value: ReactNode } | { label: string; select: FactSelectProps })[]; /** package: StatusCard; asset: the site photo; batch: none */ aside?: ReactNode }
export interface TypeLabelProps { kind: 'batch' | 'package' | 'asset' }
export type ServiceId = 'indicative' | 'scope' | 'tender' | 'pricing' | 'delivery';
/** 3D service illustration. Only in StatusCard (116) and PackageStrip (72). */
export interface ServiceIconProps { service: ServiceId; size?: 116 | 72 }
/** Package page aside: 'This package is in <service>' and the strong 'See …' button. */
export interface StatusCardProps { service?: ServiceId; href?: string; onClick?: () => void; completed?: boolean; /** 'This package is Closed · <closedOn>', grey icon, no button */ closed?: boolean; closedOn?: string }
/** Detail pages' top bar: Back on the left, account tools (children) on the right. Replaces the app header and section nav. */
export interface DetailBarProps { backHref?: string; onBack?: () => void; backLabel?: string; children?: ReactNode }
export interface SummaryCardProps { label: string; value: ReactNode; line?: string; /** makes it a filter toggle */ onClick?: () => void; pressed?: boolean }
export interface ListFooterProps { total: number; limit?: number; open: boolean; onOpen: () => void; /** shown after the total when open: "assets" */ noun?: string }
export interface EmptyStateProps { children?: ReactNode; text?: string; action?: ReactNode; /** adds card padding */ inCard?: boolean }
export interface BannerProps { type?: 'neutral' | 'info' | 'success' | 'warning' | 'danger'; title?: string; children?: ReactNode; action?: ReactNode }
export interface ActivityListProps { items: { title: string; text?: string; date: string; aside?: string }[]; empty?: string }
/** type: the file type tag ("PDF", "3 PDF", "12 XLS"). action: Download (download icon) or View (chevron, for a set). */
export interface DocumentListProps { items: { name: string; type?: string; meta?: string; action?: 'Download' | 'View'; href?: string; onClick?: () => void }[]; empty?: string }
/** Date first. you: the event still waits on the customer (orange dot). year: shown above the first event of each year. */
export interface TimelineProps { items: { event: string; detail?: string; date: string; year?: string; you?: boolean }[]; empty?: string }
export interface ServicesBarProps { services: { id: string; label: string; count: number; line?: string; href?: string }[]; completed?: { count: number; line?: string } }
export interface ModalProps { open: boolean; title: string; subtitle?: string; children: ReactNode; /** buttons, right-aligned: tertiary Cancel, then the primary */ footer?: ReactNode; onClose: () => void; inline?: boolean }
export interface TooltipProps { content: ReactNode; children: ReactNode; /** 'definition': sentences, up to 300 wide; only for TypeLabel */ variant?: 'label' | 'definition' }
export interface YourActionOnlyProps { checked: boolean; onChange: (checked: boolean) => void; label?: string }
/** Display chip (no onClick, never clickable): 24px (size 'big': 32px, for PackageStrip services), lead done (white, border, tick) | now (accent, dot) | next (dashed); same look on white and grey. Filter chip (onClick): 32px, black when selected. */
export interface ChipProps { children: ReactNode; lead?: 'done' | 'now' | 'next'; /** Display chips only: 'big' is 32px, for PackageStrip services. */ size?: 'default' | 'big'; count?: number; selected?: boolean; onClick?: () => void }

/** Momentum: cumulative lines over months. One accent series (brand-6 + soft fill); others ink, dashed. Hover shows a guide, ringed dots and a tooltip. */
export interface TrendChartProps { labels: string[]; longLabels?: string[]; series: { name: string; values: number[]; accent?: boolean }[]; height?: number; active?: number; label?: string }
/** The asset's Package fact: plain with one option, a menu with several (live first, 'Earlier' group for closed ones). */
export interface FactSelectProps { options: { id: string; name: string; line?: string; earlier?: boolean }[]; value?: string; onChange?: (id: string) => void; label?: string }
/** Asset page Overview: the selected package. Display chips, 'This asset is in <service>' + Open package, and the current service's steps for this asset as children. Omit service for a package the asset has left. */
export interface PackageCardProps { name?: string; service?: ServiceId; completed?: boolean; services?: { id: ServiceId; label: string; lead: 'done' | 'now' }[]; href?: string; onOpen?: () => void; title?: string; aside?: string; children?: ReactNode }
```
