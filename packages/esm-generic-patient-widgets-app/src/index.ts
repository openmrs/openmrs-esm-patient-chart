import { defineConfigSchema, getAsyncLifecycle } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';

const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

const backendDependencies = {
  fhir2: '^1.2.0',
};

const frontendDependencies = {
  '@openmrs/esm-framework': process.env.FRAMEWORK_VERSION,
};

function setupOpenMRS() {
  const moduleName = '@openmrs/esm-generic-patient-widgets-app';

  const options = {
    featureName: 'Generic widgets',
    moduleName,
  };

  defineConfigSchema(moduleName, configSchema);

  return {
    extensions: [
      {
        id: 'obs-by-encounter-widget',
        slot: 'patient-chart-conditions-dashboard-slot',
        load: getAsyncLifecycle(() => import('./obs-switchable/obs-switchable.component'), options),
        meta: {
          columnSpan: 4,
        }
      }
    ],
  };
}

export { backendDependencies, frontendDependencies, importTranslation, setupOpenMRS };
