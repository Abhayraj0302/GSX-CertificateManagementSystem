/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    qualities: [80],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  // Ensure react-konva works with Turbopack by treating react as external for konva
  // This prevents duplicate React instances
  serverExternalPackages: ['konva', 'react-konva'],
}

module.exports = nextConfig
