import { SupplierProfileEditor } from '@/components/supplier/profile/SupplierProfileEditor'
import { SupplierProfileChrome } from '@/components/supplier/profile/SupplierProfileChrome'

export default function SupplierProfilePage() {
  return (
    <SupplierProfileChrome>
      <SupplierProfileEditor />
    </SupplierProfileChrome>
  )
}
