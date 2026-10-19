import type { ReactNode } from 'react'
import { CustomerPortalChrome } from '@/components/customer/CustomerPortalChrome'

export default function CustomerLayout({ children }: { children: ReactNode }) {
  return <CustomerPortalChrome>{children}</CustomerPortalChrome>
}
