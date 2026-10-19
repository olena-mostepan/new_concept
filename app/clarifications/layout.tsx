import type { ReactNode } from 'react'
import ClarificationsSegmentLayout from '@/components/clarifications/ClarificationsSegmentLayout'

export default function ClarificationsRouteLayout({
  children,
}: {
  children: ReactNode
}) {
  return <ClarificationsSegmentLayout>{children}</ClarificationsSegmentLayout>
}
