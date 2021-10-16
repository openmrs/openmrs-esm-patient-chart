import { defineConfigSchema, fhirBaseUrl, getAsyncLifecycle, messageOmrsServiceWorker } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';

const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

const backendDependencies = {
  'webservices.rest': '^2.2.0',
  fhir2: '^1.2.0',
};

const frontendDependencies = {
  '@openmrs/esm-framework': process.env.FRAMEWORK_VERSION,
};

function setupOpenMRS() {
  messageOmrsServiceWorker({
    type: 'registerDynamicRoute',
    pattern: `${fhirBaseUrl}/Observation.+`,
  });

  const moduleName = '@openmrs/esm-patient-vitals-app';

  const options = {
    featureName: 'patient-vitals',
    moduleName,
  };

  defineConfigSchema(moduleName, configSchema);

  return {
    extensions: [
      {
        id: 'obs-by-encounter-widget',
        load: getAsyncLifecycle(() => import('./obs-by-encounter/obs-by-encounter.component'), options),
        meta: {
          columnSpan: 4,
        }
      }
    ],
  };
}

export { backendDependencies, frontendDependencies, importTranslation, setupOpenMRS };
