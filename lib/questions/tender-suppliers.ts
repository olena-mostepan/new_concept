import type { ClarificationsProjectSlug } from '@/lib/clarifications/mock-data'

export type TenderSupplierOption = { id: string; name: string }

const SOLAR_SUPPLIERS: TenderSupplierOption[] = [
  { id: 'electron-green', name: 'Electron Green' },
  { id: 'sustain-commercial-solar', name: 'Sustain Commercial Solar' },
  { id: 'low-carbon-energy-company', name: 'The Low Carbon Energy Company Ltd' },
  { id: 'ortus-energy-ltd', name: 'Ortus Energy Ltd.' },
  { id: 'evo-energy', name: 'Evo Energy' },
  { id: 'oracle-energy', name: 'Oracle Energy' },
]

export function tenderSuppliersForSlug(
  slug: ClarificationsProjectSlug,
): TenderSupplierOption[] {
  if (slug === 'led') {
    const { LED_SUPPLIERS } = require('@/lib/led-supplier-data') as {
      LED_SUPPLIERS: Array<{ id: string; name: string }>
    }
    return LED_SUPPLIERS.map((s) => ({ id: s.id, name: s.name }))
  }
  if (slug === 'led-rostock') {
    const { ROSTOCK_LED_SUPPLIERS } = require('@/lib/led-rostock-supplier-data') as {
      ROSTOCK_LED_SUPPLIERS: Array<{ id: string; name: string }>
    }
    return ROSTOCK_LED_SUPPLIERS.map((s) => ({ id: s.id, name: s.name }))
  }
  return SOLAR_SUPPLIERS
}
