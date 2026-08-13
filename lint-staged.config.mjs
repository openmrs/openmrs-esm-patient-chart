export default {
  'packages/!(esm-form-entry-app)/**/src/**/*.{ts,tsx}': 'eslint --cache --fix --max-warnings 0',
  'packages/esm-form-entry-app/src/**/*.ts': (filenames) =>
    `yarn workspace @openmrs/esm-form-entry-app ng lint --cache --fix --max-warnings 0 ${filenames
      .map((filename) => `--lint-file-patterns ${JSON.stringify(filename)}`)
      .join(' ')}`,
  '*.{css,scss,ts,tsx}': 'prettier --write --list-different',
};
