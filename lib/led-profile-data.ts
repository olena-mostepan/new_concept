/**
 * LED Project 310 — supplier profile data derived from report (1).html
 */

import type { SupplierProfileData } from '@/components/supplier-profile-view'
import { LED_SUPPLIERS } from './led-supplier-data'
import { LED_REPORT_OVERLAYS } from './led-report-data'

function mapReportSubs(subs: { name: string; description: string; amount?: number }[]) {
  return subs.map((s) =>
    s.amount != null
      ? { name: s.name, description: s.description, amount: s.amount }
      : { name: s.name, description: s.description }
  )
}

function buildLedProfile(led: (typeof LED_SUPPLIERS)[0], rank: number): SupplierProfileData {
  const b = led.breakdown
  const totalAmount = led.totalEur
  const overlay = LED_REPORT_OVERLAYS[led.id]
  const medianTotal = 336_705
  const totalPosition = totalAmount <= medianTotal ? 'below' : 'above'
  const totalPercentPosition = totalAmount <= medianTotal
    ? Math.round(((totalAmount - 230_885) / (medianTotal - 230_885)) * 50)
    : 50 + Math.round(((totalAmount - medianTotal) / (449_000 - medianTotal)) * 50)
  const medianPerLum = 120
  const perKwpPosition = led.perLuminaire <= medianPerLum ? 'below' : 'above'
  const perKwpPercentPosition = led.perLuminaire <= medianPerLum
    ? Math.round(((led.perLuminaire - 93) / (medianPerLum - 93)) * 50)
    : 50 + Math.round(((led.perLuminaire - medianPerLum) / (180 - medianPerLum)) * 50)

  const categories: SupplierProfileData['categories'] = []

  if (b?.equipment != null) {
    const subCategories = overlay?.equipmentSubs
      ? mapReportSubs(overlay.equipmentSubs)
      : [{ name: 'Main Equipment', description: led.qualitySummary ?? '—', amount: b.equipment }]
    categories.push({
      name: 'Equipment',
      rank: { position: rank, total: 7 },
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
      rank: { position: rank, total: 7 },
      proportionPercent: Math.round((b.labour / totalAmount) * 100),
      medianPercent: 40,
      totalAmount: b.labour,
      subCategories,
    })
  }
  // Add dimmed Labour from report when no cost
  if (
    overlay?.labourSubs &&
    !categories.some((c) => c.name === 'Labour')
  ) {
    categories.push({
      name: 'Labour',
      rank: { position: rank, total: 7 },
      proportionPercent: 0,
      medianPercent: 40,
      dimmed: true,
      subCategories: mapReportSubs(overlay.labourSubs),
    })
  }
  if (b?.projectOverheads != null && b.projectOverheads > 0) {
    const subCategories = overlay?.overheadsSubs
      ? mapReportSubs(overlay.overheadsSubs)
      : [{ name: 'Preliminaries, Waste Disposal, Contract Admin', description: 'Per report structure', amount: b.projectOverheads }]
    categories.push({
      name: 'Overheads',
      rank: { position: rank, total: 7 },
      proportionPercent: Math.round((b.projectOverheads / totalAmount) * 100),
      medianPercent: 10,
      totalAmount: b.projectOverheads,
      subCategories,
    })
  }
  // Add dimmed Overheads from report when no cost (e.g. Waste Disposal —)
  if (
    overlay?.overheadsSubs &&
    !categories.some((c) => c.name === 'Overheads')
  ) {
    categories.push({
      name: 'Overheads',
      rank: { position: rank, total: 7 },
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
      rank: { position: rank, total: 7 },
      proportionPercent: Math.round((b.materials / totalAmount) * 100),
      medianPercent: 5,
      totalAmount: b.materials,
      subCategories,
    })
  }
  // Add dimmed Materials from report when no cost
  if (
    overlay?.materialsSubs &&
    !categories.some((c) => c.name === 'Materials')
  ) {
    categories.push({
      name: 'Materials',
      rank: { position: rank, total: 7 },
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
      rank: { position: rank, total: 7 },
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
      rank: { position: rank, total: 7 },
      proportionPercent: Math.round((b.ongoingServices / totalAmount) * 100),
      medianPercent: 3,
      totalAmount: b.ongoingServices,
      subCategories,
    })
  }
  // Add Commissioning & Assurance from report when no cost breakdown (dimmed, for context)
  if (
    overlay?.commissioningSubs &&
    !categories.some((c) => c.name === 'Commissioning & Assurance')
  ) {
    categories.push({
      name: 'Commissioning & Assurance',
      rank: { position: rank, total: 7 },
      proportionPercent: 0,
      medianPercent: 5,
      dimmed: true,
      subCategories: mapReportSubs(overlay.commissioningSubs),
    })
  }
  if (categories.length === 0) {
    categories.push({
      name: 'Total',
      rank: { position: rank, total: 7 },
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
      panels: `2,494 luminaires`,
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

const LED_PROFILES: Record<string, SupplierProfileData> = {}
LED_SUPPLIERS.forEach((led, i) => {
  LED_PROFILES[led.id] = buildLedProfile(led, i + 1)
})

export const LED_SHORTLIST = LED_SUPPLIERS.map((s) => ({ id: s.id, name: s.name }))

export function getLedProfile(id: string): SupplierProfileData | undefined {
  return LED_PROFILES[id]
}
