export type Supplier = {
  id: string
  name: string
  logo: string
  price: number
  fields: {
    // Lighting comparison fields
    systemType?: string
    manufacturer?: string
    numberOfLights?: string
    installationCostsIncluded?: string
    replacementType?: string
    labourAndOtherCosts?: string
    materialCosts?: string
    meetsTechnicalRequirements?: string
    meetsTenderRequirements?: string
    controlStrategyMeetsRegulations?: string
    emergencyLightingIncluded?: string

    // Legacy fields kept for other prototypes
    equipmentRemoval?: string
    unitLocation?: string
    electricalWork?: string
    noiseControl?: string
    operatingTemps?: string

    // Rome fields
    romeCompliance?: string
    romeCertification?: string
    romeStandards?: string

    // Allow scenario-specific extensions
    [key: string]: string | undefined
  }
  supplierRelevance?: {
    generalScore: number
    assetType: number
    stakeholderManagement: number
    assetSize: number
    location: number
  }
  categoryScores?: {
    financial: number
    relevance: number
    speed: number
    technical: number
  }
  additionalNotes: string
  keyDifferentiator: string
  documents: Document[]
}

export type Document = {
  name: string
  url: string
}

export type Category = {
  name: string
  fields: CategoryField[]
  expanded: boolean
}

export type CategoryField = {
  label: string
  key: string
  tooltip?: string
  isScore?: boolean
}

export type TenderOverview = {
  invited: number
  submitted: number
  responseRate: number
  details: string[]
  closedDate: string
  duration: string
}

export type TenderScenario = "led" | "solar-pv" | "hvac"

export type ProjectDetails = {
  type?: string
  expectedStartDate?: string
  sizeOfInstallation?: string
  usableRoofArea?: string
  totalEnergyDemand?: string
  [key: string]: string | undefined
}

export type TenderConfig = {
  slug: TenderScenario
  title: string
  description: string
  location: string
  avatar: string
  tags: string[]
  overview: TenderOverview
  projectDetails?: ProjectDetails
  projectPhotos?: string[]
  suppliers: Supplier[]
  categories: Category[]
  fieldExplanations: Record<string, string>
}
