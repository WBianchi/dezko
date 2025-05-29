/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com'
      },
      {
        protocol: 'https',
        hostname: 'tmbelc25fhz7zgv5.public.blob.vercel-storage.com'
      },
      {
        protocol: 'https',
        hostname: '**.public.blob.vercel-storage.com'
      }
    ],
  },
  webpack: (config) => {
    return {
      ...config,
      externals: [...config.externals, 'argon2'],
    }
  },
}

module.exports = nextConfig
