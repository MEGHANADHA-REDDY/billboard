/** @type {import('next').NextConfig} */
const nextConfig = {
  // Increase body size limit to 25MB for video uploads
  experimental: {
    serverActions: {
      bodySizeLimit: '25mb',
    },
  },
}

module.exports = nextConfig
