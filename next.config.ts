import { withSentryConfig } from '@sentry/nextjs/config';
import withPWA from '@ducanh2912/next-pwa';
import { withPayload } from '@payloadcms/next/withPayload';
import { createMDX } from 'fumadocs-mdx/next';
import type { NextConfig } from 'next';
import { env } from '~/env';

const nextConfig: NextConfig = {
  // Next 16 defaults to Turbopack; keep an explicit config
  // so custom webpack settings don't hard-fail `next build`.
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
    qualities: [100],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '1024mb',
    },
    useTypeScriptCli: true,
  },
  // Add webpack configuration to handle Node.js modules
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Exclude Node.js modules from client-side bundle
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        fs: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
      };
    }
    return config;
  },
};

const pwaDevDisabled =
  process.env.NODE_ENV === 'development' && process.env.ENABLE_PWA_IN_DEV !== '1';

const pwaConfig = withPWA({
  dest: 'public',
  disable: pwaDevDisabled,
  register: true,
  customWorkerSrc: 'worker',

  cacheStartUrl: false,
  dynamicStartUrl: false,
  cacheOnFrontEndNav: false,
  aggressiveFrontEndNavCaching: false,

  workboxOptions: {
    // Forces Workbox prod runtime bundle to avoid verbose router debug logs in dev PWA mode.
    mode: 'production',
    skipWaiting: true,
    clientsClaim: true,

    // Exclude problematic files
    exclude: [
      /\.map$/,
      /^manifest.*\.js$/,
      /favicon\.ico$/,
      /workbox-.*\.js$/,
      /worker-.*\.js$/,
      /icon-.*\.png$/,
    ],

    // Don't precache at all - use runtime caching only
    // This completely avoids the 304 issue
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/fonts\.(?:gstatic|googleapis)\.com\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'google-fonts',
          expiration: {
            maxEntries: 10,
            maxAgeSeconds: 60 * 60 * 24 * 365,
          },
        },
      },
      {
        urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'images',
          expiration: {
            maxEntries: 60,
            maxAgeSeconds: 60 * 60 * 24 * 30,
          },
        },
      },
      {
        urlPattern: /\/_next\/static\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'next-static',
          expiration: {
            maxEntries: 64,
            maxAgeSeconds: 60 * 60 * 24 * 365,
          },
        },
      },
      {
        urlPattern: /\.(?:js|css)$/i,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'static-resources',
          expiration: {
            maxEntries: 32,
            maxAgeSeconds: 60 * 60 * 24,
          },
        },
      },
    ],
  },
});

const withMDX = createMDX();

export default withSentryConfig(withPayload(pwaConfig(withMDX(nextConfig))), {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "himpunan-mahasiswa-mesin-itb",

  project: "javascript-nextjs",

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

  webpack: {
    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,

    // Tree-shaking options for reducing bundle size
    treeshake: {
      // Automatically tree-shake Sentry logger statements to reduce bundle size
      removeDebugLogging: true,
    },
  },
});
