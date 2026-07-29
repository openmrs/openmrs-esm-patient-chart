import { defineConfig, type Plugin } from 'vite';
import { fileURLToPath } from 'node:url';

const repoRoot = fileURLToPath(new URL('../../', import.meta.url));

/**
 * Component `.scss` imports are CSS modules under the app's rspack build, but Vite only treats
 * `*.module.scss` that way. Rather than fight that, stub every stylesheet imported from inside
 * `packages/` with identity-obj-proxy — `styles.foo` then evaluates to the string `"foo"` — and let
 * `harness/styles.scss` pull the same files in as plain global CSS. This is the same trick
 * `tools/vitest.shared.ts` already uses for the unit tests.
 */
function stubComponentStylesheets(): Plugin {
  return {
    name: 'harness-stub-component-stylesheets',
    enforce: 'pre',
    async resolveId(source, importer) {
      if (!source.endsWith('.scss') || !importer?.includes(`${repoRoot}packages/`)) {
        return null;
      }
      const resolved = await this.resolve('identity-obj-proxy', importer, { skipSelf: true });
      return resolved?.id ?? null;
    },
  };
}

export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  plugins: [stubComponentStylesheets()],
  // identity-obj-proxy is CommonJS and reaches for Node's `global`.
  define: { global: 'globalThis' },
  resolve: {
    alias: [
      {
        find: /^@openmrs\/esm-framework$/,
        replacement: fileURLToPath(new URL('./framework-mock.tsx', import.meta.url)),
      },
      {
        find: /^@openmrs\/esm-patient-common-lib$/,
        replacement: fileURLToPath(new URL('./common-lib-mock.tsx', import.meta.url)),
      },
      {
        find: 'react-i18next',
        replacement: fileURLToPath(new URL('./i18n-mock.ts', import.meta.url)),
      },
    ],
  },
  css: {
    preprocessorOptions: {
      scss: {
        // Lets the feature stylesheets keep using bare package specifiers such as
        // `@use '@openmrs/esm-styleguide/src/vars'`, exactly as the app build does.
        loadPaths: [`${repoRoot}node_modules`],
        silenceDeprecations: ['import', 'global-builtin', 'mixed-decls', 'legacy-js-api'],
      },
    },
  },
  server: {
    fs: { allow: [repoRoot] },
    port: 5199,
    strictPort: true,
  },
  preview: {
    port: 5199,
    strictPort: true,
  },
});
