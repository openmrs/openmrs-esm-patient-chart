const config = require('openmrs/default-webpack-config');
// Temporary fix to resolve webpack issues with imports from the libraries below
config.overrides.resolve = {
  extensions: ['.tsx', '.ts', '.jsx', '.js', '.scss'],
  alias: {
    '@openmrs/esm-framework': '@openmrs/esm-framework/src/internal',
    '@openmrs/esm-form-engine-lib': '@openmrs/esm-form-engine-lib/src/index',
    'lodash.debounce': 'lodash-es/debounce',
    'lodash.findlast': 'lodash-es/findLast',
    'lodash.omit': 'lodash-es/omit',
    'lodash.throttle': 'lodash-es/throttle',
  },
};
module.exports = config;
