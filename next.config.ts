import type { NextConfig } from "next";
import withPWA from "next-pwa";

const pwaConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
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
  turbopack: {},
};

export default pwaConfig(nextConfig);
