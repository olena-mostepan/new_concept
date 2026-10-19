import { isFieldFilled } from './scoring'
import type { SupplierProfileData } from './types'

export type ProfileNudgeItem = {
  id: string
  label: string
  subtitle?: string
  href: string
  ctaLabel: string
  priority: 'high' | 'normal'
}

export const PROFILE_NUDGE_ITEMS: ProfileNudgeItem[] = [
  {
    id: 'services',
    label: 'No solution categories or services added',
    subtitle: 'Without this you won\'t be matched to any projects',
    href: '/profile/competency',
    ctaLabel: 'Add services',
    priority: 'high',
  },
  {
    id: 'insurance',
    label: 'No professional indemnity insurance on record',
    subtitle: 'Required for most tenders',
    href: '/profile/business-info',
    ctaLabel: 'Add insurance',
    priority: 'high',
  },
  {
    id: 'project-size',
    label: 'Ideal project size not set',
    href: '/profile/business-info',
    ctaLabel: 'Set now',
    priority: 'normal',
  },
  {
    id: 'qualifications',
    label: 'No qualifications added',
    href: '/profile/competency',
    ctaLabel: 'Add',
    priority: 'normal',
  },
  {
    id: 'case-studies',
    label: 'No case studies added',
    href: '/profile/competency',
    ctaLabel: 'Add',
    priority: 'normal',
  },
]

function isNudgeItemIncomplete(profile: SupplierProfileData, item: ProfileNudgeItem): boolean {
  switch (item.id) {
    case 'services':
      return !isFieldFilled(profile.solutionTypes)
    case 'insurance':
      return !isFieldFilled(profile.professionalIndemnity)
    case 'project-size':
      return !isFieldFilled(profile.projectSizes)
    case 'qualifications':
      return !isFieldFilled(profile.qualifications)
    case 'case-studies':
      return !isFieldFilled(profile.caseStudies)
    default:
      return true
  }
}

export function getIncompleteProfileNudgeItems(profile: SupplierProfileData): ProfileNudgeItem[] {
  return PROFILE_NUDGE_ITEMS.filter((item) => isNudgeItemIncomplete(profile, item))
}
