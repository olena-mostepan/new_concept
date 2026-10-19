import type { PendingChange, SupplierProfileData } from './types'
/** Initial profile — no uploads yet, no pending extracted changes. */
export const BEKA_SOLAR_PROFILE: SupplierProfileData = {
  companyName: { value: 'Beka Solar Energie GmbH', status: 'verified' },
  regNumber: { value: '', status: 'empty' },
  website: { value: 'https://beka-solar-energie.de/', status: 'verified' },
  address: { value: 'Eichhorstweg 1 - 3, Nauen, 14641, DE', status: 'verified' },
  logoUrl: { value: null, status: 'empty' },
  directorName: { value: '', status: 'empty' },
  directorTitle: { value: '', status: 'empty' },
  directorPhotoUrl: { value: null, status: 'empty' },
  professionalIndemnity: { value: '', status: 'empty' },
  teamSize: { value: '110', status: 'verified' },
  founded: { value: '2023', status: 'verified' },
  turnover: { value: '', status: 'empty' },
  coverageEntries: {
    value: [
      {
        id: 'cov-solar-pv',
        category: 'Solar PV',
        services: ['Outline design', 'Specification', 'Install'],
        markets: [
          { code: 'AD', name: 'Andorra', flag: '🇦🇩' },
          { code: 'ES', name: 'Spain', flag: '🇪🇸' },
        ],
        notes: "we'll serve Andorra starting Q3 2026",
      },
    ],
    status: 'verified',
  },
  subcontractors: {
    value:
      'Internal: Focuses on "single source" HVAC and PV delivery using internal skilled teams.',
    status: 'verified',
  },
  projectSizes: { value: '', status: 'empty' },
  solutionTypes: { value: [], status: 'empty' },
  qualifications: { value: [], status: 'empty' },
  caseStudies: { value: [], status: 'empty' },
  documents: [],
  /** Seeded true for prototype — simulates a prior tender submission. */
  complianceNeedsReview: true,
}

const EMPTY_COVERAGE_ENTRIES = { value: [] as const, status: 'empty' as const }

/** Ensures newer profile fields exist (e.g. after schema changes). */
export function normalizeSupplierProfile(profile: SupplierProfileData): SupplierProfileData {
  if (profile.coverageEntries) return profile
  return {
    ...profile,
    coverageEntries: { ...EMPTY_COVERAGE_ENTRIES, value: [] },
  }
}

/** Simulate reading uploaded files and generating suggested profile updates. */
export function applyExtractedChanges(
  profile: SupplierProfileData,
  sourceDocument: string,
): SupplierProfileData {
  const next = { ...profile }

  if (next.directorName.status !== 'verified') {
    next.directorName = {
      value: next.directorName.value,
      status: 'pending',
      suggestedValue: 'Michael Becker',
      sourceDocument,
    }
  }
  if (next.directorTitle.status !== 'verified') {
    next.directorTitle = {
      value: next.directorTitle.value,
      status: 'pending',
      suggestedValue: 'Managing Director',
      sourceDocument,
    }
  }
  if (next.turnover.status !== 'verified') {
    next.turnover = {
      value: next.turnover.value,
      status: 'pending',
      suggestedValue: '€12.4M',
      sourceDocument,
    }
  }

  return next
}

export function getPendingChanges(profile: SupplierProfileData): PendingChange[] {
  const changes: PendingChange[] = []

  const check = (
    key: keyof SupplierProfileData,
    label: string,
    section: PendingChange['section'],
    field: SupplierProfileData[typeof key],
  ) => {
    if (
      field &&
      typeof field === 'object' &&
      'status' in field &&
      field.status === 'pending' &&
      field.suggestedValue !== undefined
    ) {
      const current =
        Array.isArray(field.value)
          ? field.value.join(', ')
          : String(field.value ?? '')
      const suggested = Array.isArray(field.suggestedValue)
        ? field.suggestedValue.join(', ')
        : String(field.suggestedValue ?? '')
      if (current !== suggested || !current) {
        changes.push({
          id: key,
          fieldKey: key,
          label,
          section,
          currentValue: current || '—',
          suggestedValue: suggested,
          sourceDocument: field.sourceDocument ?? 'Uploaded document',
        })
      }
    }
  }

  check('directorName', 'Director Name', 'overview', profile.directorName)
  check('directorTitle', 'Director Title', 'overview', profile.directorTitle)
  check('teamSize', 'Team Size', 'financial', profile.teamSize)
  check('turnover', 'Turnover', 'financial', profile.turnover)

  return changes
}
