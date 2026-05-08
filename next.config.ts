import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',   // Important for Cloud Run / Docker

  images: {
    remotePatterns: [
      {
        hostname: "**",
      },
    ],
  },

  // Correct way in recent Next.js versions
  outputFileTracingExcludes: {
    '**/*': [
      '**/AppData/Local/Application Data/**',
      '**/node_modules/.prisma/client/**',
    ],
  },
};

export default nextConfig;