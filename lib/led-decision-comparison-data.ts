/**
 * LED Project 310 — decision comparison format (shortlisted suppliers)
 * Maps LED data to the DecisionComparisonSupplier schema for UI compatibility
 * Warranty/equipment from report (1).html
 */

import type { DecisionComparisonSupplier } from './decision-comparison-data'
import { LED_SUPPLIERS } from './led-supplier-data'
import { LED_REPORT_OVERLAYS } from './led-report-data'

const LED_WARRANTY: Record<string, { product?: string; workmanship?: string }> = {
  'german-led-tech': { product: '5 years', workmanship: '5 years' },
  ecowatt: { product: '—', workmanship: '—' },
  'die-stromspar': { product: '5 years', workmanship: '5 years' },
  'led-on': { product: '—', workmanship: '—' },
  'beka-solar': { product: '—', workmanship: '—' },
  genesis: { product: '5 years', workmanship: '0 years' },
  saflux: { product: '7 years', workmanship: '5 years' },
}

export function getLedDecisionSuppliers(ids?: string[]): DecisionComparisonSupplier[] {
  const source = ids?.length
    ? LED_SUPPLIERS.filter((s) => ids.includes(s.id))
    : LED_SUPPLIERS.slice(0, 3)
  return source.map((s) => {
    const overlay = LED_REPORT_OVERLAYS[s.id]
    const warranty = LED_WARRANTY[s.id]
    const equipmentDesc = overlay?.equipmentSubs?.[0]?.description ?? s.qualitySummary ?? '—'
    return {
      id: s.id,
      name: s.name,
      badge: s.badge,
      logo: undefined,
      perKwp: s.perLuminaire,
      totalPounds: s.totalEur,
      adjustedCost: s.note?.type === 'warn' ? s.note.text : 'As quoted',
      systemKwp: s.luminaireCount,
      coverage: `2,494 luminaires — Alexanderstraße 1/3/5, Berlin`,
      panels: equipmentDesc,
      inverters: '—',
      mounting: '—',
      exclusions: s.note?.type === 'warn' ? s.note.text : '—',
      quality: s.quality,
      transparency: s.transparency,
      documentation: s.qualitySummary ?? '—',
      reconciliation: s.note?.text ?? 'No issues found',
      flags: s.note ? [s.note.text] : [],
      maintenanceContract: s.id === 'saflux' ? '€13,470/yr (optional)' : '—',
      panelWarranty: overlay?.specs?.panelWarranty ?? warranty?.product ?? '—',
      inverterWarranty: '—',
      workmanship: overlay?.specs?.workmanshipWarranty ?? warranty?.workmanship ?? '—',
    }
  })
}
