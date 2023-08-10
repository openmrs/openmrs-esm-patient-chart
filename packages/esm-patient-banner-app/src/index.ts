import { defineConfigSchema, getAsyncLifecycle, messageOmrsServiceWorker } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';

const moduleName = '@openmrs/esm-patient-banner-app';

const options = {
  featureName: 'patient-banner',
  moduleName,
};

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

export function startupApp() {
  messageOmrsServiceWorker({
    type: 'registerDynamicRoute',
    pattern: '.+/ws/rest/v1/relationship.+',
  });

  defineConfigSchema(moduleName, configSchema);
}

export const visitTag = getAsyncLifecycle(() => import('./banner-tags/visit-tag.component'), options);

export const deceasedPatientTag = getAsyncLifecycle(
  () => import('./banner-tags/deceased-patient-tag.component'),
  options,
);

export const patientBanner = getAsyncLifecycle(() => import('./banner/patient-banner.component'), options);

export const patientDetailsTile = getAsyncLifecycle(
  () => import('./patient-details-tile/patient-details-tile.component'),
  {
    featureName: 'patient-details-tile',
    moduleName,
  },
);
