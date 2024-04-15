import {
  defineConfigSchema,
  fhirBaseUrl,
  getAsyncLifecycle,
  getSyncLifecycle,
  messageOmrsServiceWorker,
  restBaseUrl,
  translateFrom,
} from '@openmrs/esm-framework';
import { createDashboardLink, registerWorkspace } from '@openmrs/esm-patient-common-lib';
import { configSchema } from './config-schema';
import { dashboardMeta } from './dashboard.meta';
import allergiesDetailedSummaryComponent from './allergies/allergies-detailed-summary.component';
import allergyTileComponent from './allergies/allergies-tile.component';

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
    moduleName,
  }),
  options,
);

// t('recordNewAllergy', "Record a new allergy")
registerWorkspace({
  name: 'patient-allergy-form-workspace',
  title: translateFrom(moduleName, 'recordNewAllergy', 'Record a new allergy'),
  load: getAsyncLifecycle(() => import('./allergies/allergies-form/allergy-form.component'), options),
  type: 'form',
});

export const allergyTile = getSyncLifecycle(allergyTileComponent, options);

export const allergyDeleteConfirmationDialog = getAsyncLifecycle(
  () => import('./allergies/delete-allergy-modal.component'),
  options,
);
