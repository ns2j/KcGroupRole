import type { NextConfig } from "next";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

const nextConfig: NextConfig = {
  basePath,
  async rewrites() {
    return [
      {
        source: '/api/node/:path*',
        destination: `${process.env.INTERNAL_BFF_URL || process.env.NEXT_PUBLIC_BFF_URL || ''}/:path*`,
      },
    ]
  },
};

export default nextConfig;
