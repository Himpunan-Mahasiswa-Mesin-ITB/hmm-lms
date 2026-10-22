import { withPayload } from '@payloadcms/next/withPayload';
import { createMDX } from 'fumadocs-mdx/next';
import type { NextConfig } from 'next';

import { env } from '~/env';
const isDev = env.NODE_ENV === 'development';
const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['fumadocs-ui'],
  images: {
    remotePatterns: [
      ...[process.env.NEXT_PUBLIC_APP_URL /* 'https://example.com' */].map((item) => {
        const url = new URL(item);

        return {
          hostname: url.hostname,
          protocol: url.protocol.replace(':', '') as 'http' | 'https',
        };
      }),
      {
        protocol: 'https',
        hostname: 'hmm-lms.sgp1.digitaloceanspaces.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'hmm-lms.sgp1.cdn.digitaloceanspaces.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        port: '',
        pathname: '/**',
      },
    ],
    localPatterns: [
      {
        pathname: '/**',
      },
    ],
    unoptimized: isDev,
    qualities: [100],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '1024mb',
    },
    useTypeScriptCli: true,
  },
};

const withMDX = createMDX();

// Note: vinext will partially support this config
export default withPayload(withMDX(nextConfig));
