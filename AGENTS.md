<!-- intent-skills:start -->
## Skill Loading

Before editing files for a substantial task:
- Run `pnpm dlx @tanstack/intent@latest list` from the workspace root to see available local skills.
- If a listed skill matches the task, run `pnpm dlx @tanstack/intent@latest load <package>#<skill>` before changing files.
- Use the loaded `SKILL.md` guidance while making the change.
- Monorepos: when working across packages, run the skill check from the workspace root and prefer the local skill for the package being changed.
- Multiple matches: prefer the most specific local skill for the package or concern you are changing; load additional skills only when the task spans multiple packages or concerns.
<!-- intent-skills:end -->

## Vinext Migration Notes

This project has been migrated to vinext for Node.js deployment. Key changes:

### Dependencies
- Added `vinext`, `react-server-dom-webpack`, `@vitejs/plugin-react`, `@vitejs/plugin-rsc`
- Added `webpack` as devDependency (required by workbox-webpack-plugin for Sentry compatibility)
- Removed `@ducanh2912/next-pwa` (PWA not supported by vinext)

### Configuration
- `next.config.ts`: Cleaned up to remove PWA config; webpack config partially supported by vinext
- `vite.config.ts`: Configured with vinext plugin, prerender routes, and externalized JWT packages for SSR compatibility
- `vitest.config.ts`: Updated to use `import.meta.url` instead of `__dirname`
- `playwright.config.ts`: Updated imports for ES module compatibility

### Compatibility Notes
- **next-auth**: Will continue to work but relies on Next.js API route internals. Consider migrating to better-auth in the future.
- **@sentry/nextjs**: Standard instrumentation.ts setup works; webpack/Turbopack plugin build features (source map upload, auto-instrumentation) don't run with vinext.
- **PWA**: Disabled when using vinext (not supported).
- **webpack config**: vinext only supports resolve.alias, resolve.extensions, and MDX loader settings. Other webpack customization is ignored.
- **JWT packages**: Externalized in vite config SSR (`buffer-equal-constant-time`, `jwa`, `jws`) to avoid runtime errors with vinext.

### Known Warnings (non-blocking)
- Sourcemap warnings for various packages (standardwebhooks, superjson, oauth4webapi) - these don't affect functionality
- Client component optimization warnings for `@tanstack/react-query` and `lucide-react` - already excluded in optimizeDeps

### Scripts
- `npm run dev:vinext` - Start vinext dev server
- `npm run build:vinext` - Build for production with vinext
- `npm run start:vinext` - Start vinext production server
- `npm run dev` - Start Next.js dev server (still works as before)
