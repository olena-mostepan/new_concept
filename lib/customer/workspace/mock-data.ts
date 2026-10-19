export type WorkspaceResponsibility = 'your_action' | 'supplier_action'

export const WORKSPACE_STATS = {
  uploadedPlans: 19,
  publishedBriefs: 3,
  activeTenders: 1,
  acceptedContracts: 0,
  completedTenders: 10,
} as const

export type CustomerTenderRow = {
  id: string
  name: string
  address: string
  solution: 'Solar PV' | 'Heat pump'
  stage: string
  responsibility: WorkspaceResponsibility
  group: 'needs_attention' | 'done'
  icon: 'solar' | 'building'
  href?: string
}

export const CUSTOMER_TENDERS: CustomerTenderRow[] = [
  {
    id: 'solar-walter-scott',
    name: 'Solar PV - Walter Scott House',
    address: '11 New Market Road',
    solution: 'Solar PV',
    stage: 'Choosing Supplier',
    responsibility: 'your_action',
    group: 'needs_attention',
    icon: 'solar',
    href: '/customer/projects/solar-walter-scott?tab=supplier-matching',
  },
  {
    id: 'rochdale-11',
    name: '11 Rochdale Road, Manchester',
    address: '11 Rochdale Road',
    solution: 'Heat pump',
    stage: 'Delivery',
    responsibility: 'supplier_action',
    group: 'done',
    icon: 'building',
  },
]

export type CustomerProjectListRow = {
  id: string
  name: string
  location: string
  projectType: string
  delivery: string
  nextStep: string
  responsibility: WorkspaceResponsibility
  status: string
  href?: string
}

export const CUSTOMER_PROJECT_LIST: CustomerProjectListRow[] = [
  {
    id: 'solar-walter-scott',
    name: 'Solar PV - Walter Scott House',
    location: 'Edinburgh',
    projectType: 'Solar PV',
    delivery: 'Tender',
    nextStep: 'Choosing Supplier',
    responsibility: 'your_action',
    status: 'Choosing Supplier',
    href: '/customer/projects/solar-walter-scott?tab=supplier-matching',
  },
  {
    id: 'rochdale-11',
    name: '11 Rochdale Road, Manchester',
    location: 'Manchester',
    projectType: 'Heat pump',
    delivery: 'Delivery',
    nextStep: 'Completed',
    responsibility: 'supplier_action',
    status: 'Delivery',
  },
  {
    id: 'stockport-204',
    name: '204 Stockport Road, Manchester',
    location: 'Manchester',
    projectType: 'Heat pump',
    delivery: 'Delivery',
    nextStep: 'Completed',
    responsibility: 'supplier_action',
    status: 'Delivery',
  },
]
