import type { NextConfig } from "next";

const basePathValue = process.env.NEXT_PUBLIC_BASE_PATH;
const basePath = basePathValue === '/' || !basePathValue ? undefined : basePathValue;

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
