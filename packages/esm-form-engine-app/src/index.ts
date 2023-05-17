import { defineConfigSchema, getAsyncLifecycle } from '@openmrs/esm-framework';
import { registerWorkspace } from '@openmrs/esm-patient-common-lib';
import { configSchema } from './config-schema';

declare var __VERSION__: string;
// __VERSION__ is replaced by Webpack with the version from package.json
const version = __VERSION__;

const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

const backendDependencies = {
  'webservices.rest': '^2.2.0',
};

function setupOpenMRS() {
  const moduleName = '@openmrs/esm-form-engine-app';

  const options = {
    featureName: 'form-engine',
    moduleName,
  };

  defineConfigSchema(moduleName, configSchema);
  registerWorkspace({
    name: 'patient-form-entry-workspace',
    title: 'Clinical Form',
    load: getAsyncLifecycle(() => import('./form-renderer/form-renderer.component'), options),
  });

  return {
    extensions: [],
  };
}

export { backendDependencies, importTranslation, setupOpenMRS, version };
