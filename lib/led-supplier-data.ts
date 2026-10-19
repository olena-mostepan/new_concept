/**
 * LED Project 310 data — Alexanderstraße 1/3/5, Berlin
 * Mapped from all_suppliers.html, breakdown.html, shortlist.html
 */

export type LedSupplier = {
  id: string
  name: string
  badge?: string
  totalEur: number
  perLuminaire: number
  luminaireCount: number
  quality: 1 | 2 | 3  // Tier 1=1, Tier 2=2, Tier 3=3
  transparency: 1 | 2 | 3 | 4 | 5  // stars
  note?: { type: 'warn' | 'info'; text: string }
  qualitySummary?: string
  breakdown?: {
    equipment?: number
    labour?: number
    materials?: number
    projectOverheads?: number
    designTechnical?: number
    commissioningAssurance?: number
    ongoingServices?: number
  }
}

export const LED_SUPPLIERS: LedSupplier[] = [
  {
    id: 'german-led-tech',
    name: 'German LED Tech',
    badge: 'Lowest',
    totalEur: 230_885,
    perLuminaire: 93,
    luminaireCount: 2_494,
    quality: 2,
    transparency: 3,
    note: { type: 'warn', text: 'Total luminaire count in Excel is 2,680 vs. 2,494 lamps—discrepancy likely due to multi-lamp fittings' },
    qualitySummary: 'Single headline price from Excel schedule with per-product unit costs but no labour/materials split provided.',
    breakdown: { equipment: 143_749, labour: undefined, materials: undefined, projectOverheads: undefined },
  },
  {
    id: 'ecowatt',
    name: 'Ecowatt GmbH',
    badge: 'Rank #2',
    totalEur: 268_711,
    perLuminaire: 108,
    luminaireCount: 2_494,
    quality: 2,
    transparency: 3,
    note: { type: 'warn', text: 'All warranty fields show 0 years; no warranty terms mentioned anywhere in submission' },
    qualitySummary: 'Itemized PDF with named products and separate labour, container, disposal, and BAFA service lines.',
    breakdown: { equipment: 164_261, labour: 91_549, projectOverheads: 11_725 },
  },
  {
    id: 'die-stromspar',
    name: 'Die Stromspar GmbH',
    badge: 'Rank #3',
    totalEur: 270_290,
    perLuminaire: 108,
    luminaireCount: 2_494,
    quality: 1,
    transparency: 5,
    note: { type: 'warn', text: 'Labour field (€166,682) is disproportionately high relative to materials (€103,607)' },
    qualitySummary: 'Fully itemized 11-page PDF with named products, per-unit costs, installation rates per zone.',
    breakdown: { equipment: 103_607, labour: 166_682, projectOverheads: 1_350 },
  },
  {
    id: 'led-on',
    name: 'LED ON GmbH',
    badge: 'Rank #4',
    totalEur: 299_987,
    perLuminaire: 120,
    luminaireCount: 2_494,
    quality: 2,
    transparency: 2,
    note: { type: 'warn', text: 'All warranty fields show 0 years—no warranty terms provided anywhere in submission' },
    qualitySummary: 'Detailed product-level PDF with premium named brands but labour embedded in materials.',
    breakdown: { equipment: 299_987, labour: undefined, projectOverheads: 58 },
  },
  {
    id: 'beka-solar',
    name: 'Beka Solar Energie GmbH',
    badge: 'Rank #5',
    totalEur: 336_705,
    perLuminaire: 135,
    luminaireCount: 2_494,
    quality: 3,
    transparency: 2,
    note: { type: 'warn', text: 'All warranty fields show 0 years; no warranty mentioned anywhere in submission' },
    qualitySummary: 'Two-page PDF with per-fixture type unit costs and a flat installation rate.',
    breakdown: { equipment: 180_132, labour: 156_573 },
  },
  {
    id: 'genesis',
    name: 'Genesis 1.3 Limited',
    badge: 'Rank #6',
    totalEur: 355_790,
    perLuminaire: 143,
    luminaireCount: 2_494,
    quality: 2,
    transparency: 3,
    note: { type: 'warn', text: 'Workmanship warranty is explicitly 0 years—a significant gap versus all German competitors' },
    qualitySummary: 'Detailed fixture schedule PDF with per-line energy and cost data.',
    breakdown: { equipment: 162_505, labour: 193_285 },
  },
  {
    id: 'saflux',
    name: 'SAFLUX GmbH',
    badge: 'Rank #7',
    totalEur: 449_000,
    perLuminaire: 180,
    luminaireCount: 2_494,
    quality: 1,
    transparency: 5,
    note: { type: 'warn', text: 'term_maintenance shows 10 years in data but maintenance contract specifies 5-year term' },
    qualitySummary: 'Fully itemized submission with six explicit cost categories and 26-page technical proposal.',
    breakdown: {
      equipment: 260_000,
      labour: 100_000,
      projectOverheads: 69_000,
      commissioningAssurance: 20_000,
      ongoingServices: 13_470,
    },
  },
]

/** Map LED breakdown — keeps Equipment, Labour, Overheads, Materials, Commissioning & Assurance separate per report */
export function ledBreakdownToSolarFormat(b?: LedSupplier['breakdown']) {
  if (!b) return undefined
  return {
    equipment: b.equipment,
    labour: b.labour,
    overheads: b.projectOverheads,
    materials: b.materials,
    design: b.designTechnical,
    commission: b.commissioningAssurance,
    om: b.ongoingServices,
  }
}
