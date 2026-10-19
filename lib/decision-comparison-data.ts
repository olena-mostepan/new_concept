export type DecisionComparisonSupplier = {
  id: string
  name: string
  badge?: string
  logo?: string
  perKwp: number
  totalPounds: number
  adjustedCost: string
  systemKwp: number
  coverage: string
  panels: string
  inverters: string
  mounting: string
  exclusions: string
  quality: 1 | 2 | 3
  transparency: 1 | 2 | 3 | 4 | 5
  documentation: string
  reconciliation: string
  flags: string[]
  maintenanceContract: string
  panelWarranty: string
  inverterWarranty: string
  workmanship: string
}

// Project 322 — Braehead — shortlist top 3 from breakdown.html
export const DEFAULT_DECISION_SUPPLIERS: DecisionComparisonSupplier[] = [
  {
    id: 'photon',
    name: 'Photon Energy',
    badge: 'Lowest',
    logo: '/site elements/beba.svg',
    perKwp: 582,
    totalPounds: 1_131_500,
    adjustedCost: '£180k H&S provisional—may reduce after site survey',
    systemKwp: 1945,
    coverage: 'LL1, LL2, LL3, Red Parking — 4 MPANs',
    panels: '4,276 × Trina 455W dual-glass, 15 Solis inverters',
    inverters: 'Solis three-phase',
    mounting: 'K2 Basic Rail',
    exclusions: 'Smallest scope (1,946 kWp) vs full six-roof brief',
    quality: 1,
    transparency: 4,
    documentation: 'Detailed PDF with itemised equipment, installation, design, attendances',
    reconciliation: 'price_labour vs PDF installation/commissioning split inferred',
    flags: [
      '£180k attendances provisional—crane, edge protection, pallet splitting',
      'Mounting, ArcBoxes, isolators listed as included—no separate prices',
    ],
    maintenanceContract: '£23,350/yr — 5-year full-scope O&M, RPI-linked',
    panelWarranty: 'Not stated',
    inverterWarranty: 'Not stated',
    workmanship: 'Not stated',
  },
  {
    id: 'low-carbon',
    name: 'Low Carbon Energy',
    badge: '2nd lowest',
    logo: '/site elements/lowcarbon.svg',
    perKwp: 499,
    totalPounds: 1_163_127,
    adjustedCost: 'Materials £240k (~£103/kWp) exceptionally low—verify breakdown',
    systemKwp: 2333,
    coverage: 'LL1, LL2, LL3 only (not Red Parking or car park roofs)',
    panels: 'Trina Vertex S+ 510W, Sungrow inverters, K2 mounting',
    inverters: 'Sungrow',
    mounting: 'K2 MiniRail/SpeedRail',
    exclusions: 'Partial scope; no pricing breakdown file submitted',
    quality: 2,
    transparency: 3,
    documentation: 'price_* fields populated but no PDF for verification',
    reconciliation: 'Administration £6k may omit PM, design, DNO costs',
    flags: [
      'Materials £240k for 2,333 kWp (~£103/kWp) vs typical £200–280/kWp',
      'No pricing breakdown file submitted',
    ],
    maintenanceContract: '£7,000/yr — 3-year O&M, annual inspection, 24/7 monitoring',
    panelWarranty: 'Not stated',
    inverterWarranty: 'Not stated',
    workmanship: 'Not stated',
  },
  {
    id: 'olympus',
    name: 'Olympus Power',
    badge: '3rd lowest',
    perKwp: 734,
    totalPounds: 1_226_053,
    adjustedCost: 'No breakdown—headline cost only',
    systemKwp: 1670,
    coverage: '1,670 kWp — smallest scope in CapEx set',
    panels: '—',
    inverters: '—',
    mounting: '—',
    exclusions: 'All price_* fields null; pricing Excel has no extracted text',
    quality: 3,
    transparency: 2,
    documentation: 'Headline cost only; no itemised breakdown',
    reconciliation: '£1.23M total cannot be verified from any source',
    flags: [
      'All price_* fields (labour, materials, administration, H&S) are null',
      '1,670 kWp covers materially less of site than competitors',
    ],
    maintenanceContract: '£16,000/yr — 5-year term, monthly monitoring',
    panelWarranty: 'Not stated',
    inverterWarranty: 'Not stated',
    workmanship: 'Not stated',
  },
]
