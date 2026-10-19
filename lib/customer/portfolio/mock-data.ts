export const PORTFOLIO_USER = 'Aleksandra'

export const PIPELINE_STAGES = [
  {
    id: 'onboarded',
    label: 'Onboarded',
    count: 34,
    color: '#D7DCE3',
    onDark: false,
    valueLabel: '£4.2m pipeline',
    detail: 'Sites entered this year · 12 awaiting brief',
  },
  {
    id: 'brief',
    label: 'Brief',
    count: 22,
    color: '#9AA3B2',
    onDark: false,
    valueLabel: '£3.1m',
    detail: 'Avg 28d in brief · 8% under benchmark',
  },
  {
    id: 'tender',
    label: 'Tender',
    count: 18,
    color: '#B0B8C4',
    onDark: false,
    valueLabel: '£2.4m',
    detail: '9% below benchmark £/kWp',
  },
  {
    id: 'quote',
    label: 'Quote',
    count: 14,
    color: '#7B8FA8',
    onDark: true,
    valueLabel: '£2.1m',
    detail: 'Avg 21d tender → quote · 15% under bmk',
  },
  {
    id: 'delivery',
    label: 'Delivery',
    count: 9,
    color: '#3D4654',
    onDark: true,
    valueLabel: '£1.9m',
    detail: '5 on track · 1 overdue · 3 awaiting confirm',
  },
  {
    id: 'done',
    label: 'Done',
    count: 3,
    color: '#1E2430',
    onDark: true,
    valueLabel: '£0.4m',
    detail: 'Completed this year · handed over',
  },
] as const

export const PIPELINE_INSIGHTS = [
  {
    color: '#3D4654',
    text: '18 in tender',
    meta: '9% below benchmark £/kWp',
    warn: false,
  },
  {
    color: '#E36B2C',
    text: '60d avg sign → stage 1',
    meta: '15% over benchmark',
    warn: true,
  },
  {
    color: '#1E2430',
    text: '9 in delivery',
    meta: '£1.9m',
    warn: false,
  },
] as const

export const RECENT_ACTIVITY = [
  {
    id: 'invoice-sirius',
    title: 'Invoice ingested.',
    detail: 'Sirius LED, 2 sites advanced a stage',
    when: '7 days ago',
    href: '/customer/delivery',
  },
  {
    id: 'dates-pradera',
    title: 'Supplier confirmed dates.',
    detail: 'Pradera Retail (5 sites)',
    when: '7 days ago',
    href: '/customer/projects/solar-walter-scott',
  },
  {
    id: 'blocker-pradera',
    title: 'New blocker flagged.',
    detail: 'Pradera install, statics',
    when: '12 days ago',
    href: '/customer/projects/solar-pradera-west',
  },
] as const

export const MOMENTUM_SERIES = [
  { key: 'onboarded', label: 'Onboarded', color: '#C5CCD6', strokeDasharray: '4 4' },
  { key: 'quoted', label: 'Quoted', color: '#9BB0C9' },
  { key: 'signed', label: 'Signed', color: '#3B6B9A' },
  { key: 'inDelivery', label: 'In delivery', color: '#E36B2C' },
  { key: 'delivered', label: 'Delivered', color: '#2A313C' },
] as const

export const MOMENTUM_POINTS = [
  { month: 'Jan 23', onboarded: 8, quoted: 4, signed: 2, inDelivery: 1, delivered: 0 },
  { month: 'Mar 23', onboarded: 14, quoted: 9, signed: 5, inDelivery: 2, delivered: 1 },
  { month: 'May 23', onboarded: 22, quoted: 15, signed: 10, inDelivery: 4, delivered: 2 },
  { month: 'Jul 23', onboarded: 30, quoted: 22, signed: 16, inDelivery: 6, delivered: 2 },
  { month: 'Sep 23', onboarded: 38, quoted: 28, signed: 20, inDelivery: 7, delivered: 3 },
  { month: 'Nov 23', onboarded: 48, quoted: 36, signed: 26, inDelivery: 8, delivered: 3 },
  { month: 'Jan 24', onboarded: 58, quoted: 44, signed: 32, inDelivery: 8, delivered: 3 },
  { month: 'Mar 24', onboarded: 68, quoted: 52, signed: 40, inDelivery: 9, delivered: 3 },
  { month: 'May 24', onboarded: 82, quoted: 62, signed: 48, inDelivery: 9, delivered: 3 },
  { month: 'Jul 24', onboarded: 98, quoted: 74, signed: 58, inDelivery: 9, delivered: 3 },
]

