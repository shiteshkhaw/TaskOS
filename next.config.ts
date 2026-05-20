import type { NextConfig } from "next";

const nextConfig: NextConfig = {

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
      },
    ],
  },

  // Disable ESLint during build (run separately)
  eslint: {
    ignoreDuringBuilds: true,
  },

  // TypeScript strict mode (enable after fixing type errors)
  typescript: {
    ignoreBuildErrors: false,
  },

  // Experimental features
  experimental: {
    // Server Actions are stable in Next.js 15
  },
};

export default nextConfig;
