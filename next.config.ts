import type { NextConfig } from "next";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const withPWA = require('next-pwa');

// next-pwa v5 types are incomplete — customWorkerDir and fallbacks exist at runtime
const pwaConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  customWorkerDir: 'worker',
  fallbacks: {
    document: '/offline',
  },
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@livekit/components-react',
    '@livekit/components-core',
    '@livekit/components-styles',
    'livekit-client',
  ],
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: '/livekit/:path*',
        destination: 'http://149.102.155.247:7880/:path*',
      },
    ];
  },
  turbopack: {},
};

export default pwaConfig(nextConfig);
