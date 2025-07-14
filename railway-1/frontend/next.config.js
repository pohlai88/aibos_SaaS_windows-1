const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.alias['@shared'] = path.join(__dirname, '../../shared');
    return config;
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  },
  images: {
    domains: ['localhost'],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/api/:path*`,
      },
    ];
  },
  // Ensure TypeScript is properly configured
  typescript: {
    ignoreBuildErrors: false,
  },
  // Ensure ESLint is properly configured
  eslint: {
    ignoreDuringBuilds: false,
  },
};

module.exports = nextConfig; 