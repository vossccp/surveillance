/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb'
    }
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: []
  }
}

module.exports = nextConfig