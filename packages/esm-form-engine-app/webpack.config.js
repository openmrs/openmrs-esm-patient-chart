const path = require('path');
const config = (module.exports = require('openmrs/default-webpack-config'));
config.scriptRuleConfig.exclude =
  path.sep == '/'
    ? /(node_modules[^\/@openmrs\/esm\-patient\-common\-lib])/
    : /(node_modules[^\\@openmrs\/esm\-patient\-common\-lib])/;
// Temporary fix to resolve webpack issues with imports from the libraries below
config.overrides.resolve = {
  extensions: ['.tsx', '.ts', '.jsx', '.js', '.scss'],
  alias: {
    '@openmrs/esm-framework': '@openmrs/esm-framework/src/internal',
    '@ohri/openmrs-esm-ohri-commons-lib': path.resolve(__dirname, '../esm-commons-lib/src/index'),
    '@openmrs/openmrs-form-engine-lib': '@openmrs/openmrs-form-engine-lib/src/index',
  },
};
module.exports = config;
