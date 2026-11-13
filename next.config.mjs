/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow a parallel agent/dev instance without fighting .next/dev/lock
  distDir: process.env.NEXT_DIST_DIR || '.next',
  async redirects() {
    return [
      { source: '/concept/buildings', destination: '/concept/assets', permanent: true },
      { source: '/concept/buildings/:buildingId', destination: '/concept/assets/:buildingId', permanent: true },
      { source: '/concept/workstreams', destination: '/concept/packages', permanent: true },
      { source: '/concept/workstreams/:id', destination: '/concept/packages/:id', permanent: true },
      // Ops is the main prototype at /concept now; old /concept/ops links land on the same page.
      { source: '/concept/ops', destination: '/concept', permanent: false },
      { source: '/concept/ops/:path*', destination: '/concept/:path*', permanent: false },
    ]
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
    ],
  },
}

export default nextConfig
