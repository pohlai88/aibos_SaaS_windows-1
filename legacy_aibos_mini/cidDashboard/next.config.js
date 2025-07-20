/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    appDir: true,
  },
  transpilePackages: [
    '@aibos/auth-sdk',
    '@aibos/core-types',
    '@aibos/ui-components',
    '@aibos/database'
  ],
  env: {
    AIBOS_MODULE_ID: 'cid-dashboard',
    AIBOS_MODULE_VERSION: '1.0.0'
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*'
      }
    ]
  }
}

export default nextConfig