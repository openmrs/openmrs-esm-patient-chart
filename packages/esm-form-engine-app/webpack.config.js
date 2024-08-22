const path = require('path');
const config = (module.exports = require('openmrs/default-webpack-config'));
config.scriptRuleConfig.exclude = /(node_modules(?![\/\\]@(?:openmrs|ohri)))/;
// Temporary fix to resolve webpack issues with imports from the libraries below
config.overrides.resolve = {
  extensions: ['.tsx', '.ts', '.jsx', '.js', '.scss'],
  alias: {
    '@openmrs/esm-form-engine-lib': '@openmrs/esm-form-engine-lib/src/index',
  },
};
module.exports = config;
