/**
 * LED Rostock (tender_651_650) — decision comparison format
 * Doberaner Straße 114-116, 2 suppliers
 */

import type { DecisionComparisonSupplier } from './decision-comparison-data'
import { ROSTOCK_LED_SUPPLIERS } from './led-rostock-supplier-data'
import { LED_ROSTOCK_REPORT_OVERLAYS } from './led-rostock-report-data'

export function getLedRostockDecisionSuppliers(ids?: string[]): DecisionComparisonSupplier[] {
  const source = ids?.length
    ? ROSTOCK_LED_SUPPLIERS.filter((s) => ids.includes(s.id))
    : ROSTOCK_LED_SUPPLIERS
  return source.map((s) => {
    const overlay = LED_ROSTOCK_REPORT_OVERLAYS[s.id]
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
      coverage: `${s.luminaireCount.toLocaleString()} luminaires — Doberaner Straße 114-116, Rostock`,
      panels: equipmentDesc,
      inverters: '—',
      mounting: '—',
      exclusions: s.note?.type === 'warn' ? s.note.text : '—',
      quality: s.quality,
      transparency: s.transparency,
      documentation: s.qualitySummary ?? '—',
      reconciliation: s.note?.text ?? 'No issues found',
      flags: s.note ? [s.note.text] : [],
      maintenanceContract: s.id === 'wisag-rostock' ? '€2,500/yr (1 year)' : '—',
      panelWarranty: overlay?.specs?.panelWarranty ?? '—',
      inverterWarranty: '—',
      workmanship: overlay?.specs?.workmanshipWarranty ?? '—',
    }
  })
}
