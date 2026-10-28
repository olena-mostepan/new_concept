import { redirect } from 'next/navigation'
import { hrefs } from '@/components/concept/hrefs'

export default function WorkstreamsPage() {
  redirect(hrefs.batches)
}
