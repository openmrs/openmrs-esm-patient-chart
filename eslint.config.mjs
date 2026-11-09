import openmrs from '@openmrs/eslint-config';

export default [
  {
    ignores: [
      '**/dist/**',
      '.yarn/**',
      '__mocks__/**',
      // The Angular workspace keeps its own ESLint config and runs through `ng lint`.
      'packages/esm-form-entry-app/**',
    ],
  },
  ...openmrs,
  {
    rules: {
      // Rules this repo enforces that the shared config leaves off. The two
      // ban-types successors come from typescript-eslint's recommended preset,
      // which this repo was picking up before the migration.
      '@typescript-eslint/no-empty-object-type': ['error', { allowInterfaces: 'always', allowObjectTypes: 'always' }],
      '@typescript-eslint/no-unsafe-function-type': 'error',
      '@typescript-eslint/no-wrapper-object-types': 'error',
      '@typescript-eslint/triple-slash-reference': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
  {
    files: ['packages/esm-patient-procedures-app/**'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
  {
    // Playwright fixtures take a callback named `use` and call it to supply the
    // fixture value. eslint-plugin-react-hooks reads that as React's `use` hook
    // and reports it as a hook called outside a component.
    files: ['e2e/**'],
    rules: {
      'react-hooks/rules-of-hooks': 'off',
    },
  },
];
