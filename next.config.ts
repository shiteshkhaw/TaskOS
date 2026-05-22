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

  // HTTP Security Headers
  async headers() {
    return [
      {
        // Apply to all routes
        source: '/(.*)',
        headers: [
          {
            // Allow Google OAuth popup to postMessage back to opener.
            // "same-origin" (Next.js default) blocks cross-origin postMessage,
            // which breaks the Google Identity Services button/One Tap flow.
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
