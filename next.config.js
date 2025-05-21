/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  images: {
    domains: ['images.unsplash.com'],
  },
  webpack: (config) => {
    return {
      ...config,
      externals: [...config.externals, 'argon2'],
    }
  },
}

module.exports = nextConfig
