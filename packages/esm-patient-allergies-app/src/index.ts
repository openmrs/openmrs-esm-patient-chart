import {
  defineConfigSchema,
  fhirBaseUrl,
  getAsyncLifecycle,
  getSyncLifecycle,
  messageOmrsServiceWorker,
  restBaseUrl,
} from '@openmrs/esm-framework';
import { createDashboardLink } from '@openmrs/esm-patient-common-lib';
import { configSchema } from './config-schema';
import { dashboardMeta } from './dashboard.meta';
import allergiesDetailedSummaryComponent from './allergies/allergies-detailed-summary.component';
import allergiesTileExtension from './allergies/allergies-tile.extension';
import allergiesListExtension from './allergies/allergies-list.extension';

const moduleName = '@openmrs/esm-patient-allergies-app';

const options = {
  featureName: 'patient-allergies',
  moduleName,
};

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

export function startupApp() {
  messageOmrsServiceWorker({
    type: 'registerDynamicRoute',
    pattern: `.+${restBaseUrl}/concept.+`,
  });

  messageOmrsServiceWorker({
    type: 'registerDynamicRoute',
    pattern: `.+${restBaseUrl}/patient/.+/allergy.+`,
  });

  messageOmrsServiceWorker({
    type: 'registerDynamicRoute',
    pattern: `.+${fhirBaseUrl}/AllergyIntolerance.+`,
  });

  defineConfigSchema(moduleName, configSchema);
}

export const allergiesDetailedSummary = getSyncLifecycle(allergiesDetailedSummaryComponent, options);

// t('Allergies', 'Allergies')
export const allergiesDashboardLink = getSyncLifecycle(
  createDashboardLink({
    ...dashboardMeta,
  }),
  options,
);

export const allergyFormWorkspace = getAsyncLifecycle(
  () => import('./allergies/allergies-form/allergy-form.workspace'),
  options,
);

export const allergiesTile = getSyncLifecycle(allergiesTileExtension, options);

export const allergiesList = getSyncLifecycle(allergiesListExtension, options);

export const deleteAllergyModal = getAsyncLifecycle(() => import('./allergies/delete-allergy.modal'), options);
