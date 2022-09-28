import { defineConfigSchema, getAsyncLifecycle, messageOmrsServiceWorker } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';

declare var __VERSION__: string;
// __VERSION__ is replaced by Webpack with the version from package.json
const version = __VERSION__;

const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

const backendDependencies = {
  'webservices.rest': '^2.2.0',
};

function setupOpenMRS() {
  messageOmrsServiceWorker({
    type: 'registerDynamicRoute',
    pattern: '.+/ws/rest/v1/relationship.+',
  });

  const moduleName = '@openmrs/esm-patient-banner-app';

  const options = {
    featureName: 'patient-banner',
    moduleName,
  };

  defineConfigSchema(moduleName, configSchema);

  return {
    extensions: [
      {
        name: 'patient-banner',
        slot: 'patient-header-slot',
        load: getAsyncLifecycle(() => import('./banner/patient-banner.component'), options),
        online: true,
        offline: true,
      },
      {
        name: 'active-visit-tag',
        slot: 'patient-banner-tags-slot',
        load: getAsyncLifecycle(() => import('./banner-tags/active-visit-tag.component'), options),
        online: true,
        offline: true,
      },
      {
        name: 'deceased-patient-tag',
        slot: 'patient-banner-tags-slot',
        load: getAsyncLifecycle(() => import('./banner-tags/deceased-patient-tag.component'), options),
        online: true,
        offline: true,
      },
    ],
  };
}

export { backendDependencies, importTranslation, setupOpenMRS, version };
