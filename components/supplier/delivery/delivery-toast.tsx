'use client'

import { toast } from 'sonner'
import { formatGbp } from '@/lib/supplier/delivery/mock-data'

/** Shared success snackbar after any delivery claim confirm. */
export function showDeliverySuccessToast(amount: number) {
  toast.success(`Confirmed — paid · ${formatGbp(amount)}`, {
    description: "customer's delivery view + your cash-flow updated",
    duration: 6000,
    action: {
      label: 'Raise now',
      onClick: () => toast.message('Raise flow opens here in production'),
    },
  })
}
