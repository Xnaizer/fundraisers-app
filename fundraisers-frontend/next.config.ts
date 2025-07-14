import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'gateway.pinata.cloud',
        port: '',
        pathname: '/ipfs/**',
      },
      {
        protocol: 'https',
        hostname: '*.pinata.cloud',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config: Record<string, unknown>) => {
    const webpackConfig = config as {
      resolve?: {
        fallback?: Record<string, boolean | string>;
      };
    };
    
    if (webpackConfig.resolve) {
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return webpackConfig;
  },
  experimental: {
    esmExternals: true,
  },
};

export default nextConfig;