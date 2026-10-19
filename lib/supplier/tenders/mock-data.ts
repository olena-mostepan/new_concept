export type TenderBidStatus = 'submitted' | 'not_started'
export type TenderListStatus = 'active' | 'closed' | 'all'

export type SupplierTender = {
  id: string
  name: string
  propertyLabel: string
  deadlineLabel: string
  bidStatus: TenderBidStatus
  listStatus: Exclude<TenderListStatus, 'all'>
  href: string
  icon: 'solar' | 'led' | 'ev' | 'ashp' | 'battery'
}

export const SUPPLIER_TENDERS: SupplierTender[] = [
  {
    id: 'solar-q2',
    name: 'Solar Q2 – Apartments',
    propertyLabel: '1 property',
    deadlineLabel: '7 May 2025',
    bidStatus: 'submitted',
    listStatus: 'active',
    href: '/supplier/projects/322',
    icon: 'solar',
  },
  {
    id: 'led-upgrade',
    name: 'LED Upgrade – Offices',
    propertyLabel: '4 properties',
    deadlineLabel: '12 May 2025',
    bidStatus: 'not_started',
    listStatus: 'active',
    href: '/supplier/projects/322',
    icon: 'led',
  },
  {
    id: 'ev-chargers',
    name: 'EV Chargers – Mixed Use',
    propertyLabel: '2 properties',
    deadlineLabel: '15 May 2025',
    bidStatus: 'submitted',
    listStatus: 'active',
    href: '/supplier/projects/418',
    icon: 'ev',
  },
  {
    id: 'ashp-retrofit',
    name: 'ASHP Retrofit – Retail',
    propertyLabel: '1 property',
    deadlineLabel: '20 May 2025',
    bidStatus: 'not_started',
    listStatus: 'active',
    href: '/supplier/projects/510',
    icon: 'ashp',
  },
  {
    id: 'battery-storage',
    name: 'Battery Storage – Industrial',
    propertyLabel: '3 properties',
    deadlineLabel: '28 May 2025',
    bidStatus: 'submitted',
    listStatus: 'active',
    href: '/supplier/projects/322',
    icon: 'battery',
  },
]
