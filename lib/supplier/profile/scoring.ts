import type {
  ProfileField,
  ProfileScore,
  ProfileSection,
  SectionScore,
  SupplierProfileData,
} from './types'

const SECTION_WEIGHTS: Record<ProfileSection, number> = {
  overview: 0.33,
  financial: 0.33,
  competency: 0.34,
}

const SECTION_FIELDS: Record<
  ProfileSection,
  { label: string; keys: (keyof SupplierProfileData)[] }
> = {
  overview: {
    label: 'General info',
    keys: [
      'companyName',
      'regNumber',
      'website',
      'address',
      'logoUrl',
      'directorName',
      'directorTitle',
      'directorPhotoUrl',
    ],
  },
  financial: {
    label: 'Financial info',
    keys: [
      'professionalIndemnity',
      'teamSize',
      'founded',
      'turnover',
      'coverageEntries',
      'subcontractors',
      'projectSizes',
    ],
  },
  competency: {
    label: 'Competency',
    keys: ['solutionTypes', 'qualifications', 'caseStudies'],
  },
}

export function isFieldFilled(field: ProfileField<unknown>): boolean {
  if (Array.isArray(field.value)) return field.value.length > 0
  if (field.value === null || field.value === undefined) return false
  return String(field.value).trim() !== ''
}

function scoreSection(profile: SupplierProfileData, section: ProfileSection): SectionScore {
  const config = SECTION_FIELDS[section]
  const keys = config.keys
  let filledCount = 0

  for (const key of keys) {
    const field = profile[key]
    if (!field || typeof field !== 'object' || !('status' in field)) continue
    if (isFieldFilled(field as ProfileField)) filledCount++
  }

  const maxScore = keys.length
  const percent = maxScore > 0 ? Math.round((filledCount / maxScore) * 100) : 0

  return {
    section,
    label: config.label,
    score: filledCount,
    maxScore,
    percent,
  }
}

export function computeProfileScore(profile: SupplierProfileData): ProfileScore {
  const sections = (Object.keys(SECTION_FIELDS) as ProfileSection[]).map((s) =>
    scoreSection(profile, s),
  )

  const overall = Math.round(
    sections.reduce((sum, s) => sum + s.percent * SECTION_WEIGHTS[s.section], 0),
  )

  let verifiedCount = 0
  let pendingCount = 0
  let totalFields = 0

  for (const config of Object.values(SECTION_FIELDS)) {
    for (const key of config.keys) {
      const field = profile[key]
      if (!field || typeof field !== 'object' || !('status' in field)) continue
      totalFields++
      const f = field as ProfileField
      if (f.status === 'verified') verifiedCount++
      if (f.status === 'pending') pendingCount++
    }
  }

  return {
    overall,
    sections,
    verifiedCount,
    pendingCount,
    totalFields,
  }
}

export function scoreLabel(score: number): { label: string; subtitle: string } {
  if (score >= 76) {
    return {
      label: 'Complete',
      subtitle: 'Buyers have everything they need to shortlist you.',
    }
  }
  if (score >= 51) {
    return {
      label: 'Nearly there',
      subtitle: 'A few details away from appearing on more shortlists.',
    }
  }
  if (score >= 26) {
    return {
      label: 'Getting there',
      subtitle: 'Fill the gaps to stop losing close decisions.',
    }
  }
  return {
    label: 'Incomplete',
    subtitle: "Buyers can't shortlist you yet.",
  }
}

export { SECTION_FIELDS, SECTION_WEIGHTS }
