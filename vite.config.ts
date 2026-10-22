import { nitro } from 'nitro/vite';
import vinext from 'vinext';
import { defineConfig } from 'vite';
import vinextPayload from 'vite-plugin-vinext-payload';

export default defineConfig({
  plugins: [nitro(), vinext({ prerender: undefined }), vinextPayload()],
  build: {
    rollupOptions: {
      external: [
        'nanoid',
        'framer-motion',
        'motion',
        // externalize packages with React 18 shim issues
        '@tiptap/react',
        'recharts',
        '@tanstack/react-store',
        // externalize sharp (native module used by Payload CMS)
        'sharp',
      ],
    },
  },
  optimizeDeps: {
    exclude: [
      '@tanstack/react-query',
      'lucide-react',
      // exclude JWT-related packages that have compatibility issues with vinext
      'buffer-equal-constant-time',
      'jwa',
      'jws',
      // exclude Prisma, should not be bundled
      '@prisma/client',
      '@payloadcms',
      // exclude packages with problematic React 18 shims
      '@tiptap/react',
      'recharts',
      '@tanstack/react-store',
      // exclude sharp
      'sharp',
    ],
  },
  ssr: {
    // externalize problematic JWT-related packages for SSR
    external: ['buffer-equal-constant-time', 'jwa', 'jws', '@prisma/client', 'sharp'],
  },
  define: {
    // define polyfills for problematic packages
    global: 'globalThis',
  },
});