export const STAGE_DAYS = [
  {
    label: 'Brief → Tender',
    days: 28,
    vsBmk: -8,
    detail: 'Faster than portfolio average · briefs moving cleanly',
  },
  {
    label: 'Tender → Quote',
    days: 21,
    vsBmk: -15,
    detail: 'Strong supplier response · 15% under benchmark',
  },
  {
    label: 'Quote → Sign',
    days: 34,
    vsBmk: 4,
    detail: 'Slightly over benchmark · legal review delays',
  },
  {
    label: 'Sign → Stage 1',
    days: 60,
    vsBmk: 15,
    detail: 'Longest lag · mobilisation and surveys',
  },
  {
    label: 'Stage 1 → 2',
    days: 26,
    vsBmk: -6,
    detail: 'On track after kick-off · 6% under benchmark',
  },
] as const

export const PORTFOLIO_BATCHES = [
  {
    id: 'midland-forge',
    name: 'Midland Forge',
    projectCount: 4,
    valueLabel: '£0.9m',
    segments: [
      {
        id: 'brief',
        label: 'Brief',
        count: 2,
        color: '#9BB0C9',
        flex: 2,
        detail: '2 sites briefing · £0.4m',
      },
      {
        id: 'tender',
        label: 'Tender',
        count: 1,
        color: '#B0B8C4',
        flex: 1,
        detail: '1 in tender — results ready',
      },
      {
        id: 'quote',
        label: 'Quote',
        count: 1,
        color: '#C5CCD6',
        flex: 1,
        detail: '1 quote under review',
      },
    ],
  },
  {
    id: 'pradera-solar',
    name: 'Pradera Retail — Solar PV',
    projectCount: 14,
    valueLabel: '£1.6m',
    segments: [
      {
        id: 'brief',
        label: 'Brief',
        count: 3,
        color: '#9BB0C9',
        flex: 3,
        detail: '3 sites briefing',
      },
      {
        id: 'tender',
        label: 'Tender',
        count: 2,
        color: '#B0B8C4',
        flex: 2,
        detail: '2 in tender',
      },
      {
        id: 'quote',
        label: 'Quote',
        count: 2,
        color: '#C5CCD6',
        flex: 2,
        detail: '2 quotes out',
      },
      {
        id: 'delivery',
        label: 'Delivery',
        count: 4,
        color: '#3D4654',
        flex: 4,
        detail: '4 in delivery · £0.9m',
      },
      {
        id: 'done',
        label: 'Done',
        count: 3,
        color: '#1E2430',
        flex: 3,
        detail: '3 handed over',
      },
    ],
  },
  {
    id: 'sirius-led',
    name: 'Sirius LED',
    projectCount: 6,
    valueLabel: '£0.7m',
    segments: [
      {
        id: 'tender',
        label: 'Tender',
        count: 2,
        color: '#B0B8C4',
        flex: 2,
        detail: '2 in tender',
      },
      {
        id: 'delivery',
        label: 'Delivery',
        count: 1,
        color: '#3D4654',
        flex: 1,
        detail: '1 in delivery',
      },
      {
        id: 'done-a',
        label: 'Done',
        count: 2,
        color: '#1E2430',
        flex: 2,
        detail: '2 complete',
      },
      {
        id: 'done-b',
        label: 'Done',
        count: 1,
        color: '#2A313C',
        flex: 1,
        detail: '1 snagging closed',
      },
    ],
  },
] as const
