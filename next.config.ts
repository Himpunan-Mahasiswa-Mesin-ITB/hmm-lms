import { withPayload } from '@payloadcms/next/withPayload';
import { withSentryConfig } from '@sentry/nextjs/config';
import { createMDX } from 'fumadocs-mdx/next';
import type { NextConfig } from 'next';

import { env } from '~/env';
const isDev = env.NODE_ENV === 'development';
const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['fumadocs-ui'],
  turbopack: {},
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
// - instrumentation.ts and standard Sentry setup will still work
export default withSentryConfig(withPayload(withMDX(nextConfig)), {
  org: 'himpunan-mahasiswa-mesin-itb',

  project: 'javascript-nextjs',

  authToken: env.SENTRY_AUTH_TOKEN,
  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Uncomment to route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  // tunnelRoute: "/monitoring",
});
