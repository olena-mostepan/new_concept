export type VerificationStatus = 'verified' | 'pending' | 'unverified' | 'empty'

export type ProfileField<T = string> = {
  value: T
  status: VerificationStatus
  /** Suggested value from document extraction — shown in review flow */
  suggestedValue?: T
  sourceDocument?: string
}

export type CoverageMarket = {
  code: string
  name: string
  flag: string
}

export type CoverageEntry = {
  id: string
  category: string
  services: string[]
  markets: CoverageMarket[]
  notes: string
}

export type ProfileDocument = {
  id: string
  filename: string
  type: 'pdf' | 'image' | 'other'
  uploadedAt: string
  extracted: boolean
}

export type SupplierProfileData = {
  companyName: ProfileField
  regNumber: ProfileField
  website: ProfileField
  address: ProfileField
  logoUrl: ProfileField<string | null>
  directorName: ProfileField
  directorTitle: ProfileField
  directorPhotoUrl: ProfileField<string | null>
  professionalIndemnity: ProfileField
  teamSize: ProfileField
  founded: ProfileField
  turnover: ProfileField
  coverageEntries: ProfileField<CoverageEntry[]>
  subcontractors: ProfileField
  projectSizes: ProfileField
  solutionTypes: ProfileField<string[]>
  qualifications: ProfileField<string[]>
  caseStudies: ProfileField<string[]>
  documents: ProfileDocument[]
  /**
   * When true, Overview shows the compliance review banner.
   * Set on tender submission; cleared when the supplier edits compliance
   * fields or confirms details are still accurate. Not calendar-driven.
   */
  complianceNeedsReview?: boolean
}

export type ProfileSection = 'overview' | 'financial' | 'competency'

export type SectionScore = {
  section: ProfileSection
  label: string
  score: number
  maxScore: number
  percent: number
}

export type ProfileScore = {
  overall: number
  sections: SectionScore[]
  verifiedCount: number
  pendingCount: number
  totalFields: number
}

export type PendingChange = {
  id: string
  fieldKey: keyof SupplierProfileData
  label: string
  section: ProfileSection
  currentValue: string
  suggestedValue: string
  sourceDocument: string
}
