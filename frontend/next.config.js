/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {

    // Handle Node.js modules in browser environment
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
        child_process: false,
        util: false,
        buffer: false,
        events: false,
        querystring: false,
        punycode: false,
        string_decoder: false,
        timers: false,
        tty: false,
        vm: false,
        constants: false,
        domain: false,
        dns: false,
        dgram: false,
        cluster: false,
        module: false,
        process: false,
        inspector: false,
        async_hooks: false,
        http2: false,
        perf_hooks: false,
        repl: false,
        readline: false,
        v8: false,
        worker_threads: false,
        'supports-color': false,
      };
    }

    return config;
  },

  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  },

  images: {
    domains: ['localhost'],
  },

  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`,
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

  // Experimental features for better performance
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
  },

  // Output configuration for deployment
  output: 'standalone',

  // Compression for better performance
  compress: true,

  // Powered by header
  poweredByHeader: false,

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
