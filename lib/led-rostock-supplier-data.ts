/**
 * LED Rostock (tender_651_650) — Doberaner Straße 114-116
 * 2 suppliers from report.html, shortlist.html, breakdown.html
 */

import type { LedSupplier } from './led-supplier-data'

export const ROSTOCK_LED_SUPPLIERS: LedSupplier[] = [
  {
    id: 'die-stromspar-rostock',
    name: 'Die Stromspar GmbH',
    badge: 'Rank #1',
    totalEur: 61_253,
    perLuminaire: 125,
    luminaireCount: 490,
    quality: 1,
    transparency: 5,
    note: { type: 'info', text: 'Stromspar quotes for 490 luminaires versus WISAG\'s 1,029; per-luminaire comparison is more meaningful' },
    qualitySummary: 'Fully itemized 6-page PDF quote with unit prices, quantities, and fixture specifications across all installation zones.',
    breakdown: {
      equipment: 37_829,
      labour: 23_424,
      materials: undefined,
      projectOverheads: undefined,
      commissioningAssurance: undefined,
      ongoingServices: undefined,
    },
  },
  {
    id: 'wisag-rostock',
    name: 'WISAG Gebäudetechnik Nord-Ost',
    badge: 'Rank #2',
    totalEur: 108_417,
    perLuminaire: 105,
    luminaireCount: 1_029,
    quality: 3,
    transparency: 2,
    note: { type: 'warn', text: 'WISAG\'s scope (1,029 luminaires) is more than double Stromspar\'s (490); external documents not uploaded' },
    qualitySummary: 'High-level price breakdown provided but all substantive detail deferred to external documents that could not be uploaded due to a platform error.',
    breakdown: {
      equipment: 80_000,
      labour: 60_000,
      materials: undefined,
      projectOverheads: 6_000,
      commissioningAssurance: undefined,
      ongoingServices: 2_500,
    },
  },
]
