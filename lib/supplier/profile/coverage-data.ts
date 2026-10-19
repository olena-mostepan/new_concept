import type { CoverageMarket } from './types'

export const COVERAGE_CATEGORIES = [
  'Solar PV',
  'EV Charging',
  'LED',
  'HVAC',
  'Battery storage',
] as const

export const COVERAGE_SERVICES = [
  'Outline design',
  'Specification',
  'Install',
  'Aftercare',
] as const

export const COVERAGE_MARKETS: CoverageMarket[] = [
  { code: 'AD', name: 'Andorra', flag: '🇦🇩' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'UK', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹' },
]

export function findMarket(code: string): CoverageMarket | undefined {
  return COVERAGE_MARKETS.find((m) => m.code === code)
}
