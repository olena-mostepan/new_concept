/**
 * LED Rostock (tender_651_650) — Doberaner Straße 114-116
 * 2 suppliers, profile data from report.html, breakdown.html
 */

import type { SupplierProfileData } from '@/components/supplier-profile-view'
import { ROSTOCK_LED_SUPPLIERS } from './led-rostock-supplier-data'
import { LED_ROSTOCK_REPORT_OVERLAYS } from './led-rostock-report-data'

function mapReportSubs(subs: { name: string; description: string; amount?: number }[]) {
  return subs.map((s) =>
    s.amount != null
      ? { name: s.name, description: s.description, amount: s.amount }
      : { name: s.name, description: s.description }
  )
}

function buildLedProfile(led: (typeof ROSTOCK_LED_SUPPLIERS)[0], rank: number): SupplierProfileData {
  const b = led.breakdown
  const totalAmount = led.totalEur
  const overlay = LED_ROSTOCK_REPORT_OVERLAYS[led.id]
  const medianTotal = 85_000 // midpoint between Stromspar 61k and WISAG 108k
  const totalPosition = totalAmount <= medianTotal ? 'below' : 'above'
  const totalPercentPosition = totalAmount <= medianTotal
    ? Math.round(((totalAmount - 61_253) / (medianTotal - 61_253)) * 50)
    : 50 + Math.round(((totalAmount - medianTotal) / (108_417 - medianTotal)) * 50)
  const medianPerLum = 115
  const perKwpPosition = led.perLuminaire <= medianPerLum ? 'below' : 'above'
  const perKwpPercentPosition = led.perLuminaire <= medianPerLum
    ? Math.round(((led.perLuminaire - 105) / (medianPerLum - 105)) * 50)
    : 50 + Math.round(((led.perLuminaire - medianPerLum) / (125 - medianPerLum)) * 50)

  const categories: SupplierProfileData['categories'] = []

  if (b?.equipment != null) {
    const subCategories = overlay?.equipmentSubs
      ? mapReportSubs(overlay.equipmentSubs)
      : [{ name: 'Main Equipment', description: led.qualitySummary ?? '—', amount: b.equipment }]
    categories.push({
      name: 'Equipment',
      rank: { position: rank, total: 2 },
      proportionPercent: Math.round((b.equipment / totalAmount) * 100),
      medianPercent: 50,
      totalAmount: b.equipment,
      subCategories,
    })
  }
  if (b?.labour != null) {
    const subCategories = overlay?.labourSubs
      ? mapReportSubs(overlay.labourSubs)
      : [{ name: 'Installation Labour', description: 'Per fixture installation', amount: b.labour }]
    categories.push({
      name: 'Labour',
      rank: { position: rank, total: 2 },
      proportionPercent: Math.round((b.labour / totalAmount) * 100),
      medianPercent: 40,
      totalAmount: b.labour,
      subCategories,
    })
  }
  if (
    overlay?.labourSubs &&
    !categories.some((c) => c.name === 'Labour')
  ) {
    categories.push({
      name: 'Labour',
      rank: { position: rank, total: 2 },
      proportionPercent: 0,
      medianPercent: 40,
      dimmed: true,
      subCategories: mapReportSubs(overlay.labourSubs),
    })
  }
  if (b?.projectOverheads != null && b.projectOverheads > 0) {
    const subCategories = overlay?.overheadsSubs
      ? mapReportSubs(overlay.overheadsSubs)
      : [{ name: 'Project Overheads', description: 'Per report structure', amount: b.projectOverheads }]
    categories.push({
      name: 'Overheads',
      rank: { position: rank, total: 2 },
      proportionPercent: Math.round((b.projectOverheads / totalAmount) * 100),
      medianPercent: 10,
      totalAmount: b.projectOverheads,
      subCategories,
    })
  }
  if (
    overlay?.overheadsSubs &&
    !categories.some((c) => c.name === 'Overheads')
  ) {
    categories.push({
      name: 'Overheads',
      rank: { position: rank, total: 2 },
      proportionPercent: 0,
      medianPercent: 10,
      dimmed: true,
      subCategories: mapReportSubs(overlay.overheadsSubs),
    })
  }
  if (b?.materials != null && b.materials > 0) {
    const subCategories = overlay?.materialsSubs
      ? mapReportSubs(overlay.materialsSubs)
      : [{ name: 'Consumables', description: 'Cables, wiring, consumables', amount: b.materials }]
    categories.push({
      name: 'Materials',
      rank: { position: rank, total: 2 },
      proportionPercent: Math.round((b.materials / totalAmount) * 100),
      medianPercent: 5,
      totalAmount: b.materials,
      subCategories,
    })
  }
  if (
    overlay?.materialsSubs &&
    !categories.some((c) => c.name === 'Materials')
  ) {
    categories.push({
      name: 'Materials',
      rank: { position: rank, total: 2 },
      proportionPercent: 0,
      medianPercent: 5,
      dimmed: true,
      subCategories: mapReportSubs(overlay.materialsSubs),
    })
  }
  if (b?.commissioningAssurance != null && b.commissioningAssurance > 0) {
    const subCategories = overlay?.commissioningSubs
      ? mapReportSubs(overlay.commissioningSubs)
      : [{ name: 'System Commissioning', description: 'Electrical works and commissioning', amount: b.commissioningAssurance }]
    categories.push({
      name: 'Commissioning & Assurance',
      rank: { position: rank, total: 2 },
      proportionPercent: Math.round((b.commissioningAssurance / totalAmount) * 100),
      medianPercent: 5,
      totalAmount: b.commissioningAssurance,
      subCategories,
    })
  }
  if (b?.ongoingServices != null && b.ongoingServices > 0) {
    const subCategories = overlay?.ongoingSubs
      ? mapReportSubs(overlay.ongoingSubs)
      : [{ name: 'Maintenance Contract', description: 'Optional annual maintenance', amount: b.ongoingServices }]
    categories.push({
      name: 'Ongoing Services',
      rank: { position: rank, total: 2 },
      proportionPercent: Math.round((b.ongoingServices / totalAmount) * 100),
      medianPercent: 3,
      totalAmount: b.ongoingServices,
      subCategories,
    })
  }
  if (
    overlay?.commissioningSubs &&
    !categories.some((c) => c.name === 'Commissioning & Assurance')
  ) {
    categories.push({
      name: 'Commissioning & Assurance',
      rank: { position: rank, total: 2 },
      proportionPercent: 0,
      medianPercent: 5,
      dimmed: true,
      subCategories: mapReportSubs(overlay.commissioningSubs),
    })
  }
  if (
    overlay?.ongoingSubs &&
    !categories.some((c) => c.name === 'Ongoing Services')
  ) {
    categories.push({
      name: 'Ongoing Services',
      rank: { position: rank, total: 2 },
      proportionPercent: 0,
      medianPercent: 3,
      dimmed: true,
      subCategories: mapReportSubs(overlay.ongoingSubs),
    })
  }
  if (categories.length === 0) {
    categories.push({
      name: 'Total',
      rank: { position: rank, total: 2 },
      proportionPercent: 100,
      medianPercent: 50,
      totalAmount,
      subCategories: [{ name: 'Total', description: led.qualitySummary ?? '—', amount: totalAmount }],
    })
  }

  return {
    id: led.id,
    name: led.name,
    quality: led.quality,
    cluster: 'full-scope',
    totalPounds: totalAmount,
    perKwp: led.perLuminaire,
    systemKwp: led.luminaireCount,
    totalPosition,
    perKwpPosition,
    totalPercentPosition: Math.min(100, Math.max(0, totalPercentPosition)),
    perKwpPercentPosition: Math.min(100, Math.max(0, perKwpPercentPosition)),
    specs: {
      panels: `${led.luminaireCount.toLocaleString()} luminaires`,
      inverters: '—',
      mounting: '—',
      workmanshipWarranty: overlay?.specs?.workmanshipWarranty ?? '—',
      panelWarranty: overlay?.specs?.panelWarranty ?? '—',
      inverterWarranty: '—',
    },
    characterisation: overlay?.characterisation ?? led.qualitySummary ?? '—',
    keyFlags: overlay?.keyFlags ?? (led.note ? [{ icon: led.note.type === 'warn' ? 'warn' : 'info', text: led.note.text }] : []),
    categories,
  }
}

const ROSTOCK_PROFILES: Record<string, SupplierProfileData> = {}
ROSTOCK_LED_SUPPLIERS.forEach((led, i) => {
  ROSTOCK_PROFILES[led.id] = buildLedProfile(led, i + 1)
})

export const ROSTOCK_LED_SHORTLIST = ROSTOCK_LED_SUPPLIERS.map((s) => ({ id: s.id, name: s.name }))

export function getLedRostockProfile(id: string): SupplierProfileData | undefined {
  return ROSTOCK_PROFILES[id]
}
