import Link from 'next/link'
import { Home } from 'lucide-react'
import { cn } from '@/lib/utils'

export function BackToHomeButton({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn('btn-secondary-sm gap-1.5', className)}>
      <Home className="h-4 w-4 shrink-0" aria-hidden />
      Home
    </Link>
  )
}
