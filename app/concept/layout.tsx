import type { ReactNode } from 'react'
import { ConceptChrome } from '@/components/concept/ConceptChrome'

export default function ConceptLayout({ children }: { children: ReactNode }) {
  return <ConceptChrome>{children}</ConceptChrome>
}
