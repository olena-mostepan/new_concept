import { SECTION_FIELDS } from './scoring'
import type { ProfileField, ProfileSection, SupplierProfileData } from './types'

export const FIELD_LABELS: Partial<Record<keyof SupplierProfileData, string>> = {
  companyName: 'Company name',
  regNumber: 'Reg. number',
  website: 'Website',
  address: 'Address',
  logoUrl: 'Logo',
  directorName: 'Director name',
  directorTitle: 'Director title',
  directorPhotoUrl: 'Director photo',
  professionalIndemnity: 'Professional indemnity',
  teamSize: 'Team size',
  founded: 'Founded',
  turnover: 'Turnover',
  coverageEntries: 'Coverage',
  subcontractors: 'Subcontractors',
  projectSizes: 'Project sizes',
  solutionTypes: 'Solution types',
  qualifications: 'Qualifications',
  caseStudies: 'Case studies',
}

export type VerificationFieldItem = {
  key: keyof SupplierProfileData
  label: string
  section: ProfileSection
  sectionLabel: string
  value: string
  isEmpty: boolean
}

export function isFieldEmpty(field: ProfileField<unknown>): boolean {
  if (Array.isArray(field.value)) return field.value.length === 0
  if (field.value === null || field.value === undefined) return true
  return String(field.value).trim() === ''
}

export function formatFieldValue(field: ProfileField<unknown>): string {
  if (isFieldEmpty(field)) return ''
  if (Array.isArray(field.value)) return field.value.join(', ')
  return String(field.value)
}

export function getVerificationFields(profile: SupplierProfileData): VerificationFieldItem[] {
  const items: VerificationFieldItem[] = []

  for (const [section, config] of Object.entries(SECTION_FIELDS) as [
    ProfileSection,
    (typeof SECTION_FIELDS)[ProfileSection],
  ][]) {
    for (const key of config.keys) {
      const field = profile[key]
      if (!field || typeof field !== 'object' || !('status' in field)) continue
      const profileField = field as ProfileField
      items.push({
        key,
        label: FIELD_LABELS[key] ?? key,
        section,
        sectionLabel: config.label,
        value: formatFieldValue(profileField),
        isEmpty: isFieldEmpty(profileField),
      })
    }
  }

  return items
}

export function countEmptyVerificationFields(profile: SupplierProfileData): number {
  return getVerificationFields(profile).filter((f) => f.isEmpty).length
}

export function groupVerificationFields(items: VerificationFieldItem[]) {
  const groups: { section: ProfileSection; label: string; fields: VerificationFieldItem[] }[] = []

  for (const item of items) {
    const existing = groups.find((g) => g.section === item.section)
    if (existing) {
      existing.fields.push(item)
    } else {
      groups.push({ section: item.section, label: item.sectionLabel, fields: [item] })
    }
  }

  return groups
}
