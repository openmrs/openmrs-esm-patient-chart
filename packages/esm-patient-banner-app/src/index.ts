import { defineConfigSchema, getAsyncLifecycle, messageOmrsServiceWorker } from '@openmrs/esm-framework';

const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

const backendDependencies = {
  'webservices.rest': '^2.2.0',
};

const frontendDependencies = {
  '@openmrs/esm-framework': process.env.FRAMEWORK_VERSION,
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

  defineConfigSchema(moduleName, {});

  return {
    extensions: [
      {
        id: 'patient-banner',
        slot: 'patient-header-slot',
        load: getAsyncLifecycle(() => import('./banner/patient-banner.component'), options),
        online: true,
        offline: true,
      },
      {
        id: 'patient-active-visit-tag',
        slot: 'patient-banner-tags-slot',
        load: getAsyncLifecycle(() => import('./banner-tags/active-visit-tag.component'), options),
        online: true,
        offline: true,
      },
      {
        id: 'deceased-tag',
        slot: 'patient-banner-tags-slot',
        load: getAsyncLifecycle(() => import('./banner-tags/deceased-tag.component'), options),

        online: true,
        offline: true,
      },
    ],
  };
}

export { backendDependencies, frontendDependencies, importTranslation, setupOpenMRS };
