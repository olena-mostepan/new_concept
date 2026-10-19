/**
 * LED Rostock — report-derived content for bid profiles
 * From report.html, breakdown.html
 */

import type { KeyFlag } from '@/components/supplier-profile-view'

type SubCat = { name: string; description: string; amount?: number }

export type LedRostockReportOverlay = {
  characterisation: string
  keyFlags: KeyFlag[]
  specs?: { workmanshipWarranty?: string; panelWarranty?: string }
  equipmentSubs?: SubCat[]
  labourSubs?: SubCat[]
  overheadsSubs?: SubCat[]
  materialsSubs?: SubCat[]
  commissioningSubs?: SubCat[]
  ongoingSubs?: SubCat[]
}

export const LED_ROSTOCK_REPORT_OVERLAYS: Record<string, LedRostockReportOverlay> = {
  'die-stromspar-rostock': {
    characterisation:
      'Comprehensive, well-structured submission backed by a detailed itemized PDF (AG0492) with 12 line items covering 5 fixture types across named building zones; price_materials and price_labour fields align closely with the PDF subtotals.',
    specs: { workmanshipWarranty: '5 years', panelWarranty: '5 years' },
    keyFlags: [
      { icon: 'info', text: 'price_materials and price_labour sum exactly to cost_min — no overheads separately priced' },
      { icon: 'info', text: 'Stromspar quotes for 490 luminaires versus WISAG\'s 1,029; per-luminaire comparison more meaningful' },
    ],
    equipmentSubs: [
      { name: 'Main Equipment', description: 'LED fixtures across 5 types: downlights (12W/18W), bollard, retrofit tube, RayProof batten', amount: 37_829 },
      { name: 'Mounting Systems', description: 'Bundled into installation_labour line items per fixture' },
    ],
    labourSubs: [
      { name: 'Installation Labour', description: 'Per-unit installation rates €29.70–€120.65 across fixture types and locations', amount: 23_424 },
      { name: 'Electrical Works', description: 'Included within installation_labour; no separate electrical sub-contract itemized' },
      { name: 'Commissioning Engineers', description: 'Commissioning described in scope but not separately priced' },
    ],
    materialsSubs: [
      { name: 'Cables Wiring', description: 'Cables, conduit, and fixings bundled into installation_labour lump sum' },
      { name: 'Fixings Fasteners', description: 'Screws, anchors, brackets bundled into per-unit installation rates' },
      { name: 'Consumables', description: 'Tool allowance and general consumables bundled into labour' },
    ],
    overheadsSubs: [
      { name: 'Transportation Logistics', description: 'Travel and delivery bundled into per-unit installation costs' },
      { name: 'Health Safety Management', description: 'Not separately priced; assumed included in overheads' },
    ],
    commissioningSubs: [
      { name: 'System Commissioning', description: 'Commissioning included in project scope; no separate line item' },
      { name: 'Equipment Warranty', description: '5-year manufacturer warranty included in fixture unit prices' },
      { name: 'Installation Warranty', description: '5-year workmanship warranty; cost embedded in total price' },
    ],
    ongoingSubs: [
      { name: 'Maintenance Contract', description: 'Maintenance package available but not priced in this submission' },
    ],
  },
  'wisag-rostock': {
    characterisation:
      'Submission contains only top-level lump-sum price categories with no fixture-level detail; all substantive technical and pricing documentation was withheld due to a reported platform upload error (HTTP 500), making independent verification impossible.',
    specs: { workmanshipWarranty: '2 years', panelWarranty: '2 years' },
    keyFlags: [
      { icon: 'warn', text: 'total_energy_consumption_over_lifetime (34,245,120 kWh) is implausibly large — data entry error' },
      { icon: 'warn', text: 'total_lamp_running_hours_pa (2,140,320 hrs) impossible for single year — likely fleet-hours figure' },
      { icon: 'info', text: 'WISAG\'s scope (1,029 luminaires) more than double Stromspar\'s; absolute totals not directly comparable' },
    ],
    equipmentSubs: [
      { name: 'Main Equipment', description: 'Materials lump sum; no fixture-level breakdown available', amount: 80_000 },
    ],
    labourSubs: [
      { name: 'Installation Labour', description: 'Own workforce installation labour lump sum', amount: 30_000 },
      { name: 'Electrical Works', description: 'Electrical works priced as separate lump sum', amount: 30_000 },
    ],
    materialsSubs: [
      { name: 'Consumables', description: 'Likely within materials lump sum; no separate itemization' },
    ],
    overheadsSubs: [
      { name: 'Contract Administration', description: 'Administration cost stated as discrete line item', amount: 5_000 },
      { name: 'Health Safety Management', description: 'Health and safety cost stated as discrete line item', amount: 1_000 },
    ],
    commissioningSubs: [
      { name: 'Equipment Warranty', description: '2-year lamp and component warranty; cost embedded in materials price' },
      { name: 'Installation Warranty', description: '2-year workmanship warranty included' },
    ],
    ongoingSubs: [
      { name: 'Maintenance Contract', description: '1-year maintenance term; €2,500 included in total', amount: 2_500 },
    ],
  },
}
