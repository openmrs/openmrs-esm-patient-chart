import {
  defineConfigSchema,
  fhirBaseUrl,
  getAsyncLifecycle,
  getSyncLifecycle,
  messageOmrsServiceWorker,
} from '@openmrs/esm-framework';
import { createDashboardLink } from '@openmrs/esm-patient-common-lib';
import { configSchema } from './config-schema';
import { dashboardMeta } from './dashboard.meta';

const moduleName = '@openmrs/esm-patient-allergies-app';

const options = {
  featureName: 'patient-allergies',
  moduleName,
};

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

export function startupApp() {
  messageOmrsServiceWorker({
    type: 'registerDynamicRoute',
    pattern: '.+/ws/rest/v1/concept.+',
  });

  messageOmrsServiceWorker({
    type: 'registerDynamicRoute',
    pattern: '.+/ws/rest/v1/patient/.+/allergy.+',
  });

  messageOmrsServiceWorker({
    type: 'registerDynamicRoute',
    pattern: `.+${fhirBaseUrl}/AllergyIntolerance.+`,
  });

  defineConfigSchema(moduleName, configSchema);
}

export const allergiesDetailedSummary = getAsyncLifecycle(
  () => import('./allergies/allergies-detailed-summary.component'),
  options,
);

// t('Allergies', 'Allergies')
export const allergiesDashboardLink = getSyncLifecycle(
  createDashboardLink({
    ...dashboardMeta,
    moduleName,
  }),
  options,
);

export const allergiesForm = getAsyncLifecycle(
  () => import('./allergies/allergies-form/allergy-form.component'),
  options,
);

export const allergyTile = getAsyncLifecycle(() => import('./allergies/allergies-tile.component'), options);
