import type { SupplierProfileData } from './types'

export type ProfileFieldChange = {
  id: string
  fieldKey?: keyof SupplierProfileData
  label: string
  currentValue: string
  suggestedValue: string
  sourceDocument: string
}

export type CaseStudySuggestion = {
  id: string
  sourceDocument: string
  fields: { label: string; value: string }[]
}

export type ReviewSession = {
  analysedDocuments: string[]
  fieldChanges: ProfileFieldChange[]
  caseStudies: CaseStudySuggestion[]
}

const SOURCE_DOC = 'HHT_Group_Ltd_Supplier_Profile.pdf'

function companyFieldChanges(): ProfileFieldChange[] {
  return [
    {
      id: 'legal-name',
      fieldKey: 'companyName',
      label: 'Legal company name as registered.',
      currentValue: 'Beka Solar Energie GmbH',
      suggestedValue: 'HHT Group Ltd',
      sourceDocument: SOURCE_DOC,
    },
    {
      id: 'reg-number',
      fieldKey: 'regNumber',
      label: 'Companies House registration number (UK) or equivalent for non-UK companies.',
      currentValue: '12453761',
      suggestedValue: '06101152',
      sourceDocument: SOURCE_DOC,
    },
    {
      id: 'incorporated',
      fieldKey: 'founded',
      label: 'Date the company was incorporated or equivalent for non-UK companies.',
      currentValue: '27 February 2019',
      suggestedValue: '12 June 1989',
      sourceDocument: SOURCE_DOC,
    },
    {
      id: 'director-name',
      fieldKey: 'directorName',
      label: 'Director name',
      currentValue: '—',
      suggestedValue: 'Michael Becker',
      sourceDocument: SOURCE_DOC,
    },
    {
      id: 'director-title',
      fieldKey: 'directorTitle',
      label: 'Director title',
      currentValue: '—',
      suggestedValue: 'Managing Director',
      sourceDocument: SOURCE_DOC,
    },
    {
      id: 'turnover',
      fieldKey: 'turnover',
      label: 'Annual turnover',
      currentValue: '—',
      suggestedValue: '€12.4M',
      sourceDocument: SOURCE_DOC,
    },
    {
      id: 'team-size',
      fieldKey: 'teamSize',
      label: 'Number of employees',
      currentValue: '110',
      suggestedValue: '1938',
      sourceDocument: SOURCE_DOC,
    },
  ]
}

function caseStudySuggestions(): CaseStudySuggestion[] {
  return [
    {
      id: 'cs-1',
      sourceDocument: SOURCE_DOC,
      fields: [
        { label: 'Organisation', value: 'Barnsley Metropolitan Borough Council' },
        {
          label: 'Building',
          value: 'Lundwood and Athersley estates — 1,200 residential properties',
        },
        { label: 'Project value', value: '4200000' },
        {
          label: 'Scope of work',
          value:
            'Full LED retrofit across communal areas and external lighting, including design, supply, and installation.',
        },
        {
          label: 'Impact',
          value: '42% reduction in lighting energy consumption; payback within 4.2 years.',
        },
      ],
    },
    {
      id: 'cs-2',
      sourceDocument: SOURCE_DOC,
      fields: [
        { label: 'Organisation', value: 'University of Manchester' },
        { label: 'Building', value: 'Simon Building — faculty offices and lecture theatres' },
        { label: 'Project value', value: '1850000' },
        {
          label: 'Scope of work',
          value: 'Replacement of legacy fluorescent fittings with smart LED systems.',
        },
        {
          label: 'Impact',
          value: 'Annual savings of £186k; improved lux levels in teaching spaces.',
        },
      ],
    },
    {
      id: 'cs-3',
      sourceDocument: SOURCE_DOC,
      fields: [
        { label: 'Organisation', value: 'NHS Trust — South London' },
        { label: 'Building', value: 'St. James Wing — hospital corridor and ward lighting' },
        { label: 'Project value', value: '920000' },
        {
          label: 'Scope of work',
          value: 'Night-safe dimming profiles and emergency lighting compliance upgrade.',
        },
        {
          label: 'Impact',
          value: 'Met HTM 06-01 standards; 38% energy reduction across monitored wards.',
        },
      ],
    },
    {
      id: 'cs-4',
      sourceDocument: SOURCE_DOC,
      fields: [
        { label: 'Organisation', value: 'Lidl GB' },
        { label: 'Building', value: 'Regional distribution centre — Leeds' },
        { label: 'Project value', value: '670000' },
        {
          label: 'Scope of work',
          value: 'High-bay LED upgrade with occupancy-based controls across 18,000 m².',
        },
        {
          label: 'Impact',
          value: 'ROI achieved in 3.1 years; carbon reporting aligned with Scope 2 targets.',
        },
      ],
    },
  ]
}

export function buildReviewSession(
  profile: SupplierProfileData,
  uploadedFilename?: string,
): ReviewSession {
  const docs = profile.documents.filter((d) => d.extracted).map((d) => d.filename)
  const analysedDocuments =
    docs.length > 0
      ? docs
      : uploadedFilename
        ? [uploadedFilename]
        : [SOURCE_DOC]

  const fieldChanges = companyFieldChanges().map((change) => {
    if (!change.fieldKey) return change
    const field = profile[change.fieldKey]
    if (field && typeof field === 'object' && 'value' in field) {
      const val = Array.isArray(field.value)
        ? field.value.join(', ')
        : String(field.value ?? '')
      if (val && val !== '—') {
        return { ...change, currentValue: val || '—' }
      }
    }
    return change
  })

  return {
    analysedDocuments: [...new Set(analysedDocuments)],
    fieldChanges,
    caseStudies: caseStudySuggestions(),
  }
}

export function countReviewItems(session: ReviewSession): number {
  return session.fieldChanges.length + session.caseStudies.length
}
