/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // Enable standalone output for Docker
  productionBrowserSourceMaps: false, // Disable in production for better performance
  transpilePackages: [
    '@aibos/ledger-sdk',
    '@aibos/auth-sdk',
    '@aibos/database'
  ],
  images: {
    domains: ['localhost', 'supabase.co'],
  },
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  webpack: (config) => {
    // Prevent webpack chunk hash conflicts
    config.optimization.splitChunks = false;
    
    // Alternative: More conservative chunk splitting
    // config.optimization.splitChunks = {
    //   chunks: 'all',
    //   maxSize: 244 * 1024, // 244KB chunk size limit
    //   cacheGroups: {
    //     default: false,
    //     vendors: false,
    //   }
    // };
    
    return config;
  }
}

module.exports = nextConfig 