import vinext from 'vinext';
import { defineConfig } from 'vite';
import vinextPayload from 'vite-plugin-vinext-payload';

export default defineConfig({
  plugins: [vinext({ prerender: { routes: '*' } }), vinextPayload()],
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
    ],
  },
  ssr: {
    // externalize problematic JWT-related packages for SSR
    external: ['buffer-equal-constant-time', 'jwa', 'jws', '@prisma/client'],
  },
  define: {
    // define polyfills for problematic packages
    global: 'globalThis',
  },
});
