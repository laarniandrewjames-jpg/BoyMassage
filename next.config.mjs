/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true, // Renamed for clarity in Next.js 16+
  },
  images: {
    unoptimized: true,
  },
  // Add this to ensure route handling works correctly on Edge/Render
  output: 'standalone',
  experimental: {
    optimizePackageImports: ['@radix-ui/react-icons', 'react-icons'],
  },
}

export default nextConfig
