import vinext from 'vinext';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [vinext({ prerender: { routes: '*' } })],
  optimizeDeps: {
    exclude: [
      '@tanstack/react-query',
      'lucide-react',
      // exclude JWT-related packages that have compatibility issues with vinext
      'buffer-equal-constant-time',
      'jwa',
      'jws',
    ],
  },
  ssr: {
    // externalize problematic JWT-related packages for SSR
    external: ['buffer-equal-constant-time', 'jwa', 'jws'],
  },
  define: {
    // define polyfills for problematic packages
    global: 'globalThis',
  },
});
