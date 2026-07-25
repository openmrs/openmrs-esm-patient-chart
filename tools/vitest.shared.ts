import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

process.env.TZ = 'UTC';

export default defineConfig({
  resolve: {
    alias: [{ find: /^.*\.s?css$/, replacement: 'identity-obj-proxy' }],
  },
  test: {
    environment: 'happy-dom',
    globals: true,
    clearMocks: true,
    testTimeout: 30000,
    setupFiles: [fileURLToPath(new URL('./setup-tests.ts', import.meta.url))],
    exclude: ['**/node_modules/**', '**/e2e/**', '**/dist/**', '**/packages/esm-form-entry-app/**'],
    coverage: {
      provider: 'v8',
      include: ['**/src/**/*.component.tsx'],
      exclude: ['**/node_modules/**', '**/vendor/**', '**/src/**/*.test.*', '**/src/declarations.d.ts', '**/e2e/**'],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
    server: {
      deps: {
        inline: [/@openmrs/],
      },
    },
    fakeTimers: {
      toFake: [
        'setTimeout',
        'clearTimeout',
        'setInterval',
        'clearInterval',
        'setImmediate',
        'clearImmediate',
        'requestAnimationFrame',
        'cancelAnimationFrame',
        'Date',
      ],
    },
    alias: [
      { find: /^@openmrs\/esm-framework$/, replacement: '@openmrs/esm-framework/mock' },
      { find: 'react-i18next', replacement: fileURLToPath(new URL('../__mocks__/react-i18next.js', import.meta.url)) },
      {
        find: /^@carbon\/charts-react$/,
        replacement: fileURLToPath(new URL('../__mocks__/@carbon__charts-react.ts', import.meta.url)),
      },
      { find: /^tools$/, replacement: fileURLToPath(new URL('./index.ts', import.meta.url)) },
      { find: /^tools\/(.*)$/, replacement: fileURLToPath(new URL('./', import.meta.url)) + '$1' },
      { find: /^__mocks__$/, replacement: fileURLToPath(new URL('../__mocks__/index.ts', import.meta.url)) },
      { find: /^__mocks__\/(.*)$/, replacement: fileURLToPath(new URL('../__mocks__/', import.meta.url)) + '$1' },
      { find: /^uuid$/, replacement: fileURLToPath(new URL('../node_modules/uuid/dist/index.js', import.meta.url)) },
    ],
  },
});
