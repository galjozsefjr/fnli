import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  rewrites() {
    /**
     * Needed only for DEV environment; nginx redirects requests automatically to backend
     */
    if (process.env.NODE_ENV === 'production') {
      return [];
    }
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.API_URL}/api/:path*`
      },
      {
        source: '/sanctum/csrf-cookie',
        destination: `${process.env.API_URL}/sanctum/csrf-cookie`
      }
    ];
  },
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined
};

export default nextConfig;
