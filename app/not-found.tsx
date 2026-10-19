import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-6 sm:px-8 lg:px-10">
      <h1 className="text-2xl font-bold text-[#1E2832]">Page not found</h1>
      <p className="text-[#4D5761]">
        The page you&apos;re looking for doesn&apos;t exist or may have moved.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link href="/" className="btn-primary">
          Go to home
        </Link>
        <Link href="/tender/solar-pv" className="btn-secondary">
          Solar project
        </Link>
        <Link href="/supplier-comparison/led" className="btn-secondary">
          LED (Berlin)
        </Link>
        <Link href="/supplier-comparison/led-rostock" className="btn-secondary">
          LED (Rostock)
        </Link>
      </div>
    </div>
  )
}
