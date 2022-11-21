import { defineConfigSchema, defineExtensionConfigSchema, getAsyncLifecycle } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';

declare var __VERSION__: string;
// __VERSION__ is replaced by Webpack with the version from package.json
const version = __VERSION__;

const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

const backendDependencies = {
  fhir2: '^1.2.0',
};

function setupOpenMRS() {
  const moduleName = '@openmrs/esm-generic-patient-widgets-app';

  const options = {
    featureName: 'Generic widgets',
    moduleName,
  };

  defineExtensionConfigSchema(moduleName, configSchema);

  return {
    extensions: [
      {
        name: 'obs-by-encounter-widget',
        load: getAsyncLifecycle(() => import('./obs-switchable/obs-switchable.component'), options),
        meta: {
          columnSpan: 4,
        },
      },
    ],
  };
}

export { backendDependencies, importTranslation, setupOpenMRS, version };
